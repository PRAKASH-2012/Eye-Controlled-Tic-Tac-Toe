import os
import sys
import time
import threading
import cv2
from flask import Flask, render_template, Response, jsonify, request, session as flask_session, redirect, url_for
from src.gaze_tracker import GazeTracker
from src.ai import choose, winner
from src.settings import settings, stats, save, S, T
from src.user_manager import register_user, login_user, get_user, record_match_result, get_leaderboard, clear_all_users

app = Flask(__name__, template_folder='templates', static_folder='static')
app.secret_key = os.environ.get('SECRET_KEY', 'eyetic-cyber-secret-key-3.12-2026')

class GameSession:
    def __init__(self):
        self.lock = threading.Lock()
        self.tracker = None
        self.board = [''] * 9
        self.turn = 'X' # 'X' is player, 'O' is AI
        self.result = None
        self.selected_cell = None
        self.dwell_start = None
        self.dwell_progress = 0.0
        self.last_gaze_point = (0.5, 0.5)
        self.camera_ok = False
        self.face_detected = False
        self.settings = settings()
        self.stats = stats()
        self.latest_jpeg = None
        self.running = True
        self.ai_pending = False
        self.ai_time = 0
        self.active_username = None
        self.last_match_summary = None

        # Start camera thread
        self.thread = threading.Thread(target=self._camera_loop, daemon=True)
        self.thread.start()

    def set_active_user(self, username):
        with self.lock:
            self.active_username = username

    def _camera_loop(self):
        try:
            self.tracker = GazeTracker()
        except Exception as e:
            print(f"Error initializing tracker: {e}", file=sys.stderr)

        while self.running:
            frame = None
            gaze = None
            has_face = False

            if self.tracker:
                try:
                    frame, gaze, has_face = self.tracker.read()
                except Exception as e:
                    print(f"Error reading frame: {e}", file=sys.stderr)

            with self.lock:
                self.camera_ok = bool(self.tracker and getattr(self.tracker, 'streaming', False))
                self.face_detected = bool(has_face)
                now = time.time()

                if has_face and gaze:
                    self.last_gaze_point = gaze
                    # Determine cell index
                    gx = max(0.0, min(1.0, gaze[0]))
                    gy = max(0.0, min(1.0, gaze[1]))
                    col = min(2, int(gx * 3))
                    row = min(2, int(gy * 3))
                    target_cell = row * 3 + col

                    # Only dwell if player's turn and game is ongoing and cell empty
                    if self.turn == 'X' and not self.result and not self.board[target_cell]:
                        if self.selected_cell != target_cell:
                            self.selected_cell = target_cell
                            self.dwell_start = now
                            self.dwell_progress = 0.0
                        else:
                            dwell_duration = float(self.settings.get('dwell', 1.15))
                            elapsed = now - (self.dwell_start or now)
                            self.dwell_progress = min(1.0, elapsed / max(0.2, dwell_duration))
                            if self.dwell_progress >= 1.0:
                                self._apply_player_move(target_cell)
                    else:
                        if self.turn != 'X' or self.result or (self.selected_cell is not None and self.board[self.selected_cell]):
                            self.selected_cell = None
                            self.dwell_progress = 0.0
                            self.dwell_start = None
                else:
                    self.dwell_progress = 0.0

                # Check AI move trigger
                if self.turn == 'O' and not self.result and self.ai_pending and now >= self.ai_time:
                    self._apply_ai_move()

                # Process frame for MJPEG stream
                if frame is not None and self.settings.get('preview', True):
                    try:
                        # Draw gaze crosshair/indicator on frame
                        if gaze:
                            h, w = frame.shape[:2]
                            px, py = int(gaze[0] * w), int(gaze[1] * h)
                            cv2.drawMarker(frame, (px, py), (0, 255, 255), cv2.MARKER_CROSS, 16, 2)
                        
                        # Encode as JPG
                        ret, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 75])
                        if ret:
                            self.latest_jpeg = buffer.tobytes()
                    except Exception as e:
                        pass

            time.sleep(0.03)

    def _apply_player_move(self, cell_idx):
        if not self.turn == 'X' or self.result or self.board[cell_idx]:
            return False
        self.board[cell_idx] = 'X'
        self.selected_cell = None
        self.dwell_progress = 0.0
        self.dwell_start = None

        r = winner(self.board)
        if r:
            self._finish_game(r)
        else:
            self.turn = 'O'
            self.ai_pending = True
            self.ai_time = time.time() + 0.45
        return True

    def _apply_ai_move(self):
        self.ai_pending = False
        m = choose(self.board, self.settings.get('difficulty', 'Medium'))
        if m is not None:
            self.board[m] = 'O'
        r = winner(self.board)
        if r:
            self._finish_game(r)
        else:
            self.turn = 'X'

    def _finish_game(self, res):
        self.result = res
        if res == 'X':
            self.stats['wins'] = self.stats.get('wins', 0) + 1
        elif res == 'O':
            self.stats['losses'] = self.stats.get('losses', 0) + 1
        elif res == 'DRAW':
            self.stats['draws'] = self.stats.get('draws', 0) + 1
        save(T, self.stats)

        # Update logged-in user profile if active
        diff = self.settings.get('difficulty', 'Medium')
        updated_user = None
        if self.active_username:
            updated_user = record_match_result(self.active_username, res, diff)
        
        self.last_match_summary = {
            "result": res,
            "difficulty": diff,
            "username": self.active_username,
            "user": updated_user
        }

    def reset_game(self):
        with self.lock:
            self.board = [''] * 9
            self.turn = 'X'
            self.result = None
            self.selected_cell = None
            self.dwell_progress = 0.0
            self.dwell_start = None
            self.ai_pending = False
            self.last_match_summary = None

    def manual_move(self, cell_idx):
        with self.lock:
            if 0 <= cell_idx < 9:
                return self._apply_player_move(cell_idx)
            return False

    def update_settings(self, new_settings):
        with self.lock:
            self.settings.update(new_settings)
            save(S, self.settings)

    def reset_stats(self):
        with self.lock:
            self.stats = {'wins': 0, 'losses': 0, 'draws': 0}
            save(T, self.stats)

    def update_external_gaze(self, gx, gy):
        with self.lock:
            self.last_gaze_point = (gx, gy)
            self.face_detected = True
            col = min(2, max(0, int(gx * 3)))
            row = min(2, max(0, int(gy * 3)))
            target_cell = row * 3 + col
            now = time.time()
            if self.turn == 'X' and not self.result and not self.board[target_cell]:
                if self.selected_cell != target_cell:
                    self.selected_cell = target_cell
                    self.dwell_start = now
                    self.dwell_progress = 0.0
                else:
                    dwell_duration = float(self.settings.get('dwell', 1.15))
                    elapsed = now - (self.dwell_start or now)
                    self.dwell_progress = min(1.0, elapsed / max(0.2, dwell_duration))
                    if self.dwell_progress >= 1.0:
                        self._apply_player_move(target_cell)
            else:
                if self.turn != 'X' or self.result or (self.selected_cell is not None and self.board[self.selected_cell]):
                    self.selected_cell = None
                    self.dwell_progress = 0.0
                    self.dwell_start = None

    def get_state(self):
        with self.lock:
            return {
                "board": self.board,
                "turn": self.turn,
                "result": self.result,
                "selected_cell": self.selected_cell,
                "dwell_progress": round(self.dwell_progress, 3),
                "gaze_point": [round(self.last_gaze_point[0], 3), round(self.last_gaze_point[1], 3)],
                "camera_ok": self.camera_ok,
                "face_detected": self.face_detected,
                "stats": self.stats,
                "settings": self.settings,
                "active_username": self.active_username,
                "last_match_summary": self.last_match_summary
            }

