import React from "react";
import { useSocket } from "../context/SocketContext";
import { formatCurrency } from "../utils/formatters";
import { TEAMS_DATA } from "../data/teams";
import { PlayerPortrait } from "./PlayerPortrait";
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
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#27272a] shadow-2xl text-center max-w-md w-full bg-[#121212]/95 pointer-events-auto relative overflow-hidden">
          {/* Golden accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />
          
          {isSold ? (
            <div className="space-y-3.5">
              <div className="flex justify-center">
                <PlayerPortrait player={auction.player} size="md" />
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-[0.15em] font-bold gold-shimmer-text bg-amber-500/10 px-3.5 py-1 rounded-full border border-amber-500/30">
                  OFFICIALLY SOLD
                </span>
                <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-white mt-2 tracking-[-0.03em]">
                  {auction.player.name}
                </h2>
              </div>

              <div className="py-2">
                <div className="text-xs text-[#9ca3af]">Winning Franchise:</div>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="text-2xl">{meta?.logoEmoji || "🏏"}</span>
                  <span className={`text-xl font-heading font-bold ${meta?.textClass || 'text-white'}`}>
                    {winnerTeam?.name}
                  </span>
                </div>
                <div className="text-xs text-[#9ca3af] mt-0.5">
                  Secured by <strong className="text-white">{auction.highestBidderName}</strong>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#050505] border border-[#27272a]">
                <div className="text-[10px] uppercase tracking-[0.08em] font-semibold text-[#9ca3af]">Final Winning Bid</div>
                <div className="text-3xl font-teko font-bold text-amber-400 tracking-wider">
                  {formatCurrency(auction.currentBid)}
                </div>
              </div>

              <p className="text-[11px] text-[#71717a] italic animate-pulse">
                Next player appearing on stage in a few seconds...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#1e1e1e] text-[#9ca3af] flex items-center justify-center mx-auto border border-[#27272a]">
                <Gavel className="w-8 h-8" />
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-[0.1em] font-semibold text-[#9ca3af] bg-[#1e1e1e] px-3 py-1 rounded-full border border-[#27272a]">
                  PASSED
                </span>
                <h2 className="text-3xl font-heading font-bold text-white mt-2.5 tracking-[-0.03em]">
                  {auction.player.name}
                </h2>
              </div>

              <p className="text-sm text-[#9ca3af] leading-relaxed">
                No bids were placed at base price ({formatCurrency(auction.player.basePrice)}). Player goes to the unsold pool.
              </p>

              <p className="text-[11px] text-[#71717a] italic animate-pulse">
                Next player appearing in a few seconds...
              </p>
            </div>
          )}

        </div>
      </motion.div>
    </AnimatePresence>
  );
}
