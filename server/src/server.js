const express = require("express");
const http = require("http");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");
const { Server } = require("socket.io");

dotenv.config();

const { initDb } = require("./db/seed");
const { initSocket } = require("./sockets/leaderboardSocket");

const authRoutes = require("./routes/auth");
const teamRoutes = require("./routes/team");
const roundsRoutes = require("./routes/rounds");
const leaderboardRoutes = require("./routes/leaderboard");
const adminRoutes = require("./routes/admin");

const app = express();
const server = http.createServer(app);

// CORS configuration for local development and deployed origins
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  process.env.CLIENT_ORIGIN,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive for competition event
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.io initialization
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
initSocket(io);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/rounds", roundsRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/admin", adminRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "DELULU HUNT — Round 2 InnovateX",
    timestamp: new Date().toISOString(),
  });
});

// Serve frontend in production if client/dist exists
const clientDistPath = path.join(__dirname, "../../client/dist");
app.use(express.static(clientDistPath));

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return next();
  }
  const indexHtml = path.join(clientDistPath, "index.html");
  res.sendFile(indexHtml, (err) => {
    if (err) {
      res.status(200).send("DELULU HUNT API is active. Frontend build not present at static path.");
    }
  });
});

const PORT = process.env.PORT || 5000;

initDb().then(() => {
  server.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`⚡ DELULU HUNT Server Running on Port ${PORT}`);
    console.log(`⚡ WebSocket & Live Leaderboard Ready`);
    console.log(`=========================================`);
  });
}).catch((err) => {
  console.error("FATAL: Failed to initialize database:", err);
});

module.exports = { app, server };
