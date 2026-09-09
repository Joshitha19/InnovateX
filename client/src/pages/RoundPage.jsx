import React, { useState, useEffect } from "react";
import { 
  Zap, 
  ArrowLeft, 
  HelpCircle, 
  Lightbulb, 
  FileText, 
  Download, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Coins, 
  Lock, 
  Unlock, 
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import confetti from "canvas-confetti";
import { api } from "../api/client";

export default function RoundPage({ roundIndex, team, onUpdateTeam, onNavigate, onNextRound }) {
  const [round, setRound] = useState(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [clueLoading, setClueLoading] = useState(false);
  const [hintLoading, setHintLoading] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: '' }
  const [showConfirmClue, setShowConfirmClue] = useState(false);
  const [showConfirmHint, setShowConfirmHint] = useState(false);

  const loadRound = async () => {
    try {
      const data = await api.getRound(roundIndex);
      setRound(data);
      if (data.team_credits !== undefined) {
        onUpdateTeam({ ...team, credits_remaining: data.team_credits });
      }
    } catch (err) {
      setFeedback({ type: "error", message: err.message || "Failed to load stage data." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRound();
  }, [roundIndex]);

  const handleUnlockClue = async () => {
    setShowConfirmClue(false);
    setClueLoading(true);
    setFeedback(null);
    try {
      const res = await api.unlockClue(roundIndex);
      setRound((prev) => ({
        ...prev,
        clue_unlocked: true,
        clue_text: res.clue_text,
        assets: res.assets || [],
      }));
      onUpdateTeam({ ...team, credits_remaining: res.credits_remaining });
      setFeedback({ type: "success", message: res.message });
    } catch (err) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setClueLoading(false);
    }
  };

  const handleUnlockHint = async () => {
    setShowConfirmHint(false);
    setHintLoading(true);
    setFeedback(null);
    try {
      const res = await api.unlockHint(roundIndex);
      setRound((prev) => ({
        ...prev,
        hints_unlocked_count: res.hints_unlocked_count,
        unlocked_hints: res.unlocked_hints,
      }));
      onUpdateTeam({ ...team, credits_remaining: res.credits_remaining });
      setFeedback({ type: "success", message: res.message });
    } catch (err) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setHintLoading(false);
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!answer.trim()) return;

    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await api.submitAnswer(roundIndex, answer);
      if (res.correct) {
        // Fire celebration confetti!
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#3B82F6", "#22D3EE", "#10B981", "#F59E0B"]
        });

        setRound((prev) => ({ ...prev, completed: true }));
        setFeedback({ type: "success", message: res.message });
      } else {
        setFeedback({ type: "error", message: res.message });
      }
    } catch (err) {
      setFeedback({ type: "error", message: err.message || "Submission failed." });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center font-mono text-cyan-400">
        <span className="animate-pulse">Loading Stage 0{roundIndex}...</span>
      </div>
    );
  }

  if (!round) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 rounded-2xl bg-[#090D1A] border border-red-900 text-center">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
        <p className="text-red-200 text-sm mb-6">{feedback?.message || "Stage not found."}</p>
        <button
          onClick={() => onNavigate("dashboard")}
          className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Breadcrumb & Return */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => onNavigate("dashboard")}
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-cyan-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Command Hub</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-lg bg-blue-950/80 border border-cyan-500/50 text-cyan-300 font-mono text-xs font-bold flex items-center gap-1.5 shadow-glow-cyan">
            <Zap className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
            <span>{team?.credits_remaining ?? round.team_credits} CR</span>
          </div>

          <span className={`text-xs font-mono px-3 py-1 rounded-lg border ${
            round.completed
              ? "bg-emerald-950 text-emerald-300 border-emerald-800"
              : "bg-blue-950 text-blue-300 border-blue-800"
          }`}>
            {round.completed ? "STAGE CLEARED" : `STAGE 0${roundIndex}`}
          </span>
        </div>
      </div>

      {/* Main Challenge Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#090D1A]/95 border border-slate-800 shadow-glow-blue mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">
              CHALLENGE MISSION 0{roundIndex}
            </span>
            <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-white tracking-tight mt-1">
              {round.name}
            </h1>
          </div>

          {round.completed && (
            <div className="px-4 py-2 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-400 font-mono text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>CLEARED</span>
            </div>
          )}
        </div>

        {/* Challenge Brief / Markdown Content */}
        <div className="prose prose-invert max-w-none text-slate-300 text-sm sm:text-base leading-relaxed space-y-4 mb-8">
          <div className="bg-[#04050A] p-5 sm:p-6 rounded-2xl border border-slate-800 font-mono text-xs sm:text-sm whitespace-pre-wrap leading-relaxed text-slate-200">
            {round.brief}
          </div>
        </div>

        {/* Feedback Alert if any */}
        {feedback && (
          <div className={`p-4 rounded-xl mb-6 flex items-start gap-3 text-xs sm:text-sm ${
            feedback.type === "success"
              ? "bg-emerald-950/70 border border-emerald-800 text-emerald-200"
              : "bg-red-950/70 border border-red-800 text-red-200"
          }`}>
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-grow">
              <p className="font-semibold">{feedback.message}</p>
            </div>
          </div>
        )}

        {/* Clue & Hint Unlocking Section */}
        <div className="space-y-6 pt-6 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-400" />
              <span>Clues &amp; Intelligence</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Clue cost: <span className="text-cyan-300 font-bold">{round.clue_cost} CR</span>
            </span>
          </div>

          {/* Main Clue Box */}
          {round.clue_unlocked ? (
            <div className="p-5 rounded-2xl bg-blue-950/40 border border-blue-600/50 shadow-glow-blue">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 mb-2">
                <Unlock className="w-4 h-4" />
                <span className="font-bold">OFFICIAL MISSION CLUE UNLOCKED</span>
              </div>
              <p className="text-sm text-slate-200 font-mono leading-relaxed bg-[#04050A]/70 p-4 rounded-xl border border-blue-900/60">
                {round.clue_text}
              </p>

              {/* Assets Section (revealed only after clue is unlocked) */}
              {round.assets && round.assets.length > 0 && (
                <div className="mt-4 pt-4 border-t border-blue-900/50">
                  <span className="text-xs font-mono text-slate-400 block mb-2">
                    Verified Stage Materials:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {round.assets.map((asset, idx) => (
                      <a
                        key={idx}
                        href={`/api/rounds/${roundIndex}/assets/${asset}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#04050A] border border-cyan-500/40 text-cyan-300 hover:border-cyan-400 text-xs font-mono transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{asset}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-[#04050A] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white">Official Clue &amp; Materials</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Deducts {round.clue_cost} credits from your team's score.
                </p>
              </div>
              <button
                onClick={() => setShowConfirmClue(true)}
                disabled={clueLoading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-mono text-xs font-bold shadow-glow-blue transition-all flex items-center gap-2"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Unlock Clue (-{round.clue_cost} CR)</span>
              </button>
            </div>
          )}

          {/* Extra Hints Section (+5 Credits each) */}
          <div className="pt-4 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-slate-400">
                Extra Incremental Hints: ({round.hints_unlocked_count || 0} / {round.total_hints_available} Unlocked)
              </span>

              {round.hints_unlocked_count < round.total_hints_available && (
                <button
                  onClick={() => setShowConfirmHint(true)}
                  disabled={hintLoading}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500/60 text-cyan-300 text-xs font-mono transition-all flex items-center gap-1.5"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>Unlock Next Hint (-5 CR)</span>
                </button>
              )}
            </div>

            {/* List of unlocked hints */}
            {round.unlocked_hints && round.unlocked_hints.length > 0 && (
              <div className="space-y-2 mt-2">
                {round.unlocked_hints.map((hint, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300 flex items-start gap-2"
                  >
                    <span className="text-cyan-400 font-bold">Hint #{idx + 1}:</span>
                    <span>{hint}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit Answer Form */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <h3 className="font-heading font-bold text-lg text-white mb-2">
            Submit Solution
          </h3>
          <p className="text-xs text-slate-400 font-mono mb-4">
            Answers are verified server-side only. Make sure your format matches instructions.
          </p>

          {round.completed ? (
            <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-600/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                <div>
                  <h4 className="font-heading font-bold text-white text-base">
                    Stage 0{roundIndex} Already Completed!
                  </h4>
                  <p className="text-xs font-mono text-slate-400">
                    Your solution has been accepted and recorded on the live leaderboard.
                  </p>
                </div>
              </div>

              {roundIndex < 6 && (
                <button
                  onClick={() => onNextRound(roundIndex + 1)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-heading font-bold text-xs shadow-glow-green transition-all flex items-center gap-2"
                >
                  <span>Proceed to Stage 0{roundIndex + 1}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmitAnswer} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  required
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Enter your exact answer / token..."
                  className="flex-grow px-4 py-3.5 rounded-xl bg-[#04050A] border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white text-sm font-mono placeholder-slate-600 outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={submitting || !answer.trim()}
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-heading font-bold text-sm shadow-glow-blue transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed min-w-[170px]"
                >
                  {submitting ? (
                    <span className="font-mono text-xs animate-pulse">Verifying...</span>
                  ) : (
                    <>
                      <span>Submit Answer</span>
                      <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Clue */}
      {showConfirmClue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="p-6 rounded-2xl bg-[#090D1A] border border-slate-700 max-w-sm w-full shadow-glow-blue">
            <h3 className="font-heading font-bold text-lg text-white mb-2">
              Unlock Official Clue?
            </h3>
            <p className="text-xs text-slate-300 font-mono mb-6">
              This will deduct <strong className="text-cyan-400">{round.clue_cost} Credits</strong> from your team balance. Remember that final rankings favor teams with more remaining credits!
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowConfirmClue(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
              >
                Cancel
              </button>
              <button
                onClick={handleUnlockClue}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold shadow-glow-blue"
              >
                Confirm (-{round.clue_cost} CR)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Hint */}
      {showConfirmHint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="p-6 rounded-2xl bg-[#090D1A] border border-slate-700 max-w-sm w-full shadow-glow-cyan">
            <h3 className="font-heading font-bold text-lg text-white mb-2">
              Unlock Extra Hint?
            </h3>
            <p className="text-xs text-slate-300 font-mono mb-6">
              This will deduct <strong className="text-cyan-400">5 Credits</strong> for hint #{round.hints_unlocked_count + 1}.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowConfirmHint(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
              >
                Cancel
              </button>
              <button
                onClick={handleUnlockHint}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold shadow-glow-cyan"
              >
                Confirm (-5 CR)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
