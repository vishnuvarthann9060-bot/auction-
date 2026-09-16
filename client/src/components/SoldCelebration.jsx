import React from "react";
import { useSocket } from "../context/SocketContext";
import { formatCurrency } from "../utils/formatters";
import { TEAMS_DATA } from "../data/teams";
import { Gavel, Sparkles, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function SoldCelebration() {
  const { roomState } = useSocket();
  const auction = roomState?.currentAuction;

  if (!auction || (auction.status !== "SOLD" && auction.status !== "UNSOLD")) {
    return null;
  }

  const isSold = auction.status === "SOLD";
  const winnerTeam = isSold && auction.highestBidderTeamId
    ? roomState.teams.find(t => t.id === auction.highestBidderTeamId)
    : null;
  const meta = winnerTeam ? TEAMS_DATA[winnerTeam.id] : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center p-4"
      >
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border-2 border-amber-400/80 shadow-2xl shadow-amber-500/30 text-center max-w-md w-full bg-slate-950/95 pointer-events-auto">
          
          {isSold ? (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto animate-bounce shadow-lg shadow-amber-500/20">
                <Gavel className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs uppercase tracking-widest font-black text-amber-400 bg-amber-500/15 px-3 py-1 rounded-full border border-amber-500/30">
                  OFFICIALLY SOLD
                </span>
                <h2 className="text-4xl font-black text-white mt-2 tracking-tight">
                  {auction.player.name}
                </h2>
              </div>

              <div className="py-2">
                <div className="text-xs text-slate-400">Winning Franchise:</div>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="text-2xl">{meta?.logoEmoji || "🏏"}</span>
                  <span className={`text-xl font-black ${meta?.textClass || 'text-white'}`}>
                    {winnerTeam?.name}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Secured by <strong className="text-white">{auction.highestBidderName}</strong>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-amber-500/30">
                <div className="text-[10px] uppercase font-bold text-slate-400">Final Winning Bid</div>
                <div className="text-3xl font-black font-teko text-amber-400 tracking-wider">
                  {formatCurrency(auction.currentBid)}
                </div>
              </div>

              <p className="text-[11px] text-slate-500 italic animate-pulse">
                Next player appearing on stage in a few seconds...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Gavel className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs uppercase tracking-widest font-black text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                  PASSED
                </span>
                <h2 className="text-3xl font-black text-white mt-2">
                  {auction.player.name}
                </h2>
              </div>

              <p className="text-sm text-slate-400">
                No bids were placed at base price ({formatCurrency(auction.player.basePrice)}). Player goes to the unsold pool.
              </p>

              <p className="text-[11px] text-slate-500 italic animate-pulse">
                Next player appearing in a few seconds...
              </p>
            </div>
          )}

        </div>
      </motion.div>
    </AnimatePresence>
  );
}
