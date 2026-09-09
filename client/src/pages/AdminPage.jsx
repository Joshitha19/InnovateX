import React, { useState, useEffect } from "react";
import { 
  Shield, 
  Users, 
  Settings, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Minus, 
  LogOut,
  Layers,
  FileCode,
  KeyRound
} from "lucide-react";
import { api } from "../api/client";

export default function AdminPage({ onNavigate }) {
  const [adminToken, setAdminToken] = useState(localStorage.getItem("delulu_admin_token"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

  // Overview data
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("teams"); // 'teams' | 'rounds' | 'submissions'
  const [selectedRound, setSelectedRound] = useState(null);
  const [roundForm, setRoundForm] = useState(null);
  const [creditAdjustment, setCreditAdjustment] = useState({ teamId: null, teamName: "", amount: 0, reason: "" });
  const [resetConfirm, setResetConfirm] = useState("");
  const [actionFeedback, setActionFeedback] = useState(null);

  const loadOverview = async () => {
    try {
      const res = await api.getAdminOverview();
      setData(res);
      if (res.rounds && res.rounds.length > 0 && !selectedRound) {
        setSelectedRound(res.rounds[0]);
        setRoundForm(res.rounds[0]);
      }
    } catch (err) {
      if (err.message?.includes("Unauthorized") || err.message?.includes("expired")) {
        localStorage.removeItem("delulu_admin_token");
        setAdminToken(null);
      }
      setActionFeedback({ type: "error", message: err.message });
    }
  };

  useEffect(() => {
    if (adminToken) {
      loadOverview();
    }
  }, [adminToken]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoading(true);
    try {
      const res = await api.adminLogin({ email, password });
      localStorage.setItem("delulu_admin_token", res.token);
      setAdminToken(res.token);
    } catch (err) {
      setLoginError(err.message || "Failed to log in as organizer.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("delulu_admin_token");
    setAdminToken(null);
    setData(null);
  };

  const handleAdjustCredits = async () => {
    if (!creditAdjustment.teamId || !creditAdjustment.amount) return;
    try {
      const res = await api.adjustCredits({
        team_id: creditAdjustment.teamId,
        amount: creditAdjustment.amount,
        reason: creditAdjustment.reason,
      });
      setActionFeedback({ type: "success", message: res.message });
      setCreditAdjustment({ teamId: null, teamName: "", amount: 0, reason: "" });
      loadOverview();
    } catch (err) {
      setActionFeedback({ type: "error", message: err.message });
    }
  };

  const handleSaveRound = async (e) => {
    e.preventDefault();
    if (!roundForm) return;
    try {
      const res = await api.updateRound(roundForm.index_num, roundForm);
      setActionFeedback({ type: "success", message: res.message });
      loadOverview();
    } catch (err) {
      setActionFeedback({ type: "error", message: err.message });
    }
  };

  const handleResetEvent = async () => {
    if (resetConfirm !== "RESET_DELULU_HUNT") return;
    try {
      const res = await api.resetEvent(resetConfirm);
      setActionFeedback({ type: "success", message: res.message });
      setResetConfirm("");
      loadOverview();
    } catch (err) {
      setActionFeedback({ type: "error", message: err.message });
    }
  };

  if (!adminToken) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md p-8 rounded-2xl bg-[#090D1A] border border-slate-800 shadow-glow-blue">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-2xl bg-blue-950 border border-blue-800 text-cyan-400 mb-3">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="font-heading font-extrabold text-2xl text-white">
              Organizer Portal
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Protected administration interface for InnovateX leads
            </p>
          </div>

          {loginError && (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs mb-4">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 font-mono text-xs">
            <div>
              <label className="block text-slate-400 uppercase tracking-wider mb-1">
                Organizer Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@innovatex.org"
                className="w-full px-4 py-3 rounded-xl bg-[#04050A] border border-slate-700 text-white outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-[#04050A] border border-slate-700 text-white outline-none focus:border-cyan-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold font-heading shadow-glow-blue transition-all"
            >
              {loading ? "Authenticating..." : "Access Organizer Console"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => onNavigate("home")}
              className="text-xs font-mono text-slate-500 hover:text-slate-300"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
              Organizer Command Center
            </h1>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Logged in as: <span className="text-cyan-300">{data?.admin?.email || "Organizer"}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadOverview}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl bg-red-950/80 border border-red-800 text-red-300 hover:bg-red-900 text-xs font-mono flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Stats row */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-[#090D1A] border border-slate-800">
            <span className="text-xs font-mono text-slate-400 uppercase">Registered Teams</span>
            <p className="font-mono text-3xl font-bold text-white mt-1">{data.stats.total_teams}</p>
          </div>
          <div className="p-5 rounded-2xl bg-[#090D1A] border border-slate-800">
            <span className="text-xs font-mono text-slate-400 uppercase">Active In Arena</span>
            <p className="font-mono text-3xl font-bold text-cyan-400 mt-1">{data.stats.active_teams}</p>
          </div>
          <div className="p-5 rounded-2xl bg-[#090D1A] border border-slate-800">
            <span className="text-xs font-mono text-slate-400 uppercase">Total Cleared Stages</span>
            <p className="font-mono text-3xl font-bold text-emerald-400 mt-1">{data.stats.total_cleared_stages}</p>
          </div>
        </div>
      )}

      {/* Feedback banner */}
      {actionFeedback && (
        <div className={`p-4 rounded-xl mb-6 text-xs font-mono flex items-center justify-between ${
          actionFeedback.type === "success"
            ? "bg-emerald-950/80 border border-emerald-800 text-emerald-200"
            : "bg-red-950/80 border border-red-800 text-red-200"
        }`}>
          <span>{actionFeedback.message}</span>
          <button onClick={() => setActionFeedback(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-3 font-mono text-xs">
        <button
          onClick={() => setActiveTab("teams")}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === "teams" ? "bg-blue-600 text-white font-bold" : "text-slate-400 hover:text-white"
          }`}
        >
          Live Teams &amp; Credits ({data?.teams?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("rounds")}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === "rounds" ? "bg-blue-600 text-white font-bold" : "text-slate-400 hover:text-white"
          }`}
        >
          Stage Editor &amp; Answers (6)
        </button>
        <button
          onClick={() => setActiveTab("submissions")}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === "submissions" ? "bg-blue-600 text-white font-bold" : "text-slate-400 hover:text-white"
          }`}
        >
          Live Submissions ({data?.recent_submissions?.length || 0})
        </button>
      </div>

      {/* TAB 1: Teams List */}
      {activeTab === "teams" && (
        <div className="rounded-2xl bg-[#090D1A] border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#04050A] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Team Name</th>
                  <th className="py-3 px-4">Leader / Email</th>
                  <th className="py-3 px-4 text-center">Stages Cleared</th>
                  <th className="py-3 px-4 text-center">Credits</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data?.teams?.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-900/60">
                    <td className="py-3.5 px-4 font-bold text-white">{t.team_name}</td>
                    <td className="py-3.5 px-4 text-slate-400">
                      <div>{t.leader_name}</div>
                      <div className="text-[10px] text-slate-500">{t.email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center text-cyan-300 font-bold">{t.rounds_cleared} / 6</td>
                    <td className="py-3.5 px-4 text-center font-bold text-emerald-400">{t.credits_remaining} CR</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        t.started ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-slate-800 text-slate-400"
                      }`}>
                        {t.started ? "Active" : "Not Started"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setCreditAdjustment({ teamId: t.id, teamName: t.team_name, amount: 10, reason: "" })}
                        className="px-2.5 py-1 rounded bg-blue-950 border border-blue-800 hover:border-cyan-400 text-cyan-300 text-[11px]"
                      >
                        Adjust Credits
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Stage Editor */}
      {activeTab === "rounds" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stage selector buttons */}
          <div className="space-y-2">
            {data?.rounds?.map((r) => (
              <button
                key={r.index_num}
                onClick={() => {
                  setSelectedRound(r);
                  setRoundForm(r);
                }}
                className={`w-full p-4 rounded-xl border text-left font-mono text-xs transition-all ${
                  selectedRound?.index_num === r.index_num
                    ? "bg-blue-950/80 border-cyan-400 text-white shadow-glow-blue"
                    : "bg-[#090D1A] border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-cyan-400">STAGE 0{r.index_num}</span>
                  <span>Clue: {r.clue_cost} CR</span>
                </div>
                <div className="font-heading font-semibold text-sm text-white">{r.name}</div>
              </button>
            ))}
          </div>

          {/* Editor form */}
          {roundForm && (
            <div className="lg:col-span-2 p-6 rounded-2xl bg-[#090D1A] border border-slate-800">
              <h3 className="font-heading font-bold text-lg text-white mb-4">
                Edit Stage 0{roundForm.index_num}: {roundForm.name}
              </h3>

              <form onSubmit={handleSaveRound} className="space-y-4 font-mono text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Stage Name</label>
                  <input
                    type="text"
                    value={roundForm.name}
                    onChange={(e) => setRoundForm({ ...roundForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#04050A] border border-slate-700 text-white outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 mb-1">Clue Cost (CR)</label>
                    <input
                      type="number"
                      value={roundForm.clue_cost}
                      onChange={(e) => setRoundForm({ ...roundForm, clue_cost: parseInt(e.target.value, 10) })}
                      className="w-full px-3 py-2 rounded-lg bg-[#04050A] border border-slate-700 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Secret Answer (Server-Only)</label>
                    <input
                      type="text"
                      value={roundForm.answer}
                      onChange={(e) => setRoundForm({ ...roundForm, answer: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#04050A] border border-cyan-500/60 text-cyan-300 font-bold outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Challenge Brief</label>
                  <textarea
                    rows={6}
                    value={roundForm.brief}
                    onChange={(e) => setRoundForm({ ...roundForm, brief: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#04050A] border border-slate-700 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Clue Text (Unlocked via Credits)</label>
                  <textarea
                    rows={3}
                    value={roundForm.clue_text}
                    onChange={(e) => setRoundForm({ ...roundForm, clue_text: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#04050A] border border-slate-700 text-white outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold font-heading shadow-glow-blue"
                >
                  Save Stage 0{roundForm.index_num} Changes
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Submissions */}
      {activeTab === "submissions" && (
        <div className="rounded-2xl bg-[#090D1A] border border-slate-800 overflow-hidden font-mono text-xs">
          <table className="w-full text-left">
            <thead className="bg-[#04050A] text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Team</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4">Submitted Answer</th>
                <th className="py-3 px-4">Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {data?.recent_submissions?.map((s) => (
                <tr key={s.id} className="hover:bg-slate-900/60">
                  <td className="py-3 px-4 text-slate-500">{new Date(s.created_at).toLocaleTimeString()}</td>
                  <td className="py-3 px-4 font-bold text-white">{s.team_name || s.team_id}</td>
                  <td className="py-3 px-4 text-cyan-400">Stage 0{s.round_index}</td>
                  <td className="py-3 px-4 text-slate-300 truncate max-w-xs">{s.answer_submitted}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                      s.is_correct ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-red-950 text-red-400 border border-red-800"
                    }`}>
                      {s.is_correct ? "CORRECT" : "INCORRECT"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Danger Zone: Event Reset */}
      <div className="mt-16 p-6 rounded-2xl bg-red-950/20 border border-red-900/60">
        <h4 className="font-heading font-bold text-base text-red-400 flex items-center gap-2 mb-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <span>Danger Zone: Reset Event Data</span>
        </h4>
        <p className="text-xs text-slate-400 font-mono mb-4">
          Wipes all registered teams, round progress, and logs to start fresh for the live competition.
          Type <strong className="text-white">RESET_DELULU_HUNT</strong> to confirm.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 max-w-md font-mono text-xs">
          <input
            type="text"
            value={resetConfirm}
            onChange={(e) => setResetConfirm(e.target.value)}
            placeholder="RESET_DELULU_HUNT"
            className="flex-grow px-3 py-2 rounded-lg bg-[#04050A] border border-red-800 text-white outline-none"
          />
          <button
            onClick={handleResetEvent}
            disabled={resetConfirm !== "RESET_DELULU_HUNT"}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-bold transition-all"
          >
            Execute Wipe
          </button>
        </div>
      </div>

      {/* Credit Adjustment Modal */}
      {creditAdjustment.teamId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="p-6 rounded-2xl bg-[#090D1A] border border-slate-700 max-w-sm w-full font-mono text-xs">
            <h3 className="font-heading font-bold text-base text-white mb-2">
              Adjust Credits: {creditAdjustment.teamName}
            </h3>
            <div className="space-y-3 mb-6">
              <div>
                <label className="block text-slate-400 mb-1">Amount (+ or -):</label>
                <input
                  type="number"
                  value={creditAdjustment.amount}
                  onChange={(e) => setCreditAdjustment({ ...creditAdjustment, amount: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-2 rounded-lg bg-[#04050A] border border-slate-700 text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Reason for audit log:</label>
                <input
                  type="text"
                  value={creditAdjustment.reason}
                  onChange={(e) => setCreditAdjustment({ ...creditAdjustment, reason: e.target.value })}
                  placeholder="e.g. Volunteer verification dispute"
                  className="w-full px-3 py-2 rounded-lg bg-[#04050A] border border-slate-700 text-white outline-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setCreditAdjustment({ teamId: null, teamName: "", amount: 0, reason: "" })}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjustCredits}
                className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
              >
                Apply Adjustment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
