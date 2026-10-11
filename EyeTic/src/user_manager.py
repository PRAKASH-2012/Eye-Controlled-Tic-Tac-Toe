import os
import json
import time
import hashlib
import secrets
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / 'data'
USERS_FILE = DATA_DIR / 'users.json'

DEFAULT_SEED_USERS = []

def _hash_pw(password: str, salt: str = "eyetic_salt") -> str:
    return hashlib.sha256(f"{password}:{salt}".encode('utf-8')).hexdigest()

def _load_users():
    DATA_DIR.mkdir(exist_ok=True)
    if not USERS_FILE.exists():
        initial = {}
        USERS_FILE.write_text(json.dumps(initial, indent=2, ensure_ascii=False), encoding='utf-8')
        return initial
    try:
        data = json.loads(USERS_FILE.read_text(encoding='utf-8'))
        return data
    except Exception:
        return {}

def _save_users(users_data):
    DATA_DIR.mkdir(exist_ok=True)
    USERS_FILE.write_text(json.dumps(users_data, indent=2, ensure_ascii=False), encoding='utf-8')

def clear_all_users():
    _save_users({})
    return True


def register_user(username: str, password: str, avatar: str = "👁️"):
    username = username.strip()
    if not username or len(username) < 2 or len(username) > 20:
        return None, "Username must be between 2 and 20 characters."
    if not password or len(password) < 4:
        return None, "Password must be at least 4 characters."
    
    users = _load_users()
    key = username.lower()
    if key in users:
        return None, "Username already taken. Please choose another."

    user_obj = {
        "username": username,
        "avatar": avatar or "👁️",
        "password_hash": _hash_pw(password),
        "created_at": time.strftime("%Y-%m-%d %H:%M"),
        "stats": {
            "matches": 0,
            "wins": 0,
            "losses": 0,
            "draws": 0,
            "points": 0,
            "win_rate": 0.0,
            "hard_wins": 0,
            "medium_wins": 0,
            "easy_wins": 0
        }
    }
    users[key] = user_obj
    _save_users(users)
    return sanitize_user(user_obj), None

def login_user(username: str, password: str):
    username = username.strip()
    users = _load_users()
    key = username.lower()
    if key not in users:
        return None, "User not found. Please register first."
    
    user = users[key]
    if user.get("password_hash") != _hash_pw(password):
        return None, "Invalid password. Please try again."

    return sanitize_user(user), None

def get_user(username: str):
    if not username:
        return None
    users = _load_users()
    user = users.get(username.strip().lower())
    if user:
        return sanitize_user(user)
    return None

def sanitize_user(user):
    c = user.copy()
    c.pop("password_hash", None)
    return c

def record_match_result(username: str, result: str, difficulty: str = "Medium"):
    """
    result: 'X' (win), 'O' (loss), 'DRAW'
    difficulty: 'Easy', 'Medium', 'Hard'
    """
    if not username:
        return None
    users = _load_users()
    key = username.strip().lower()
    if key not in users:
        return None

    stats = users[key].setdefault("stats", {
        "matches": 0, "wins": 0, "losses": 0, "draws": 0, "points": 0, "win_rate": 0.0,
        "hard_wins": 0, "medium_wins": 0, "easy_wins": 0
    })

    stats["matches"] += 1
    diff_lower = (difficulty or "medium").lower()

    if result == 'X':
        stats["wins"] += 1
        if 'hard' in diff_lower:
            stats["hard_wins"] = stats.get("hard_wins", 0) + 1
            stats["points"] += 35
        elif 'easy' in diff_lower:
            stats["easy_wins"] = stats.get("easy_wins", 0) + 1
            stats["points"] += 15
        else:
            stats["medium_wins"] = stats.get("medium_wins", 0) + 1
            stats["points"] += 25
    elif result == 'O':
        stats["losses"] += 1
        stats["points"] = max(0, stats.get("points", 0) - 5)
    elif result == 'DRAW':
        stats["draws"] += 1
        stats["points"] += 8

    total = stats["matches"]
    stats["win_rate"] = round((stats["wins"] / total) * 100, 1) if total > 0 else 0.0

    _save_users(users)
    return sanitize_user(users[key])

def get_leaderboard(filter_mode: str = "all"):
    users = _load_users()
    ranking_list = []
    for k, u in users.items():
        st = u.get("stats", {})
        ranking_list.append({
            "username": u.get("username", k),
            "avatar": u.get("avatar", "👁️"),
            "matches": st.get("matches", 0),
            "wins": st.get("wins", 0),
            "losses": st.get("losses", 0),
            "draws": st.get("draws", 0),
            "points": st.get("points", 0),
            "win_rate": st.get("win_rate", 0.0),
            "hard_wins": st.get("hard_wins", 0),
            "medium_wins": st.get("medium_wins", 0),
            "easy_wins": st.get("easy_wins", 0)
        })

    if filter_mode == "hard":
        ranking_list.sort(key=lambda x: (x["hard_wins"], x["points"], x["wins"]), reverse=True)
    elif filter_mode == "wins":
        ranking_list.sort(key=lambda x: (x["wins"], x["points"], x["win_rate"]), reverse=True)
    elif filter_mode == "win_rate":
        ranking_list.sort(key=lambda x: (x["win_rate"] if x["matches"] >= 3 else 0, x["points"]), reverse=True)
    else: # all (points)
        ranking_list.sort(key=lambda x: (x["points"], x["wins"], x["win_rate"]), reverse=True)

    for idx, item in enumerate(ranking_list):
        item["rank"] = idx + 1

    return ranking_list
