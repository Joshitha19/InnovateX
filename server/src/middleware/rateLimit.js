const rateLimit = require("express-rate-limit");

const submitLimiter = rateLimit({
  windowMs: 30 * 1000, // 30 seconds
  max: 6, // max 6 attempts per window
  message: {
    error: "Slow down! Rate limit exceeded. Please wait 30 seconds before submitting another answer."
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Key by team ID if authenticated, else IP
    return req.team ? `team_${req.team.id}` : req.ip;
  }
});

module.exports = {
  submitLimiter,
};
