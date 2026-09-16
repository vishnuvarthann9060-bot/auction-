import React, { useState } from "react";
import { useSocket } from "../context/SocketContext";
import { formatCurrency, getRoleBadgeClass } from "../utils/formatters";
import { TEAMS_DATA } from "../data/teams";
import { X, Shield, DollarSign, Users, Award, Globe, LayoutGrid, Radio } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function SquadModal({ isOpen, onClose, initialTeamId }) {
  const { roomState } = useSocket();
  const [selectedTeamId, setSelectedTeamId] = useState(initialTeamId || "csk");
  const [viewMode, setViewMode] = useState("list"); // "list" | "pitch"

  if (!isOpen || !roomState) return null;

  const currentTeam = roomState.teams.find(t => t.id === selectedTeamId) || roomState.teams[0];
  const meta = TEAMS_DATA[currentTeam.id];
  const squad = currentTeam.squad || [];

  const totalSpent = (roomState.rules.totalPurse || 1000000000) - currentTeam.purse;
  const overseasCount = squad.filter(p => p.isOverseas).length;

  // Group players by role
  const batters = squad.filter(p => p.role === "Batter");
  const bowlers = squad.filter(p => p.role === "Bowler");
  const allRounders = squad.filter(p => p.role === "All-Rounder");
  const keepers = squad.filter(p => p.role === "Wicketkeeper");

  // Construct Playing XI
  const playingXI = [
    ...batters.slice(0, 4),
    ...keepers.slice(0, 1),
    ...allRounders.slice(0, 2),
    ...bowlers.slice(0, 4)
  ];
  // Fill remaining slots from rest of squad if needed
  const remainingSquad = squad.filter(p => !playingXI.includes(p));
  while (playingXI.length < 11 && remainingSquad.length > 0) {
    playingXI.push(remainingSquad.shift());
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-5xl xl:max-w-6xl max-h-[92vh] glass-panel rounded-3xl border border-[#27272a] shadow-2xl relative z-10 flex flex-col overflow-hidden bg-[#121212]"
        >
          {/* Top Bar with Franchise Tabs */}
          <div className="p-4 sm:p-6 pb-3 border-b border-[#27272a] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl sm:text-4xl">{meta?.logoEmoji || "🏏"}</span>
              <div>
                <h3 className="text-xl sm:text-2xl font-heading font-extrabold text-white tracking-[-0.03em]">{currentTeam.name}</h3>
                <p className="text-xs sm:text-sm text-[#9ca3af]">
                  Managed by <strong className="text-white">{currentTeam.ownerName || "Unassigned"}</strong>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#1e1e1e] hover:bg-[#27272a] text-[#9ca3af] hover:text-white border border-[#27272a] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Franchise Select Carousel Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2.5 bg-[#050505] overflow-x-auto border-b border-[#27272a] scrollbar-none">
            {roomState.teams.map((t) => {
              const isActive = t.id === selectedTeamId;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTeamId(t.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold shrink-0 transition flex items-center gap-1.5 cursor-pointer border ${
                    isActive 
                      ? "bg-[#6366f1] text-white border-[#6366f1] shadow" 
                      : "bg-[#121212] text-[#9ca3af] hover:text-white border-[#27272a]"
                  }`}
                >
                  <span className="text-sm sm:text-base">{TEAMS_DATA[t.id]?.logoEmoji}</span>
                  <span>{t.shortName}</span>
                  <span className="text-xs opacity-75">({t.squad.length})</span>
                </button>
              );
            })}
          </div>

          {/* Summary Pills Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 p-4 sm:p-6 py-3 bg-[#0a0a0a]/60 border-b border-[#27272a]">
            <div className="glass-card p-2.5 sm:p-3 rounded-2xl text-center border border-[#27272a] bg-[#121212]">
              <div className="text-[10px] sm:text-xs text-[#9ca3af] uppercase tracking-[0.08em] font-semibold">Total Spent</div>
              <div className="text-sm sm:text-base font-heading font-bold text-amber-400 font-mono">{formatCurrency(totalSpent)}</div>
            </div>
            <div className="glass-card p-2.5 sm:p-3 rounded-2xl text-center border border-[#27272a] bg-[#121212]">
              <div className="text-[10px] sm:text-xs text-[#9ca3af] uppercase tracking-[0.08em] font-semibold">Purse Remaining</div>
              <div className="text-sm sm:text-base font-heading font-bold text-emerald-400 font-mono">{formatCurrency(currentTeam.purse)}</div>
            </div>
            <div className="glass-card p-2.5 sm:p-3 rounded-2xl text-center border border-[#27272a] bg-[#121212]">
              <div className="text-[10px] sm:text-xs text-[#9ca3af] uppercase tracking-[0.08em] font-semibold">Squad Size</div>
              <div className="text-sm sm:text-base font-heading font-bold text-white">{squad.length} / {roomState.rules.maxSquadSize}</div>
            </div>
            <div className="glass-card p-2.5 sm:p-3 rounded-2xl text-center border border-[#27272a] bg-[#121212]">
              <div className="text-[10px] sm:text-xs text-[#9ca3af] uppercase tracking-[0.08em] font-semibold">Overseas Quota</div>
              <div className="text-sm sm:text-base font-heading font-bold text-[#818cf8]">{overseasCount} / {roomState.rules.maxOverseas}</div>
            </div>
          </div>

          {/* View Mode Toggle Bar */}
          <div className="px-4 sm:px-6 py-2.5 bg-[#050505] border-b border-[#27272a] flex items-center justify-between">
            <div className="flex items-center gap-1.5 bg-[#121212] p-1 rounded-xl border border-[#27272a]">
              <button
                onClick={() => setViewMode("list")}
                className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "list" ? "bg-[#6366f1] text-white shadow" : "text-[#9ca3af] hover:text-white"
                }`}
              >
                <span>📋 Squad List ({squad.length})</span>
              </button>
              <button
                onClick={() => setViewMode("pitch")}
                className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "pitch" ? "bg-[#6366f1] text-white shadow" : "text-[#9ca3af] hover:text-white"
                }`}
              >
                <span>🏏 Tactical Pitch XI ({Math.min(squad.length, 11)}/11)</span>
              </button>
            </div>

            <span className="text-xs text-[#71717a] hidden sm:inline font-medium">
              {viewMode === "pitch" ? "Dream 11 Tactical Lineup" : "Full Franchise Roster"}
            </span>
          </div>

          {/* Player Roster Content */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
            {squad.length === 0 ? (
              <div className="py-16 text-center text-[#71717a]">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-semibold text-[#9ca3af]">No players acquired yet.</p>
                <p className="text-xs text-[#71717a] mt-1">Winning bids for {currentTeam.shortName} will appear here.</p>
              </div>
            ) : viewMode === "pitch" ? (
              /* TACTICAL CRICKET PITCH / PLAYING XI VIEW */
              <div className="relative rounded-3xl border border-[#27272a] bg-[#0a0a0a] p-4 sm:p-6 shadow-inner space-y-6 overflow-hidden">
                {/* Center Crease */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-28 rounded-full border border-white/5 pointer-events-none" />

                {/* Top Order Batters (1-4) */}
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#818cf8] mb-2 flex items-center gap-1.5">
                    <span>🏏 Top Order & Middle Order (Batters)</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[0, 1, 2, 3].map((pos) => {
                      const p = playingXI[pos];
                      return (
                        <div 
                          key={`bat-${pos}`}
                          className={`p-2.5 rounded-2xl border transition flex items-center gap-2.5 ${
                            p 
                              ? "bg-[#121212] border-[#27272a] shadow-md hover:border-[#3f3f46]" 
                              : "bg-[#050505] border-dashed border-[#27272a] text-[#71717a]"
                          }`}
                        >
                          {p ? (
                            <>
                              <img 
                                src={p.image} 
                                alt={p.name} 
                                className="w-9 h-11 rounded-lg object-cover object-top border border-[#27272a] shrink-0" 
                                onError={(e) => {
                                  e.target.src = "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400&auto=format&fit=crop&q=80";
                                }}
                              />
                              <div className="min-w-0">
                                <div className="text-[10px] font-semibold text-[#818cf8]">#{pos + 1} • {p.role}</div>
                                <div className="text-xs font-heading font-bold text-white truncate">{p.name}</div>
                                <div className="text-[10px] font-mono text-[#9ca3af]">{formatCurrency(p.soldPrice)}</div>
                              </div>
                            </>
                          ) : (
                            <div className="py-2.5 text-center w-full text-[11px] text-[#71717a] font-semibold">
                              Slot #{pos + 1}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Wicketkeeper & All-Rounders (5-7) */}
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-cyan-400 mb-2 flex items-center gap-1.5">
                    <span>🧤 Wicketkeeper & All-Rounders</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
                    {[4, 5, 6].map((pos) => {
                      const p = playingXI[pos];
                      return (
                        <div 
                          key={`mid-${pos}`}
                          className={`p-2 sm:p-2.5 rounded-2xl border transition flex items-center gap-2 sm:gap-2.5 ${
                            p 
                              ? "bg-[#121212] border-[#27272a] shadow-md hover:border-[#3f3f46]" 
                              : "bg-[#050505] border-dashed border-[#27272a] text-[#71717a]"
                          }`}
                        >
                          {p ? (
                            <>
                              <img 
                                src={p.image} 
                                alt={p.name} 
                                className="w-8 h-10 sm:w-9 sm:h-11 rounded-lg object-cover object-top border border-[#27272a] shrink-0" 
                                onError={(e) => {
                                  e.target.src = "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400&auto=format&fit=crop&q=80";
                                }}
                              />
                              <div className="min-w-0">
                                <div className="text-[9px] sm:text-[10px] font-semibold text-cyan-400 truncate">#{pos + 1} • {p.role}</div>
                                <div className="text-[11px] sm:text-xs font-heading font-bold text-white truncate">{p.name}</div>
                                <div className="text-[9px] sm:text-[10px] font-mono text-[#9ca3af]">{formatCurrency(p.soldPrice)}</div>
                              </div>
                            </>
                          ) : (
                            <div className="py-2.5 text-center w-full text-[11px] text-[#71717a] font-semibold">
                              Slot #{pos + 1}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bowlers (8-11) */}
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-rose-400 mb-2 flex items-center gap-1.5">
                    <span>⚡ Bowling Attack (Pace & Spin)</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2.5">
                    {[7, 8, 9, 10].map((pos) => {
                      const p = playingXI[pos];
                      return (
                        <div 
                          key={`bowl-${pos}`}
                          className={`p-2 sm:p-2.5 rounded-2xl border transition flex items-center gap-2 sm:gap-2.5 ${
                            p 
                              ? "bg-[#121212] border-[#27272a] shadow-md hover:border-[#3f3f46]" 
                              : "bg-[#050505] border-dashed border-[#27272a] text-[#71717a]"
                          }`}
                        >
                          {p ? (
                            <>
                              <img 
                                src={p.image} 
                                alt={p.name} 
                                className="w-8 h-10 sm:w-9 sm:h-11 rounded-lg object-cover object-top border border-[#27272a] shrink-0" 
                                onError={(e) => {
                                  e.target.src = "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400&auto=format&fit=crop&q=80";
                                }}
                              />
                              <div className="min-w-0">
                                <div className="text-[9px] sm:text-[10px] font-semibold text-rose-400 truncate">#{pos + 1} • {p.role}</div>
                                <div className="text-[11px] sm:text-xs font-heading font-bold text-white truncate">{p.name}</div>
                                <div className="text-[9px] sm:text-[10px] font-mono text-[#9ca3af]">{formatCurrency(p.soldPrice)}</div>
                              </div>
                            </>
                          ) : (
                            <div className="py-2.5 text-center w-full text-[11px] text-[#71717a] font-semibold">
                              Slot #{pos + 1}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* SQUAD LIST VIEW */
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3.5">
                  {squad.map((player) => (
                    <div 
                      key={player.id}
                      className="p-3 sm:p-4 rounded-2xl bg-[#121212] border border-[#27272a] flex items-center justify-between gap-3 hover:border-[#3f3f46] transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={player.image}
                          alt={player.name}
                          className="w-12 h-14 sm:w-14 sm:h-16 rounded-xl object-cover object-top border border-[#27272a] shrink-0"
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400&auto=format&fit=crop&q=80";
                          }}
                        />
                        <div className="min-w-0">
                          <div className="text-sm sm:text-base font-heading font-bold text-white leading-tight truncate">{player.name}</div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full border ${getRoleBadgeClass(player.role)}`}>
                              {player.role}
                            </span>
                            <span className="text-[10px] sm:text-xs text-[#9ca3af]">
                              {player.isOverseas ? "✈️ Overseas" : "🇮🇳 Indian"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs sm:text-sm font-mono font-bold text-amber-400">
                          {formatCurrency(player.soldPrice)}
                        </div>
                        <div className="text-[10px] text-[#71717a]">Sold At</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
