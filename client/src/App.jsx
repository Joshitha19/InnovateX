import React, { useState, useEffect } from "react";
import BackgroundCanvas from "./components/BackgroundCanvas";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import RoundPage from "./pages/RoundPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import AdminPage from "./pages/AdminPage";
import { api } from "./api/client";

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [currentRoundIndex, setCurrentRoundIndex] = useState(1);
  const [team, setTeam] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Restore session from localStorage if token exists
  useEffect(() => {
    const token = localStorage.getItem("delulu_token");
    if (token) {
      api.getMe()
        .then((res) => {
          if (res.team) {
            setTeam(res.team);
          }
        })
        .catch(() => {
          localStorage.removeItem("delulu_token");
          setTeam(null);
        })
        .finally(() => {
          setCheckingAuth(false);
        });
    } else {
      setCheckingAuth(false);
    }
  }, []);

  const handleNavigate = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogout = () => {
    localStorage.removeItem("delulu_token");
    setTeam(null);
    setCurrentPage("home");
  };

  const handleSelectRound = (index) => {
    setCurrentRoundIndex(index);
    setCurrentPage("round");
    window.scrollTo({ top: 0, behavior: "smooth" });
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

      {/* Main Content Router */}
      <main className="flex-grow">
        {currentPage === "home" && (
          <HomePage 
            onNavigate={handleNavigate} 
            team={team} 
          />
        )}

        {currentPage === "login" && (
          <LoginPage 
            onLoginSuccess={(newTeam) => {
              setTeam(newTeam);
            }} 
            onNavigate={handleNavigate} 
          />
        )}

        {currentPage === "register" && (
          <RegisterPage 
            onLoginSuccess={(newTeam) => {
              setTeam(newTeam);
            }} 
            onNavigate={handleNavigate} 
          />
        )}

        {currentPage === "dashboard" && (
          <DashboardPage 
            team={team} 
            onUpdateTeam={setTeam} 
            onNavigate={handleNavigate} 
            onSelectRound={handleSelectRound} 
          />
        )}

        {currentPage === "round" && (
          <RoundPage 
            roundIndex={currentRoundIndex} 
            team={team} 
            onUpdateTeam={setTeam} 
            onNavigate={handleNavigate} 
            onNextRound={handleSelectRound} 
          />
        )}

        {currentPage === "leaderboard" && (
          <LeaderboardPage 
            onNavigate={handleNavigate} 
          />
        )}

        {(currentPage === "admin-login" || currentPage === "admin") && (
          <AdminPage 
            onNavigate={handleNavigate} 
          />
        )}
      </main>
    </div>
  );
}
