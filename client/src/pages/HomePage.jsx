import React from "react";
import { 
  Zap, 
  Trophy, 
  ShieldAlert, 
  Terminal, 
  Lock, 
  BrainCircuit, 
  Layers, 
  KeyRound, 
  ArrowRight, 
  CheckCircle2, 
  HelpCircle,
  Coins,
  Radio,
  Timer
} from "lucide-react";

export default function HomePage({ onNavigate, team }) {
  const stages = [
    { num: 1, name: "Fix The Code", time: "~50 min", cost: "10 CR", icon: Terminal, desc: "Debug real code syntax and subtle edge-case traps." },
    { num: 2, name: "Crack The Message", time: "~50 min", cost: "10 CR", icon: KeyRound, desc: "Decipher scrambled cryptograms and encoded tokens." },
    { num: 3, name: "Build Something Small", time: "~70 min", cost: "15 CR", icon: Layers, desc: "Implement rapid functional specs under strict constraints." },
    { num: 4, name: "Use AI The Smart Way", time: "~50 min", cost: "15 CR", icon: BrainCircuit, desc: "Reverse prompt engineering and tactical AI problem solving." },
    { num: 5, name: "Find The Hidden Clue", time: "~70 min", cost: "20 CR", icon: ShieldAlert, desc: "Beginner cybersecurity & steganography digital treasure hunt." },
    { num: 6, name: "Final Challenge", time: "~90 min", cost: "20 CR", icon: Trophy, desc: "Real-world rapid prototyping and live 2-min pitch to judges." },
  ];

  const steps = [
    {
      step: "01",
      title: "6 Locked Stages",
      desc: "All stages are cloaked server-side. Once your team clicks Start, Stage 1 unlocks. Each next stage only opens when the backend validates your correct solution.",
      icon: Lock,
      color: "border-blue-500/40 text-blue-400"
    },
    {
      step: "02",
      title: "100 Credits Economy",
      desc: "Every team enters with 100 credits. Stuck on a problem? Spend credits to unlock the official clue or buy incremental hints (+5 CR). Confident teams save credits to win.",
      icon: Coins,
      color: "border-cyan-500/40 text-cyan-400"
    },
    {
      step: "03",
      title: "Zero-Leak Win Logic",
      desc: "Answers never touch client code. The champion is determined by: Correct completion of all 6 rounds > Most credits remaining > Earliest finishing timestamp.",
      icon: Trophy,
      color: "border-emerald-500/40 text-emerald-400"
    }
  ];

  return (
    <div className="relative z-10 min-h-screen text-slate-100 flex flex-col justify-between">
      {/* Top Banner Ticker */}
      <div className="bg-gradient-to-r from-blue-950/80 via-slate-900/90 to-blue-950/80 border-b border-blue-900/40 py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-300">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-cyan-300 font-semibold">EVENT STATUS:</span>
            <span>ROUND 2 LIVE PORTAL • GRIET HALL 1</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>~85 TEAMS</span>
            <span>•</span>
            <span>300 PARTICIPANTS</span>
            <span>•</span>
            <span className="text-yellow-400 font-bold">₹50,000 PRIZE POOL</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-16 max-w-6xl mx-auto text-center">
        {/* Glow orb behind hero */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] h-[300px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/90 border border-blue-500/40 text-cyan-300 text-xs sm:text-sm font-mono mb-8 shadow-glow-blue animate-float">
          <Zap className="w-4 h-4 text-cyan-400 fill-cyan-400" />
          <span>INNOVATEX GRAND FINALE • DELULU DEBUG</span>
        </div>

        <h1 className="font-heading font-extrabold text-4xl sm:text-6xl lg:text-7xl tracking-tight text-white mb-6 leading-[1.1]">
          DELULU <span className="text-gradient-cyan">DEBUG</span>
          <br />
          <span className="text-2xl sm:text-4xl lg:text-5xl font-semibold text-slate-300">
            The 6-Stage Multiplayer Challenge Arena
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-slate-300 text-base sm:text-lg leading-relaxed mb-10 font-sans">
          Fix broken code, crack secret ciphers, reverse tactical AI prompts, and out-maneuver 85+ teams in real-time. 
          Manage your <span className="text-cyan-300 font-mono font-bold">100 Credits</span> strategically — hints cost credits, 
          and remaining balance decides who claims the ₹50,000 championship.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          {team ? (
            <button
              onClick={() => onNavigate("dashboard")}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-500 hover:from-blue-500 hover:to-cyan-400 text-white font-heading font-bold text-base shadow-glow-cyan transition-all flex items-center justify-center gap-2 group"
            >
              <span>Enter Active Arena</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          ) : (
            <>
              <button
                onClick={() => onNavigate("login")}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-heading font-bold text-base shadow-glow-blue transition-all flex items-center justify-center gap-2 group border border-cyan-400/30"
              >
                <span>Login Your Team</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-cyan-300" />
              </button>

              <button
                onClick={() => onNavigate("register")}
                className="w-full sm:w-auto px-6 py-4 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-slate-500 hover:bg-slate-800 text-slate-200 font-semibold text-sm transition-all"
              >
                Register New Team
              </button>
            </>
          )}

          <button
            onClick={() => onNavigate("leaderboard")}
            className="w-full sm:w-auto px-6 py-4 rounded-xl bg-slate-900/80 border border-blue-900/60 hover:border-cyan-500/60 text-slate-200 font-semibold text-sm transition-all flex items-center justify-center gap-2 group"
          >
            <Trophy className="w-4 h-4 text-yellow-400 group-hover:scale-110 transition-transform" />
            <span>Live Leaderboard</span>
          </button>
        </div>

        {/* Live Stat Badges */}
        <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
          <div className="p-3.5 rounded-xl bg-[#090D1A]/90 border border-slate-800/80 text-center">
            <p className="text-2xl sm:text-3xl font-mono font-bold text-cyan-400">100</p>
            <p className="text-[11px] font-mono text-slate-400 uppercase mt-0.5">Initial Credits</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#090D1A]/90 border border-slate-800/80 text-center">
            <p className="text-2xl sm:text-3xl font-mono font-bold text-blue-400">6</p>
            <p className="text-[11px] font-mono text-slate-400 uppercase mt-0.5">Locked Stages</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#090D1A]/90 border border-slate-800/80 text-center">
            <p className="text-2xl sm:text-3xl font-mono font-bold text-white">~85</p>
            <p className="text-[11px] font-mono text-slate-400 uppercase mt-0.5">Rival Teams</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#090D1A]/90 border border-slate-800/80 text-center">
            <p className="text-2xl sm:text-3xl font-mono font-bold text-emerald-400">₹50K</p>
            <p className="text-[11px] font-mono text-slate-400 uppercase mt-0.5">Total Prize Pool</p>
          </div>
        </div>
      </section>

      {/* How It Works Section (3 Short Steps) */}
      <section id="how-it-works" className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-xs sm:text-sm font-mono uppercase tracking-widest text-cyan-400 font-semibold mb-2">
            Game Mechanics
          </h2>
          <p className="font-heading text-2xl sm:text-4xl font-bold text-white">
            How DELULU DEBUG Works
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx}
                className="relative p-6 sm:p-7 rounded-2xl bg-[#090D1A]/90 border border-slate-800/90 hover:border-slate-700 transition-all group overflow-hidden"
              >
                <div className="flex items-center justify-between mb-5">
                  <span className="font-mono text-2xl font-black text-slate-700 group-hover:text-cyan-500/40 transition-colors">
                    {item.step}
                  </span>
                  <div className={`p-2.5 rounded-xl bg-slate-900 border ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="font-heading text-lg font-bold text-white mb-2.5">
                  {item.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* The 6 Challenge Stages Grid Preview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-xs sm:text-sm font-mono uppercase tracking-widest text-blue-400 font-semibold mb-2">
              Arena Preview
            </h2>
            <p className="font-heading text-2xl sm:text-3xl font-bold text-white">
              The 6 Progressive Stages
            </p>
          </div>
          <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>Stages remain locked until previous answer is verified</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stages.map((stage) => {
            const Icon = stage.icon;
            return (
              <div 
                key={stage.num}
                className="p-5 rounded-xl bg-[#090D1A]/80 border border-slate-800/80 hover:border-blue-700/60 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/50">
                      STAGE 0{stage.num}
                    </span>
                    <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5" />
                      Clue: {stage.cost}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <Icon className="w-5 h-5 text-cyan-400" />
                    <h4 className="font-heading font-bold text-base text-white">
                      {stage.name}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {stage.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span className="flex items-center gap-1">
                    <Timer className="w-3 h-3 text-slate-400" />
                    {stage.time}
                  </span>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Locked
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Win Condition / Callout */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-blue-950/60 via-[#090D1A] to-cyan-950/40 border border-blue-500/30 text-center shadow-glow-blue">
          <h3 className="font-heading text-xl sm:text-2xl font-bold text-white mb-2">
            The Golden Rule: Don't Spam Clues
          </h3>
          <p className="text-slate-300 text-sm max-w-xl mx-auto mb-6">
            If two teams solve all 6 rounds, the team with <strong className="text-cyan-300">more credits remaining</strong> wins first place. 
            Time is only used as a tie-breaker.
          </p>
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/40 font-mono text-xs sm:text-sm text-cyan-300">
            <span>Completion (6/6)</span>
            <span>&gt;</span>
            <span className="font-bold text-emerald-300">Credits Remaining</span>
            <span>&gt;</span>
            <span className="text-slate-400">Finishing Time</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#04050A]/95 py-8 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <div>
            <span className="text-white font-heading font-bold text-sm">DELULU DEBUG</span>
            <span className="ml-2 text-slate-500">• InnovateX Round 2 Tech Event</span>
          </div>
          <div className="text-center sm:text-right text-slate-400">
            <span className="text-cyan-400 italic">“Find your two — build your crew.”</span>
          </div>
          <div>
            <button 
              onClick={() => onNavigate("admin-login")}
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              Organizer Access
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