session = GameSession()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login')
def login_page():
    return render_template('login.html')

@app.route('/leaderboard')
def leaderboard_page():
    return render_template('leaderboard.html')

@app.route('/video_feed')
def video_feed():
    def generate():
        while True:
            jpeg = session.latest_jpeg
            if jpeg:
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + jpeg + b'\r\n')
            time.sleep(0.04)
    return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/api/state')
def api_state():
    user = None
    u = flask_session.get('username')
    if u:
        session.set_active_user(u)
        user = get_user(u)
    else:
        # Check if client sent x-username or if active_username exists
        if session.active_username:
            user = get_user(session.active_username)

    st = session.get_state()
    st["user"] = user
    return jsonify(st)

@app.route('/api/auth/register', methods=['POST'])
def api_auth_register():
    data = request.get_json(silent=True) or {}
    username = data.get('username', '').strip()
    password = data.get('password', '')
    avatar = data.get('avatar', '👁️')

    user, err = register_user(username, password, avatar)
    if err:
        return jsonify({"success": False, "error": err}), 400

    flask_session['username'] = user['username']
    session.set_active_user(user['username'])
    return jsonify({"success": True, "user": user})

@app.route('/api/auth/login', methods=['POST'])
def api_auth_login():
    data = request.get_json(silent=True) or {}
    username = data.get('username', '').strip()
    password = data.get('password', '')

    user, err = login_user(username, password)
    if err:
        return jsonify({"success": False, "error": err}), 400

    flask_session['username'] = user['username']
    session.set_active_user(user['username'])
    return jsonify({"success": True, "user": user})

