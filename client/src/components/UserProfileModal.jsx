import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';
import { 
  X, Trophy, Shield, Award, Users, LogOut, Sparkles, 
  ExternalLink, ChevronDown, ChevronUp, CheckCircle, Clock 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function UserProfileModal({ isOpen, onClose, onResumeRoom }) {
  const { user, careerStats, savedSquads, activeRoomId, setActiveRoomId, logout } = useAuth();
  const [expandedSquadId, setExpandedSquadId] = useState(null);

  if (!isOpen || !user) return null;

  const toggleExpand = (squadId) => {
    setExpandedSquadId(prev => prev === squadId ? null : squadId);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-[#0f0f10] border border-[#27272a] rounded-3xl p-5 sm:p-7 shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
        >
          {/* Backlight */}
          <div className="absolute -top-32 -right-32 w-72 h-72 bg-[#6366f1]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#27272a]">
            <div className="flex items-center gap-3">
              <div className="relative">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover border-2 border-[#6366f1] shadow-lg shadow-[#6366f1]/20"
                  />
                ) : (
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-[#6366f1] to-[#a855f7] flex items-center justify-center text-white font-heading font-black text-xl">
                    {user.name?.charAt(0) || 'M'}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#0f0f10]" title="Signed In & Synced" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-heading font-bold text-white">{user.name}</h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Google Synced
                  </span>
                </div>
                <p className="text-xs text-[#9ca3af]">{user.email || 'Google Account Linked'}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#18181b] hover:bg-[#27272a] text-[#9ca3af] hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Scrollable Body */}
          <div className="flex-1 overflow-y-auto py-4 space-y-5 custom-scrollbar pr-1">

            {/* Active Room Quick-Jump (If currently in a live match) */}
            {activeRoomId && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 border border-amber-500/35 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                  <div>
                    <div className="text-xs font-bold text-amber-300">Live Auction in Progress</div>
                    <div className="text-[11px] text-[#9ca3af]">Room PIN: <span className="font-mono text-white font-bold">{activeRoomId}</span></div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (setActiveRoomId) setActiveRoomId(null);
                      localStorage.removeItem('ipl_active_room_id');
                    }}
                    title="Ignore active room"
                    className="px-2.5 py-1.5 rounded-xl bg-[#1e1e1e] hover:bg-[#27272a] text-[#9ca3af] hover:text-white text-xs font-semibold border border-[#27272a] hover:border-[#3f3f46] transition cursor-pointer"
                  >
                    <span>Ignore</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onResumeRoom) onResumeRoom(activeRoomId);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-heading font-bold shadow-md shadow-amber-500/20 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Resume Stage</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Career Statistics Grid */}
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-white">
                  Franchise Career Record
                </h4>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-2xl bg-[#141416] border border-[#27272a] text-center">
                  <div className="text-lg sm:text-xl font-heading font-black text-white">{careerStats.auctionsJoined}</div>
                  <div className="text-[10px] text-[#9ca3af] font-medium mt-0.5">Auctions Joined</div>
                </div>

                <div className="p-3 rounded-2xl bg-[#141416] border border-[#27272a] text-center">
                  <div className="text-lg sm:text-xl font-heading font-black text-amber-400">{careerStats.tournamentsWon}</div>
                  <div className="text-[10px] text-[#9ca3af] font-medium mt-0.5">IPL Titles Won 🏆</div>
                </div>

                <div className="p-3 rounded-2xl bg-[#141416] border border-[#27272a] text-center">
                  <div className="text-lg sm:text-xl font-heading font-black text-[#818cf8]">{careerStats.playersBought}</div>
                  <div className="text-[10px] text-[#9ca3af] font-medium mt-0.5">Players Bought</div>
                </div>

                <div className="p-3 rounded-2xl bg-[#141416] border border-[#27272a] text-center">
                  <div className="text-sm sm:text-base font-heading font-black text-emerald-400 truncate">
                    {formatCurrency(careerStats.totalPurseSpent)}
                  </div>
                  <div className="text-[10px] text-[#9ca3af] font-medium mt-0.5">Purse Spent</div>
                </div>
              </div>
            </div>

            {/* Saved Dream Squads Cabinet */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#818cf8]" />
                  <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-white">
                    Saved Championship Squads ({savedSquads.length})
                  </h4>
                </div>
                <span className="text-[10px] text-[#6b7280]">Saved permanently to your Google profile</span>
              </div>

              {savedSquads.length === 0 ? (
                <div className="p-6 rounded-2xl bg-[#141416] border border-dashed border-[#27272a] text-center text-xs text-[#9ca3af]">
                  No saved squads yet! When an auction ends, click <span className="text-amber-300 font-bold">"Save Squad to Profile"</span> to keep your dream team forever.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {savedSquads.map((squad) => {
                    const isExpanded = expandedSquadId === squad.id;
                    return (
                      <div
                        key={squad.id}
                        className="rounded-2xl bg-[#141416] border border-[#27272a] overflow-hidden transition"
                      >
                        <div
                          onClick={() => toggleExpand(squad.id)}
                          className="p-3 sm:p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-[#1c1c20] transition"
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-8 h-8 rounded-xl flex items-center justify-center font-heading font-black text-xs text-black"
                              style={{ backgroundColor: squad.color || '#F59E0B' }}
                            >
                              {squad.shortName}
                            </div>
                            <div>
                              <div className="text-xs sm:text-sm font-bold text-white">{squad.teamName}</div>
                              <div className="text-[10px] text-[#9ca3af] flex items-center gap-2">
                                <span>{squad.totalPlayers} Players</span>
                                <span>•</span>
                                <span className="text-emerald-400 font-semibold">{formatCurrency(squad.totalSpent)} Spent</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-[#6b7280] hidden sm:inline">
                              {new Date(squad.savedAt).toLocaleDateString()}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-[#9ca3af]" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-[#9ca3af]" />
                            )}
                          </div>
                        </div>

                        {/* Expanded Squad Roster */}
                        {isExpanded && (
                          <div className="px-3 pb-3 pt-1 border-t border-[#27272a]/60 bg-[#0a0a0a]">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mt-2">
                              {squad.squad?.map((player, idx) => (
                                <div
                                  key={idx}
                                  className="p-2 rounded-lg bg-[#141416] border border-[#27272a] flex items-center justify-between gap-1 text-[11px]"
                                >
                                  <div className="truncate">
                                    <span className="font-bold text-white truncate block">{player.name}</span>
                                    <span className="text-[9px] text-[#9ca3af]">{player.role}</span>
                                  </div>
                                  <span className="text-[10px] font-mono text-amber-300 shrink-0">
                                    {formatCurrency(player.soldPrice || player.basePrice)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#27272a] flex items-center justify-between gap-3">
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[#1e1e22] hover:bg-[#27272a] text-white text-xs font-semibold transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
