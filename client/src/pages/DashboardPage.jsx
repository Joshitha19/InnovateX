import React, { useState, useEffect } from "react";
import { 
  Zap, 
  Lock, 
  CheckCircle2, 
  PlayCircle, 
  Clock, 
  Trophy, 
  ChevronRight, 
  AlertTriangle,
  Coins,
  Sparkles,
  RefreshCw,
  Terminal,
  KeyRound,
  Layers,
  BrainCircuit,
  ShieldAlert,
  ShieldCheck
} from "lucide-react";
import { api } from "../api/client";

const STAGE_ICONS = [
  Terminal,
  KeyRound,
  Layers,
  BrainCircuit,
  ShieldAlert,
  Trophy
];

export default function DashboardPage({ team, onUpdateTeam, onNavigate, onSelectRound }) {
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    setError("");
    try {
      const data = await api.getDashboard();
      setStages(data.stages || []);
      if (data.team) {
        onUpdateTeam(data.team);
      }
    } catch (err) {
      setError(err.message || "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    // Poll dashboard every 8 seconds in background to sync credit updates from admin or other tabs
    const interval = setInterval(loadDashboard, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleStartChallenge = async () => {
    setStarting(true);
    setError("");
    try {
      await api.startEvent();
      await loadDashboard();
    } catch (err) {
      setError(err.message || "Failed to start event.");
    } finally {
      setStarting(false);
    }
  };

  const completedCount = stages.filter((s) => s.status === "completed").length;
  const progressPercent = Math.round((completedCount / 6) * 100);

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Header Card */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-[#090D1A]/95 border border-slate-800 shadow-glow-blue overflow-hidden mb-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-blue-950 text-cyan-300 border border-blue-800">
                TEAM COMMAND HUB
              </span>
              {team?.started ? (
                <span className="flex items-center gap-1.5 text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  ARENA ACTIVE
                </span>
              ) : (
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-800">
                  READY TO START
                </span>
              )}
            </div>

            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
              {team?.team_name || "Your Team"}
            </h1>
            <p className="text-sm font-mono text-slate-400 mt-1">
              Leader: <span className="text-slate-200">{team?.leader_name}</span> • ID: <span className="text-cyan-400">{team?.id}</span>
            </p>
          </div>

          {/* Credits remaining counter display */}
          <div className="flex items-center gap-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-[#04050A] border border-cyan-500/40 shadow-glow-cyan text-center min-w-[170px]">
              <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest block mb-1">
                Remaining Balance
              </span>
              <div className="flex items-center justify-center gap-2">
                <Zap className="w-6 h-6 text-cyan-400 fill-cyan-400 animate-pulse-glow" />
                <span className="font-mono text-3xl sm:text-4xl font-extrabold text-white">
                  {team?.credits_remaining ?? 100}
                </span>
                <span className="font-mono text-xs text-cyan-400">CR</span>
              </div>
            </div>

            <button
              onClick={loadDashboard}
              title="Refresh Dashboard"
              className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Event Progress Bar */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-slate-400">Challenge Completion:</span>
            <span className="text-cyan-400 font-bold">
              {completedCount} of 6 Stages Cleared ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 transition-all duration-700 shadow-glow-cyan"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* If event hasn't started yet, show Start Event CTA banner */}
      {!team?.started && (
        <div className="mb-10 p-8 rounded-3xl bg-gradient-to-r from-blue-950/90 via-slate-900 to-blue-950/90 border border-cyan-500/50 text-center shadow-glow-blue relative overflow-hidden">
          <Sparkles className="w-8 h-8 text-cyan-400 mx-auto mb-3 animate-bounce" />
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-white mb-2">
            Ready To Enter DELULU HUNT?
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto mb-6 font-sans">
            Clicking the button below officially starts your timer and unlocks <strong className="text-cyan-300">Stage 01: Fix The Code</strong>. 
            All subsequent stages will unlock sequentially as your answers are verified.
          </p>
          <button
            onClick={handleStartChallenge}
            disabled={starting}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-400 hover:from-cyan-400 hover:to-blue-500 text-white font-heading font-bold text-base shadow-glow-cyan transition-all inline-flex items-center gap-2 group disabled:opacity-50"
          >
            <PlayCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>{starting ? "Unlocking Arena..." : "Start Challenge & Unlock Stage 1"}</span>
          </button>
        </div>
      )}

      {error && (
        <div className="mb-8 p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 6 Stage Cards Grid */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-xl sm:text-2xl text-white">
            The 6 Gauntlet Arenas
          </h2>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            Click on any active or completed stage to view problem brief &amp; submit answers
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stages.map((stage) => {
          const Icon = STAGE_ICONS[stage.round_index - 1] || Terminal;
          const isLocked = stage.status === "locked";
          const isActive = stage.status === "active";
          const isCompleted = stage.status === "completed";

          return (
            <div
              key={stage.round_index}
              onClick={() => {
                if (!isLocked) {
                  onSelectRound(stage.round_index);
                }
              }}
              className={`relative p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                isCompleted
                  ? "bg-[#090D1A]/95 border-emerald-500/50 shadow-glow-green cursor-pointer hover:border-emerald-400"
                  : isActive
                  ? "bg-[#0B132B]/95 border-cyan-500 shadow-glow-cyan cursor-pointer hover:border-cyan-400 hover:scale-[1.02]"
                  : "bg-[#060810]/70 border-slate-800/80 opacity-60 cursor-not-allowed"
              }`}
            >
              {/* Top Row: Stage number badge + State label */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-xs font-mono px-2.5 py-0.5 rounded border ${
                    isCompleted
                      ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                      : isActive
                      ? "bg-blue-950 text-cyan-300 border-cyan-800 font-bold"
                      : "bg-slate-900 text-slate-500 border-slate-800"
                  }`}>
                    STAGE 0{stage.round_index}
                  </span>

                  {isCompleted && (
                    <span className="flex items-center gap-1 text-xs font-mono text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      CLEARED
                    </span>
                  )}
                  {isActive && (
                    <span className="flex items-center gap-1 text-xs font-mono text-cyan-400 font-bold animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                      ACTIVE STAGE
                    </span>
                  )}
                  {isLocked && (
                    <span className="flex items-center gap-1 text-xs font-mono text-slate-500">
                      <Lock className="w-3.5 h-3.5" />
                      LOCKED
                    </span>
                  )}
                </div>

                {/* Stage Title */}
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2.5 rounded-xl border ${
                    isCompleted
                      ? "bg-emerald-950/60 border-emerald-800 text-emerald-400"
                      : isActive
                      ? "bg-blue-950/80 border-cyan-800 text-cyan-400"
                      : "bg-slate-900 border-slate-800 text-slate-600"
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={`font-heading font-bold text-lg ${
                      isLocked ? "text-slate-500" : "text-white"
                    }`}>
                      {stage.name}
                    </h3>
                  </div>
                </div>

                {/* Clue cost status */}
                <div className="text-xs font-mono text-slate-400 space-y-1 mb-6">
                  <div className="flex items-center justify-between">
                    <span>Clue Unlock Cost:</span>
                    <span className="text-cyan-300 font-semibold">{stage.clue_cost} CR</span>
                  </div>
                  {stage.clue_unlocked && (
                    <div className="text-emerald-400 text-[11px] font-mono">
                      ✓ Clue &amp; Materials Unlocked
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                {isCompleted && (
                  <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                    Review Solution <ChevronRight className="w-4 h-4" />
                  </span>
                )}
                {isActive && (
                  <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1">
                    Enter Arena <ChevronRight className="w-4 h-4 animate-bounce" />
                  </span>
                )}
                {isLocked && (
                  <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                    Unlock Stage 0{stage.round_index - 1} First
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
