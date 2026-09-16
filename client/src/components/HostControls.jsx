import React from "react";
import { useSocket } from "../context/SocketContext";
import { 
  Pause, Play, FastForward, Gavel, XCircle, 
  ShieldAlert, PlusCircle, Sparkles 
} from "lucide-react";

export function HostControls({ onOpenCustomPlayer }) {
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
    <div className="glass-panel px-4 py-3 rounded-2xl border border-amber-500/30 flex flex-wrap items-center justify-between gap-3 shadow-lg bg-slate-950/80">
      <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
        <ShieldAlert className="w-4 h-4 text-amber-400" />
        <span className="uppercase tracking-wider">Host Auctioneer Console:</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Pause / Resume */}
        <button
          onClick={hostTogglePause}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            isPaused
              ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
              : "bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700"
          }`}
        >
          {isPaused ? <Play className="w-3.5 h-3.5 fill-slate-950" /> : <Pause className="w-3.5 h-3.5" />}
          <span>{isPaused ? "Resume Timer" : "Pause Timer"}</span>
        </button>

        {/* Force Sold */}
        <button
          onClick={hostForceSell}
          disabled={!hasBids}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            hasBids
              ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
              : "bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed"
          }`}
        >
          <Gavel className="w-3.5 h-3.5" />
          <span>Hammer SOLD!</span>
        </button>

        {/* Mark Unsold */}
        <button
          onClick={hostMarkUnsold}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-rose-400 border border-slate-700 transition cursor-pointer"
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>Mark Unsold</span>
        </button>

        {/* Next Player */}
        <button
          onClick={hostNextPlayer}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
        >
          <FastForward className="w-3.5 h-3.5" />
          <span>Next Lot</span>
        </button>

        {/* Add Player */}
        <button
          onClick={onOpenCustomPlayer}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Inject Player</span>
        </button>
      </div>
    </div>
  );
}
