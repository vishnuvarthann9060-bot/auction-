import React from "react";
import { useSocket } from "../context/SocketContext";
import { 
  Pause, Play, FastForward, Gavel, XCircle, 
  ShieldAlert, PlusCircle, Sparkles, Trophy 
} from "lucide-react";

export function HostControls({ onOpenCustomPlayer, onOpenTournament }) {
  const { 
    isHost, 
    roomState, 
    hostForceSell, 
    hostMarkUnsold, 
    hostNextPlayer, 
    hostTogglePause 
  } = useSocket();

  if (!isHost || !roomState || roomState.status === "LOBBY") return null;

  const isPaused = roomState.status === "PAUSED";
  const currentAuction = roomState.currentAuction;
  const hasBids = currentAuction && currentAuction.currentBid > 0;

  return (
    <div className="glass-panel px-3 py-2 sm:px-4 sm:py-3 rounded-2xl border border-[#27272a] flex flex-wrap items-center justify-between gap-2 sm:gap-3 shadow-lg bg-[#121212]">
      <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-semibold text-[#818cf8]">
        <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#818cf8]" />
        <span className="uppercase tracking-[0.08em] font-heading text-[11px] sm:text-xs">Auctioneer Console:</span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {/* Pause / Resume */}
        <button
          onClick={hostTogglePause}
          className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold transition cursor-pointer border ${
            isPaused
              ? "bg-[#6366f1] hover:bg-[#4f46e5] text-white border-[#6366f1]"
              : "bg-[#1e1e1e] hover:bg-[#27272a] text-[#f3f4f6] border-[#27272a]"
          }`}
        >
          {isPaused ? <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-white" /> : <Pause className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
          <span>{isPaused ? "Resume" : "Pause"}</span>
        </button>

        {/* Force Sold */}
        <button
          onClick={hostForceSell}
          disabled={!hasBids}
          className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold transition cursor-pointer ${
            hasBids
              ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
              : "bg-[#0a0a0a] text-[#71717a] border border-[#27272a] cursor-not-allowed"
          }`}
        >
          <Gavel className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span>Hammer SOLD!</span>
        </button>

        {/* Mark Unsold */}
        <button
          onClick={hostMarkUnsold}
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold bg-[#1e1e1e] hover:bg-[#27272a] text-rose-400 border border-[#27272a] transition cursor-pointer"
        >
          <XCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span>Pass Unsold</span>
        </button>

        {/* Next Player */}
        <button
          onClick={hostNextPlayer}
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold bg-[#1e1e1e] hover:bg-[#27272a] text-[#f3f4f6] border border-[#27272a] transition cursor-pointer"
        >
          <FastForward className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span>Next Lot</span>
        </button>

        {/* Add Player */}
        <button
          onClick={onOpenCustomPlayer}
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold bg-[#6366f1]/15 hover:bg-[#6366f1]/25 text-[#818cf8] border border-[#6366f1]/30 transition cursor-pointer"
        >
          <PlusCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span>Inject Player</span>
        </button>

        {/* Simulate IPL Tournament */}
        <button
          onClick={onOpenTournament}
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition cursor-pointer"
        >
          <Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
          <span>Simulate IPL</span>
        </button>
      </div>
    </div>
  );
}
