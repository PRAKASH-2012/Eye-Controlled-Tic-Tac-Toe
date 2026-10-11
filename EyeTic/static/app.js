// EyeTic Client Controller
(function() {
  'use strict';

  // State cache
  let lastState = null;
  let currentUser = null;
  let audioEnabled = true;
  let keyboardSelectedCell = 4;
  let audioCtx = null;
  let activeLeaderboardFilter = 'all';
  let selectedModalAvatar = '👁️';
  let toastTimer = null;

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

  // DOM Elements
  const boardEl = document.getElementById('board');
  const cells = Array.from(document.querySelectorAll('.cell'));
  const turnBanner = document.getElementById('turnBanner');
  const turnTitle = document.getElementById('turnText');
  const turnSubtitle = document.getElementById('turnSubtitle');
  const cameraStatusPill = document.getElementById('cameraStatusPill');
  const cameraStatusText = document.getElementById('cameraStatusText');
  const videoFeed = document.getElementById('videoFeed');
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

  // API Call Helpers
  async function fetchState() {
    try {
      const res = await fetch('/api/state');
      if (!res.ok) return;
      const data = await res.json();
      render(data);
    } catch (e) {
      setCameraStatus('offline');
    }
  }

  async function postMove(cellIdx) {
    initAudio();
    try {
      const res = await fetch('/api/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cell: cellIdx })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.state) render(data.state);
      }
    } catch (e) {}
  }

  async function postReset() {
    initAudio();
    playTone(480, 0.08, 'sine', 0.15);
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.state) render(data.state);
      }
    } catch (e) {}
  }

  async function postSettings(patch) {
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch)
      });
    } catch (e) {}
  }

  async function postResetStats() {
    try {
      const res = await fetch('/api/reset_stats', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.stats) updateStatsUI(data.stats);
      }
    } catch (e) {}
  }

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

  // Update User Profile Header & Widget
  function updateUserUI(user) {
    currentUser = user;
    if (user) {
      userAvatarIcon.textContent = user.avatar || '👁️';
      userPillText.textContent = user.username;
      userPointsBadge.textContent = `${user.stats?.points || 0} PTS`;
      userPointsBadge.classList.remove('hidden');

      // Update sidebar quick stats
      userQuickStats.classList.remove('hidden');
      userQsPoints.textContent = `${user.stats?.points || 0} PTS`;
      userQsWinRate.textContent = `${user.stats?.win_rate || 0}%`;

      // Profile modal elements
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

  // Main Render Loop
  function render(state) {
    const prev = lastState;
    lastState = state;

    // Sync user data if provided in state
    if (state.user) {
      updateUserUI(state.user);
    }

    // Camera & Eye Tracking Status
    if (state.face_detected) {
      setCameraStatus('locked');
    } else if (state.camera_ok) {
      setCameraStatus('camera_on');
    } else {
      setCameraStatus('offline');
    }

    // Telemetry & Gaze Overlay
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

    // Sound & Points Triggers on State Changes
    if (prev) {
      // Check if new mark was placed
      const prevXCount = prev.board.filter(m => m === 'X').length;
      const currXCount = state.board.filter(m => m === 'X').length;
      if (currXCount > prevXCount) playPlayerMoveSound();

      const prevOCount = prev.board.filter(m => m === 'O').length;
      const currOCount = state.board.filter(m => m === 'O').length;
      if (currOCount > prevOCount) playAiMoveSound();

      // Check if game just ended
      if (!prev.result && state.result) {
        if (state.result === 'X') {
          playWinSound();
          const diff = state.settings?.difficulty || 'Medium';
          const pts = diff === 'Hard' ? 35 : (diff === 'Easy' ? 15 : 25);
          showPointsToast(`+${pts} PTS EARNED!`, `Victory against ${diff} AI recorded`);
        } else if (state.result === 'O') {
          playLossSound();
          showPointsToast(`MATCH CONCLUDED`, `AI claimed the round. Rematch to climb!`);
        } else if (state.result === 'DRAW') {
          playDrawSound();
          showPointsToast(`+8 PTS (DRAW)`, `Hard fought stalemate recorded`);
        }
      }
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
    const circleCircumference = 339.292; // 2 * PI * 54

    cells.forEach((cell, idx) => {
      const mark = state.board[idx];
      const markSlot = cell.querySelector('.mark-slot');
      const dwellBar = cell.querySelector('.dwell-bar');

      // Update Mark
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

      // Winning cell glow
      if (winningCombo && winningCombo.includes(idx)) {
        cell.classList.add('win-cell');
      } else {
        cell.classList.remove('win-cell');
      }

      // Dwell progress circle
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

    // Scoreboard
    if (state.stats) {
      updateStatsUI(state.stats);
    }

    // Difficulty and Dwell Settings UI Sync
    if (state.settings) {
      diffBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.diff === state.settings.difficulty);
      });
      if (document.activeElement !== dwellSlider) {
        dwellSlider.value = state.settings.dwell || 1.2;
        dwellValDisplay.textContent = `${Number(dwellSlider.value).toFixed(1)}s`;
      }
      previewToggle.checked = state.settings.preview !== false;
      videoFeed.style.display = previewToggle.checked ? 'block' : 'none';
      if (!previewToggle.checked) videoFallback.classList.remove('hidden');
    }
  }

  function getWinningCombo(board) {
    for (const [a, b, c] of WIN_COMBOS) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return [a, b, c];
      }
    }
    return null;
  }

  // Load Leaderboard Data for Modal
  async function fetchModalLeaderboard() {
    try {
      const res = await fetch(`/api/leaderboard?filter=${activeLeaderboardFilter}`);
      const data = await res.json();
      if (data.success && data.leaderboard) {
        renderModalLeaderboard(data.leaderboard);
      }
    } catch (e) {}
  }

  function renderModalLeaderboard(list) {
    const modalPodium = document.getElementById('modalPodium');
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

    // Mini Podium
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
    } else if (mp1) {
      mp1.style.display = 'none';
    }

    if (p2 && mp2) {
      mp2.style.display = 'flex';
      document.getElementById('mp2Avatar').textContent = p2.avatar || '⚡';
      document.getElementById('mp2Name').textContent = p2.username;
      document.getElementById('mp2Pts').textContent = `${p2.points} PTS`;
    } else if (mp2) {
      mp2.style.display = 'none';
    }

    if (p3 && mp3) {
      mp3.style.display = 'flex';
      document.getElementById('mp3Avatar').textContent = p3.avatar || '🦅';
      document.getElementById('mp3Name').textContent = p3.username;
      document.getElementById('mp3Pts').textContent = `${p3.points} PTS`;
    } else if (mp3) {
      mp3.style.display = 'none';
    }

    // Table rows
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

  // Event Listeners Setup
  function setupEvents() {
    // Cell Click
    cells.forEach(cell => {
      const idx = parseInt(cell.dataset.idx, 10);
      cell.addEventListener('click', () => {
        if (!lastState || lastState.result || lastState.board[idx] || lastState.turn !== 'X') return;
        postMove(idx);
      });
    });

    // New Game Button
    newRoundBtn.addEventListener('click', () => postReset());

    // Reset Stats Button
    resetStatsBtn.addEventListener('click', () => {
      if (confirm('Reset scoreboard match stats?')) postResetStats();
    });

    // Difficulty selection
    diffBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        initAudio();
        playTone(600, 0.05, 'sine', 0.1);
        diffBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        postSettings({ difficulty: btn.dataset.diff });
      });
    });

    // Dwell Duration Slider
    dwellSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      dwellValDisplay.textContent = `${val.toFixed(1)}s`;
    });
    dwellSlider.addEventListener('change', (e) => {
      const val = parseFloat(e.target.value);
      postSettings({ dwell: val });
    });

    // Preview Toggle in Settings
    previewToggle.addEventListener('change', (e) => {
      const checked = e.target.checked;
      videoFeed.style.display = checked ? 'block' : 'none';
      videoFallback.classList.toggle('hidden', checked);
      postSettings({ preview: checked });
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
      await fetch('/api/auth/logout', { method: 'POST' });
      profileModal.classList.add('hidden');
      updateUserUI(null);
      showPointsToast('Signed Out', 'You are now playing as Guest');
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
          authModal.classList.add('hidden');
          showPointsToast(`Welcome back, ${data.user.username}!`, `Leaderboard synced • ${data.user.stats?.points || 0} PTS`);
        } else {
          showAuthAlert(data.error || 'Login failed.');
        }
      } catch (err) {
        showAuthAlert('Network error connecting to server.');
      }
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
          authModal.classList.add('hidden');
          showPointsToast(`Account Created!`, `Welcome to EyeTic, ${data.user.username}!`);
        } else {
          showAuthAlert(data.error || 'Registration failed.');
        }
      } catch (err) {
        showAuthAlert('Network error connecting to server.');
      }
    });

    // Guide and Settings Modals
    howBtn.addEventListener('click', () => guideModal.classList.remove('hidden'));
    closeGuideBtn.addEventListener('click', () => guideModal.classList.add('hidden'));
    gotItBtn.addEventListener('click', () => guideModal.classList.add('hidden'));

    settingsBtn.addEventListener('click', () => settingsModal.classList.remove('hidden'));
    closeSettingsBtn.addEventListener('click', () => settingsModal.classList.add('hidden'));
    saveSettingsBtn.addEventListener('click', () => settingsModal.classList.add('hidden'));

    // Camera Access Modal
    async function requestBrowserCameraPermission() {
      initAudio();
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        camPermModal.classList.add('hidden');
        videoFallback.classList.add('hidden');
        videoFeed.src = '/video_feed?t=' + Date.now();
        playTone(750, 0.15, 'sine', 0.2);
      } catch (err) {
        camPermModal.classList.remove('hidden');
        playTone(280, 0.2, 'sawtooth', 0.2);
      }
    }

    if (requestBrowserCamBtn) requestBrowserCamBtn.addEventListener('click', requestBrowserCameraPermission);
    if (testCamModalBtn) testCamModalBtn.addEventListener('click', requestBrowserCameraPermission);
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
        if (lastState && lastState.result) {
          postReset();
          e.preventDefault();
          return;
        }
        if (lastState && lastState.turn === 'X' && !lastState.board[keyboardSelectedCell]) {
          postMove(keyboardSelectedCell);
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

  // Periodic Polling Loop (every 40ms for ~25 FPS real-time sync)
  function startSync() {
    fetchState();
    setInterval(fetchState, 40);
  }

  // Check logged-in user on boot
  async function initAuthCheck() {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.authenticated && data.user) {
        updateUserUI(data.user);
      }
    } catch (e) {}
  }

  // Init
  document.addEventListener('DOMContentLoaded', () => {
    setupEvents();
    initAuthCheck();
    startSync();
  });
})();
