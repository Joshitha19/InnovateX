const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const { get, query, run } = require("../db/db");
const { authAdmin } = require("../middleware/auth");
const { broadcastLeaderboard } = require("../sockets/leaderboardSocket");

// Helper to log admin actions
async function logAdminAction(adminEmail, action, details) {
  const logId = `log_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  await run(
    "INSERT INTO admin_logs (id, admin_email, action, details, created_at) VALUES (?, ?, ?, ?, ?)",
    [logId, adminEmail, action, typeof details === "object" ? JSON.stringify(details) : details, new Date().toISOString()]
  );
}

// GET /api/admin/overview
router.get("/overview", authAdmin, async (req, res) => {
  try {
    const teamsSql = `
      SELECT 
        t.id,
        t.team_name,
        t.leader_name,
        t.email,
        t.credits_remaining,
        t.current_round_index,
        t.started,
        t.last_cleared_at,
        t.created_at,
        (SELECT COUNT(*) FROM round_progress rp WHERE rp.team_id = t.id AND rp.completed = 1) as rounds_cleared
      FROM teams t
      ORDER BY rounds_cleared DESC, t.credits_remaining DESC, t.created_at ASC
    `;
    const teams = await query(teamsSql);

    const rounds = await query("SELECT * FROM rounds ORDER BY index_num ASC");
    const formattedRounds = rounds.map((r) => ({
      ...r,
      hints: JSON.parse(r.hints_json || "[]"),
      assets: JSON.parse(r.assets_json || "[]"),
    }));

    const recentSubmissions = await query(`
      SELECT 
        s.id, s.team_id, s.round_index, s.answer_submitted, s.is_correct, s.created_at,
        t.team_name
      FROM submission_logs s
      LEFT JOIN teams t ON s.team_id = t.id
      ORDER BY s.created_at DESC
      LIMIT 50
    `);

    const adminLogs = await query(`
      SELECT * FROM admin_logs ORDER BY created_at DESC LIMIT 30
    `);

    return res.json({
      admin: req.admin,
      stats: {
        total_teams: teams.length,
        active_teams: teams.filter((t) => t.started).length,
        total_cleared_stages: teams.reduce((acc, t) => acc + Number(t.rounds_cleared || 0), 0),
      },
      teams,
      rounds: formattedRounds,
      recent_submissions: recentSubmissions,
      admin_logs: adminLogs,
    });
  } catch (err) {
    console.error("[Admin Overview Error]:", err);
    return res.status(500).json({ error: "Failed to load admin overview." });
  }
});

// PUT /api/admin/rounds/:index
router.put("/rounds/:index", authAdmin, async (req, res) => {
  try {
    const indexNum = parseInt(req.params.index, 10);
    const { name, brief, clue_cost, clue_text, hint_cost, hints, answer, assets } = req.body;

    const round = await get("SELECT * FROM rounds WHERE index_num = ?", [indexNum]);
    if (!round) {
      return res.status(404).json({ error: "Round not found." });
    }

    const updatedName = name !== undefined ? name : round.name;
    const updatedBrief = brief !== undefined ? brief : round.brief;
    const updatedClueCost = clue_cost !== undefined ? parseInt(clue_cost, 10) : round.clue_cost;
    const updatedClueText = clue_text !== undefined ? clue_text : round.clue_text;
    const updatedHintCost = hint_cost !== undefined ? parseInt(hint_cost, 10) : round.hint_cost;
    const updatedHintsJson = hints !== undefined ? JSON.stringify(hints) : round.hints_json;
    const updatedAnswer = answer !== undefined ? answer.trim() : round.answer;
    const updatedAssetsJson = assets !== undefined ? JSON.stringify(assets) : round.assets_json;

    await run(
      `UPDATE rounds 
       SET name = ?, brief = ?, clue_cost = ?, clue_text = ?, hint_cost = ?, hints_json = ?, answer = ?, assets_json = ?
       WHERE index_num = ?`,
      [updatedName, updatedBrief, updatedClueCost, updatedClueText, updatedHintCost, updatedHintsJson, updatedAnswer, updatedAssetsJson, indexNum]
    );

    await logAdminAction(req.admin.email, "EDIT_ROUND", {
      round_index: indexNum,
      name: updatedName,
    });

    return res.json({ message: `Stage 0${indexNum} updated successfully!` });
  } catch (err) {
    console.error("[Admin Edit Round Error]:", err);
    return res.status(500).json({ error: "Failed to update round configuration." });
  }
});

// POST /api/admin/adjust-credits
router.post("/adjust-credits", authAdmin, async (req, res) => {
  try {
    const { team_id, amount, reason } = req.body;

    if (!team_id || amount === undefined || isNaN(amount)) {
      return res.status(400).json({ error: "Team ID and numerical credit amount are required." });
    }

    const team = await get("SELECT * FROM teams WHERE id = ?", [team_id]);
    if (!team) {
      return res.status(404).json({ error: "Team not found." });
    }

    const diff = parseInt(amount, 10);
    const newBalance = Math.max(0, team.credits_remaining + diff);

    await run("UPDATE teams SET credits_remaining = ? WHERE id = ?", [newBalance, team.id]);

    await logAdminAction(req.admin.email, "ADJUST_CREDITS", {
      team_id: team.id,
      team_name: team.team_name,
      adjustment: diff,
      old_balance: team.credits_remaining,
      new_balance: newBalance,
      reason: reason || "Dispute or manual organizer override",
    });

    broadcastLeaderboard();

    return res.json({
      message: `Updated credits for team ${team.team_name}. New balance: ${newBalance} CR`,
      new_balance: newBalance,
    });
  } catch (err) {
    console.error("[Admin Adjust Credits Error]:", err);
    return res.status(500).json({ error: "Failed to adjust credits." });
  }
});

// POST /api/admin/reset-event
router.post("/reset-event", authAdmin, async (req, res) => {
  try {
    const { confirmation } = req.body;

    if (confirmation !== "RESET_DELULU_HUNT") {
      return res.status(400).json({
        error: "Confirmation failed. You must provide the exact string 'RESET_DELULU_HUNT' to execute an event wipe."
      });
    }

    // Wipe team data, round progress, and logs
    await run("DELETE FROM submission_logs");
    await run("DELETE FROM round_progress");
    await run("DELETE FROM teams");

    await logAdminAction(req.admin.email, "RESET_EVENT", "Full event reset triggered. Teams and progress wiped.");

    broadcastLeaderboard();

    return res.json({
      message: "Event data has been completely reset. All teams, progress, and submissions cleared.",
    });
  } catch (err) {
    console.error("[Admin Reset Event Error]:", err);
    return res.status(500).json({ error: "Failed to reset event data." });
  }
});

module.exports = router;
