import React from "react";
import { useSocket } from "../context/SocketContext";
import { 
  Pause, Play, FastForward, Gavel, XCircle, 
  ShieldAlert, PlusCircle, Sparkles, Trophy 
} from "lucide-react";

export function HostControls({ onOpenTournament }) {
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
      <div className="flex items-center gap-2">
        <span className="text-xs uppercase font-heading font-bold tracking-[0.1em] text-[#818cf8] flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5" /> HOST CONTROLS:
        </span>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
        {/* Pause / Resume */}
        <button
          onClick={hostTogglePause}
          className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold transition cursor-pointer ${
            isPaused
              ? "bg-[#6366f1] text-white hover:bg-[#4f46e5]"
              : "bg-[#1e1e1e] hover:bg-[#27272a] text-[#f3f4f6] border border-[#27272a]"
          }`}
        >
          {isPaused ? <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-white" /> : <Pause className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
          <span>{isPaused ? "Resume" : "Pause"}</span>
        </button>

        {/* Force Sell */}
        <button
          onClick={hostForceSell}
          disabled={!hasBids}
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold bg-[#1e1e1e] hover:bg-[#27272a] text-emerald-400 border border-[#27272a] disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
        >
          <Gavel className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span>Sell Now</span>
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
          <span>Next Player</span>
        </button>

        {/* Simulate IPL Tournament */}
        <button
          onClick={onOpenTournament}
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition cursor-pointer"
        >
          <Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
          <span>Match Simulator</span>
        </button>
      </div>
    </div>
  );
}
