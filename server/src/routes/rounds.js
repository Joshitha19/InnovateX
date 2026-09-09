const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const { get, run, query } = require("../db/db");
const { authTeam } = require("../middleware/auth");
const { submitLimiter } = require("../middleware/rateLimit");
const { broadcastLeaderboard } = require("../sockets/leaderboardSocket");

// Helper to ensure round progress record exists
async function getOrCreateProgress(teamId, roundIndex) {
  let prog = await get(
    "SELECT * FROM round_progress WHERE team_id = ? AND round_index = ?",
    [teamId, roundIndex]
  );
  if (!prog) {
    const id = `prog_${teamId}_${roundIndex}`;
    await run(
      `INSERT INTO round_progress (id, team_id, round_index, clue_unlocked, hints_unlocked, completed, credits_spent)
       VALUES (?, ?, ?, 0, 0, 0, 0)`,
      [id, teamId, roundIndex]
    );
    prog = await get("SELECT * FROM round_progress WHERE id = ?", [id]);
  }
  return prog;
}

// GET /api/rounds/:index
router.get("/:index", authTeam, async (req, res) => {
  try {
    const roundIndex = parseInt(req.params.index, 10);
    const team = await get("SELECT * FROM teams WHERE id = ?", [req.team.id]);

    if (!team.started) {
      return res.status(403).json({ error: "The challenge event has not started yet. Click 'Start Challenge' on the dashboard." });
    }

    if (roundIndex > team.current_round_index) {
      return res.status(403).json({ error: "Access Denied: This stage is currently locked. Complete previous stages first." });
    }

    const round = await get("SELECT * FROM rounds WHERE index_num = ?", [roundIndex]);
    if (!round) {
      return res.status(404).json({ error: "Stage not found." });
    }

    const prog = await getOrCreateProgress(team.id, roundIndex);
    const allHints = JSON.parse(round.hints_json || "[]");
    const allAssets = JSON.parse(round.assets_json || "[]");

    // CRITICAL SECURITY: Never send round.answer to client
    const responseData = {
      round_index: round.index_num,
      name: round.name,
      brief: round.brief,
      clue_cost: round.clue_cost,
      hint_cost: round.hint_cost,
      clue_unlocked: Boolean(prog.clue_unlocked),
      clue_text: prog.clue_unlocked ? round.clue_text : null,
      hints_unlocked_count: prog.hints_unlocked,
      total_hints_available: allHints.length,
      unlocked_hints: allHints.slice(0, prog.hints_unlocked),
      assets: prog.clue_unlocked ? allAssets : [],
      completed: Boolean(prog.completed),
      completed_at: prog.completed_at,
      team_credits: team.credits_remaining,
    };

    return res.json(responseData);
  } catch (err) {
    console.error("[Get Round Error]:", err);
    return res.status(500).json({ error: "Failed to retrieve round data." });
  }
});

