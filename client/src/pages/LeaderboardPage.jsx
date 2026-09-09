import React, { useState, useEffect } from "react";
import { 
  Trophy, 
  Zap, 
  Clock, 
  Medal, 
  CheckCircle2, 
  Maximize2, 
  Minimize2, 
  RefreshCw,
  Radio,
  Sparkles,
  Users
} from "lucide-react";
import { io } from "socket.io-client";
import { api } from "../api/client";

export default function LeaderboardPage({ onNavigate }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectorMode, setProjectorMode] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchHttpLeaderboard = async () => {
    try {
      const res = await api.getLeaderboard();
      setLeaderboard(res.leaderboard || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Leaderboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHttpLeaderboard();

    // Setup Socket.io realtime connection
    const socketUrl = import.meta.env.VITE_API_BASE || (
      typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1"
        ? window.location.origin
        : "http://localhost:5000"
    );

    let socket;
    try {
      socket = io(socketUrl, { transports: ["websocket", "polling"] });
      socket.on("leaderboard_update", (data) => {
        setLeaderboard(data);
        setLastUpdated(new Date());
      });
    } catch (e) {
      console.warn("WebSocket init error:", e);
    }

    // 5-second polling fallback (guarantees real-time updates even on serverless)
    const pollInterval = setInterval(fetchHttpLeaderboard, 5000);

    return () => {
      clearInterval(pollInterval);
      if (socket) socket.disconnect();
    };
  }, []);

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div className={`relative z-10 mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all ${
      projectorMode ? "max-w-[95%] text-lg" : "max-w-7xl"
    }`}>
      {/* Top Banner & Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-bold">
              LIVE BROADCAST FEED
            </span>
            <span className="text-xs font-mono text-slate-500">• GRIET HALL 1</span>
          </div>

          <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
            DELULU <span className="text-gradient-cyan">HUNT</span> LEADERBOARD
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[11px] font-mono text-slate-400 block">
              Last Synced: {lastUpdated.toLocaleTimeString()}
            </span>
            <span className="text-xs font-mono text-cyan-400">
              {leaderboard.length} Active Contenders
            </span>
          </div>

          <button
            onClick={() => setProjectorMode(!projectorMode)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-200 text-xs font-mono transition-all flex items-center gap-1.5 shadow-glow-blue"
          >
            {projectorMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span>{projectorMode ? "Exit Projector View" : "Projector Screen Mode"}</span>
          </button>

          <button
            onClick={fetchHttpLeaderboard}
            title="Refresh now"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top 3 Podium (Projector Screen Showcase) */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Rank 2 (Silver) */}
          {top3[1] ? (
            <div className="order-2 md:order-1 p-6 rounded-3xl bg-[#090D1A]/95 border border-slate-400/30 shadow-lg text-center flex flex-col justify-between">
              <div>
                <div className="inline-flex p-3 rounded-2xl bg-slate-800/80 border border-slate-400/40 text-slate-300 mb-3">
                  <Medal className="w-6 h-6 text-slate-300" />
                </div>
                <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">
                  RANK #2 • SILVER
                </div>
                <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-white truncate">
                  {top3[1].team_name}
                </h3>
                <p className="text-xs font-mono text-slate-400 mt-0.5">
                  Leader: {top3[1].leader_name}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-around font-mono">
                <div>
                  <span className="text-[11px] text-slate-400 block">CLEARED</span>
                  <span className="text-lg font-bold text-white">{top3[1].rounds_cleared}/6</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">BALANCE</span>
                  <span className="text-lg font-bold text-cyan-400">{top3[1].credits_remaining} CR</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="order-2 md:order-1 p-6 rounded-3xl bg-[#060810]/40 border border-slate-800 text-center opacity-40">
              <span className="text-xs font-mono text-slate-500">Rank #2 Pending</span>
            </div>
          )}

          {/* Rank 1 (Gold Champion) */}
          {top3[0] ? (
            <div className="order-1 md:order-2 p-7 rounded-3xl bg-gradient-to-b from-[#141E33] to-[#090D1A] border border-yellow-500/60 shadow-glow-cyan text-center flex flex-col justify-between relative transform md:-translate-y-3">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-0.5 rounded-full bg-yellow-500 text-black font-mono font-black text-xs uppercase tracking-widest shadow-lg">
                CURRENT LEADER
              </div>

              <div>
                <div className="inline-flex p-3.5 rounded-2xl bg-yellow-950/80 border border-yellow-500/80 text-yellow-400 mb-3 shadow-glow-cyan">
                  <Trophy className="w-8 h-8 text-yellow-400" />
                </div>
                <div className="text-xs font-mono text-yellow-400 uppercase tracking-wider mb-1 font-bold">
                  RANK #1 • CHAMPION
                </div>
                <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-white truncate">
                  {top3[0].team_name}
                </h2>
                <p className="text-xs font-mono text-slate-300 mt-0.5">
                  Leader: {top3[0].leader_name}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-around font-mono">
                <div>
                  <span className="text-[11px] text-slate-400 block">CLEARED</span>
                  <span className="text-xl font-black text-emerald-400">{top3[0].rounds_cleared}/6</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">BALANCE</span>
                  <span className="text-xl font-black text-cyan-300">{top3[0].credits_remaining} CR</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="order-1 md:order-2 p-7 rounded-3xl bg-[#060810]/40 border border-slate-800 text-center opacity-40">
              <span className="text-xs font-mono text-slate-500">Rank #1 Pending</span>
            </div>
          )}

          {/* Rank 3 (Bronze) */}
          {top3[2] ? (
            <div className="order-3 p-6 rounded-3xl bg-[#090D1A]/95 border border-amber-700/30 shadow-lg text-center flex flex-col justify-between">
              <div>
                <div className="inline-flex p-3 rounded-2xl bg-amber-950/80 border border-amber-700/50 text-amber-500 mb-3">
                  <Medal className="w-6 h-6 text-amber-500" />
                </div>
                <div className="text-xs font-mono text-amber-500 uppercase tracking-wider mb-1">
                  RANK #3 • BRONZE
                </div>
                <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-white truncate">
                  {top3[2].team_name}
                </h3>
                <p className="text-xs font-mono text-slate-400 mt-0.5">
                  Leader: {top3[2].leader_name}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-around font-mono">
                <div>
                  <span className="text-[11px] text-slate-400 block">CLEARED</span>
                  <span className="text-lg font-bold text-white">{top3[2].rounds_cleared}/6</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">BALANCE</span>
                  <span className="text-lg font-bold text-cyan-400">{top3[2].credits_remaining} CR</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="order-3 p-6 rounded-3xl bg-[#060810]/40 border border-slate-800 text-center opacity-40">
              <span className="text-xs font-mono text-slate-500">Rank #3 Pending</span>
            </div>
          )}
        </div>
      )}

      {/* Main Table */}
      <div className="rounded-3xl bg-[#090D1A]/95 border border-slate-800 shadow-glow-blue overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-heading font-bold text-lg sm:text-xl text-white flex items-center gap-2">
            <span>Overall Standings</span>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400">
              {leaderboard.length} Teams
            </span>
          </h3>

          <div className="text-xs font-mono text-slate-400 hidden sm:block">
            Tie-breaker: Cleared Stages &gt; Highest Credits &gt; Earliest Finish
          </div>
        </div>

        {leaderboard.length === 0 ? (
          <div className="py-16 text-center text-slate-400 font-mono text-sm">
            <Users className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p>No teams registered yet.</p>
            <p className="text-xs text-slate-500 mt-1">Teams will appear here live once they register and enter the arena.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono">
              <thead className="bg-[#04050A] text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Rank</th>
                  <th className="py-3.5 px-4 sm:px-6">Team Name</th>
                  <th className="py-3.5 px-4 sm:px-6">Leader</th>
                  <th className="py-3.5 px-4 sm:px-6 text-center">Stages Cleared</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Credits Remaining</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Last Cleared</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs sm:text-sm text-slate-200">
                {leaderboard.map((team, idx) => {
                  const isTop1 = team.rank === 1;
                  const isTop2 = team.rank === 2;
                  const isTop3 = team.rank === 3;

                  return (
                    <tr
                      key={team.id}
                      className={`hover:bg-blue-950/20 transition-colors ${
                        isTop1 ? "bg-yellow-500/5 font-semibold" : ""
                      }`}
                    >
                      {/* Rank badge */}
                      <td className="py-4 px-4 sm:px-6">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${
                          isTop1
                            ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 shadow-glow-cyan"
                            : isTop2
                            ? "bg-slate-400/20 text-slate-300 border border-slate-400/40"
                            : isTop3
                            ? "bg-amber-700/20 text-amber-400 border border-amber-700/40"
                            : "bg-slate-800 text-slate-400"
                        }`}>
                          {team.rank}
                        </span>
                      </td>

                      {/* Team Name */}
                      <td className="py-4 px-4 sm:px-6 font-bold text-white">
                        {team.team_name}
                      </td>

                      {/* Leader Name */}
                      <td className="py-4 px-4 sm:px-6 text-slate-400">
                        {team.leader_name}
                      </td>

                      {/* Stages cleared (x/6) */}
                      <td className="py-4 px-4 sm:px-6 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-950/80 text-cyan-300 border border-blue-800/80 text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{team.rounds_cleared} / 6</span>
                        </span>
                      </td>

                      {/* Credits remaining */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-400 text-sm">
                          <Zap className="w-3.5 h-3.5 fill-emerald-400" />
                          <span>{team.credits_remaining}</span>
                          <span className="text-[10px] text-emerald-400/80">CR</span>
                        </span>
                      </td>

                      {/* Last Clearance time */}
                      <td className="py-4 px-4 sm:px-6 text-right text-xs text-slate-400">
                        {team.last_cleared_at
                          ? new Date(team.last_cleared_at).toLocaleTimeString()
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
