# EyeTic 👁️ | Eye-Controlled Tic-Tac-Toe

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![OpenCV](https://img.shields.io/badge/OpenCV-Computer%20Vision-green.svg)](https://opencv.org/)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-Face%20Mesh-orange.svg)](https://mediapipe.dev/)
[![Flask](https://img.shields.io/badge/Flask-Web%20Framework-black.svg)](https://flask.palletsprojects.com/)
[![Pygame](https://img.shields.io/badge/Pygame-Gaming%20Engine-red.svg)](https://www.pygame.org/)

An accessible, hands-free **Eye-Controlled Tic-Tac-Toe** game powered by real-time computer vision (OpenCV & MediaPipe Face Mesh). Play completely hands-free using your gaze, or explore the full-featured cyber-themed Web App and native Desktop Pygame game!

---

## ✨ Features

- 👁️ **Real-Time Eye & Gaze Tracking**: MediaPipe Face Mesh detects 468+ facial landmarks and iris points to accurately track your gaze direction.
- ⏱️ **Dwell-To-Select Mechanic**: Fixate on any of the 9 cells to charge the radial dwell progress indicator and lock in your move.
- 🤖 **Adaptive AI Engine**: Choose between **Easy** (casual), **Medium** (tactical), or **Hard** (unbeatable Minimax algorithm).
- 🌐 **Modern Web Arena**: Futuristic Cyberpunk / Glassmorphism UI with real-time MJPEG camera stream, telemetry HUD, sound effects, and animations.
- 👤 **Player Profiles & Authentication**: Create accounts with custom avatars (👁️, ⚡, 🎯, 🤖, 🦅, 🔮, 👑), save win streaks, and earn XP points.
- 🏆 **Global Leaderboard**: Live standings featuring a 3D Top-3 podium (🥇, 🥈, 🥉), Elo ratings, win rates, and ranking filters.
- ♿ **Full Accessibility Fallbacks**: Seamless fallback to mouse clicks or keyboard arrow controls if camera access is unavailable.
- 🖥️ **Dual Modes**: Run as a rich browser-based web application or as a standalone desktop Pygame application.

---

## 📁 Project Structure

```text
Eye-Controlled-Tic-Tac-Toe/
├── run.bat                 # One-click launcher for Desktop Pygame mode
├── run_web.bat             # One-click launcher for Web Browser mode
├── LICENSE                 # MIT License
├── README.md               # Documentation
└── EyeTic/
    ├── main.py             # Desktop Pygame entrypoint
    ├── web_app.py          # Flask Web Application entrypoint
    ├── requirements.txt    # Python dependencies
    ├── src/
    │   ├── ai.py           # Game engine & Minimax AI
    │   ├── game.py         # Pygame rendering & game loop
    │   ├── gaze_tracker.py # OpenCV & MediaPipe gaze tracking pipeline
    │   ├── settings.py     # Settings & stats storage
    │   └── user_manager.py # User authentication & leaderboard management
    ├── data/               # Persistent JSON stores (users, stats, settings)
    ├── static/             # Web styles, audio effects, and client scripts
    └── templates/          # HTML templates (Arena, Login, Leaderboard)
```

---

## 🚀 Quick Start

### 1. Prerequisites
- Python 3.10+ (Recommended Python 3.11 or 3.12)
- Webcam (built-in or USB)

### 2. Setup Virtual Environment & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/PRAKASH-2012/Eye-Controlled-Tic-Tac-Toe.git
cd Eye-Controlled-Tic-Tac-Toe/EyeTic

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# macOS / Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

---

## 🎮 Running the Game

### Option A: Web Browser Application (Recommended)
1. Double-click `run_web.bat` OR run:
   ```bash
   cd EyeTic
   python web_app.py
   ```
2. Open your web browser to:
   👉 **[http://localhost:5000](http://localhost:5000)**

#### Web Routes:
- **Game Arena**: `http://localhost:5000/`
- **Login / Register**: `http://localhost:5000/login`
- **Global Leaderboard**: `http://localhost:5000/leaderboard`

---

### Option B: Native Desktop Window (Pygame)
Double-click `run.bat` OR run:
```bash
cd EyeTic
python main.py
```

---

## 📖 How to Play

1. Position yourself approximately 40–70 cm in front of your webcam in good lighting.
2. Look directly at the Tic-Tac-Toe grid cell you want to mark.
3. Hold your gaze steadily on that cell until the dwell indicator completes.
4. Outsmart the AI to claim victory and climb the leaderboard!

---

## 🛠️ Tech Stack

- **Computer Vision**: OpenCV, MediaPipe Face Mesh
- **Math & Landmarks**: NumPy
- **Desktop UI**: Pygame
- **Web Backend**: Python Flask
- **Web Frontend**: HTML5, Vanilla CSS3 (Glassmorphism & Neon Glow), JavaScript (ES6+)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
