import React, { useState } from "react";
import { useSocket } from "../context/SocketContext";
import { formatCurrency } from "../utils/formatters";
import { TEAMS_DATA } from "../data/teams";
import { Volume2, VolumeX, Copy, Check, Users, Shield, Trophy, Share2, Sparkles } from "lucide-react";

export function Navbar({ onOpenSquads, onOpenTournament }) {
  const { roomState, myTeam, isHost, soundMuted, toggleSound, connected } = useSocket();
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
            <p className="text-xs text-[#9ca3af] font-normal hidden md:block">Real-Time Cricket Auction Arena</p>
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
              <span className="text-[10px] sm:text-xs text-[#9ca3af] uppercase tracking-[0.08em] font-semibold hidden xs:inline">PIN:</span>
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
              <span className="text-base sm:text-xl">{teamMeta?.logoEmoji || "🏏"}</span>
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
          ) : (
            <span className="text-xs sm:text-sm text-[#9ca3af] italic hidden md:block">Spectator</span>
          )}

          {/* Tournament Simulator Button */}
          {roomState && (
            <button
              onClick={onOpenTournament}
              title="Simulate IPL Tournament & Playoffs"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-300 text-xs sm:text-sm font-semibold transition cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">Simulate IPL</span>
            </button>
          )}

          {/* Squad Viewer Button */}
          {roomState && (
            <button
              onClick={onOpenSquads}
              title="Inspect Squad Rosters"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#121212] hover:bg-[#1e1e1e] border border-[#27272a] text-[#f3f4f6] text-xs sm:text-sm font-semibold transition cursor-pointer"
            >
              <Users className="w-4 h-4 text-[#818cf8]" />
              <span className="hidden sm:inline">Rosters</span>
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