// POST /api/rounds/:index/unlock-clue
router.post("/:index/unlock-clue", authTeam, async (req, res) => {
  try {
    const roundIndex = parseInt(req.params.index, 10);
    const team = await get("SELECT * FROM teams WHERE id = ?", [req.team.id]);

    if (!team.started || roundIndex > team.current_round_index) {
      return res.status(403).json({ error: "Cannot unlock clue for a locked stage." });
    }

    const round = await get("SELECT * FROM rounds WHERE index_num = ?", [roundIndex]);
    if (!round) {
      return res.status(404).json({ error: "Stage not found." });
    }

    const prog = await getOrCreateProgress(team.id, roundIndex);

    // If already unlocked, return clue text for free
    if (prog.clue_unlocked) {
      return res.json({
        message: "Clue already unlocked.",
        clue_text: round.clue_text,
        assets: JSON.parse(round.assets_json || "[]"),
        credits_remaining: team.credits_remaining,
      });
    }

    const cost = round.clue_cost;

    // ATOMIC CREDIT DEDUCTION: Guarantees no race condition or double spending
    const deductRes = await run(
      "UPDATE teams SET credits_remaining = credits_remaining - ? WHERE id = ? AND credits_remaining >= ?",
      [cost, team.id, cost]
    );

    const affected = deductRes.changes !== undefined ? deductRes.changes : deductRes.rowCount;
    if (!affected || affected === 0) {
      return res.status(400).json({
        error: `Insufficient credits! You need ${cost} credits to unlock this clue, but only have ${team.credits_remaining} credits.`,
      });
    }

    // Update round progress
    await run(
      "UPDATE round_progress SET clue_unlocked = 1, credits_spent = credits_spent + ? WHERE id = ?",
      [cost, prog.id]
    );

    const updatedTeam = await get("SELECT credits_remaining FROM teams WHERE id = ?", [team.id]);
    broadcastLeaderboard();

    return res.json({
      message: `Clue unlocked successfully! Deducted ${cost} credits.`,
      clue_text: round.clue_text,
      assets: JSON.parse(round.assets_json || "[]"),
      credits_remaining: updatedTeam.credits_remaining,
    });
  } catch (err) {
    console.error("[Unlock Clue Error]:", err);
    return res.status(500).json({ error: "Error unlocking clue." });
  }
});

// POST /api/rounds/:index/unlock-hint
router.post("/:index/unlock-hint", authTeam, async (req, res) => {
  try {
    const roundIndex = parseInt(req.params.index, 10);
    const team = await get("SELECT * FROM teams WHERE id = ?", [req.team.id]);

    if (!team.started || roundIndex > team.current_round_index) {
      return res.status(403).json({ error: "Cannot unlock hints for a locked stage." });
    }

    const round = await get("SELECT * FROM rounds WHERE index_num = ?", [roundIndex]);
    if (!round) {
      return res.status(404).json({ error: "Stage not found." });
    }

    const prog = await getOrCreateProgress(team.id, roundIndex);
    const allHints = JSON.parse(round.hints_json || "[]");

    if (prog.hints_unlocked >= allHints.length) {
      return res.status(400).json({ error: "All available hints have already been unlocked for this round." });
    }

    const cost = round.hint_cost || 5;

    // ATOMIC CREDIT DEDUCTION
    const deductRes = await run(
      "UPDATE teams SET credits_remaining = credits_remaining - ? WHERE id = ? AND credits_remaining >= ?",
      [cost, team.id, cost]
    );

    const affected = deductRes.changes !== undefined ? deductRes.changes : deductRes.rowCount;
    if (!affected || affected === 0) {
      return res.status(400).json({
        error: `Insufficient credits! You need ${cost} credits for an extra hint, but only have ${team.credits_remaining} credits.`,
      });
    }

    const newHintIndex = prog.hints_unlocked + 1;
    await run(
      "UPDATE round_progress SET hints_unlocked = ?, credits_spent = credits_spent + ? WHERE id = ?",
      [newHintIndex, cost, prog.id]
    );

    const updatedTeam = await get("SELECT credits_remaining FROM teams WHERE id = ?", [team.id]);
    broadcastLeaderboard();

    return res.json({
      message: `Extra hint unlocked! Deducted ${cost} credits.`,
      new_hint: allHints[newHintIndex - 1],
      unlocked_hints: allHints.slice(0, newHintIndex),
      hints_unlocked_count: newHintIndex,
      credits_remaining: updatedTeam.credits_remaining,
    });
  } catch (err) {
    console.error("[Unlock Hint Error]:", err);
    return res.status(500).json({ error: "Error unlocking extra hint." });
  }
});

