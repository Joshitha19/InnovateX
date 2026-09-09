const API_BASE = import.meta.env.VITE_API_BASE || (
  typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1"
    ? "" // Same origin for production / Vercel rewrites / Render
    : "http://localhost:5000"
);

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const token = localStorage.getItem("delulu_token");
  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const adminToken = localStorage.getItem("delulu_admin_token");
  if (adminToken && options.isAdmin) {
    headers["Authorization"] = `Bearer ${adminToken}`;
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Request failed with status ${res.status}`);
    }
    return data;
  } catch (err) {
    throw err;
  }
}

export const api = {
  // Auth
  register: (payload) => request("/api/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) => request("/api/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  getMe: () => request("/api/auth/me"),
  adminLogin: (payload) => request("/api/auth/admin-login", { method: "POST", body: JSON.stringify(payload) }),

  // Team & Dashboard
  getDashboard: () => request("/api/team/dashboard"),
  startEvent: () => request("/api/team/start", { method: "POST" }),

  // Rounds
  getRound: (index) => request(`/api/rounds/${index}`),
  unlockClue: (index) => request(`/api/rounds/${index}/unlock-clue`, { method: "POST" }),
  unlockHint: (index) => request(`/api/rounds/${index}/unlock-hint`, { method: "POST" }),
  submitAnswer: (index, answer) => request(`/api/rounds/${index}/submit`, { method: "POST", body: JSON.stringify({ answer }) }),

  // Leaderboard
  getLeaderboard: () => request("/api/leaderboard"),

  // Admin
  getAdminOverview: () => request("/api/admin/overview", { isAdmin: true }),
  updateRound: (index, payload) => request(`/api/admin/rounds/${index}`, { method: "PUT", body: JSON.stringify(payload), isAdmin: true }),
  adjustCredits: (payload) => request("/api/admin/adjust-credits", { method: "POST", body: JSON.stringify(payload), isAdmin: true }),
  resetEvent: (confirmation) => request("/api/admin/reset-event", { method: "POST", body: JSON.stringify({ confirmation }), isAdmin: true }),
};
