import React from "react";
import { Zap, Trophy, Shield, LogOut, ArrowRight, User } from "lucide-react";

export default function Navbar({ team, onLogout, onNavigate }) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#04050A]/85 border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo / Title */}
        <div 
          onClick={() => onNavigate("home")} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-cyan-500 to-blue-700 p-[1px] shadow-glow-blue transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-[#090D1A] rounded-[11px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-cyan-400 group-hover:animate-bounce" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-lg sm:text-xl tracking-wider text-white">
                DELULU<span className="text-cyan-400">HUNT</span>
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded bg-blue-950/90 text-cyan-300 border border-blue-800/60">
                Round 2
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono tracking-tight -mt-0.5">
              INNOVATEX • GLEC
            </p>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button 
            onClick={() => onNavigate("home")} 
            className="hover:text-cyan-300 transition-colors"
          >
            Overview
          </button>
          <button 
            onClick={() => onNavigate("leaderboard")} 
            className="flex items-center gap-2 hover:text-cyan-300 transition-colors group"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>Live Leaderboard</span>
          </button>
          <button 
            onClick={() => onNavigate("admin-login")} 
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            <span>Organizers</span>
          </button>
        </nav>

        {/* Action / Auth buttons */}
        <div className="flex items-center gap-3">
          {team ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate("dashboard")}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/80 hover:border-cyan-500/60 transition-all text-xs font-mono text-slate-300"
              >
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-semibold text-white truncate max-w-[110px]">
                  {team.team_name}
                </span>
              </button>

              {/* Credits counter pill */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-950/80 border border-cyan-500/50 text-cyan-300 font-mono text-xs sm:text-sm font-bold shadow-glow-cyan animate-pulse-glow">
                <Zap className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
                <span>{team.credits_remaining}</span>
                <span className="text-[10px] text-cyan-400/80 uppercase">CR</span>
              </div>

              <button
                onClick={() => onNavigate("dashboard")}
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-glow-blue transition-all"
              >
                Arena
              </button>

              <button
                onClick={onLogout}
                title="Logout"
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => onNavigate("leaderboard")}
                className="md:hidden p-2 text-yellow-400 hover:text-yellow-300"
                title="Live Leaderboard"
              >
                <Trophy className="w-5 h-5" />
              </button>
              <button
                onClick={() => onNavigate("login")}
                className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs sm:text-sm font-semibold tracking-wide shadow-glow-blue transition-all flex items-center gap-1.5"
              >
                <span>Login Team</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
