const { query } = require("../db/db");

let ioInstance = null;

function initSocket(io) {
  ioInstance = io;

  io.on("connection", (socket) => {
    // Send immediate leaderboard snapshot to new connection
    sendLeaderboardSnapshot(socket);

    socket.on("request_leaderboard", () => {
      sendLeaderboardSnapshot(socket);
    });
  });
}

async function getLeaderboardData() {
  const sql = `
    SELECT 
      t.id,
      t.team_name,
      t.leader_name,
      t.credits_remaining,
      t.current_round_index,
      t.last_cleared_at,
      (SELECT COUNT(*) FROM round_progress rp WHERE rp.team_id = t.id AND rp.completed = 1) as rounds_cleared
    FROM teams t
    ORDER BY 
      rounds_cleared DESC,
      t.credits_remaining DESC,
      CASE WHEN t.last_cleared_at IS NULL THEN 1 ELSE 0 END ASC,
      t.last_cleared_at ASC,
      t.created_at ASC
  `;

  const teams = await query(sql);

  return teams.map((team, idx) => ({
    rank: idx + 1,
    id: team.id,
    team_name: team.team_name,
    leader_name: team.leader_name,
    credits_remaining: team.credits_remaining,
    rounds_cleared: Number(team.rounds_cleared || 0),
    last_cleared_at: team.last_cleared_at,
  }));
}

async function sendLeaderboardSnapshot(socket) {
  try {
    const data = await getLeaderboardData();
    socket.emit("leaderboard_update", data);
  } catch (err) {
    console.error("[Socket] Error sending leaderboard snapshot:", err);
  }
}

async function broadcastLeaderboard() {
  if (!ioInstance) return;
  try {
    const data = await getLeaderboardData();
    ioInstance.emit("leaderboard_update", data);
  } catch (err) {
    console.error("[Socket] Error broadcasting leaderboard update:", err);
  }
}

module.exports = {
  initSocket,
  broadcastLeaderboard,
  getLeaderboardData,
};
