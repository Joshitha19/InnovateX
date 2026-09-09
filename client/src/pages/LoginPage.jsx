import React, { useState } from "react";
import { Zap, Lock, Mail, ArrowRight, AlertCircle, Shield } from "lucide-react";
import { api } from "../api/client";

export default function LoginPage({ onLoginSuccess, onNavigate }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.login({ email, password });
      localStorage.setItem("delulu_token", res.token);
      onLoginSuccess(res.team);
      onNavigate("dashboard");
    } catch (err) {
      setError(err.message || "Failed to log in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative p-8 rounded-2xl bg-[#090D1A]/95 border border-slate-800 shadow-glow-blue">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-2xl bg-blue-950/80 border border-blue-800 text-cyan-400 mb-4 shadow-glow-cyan">
              <Zap className="w-6 h-6 fill-cyan-400" />
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
              Team Login
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-mono mt-1">
              Enter your registered team credentials to enter the arena
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-800/80 flex items-start gap-3 text-red-200 text-xs">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                Team Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="team@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#04050A] border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white text-sm placeholder-slate-600 outline-none transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#04050A] border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white text-sm placeholder-slate-600 outline-none transition-all font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-heading font-bold text-sm shadow-glow-blue transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="font-mono text-xs animate-pulse">Authenticating...</span>
              ) : (
                <>
                  <span>Enter DELULU HUNT Arena</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer switch */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col items-center gap-3 text-xs text-slate-400">
            <p>
              Don't have a team account yet?{" "}
              <button
                onClick={() => onNavigate("register")}
                className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
              >
                Register Here
              </button>
            </p>
            <button
              onClick={() => onNavigate("admin-login")}
              className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
            >
              <Shield className="w-3 h-3" />
              <span>Organizer Sign-in</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
