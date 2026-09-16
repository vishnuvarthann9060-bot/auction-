import React, { useState } from "react";
import { useSocket } from "../context/SocketContext";
import { formatCurrency } from "../utils/formatters";
import { TEAMS_DATA } from "../data/teams";
import { Volume2, VolumeX, Copy, Check, Users, Shield, Trophy, Share2, Sparkles } from "lucide-react";

export function Navbar({ onOpenSquads }) {
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
    <header className="w-full bg-[#0d1322]/90 backdrop-blur-md border-b border-white/10 px-4 lg:px-8 py-3 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo & Free Badge */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-300 shadow-lg shadow-amber-500/20">
            <span className="font-teko text-2xl font-bold text-slate-950 tracking-wider">IPL</span>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-amber-200 bg-clip-text text-transparent">
                MEGA AUCTION
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                100% FREE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">Open Multiplayer Cricket Bidding Arena</p>
          </div>
        </div>

        {/* Room PIN & Quick Share */}
        {roomState && (
          <div className="flex items-center gap-2">
            <button
              onClick={copyShareLink}
              title="Click to copy full invite link"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition group cursor-pointer"
            >
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">ROOM:</span>
              <span className="font-mono font-bold text-amber-400 tracking-wider">{roomState.id}</span>
              {copiedLink ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition" />
              )}
            </button>

            {/* 1-Tap WhatsApp Share */}
            <button
              onClick={shareOnWhatsApp}
              title="Share Room to WhatsApp cricket group"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 text-xs font-bold transition cursor-pointer"
            >
              <span>📲 WhatsApp</span>
            </button>

            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {connected ? "LIVE SYNC" : "OFFLINE"}
            </div>
          </div>
        )}

        {/* Right Actions: Team Badge, Sound Toggle, Squads */}
        <div className="flex items-center gap-2 sm:gap-3">
          {myTeam ? (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${teamMeta?.borderClass || 'border-slate-700'} bg-slate-900/90 shadow-sm`}>
              <span className="text-base">{teamMeta?.logoEmoji || "🏏"}</span>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-bold ${teamMeta?.textClass || 'text-white'}`}>
                    {myTeam.shortName}
                  </span>
                  {isHost && (
                    <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1 rounded font-bold">HOST</span>
                  )}
                </div>
                <div className="text-[11px] font-mono text-emerald-400 font-semibold">
                  {formatCurrency(myTeam.purse)}
                </div>
              </div>
            </div>
          ) : (
            <span className="text-xs text-slate-400 italic hidden sm:block">Spectator Mode</span>
          )}

          {/* Squad Viewer Button */}
          {roomState && (
            <button
              onClick={onOpenSquads}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Rosters</span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundMuted ? "Unmute Audio" : "Mute Audio"}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 hover:text-white transition cursor-pointer"
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>

      </div>
    </header>
  );
}
