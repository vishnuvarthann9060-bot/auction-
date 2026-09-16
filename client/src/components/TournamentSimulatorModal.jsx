import React, { useState, useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import { runFullPlayoffs, evaluateTeamStrength } from "../utils/matchSimulator";
import { TEAMS_DATA } from "../data/teams";
import confetti from "canvas-confetti";
import { 
  Trophy, X, Play, RefreshCw, Award, CheckCircle2, 
  Sparkles, Flame, Shield, Users, ChevronRight, Swords 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function TournamentSimulatorModal({ isOpen, onClose }) {
  const { roomState } = useSocket();
  const [activeTab, setActiveTab] = useState("playoffs"); // "playoffs" | "rankings" | "scorecards"
  const [tournamentData, setTournamentData] = useState(null);
  const [playoffStage, setPlayoffStage] = useState(0); // 0: not started, 1: Q1, 2: Elim, 3: Q2, 4: Final complete

  const teams = roomState?.teams || [];

  // Generate / refresh tournament simulation
  const handleSimulate = () => {
    if (!teams || teams.length === 0) return;
    const result = runFullPlayoffs(teams);
    setTournamentData(result);
    setPlayoffStage(4); // full reveal

    if (result?.champion) {
      confetti({
        particleCount: 180,
        spread: 110,
        origin: { y: 0.5 },
        colors: [result.champion.color || '#F59E0B', '#FFD700', '#FFFFFF', '#6366F1']
      });
    }
  };

  // Run on initial open
  useEffect(() => {
    if (isOpen && teams.length > 0 && !tournamentData) {
      handleSimulate();
    }
  }, [isOpen, teams]);

  if (!isOpen) return null;

  const rankings = tournamentData?.rankings || teams.map(t => evaluateTeamStrength(t)).sort((a, b) => b.overallRating - a.overallRating);
  const playoffs = tournamentData?.playoffs;
  const champion = tournamentData?.champion;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="glass-panel w-full max-w-5xl rounded-3xl border border-[#27272a] shadow-2xl bg-[#101014]/98 my-auto overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Top Modal Header */}
          <div className="p-4 sm:p-6 border-b border-[#27272a] flex items-center justify-between gap-3 bg-[#0a0a0c]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-black flex items-center justify-center shadow-lg shadow-amber-500/20 font-black">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-2xl font-heading font-black text-white tracking-[-0.03em]">
                    IPL Tournament Simulator
                  </h2>
                  <span className="text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 uppercase">
                    Playoff Arena
                  </span>
                </div>
                <p className="text-xs text-[#9ca3af]">
                  Simulates match battles, ball-by-ball outcomes and crowns the IPL Champion based on auction squads.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSimulate}
                title="Re-run Simulation"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1e1e1e] hover:bg-[#27272a] border border-[#27272a] text-xs font-bold text-white transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Simulate Again</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-[#1e1e1e] hover:bg-[#27272a] text-[#9ca3af] hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="px-4 sm:px-6 pt-3 flex items-center gap-2 border-b border-[#27272a]/60 bg-[#0d0d10]">
            <button
              onClick={() => setActiveTab("playoffs")}
              className={`px-3.5 py-2 rounded-t-xl text-xs sm:text-sm font-heading font-bold transition border-b-2 cursor-pointer ${
                activeTab === "playoffs"
                  ? "text-amber-400 border-amber-400 bg-[#16161b]"
                  : "text-[#9ca3af] border-transparent hover:text-white"
              }`}
            >
              🏆 Playoff Bracket & Winner
            </button>
            <button
              onClick={() => setActiveTab("rankings")}
              className={`px-3.5 py-2 rounded-t-xl text-xs sm:text-sm font-heading font-bold transition border-b-2 cursor-pointer ${
                activeTab === "rankings"
                  ? "text-amber-400 border-amber-400 bg-[#16161b]"
                  : "text-[#9ca3af] border-transparent hover:text-white"
              }`}
            >
              📊 Franchise Power Index
            </button>
            <button
              onClick={() => setActiveTab("scorecards")}
              className={`px-3.5 py-2 rounded-t-xl text-xs sm:text-sm font-heading font-bold transition border-b-2 cursor-pointer ${
                activeTab === "scorecards"
                  ? "text-amber-400 border-amber-400 bg-[#16161b]"
                  : "text-[#9ca3af] border-transparent hover:text-white"
              }`}
            >
              📋 Match Scorecards
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
            
            {/* TAB 1: PLAYOFF BRACKET */}
            {activeTab === "playoffs" && (
              <div className="space-y-6">
                {/* Champion Trophy Display */}
                {champion && (
                  <motion.div 
                    initial={{ scale: 0.92, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-6 sm:p-8 rounded-3xl border border-amber-500/40 bg-gradient-to-b from-amber-500/15 via-[#121216] to-[#0a0a0c] text-center shadow-2xl relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500" />
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-black flex items-center justify-center mx-auto mb-3 shadow-xl shadow-amber-500/30 animate-bounce">
                      <Trophy className="w-9 h-9 sm:w-11 sm:h-11" />
                    </div>

                    <div className="text-xs uppercase font-extrabold tracking-[0.15em] gold-gradient-text">
                      Official IPL Champions
                    </div>
                    <div className="text-3xl sm:text-5xl font-heading font-black text-white mt-1">
                      {champion.logoEmoji} {champion.teamName}
                    </div>
                    <p className="text-xs sm:text-sm text-[#9ca3af] mt-2 max-w-md mx-auto">
                      {playoffs?.grandFinal?.margin} • Player of the Match: <strong className="text-white">{playoffs?.grandFinal?.motm?.name}</strong> ({playoffs?.grandFinal?.motm?.performance})
                    </p>
                  </motion.div>
                )}

                {/* 4 Playoff Match Clashes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                  
                  {/* Qualifier 1 */}
                  {playoffs?.qualifier1 && (
                    <div className="p-4 rounded-2xl bg-[#141418] border border-[#27272a] space-y-3">
                      <div className="flex items-center justify-between border-b border-[#27272a] pb-2">
                        <span className="text-xs uppercase font-bold text-[#818cf8] tracking-wider">Qualifier 1 (#1 vs #2)</span>
                        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">Completed</span>
                      </div>
                      <div className="space-y-1.5 text-xs sm:text-sm">
                        <div className="flex justify-between items-center">
                          <span className="font-heading font-bold text-white flex items-center gap-1.5">
                            <span>{playoffs.qualifier1.innings1.logoEmoji}</span>
                            <span>{playoffs.qualifier1.innings1.shortName}</span>
                          </span>
                          <span className="font-mono font-bold text-amber-300">{playoffs.qualifier1.innings1.score}/{playoffs.qualifier1.innings1.wickets} <span className="text-[#71717a] font-normal">({playoffs.qualifier1.innings1.overs})</span></span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-heading font-bold text-white flex items-center gap-1.5">
                            <span>{playoffs.qualifier1.innings2.logoEmoji}</span>
                            <span>{playoffs.qualifier1.innings2.shortName}</span>
                          </span>
                          <span className="font-mono font-bold text-amber-300">{playoffs.qualifier1.innings2.score}/{playoffs.qualifier1.innings2.wickets} <span className="text-[#71717a] font-normal">({playoffs.qualifier1.innings2.overs})</span></span>
                        </div>
                      </div>
                      <div className="text-[11px] text-emerald-400 font-semibold pt-1 border-t border-[#27272a]/60 flex items-center justify-between">
                        <span>{playoffs.qualifier1.margin}</span>
                        <span className="text-[#71717a]">To Final ➡️</span>
                      </div>
                    </div>
                  )}

                  {/* Eliminator */}
                  {playoffs?.eliminator && (
                    <div className="p-4 rounded-2xl bg-[#141418] border border-[#27272a] space-y-3">
                      <div className="flex items-center justify-between border-b border-[#27272a] pb-2">
                        <span className="text-xs uppercase font-bold text-rose-400 tracking-wider">Eliminator (#3 vs #4)</span>
                        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">Completed</span>
                      </div>
                      <div className="space-y-1.5 text-xs sm:text-sm">
                        <div className="flex justify-between items-center">
                          <span className="font-heading font-bold text-white flex items-center gap-1.5">
                            <span>{playoffs.eliminator.innings1.logoEmoji}</span>
                            <span>{playoffs.eliminator.innings1.shortName}</span>
                          </span>
                          <span className="font-mono font-bold text-amber-300">{playoffs.eliminator.innings1.score}/{playoffs.eliminator.innings1.wickets} <span className="text-[#71717a] font-normal">({playoffs.eliminator.innings1.overs})</span></span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-heading font-bold text-white flex items-center gap-1.5">
                            <span>{playoffs.eliminator.innings2.logoEmoji}</span>
                            <span>{playoffs.eliminator.innings2.shortName}</span>
                          </span>
                          <span className="font-mono font-bold text-amber-300">{playoffs.eliminator.innings2.score}/{playoffs.eliminator.innings2.wickets} <span className="text-[#71717a] font-normal">({playoffs.eliminator.innings2.overs})</span></span>
                        </div>
                      </div>
                      <div className="text-[11px] text-emerald-400 font-semibold pt-1 border-t border-[#27272a]/60 flex items-center justify-between">
                        <span>{playoffs.eliminator.margin}</span>
                        <span className="text-[#71717a]">To Q2 ➡️</span>
                      </div>
                    </div>
                  )}

                  {/* Qualifier 2 */}
                  {playoffs?.qualifier2 && (
                    <div className="p-4 rounded-2xl bg-[#141418] border border-[#27272a] space-y-3">
                      <div className="flex items-center justify-between border-b border-[#27272a] pb-2">
                        <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">Qualifier 2</span>
                        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">Completed</span>
                      </div>
                      <div className="space-y-1.5 text-xs sm:text-sm">
                        <div className="flex justify-between items-center">
                          <span className="font-heading font-bold text-white flex items-center gap-1.5">
                            <span>{playoffs.qualifier2.innings1.logoEmoji}</span>
                            <span>{playoffs.qualifier2.innings1.shortName}</span>
                          </span>
                          <span className="font-mono font-bold text-amber-300">{playoffs.qualifier2.innings1.score}/{playoffs.qualifier2.innings1.wickets} <span className="text-[#71717a] font-normal">({playoffs.qualifier2.innings1.overs})</span></span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-heading font-bold text-white flex items-center gap-1.5">
                            <span>{playoffs.qualifier2.innings2.logoEmoji}</span>
                            <span>{playoffs.qualifier2.innings2.shortName}</span>
                          </span>
                          <span className="font-mono font-bold text-amber-300">{playoffs.qualifier2.innings2.score}/{playoffs.qualifier2.innings2.wickets} <span className="text-[#71717a] font-normal">({playoffs.qualifier2.innings2.overs})</span></span>
                        </div>
                      </div>
                      <div className="text-[11px] text-emerald-400 font-semibold pt-1 border-t border-[#27272a]/60 flex items-center justify-between">
                        <span>{playoffs.qualifier2.margin}</span>
                        <span className="text-[#71717a]">To Final ➡️</span>
                      </div>
                    </div>
                  )}

                  {/* Grand Final */}
                  {playoffs?.grandFinal && (
                    <div className="p-4 rounded-2xl bg-[#18181f] border border-amber-500/40 space-y-3 shadow-lg shadow-amber-500/5">
                      <div className="flex items-center justify-between border-b border-[#27272a] pb-2">
                        <span className="text-xs uppercase font-extrabold gold-gradient-text tracking-wider">Grand Final</span>
                        <span className="text-[10px] text-amber-300 font-bold bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">🏆 Trophy Match</span>
                      </div>
                      <div className="space-y-1.5 text-xs sm:text-sm">
                        <div className="flex justify-between items-center">
                          <span className="font-heading font-bold text-white flex items-center gap-1.5">
                            <span>{playoffs.grandFinal.innings1.logoEmoji}</span>
                            <span>{playoffs.grandFinal.innings1.shortName}</span>
                          </span>
                          <span className="font-mono font-bold text-amber-300">{playoffs.grandFinal.innings1.score}/{playoffs.grandFinal.innings1.wickets} <span className="text-[#71717a] font-normal">({playoffs.grandFinal.innings1.overs})</span></span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-heading font-bold text-white flex items-center gap-1.5">
                            <span>{playoffs.grandFinal.innings2.logoEmoji}</span>
                            <span>{playoffs.grandFinal.innings2.shortName}</span>
                          </span>
                          <span className="font-mono font-bold text-amber-300">{playoffs.grandFinal.innings2.score}/{playoffs.grandFinal.innings2.wickets} <span className="text-[#71717a] font-normal">({playoffs.grandFinal.innings2.overs})</span></span>
                        </div>
                      </div>
                      <div className="text-[11px] text-amber-300 font-bold pt-1 border-t border-amber-500/20 flex items-center justify-between">
                        <span>{playoffs.grandFinal.margin}</span>
                        <span className="text-amber-400">👑 Champions</span>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* TAB 2: POWER RANKINGS */}
            {activeTab === "rankings" && (
              <div className="space-y-3">
                <div className="text-xs text-[#9ca3af] pb-1">
                  Franchises ranked by overall roster index computed from authentic T20 career stats. Top 4 qualify for the playoffs.
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-[#27272a] text-[#71717a] text-[10px] sm:text-xs uppercase font-bold tracking-wider">
                        <th className="py-2.5 px-3"># Seed</th>
                        <th className="py-2.5 px-3">Franchise</th>
                        <th className="py-2.5 px-3 text-center">Batting Index</th>
                        <th className="py-2.5 px-3 text-center">Bowling Index</th>
                        <th className="py-2.5 px-3 text-center">Wicketkeeper</th>
                        <th className="py-2.5 px-3 text-right">Overall Rating</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#27272a]/60">
                      {rankings.map((team, idx) => {
                        const isPlayoffs = idx < 4;
                        return (
                          <tr 
                            key={team.teamId}
                            className={`transition ${isPlayoffs ? "bg-amber-500/[0.04]" : "hover:bg-[#141418]"}`}
                          >
                            <td className="py-3 px-3 font-heading font-bold">
                              {idx === 0 ? "🥇 #1" : idx === 1 ? "🥈 #2" : idx === 2 ? "🥉 #3" : idx === 3 ? "⭐ #4" : `#${idx + 1}`}
                            </td>
                            <td className="py-3 px-3 font-heading font-bold text-white flex items-center gap-2">
                              <span className="text-base sm:text-xl">{team.logoEmoji}</span>
                              <span>{team.teamName}</span>
                              {isPlayoffs && (
                                <span className="text-[9px] uppercase font-bold text-amber-400 bg-amber-500/15 px-1.5 py-0.5 rounded border border-amber-500/30">
                                  Playoffs
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-center font-mono text-blue-400 font-bold">
                              {team.battingStrength}
                            </td>
                            <td className="py-3 px-3 text-center font-mono text-emerald-400 font-bold">
                              {team.bowlingStrength}
                            </td>
                            <td className="py-3 px-3 text-center">
                              {team.hasWk ? (
                                <span className="text-emerald-400 text-xs">🧤 Secured</span>
                              ) : (
                                <span className="text-rose-400 text-xs">⚠️ Missing</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right font-teko font-bold text-lg sm:text-xl text-amber-400">
                              {team.overallRating} OVR
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: SCORECARDS */}
            {activeTab === "scorecards" && playoffs && (
              <div className="space-y-4">
                {[playoffs.qualifier1, playoffs.eliminator, playoffs.qualifier2, playoffs.grandFinal].map((match, i) => (
                  <div key={i} className="p-4 sm:p-5 rounded-2xl bg-[#141418] border border-[#27272a] space-y-3">
                    <div className="flex items-center justify-between border-b border-[#27272a] pb-2">
                      <span className="font-heading font-bold text-sm sm:text-base text-white">{match.matchTitle}</span>
                      <span className="text-xs text-emerald-400 font-bold">{match.margin}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                      <div className="p-3 rounded-xl bg-[#0c0c0e] border border-[#27272a]/60 space-y-1">
                        <div className="flex justify-between font-bold">
                          <span className="text-white">{match.innings1.logoEmoji} {match.innings1.teamName}</span>
                          <span className="text-amber-400 font-mono">{match.innings1.score}/{match.innings1.wickets} ({match.innings1.overs})</span>
                        </div>
                        <div className="text-[11px] text-[#9ca3af] flex justify-between pt-1">
                          <span>Top Bat: {match.innings1.topBatter}</span>
                          <span>{match.innings1.topBowler}</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-[#0c0c0e] border border-[#27272a]/60 space-y-1">
                        <div className="flex justify-between font-bold">
                          <span className="text-white">{match.innings2.logoEmoji} {match.innings2.teamName}</span>
                          <span className="text-amber-400 font-mono">{match.innings2.score}/{match.innings2.wickets} ({match.innings2.overs})</span>
                        </div>
                        <div className="text-[11px] text-[#9ca3af] flex justify-between pt-1">
                          <span>Top Bat: {match.innings2.topBatter}</span>
                          <span>{match.innings2.topBowler}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-[#9ca3af] flex items-center justify-between pt-1">
                      <span>🏆 Player of the Match: <strong className="text-white">{match.motm.name}</strong> ({match.motm.performance})</span>
                      <span className="font-mono text-amber-400 font-bold">{match.winner.shortName} Won</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* Modal Footer */}
          <div className="p-4 sm:p-5 border-t border-[#27272a] bg-[#0a0a0c] flex items-center justify-between">
            <span className="text-xs text-[#71717a]">
              Tournament results are calculated using real player batting, bowling and balance statistics.
            </span>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[#1e1e1e] hover:bg-[#27272a] text-white text-xs sm:text-sm font-bold transition cursor-pointer"
            >
              Close Arena
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
