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

      {/* Persistent Bid Status Bar (Constant height, zero layout shift) */}
      <div className={`min-h-[44px] flex items-center justify-between rounded-2xl px-3.5 py-2 border transition duration-300 text-xs sm:text-sm font-bold ${
        isHoldingHighestBid
          ? "bg-emerald-500/10 border-emerald-500/35 text-emerald-400"
          : auction.highestBidderTeamId && auction.bidHistory?.some(b => b.teamShortName === myTeam.shortName)
          ? "bg-red-500/10 border-red-500/35 text-red-400"
          : "bg-[#0a0a0a] border-[#27272a] text-[#9ca3af]"
      }`}>
        {isHoldingHighestBid ? (
          <div className="flex items-center justify-between w-full">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>You Hold Leading Bid</span>
            </span>
            <span className="font-mono text-emerald-400 font-bold">{formatCurrency(auction.currentBid)}</span>
          </div>
        ) : auction.highestBidderTeamId && auction.bidHistory?.some(b => b.teamShortName === myTeam.shortName) ? (
          <div className="flex items-center justify-between w-full">
            <span className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Outbid! Counter-bid to lead</span>
            </span>
            <span className="text-[10px] uppercase font-mono bg-red-500/20 px-2 py-0.5 rounded text-red-300">Action</span>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full text-xs text-[#71717a]">
            <span>Ready for your bid on {player.name}</span>
            <span className="font-mono text-amber-400/80">{auction.currentBid > 0 ? `Current: ${formatCurrency(auction.currentBid)}` : `Base: ${formatCurrency(player.basePrice)}`}</span>
          </div>
        )}
      </div>

      {/* Dynamic Bidding Buttons (Rock-solid position) */}
      <div className="space-y-3">
        <div className="text-xs font-bold uppercase tracking-[0.08em] text-[#9ca3af] flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Gavel className="w-4 h-4 text-amber-400" /> Standard Bids
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
                whileTap={!disabled ? { scale: 0.98 } : {}}
                onClick={() => placeBid(amount)}
                disabled={disabled}
                className={`py-3 sm:py-4 px-2.5 sm:px-3.5 rounded-2xl flex flex-col items-center justify-center font-bold transition duration-200 shadow-lg relative overflow-hidden cursor-pointer ${
                  disabled
                    ? "bg-[#121212]/50 border border-[#27272a] text-[#71717a] cursor-not-allowed"
                    : isPrimary
                    ? "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-lg shadow-amber-500/25 border border-amber-300 font-extrabold"
                    : "bg-[#18181b] hover:bg-[#27272a] border border-[#3f3f46] hover:border-amber-500/50 text-white"
                }`}
              >
                <div className={`text-[9px] sm:text-[10px] uppercase font-bold tracking-wider opacity-85 text-center leading-tight ${isPrimary ? "text-amber-950 font-black" : "text-[#9ca3af]"}`}>
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

      {/* Reaction Cheer Bar (Docked at bottom of controls) */}
      <div className="flex items-center justify-between gap-2 p-2 rounded-2xl bg-[#050505] border border-[#27272a]">
        <span className="text-[11px] font-bold text-[#71717a] uppercase tracking-[0.08em] pl-1.5 hidden sm:inline">
          Cheer:
        </span>
        <div className="flex items-center gap-1 sm:gap-2 flex-1 justify-around sm:justify-start">
          {["🏏", "🔥", "💛", "💙", "❤️", "💸", "👏"].map((emoji) => (
            <button
              key={emoji}
              onClick={() => sendReaction(emoji)}
              className="px-2 py-1 rounded-lg bg-[#121212] hover:bg-[#1e1e1e] border border-[#27272a] text-base sm:text-lg hover:scale-110 active:scale-95 transition transform cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
