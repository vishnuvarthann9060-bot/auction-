import React from "react";
import { useSocket } from "../context/SocketContext";
import { formatCurrency } from "../utils/formatters";
import { TEAMS_DATA } from "../data/teams";
import { Gavel, AlertCircle, Shield, CheckCircle, Zap } from "lucide-react";
import { motion } from "framer-motion";

export function BiddingControls() {
  const { roomState, myTeam, placeBid, sendReaction, errorMessage } = useSocket();
  const auction = roomState?.currentAuction;

  if (!auction || !auction.player) return null;

  const player = auction.player;
  const isAuctionPaused = roomState.status === "PAUSED";
  const isHoldingHighestBid = myTeam && auction.highestBidderTeamId === myTeam.id;

  // Calculate my team's squad limits
  const currentOverseasCount = myTeam ? myTeam.squad.filter(p => p.isOverseas).length : 0;
  const isOverseasMaxed = myTeam && player.isOverseas && currentOverseasCount >= (roomState.rules?.maxOverseas || 8);
  const isSquadFull = myTeam && myTeam.squad.length >= (roomState.rules?.maxSquadSize || 25);

  const teamMeta = myTeam ? TEAMS_DATA[myTeam.id] : null;
  const bidOptions = auction.bidOptions || [player.basePrice];

  if (!myTeam) {
    return (
      <div className="glass-panel p-5 rounded-2xl border border-[#27272a] text-center bg-[#121212]">
        <div className="text-xs sm:text-sm text-[#818cf8] font-medium flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          You are currently in spectator mode. To bid, select an available franchise in the Lobby.
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-[#27272a] space-y-3.5 sm:space-y-5 shadow-2xl bg-[#121212]">
      
      {/* Top Status Bar: My Franchise Health */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 sm:pb-3.5 border-b border-[#27272a]">
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          <div className="text-2xl sm:text-3xl">{teamMeta?.logoEmoji || "🏏"}</div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-sm sm:text-base font-heading font-bold ${teamMeta?.textClass || 'text-white'}`}>
                {myTeam.name}
              </span>
              <span className="text-[11px] sm:text-xs font-mono font-bold bg-[#1e1e1e] border border-[#27272a] px-2 py-0.5 rounded text-[#9ca3af]">
                {myTeam.shortName}
              </span>
            </div>
            <div className="text-xs text-[#9ca3af] flex items-center gap-3 mt-0.5">
              <span>Squad: <strong className="text-white">{myTeam.squad.length}</strong>/{roomState.rules.maxSquadSize}</span>
              <span>Overseas: <strong className="text-white">{currentOverseasCount}</strong>/{roomState.rules.maxOverseas}</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] sm:text-xs uppercase tracking-[0.08em] font-semibold text-[#9ca3af]">Available Purse</div>
          <div className="text-lg sm:text-2xl font-heading font-bold text-emerald-400">
            {formatCurrency(myTeam.purse)}
          </div>
        </div>
      </div>

      {/* Warnings if quota reached */}
      {isOverseasMaxed && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Cannot bid: Overseas limit of {roomState.rules.maxOverseas} reached for {myTeam.shortName}.</span>
        </div>
      )}

      {isSquadFull && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Cannot bid: Squad limit of {roomState.rules.maxSquadSize} reached.</span>
        </div>
      )}

      {isHoldingHighestBid && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-bold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            Winning Bidder
          </span>
          <span className="font-mono font-bold text-sm sm:text-base">{formatCurrency(auction.currentBid)}</span>
        </div>
      )}

      {/* Reaction Cheer Bar */}
      <div className="flex items-center justify-between gap-2 p-2 sm:p-2.5 rounded-2xl bg-[#050505] border border-[#27272a]">
        <span className="text-xs font-bold text-[#9ca3af] uppercase tracking-[0.08em] pl-1.5 hidden sm:inline">
          Cheer:
        </span>
        <div className="flex items-center gap-1 sm:gap-2 flex-1 justify-around sm:justify-start">
          {["🏏", "🔥", "💛", "💙", "❤️", "💸", "👏"].map((emoji) => (
            <button
              key={emoji}
              onClick={() => sendReaction(emoji)}
              className="px-2.5 py-1.5 rounded-xl bg-[#121212] hover:bg-[#1e1e1e] border border-[#27272a] text-lg sm:text-xl hover:scale-125 active:scale-95 transition transform cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Bidding Buttons */}
      <div className="space-y-3">
        <div className="text-xs font-bold uppercase tracking-[0.08em] text-[#9ca3af] flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Gavel className="w-4 h-4 text-[#818cf8]" /> Standard Bids
          </span>
          <span className="text-[#71717a] text-xs font-medium hidden xs:inline">Instant Raise</span>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {bidOptions.map((amount, idx) => {
            const isAffordable = myTeam.purse >= amount;
            const disabled = 
              isAuctionPaused || 
              isHoldingHighestBid || 
              !isAffordable || 
              isOverseasMaxed || 
              isSquadFull || 
              auction.status === "SOLD" || 
              auction.status === "UNSOLD";

            const isPrimary = idx === 0;

            return (
              <motion.button
                key={amount}
                whileTap={!disabled ? { scale: 0.97 } : {}}
                onClick={() => placeBid(amount)}
                disabled={disabled}
                className={`py-3 sm:py-4 px-2.5 sm:px-3.5 rounded-2xl flex flex-col items-center justify-center font-bold transition shadow-lg relative overflow-hidden cursor-pointer ${
                  disabled
                    ? "bg-[#121212]/50 border border-[#27272a] text-[#71717a] cursor-not-allowed"
                    : isPrimary
                    ? "bg-gradient-to-r from-[#6366f1] via-[#7c3aed] to-[#8b5cf6] hover:from-[#4f46e5] hover:to-[#7c3aed] text-white shadow-lg shadow-[#6366f1]/25"
                    : "bg-[#1e1e1e] hover:bg-[#27272a] border border-[#27272a] text-white"
                }`}
              >
                <div className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider opacity-85 text-center leading-tight">
                  {idx === 0 ? "Next Bid" : idx === 1 ? "Jump (+2x)" : "Aggressive (+4x)"}
                </div>
                <div className="text-base sm:text-2xl font-teko font-bold tracking-wide mt-0.5 truncate max-w-full">
                  {formatCurrency(amount)}
                </div>
                {!isAffordable && (
                  <span className="text-[9px] text-red-400 font-semibold">Purse Limit</span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Quick Jump Increment Chips */}
        {auction.currentBid > 0 && (
          <div className="pt-1.5">
            <div className="text-[10px] sm:text-xs uppercase tracking-[0.08em] font-bold text-[#9ca3af] mb-1.5 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#818cf8]" /> Rapid Chips:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[2000000, 5000000, 10000000, 20000000].map((inc) => {
                const targetBid = auction.currentBid + inc;
                const canAfford = myTeam.purse >= targetBid;
                const disabled = 
                  isAuctionPaused || 
                  isHoldingHighestBid || 
                  !canAfford || 
                  isOverseasMaxed || 
                  isSquadFull || 
                  auction.status === "SOLD" || 
                  auction.status === "UNSOLD";

                const label = inc === 2000000 ? "+₹20L" : inc === 5000000 ? "+₹50L" : inc === 10000000 ? "+₹1.0Cr" : "+₹2.0Cr";

                return (
                  <button
                    key={inc}
                    disabled={disabled}
                    onClick={() => placeBid(targetBid)}
                    className={`py-2 sm:py-2.5 px-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-between border cursor-pointer ${
                      disabled
                        ? "bg-[#121212]/40 border-[#27272a] text-[#71717a] cursor-not-allowed"
                        : "bg-[#121212] hover:bg-[#1e1e1e] border-[#27272a] hover:border-[#6366f1]/40 text-[#f3f4f6]"
                    }`}
                  >
                    <span>{label}</span>
                    <span className="font-mono text-xs text-amber-400">{formatCurrency(targetBid)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
