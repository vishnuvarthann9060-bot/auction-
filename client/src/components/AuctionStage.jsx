import React from "react";
import { useSocket } from "../context/SocketContext";
import { formatCurrency, getRoleBadgeClass } from "../utils/formatters";
import { TEAMS_DATA } from "../data/teams";
import { BiddingControls } from "./BiddingControls";
import { 
  Gavel, Clock, Flame, Shield, ArrowUpRight, 
  Award, Globe, CheckCircle2, UserCheck, Zap 
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
        <h3 className="text-lg sm:text-xl font-heading font-bold text-white tracking-[-0.03em]">Preparing Next Lot...</h3>
        <p className="text-xs text-[#9ca3af] mt-1">The auctioneer is bringing up the next marquee star to the podium.</p>
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

  // Reusable Live Bid Activity Ticker
  const renderBidTicker = () => (
    <div className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-[#27272a] flex flex-col bg-[#121212]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9ca3af] flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-amber-500" /> Live Bid Ticker
        </span>
        <span className="text-[10px] text-[#71717a]">
          {auction.bidHistory?.length || 0} Bids Logged
        </span>
      </div>

      <div className="space-y-1.5 overflow-y-auto max-h-36 pr-1">
        <AnimatePresence initial={false}>
          {auction.bidHistory && auction.bidHistory.length > 0 ? (
            auction.bidHistory.map((b, i) => (
              <motion.div
                key={`${b.timestamp}-${i}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-between p-2 rounded-xl bg-[#0a0a0a] border border-[#27272a] text-xs"
              >
                <div className="flex items-center gap-2">
                  <span 
                    className="w-2.5 h-2.5 rounded-full" 
                    style={{ backgroundColor: b.teamColor || '#F59E0B' }} 
                  />
                  <span className="font-heading font-semibold text-white">{b.teamShortName}</span>
                  <span className="text-[11px] text-[#9ca3af]">({b.bidderName})</span>
                </div>
                <div className="font-mono font-bold text-amber-400">
                  {formatCurrency(b.amount)}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-3 text-xs text-[#71717a]">
              No bids recorded for this player yet.
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  return (
    <div className="w-full space-y-4">
      
      {/* Set & Lot Progress Tracker */}
      <div className="flex items-center justify-between text-xs text-[#9ca3af] px-1">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-[#121212] border border-[#27272a] font-semibold text-[#818cf8] uppercase tracking-[0.08em] text-[10px]">
            {player.set || "Marquee Set"}
          </span>
          <span className="font-normal text-xs text-[#9ca3af]">
            Player {roomState.currentPlayerIndex + 1} of {roomState.totalPlayersCount}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.08em] text-[#71717a] font-semibold">Stage:</span>
          <span className={`font-heading font-semibold uppercase tracking-[0.05em] text-xs ${
            auction.status === "GOING_TWICE" ? "text-red-400 animate-pulse" :
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-5 items-start">
        
        {/* LEFT / CENTER: The High-Def Player Card & Career Stats (7 cols on lg) */}
        <div className="lg:col-span-7 flex flex-col gap-3 sm:gap-4">
          <motion.div 
            key={player.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            style={{ 
              boxShadow: bidderMeta ? `0 0 35px ${bidderMeta.glowHex}20` : undefined 
            }}
            className="glass-panel rounded-3xl overflow-hidden border border-[#27272a] relative shadow-2xl flex flex-col transition-shadow duration-500 bg-[#121212]"
          >
            {/* Card Top Header */}
            <div className="p-3.5 sm:p-5 pb-0 flex items-start justify-between relative z-10">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className={`px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold border ${getRoleBadgeClass(player.role)}`}>
                  {player.role}
                </span>
                <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-medium bg-[#1e1e1e] border border-[#27272a] text-[#f3f4f6] flex items-center gap-1">
                  <Globe className="w-3 h-3 text-[#9ca3af]" />
                  {player.country} {player.isOverseas ? "✈️" : "🇮🇳"}
                </span>
              </div>

              <div className="flex items-center gap-1 bg-[#6366f1]/15 border border-[#6366f1]/30 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[#818cf8] font-heading font-semibold text-xs">
                <Zap className="w-3.5 h-3.5 fill-[#818cf8]" />
                <span>{player.rating} OVR</span>
              </div>
            </div>

            {/* Player Media & Headline */}
            <div className="p-3.5 sm:p-5 flex flex-row items-center sm:items-end gap-3.5 sm:gap-5 relative">
              <div className="relative w-24 h-32 sm:w-36 sm:h-44 md:w-40 md:h-48 rounded-2xl overflow-hidden shadow-2xl border border-[#27272a] bg-[#050505] shrink-0">
                <img
                  src={player.image}
                  alt={player.name}
                  className="w-full h-full object-cover object-top hover:scale-105 transition duration-500"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400&auto=format&fit=crop&q=80";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-1.5 left-1 right-1 text-center text-[9px] sm:text-[10px] uppercase font-bold text-amber-400 tracking-wider truncate">
                  {player.set}
                </div>
              </div>

              <div className="space-y-1.5 sm:space-y-2 text-left flex-1 min-w-0">
                <h2 className="text-xl sm:text-3xl lg:text-4xl font-heading font-bold text-white tracking-[-0.03em] truncate">
                  {player.name}
                </h2>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <div className="text-[11px] sm:text-xs text-[#9ca3af] font-medium">Base Price:</div>
                  <div className="text-xs sm:text-sm font-heading font-bold text-amber-400 px-2.5 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
                    {formatCurrency(player.basePrice)}
                  </div>
                </div>
              </div>
            </div>

            {/* Player Cricket Career Stats Grid */}
            <div className="p-3.5 sm:p-4 bg-[#0a0a0a]/70 border-t border-[#27272a] mt-auto">
              <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9ca3af] mb-2">
                Career IPL / T20 Statistics
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
                <div className="glass-card p-2 rounded-xl text-center border border-[#27272a]">
                  <div className="text-[9px] sm:text-[10px] text-[#9ca3af] uppercase font-semibold">Matches</div>
                  <div className="text-sm sm:text-base font-heading font-bold text-white">{player.stats?.matches || "-"}</div>
                </div>

                {player.stats?.runs !== undefined && (
                  <div className="glass-card p-2 rounded-xl text-center border border-[#27272a]">
                    <div className="text-[9px] sm:text-[10px] text-[#9ca3af] uppercase font-semibold">Runs / Avg</div>
                    <div className="text-sm sm:text-base font-heading font-bold text-white">
                      {player.stats.runs} <span className="text-[10px] font-normal text-[#9ca3af]">({player.stats.avg})</span>
                    </div>
                  </div>
                )}

                {player.stats?.sr !== undefined && (
                  <div className="glass-card p-2 rounded-xl text-center border border-[#27272a]">
                    <div className="text-[9px] sm:text-[10px] text-[#9ca3af] uppercase font-semibold">Strike Rate</div>
                    <div className="text-sm sm:text-base font-heading font-bold text-amber-400">{player.stats.sr}</div>
                  </div>
                )}

                {player.stats?.wickets !== undefined && (
                  <div className="glass-card p-2 rounded-xl text-center border border-[#27272a]">
                    <div className="text-[9px] sm:text-[10px] text-[#9ca3af] uppercase font-semibold">Wickets</div>
                    <div className="text-sm sm:text-base font-heading font-bold text-emerald-400">{player.stats.wickets}</div>
                  </div>
                )}

                {player.stats?.econ !== undefined && (
                  <div className="glass-card p-2 rounded-xl text-center border border-[#27272a]">
                    <div className="text-[9px] sm:text-[10px] text-[#9ca3af] uppercase font-semibold">Economy</div>
                    <div className="text-sm sm:text-base font-heading font-bold text-emerald-300">{player.stats.econ}</div>
                  </div>
                )}

                {player.stats?.dismissals !== undefined && (
                  <div className="glass-card p-2 rounded-xl text-center border border-[#27272a]">
                    <div className="text-[9px] sm:text-[10px] text-[#9ca3af] uppercase font-semibold">Dismissals</div>
                    <div className="text-sm sm:text-base font-heading font-bold text-cyan-300">{player.stats.dismissals}</div>
                  </div>
                )}

                {player.stats?.hs !== undefined && (
                  <div className="glass-card p-2 rounded-xl text-center border border-[#27272a]">
                    <div className="text-[9px] sm:text-[10px] text-[#9ca3af] uppercase font-semibold">High Score</div>
                    <div className="text-sm sm:text-base font-heading font-bold text-white">{player.stats.hs}</div>
                  </div>
                )}

                {player.stats?.bb !== undefined && (
                  <div className="glass-card p-2 rounded-xl text-center border border-[#27272a]">
                    <div className="text-[9px] sm:text-[10px] text-[#9ca3af] uppercase font-semibold">Best Bowling</div>
                    <div className="text-sm sm:text-base font-heading font-bold text-white">{player.stats.bb}</div>
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
        <div className="lg:col-span-5 flex flex-col gap-3 sm:gap-4">
          
          {/* Current Bid & Gavel Arena */}
          <div 
            style={{ 
              boxShadow: bidderMeta ? `0 0 45px ${bidderMeta.glowHex}25` : undefined,
              borderColor: bidderMeta ? `${bidderMeta.glowHex}40` : '#27272a'
            }}
            className="glass-panel p-4 sm:p-5 rounded-3xl border relative overflow-hidden flex flex-col justify-between transition-all duration-500 bg-[#121212]"
          >
            {/* Top Row: Timer Ring and Auctioneer Gavel */}
            <div className="flex items-center justify-between">
              
              {/* Circular Animated Countdown Meter */}
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
                  <svg className="w-14 h-14 sm:w-16 sm:h-16 transform -rotate-90">
                    <circle
                      cx="28"
                      cy="28"
                      r="24"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="text-[#1e1e1e]"
                      fill="transparent"
                    />
                    <circle
                      cx="28"
                      cy="28"
                      r="24"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeDasharray={150.8}
                      strokeDashoffset={150.8 - (150.8 * timerProgress) / 100}
                      strokeLinecap="round"
                      className={`transition-all duration-500 ${
                        isUrgent ? "text-red-500" : "text-[#6366f1]"
                      }`}
                      fill="transparent"
                    />
                  </svg>
                  <span className={`absolute font-heading font-bold text-lg sm:text-xl ${
                    isUrgent ? "text-red-400 animate-ping" : "text-white"
                  }`}>
                    {timer}
                  </span>
                </div>
                <div>
                  <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.08em] font-semibold text-[#9ca3af]">Countdown</div>
                  <div className={`text-xs font-semibold ${isUrgent ? "text-red-400" : "text-[#f3f4f6]"}`}>
                    {timer <= 2 ? "Final Call!" : timer <= 5 ? "Closing Soon" : "Active Bidding"}
                  </div>
                </div>
              </div>

              {/* Wooden Gavel Drop Icon with Dynamic Motion */}
              <motion.div 
                animate={isUrgent ? { rotate: [-20, 15, 0], scale: [1, 1.15, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1 }}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#6366f1]/10 border border-[#6366f1]/20 flex items-center justify-center text-[#818cf8] shadow-inner"
              >
                <Gavel className="w-6 h-6 sm:w-7 sm:h-7 transform -rotate-45" />
              </motion.div>
            </div>

            {/* Live Auctioneer Broadcast Voice Bubble */}
            <div className="my-2.5 sm:my-3 p-2.5 sm:p-3 rounded-xl bg-[#050505] border border-[#27272a] flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
              <p className="text-[11px] sm:text-xs text-[#9ca3af] leading-relaxed">
                <span className="text-[#818cf8] font-semibold">Auctioneer: </span>
                {currentBid === 0
                  ? `Opening bid called at base price of ${formatCurrency(player.basePrice)}. Any franchise?`
                  : auction.status === "GOING_TWICE"
                  ? `Going twice at ${formatCurrency(currentBid)} to ${highestBidderTeam?.name}! Last chance to raise!`
                  : auction.status === "GOING_ONCE"
                  ? `Going once at ${formatCurrency(currentBid)} to ${highestBidderTeam?.name}!`
                  : `We have ${formatCurrency(currentBid)} from ${highestBidderTeam?.name}! Any advance on ${formatCurrency(currentBid)}?`}
              </p>
            </div>

            {/* Middle Section: Giant Current Bid Display */}
            <div className="my-2 sm:my-3 text-center">
              <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.1em] font-semibold text-[#9ca3af] mb-0.5">
                Current Highest Bid
              </div>
              <motion.div 
                key={currentBid}
                initial={{ scale: 1.15, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-3xl sm:text-5xl font-teko font-bold text-amber-400 tracking-wide"
              >
                {currentBid > 0 ? formatCurrency(currentBid) : "No Bids Yet"}
              </motion.div>
              {currentBid === 0 && (
                <div className="text-[11px] text-[#71717a] mt-0.5">
                  Waiting for opening bid at base price ({formatCurrency(player.basePrice)})
                </div>
              )}
            </div>

            {/* Bottom Row: Highest Bidder Card */}
            {highestBidderTeam ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-2.5 sm:p-3 rounded-2xl border ${bidderMeta?.borderClass || 'border-[#27272a]'} bg-[#0a0a0a] flex items-center justify-between shadow-lg`}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="text-xl sm:text-2xl">{bidderMeta?.logoEmoji || "🏏"}</div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-heading font-bold text-white">{highestBidderTeam.name}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400">
                        {highestBidderTeam.shortName}
                      </span>
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-[#9ca3af] font-medium flex items-center gap-1">
                      <UserCheck className="w-3 h-3 text-emerald-400" />
                      Bid by: {auction.highestBidderName}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" /> Leading
                  </span>
                </div>
              </motion.div>
            ) : (
              <div className="p-2.5 sm:p-3 rounded-2xl border border-dashed border-[#27272a] text-center text-[11px] text-[#71717a]">
                Tap a bid button below to open the bidding!
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
