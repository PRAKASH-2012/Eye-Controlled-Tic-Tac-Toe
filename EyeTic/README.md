# EyeTic 👁️
Eye-controlled Tic-Tac-Toe using Python, OpenCV, MediaPipe Face Mesh, NumPy and Pygame.

## Install
`pip install -r requirements.txt`

## Run

### Option 1: Web Browser (Localhost)
```bash
python web_app.py
```
Then open: **[http://localhost:5000](http://localhost:5000)**

Or double-click `run_web.bat`.

### Option 2: Desktop Pygame Window
```bash
python main.py
```
Or double-click `run.bat`.

### Features
- Eye/iris landmark tracking with MediaPipe Face Mesh
- Gaze-based 3x3 selection with dwell-to-select progress rings
- Easy / Medium / Hard AI (featuring Minimax unbeatable engine)
- **Player Authentication & Login**: Register/Login with custom avatars (👁️, ⚡, 🎯, 🤖, 🦅, 🔮, 👑) or play as guest
- **Global Leaderboard**: Real-time rankings with Top 3 Podium (🥇, 🥈, 🥉), Elo points, win rates, and filters
- Match score tracking & real-time XP points toast notifications
- Live camera preview & iris landmark telemetry
- Accessibility-focused interaction (dwell, keyboard, and click fallbacks)

### Web Pages & Routes
- **Game Arena**: [http://localhost:5000/](http://localhost:5000/)
- **Login / Register**: [http://localhost:5000/login](http://localhost:5000/login)
- **Leaderboard Standings**: [http://localhost:5000/leaderboard](http://localhost:5000/leaderboard)

