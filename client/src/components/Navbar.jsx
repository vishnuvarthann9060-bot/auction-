import React, { useState } from "react";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";
import { formatCurrency } from "../utils/formatters";
import { TEAMS_DATA } from "../data/teams";
import TeamLogo from "./TeamLogo";
import { Volume2, VolumeX, Copy, Check, Users, Shield, Trophy, Share2, Sparkles, UserCheck } from "lucide-react";

export function Navbar({ onOpenSquads, onOpenTournament, onOpenGoogleSignIn, onOpenUserProfile }) {
  const { roomState, myTeam, isHost, soundMuted, toggleSound, connected } = useSocket();
  const { user, careerStats } = useAuth();
  const [copiedLink, setCopiedLink] = useState(false);

  const copyShareLink = () => {
    if (!roomState?.id) return;
    const url = `${window.location.origin}/?room=${roomState.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const shareOnWhatsApp = () => {
    if (!roomState?.id) return;
    const url = `${window.location.origin}/?room=${roomState.id}`;
    const text = encodeURIComponent(`🏏 Join my IPL Mega Auction Arena!\n🏆 Room PIN: ${roomState.id}\n💰 Purse: ₹100 Cr\n\nPick your franchise (CSK, MI, RCB, KKR) and let's bid:\n${url}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const teamMeta = myTeam ? TEAMS_DATA[myTeam.id] : null;

  return (
    <header className="w-full bg-[#050505]/95 backdrop-blur-md border-b border-[#27272a] px-3 sm:px-6 lg:px-8 py-3 sm:py-3.5 sticky top-0 z-40">
      <div className="max-w-[1600px] w-full mx-auto flex items-center justify-between gap-2.5">
        
        {/* Brand Logo & Free Badge */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
          <div className="relative flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-[#6366f1] via-[#8b5cf6] to-[#a855f7] shadow-lg shadow-[#6366f1]/25">
            <span className="font-heading text-base sm:text-xl font-black text-white tracking-tight">IPL</span>
            <div className="absolute -top-1 -right-1 w-2.5 sm:w-3 h-2.5 sm:h-3 bg-[#10b981] rounded-full animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-heading font-extrabold text-base sm:text-xl tracking-[-0.03em] text-white whitespace-nowrap">
                MEGA AUCTION
              </span>
              <span className="hidden sm:inline-block text-[11px] sm:text-xs uppercase font-bold tracking-[0.1em] px-2.5 py-0.5 rounded-full bg-[#6366f1]/20 text-[#a5b4fc] border border-[#6366f1]/40">
                FREE
              </span>
            </div>
            <p className="text-xs text-[#9ca3af] font-normal hidden md:block">Live Cricket Auction Game</p>
          </div>
        </div>

        {/* Room PIN & Quick Share */}
        {roomState && (
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button
              onClick={copyShareLink}
              title="Click to copy full invite link"
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-[#121212] hover:bg-[#1e1e1e] border border-[#27272a] transition group cursor-pointer text-xs sm:text-sm"
            >
              <span className="text-[10px] sm:text-xs text-[#9ca3af] uppercase tracking-[0.08em] font-semibold hidden xs:inline">CODE:</span>
              <span className="font-mono font-bold text-amber-400 tracking-wider text-xs sm:text-base">{roomState.id}</span>
              {copiedLink ? (
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
              ) : (
                <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#9ca3af] group-hover:text-white transition shrink-0" />
              )}
            </button>

            {/* 1-Tap WhatsApp Share */}
            <button
              onClick={shareOnWhatsApp}
              title="Share Room to WhatsApp cricket group"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-semibold transition cursor-pointer"
            >
              <span>📲 WhatsApp</span>
            </button>

            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {connected ? "LIVE SYNC" : "OFFLINE"}
            </div>
          </div>
        )}

        {/* Right Actions: Team Badge, Sound Toggle, Squads */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {myTeam ? (
            <div className={`flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl border ${teamMeta?.borderClass || 'border-[#27272a]'} bg-[#121212] shadow-sm`}>
              <TeamLogo meta={teamMeta} size="sm" />
              <div className="text-left">
                <div className="flex items-center gap-1">
                  <span className={`text-xs sm:text-sm font-bold ${teamMeta?.textClass || 'text-white'}`}>
                    {myTeam.shortName}
                  </span>
                  {isHost && (
                    <span className="text-[9px] sm:text-[10px] bg-[#6366f1]/25 text-[#a5b4fc] px-1.5 py-0.5 rounded font-bold">HOST</span>
                  )}
                </div>
                <div className="text-xs sm:text-sm font-mono text-emerald-400 font-bold">
                  {formatCurrency(myTeam.purse)}
                </div>
              </div>
            </div>
          ) : null}

          {/* Google Sign-In or User Career Profile */}
          {user ? (
            <button
              onClick={onOpenUserProfile}
              title="View Google Career Profile & Saved Squads"
              className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#121212] hover:bg-[#1c1c20] border border-[#27272a] hover:border-[#6366f1]/60 transition cursor-pointer group shadow-sm"
            >
              <div className="relative">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-[#6366f1]"
                  />
                ) : (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-[#6366f1] to-[#a855f7] text-white flex items-center justify-center text-xs font-bold font-heading">
                    {user.name?.charAt(0) || 'M'}
                  </div>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#121212]" />
              </div>

              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-white group-hover:text-amber-300 transition truncate max-w-[110px]">
                  {user.name?.split(' ')[0]}
                </div>
                <div className="text-[10px] text-[#9ca3af] flex items-center gap-1 font-medium">
                  <span>Saved</span>
                  {careerStats?.tournamentsWon > 0 && (
                    <span className="text-amber-400 font-bold">🏆 {careerStats.tournamentsWon}</span>
                  )}
                </div>
              </div>
            </button>
          ) : (
            <button
              onClick={onOpenGoogleSignIn}
              title="Sign In with Google to save progress & teams"
              className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-white hover:bg-gray-100 text-[#1f2937] text-xs sm:text-sm font-heading font-bold shadow-lg shadow-white/10 transition cursor-pointer group"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.13C3.26 21.43 7.31 24 12 24z" />
                <path fill="#FBBC05" d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.24C.45 8.16 0 9.98 0 12s.45 3.84 1.24 5.42l4.04-3.13z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.57 1.24 6.58l4.04 3.13c.95-2.83 3.6-4.96 6.72-4.96z" />
              </svg>
              <span>Sign In with Google</span>
            </button>
          )}

          {/* Tournament Simulator Button */}
          {roomState && (
            <button
              onClick={onOpenTournament}
              title="Play tournament matches between teams"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-300 text-xs sm:text-sm font-semibold transition cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">Match Simulator</span>
            </button>
          )}

          {/* Squad Viewer Button */}
          {roomState && (
            <button
              onClick={onOpenSquads}
              title="View all team rosters"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#121212] hover:bg-[#1e1e1e] border border-[#27272a] text-[#f3f4f6] text-xs sm:text-sm font-semibold transition cursor-pointer"
            >
              <Users className="w-4 h-4 text-[#818cf8]" />
              <span className="hidden sm:inline">View Teams</span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundMuted ? "Unmute Audio" : "Mute Audio"}
            className="p-2 sm:p-2.5 rounded-xl bg-[#121212] hover:bg-[#1e1e1e] border border-[#27272a] text-[#9ca3af] hover:text-white transition cursor-pointer"
          >
            {soundMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />}
          </button>
        </div>

      </div>
    </header>
  );
}
