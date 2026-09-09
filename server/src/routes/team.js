const express = require("express");
const router = express.Router();
const { get, query, run } = require("../db/db");
const { authTeam } = require("../middleware/auth");
const { broadcastLeaderboard } = require("../sockets/leaderboardSocket");

// GET /api/team/dashboard
router.get("/dashboard", authTeam, async (req, res) => {
  try {
    const team = await get("SELECT * FROM teams WHERE id = ?", [req.team.id]);
    if (!team) {
      return res.status(404).json({ error: "Team not found." });
    }

    const rounds = await query("SELECT index_num, name, clue_cost FROM rounds ORDER BY index_num ASC");
    const progressList = await query("SELECT * FROM round_progress WHERE team_id = ?", [team.id]);

    const progressMap = {};
    progressList.forEach((p) => {
      progressMap[p.round_index] = p;
    });

    // Build redacted stage cards
    const stages = rounds.map((r) => {
      const p = progressMap[r.index_num];
      const isCompleted = p && Boolean(p.completed);
      const isCurrent = Boolean(team.started) && team.current_round_index === r.index_num && !isCompleted;
      const isLocked = !Boolean(team.started) || (!isCompleted && !isCurrent && r.index_num > team.current_round_index);

      let status = "locked";
      if (isCompleted) status = "completed";
      else if (isCurrent) status = "active";

      return {
        round_index: r.index_num,
        name: isLocked ? "???" : r.name,
        status, // 'locked' | 'active' | 'completed'
        clue_cost: r.clue_cost,
        clue_unlocked: p ? Boolean(p.clue_unlocked) : false,
        hints_unlocked: p ? p.hints_unlocked : 0,
        completed_at: p ? p.completed_at : null,
      };
    });

    return res.json({
      team: {
        id: team.id,
        team_name: team.team_name,
        leader_name: team.leader_name,
        credits_remaining: team.credits_remaining,
        current_round_index: team.current_round_index,
        started: Boolean(team.started),
      },
      stages,
    });
  } catch (err) {
    console.error("[Dashboard Error]:", err);
    return res.status(500).json({ error: "Failed to load dashboard data." });
  }
});

// POST /api/team/start
router.post("/start", authTeam, async (req, res) => {
  try {
    const team = await get("SELECT * FROM teams WHERE id = ?", [req.team.id]);
    if (team.started) {
      return res.json({ message: "Event already started.", started: true });
    }

    await run("UPDATE teams SET started = 1, current_round_index = 1 WHERE id = ?", [team.id]);

    // Ensure round_progress row for round 1 exists
    const existing = await get("SELECT id FROM round_progress WHERE team_id = ? AND round_index = 1", [team.id]);
    if (!existing) {
      const pid = `prog_${team.id}_1`;
      await run(
        "INSERT INTO round_progress (id, team_id, round_index, clue_unlocked, hints_unlocked, completed, credits_spent) VALUES (?, ?, 1, 0, 0, 0, 0)",
        [pid, team.id]
      );
    }

    broadcastLeaderboard();

    return res.json({
      message: "Event started! Stage 1 is now unlocked.",
      started: true,
      current_round_index: 1,
    });
  } catch (err) {
    console.error("[Start Event Error]:", err);
    return res.status(500).json({ error: "Failed to start event." });
  }
});

module.exports = router;
