import React, { useState } from "react";
import { Zap, Lock, Mail, Users, UserCheck, ArrowRight, AlertCircle } from "lucide-react";
import { api } from "../api/client";

export default function RegisterPage({ onLoginSuccess, onNavigate }) {
  const [teamName, setTeamName] = useState("");
  const [leaderName, setLeaderName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password should be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await api.register({
        team_name: teamName,
        leader_name: leaderName,
        email,
        password,
      });

      localStorage.setItem("delulu_token", res.token);
      onLoginSuccess(res.team);
      onNavigate("dashboard");
    } catch (err) {
      setError(err.message || "Failed to register team. Email may already be taken.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative p-8 rounded-2xl bg-[#090D1A]/95 border border-slate-800 shadow-glow-cyan">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-2xl bg-cyan-950/80 border border-cyan-800 text-cyan-400 mb-4 shadow-glow-cyan">
              <Users className="w-6 h-6" />
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
              Team Registration
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-mono mt-1">
              One account per team. Enters with 100 Initial Credits.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-800/80 flex items-start gap-3 text-red-200 text-xs">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                  Team Name
                </label>
                <div className="relative">
                  <Users className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="e.g. DeluluSquad"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#04050A] border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white text-sm placeholder-slate-600 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                  Team Leader Name
                </label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={leaderName}
                    onChange={(e) => setLeaderName(e.target.value)}
                    placeholder="e.g. Joshitha Y."
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#04050A] border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white text-sm placeholder-slate-600 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                Official Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="leader@college.edu"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#04050A] border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white text-sm placeholder-slate-600 outline-none transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                Secret Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#04050A] border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white text-sm placeholder-slate-600 outline-none transition-all font-mono"
                />
              </div>
            </div>

            {/* Starting credits badge */}
            <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-900/80 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">Initial Team Allocation:</span>
              <span className="text-cyan-300 font-bold flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 fill-cyan-400" />
                100 CREDITS
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-500 hover:from-blue-500 hover:to-cyan-400 text-white font-heading font-bold text-sm shadow-glow-cyan transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="font-mono text-xs animate-pulse">Creating Account...</span>
              ) : (
                <>
                  <span>Create Team &amp; Claim 100 Credits</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer switch */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 text-center text-xs text-slate-400">
            Already registered?{" "}
            <button
              onClick={() => onNavigate("login")}
              className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
            >
              Log in to your team
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
