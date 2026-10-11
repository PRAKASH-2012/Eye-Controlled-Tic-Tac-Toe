// EyeTic Client Controller & Universal Game Engine (Browser & Serverless Ready)
(function() {
  'use strict';

  // Constants
  const CELL_NAMES = [
    'Top Left (1)', 'Top Center (2)', 'Top Right (3)',
    'Middle Left (4)', 'Center (5)', 'Middle Right (6)',
    'Bottom Left (7)', 'Bottom Center (8)', 'Bottom Right (9)'
  ];

  const WIN_COMBOS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  const DEFAULT_LEADERBOARD = [
    { rank: 1, username: "CyberHawk", avatar: "🦅", points: 1250, wins: 48, losses: 8, draws: 4, win_rate: 80.0, matches: 60, hard_wins: 18 },
    { rank: 2, username: "IrisMaster", avatar: "⚡", points: 980, wins: 36, losses: 9, draws: 5, win_rate: 72.0, matches: 50, hard_wins: 12 },
    { rank: 3, username: "GazeGod", avatar: "👁️", points: 840, wins: 30, losses: 10, draws: 6, win_rate: 65.2, matches: 46, hard_wins: 9 },
    { rank: 4, username: "NeoVision", avatar: "🤖", points: 620, wins: 22, losses: 8, draws: 5, win_rate: 62.9, matches: 35, hard_wins: 5 },
    { rank: 5, username: "QuantumSeer", avatar: "🔮", points: 490, wins: 18, losses: 11, draws: 4, win_rate: 54.5, matches: 33, hard_wins: 3 }
  ];

  // DOM Elements
  const boardEl = document.getElementById('board');
  const cells = Array.from(document.querySelectorAll('.cell'));
  const turnBanner = document.getElementById('turnBanner');
  const turnTitle = document.getElementById('turnText');
  const turnSubtitle = document.getElementById('turnSubtitle');
  const cameraStatusPill = document.getElementById('cameraStatusPill');
  const cameraStatusText = document.getElementById('cameraStatusText');
  const videoFeed = document.getElementById('videoFeed');
  const webcamVideo = document.getElementById('webcamVideo');
  const webcamCanvas = document.getElementById('webcamCanvas');
  const videoFallback = document.getElementById('videoFallback');
  const gazeOverlayDot = document.getElementById('gazeOverlayDot');
  const telemetryCoords = document.getElementById('telemetryCoords');
  const telemetryTarget = document.getElementById('telemetryTarget');
  const trackerBadge = document.getElementById('trackerBadge');
  const statWins = document.getElementById('statWins');
  const statLosses = document.getElementById('statLosses');
  const statDraws = document.getElementById('statDraws');
  const newRoundBtn = document.getElementById('newRoundBtn');
  const resetStatsBtn = document.getElementById('resetStatsBtn');
  const diffBtns = Array.from(document.querySelectorAll('.diff-btn'));
  const dwellSlider = document.getElementById('dwellSlider');
  const dwellValDisplay = document.getElementById('dwellValDisplay');
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const soundOnIcon = document.getElementById('soundOnIcon');
  const soundOffIcon = document.getElementById('soundOffIcon');
  const soundToggle = document.getElementById('soundToggle');
  const previewToggle = document.getElementById('previewToggle');
  const guideModal = document.getElementById('guideModal');
  const howBtn = document.getElementById('howBtn');
  const closeGuideBtn = document.getElementById('closeGuideBtn');
  const gotItBtn = document.getElementById('gotItBtn');
  const settingsModal = document.getElementById('settingsModal');
  const settingsBtn = document.getElementById('settingsBtn');
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  const camPermBtn = document.getElementById('camPermBtn');
  const camPermModal = document.getElementById('camPermModal');
  const closeCamPermBtn = document.getElementById('closeCamPermBtn');
  const dismissCamPermBtn = document.getElementById('dismissCamPermBtn');
  const requestBrowserCamBtn = document.getElementById('requestBrowserCamBtn');
  const testCamModalBtn = document.getElementById('testCamModalBtn');

  // Auth & Leaderboard Elements
  const leaderboardBtn = document.getElementById('leaderboardBtn');
  const leaderboardModal = document.getElementById('leaderboardModal');
  const closeLeaderboardBtn = document.getElementById('closeLeaderboardBtn');
  const closeLeaderboardFooterBtn = document.getElementById('closeLeaderboardFooterBtn');
  const modalFilterBtns = Array.from(document.querySelectorAll('.modal-filter-btn'));
  const modalLbTbody = document.getElementById('modalLbTbody');
  const modalPodium = document.getElementById('modalPodium');

  const userProfileBtn = document.getElementById('userProfileBtn');
  const userAvatarIcon = document.getElementById('userAvatarIcon');
  const userPillText = document.getElementById('userPillText');
  const userPointsBadge = document.getElementById('userPointsBadge');
  const userQuickStats = document.getElementById('userQuickStats');
  const userQsPoints = document.getElementById('userQsPoints');
  const userQsWinRate = document.getElementById('userQsWinRate');

  const authModal = document.getElementById('authModal');
  const closeAuthBtn = document.getElementById('closeAuthBtn');
  const modalTabLogin = document.getElementById('modalTabLogin');
  const modalTabRegister = document.getElementById('modalTabRegister');
  const modalLoginForm = document.getElementById('modalLoginForm');
  const modalRegForm = document.getElementById('modalRegForm');
  const modalAuthAlert = document.getElementById('modalAuthAlert');
  const mUsername = document.getElementById('mUsername');
  const mPassword = document.getElementById('mPassword');
  const mRegUsername = document.getElementById('mRegUsername');
  const mRegPassword = document.getElementById('mRegPassword');

  const profileModal = document.getElementById('profileModal');
  const closeProfileBtn = document.getElementById('closeProfileBtn');
  const closeProfileFooterBtn = document.getElementById('closeProfileFooterBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const profAvatar = document.getElementById('profAvatar');
  const profUsername = document.getElementById('profUsername');
  const profRankBadge = document.getElementById('profRankBadge');
  const profPoints = document.getElementById('profPoints');
  const profWinRate = document.getElementById('profWinRate');
  const profMatches = document.getElementById('profMatches');
  const profHardWins = document.getElementById('profHardWins');

  const pointsToast = document.getElementById('pointsToast');
  const toastTitle = document.getElementById('toastTitle');
  const toastSubtitle = document.getElementById('toastSubtitle');

  // SVG Templates
  const SVG_X = `
    <svg class="mark-x" viewBox="0 0 100 100">
      <line x1="24" y1="24" x2="76" y2="76" stroke="currentColor" stroke-width="12" stroke-linecap="round" />
      <line x1="76" y1="24" x2="24" y2="76" stroke="currentColor" stroke-width="12" stroke-linecap="round" />
    </svg>`;

  const SVG_O = `
    <svg class="mark-o" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="30" stroke="currentColor" stroke-width="12" fill="none" />
    </svg>`;

  // Game & User State Cache
  let audioCtx = null;
  let audioEnabled = true;
  let keyboardSelectedCell = 4;
  let activeLeaderboardFilter = 'all';
  let selectedModalAvatar = '👁️';
  let toastTimer = null;

  // Local storage helpers
  function getStorage(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function setStorage(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {}
  }

  let currentUser = getStorage('eyetic_user', null);
  let localStats = getStorage('eyetic_stats', { wins: 0, losses: 0, draws: 0 });
  let localSettings = getStorage('eyetic_settings', { difficulty: 'Easy', dwell: 1.15, preview: true });

  // In-Memory Game Session
  let gameState = {
    board: Array(9).fill(''),
    turn: 'X',
    result: null,
    selected_cell: null,
    dwell_progress: 0.0,
    gaze_point: [0.5, 0.5],
    camera_ok: false,
    face_detected: false,
    stats: localStats,
    settings: localSettings,
    user: currentUser,
    last_match_summary: null
  };

  let lastState = null;

  // Web Audio Synthesizer
  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq, duration = 0.1, type = 'sine', gainVal = 0.15) {
    if (!audioEnabled || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch(e) {}
  }

  function playPlayerMoveSound() {
    initAudio();
    playTone(520, 0.12, 'triangle', 0.2);
    setTimeout(() => playTone(780, 0.15, 'sine', 0.2), 60);
  }

  function playAiMoveSound() {
    initAudio();
    playTone(400, 0.12, 'sawtooth', 0.12);
  }

  function playWinSound() {
    initAudio();
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, idx) => {
      setTimeout(() => playTone(f, 0.25, 'triangle', 0.25), idx * 110);
    });
  }

  function playLossSound() {
    initAudio();
    const notes = [440, 370, 311, 260];
    notes.forEach((f, idx) => {
      setTimeout(() => playTone(f, 0.22, 'sawtooth', 0.18), idx * 120);
    });
  }

  function playDrawSound() {
    initAudio();
    playTone(330, 0.2, 'sine', 0.15);
    setTimeout(() => playTone(330, 0.2, 'sine', 0.15), 180);
  }

  // Toast Notification
  function showPointsToast(title, subtitle) {
    if (!pointsToast) return;
    toastTitle.textContent = title;
    toastSubtitle.textContent = subtitle;
    pointsToast.classList.remove('hidden');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      pointsToast.classList.add('hidden');
    }, 4000);
  }

  // AI & Game Engine Logic
  function checkWinner(board) {
    for (const [a, b, c] of WIN_COMBOS) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return board.every(x => x) ? 'DRAW' : null;
  }

  function getWinningCombo(board) {
    for (const combo of WIN_COMBOS) {
      const [a, b, c] = combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return combo;
      }
    }
    return null;
  }

  function emptyIndices(board) {
    return board.map((x, i) => x ? -1 : i).filter(i => i !== -1);
  }

  function minimax(board, isMaximizing) {
    const res = checkWinner(board);
    if (res === 'O') return 10;
    if (res === 'X') return -10;
    if (res === 'DRAW') return 0;

    const empties = emptyIndices(board);
    if (isMaximizing) {
      let bestScore = -Infinity;
      for (const idx of empties) {
        board[idx] = 'O';
        bestScore = Math.max(bestScore, minimax(board, false));
        board[idx] = '';
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (const idx of empties) {
        board[idx] = 'X';
        bestScore = Math.min(bestScore, minimax(board, true));
        board[idx] = '';
      }
      return bestScore;
    }
  }

  function chooseAIMove(board, difficulty) {
    const empties = emptyIndices(board);
    if (empties.length === 0) return null;

    if (difficulty === 'Easy') {
      return empties[Math.floor(Math.random() * empties.length)];
    }

    if (difficulty === 'Medium') {
      for (const mark of ['O', 'X']) {
        for (const idx of empties) {
          board[idx] = mark;
          if (checkWinner(board) === mark) {
            board[idx] = '';
            return idx;
          }
          board[idx] = '';
        }
      }
      if (empties.includes(4)) return 4;
      return empties[Math.floor(Math.random() * empties.length)];
    }

    // Hard (Unbeatable Minimax)
    let bestScore = -Infinity;
    let bestMoves = [];
    for (const idx of empties) {
      board[idx] = 'O';
      const score = minimax(board, false);
      board[idx] = '';
      if (score > bestScore) {
        bestScore = score;
        bestMoves = [idx];
      } else if (score === bestScore) {
        bestMoves.push(idx);
      }
    }
    return bestMoves[Math.floor(Math.random() * bestMoves.length)];
  }

  // End of Round & XP Processing
  function handleMatchEnd(outcome) {
    gameState.result = outcome;

    if (outcome === 'X') {
      localStats.wins++;
      playWinSound();
      const diff = gameState.settings?.difficulty || 'Medium';
      const pts = diff === 'Hard' ? 35 : (diff === 'Easy' ? 15 : 25);
      showPointsToast(`+${pts} PTS EARNED!`, `Victory against ${diff} AI recorded`);
      updateUserMatchRecord('win', pts, diff === 'Hard');
    } else if (outcome === 'O') {
      localStats.losses++;
      playLossSound();
      showPointsToast(`MATCH CONCLUDED`, `AI claimed the round. Rematch to climb!`);
      updateUserMatchRecord('loss', 0, false);
    } else {
      localStats.draws++;
      playDrawSound();
      showPointsToast(`+8 PTS (DRAW)`, `Hard fought stalemate recorded`);
      updateUserMatchRecord('draw', 8, false);
    }

    setStorage('eyetic_stats', localStats);
    gameState.stats = localStats;
  }

  function updateUserMatchRecord(result, pointsGained, isHardWin) {
    if (!currentUser) return;
    const s = currentUser.stats || { wins: 0, losses: 0, draws: 0, points: 100, matches: 0, hard_wins: 0, streak: 0 };
    s.matches = (s.matches || 0) + 1;
    s.points = (s.points || 0) + pointsGained;

    if (result === 'win') {
      s.wins = (s.wins || 0) + 1;
      s.streak = (s.streak || 0) + 1;
      if (isHardWin) s.hard_wins = (s.hard_wins || 0) + 1;
    } else if (result === 'loss') {
      s.losses = (s.losses || 0) + 1;
      s.streak = 0;
    } else {
      s.draws = (s.draws || 0) + 1;
    }

    const total = s.wins + s.losses + s.draws;
    s.win_rate = total > 0 ? Math.round((s.wins / total) * 1000) / 10 : 0.0;
    currentUser.stats = s;
    setStorage('eyetic_user', currentUser);
    updateUserUI(currentUser);

    // Sync to local leaderboard
    let lb = getStorage('eyetic_leaderboard', DEFAULT_LEADERBOARD);
    const existingIdx = lb.findIndex(x => x.username.toLowerCase() === currentUser.username.toLowerCase());
    const entry = {
      username: currentUser.username,
      avatar: currentUser.avatar || '👁️',
      points: s.points,
      wins: s.wins,
      losses: s.losses,
      draws: s.draws,
      matches: s.matches,
      win_rate: s.win_rate,
      hard_wins: s.hard_wins,
      streak: s.streak
    };
    if (existingIdx >= 0) {
      lb[existingIdx] = entry;
    } else {
      lb.push(entry);
    }
    lb.sort((a, b) => b.points - a.points);
    lb.forEach((x, i) => x.rank = i + 1);
    setStorage('eyetic_leaderboard', lb);
  }

  // Player and AI Move Execution
  function executeMove(cellIdx) {
    if (gameState.result || gameState.board[cellIdx] || gameState.turn !== 'X') return;

    gameState.board[cellIdx] = 'X';
    gameState.selected_cell = null;
    gameState.dwell_progress = 0.0;
    playPlayerMoveSound();

    const winner = checkWinner(gameState.board);
    if (winner) {
      handleMatchEnd(winner);
    } else {
      gameState.turn = 'O';
      setTimeout(executeAIMove, 420);
    }
    render(gameState);

    // Notify backend if connected
    fetch('/api/move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cell: cellIdx })
    }).catch(() => {});
  }

  function executeAIMove() {
    if (gameState.result || gameState.turn !== 'O') return;

    const diff = gameState.settings?.difficulty || 'Easy';
    const aiCell = chooseAIMove(gameState.board, diff);

    if (aiCell !== null && aiCell !== undefined) {
      gameState.board[aiCell] = 'O';
      playAiMoveSound();
      const winner = checkWinner(gameState.board);
      if (winner) {
        handleMatchEnd(winner);
      } else {
        gameState.turn = 'X';
      }
    }
    render(gameState);
  }

  function resetGame() {
    initAudio();
    playTone(480, 0.08, 'sine', 0.15);
    gameState.board = Array(9).fill('');
    gameState.turn = 'X';
    gameState.result = null;
    gameState.selected_cell = null;
    gameState.dwell_progress = 0.0;
    render(gameState);

    fetch('/api/reset', { method: 'POST' }).catch(() => {});
  }

  // User Profile UI
  function updateUserUI(user) {
    currentUser = user;
    if (user) {
      userAvatarIcon.textContent = user.avatar || '👁️';
      userPillText.textContent = user.username;
      userPointsBadge.textContent = `${user.stats?.points || 0} PTS`;
      userPointsBadge.classList.remove('hidden');

      userQuickStats.classList.remove('hidden');
      userQsPoints.textContent = `${user.stats?.points || 0} PTS`;
      userQsWinRate.textContent = `${user.stats?.win_rate || 0}%`;

      profAvatar.textContent = user.avatar || '👁️';
      profUsername.textContent = user.username;
      profPoints.textContent = user.stats?.points || 0;
      profWinRate.textContent = `${user.stats?.win_rate || 0}%`;
      profMatches.textContent = user.stats?.matches || 0;
      profHardWins.textContent = user.stats?.hard_wins || 0;

      const pts = user.stats?.points || 0;
      let rankTier = 'ROOKIE';
      if (pts >= 400) rankTier = 'GRANDMASTER 👑';
      else if (pts >= 250) rankTier = 'ELITE PILOT ⚡';
      else if (pts >= 100) rankTier = 'PRO GAZER 🎯';
      profRankBadge.textContent = `${rankTier} • ${pts} PTS`;
    } else {
      userAvatarIcon.textContent = '👤';
      userPillText.textContent = 'Sign In';
      userPointsBadge.classList.add('hidden');
      userQuickStats.classList.add('hidden');
    }
  }

  // Camera & Gaze Tracking Status Pill
  function setCameraStatus(status) {
    cameraStatusPill.className = 'status-pill';
    if (status === 'locked') {
      cameraStatusPill.classList.add('status-active');
      cameraStatusText.textContent = 'EYE TRACKING LOCKED';
      trackerBadge.textContent = 'Tracking Pupils';
      trackerBadge.className = 'card-badge badge-active';
      videoFallback.classList.add('hidden');
    } else if (status === 'camera_on') {
      cameraStatusPill.classList.add('status-connecting');
      cameraStatusText.textContent = 'CAMERA ON — POSITION FACE';
      trackerBadge.textContent = 'Searching Face';
      trackerBadge.className = 'card-badge';
      videoFallback.classList.add('hidden');
    } else {
      cameraStatusPill.classList.add('status-inactive');
      cameraStatusText.textContent = 'CAMERA NOT CONNECTED';
      trackerBadge.textContent = 'Offline';
      trackerBadge.className = 'card-badge';
      videoFallback.classList.remove('hidden');
    }
  }

  function updateStatsUI(stats) {
    statWins.textContent = stats.wins || 0;
    statLosses.textContent = stats.losses || 0;
    statDraws.textContent = stats.draws || 0;
  }

  // Main UI Render Function
  function render(state) {
    lastState = state;

    if (state.user) updateUserUI(state.user);
    updateStatsUI(state.stats || localStats);

    if (state.face_detected) {
      setCameraStatus('locked');
    } else if (state.camera_ok) {
      setCameraStatus('camera_on');
    } else {
      setCameraStatus('offline');
    }

    if (state.gaze_point && state.gaze_point.length === 2) {
      const gx = state.gaze_point[0];
      const gy = state.gaze_point[1];
      telemetryCoords.textContent = `${gx.toFixed(2)}, ${gy.toFixed(2)}`;
      
      gazeOverlayDot.style.left = `${gx * 100}%`;
      gazeOverlayDot.style.top = `${gy * 100}%`;
      gazeOverlayDot.style.display = state.camera_ok ? 'block' : 'none';

      const col = Math.min(2, Math.max(0, Math.floor(gx * 3)));
      const row = Math.min(2, Math.max(0, Math.floor(gy * 3)));
      const targetIdx = row * 3 + col;
      telemetryTarget.textContent = CELL_NAMES[targetIdx] || 'None';
    }

    // Turn / Result Banner
    turnBanner.className = 'turn-banner';
    if (state.result) {
      if (state.result === 'X') {
        turnBanner.classList.add('turn-win');
        turnTitle.textContent = '🎉 YOU WIN!';
        turnSubtitle.textContent = 'Outstanding gaze control! Press Space or click New Game.';
      } else if (state.result === 'O') {
        turnBanner.classList.add('turn-loss');
        turnTitle.textContent = '🤖 AI VICTORIOUS';
        turnSubtitle.textContent = 'The computer took this round. Press Space to rematch!';
      } else {
        turnBanner.classList.add('turn-draw');
        turnTitle.textContent = '🤝 GAME DRAW';
        turnSubtitle.textContent = 'Evenly matched! Press Space to start another round.';
      }
    } else {
      if (state.turn === 'X') {
        turnBanner.classList.add('turn-player');
        turnTitle.textContent = 'YOUR TURN (X)';
        turnSubtitle.textContent = 'Hold your gaze on an open cell to dwell-select';
      } else {
        turnBanner.classList.add('turn-ai');
        turnTitle.textContent = 'AI THINKING... (O)';
        turnSubtitle.textContent = 'Analyzing board permutations';
      }
    }

    // Board rendering
    const winningCombo = getWinningCombo(state.board);
    const circleCircumference = 339.292;

    cells.forEach((cell, idx) => {
      const mark = state.board[idx];
      const markSlot = cell.querySelector('.mark-slot');
      const dwellBar = cell.querySelector('.dwell-bar');

      if (mark === 'X') {
        if (!cell.classList.contains('has-x')) {
          markSlot.innerHTML = SVG_X;
          cell.classList.add('taken', 'has-x');
          cell.classList.remove('has-o');
        }
      } else if (mark === 'O') {
        if (!cell.classList.contains('has-o')) {
          markSlot.innerHTML = SVG_O;
          cell.classList.add('taken', 'has-o');
          cell.classList.remove('has-x');
        }
      } else {
        markSlot.innerHTML = '';
        cell.classList.remove('taken', 'has-x', 'has-o');
      }

      if (winningCombo && winningCombo.includes(idx)) {
        cell.classList.add('win-cell');
      } else {
        cell.classList.remove('win-cell');
      }

      const isTargeted = state.selected_cell === idx && state.turn === 'X' && !state.result && !mark;
      if (isTargeted) {
        cell.classList.add('gaze-locked');
        const offset = circleCircumference * (1 - (state.dwell_progress || 0));
        dwellBar.style.strokeDashoffset = offset;
      } else {
        cell.classList.remove('gaze-locked');
        dwellBar.style.strokeDashoffset = circleCircumference;
      }
    });
  }

  // In-Browser MediaPipe Face Mesh & Eye Tracking
  let faceMeshInstance = null;
  let browserCameraStream = null;
  let smoothX = 0.5;
  let smoothY = 0.5;
  let dwellStartTime = null;
  let selectedGazeCell = null;

  async function startBrowserCameraTracking() {
    initAudio();
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Your browser does not support webcam media access. You can still play with mouse or keyboard!');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false
      });

      browserCameraStream = stream;
      webcamVideo.srcObject = stream;
      await webcamVideo.play();

      gameState.camera_ok = true;
      videoFallback.classList.add('hidden');
      webcamCanvas.style.display = 'block';
      if (videoFeed) videoFeed.style.display = 'none';

      initMediaPipe();
      playTone(750, 0.15, 'sine', 0.2);
      camPermModal.classList.add('hidden');
    } catch (err) {
      console.warn('Webcam access was not granted:', err);
      camPermModal.classList.remove('hidden');
      playTone(280, 0.2, 'sawtooth', 0.2);
    }
  }

  function initMediaPipe() {
    if (!window.FaceMesh) {
      console.log('MediaPipe FaceMesh script loading or unavailable, running manual video loop');
      requestAnimationFrame(renderVideoFrameLoop);
      return;
    }

    if (faceMeshInstance) return;

    faceMeshInstance = new window.FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
    });

    faceMeshInstance.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    faceMeshInstance.onResults(onFaceMeshResults);

    if (window.Camera) {
      const cam = new window.Camera(webcamVideo, {
        onFrame: async () => {
          if (webcamVideo.readyState >= 2) {
            await faceMeshInstance.send({ image: webcamVideo });
          }
        },
        width: 640,
        height: 480
      });
      cam.start();
    } else {
      requestAnimationFrame(processVideoFrame);
    }
  }

  async function processVideoFrame() {
    if (faceMeshInstance && webcamVideo.readyState >= 2) {
      await faceMeshInstance.send({ image: webcamVideo });
    }
    requestAnimationFrame(processVideoFrame);
  }

  function renderVideoFrameLoop() {
    if (webcamVideo.readyState >= 2 && webcamCanvas) {
      const ctx = webcamCanvas.getContext('2d');
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(webcamVideo, -webcamCanvas.width, 0, webcamCanvas.width, webcamCanvas.height);
      ctx.restore();
    }
    requestAnimationFrame(renderVideoFrameLoop);
  }

  function onFaceMeshResults(results) {
    if (!webcamCanvas) return;
    const ctx = webcamCanvas.getContext('2d');
    const w = webcamCanvas.width;
    const h = webcamCanvas.height;

    // Draw mirrored video frame
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(results.image, -w, 0, w, h);
    ctx.restore();

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      gameState.face_detected = true;
      const lm = results.multiFaceLandmarks[0];

      // Pupils: 468 (left pupil center), 473 (right pupil center)
      const leftPupilX = w - (lm[468].x * w);
      const leftPupilY = lm[468].y * h;
      const rightPupilX = w - (lm[473].x * w);
      const rightPupilY = lm[473].y * h;

      // Draw glowing emerald circles on pupils
      ctx.fillStyle = '#10b981';
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(leftPupilX, leftPupilY, 4, 0, 2 * Math.PI);
      ctx.arc(rightPupilX, rightPupilY, 4, 0, 2 * Math.PI);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Calculate iris center coords
      const lx = (lm[468].x + lm[469].x + lm[470].x + lm[471].x + lm[472].x) / 5;
      const rx = (lm[473].x + lm[474].x + lm[475].x + lm[476].x + lm[477].x) / 5;
      const ly = (lm[468].y + lm[469].y + lm[470].y + lm[471].y + lm[472].y) / 5;
      const ry = (lm[473].y + lm[474].y + lm[475].y + lm[476].y + lm[477].y) / 5;

      // Invert horizontally for mirror alignment
      const eyeAvgX = 1.0 - (lx + rx) / 2;
      const eyeAvgY = (ly + ry) / 2;

      // Sensitivity curve identical to Python GazeTracker
      const targetX = Math.min(1, Math.max(0, 0.5 + (eyeAvgX - 0.5) * 2.4));
      const targetY = Math.min(1, Math.max(0, 0.5 + (eyeAvgY - 0.5) * 2.4));

      // Smooth with EMA
      smoothX = 0.22 * targetX + 0.78 * smoothX;
      smoothY = 0.22 * targetY + 0.78 * smoothY;
      gameState.gaze_point = [smoothX, smoothY];

      // Cell selection logic
      const col = Math.min(2, Math.max(0, Math.floor(smoothX * 3)));
      const row = Math.min(2, Math.max(0, Math.floor(smoothY * 3)));
      const targetCell = row * 3 + col;

      const now = performance.now();
      const dwellDuration = parseFloat(gameState.settings?.dwell || 1.15);

      if (gameState.turn === 'X' && !gameState.result && !gameState.board[targetCell]) {
        if (selectedGazeCell !== targetCell) {
          selectedGazeCell = targetCell;
          dwellStartTime = now;
          gameState.dwell_progress = 0.0;
        } else {
          const elapsed = (now - (dwellStartTime || now)) / 1000;
          gameState.dwell_progress = Math.min(1.0, elapsed / Math.max(0.2, dwellDuration));
          if (gameState.dwell_progress >= 1.0) {
            executeMove(targetCell);
            selectedGazeCell = null;
            dwellStartTime = null;
            gameState.dwell_progress = 0.0;
          }
        }
      } else {
        selectedGazeCell = null;
        dwellStartTime = null;
        gameState.dwell_progress = 0.0;
      }
      gameState.selected_cell = selectedGazeCell;
    } else {
      gameState.face_detected = false;
      gameState.dwell_progress = 0.0;
      gameState.selected_cell = null;
    }

    render(gameState);
  }

  // Modal Leaderboard Loader
  async function fetchModalLeaderboard() {
    let list = null;
    try {
      const res = await fetch(`/api/leaderboard?filter=${activeLeaderboardFilter}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.leaderboard) list = data.leaderboard;
      }
    } catch (e) {}

    if (!list) {
      list = getStorage('eyetic_leaderboard', DEFAULT_LEADERBOARD);
      if (activeLeaderboardFilter === 'winrate') {
        list.sort((a, b) => (b.win_rate - a.win_rate) || (b.points - a.points));
      } else if (activeLeaderboardFilter === 'hard') {
        list.sort((a, b) => (b.hard_wins - a.hard_wins) || (b.points - a.points));
      } else {
        list.sort((a, b) => b.points - a.points);
      }
      list.forEach((item, idx) => item.rank = idx + 1);
    }

    renderLeaderboardUI(list);
  }

  function renderLeaderboardUI(list) {
    if (!modalLbTbody) return;

    if (!list || list.length === 0) {
      if (modalPodium) modalPodium.style.display = 'none';
      modalLbTbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 36px 14px;">
            <div style="font-size: 28px; margin-bottom: 8px;">🎯</div>
            <div style="font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">No players on the leaderboard yet</div>
            <div style="font-size: 13px; color: var(--text-muted);">Play a match or sign in to claim rank #1!</div>
          </td>
        </tr>
      `;
      return;
    }

    if (modalPodium) modalPodium.style.display = 'flex';

    const p1 = list[0] || null;
    const p2 = list[1] || null;
    const p3 = list[2] || null;

    const mp1 = document.getElementById('mPodium1');
    const mp2 = document.getElementById('mPodium2');
    const mp3 = document.getElementById('mPodium3');

    if (p1 && mp1) {
      mp1.style.display = 'flex';
      document.getElementById('mp1Avatar').textContent = p1.avatar || '👁️';
      document.getElementById('mp1Name').textContent = p1.username;
      document.getElementById('mp1Pts').textContent = `${p1.points} PTS`;
    } else if (mp1) mp1.style.display = 'none';

    if (p2 && mp2) {
      mp2.style.display = 'flex';
      document.getElementById('mp2Avatar').textContent = p2.avatar || '⚡';
      document.getElementById('mp2Name').textContent = p2.username;
      document.getElementById('mp2Pts').textContent = `${p2.points} PTS`;
    } else if (mp2) mp2.style.display = 'none';

    if (p3 && mp3) {
      mp3.style.display = 'flex';
      document.getElementById('mp3Avatar').textContent = p3.avatar || '🦅';
      document.getElementById('mp3Name').textContent = p3.username;
      document.getElementById('mp3Pts').textContent = `${p3.points} PTS`;
    } else if (mp3) mp3.style.display = 'none';

    modalLbTbody.innerHTML = '';
    list.forEach(item => {
      const tr = document.createElement('tr');
      const isMe = currentUser && currentUser.username.toLowerCase() === item.username.toLowerCase();
      if (isMe) tr.className = 'user-row';

      let rankStr = `#${item.rank}`;
      if (item.rank === 1) rankStr = '🥇 #1';
      else if (item.rank === 2) rankStr = '🥈 #2';
      else if (item.rank === 3) rankStr = '🥉 #3';

      tr.innerHTML = `
        <td style="font-family: var(--font-mono); font-weight: 700;">${rankStr}</td>
        <td>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span>${item.avatar || '👁️'}</span>
            <span style="font-weight: 600;">${item.username}</span>
            ${isMe ? '<span class="badge-you">YOU</span>' : ''}
          </div>
        </td>
        <td style="font-family: var(--font-mono); font-weight: 700; color: var(--cyan-primary);">${item.points}</td>
        <td style="font-family: var(--font-mono);">${item.win_rate}%</td>
        <td style="font-family: var(--font-mono); font-size: 12px;">
          <span style="color: var(--emerald-primary);">${item.wins}W</span> - 
          <span style="color: var(--crimson-primary);">${item.losses}L</span> - 
          <span style="color: var(--text-dim);">${item.draws}D</span>
        </td>
      `;
      modalLbTbody.appendChild(tr);
    });
  }

  function showAuthAlert(msg, isError = true) {
    modalAuthAlert.textContent = msg;
    modalAuthAlert.className = `auth-alert ${isError ? 'error' : 'success'}`;
    modalAuthAlert.classList.remove('hidden');
  }

  function hideAuthAlert() {
    modalAuthAlert.classList.add('hidden');
  }

  // Setup Event Handlers
  function setupEvents() {
    // Cell Click
    cells.forEach(cell => {
      const idx = parseInt(cell.dataset.idx, 10);
      cell.addEventListener('click', () => {
        executeMove(idx);
      });
    });

    // New Game Button
    newRoundBtn.addEventListener('click', resetGame);

    // Reset Stats Button
    resetStatsBtn.addEventListener('click', () => {
      if (confirm('Reset scoreboard match stats?')) {
        localStats = { wins: 0, losses: 0, draws: 0 };
        setStorage('eyetic_stats', localStats);
        gameState.stats = localStats;
        render(gameState);
        fetch('/api/reset_stats', { method: 'POST' }).catch(() => {});
      }
    });

    // Difficulty selection
    diffBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        initAudio();
        playTone(600, 0.05, 'sine', 0.1);
        diffBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        gameState.settings.difficulty = btn.dataset.diff;
        localSettings.difficulty = btn.dataset.diff;
        setStorage('eyetic_settings', localSettings);
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ difficulty: btn.dataset.diff })
        }).catch(() => {});
      });
    });

    // Dwell Duration Slider
    dwellSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      dwellValDisplay.textContent = `${val.toFixed(1)}s`;
    });
    dwellSlider.addEventListener('change', (e) => {
      const val = parseFloat(e.target.value);
      gameState.settings.dwell = val;
      localSettings.dwell = val;
      setStorage('eyetic_settings', localSettings);
      fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dwell: val })
      }).catch(() => {});
    });

    // Preview Toggle
    previewToggle.addEventListener('change', (e) => {
      const checked = e.target.checked;
      webcamCanvas.style.display = checked ? 'block' : 'none';
      if (videoFeed) videoFeed.style.display = checked ? 'block' : 'none';
      videoFallback.classList.toggle('hidden', checked);
      gameState.settings.preview = checked;
      localSettings.preview = checked;
      setStorage('eyetic_settings', localSettings);
    });

    // Sound Toggle
    function setSoundState(enabled) {
      audioEnabled = enabled;
      soundToggle.checked = enabled;
      soundOnIcon.classList.toggle('hidden', !enabled);
      soundOffIcon.classList.toggle('hidden', enabled);
    }

    soundToggleBtn.addEventListener('click', () => {
      initAudio();
      setSoundState(!audioEnabled);
      if (audioEnabled) playTone(700, 0.08, 'sine', 0.2);
    });

    soundToggle.addEventListener('change', (e) => {
      initAudio();
      setSoundState(e.target.checked);
      if (audioEnabled) playTone(700, 0.08, 'sine', 0.2);
    });

    // Leaderboard Modal Triggers
    leaderboardBtn.addEventListener('click', () => {
      leaderboardModal.classList.remove('hidden');
      fetchModalLeaderboard();
    });
    closeLeaderboardBtn.addEventListener('click', () => leaderboardModal.classList.add('hidden'));
    closeLeaderboardFooterBtn.addEventListener('click', () => leaderboardModal.classList.add('hidden'));

    modalFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        modalFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeLeaderboardFilter = btn.dataset.filter;
        fetchModalLeaderboard();
      });
    });

    // User Profile / Auth Button
    userProfileBtn.addEventListener('click', () => {
      if (currentUser) {
        profileModal.classList.remove('hidden');
      } else {
        hideAuthAlert();
        authModal.classList.remove('hidden');
      }
    });

    // Profile Modal
    closeProfileBtn.addEventListener('click', () => profileModal.classList.add('hidden'));
    closeProfileFooterBtn.addEventListener('click', () => profileModal.classList.add('hidden'));
    logoutBtn.addEventListener('click', async () => {
      currentUser = null;
      setStorage('eyetic_user', null);
      profileModal.classList.add('hidden');
      updateUserUI(null);
      showPointsToast('Signed Out', 'You are now playing as Guest');
      fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    });

    // Auth Modal Form Logic
    closeAuthBtn.addEventListener('click', () => authModal.classList.add('hidden'));
    modalTabLogin.addEventListener('click', () => {
      modalTabLogin.classList.add('active');
      modalTabRegister.classList.remove('active');
      modalLoginForm.classList.remove('hidden');
      modalRegForm.classList.add('hidden');
      hideAuthAlert();
    });
    modalTabRegister.addEventListener('click', () => {
      modalTabRegister.classList.add('active');
      modalTabLogin.classList.remove('active');
      modalRegForm.classList.remove('hidden');
      modalLoginForm.classList.add('hidden');
      hideAuthAlert();
    });

    // Avatar Selection in Modal
    document.querySelectorAll('#mAvatarGrid .avatar-option').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#mAvatarGrid .avatar-option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedModalAvatar = btn.dataset.avatar;
      });
    });

    // Modal Login Submit
    modalLoginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const u = mUsername.value.trim();
      const p = mPassword.value;
      if (!u || !p) return;

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: u, password: p })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          updateUserUI(data.user);
          setStorage('eyetic_user', data.user);
          authModal.classList.add('hidden');
          showPointsToast(`Welcome back, ${data.user.username}!`, `Leaderboard synced • ${data.user.stats?.points || 0} PTS`);
          return;
        }
      } catch (err) {}

      // Local fallback login
      const localUser = {
        username: u,
        avatar: selectedModalAvatar || '👁️',
        stats: { wins: 0, losses: 0, draws: 0, points: 100, matches: 0, hard_wins: 0, streak: 0 }
      };
      updateUserUI(localUser);
      setStorage('eyetic_user', localUser);
      authModal.classList.add('hidden');
      showPointsToast(`Welcome, ${u}!`, `Playing as ${u}`);
    });

    // Modal Register Submit
    modalRegForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const u = mRegUsername.value.trim();
      const p = mRegPassword.value;
      if (!u || !p) return;

      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: u, password: p, avatar: selectedModalAvatar })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          updateUserUI(data.user);
          setStorage('eyetic_user', data.user);
          authModal.classList.add('hidden');
          showPointsToast(`Account Created!`, `Welcome to EyeTic, ${data.user.username}!`);
          return;
        }
      } catch (err) {}

      // Local fallback register
      const localUser = {
        username: u,
        avatar: selectedModalAvatar || '👁️',
        stats: { wins: 0, losses: 0, draws: 0, points: 100, matches: 0, hard_wins: 0, streak: 0 }
      };
      updateUserUI(localUser);
      setStorage('eyetic_user', localUser);
      authModal.classList.add('hidden');
      showPointsToast(`Account Created!`, `Welcome to EyeTic, ${u}!`);
    });

    // Guide and Settings Modals
    howBtn.addEventListener('click', () => guideModal.classList.remove('hidden'));
    closeGuideBtn.addEventListener('click', () => guideModal.classList.add('hidden'));
    gotItBtn.addEventListener('click', () => guideModal.classList.add('hidden'));

    settingsBtn.addEventListener('click', () => settingsModal.classList.remove('hidden'));
    closeSettingsBtn.addEventListener('click', () => settingsModal.classList.add('hidden'));
    saveSettingsBtn.addEventListener('click', () => settingsModal.classList.add('hidden'));

    // Camera Access Modal Triggers
    if (requestBrowserCamBtn) requestBrowserCamBtn.addEventListener('click', startBrowserCameraTracking);
    if (testCamModalBtn) testCamModalBtn.addEventListener('click', startBrowserCameraTracking);
    if (camPermBtn) camPermBtn.addEventListener('click', () => camPermModal.classList.remove('hidden'));
    if (closeCamPermBtn) closeCamPermBtn.addEventListener('click', () => camPermModal.classList.add('hidden'));
    if (dismissCamPermBtn) dismissCamPermBtn.addEventListener('click', () => camPermModal.classList.add('hidden'));

    // Backdrop click close
    window.addEventListener('click', (e) => {
      if (e.target === guideModal) guideModal.classList.add('hidden');
      if (e.target === settingsModal) settingsModal.classList.add('hidden');
      if (e.target === camPermModal) camPermModal.classList.add('hidden');
      if (e.target === leaderboardModal) leaderboardModal.classList.add('hidden');
      if (e.target === authModal) authModal.classList.add('hidden');
      if (e.target === profileModal) profileModal.classList.add('hidden');
    });

    // Keyboard Fallbacks
    window.addEventListener('keydown', (e) => {
      initAudio();
      if (e.key === 'Escape') {
        guideModal.classList.add('hidden');
        settingsModal.classList.add('hidden');
        if (camPermModal) camPermModal.classList.add('hidden');
        if (leaderboardModal) leaderboardModal.classList.add('hidden');
        if (authModal) authModal.classList.add('hidden');
        if (profileModal) profileModal.classList.add('hidden');
        return;
      }

      if (e.key === ' ' || e.key === 'Enter') {
        if (gameState.result) {
          resetGame();
          e.preventDefault();
          return;
        }
        if (gameState.turn === 'X' && !gameState.board[keyboardSelectedCell]) {
          executeMove(keyboardSelectedCell);
          e.preventDefault();
          return;
        }
      }

      // Arrow navigation
      if (e.key === 'ArrowLeft') {
        keyboardSelectedCell = (keyboardSelectedCell + 8) % 9;
        highlightKeyboardCell();
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        keyboardSelectedCell = (keyboardSelectedCell + 1) % 9;
        highlightKeyboardCell();
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        keyboardSelectedCell = (keyboardSelectedCell + 6) % 9;
        highlightKeyboardCell();
        e.preventDefault();
      } else if (e.key === 'ArrowDown') {
        keyboardSelectedCell = (keyboardSelectedCell + 3) % 9;
        highlightKeyboardCell();
        e.preventDefault();
      }
    });
  }

  function highlightKeyboardCell() {
    cells.forEach((c, i) => {
      if (i === keyboardSelectedCell) {
        c.style.outline = '2px solid rgba(56, 189, 248, 0.8)';
      } else {
        c.style.outline = 'none';
      }
    });
  }

  // Periodic Server Poll (if running alongside local Flask backend)
  async function pollServer() {
    try {
      const res = await fetch('/api/state');
      if (res.ok) {
        const data = await res.json();
        // If server webcam is active, sync server state
        if (data.camera_ok && !browserCameraStream) {
          gameState = { ...gameState, ...data };
          if (videoFeed) {
            videoFeed.style.display = 'block';
            webcamCanvas.style.display = 'none';
          }
          render(gameState);
        }
      }
    } catch (e) {}
  }

  // Init
  document.addEventListener('DOMContentLoaded', () => {
    setupEvents();
    if (currentUser) updateUserUI(currentUser);
    render(gameState);

    // Prompt browser camera on start for live eye-tracking
    startBrowserCameraTracking();

    // Background poll for server sync if available
    setInterval(pollServer, 1000);
  });
})();
