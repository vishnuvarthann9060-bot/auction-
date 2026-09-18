import React from "react";
import { useSocket } from "../context/SocketContext";
import { formatCurrency } from "../utils/formatters";
import { TEAMS_DATA } from "../data/teams";
import TeamLogo from "./TeamLogo";
import { SmartPurseAdvisor } from "./SmartPurseAdvisor";
import { analyzeSquad } from "../utils/squadAdvisor";
import { Gavel, AlertCircle, Shield, CheckCircle, Zap } from "lucide-react";
import { motion } from "framer-motion";

// ============================================================================
// LEFT COLUMN: Franchise Strategy & Purse HUD
// ============================================================================
export function FranchiseHUD() {
  const { roomState, myTeam } = useSocket();
  const auction = roomState?.currentAuction;

  if (!myTeam) {
    return (
      <div className="glass-panel p-4 rounded-2xl border border-[#27272a] text-center bg-[#121212]">
        <div className="text-xs text-[#818cf8] font-medium flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Watching as guest. Pick a team in the lobby to start bidding.</span>
        </div>
      </div>
    );
  }

  const player = auction?.player;
  const currentOverseasCount = myTeam.squad.filter(p => p.isOverseas).length;
  const isOverseasMaxed = player?.isOverseas && currentOverseasCount >= (roomState.rules?.maxOverseas || 8);
  const isSquadFull = myTeam.squad.length >= (roomState.rules?.maxSquadSize || 25);
  const teamMeta = TEAMS_DATA[myTeam.id];

  return (
    <div className="glass-panel p-3.5 sm:p-4 rounded-3xl border border-[#27272a] space-y-3 bg-[#121212] shadow-xl">
      {/* Franchise Identity & Money Left */}
      <div className="flex items-center justify-between gap-2.5 pb-2.5 border-b border-[#27272a]">
        <div className="flex items-center gap-2.5">
          <TeamLogo meta={teamMeta} size="md" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className={`text-sm sm:text-base font-heading font-bold ${teamMeta?.textClass || 'text-white'}`}>
                {myTeam.name}
              </span>
              <span className="text-[10px] font-mono font-bold bg-[#1e1e1e] border border-[#27272a] px-1.5 py-0.5 rounded text-[#9ca3af]">
                {myTeam.shortName}
              </span>
            </div>
            <div className="text-[11px] sm:text-xs text-[#9ca3af] flex items-center gap-2 mt-0.5">
              <span>Squad: <strong className="text-white">{myTeam.squad.length}</strong>/{roomState.rules?.maxSquadSize || 25}</span>
              <span>•</span>
              <span>Foreign: <strong className="text-white">{currentOverseasCount}</strong>/{roomState.rules?.maxOverseas || 8}</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-[#9ca3af]">Purse Left</div>
          <div className="text-base sm:text-xl font-heading font-extrabold text-emerald-400">
            {formatCurrency(myTeam.purse)}
          </div>
        </div>
      </div>

      {/* Quota Warnings */}
      {isOverseasMaxed && (
        <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Foreign player limit reached ({roomState.rules.maxOverseas}). Cannot bid.</span>
        </div>
      )}

      {isSquadFull && (
        <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Squad is full ({roomState.rules.maxSquadSize}). Cannot bid.</span>
        </div>
      )}

      {/* Smart Purse & Squad Tactical Advisor */}
      <SmartPurseAdvisor 
        myTeam={myTeam} 
        currentPlayer={player} 
        rules={roomState.rules} 
      />
    </div>
  );
}

// ============================================================================
// RIGHT COLUMN: Live Action Bidding Deck (Right under Current Bid)
// ============================================================================
export function ActionBiddingDeck() {
  const { roomState, myTeam, placeBid, sendReaction } = useSocket();
  const auction = roomState?.currentAuction;

  if (!auction || !auction.player) return null;

  const player = auction.player;
  const isAuctionPaused = roomState.status === "PAUSED";
  const isHoldingHighestBid = myTeam && auction.highestBidderTeamId === myTeam.id;

  const currentOverseasCount = myTeam ? myTeam.squad.filter(p => p.isOverseas).length : 0;
  const isOverseasMaxed = myTeam && player.isOverseas && currentOverseasCount >= (roomState.rules?.maxOverseas || 8);
  const isSquadFull = myTeam && myTeam.squad.length >= (roomState.rules?.maxSquadSize || 25);

  const bidOptions = auction.bidOptions || [player.basePrice];

  if (!myTeam) return null;

  return (
    <div className="space-y-2.5 pt-1">
      {/* Live Feedback Status Banner */}
      <div className={`min-h-[38px] flex items-center justify-between rounded-xl px-3 py-1.5 border text-xs font-bold transition duration-300 ${
        isHoldingHighestBid
          ? "bg-emerald-500/10 border-emerald-500/35 text-emerald-400"
          : auction.highestBidderTeamId && auction.bidHistory?.some(b => b.teamShortName === myTeam.shortName)
          ? "bg-red-500/10 border-red-500/35 text-red-400"
          : "bg-[#0a0a0a] border-[#27272a] text-[#9ca3af]"
      }`}>
        {isHoldingHighestBid ? (
          <div className="flex items-center justify-between w-full">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>You have the highest bid!</span>
            </span>
            <span className="font-mono text-emerald-400 font-bold">{formatCurrency(auction.currentBid)}</span>
          </div>
        ) : auction.highestBidderTeamId && auction.bidHistory?.some(b => b.teamShortName === myTeam.shortName) ? (
          <div className="flex items-center justify-between w-full">
            <span className="flex items-center gap-1.5 text-red-400">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Outbid! Raise bid to take the lead</span>
            </span>
            <span className="text-[10px] uppercase font-mono bg-red-500/20 px-1.5 py-0.5 rounded text-red-300">Action Needed</span>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full text-[11px] text-[#71717a]">
            <span>Click below to bid for {player.name}</span>
            <span className="font-mono text-amber-400/80">Next: {formatCurrency(bidOptions[0])}</span>
          </div>
        )}
      </div>

      {/* Primary & Jump Bid Action Buttons */}
      <div className="grid grid-cols-3 gap-2">
        {bidOptions.map((amount, idx) => {
          const isAffordable = myTeam.purse >= amount;
          const squadAnalysis = analyzeSquad(myTeam, player, roomState?.rules);
          const isRisky = isAffordable && squadAnalysis && amount > squadAnalysis.maxSafeBid;

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
              className={`py-2.5 sm:py-3 px-2 rounded-xl flex flex-col items-center justify-center font-bold transition duration-200 shadow-md relative overflow-hidden cursor-pointer ${
                disabled
                  ? "bg-[#121212]/50 border border-[#27272a] text-[#71717a] cursor-not-allowed opacity-60"
                  : isPrimary
                  ? "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-lg shadow-amber-500/20 border border-amber-300 font-extrabold"
                  : "bg-[#18181b] hover:bg-[#27272a] border border-[#3f3f46] hover:border-amber-500/50 text-white"
              }`}
            >
              <div className={`text-[9px] uppercase font-bold tracking-wider leading-tight flex items-center gap-1 ${isPrimary ? "text-amber-950 font-black" : "text-[#9ca3af]"}`}>
                {isPrimary && <Gavel className="w-3 h-3" />}
                {idx === 0 ? "Standard Bid" : idx === 1 ? "Jump Bid" : "Big Bid"}
              </div>
              <div className="text-base sm:text-xl font-teko font-bold tracking-wide mt-0.5 truncate max-w-full">
                {formatCurrency(amount)}
              </div>
              {!isAffordable && (
                <span className="text-[8px] text-red-400 font-semibold">Low Balance</span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Quick Jump Increment Chips & Cheer in 1 Compact Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-0.5">
        {/* Chips */}
        {auction.currentBid > 0 ? (
          <div className="flex items-center gap-1.5 flex-wrap">
            {[2000000, 5000000, 10000000].map((inc) => {
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

              const label = inc === 2000000 ? "+20L" : inc === 5000000 ? "+50L" : "+1Cr";

              return (
                <button
                  key={inc}
                  disabled={disabled}
                  onClick={() => placeBid(targetBid)}
                  className={`py-1 px-2 rounded-lg text-xs font-bold transition border cursor-pointer ${
                    disabled
                      ? "bg-[#121212]/40 border-[#27272a] text-[#71717a] cursor-not-allowed opacity-50"
                      : "bg-[#141416] hover:bg-[#1e1e1e] border-[#27272a] hover:border-[#6366f1]/50 text-[#e4e4e7]"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        ) : <div />}

        {/* Reaction Cheer Bar */}
        <div className="flex items-center gap-1 bg-[#09090b] border border-[#27272a] px-2 py-0.5 rounded-xl justify-center">
          <span className="text-[10px] text-[#71717a] font-bold uppercase mr-1 hidden sm:inline">Cheer:</span>
          {["🏏", "🔥", "💛", "💙", "❤️", "💸", "👏"].map((emoji) => (
            <button
              key={emoji}
              onClick={() => sendReaction(emoji)}
              className="p-1 hover:scale-125 transition-transform cursor-pointer text-sm"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Full combined component for backwards compatibility
export function BiddingControls() {
  return (
    <div className="space-y-4">
      <FranchiseHUD />
      <div className="glass-panel p-4 rounded-3xl border border-[#27272a] bg-[#121212]">
        <ActionBiddingDeck />
      </div>
    </div>
  );
}
