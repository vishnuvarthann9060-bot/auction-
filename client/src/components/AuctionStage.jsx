import React from "react";
import { useSocket } from "../context/SocketContext";
import { formatCurrency, getRoleBadgeClass } from "../utils/formatters";
import { TEAMS_DATA } from "../data/teams";
import { BiddingControls } from "./BiddingControls";
import { PlayerPortrait } from "./PlayerPortrait";
import { 
  Gavel, Clock, Flame, Shield, ArrowUpRight, 
  Award, Globe, CheckCircle2, UserCheck, Zap, Crosshair 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function AuctionStage() {
  const { roomState } = useSocket();
  const auction = roomState?.currentAuction;

  if (!auction || !auction.player) {
    return (
      <div className="glass-panel p-6 sm:p-12 rounded-3xl text-center max-w-lg mx-auto my-6 sm:my-12 border border-[#27272a]">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#6366f1]/15 text-[#818cf8] flex items-center justify-center mx-auto mb-4 animate-bounce">
          <Clock className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>
        <h3 className="text-lg sm:text-xl font-heading font-bold text-white tracking-[-0.03em]">Getting Next Player Ready...</h3>
        <p className="text-xs text-[#9ca3af] mt-1">The next player is coming up for bidding.</p>
      </div>
    );
  }

  const player = auction.player;
  const currentBid = auction.currentBid;
  const timer = auction.timer;
  const totalTimer = roomState?.rules?.timerSeconds || 15;
  const timerProgress = (timer / totalTimer) * 100;
  const isUrgent = timer <= 5;

  const highestBidderTeam = auction.highestBidderTeamId 
    ? roomState.teams.find(t => t.id === auction.highestBidderTeamId)
    : null;
  const bidderMeta = highestBidderTeam ? TEAMS_DATA[highestBidderTeam.id] : null;

  // Real-time excitement states
  const recentBids = auction.bidHistory || [];
  const distinctBidderTeams = new Set(recentBids.slice(0, 5).map(b => b.teamShortName));
  const isBiddingWar = distinctBidderTeams.size >= 2 && recentBids.length >= 3;
  const isSniperActive = recentBids.length > 0 && timer <= 3 && timer > 0;

  // Reusable Live Bid Activity Ticker
  const renderBidTicker = () => (
    <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-[#27272a] flex flex-col bg-[#121212]">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#9ca3af] flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-amber-500" /> Recent Bids
        </span>
        <span className="text-xs text-[#71717a] font-medium">
          {auction.bidHistory?.length || 0} Bids Placed
        </span>
      </div>

      <div className="space-y-2 overflow-y-auto max-h-40 pr-1">
        <AnimatePresence initial={false}>
          {auction.bidHistory && auction.bidHistory.length > 0 ? (
            auction.bidHistory.map((b, i) => (
              <motion.div
                key={`${b.timestamp}-${i}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#0a0a0a] border border-[#27272a] text-xs sm:text-sm"
              >
                <div className="flex items-center gap-2">
                  <span 
                    className="w-3 h-3 rounded-full shrink-0" 
                    style={{ backgroundColor: b.teamColor || '#F59E0B' }} 
                  />
                  <span className="font-heading font-bold text-white">{b.teamShortName}</span>
                  <span className="text-xs text-[#9ca3af]">({b.bidderName})</span>
                </div>
                <div className="font-mono font-bold text-amber-400">
                  {formatCurrency(b.amount)}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-4 text-xs sm:text-sm text-[#71717a]">
              No bids placed yet.
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  return (
    <div className="w-full space-y-4 sm:space-y-5">
      
      {/* Set & Lot Progress Tracker (Fixed height, zero layout shift) */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs sm:text-sm text-[#9ca3af] px-1 min-h-[34px]">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-[#121212] border border-[#27272a] font-bold text-[#818cf8] uppercase tracking-[0.08em] text-xs">
            {player.set || "Marquee Set"}
          </span>
          <span className="font-medium text-xs sm:text-sm text-[#9ca3af]">
            Player {roomState.currentPlayerIndex + 1} of {roomState.totalPlayersCount}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Subtle in-flow status badges (Never cause layout shift) */}
          {isSniperActive ? (
            <span className="px-2.5 py-1 rounded-full bg-red-500/15 border border-red-500/35 text-red-400 font-bold text-xs flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5" />
              <span>Last-Second Bid</span>
            </span>
          ) : isBiddingWar ? (
            <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/35 text-amber-400 font-bold text-xs flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5" />
              <span>Bidding War</span>
            </span>
          ) : null}

          <span className="text-xs uppercase tracking-[0.08em] text-[#71717a] font-semibold">Status:</span>
          <span className={`font-heading font-bold uppercase tracking-[0.05em] text-xs sm:text-sm ${
            auction.status === "GOING_TWICE" ? "text-red-400" :
            auction.status === "GOING_ONCE" ? "text-amber-400" :
            auction.status === "SOLD" ? "text-emerald-400" : "text-[#818cf8]"
          }`}>
            {auction.status === "GOING_TWICE" ? "⚠️ Going Twice!" :
             auction.status === "GOING_ONCE" ? "⚡ Going Once!" :
             auction.status === "SOLD" ? "🎉 SOLD!" :
             auction.status === "UNSOLD" ? "UNSOLD" : "Live Bidding"}
          </span>
        </div>
      </div>

      {/* Main Center Stage Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-6 items-start">
        
        {/* LEFT / CENTER: The High-Def Player Card & Career Stats (7 cols on lg) */}
        <div className="lg:col-span-7 flex flex-col gap-3.5 sm:gap-5">
          <motion.div 
            key={player.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            style={{ 
              boxShadow: bidderMeta ? `0 0 45px ${bidderMeta.glowHex}25` : undefined 
            }}
            className="glass-panel rounded-3xl overflow-hidden border border-[#27272a] relative shadow-2xl flex flex-col transition-shadow duration-500 bg-[#121212]"
          >
            {/* Card Top Header */}
            <div className="p-4 sm:p-6 pb-0 flex items-start justify-between relative z-10">
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-bold border ${getRoleBadgeClass(player.role)}`}>
                  {player.role}
                </span>
                <span className="px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-[#1e1e1e] border border-[#27272a] text-[#f3f4f6] flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#9ca3af]" />
                  {player.country} {player.isOverseas ? "✈️" : "🇮🇳"}
                </span>
              </div>

              <div className="flex items-center gap-1.5 bg-[#6366f1]/15 border border-[#6366f1]/30 px-3 py-1 rounded-full text-[#818cf8] font-heading font-bold text-xs sm:text-sm">
                <Zap className="w-4 h-4 fill-[#818cf8]" />
                <span>{player.rating} OVR</span>
              </div>
            </div>

            {/* Player Media & Headline */}
            <div className="p-4 sm:p-6 flex flex-row items-center sm:items-end gap-4 sm:gap-6 relative">
              <PlayerPortrait player={player} size="lg" />

              <div className="space-y-2 text-left flex-1 min-w-0">
                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-white tracking-[-0.03em] truncate">
                  {player.name}
                </h2>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-xs sm:text-sm text-[#9ca3af] font-medium">Base Price:</div>
                  <div className="text-sm sm:text-base font-heading font-bold text-amber-400 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    {formatCurrency(player.basePrice)}
                  </div>
                </div>
              </div>
            </div>

            {/* Player Cricket Career Stats Grid */}
            <div className="p-4 sm:p-5 bg-[#0a0a0a]/70 border-t border-[#27272a] mt-auto">
              <div className="text-xs font-bold uppercase tracking-[0.08em] text-[#9ca3af] mb-2.5">
                Career Stats
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                <div className="glass-card p-2.5 rounded-2xl text-center border border-[#27272a]">
                  <div className="text-[10px] sm:text-xs text-[#9ca3af] uppercase font-semibold">Matches</div>
                  <div className="text-base sm:text-lg font-heading font-bold text-white">{player.stats?.matches || "-"}</div>
                </div>

                {player.stats?.runs !== undefined && (
                  <div className="glass-card p-2.5 rounded-2xl text-center border border-[#27272a]">
                    <div className="text-[10px] sm:text-xs text-[#9ca3af] uppercase font-semibold">Runs / Avg</div>
                    <div className="text-base sm:text-lg font-heading font-bold text-white">
                      {player.stats.runs} <span className="text-xs font-normal text-[#9ca3af]">({player.stats.avg})</span>
                    </div>
                  </div>
                )}

                {player.stats?.sr !== undefined && (
                  <div className="glass-card p-2.5 rounded-2xl text-center border border-[#27272a]">
                    <div className="text-[10px] sm:text-xs text-[#9ca3af] uppercase font-semibold">Strike Rate</div>
                    <div className="text-base sm:text-lg font-heading font-bold text-amber-400">{player.stats.sr}</div>
                  </div>
                )}

                {player.stats?.wickets !== undefined && (
                  <div className="glass-card p-2.5 rounded-2xl text-center border border-[#27272a]">
                    <div className="text-[10px] sm:text-xs text-[#9ca3af] uppercase font-semibold">Wickets</div>
                    <div className="text-base sm:text-lg font-heading font-bold text-emerald-400">{player.stats.wickets}</div>
                  </div>
                )}

                {player.stats?.econ !== undefined && (
                  <div className="glass-card p-2.5 rounded-2xl text-center border border-[#27272a]">
                    <div className="text-[10px] sm:text-xs text-[#9ca3af] uppercase font-semibold">Economy</div>
                    <div className="text-base sm:text-lg font-heading font-bold text-emerald-300">{player.stats.econ}</div>
                  </div>
                )}

                {player.stats?.dismissals !== undefined && (
                  <div className="glass-card p-2.5 rounded-2xl text-center border border-[#27272a]">
                    <div className="text-[10px] sm:text-xs text-[#9ca3af] uppercase font-semibold">Dismissals</div>
                    <div className="text-base sm:text-lg font-heading font-bold text-cyan-300">{player.stats.dismissals}</div>
                  </div>
                )}

                {player.stats?.hs !== undefined && (
                  <div className="glass-card p-2.5 rounded-2xl text-center border border-[#27272a]">
                    <div className="text-[10px] sm:text-xs text-[#9ca3af] uppercase font-semibold">High Score</div>
                    <div className="text-base sm:text-lg font-heading font-bold text-white">{player.stats.hs}</div>
                  </div>
                )}

                {player.stats?.bb !== undefined && (
                  <div className="glass-card p-2.5 rounded-2xl text-center border border-[#27272a]">
                    <div className="text-[10px] sm:text-xs text-[#9ca3af] uppercase font-semibold">Best Bowling</div>
                    <div className="text-base sm:text-lg font-heading font-bold text-white">{player.stats.bb}</div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Desktop/Laptop: Live Bid Ticker sits directly under the player card to balance column heights */}
          <div className="hidden lg:block">
            {renderBidTicker()}
          </div>
        </div>

        {/* RIGHT: Live Auction Arena, Timer, Gavel & Bidding Controls (5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col gap-3.5 sm:gap-5">
          
          {/* Current Bid & Gavel Arena */}
          <div 
            style={{ 
              boxShadow: bidderMeta ? `0 0 50px ${bidderMeta.glowHex}25` : undefined,
              borderColor: bidderMeta ? `${bidderMeta.glowHex}40` : '#27272a'
            }}
            className="glass-panel p-5 sm:p-6 rounded-3xl border relative overflow-hidden flex flex-col justify-between transition-all duration-500 bg-[#121212]"
          >
            {/* Top Row: Timer Ring and Auctioneer Gavel */}
            <div className="flex items-center justify-between">
              
              {/* Circular Animated Countdown Meter */}
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                  <svg className="w-16 h-16 sm:w-20 sm:h-20 transform -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="5"
                      className="text-[#1e1e1e]"
                      fill="transparent"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="5"
                      strokeDasharray={175.9}
                      strokeDashoffset={175.9 - (175.9 * timerProgress) / 100}
                      strokeLinecap="round"
                      className={`transition-all duration-500 ${
                        isUrgent ? "text-red-500" : "text-[#6366f1]"
                      }`}
                      fill="transparent"
                    />
                  </svg>
                  <span className={`absolute font-heading font-extrabold text-xl sm:text-2xl ${
                    isUrgent ? "text-red-400" : "text-white"
                  }`}>
                    {timer}
                  </span>
                </div>
                <div>
                  <div className="text-[10px] sm:text-xs uppercase tracking-[0.08em] font-semibold text-[#9ca3af]">Timer</div>
                  <div className={`text-xs sm:text-sm font-bold ${isUrgent ? "text-red-400" : "text-[#f3f4f6]"}`}>
                    {timer <= 2 ? "Final Call!" : timer <= 5 ? "Closing Soon" : "Time Left"}
                  </div>
                </div>
              </div>

              {/* Wooden Gavel Drop Icon */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#6366f1]/10 border border-[#6366f1]/20 flex items-center justify-center text-[#818cf8] shadow-inner">
                <Gavel className="w-7 h-7 sm:w-8 sm:h-8 transform -rotate-45" />
              </div>
            </div>

            {/* Live Auctioneer Broadcast Voice Bubble */}
            <div className="my-3 sm:my-4 p-3 sm:p-4 rounded-2xl bg-[#050505] border border-[#27272a] flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
              <p className="text-xs sm:text-sm text-[#9ca3af] leading-relaxed">
                <span className="text-[#818cf8] font-bold">Auctioneer: </span>
                {currentBid === 0
                  ? `Starting price is ${formatCurrency(player.basePrice)}. Who wants to bid?`
                  : auction.status === "GOING_TWICE"
                  ? `Going twice at ${formatCurrency(currentBid)} to ${highestBidderTeam?.name}! Any more bids?`
                  : auction.status === "GOING_ONCE"
                  ? `Going once at ${formatCurrency(currentBid)} to ${highestBidderTeam?.name}!`
                  : `Current bid is ${formatCurrency(currentBid)} by ${highestBidderTeam?.name}! Anyone want to bid higher?`}
              </p>
            </div>

            {/* Middle Section: Giant Current Bid Display */}
            <div className="my-2.5 sm:my-4 text-center">
              <div className="text-[10px] sm:text-xs uppercase tracking-[0.1em] font-semibold text-[#9ca3af] mb-1">
                Highest Bid
              </div>
              <motion.div 
                key={currentBid}
                initial={{ scale: 1.15, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-4xl sm:text-6xl font-teko font-bold text-amber-400 tracking-wide"
              >
                {currentBid > 0 ? formatCurrency(currentBid) : "No Bids Yet"}
              </motion.div>
              {currentBid === 0 && (
                <div className="text-xs text-[#71717a] mt-1">
                  Waiting for first bid at {formatCurrency(player.basePrice)}
                </div>
              )}
            </div>

            {/* Bottom Row: Highest Bidder Card */}
            {highestBidderTeam ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 sm:p-3.5 rounded-2xl border ${bidderMeta?.borderClass || 'border-[#27272a]'} bg-[#0a0a0a] flex items-center justify-between shadow-lg`}
              >
                <div className="flex items-center gap-2.5 sm:gap-3.5">
                  <div className="text-2xl sm:text-3xl">{bidderMeta?.logoEmoji || "🏏"}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-heading font-bold text-white">{highestBidderTeam.name}</span>
                      <span className="text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">
                        {highestBidderTeam.shortName}
                      </span>
                    </div>
                    <div className="text-xs text-[#9ca3af] font-medium flex items-center gap-1.5 mt-0.5">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Bid by: <strong className="text-white">{auction.highestBidderName}</strong>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Leading
                  </span>
                </div>
              </motion.div>
            ) : (
              <div className="p-3 rounded-2xl border border-dashed border-[#27272a] text-center text-xs text-[#71717a]">
                Click a bid button below to make the first bid!
              </div>
            )}
          </div>

          {/* Integrated Bidding Controls: Standard Bids, Rapid Chips, Franchise Health & Reactions */}
          <BiddingControls />

          {/* Mobile Only: Live Bid Ticker renders below Bidding Controls */}
          <div className="block lg:hidden">
            {renderBidTicker()}
          </div>

        </div>

      </div>

    </div>
  );
}
