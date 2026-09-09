const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { get, run } = require("../db/db");
const { JWT_SECRET, ADMIN_JWT_SECRET, authTeam } = require("../middleware/auth");

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { team_name, leader_name, email, password } = req.body;

    if (!team_name || !leader_name || !email || !password) {
      return res.status(400).json({ error: "All fields are required (team name, leader name, email, password)." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await get("SELECT id FROM teams WHERE email = ?", [cleanEmail]);
    if (existing) {
      return res.status(409).json({ error: "An account with this email address already exists. Please log in." });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const teamId = "team_" + crypto.randomBytes(6).toString("hex");
    const createdAt = new Date().toISOString();

    await run(
      `INSERT INTO teams (id, team_name, leader_name, email, password_hash, credits_remaining, current_round_index, started, created_at)
       VALUES (?, ?, ?, ?, ?, 100, 1, 0, ?)`,
      [teamId, team_name.trim(), leader_name.trim(), cleanEmail, passwordHash, createdAt]
    );

    const token = jwt.sign({ teamId }, JWT_SECRET, { expiresIn: "7d" });

    const team = {
      id: teamId,
      team_name: team_name.trim(),
      leader_name: leader_name.trim(),
      email: cleanEmail,
      credits_remaining: 100,
      current_round_index: 1,
      started: 0,
    };

    return res.status(201).json({
      message: "Team registered successfully! Welcome to DELULU HUNT.",
      token,
      team,
    });
  } catch (err) {
    console.error("[Auth Register Error]:", err);
    return res.status(500).json({ error: "Registration failed due to a server error. Please try again." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Please provide both email and password." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const team = await get("SELECT * FROM teams WHERE email = ?", [cleanEmail]);

    if (!team) {
      return res.status(401).json({ error: "No team account found with this email. Please check spelling or register." });
    }

    const isMatch = await bcrypt.compare(password, team.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "Incorrect password. Please try again." });
    }

    const token = jwt.sign({ teamId: team.id }, JWT_SECRET, { expiresIn: "7d" });

    const safeTeam = {
      id: team.id,
      team_name: team.team_name,
      leader_name: team.leader_name,
      email: team.email,
      credits_remaining: team.credits_remaining,
      current_round_index: team.current_round_index,
      started: team.started,
      last_cleared_at: team.last_cleared_at,
    };

    return res.json({
      message: "Login successful.",
      token,
      team: safeTeam,
    });
  } catch (err) {
    console.error("[Auth Login Error]:", err);
    return res.status(500).json({ error: "Login failed due to a server error." });
  }
});

// GET /api/auth/me
router.get("/me", authTeam, async (req, res) => {
  return res.json({ team: req.team });
});

// POST /api/auth/admin-login
router.post("/admin-login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required." });
    }

    const admin = await get("SELECT * FROM admin_users WHERE email = ?", [email.trim().toLowerCase()]);
    if (!admin) {
      return res.status(401).json({ error: "Invalid organizer credentials." });
    }

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid organizer credentials." });
    }

    const token = jwt.sign({ adminId: admin.id }, ADMIN_JWT_SECRET, { expiresIn: "2d" });

    return res.json({
      message: "Organizer authentication successful.",
      token,
      admin: { id: admin.id, email: admin.email, name: admin.name },
    });
  } catch (err) {
    console.error("[Admin Login Error]:", err);
    return res.status(500).json({ error: "Organizer login failed." });
  }
});

module.exports = router;
