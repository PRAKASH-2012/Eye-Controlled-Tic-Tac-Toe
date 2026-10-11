// Vercel Serverless Catch-all API Handler for EyeTic (/api/*)
const users = new Map();
let serverStats = { wins: 0, losses: 0, draws: 0 };
let serverSettings = { difficulty: 'Easy', dwell: 1.15, preview: true };

// Pre-seeded champions
const seedLeaderboard = [
  { username: "CyberHawk", avatar: "🦅", points: 1250, wins: 48, losses: 8, draws: 4, win_rate: 80.0, matches: 60, hard_wins: 18 },
  { username: "IrisMaster", avatar: "⚡", points: 980, wins: 36, losses: 9, draws: 5, win_rate: 72.0, matches: 50, hard_wins: 12 },
  { username: "GazeGod", avatar: "👁️", points: 840, wins: 30, losses: 10, draws: 6, win_rate: 65.2, matches: 46, hard_wins: 9 },
  { username: "NeoVision", avatar: "🤖", points: 620, wins: 22, losses: 8, draws: 5, win_rate: 62.9, matches: 35, hard_wins: 5 },
  { username: "QuantumSeer", avatar: "🔮", points: 490, wins: 18, losses: 11, draws: 4, win_rate: 54.5, matches: 33, hard_wins: 3 }
];

seedLeaderboard.forEach(u => {
  users.set(u.username.toLowerCase(), {
    username: u.username,
    password: "demo-password-hash",
    avatar: u.avatar,
    created_at: new Date().toISOString(),
    stats: {
      wins: u.wins,
      losses: u.losses,
      draws: u.draws,
      points: u.points,
      matches: u.matches,
      hard_wins: u.hard_wins,
      streak: 3
    }
  });
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-username');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname.replace(/\/+$/, '');

  let body = req.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }

  // 1. Leaderboard
  if (pathname.endsWith('/leaderboard') && req.method === 'GET') {
    const filter = url.searchParams.get('filter') || 'all';
    const list = Array.from(users.values()).map(u => {
      const s = u.stats || {};
      const matches = (s.wins || 0) + (s.losses || 0) + (s.draws || 0);
      const winRate = matches > 0 ? Math.round((s.wins / matches) * 1000) / 10 : 0.0;
      return {
        username: u.username,
        avatar: u.avatar || '👁️',
        points: s.points || 0,
        wins: s.wins || 0,
        losses: s.losses || 0,
        draws: s.draws || 0,
        matches,
        win_rate: winRate,
        hard_wins: s.hard_wins || 0,
        streak: s.streak || 0
      };
    });

    if (filter === 'top') {
      list.sort((a, b) => b.points - a.points);
    } else if (filter === 'winrate') {
      list.sort((a, b) => (b.win_rate - a.win_rate) || (b.points - a.points));
    } else if (filter === 'hard') {
      list.sort((a, b) => (b.hard_wins - a.hard_wins) || (b.points - a.points));
    } else {
      list.sort((a, b) => b.points - a.points);
    }

    const ranked = list.map((item, idx) => ({ ...item, rank: idx + 1 }));
    return res.status(200).json({ success: true, leaderboard: ranked });
  }

  // 2. Auth: Register
  if (pathname.endsWith('/auth/register') && req.method === 'POST') {
    const { username, password, avatar } = body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password required.' });
    }
    const cleanUser = username.trim();
    if (cleanUser.length < 3) {
      return res.status(400).json({ success: false, error: 'Username must be at least 3 characters.' });
    }
    const key = cleanUser.toLowerCase();
    if (users.has(key)) {
      return res.status(400).json({ success: false, error: 'Username is already taken.' });
    }
    const newUser = {
      username: cleanUser,
      password,
      avatar: avatar || '👁️',
      created_at: new Date().toISOString(),
      stats: { wins: 0, losses: 0, draws: 0, points: 100, matches: 0, hard_wins: 0, streak: 0 }
    };
    users.set(key, newUser);
    return res.status(200).json({
      success: true,
      user: { username: newUser.username, avatar: newUser.avatar, stats: newUser.stats }
    });
  }

  // 3. Auth: Login
  if (pathname.endsWith('/auth/login') && req.method === 'POST') {
    const { username, password } = body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password required.' });
    }
    const key = username.trim().toLowerCase();
    const existing = users.get(key);
    if (!existing || existing.password !== password) {
      return res.status(400).json({ success: false, error: 'Invalid username or password.' });
    }
    return res.status(200).json({
      success: true,
      user: { username: existing.username, avatar: existing.avatar, stats: existing.stats }
    });
  }

  // 4. Auth: Me
  if (pathname.endsWith('/auth/me')) {
    const username = req.headers['x-username'];
    if (username && users.has(username.toLowerCase())) {
      const u = users.get(username.toLowerCase());
      return res.status(200).json({
        authenticated: true,
        user: { username: u.username, avatar: u.avatar, stats: u.stats }
      });
    }
    return res.status(200).json({ authenticated: false, user: null });
  }

  // 5. Auth: Logout
  if (pathname.endsWith('/auth/logout')) {
    return res.status(200).json({ success: true });
  }

  // 6. Settings
  if (pathname.endsWith('/settings')) {
    if (req.method === 'POST') {
      if (body.difficulty) serverSettings.difficulty = body.difficulty;
      if (body.dwell !== undefined) serverSettings.dwell = parseFloat(body.dwell);
      if (body.preview !== undefined) serverSettings.preview = Boolean(body.preview);
    }
    return res.status(200).json({ success: true, settings: serverSettings });
  }

  // 7. Reset Stats
  if (pathname.endsWith('/reset_stats')) {
    serverStats = { wins: 0, losses: 0, draws: 0 };
    return res.status(200).json({ success: true, stats: serverStats });
  }

  // 8. State
  if (pathname.endsWith('/state')) {
    return res.status(200).json({
      board: Array(9).fill(''),
      turn: 'X',
      result: null,
      selected_cell: null,
      dwell_progress: 0.0,
      gaze_point: [0.5, 0.5],
      camera_ok: false,
      face_detected: false,
      stats: serverStats,
      settings: serverSettings,
      user: null,
      last_match_summary: null
    });
  }

  return res.status(200).json({ status: "EyeTic API online", timestamp: new Date().toISOString() });
};
