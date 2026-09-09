const jwt = require("jsonwebtoken");
const { get } = require("../db/db");

const JWT_SECRET = process.env.JWT_SECRET || "delulu_hunt_super_secret_jwt_key_2026";
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || "delulu_admin_super_secret_jwt_key_2026";

async function authTeam(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Access denied. Please log in with your team account." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const team = await get(
      "SELECT id, team_name, leader_name, email, credits_remaining, current_round_index, started, last_cleared_at FROM teams WHERE id = ?",
      [decoded.teamId]
    );

    if (!team) {
      return res.status(401).json({ error: "Team account not found. Please log in again." });
    }

    req.team = team;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired session. Please log in again." });
  }
}

async function authAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized. Organizer credentials required." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, ADMIN_JWT_SECRET);

    const admin = await get("SELECT id, email, name FROM admin_users WHERE id = ?", [decoded.adminId]);
    if (!admin) {
      return res.status(401).json({ error: "Organizer account not found." });
    }

    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired organizer token." });
  }
}

module.exports = {
  JWT_SECRET,
  ADMIN_JWT_SECRET,
  authTeam,
  authAdmin,
};
