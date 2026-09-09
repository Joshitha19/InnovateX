import React from "react";
import { ArrowRight, Trophy, Zap, Shield } from "lucide-react";

export default function HomePage({ onNavigate, team }) {
  return (
    <div className="relative z-10 min-h-[calc(100vh-4rem)] flex flex-col justify-between text-slate-100">
      {/* Hero Section: Title + Motivation + Login Button Only */}
      <section className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
        {/* Glow ambient background orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] h-[350px] sm:h-[450px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-3xl mx-auto">
          {/* Main Title */}
          <h1 className="font-heading font-extrabold text-6xl sm:text-8xl lg:text-9xl tracking-tight text-white mb-8 select-none">
            DELULU <span className="text-gradient-cyan">HUNT</span>
          </h1>

          {/* Inspiring Motivational Info */}
          <p className="text-slate-300 text-lg sm:text-2xl font-light leading-relaxed max-w-2xl mx-auto mb-12">
            Where logic meets relentless ambition. Bring your sharpest minds, trust your crew, and turn the impossible into execution.
          </p>

          {/* Primary Action Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            {team ? (
              <button
                onClick={() => onNavigate("dashboard")}
                className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 hover:from-blue-500 hover:to-cyan-400 text-white font-heading font-bold text-base shadow-glow-cyan transition-all flex items-center justify-center gap-2.5 group"
              >
                <span>Enter Team Arena</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => onNavigate("login")}
                  className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-500 hover:from-blue-500 hover:to-cyan-400 text-white font-heading font-bold text-base shadow-glow-blue transition-all flex items-center justify-center gap-2.5 group border border-cyan-400/30"
                >
                  <span>Login Your Team</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform text-cyan-300" />
                </button>

                <button
                  onClick={() => onNavigate("register")}
                  className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 hover:border-slate-500 text-slate-300 font-semibold text-sm transition-all"
                >
                  Register Team
                </button>
              </>
            )}

            <button
              onClick={() => onNavigate("leaderboard")}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 text-slate-300 font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span>Leaderboard</span>
            </button>
          </div>

          {/* Club Motto */}
          <div className="mt-16 text-xs sm:text-sm font-mono text-cyan-400/80 tracking-wide italic">
            “Find your two — build your crew.”
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="border-t border-slate-800/60 bg-[#04050A]/80 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs font-mono text-slate-500">
          <div>
            <span className="text-slate-300 font-bold">DELULU HUNT</span> • InnovateX
          </div>
          <button
            onClick={() => onNavigate("admin-login")}
            className="hover:text-slate-300 transition-colors"
          >
            Organizer
          </button>
        </div>
      </footer>
    </div>
  );
}
