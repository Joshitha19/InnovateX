import React, { useState } from "react";
import BackgroundCanvas from "./components/BackgroundCanvas";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [team, setTeam] = useState(null); // team session if logged in

  const handleNavigate = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogout = () => {
    localStorage.removeItem("delulu_token");
    setTeam(null);
    setCurrentPage("home");
  };

  return (
    <div className="relative min-h-screen bg-[#04050A] text-slate-100 font-sans selection:bg-blue-600 selection:text-white flex flex-col">
      {/* Interactive Network / Particle Canvas Background */}
      <BackgroundCanvas />

      {/* Persistent Tech Portal Navbar */}
      <Navbar 
        team={team} 
        onLogout={handleLogout} 
        onNavigate={handleNavigate} 
      />

      {/* Main Page Rendering */}
      <main className="flex-grow">
        {currentPage === "home" && (
          <HomePage 
            onNavigate={handleNavigate} 
            team={team} 
          />
        )}

        {/* Temporary placeholders while we build subsequent pages */}
        {currentPage === "login" && (
          <div className="relative z-10 max-w-md mx-auto my-20 p-8 rounded-2xl bg-[#090D1A] border border-slate-800 text-center">
            <h2 className="text-xl font-heading font-bold text-white mb-2">Team Portal Login</h2>
            <p className="text-sm text-slate-400 mb-6 font-mono">Authentication module coming up next</p>
            <button 
              onClick={() => setCurrentPage("home")}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold"
            >
              Back to Home
            </button>
          </div>
        )}

        {currentPage === "register" && (
          <div className="relative z-10 max-w-md mx-auto my-20 p-8 rounded-2xl bg-[#090D1A] border border-slate-800 text-center">
            <h2 className="text-xl font-heading font-bold text-white mb-2">Register Your Team</h2>
            <p className="text-sm text-slate-400 mb-6 font-mono">Team creation module coming up next</p>
            <button 
              onClick={() => setCurrentPage("home")}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold"
            >
              Back to Home
            </button>
          </div>
        )}

        {currentPage === "leaderboard" && (
          <div className="relative z-10 max-w-md mx-auto my-20 p-8 rounded-2xl bg-[#090D1A] border border-slate-800 text-center">
            <h2 className="text-xl font-heading font-bold text-white mb-2">Live Leaderboard</h2>
            <p className="text-sm text-slate-400 mb-6 font-mono">WebSocket live rank broadcast coming up next</p>
            <button 
              onClick={() => setCurrentPage("home")}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold"
            >
              Back to Home
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
