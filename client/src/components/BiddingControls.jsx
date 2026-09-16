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
      <div className="glass-panel p-4 rounded-2xl border border-amber-500/20 text-center">
        <div className="text-xs text-amber-400 font-semibold flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4" />
          You are currently in spectator mode. To bid, select an available franchise in the Lobby.
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-4 shadow-2xl">
      
      {/* Top Status Bar: My Franchise Health */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{teamMeta?.logoEmoji || "🏏"}</div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-extrabold ${teamMeta?.textClass || 'text-white'}`}>
                {myTeam.name}
              </span>
              <span className="text-xs font-mono font-bold bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                {myTeam.shortName}
              </span>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-3 mt-0.5">
              <span>Squad: <strong className="text-white">{myTeam.squad.length}</strong>/{roomState.rules.maxSquadSize}</span>
              <span>Overseas: <strong className="text-white">{currentOverseasCount}</strong>/{roomState.rules.maxOverseas}</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] uppercase font-bold text-slate-400">Available Purse</div>
          <div className="text-xl font-extrabold font-mono text-emerald-400">
            {formatCurrency(myTeam.purse)}
          </div>
        </div>
      </div>

      {/* Warnings if quota reached */}
      {isOverseasMaxed && (
        <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>Cannot bid: Overseas limit of {roomState.rules.maxOverseas} players already reached for {myTeam.shortName}.</span>
        </div>
      )}

      {isSquadFull && (
        <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>Cannot bid: Squad limit of {roomState.rules.maxSquadSize} players reached.</span>
        </div>
      )}

      {isHoldingHighestBid && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            Your franchise currently holds the winning bid!
          </span>
          <span className="text-emerald-400 font-mono">{formatCurrency(auction.currentBid)}</span>
        </div>
      )}

      {/* Reaction Cheer Bar */}
      <div className="flex items-center justify-between gap-2 p-2 rounded-2xl bg-slate-950/60 border border-white/5">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
          Live Reactions:
        </span>
        <div className="flex items-center gap-1.5 flex-1 justify-around sm:justify-start">
          {["🏏", "🔥", "💛", "💙", "❤️", "💸", "👏"].map((emoji) => (
            <button
              key={emoji}
              onClick={() => sendReaction(emoji)}
              className="px-2.5 py-1 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/5 text-lg hover:scale-125 active:scale-95 transition transform cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Bidding Buttons */}
      <div className="space-y-3">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Gavel className="w-3.5 h-3.5 text-amber-400" /> Standard Bids
          </span>
          <span className="text-slate-500">Tap to raise instantaneously</span>
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
                whileTap={!disabled ? { scale: 0.96 } : {}}
                onClick={() => placeBid(amount)}
                disabled={disabled}
                className={`py-3.5 px-4 rounded-2xl flex flex-col items-center justify-center font-bold transition shadow-lg relative overflow-hidden cursor-pointer ${
                  disabled
                    ? "bg-slate-900/60 border border-slate-800 text-slate-600 cursor-not-allowed"
                    : isPrimary
                    ? "bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/25"
                    : "bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-white"
                }`}
              >
                <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                  {idx === 0 ? "Next Minimum Bid" : idx === 1 ? "Jump Raise (+2x)" : "Aggressive Raise (+4x)"}
                </div>
                <div className="text-xl sm:text-2xl font-black font-teko tracking-wide mt-0.5">
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
            <div className="text-[10px] uppercase font-bold text-slate-500 mb-1.5 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" /> Rapid Raise Chips:
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
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between border cursor-pointer ${
                      disabled
                        ? "bg-slate-950/40 border-slate-800 text-slate-600 cursor-not-allowed"
                        : "bg-slate-900/90 hover:bg-slate-800 border-amber-500/30 text-amber-300 hover:border-amber-400"
                    }`}
                  >
                    <span>{label}</span>
                    <span className="font-mono text-[11px] opacity-75">{formatCurrency(targetBid)}</span>
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
