import React, { useState } from "react";
import { useSocket } from "../context/SocketContext";
import { formatCurrency, getRoleBadgeClass } from "../utils/formatters";
import { TEAMS_DATA } from "../data/teams";
import { X, Shield, DollarSign, Users, Award, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function SquadModal({ isOpen, onClose, initialTeamId }) {
  const { roomState } = useSocket();
  const [selectedTeamId, setSelectedTeamId] = useState(initialTeamId || "csk");

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
          className="w-full max-w-4xl max-h-[90vh] glass-panel rounded-3xl border border-white/10 shadow-2xl relative z-10 flex flex-col overflow-hidden"
        >
          {/* Top Bar with Franchise Tabs */}
          <div className="p-4 sm:p-6 pb-3 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{meta?.logoEmoji || "🏏"}</span>
              <div>
                <h3 className="text-xl font-black text-white">{currentTeam.name}</h3>
                <p className="text-xs text-slate-400">
                  Managed by <strong className="text-amber-400">{currentTeam.ownerName || "Unassigned"}</strong>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Franchise Select Carousel Bar */}
          <div className="flex items-center gap-1.5 px-4 sm:px-6 py-2.5 bg-slate-950/60 overflow-x-auto border-b border-white/5 scrollbar-none">
            {roomState.teams.map((t) => {
              const isActive = t.id === selectedTeamId;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTeamId(t.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 cursor-pointer ${
                    isActive 
                      ? "bg-amber-500 text-slate-950 shadow-md font-extrabold" 
                      : "bg-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  <span>{TEAMS_DATA[t.id]?.logoEmoji}</span>
                  <span>{t.shortName}</span>
                  <span className="text-[10px] opacity-75">({t.squad.length})</span>
                </button>
              );
            })}
          </div>

          {/* Summary Pills Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 sm:p-6 py-3 bg-slate-900/40 border-b border-white/5">
            <div className="glass-card p-2 rounded-xl text-center">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Total Spent</div>
              <div className="text-sm font-black text-amber-400 font-mono">{formatCurrency(totalSpent)}</div>
            </div>
            <div className="glass-card p-2 rounded-xl text-center">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Purse Remaining</div>
              <div className="text-sm font-black text-emerald-400 font-mono">{formatCurrency(currentTeam.purse)}</div>
            </div>
            <div className="glass-card p-2 rounded-xl text-center">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Squad Size</div>
              <div className="text-sm font-black text-white">{squad.length} / {roomState.rules.maxSquadSize}</div>
            </div>
            <div className="glass-card p-2 rounded-xl text-center">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Overseas Quota</div>
              <div className="text-sm font-black text-blue-400">{overseasCount} / {roomState.rules.maxOverseas}</div>
            </div>
          </div>

          {/* Player Roster Content */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
            {squad.length === 0 ? (
              <div className="py-16 text-center text-slate-500">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-semibold">No players acquired yet.</p>
                <p className="text-xs text-slate-600 mt-1">Winning bids for {currentTeam.shortName} will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Roster Table / Card Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {squad.map((player) => (
                    <div 
                      key={player.id}
                      className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5 flex items-center justify-between gap-3 hover:border-white/10 transition"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={player.image}
                          alt={player.name}
                          className="w-12 h-14 rounded-xl object-cover object-top border border-white/10 shrink-0"
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400&auto=format&fit=crop&q=80";
                          }}
                        />
                        <div>
                          <div className="text-sm font-black text-white leading-tight">{player.name}</div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${getRoleBadgeClass(player.role)}`}>
                              {player.role}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {player.isOverseas ? "✈️ Overseas" : "🇮🇳 Indian"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-mono font-black text-amber-400">
                          {formatCurrency(player.soldPrice)}
                        </div>
                        <div className="text-[10px] text-slate-500">Won At</div>
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
