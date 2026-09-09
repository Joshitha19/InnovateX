const express = require("express");
const router = express.Router();
const { getLeaderboardData } = require("../sockets/leaderboardSocket");

// GET /api/leaderboard (public endpoint, no login needed)
router.get("/", async (req, res) => {
  try {
    const data = await getLeaderboardData();
    return res.json({
      timestamp: new Date().toISOString(),
      total_teams: data.length,
      leaderboard: data,
    });
  } catch (err) {
    console.error("[Leaderboard API Error]:", err);
    return res.status(500).json({ error: "Failed to fetch live leaderboard data." });
  }
});

module.exports = router;