@app.route('/api/auth/logout', methods=['POST'])
def api_auth_logout():
    flask_session.pop('username', None)
    session.set_active_user(None)
    return jsonify({"success": True})

@app.route('/api/auth/me', methods=['GET'])
def api_auth_me():
    u = flask_session.get('username') or session.active_username
    if u:
        user = get_user(u)
        if user:
            session.set_active_user(user['username'])
            return jsonify({"authenticated": True, "user": user})
    return jsonify({"authenticated": False, "user": None})

@app.route('/api/leaderboard', methods=['GET'])
def api_leaderboard():
    filter_mode = request.args.get('filter', 'all')
    lb = get_leaderboard(filter_mode)
    return jsonify({"success": True, "leaderboard": lb})

@app.route('/api/leaderboard/clear', methods=['POST'])
def api_clear_leaderboard():
    clear_all_users()
    session.set_active_user(None)
    flask_session.pop('username', None)
    return jsonify({"success": True, "leaderboard": []})


@app.route('/api/gaze', methods=['POST'])
def api_gaze():
    data = request.get_json(silent=True) or {}
    gx = data.get('x')
    gy = data.get('y')
    if gx is not None and gy is not None:
        session.update_external_gaze(float(gx), float(gy))
        return jsonify({"success": True})
    return jsonify({"error": "Missing coordinates"}), 400

@app.route('/api/move', methods=['POST'])
def api_move():
    data = request.get_json(silent=True) or {}
    idx = data.get('cell')
    if idx is not None and isinstance(idx, int):
        success = session.manual_move(idx)
        st = session.get_state()
        u = flask_session.get('username')
        st["user"] = get_user(u) if u else None
        return jsonify({"success": success, "state": st})
    return jsonify({"error": "Invalid cell index"}), 400

@app.route('/api/reset', methods=['POST'])
def api_reset():
    session.reset_game()
    st = session.get_state()
    u = flask_session.get('username')
    st["user"] = get_user(u) if u else None
    return jsonify({"success": True, "state": st})

@app.route('/api/settings', methods=['POST'])
def api_settings():
    data = request.get_json(silent=True) or {}
    session.update_settings(data)
    return jsonify({"success": True, "settings": session.settings})

@app.route('/api/reset_stats', methods=['POST'])
def api_reset_stats():
    session.reset_stats()
    return jsonify({"success": True, "stats": session.stats})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"\n==================================================")
    print(f"  EyeTic Web Server running at:")
    print(f"  --> http://localhost:{port} <--")
    print(f"  --> http://127.0.0.1:{port} <--")
    print(f"==================================================\n")
    app.run(host='0.0.0.0', port=port, debug=False, threaded=True)