// POST /api/rounds/:index/submit
router.post("/:index/submit", authTeam, submitLimiter, async (req, res) => {
  try {
    const roundIndex = parseInt(req.params.index, 10);
    const { answer } = req.body;

    if (!answer || typeof answer !== "string" || !answer.trim()) {
      return res.status(400).json({ error: "Please enter your answer before submitting." });
    }

    const team = await get("SELECT * FROM teams WHERE id = ?", [req.team.id]);

    if (!team.started || roundIndex !== team.current_round_index) {
      return res.status(403).json({ error: "You can only submit answers for your current active stage." });
    }

    const round = await get("SELECT * FROM rounds WHERE index_num = ?", [roundIndex]);
    if (!round) {
      return res.status(404).json({ error: "Stage not found." });
    }

    const prog = await getOrCreateProgress(team.id, roundIndex);
    if (prog.completed) {
      return res.json({ correct: true, message: "Stage already completed!" });
    }

    // SERVER-SIDE VALIDATION ONLY
    // Normalized comparison
    const submittedNorm = answer.trim().replace(/\s+/g, " ");
    const correctNorm = round.answer.trim().replace(/\s+/g, " ");

    const isCorrect = (
      submittedNorm.toLowerCase() === correctNorm.toLowerCase() ||
      submittedNorm === correctNorm
    );

    // Record submission log
    const subLogId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await run(
      `INSERT INTO submission_logs (id, team_id, round_index, answer_submitted, is_correct, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [subLogId, team.id, roundIndex, submittedNorm.substring(0, 300), isCorrect ? 1 : 0, new Date().toISOString()]
    );

    if (!isCorrect) {
      return res.json({
        correct: false,
        message: "Not quite, try again. Review your logic or check clues if needed."
      });
    }

    // Mark current round complete
    const nowIso = new Date().toISOString();
    await run(
      "UPDATE round_progress SET completed = 1, completed_at = ? WHERE id = ?",
      [nowIso, prog.id]
    );

    // Advance team stage
    const nextRoundIndex = roundIndex + 1;
    await run(
      "UPDATE teams SET current_round_index = ?, last_cleared_at = ? WHERE id = ?",
      [nextRoundIndex, nowIso, team.id]
    );

    // If next stage <= 6, initialize next stage progress record
    if (nextRoundIndex <= 6) {
      await getOrCreateProgress(team.id, nextRoundIndex);
    }

    broadcastLeaderboard();

    return res.json({
      correct: true,
      message: roundIndex === 6 
        ? "CONGRATULATIONS! Your team has cleared all 6 stages of DELULU HUNT!"
        : `STAGE 0${roundIndex} CLEARED! Stage 0${nextRoundIndex} is now unlocked.`,
      next_round_index: nextRoundIndex,
      is_all_completed: roundIndex >= 6,
    });
  } catch (err) {
    console.error("[Submit Answer Error]:", err);
    return res.status(500).json({ error: "Failed to verify answer." });
  }
});

// GET /api/rounds/:index/assets/:filename
router.get("/:index/assets/:filename", authTeam, async (req, res) => {
  try {
    const roundIndex = parseInt(req.params.index, 10);
    const { filename } = req.params;

    const prog = await get(
      "SELECT clue_unlocked FROM round_progress WHERE team_id = ? AND round_index = ?",
      [req.team.id, roundIndex]
    );

    if (!prog || !prog.clue_unlocked) {
      return res.status(403).json({
        error: "Access Denied: Material locked. You must unlock the round's main clue first to download or view associated assets."
      });
    }

    // Provide mock asset file or generate content
    const sanitizedName = path.basename(filename);
    const assetPath = path.join(__dirname, "../../public/assets", sanitizedName);

    if (fs.existsSync(assetPath)) {
      return res.sendFile(assetPath);
    }

    // If physical asset not in folder, deliver a dynamic payload descriptor
    return res.json({
      filename: sanitizedName,
      status: "unlocked",
      description: `Asset file [${sanitizedName}] verified for Stage 0${roundIndex}.`,
      checksum: "sha256:d31u1u_hunt_secure_checksum",
      note: "Present to your local stage proctor or inspect with appropriate tooling."
    });
  } catch (err) {
    console.error("[Asset Download Error]:", err);
    return res.status(500).json({ error: "Error fetching asset." });
  }
});

module.exports = router;
