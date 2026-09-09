# ⚡ DELULU HUNT — Round 2 InnovateX

> High-stakes, multiplayer challenge portal built for the InnovateX grand finale. Teams compete across 6 locked stages using a strategic credit and clue economy, server-side anti-cheat verification, and a live public leaderboard.

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Start Both Frontend & Backend Concurrently
```bash
npm run dev
```
* **Frontend (React + Vite)**: `http://localhost:5173`
* **Backend API & WebSockets (Express + Socket.io)**: `http://localhost:5000`
* **Local Database**: Embedded SQLite (`server/data/delulu_hunt.db`) auto-created and seeded with the 6 stages and admin account on startup.

---

## 🔒 Security Architecture (Zero-Leak Answer Protection)

* **Server-Side Verification Only**: Stage answers are never bundled into client HTML/JS or sent over API payloads.
* **Stage Cloaking**: Locked stages return `???` with no names or clues until previous answers are verified.
* **Atomic Credit Economy**:
  * Initial team balance: **100 Credits**
  * Clues and hints use database transaction locks to prevent double-spending race conditions.
  * Clue costs:
    * Stage 1 (Fix The Code): **10 CR**
    * Stage 2 (Crack The Message): **10 CR**
    * Stage 3 (Build Something Small): **15 CR**
    * Stage 4 (Use AI The Smart Way): **15 CR**
    * Stage 5 (Find The Hidden Clue): **20 CR**
    * Stage 6 (Final Challenge): **20 CR**
  * Extra hints: **5 CR** per sequential hint.
* **Anti-Brute Force**: Express rate-limiting on answer submissions (max 6 attempts per 30s per team).

---

## 🏆 Win & Leaderboard Logic

Public live leaderboard at `/leaderboard` (projector screen ready):
$$\text{Correct completion of all 6 rounds} \longrightarrow \text{Highest remaining credits} \longrightarrow \text{Earliest completion timestamp (tie-breaker)}$$

---

## 🛡️ Organizer / Admin Console

* **Route**: Click **Organizer** in the footer or navigate to `/admin`
* **Default Organizer Credentials**:
  * **Email**: `admin@innovatex.org`
  * **Password**: `delulu@2026`
* **Features**:
  * Live monitoring of all teams and their progress
  * Edit stage answers, briefs, clues, and costs without redeployment
  * Manual credit adjustments (+ / -) with audit logging
  * Event reset (`RESET_DELULU_HUNT`) for clean restarts

---

## 🌐 Production Deployment

### Option A: Vercel (1-Click)
1. Push repository to GitHub.
2. In Vercel, import `Joshitha19/InnovateX`.
3. Root Directory: leave as default (the included `vercel.json` automatically builds `client` into `client/dist`).
4. Set Environment Variables:
   * `DATABASE_URL`: Your PostgreSQL connection string (Supabase / Neon / Railway).
   * `JWT_SECRET`: Any random 32-character string.

### Option B: Render or Railway
1. Create a Web Service connected to your repository.
2. Build Command: `npm install && npm run build`
3. Start Command: `npm start`
4. Set `DATABASE_URL` (or let Render/Railway provision a PostgreSQL database).

---

*“Find your two — build your crew.”* — InnovateX
