import React from "react";
import { useSocket } from "../context/SocketContext";
import { formatCurrency } from "../utils/formatters";
import { TEAMS_DATA } from "../data/teams";
import { Gavel, AlertCircle, Shield, CheckCircle, Zap } from "lucide-react";
import { motion } from "framer-motion";

export function BiddingControls() {
  const { roomState, myTeam, placeBid, errorMessage } = useSocket();
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
      <div className="glass-panel p-4 rounded-2xl border border-[#27272a] text-center bg-[#121212]">
        <div className="text-xs text-[#818cf8] font-medium flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4" />
          You are currently in spectator mode. To bid, select an available franchise in the Lobby.
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel p-5 rounded-3xl border border-[#27272a] space-y-4 shadow-2xl bg-[#121212]">
      
      {/* Top Status Bar: My Franchise Health */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#27272a]">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{teamMeta?.logoEmoji || "🏏"}</div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-heading font-bold ${teamMeta?.textClass || 'text-white'}`}>
                {myTeam.name}
              </span>
              <span className="text-[11px] font-mono font-semibold bg-[#1e1e1e] border border-[#27272a] px-2 py-0.5 rounded text-[#9ca3af]">
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
          <div className="text-[10px] uppercase tracking-[0.08em] font-semibold text-[#9ca3af]">Available Purse</div>
          <div className="text-xl font-heading font-bold text-emerald-400">
            {formatCurrency(myTeam.purse)}
          </div>
        </div>
      </div>

      {/* Warnings if quota reached */}
      {isOverseasMaxed && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Cannot bid: Overseas limit of {roomState.rules.maxOverseas} players already reached for {myTeam.shortName}.</span>
        </div>
      )}

      {isSquadFull && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Cannot bid: Squad limit of {roomState.rules.maxSquadSize} players reached.</span>
        </div>
      )}

      {isHoldingHighestBid && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Your franchise currently holds the winning bid!
          </span>
          <span className="font-mono font-bold">{formatCurrency(auction.currentBid)}</span>
        </div>
      )}

      {/* Reaction Cheer Bar */}
      <div className="flex items-center justify-between gap-2 p-2 rounded-2xl bg-[#050505] border border-[#27272a]">
        <span className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-[0.08em] pl-1 hidden sm:inline">
          Live Reactions:
        </span>
        <div className="flex items-center gap-1.5 flex-1 justify-around sm:justify-start">
          {["🏏", "🔥", "💛", "💙", "❤️", "💸", "👏"].map((emoji) => (
            <button
              key={emoji}
              onClick={() => sendReaction(emoji)}
              className="px-2.5 py-1 rounded-xl bg-[#121212] hover:bg-[#1e1e1e] border border-[#27272a] text-lg hover:scale-125 active:scale-95 transition transform cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Bidding Buttons */}
      <div className="space-y-3">
        <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9ca3af] flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Gavel className="w-3.5 h-3.5 text-[#818cf8]" /> Standard Bids
          </span>
          <span className="text-[#71717a]">Tap to raise instantaneously</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                className={`py-3.5 px-4 rounded-2xl flex flex-col items-center justify-center font-bold transition shadow-lg relative overflow-hidden cursor-pointer ${
                  disabled
                    ? "bg-[#121212]/50 border border-[#27272a] text-[#71717a] cursor-not-allowed"
                    : isPrimary
                    ? "bg-gradient-to-r from-[#6366f1] via-[#7c3aed] to-[#8b5cf6] hover:from-[#4f46e5] hover:to-[#7c3aed] text-white shadow-lg shadow-[#6366f1]/25"
                    : "bg-[#1e1e1e] hover:bg-[#27272a] border border-[#27272a] text-white"
                }`}
              >
                <div className="text-[10px] uppercase font-semibold tracking-wider opacity-85">
                  {idx === 0 ? "Next Minimum Bid" : idx === 1 ? "Jump Raise (+2x)" : "Aggressive Raise (+4x)"}
                </div>
                <div className="text-xl sm:text-2xl font-teko font-bold tracking-wide mt-0.5">
                  {formatCurrency(amount)}
                </div>
                {!isAffordable && (
                  <span className="text-[9px] text-red-400 font-normal">Purse Exceeded</span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Quick Jump Increment Chips */}
        {auction.currentBid > 0 && (
          <div className="pt-2">
            <div className="text-[10px] uppercase tracking-[0.08em] font-semibold text-[#9ca3af] mb-1.5 flex items-center gap-1">
              <Zap className="w-3 h-3 text-[#818cf8]" /> Rapid Raise Chips:
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

                const label = inc === 2000000 ? "+₹20 Lakhs" : inc === 5000000 ? "+₹50 Lakhs" : inc === 10000000 ? "+₹1.00 Crore" : "+₹2.00 Crores";

                return (
                  <button
                    key={inc}
                    disabled={disabled}
                    onClick={() => placeBid(targetBid)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition flex items-center justify-between border cursor-pointer ${
                      disabled
                        ? "bg-[#121212]/40 border-[#27272a] text-[#71717a] cursor-not-allowed"
                        : "bg-[#121212] hover:bg-[#1e1e1e] border-[#27272a] hover:border-[#6366f1]/40 text-[#f3f4f6]"
                    }`}
                  >
                    <span>{label}</span>
                    <span className="font-mono text-[11px] text-amber-400">{formatCurrency(targetBid)}</span>
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
