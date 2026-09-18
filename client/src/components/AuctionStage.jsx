import React from "react";
import { useSocket } from "../context/SocketContext";
import { formatCurrency, getRoleBadgeClass } from "../utils/formatters";
import { TEAMS_DATA } from "../data/teams";
import TeamLogo from "./TeamLogo";
import { FranchiseHUD, ActionBiddingDeck } from "./BiddingControls";
import { PlayerPortrait } from "./PlayerPortrait";
import { 
  Gavel, Clock, Flame, 
  Globe, CheckCircle2, UserCheck, Zap, Crosshair 
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
  const renderBidTicker = () => {
    if (!auction.bidHistory || auction.bidHistory.length === 0) {
      return (
        <div className="p-3 rounded-2xl border border-[#27272a] bg-[#121212]/90 flex items-center justify-between text-xs text-[#9ca3af]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="font-medium text-[#e4e4e7]">Live Auction In Progress</span>
          </div>
          <span className="text-[#71717a] text-[11px]">
            Bids will stream here in real-time
          </span>
        </div>
      );
    }

    return (
      <div className="glass-panel p-3 sm:p-4 rounded-2xl border border-[#27272a] flex flex-col bg-[#121212]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#9ca3af] flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-500" /> Recent Bids
          </span>
          <span className="text-xs text-[#71717a] font-medium">
            {auction.bidHistory.length} Bids Placed
          </span>
        </div>

        <div className="space-y-1.5 overflow-y-auto max-h-28 pr-1">
          <AnimatePresence initial={false}>
            {auction.bidHistory.map((b, i) => (
              <motion.div
                key={`${b.timestamp}-${i}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-between p-2 rounded-xl bg-[#0a0a0a] border border-[#27272a] text-xs"
              >
                <div className="flex items-center gap-2">
                  <span 
                    className="w-2.5 h-2.5 rounded-full shrink-0" 
                    style={{ backgroundColor: b.teamColor || '#F59E0B' }} 
                  />
                  <span className="font-heading font-bold text-white">{b.teamShortName}</span>
                  <span className="text-[11px] text-[#9ca3af]">({b.bidderName})</span>
                </div>
                <div className="font-mono font-bold text-amber-400">
                  {formatCurrency(b.amount)}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full space-y-3 sm:space-y-3.5">
      
      {/* Set & Lot Progress Tracker (Fixed height, zero layout shift) */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm text-[#9ca3af] px-1 min-h-[30px]">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-[#121212] border border-[#27272a] font-bold text-[#818cf8] uppercase tracking-[0.08em] text-xs">
            {player.set || "Marquee Set"}
          </span>
          <span className="font-medium text-xs text-[#9ca3af]">
            Player {roomState.currentPlayerIndex + 1} of {roomState.totalPlayersCount || 574}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#1e1e1e] border border-[#27272a] text-[#a1a1aa] font-semibold hidden sm:inline-block">
            {roomState.totalPlayersCount === 182 ? "182 Sold Stars" : "574 BCCI Pool"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Subtle in-flow status badges */}
          {isSniperActive ? (
            <span className="px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/35 text-red-400 font-bold text-[11px] flex items-center gap-1.5">
              <Crosshair className="w-3 h-3" />
              <span>Last-Second Bid</span>
            </span>
          ) : isBiddingWar ? (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/35 text-amber-400 font-bold text-[11px] flex items-center gap-1.5">
              <Flame className="w-3 h-3" />
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

      {/* Main Balanced 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-start">
        
        {/* LEFT COLUMN: Player Showcase & Franchise HUD (5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col gap-3 sm:gap-3.5 order-1 lg:order-1">
          {/* Player Showcase Card */}
          <motion.div 
            key={player.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            style={{ 
              boxShadow: bidderMeta ? `0 0 35px ${bidderMeta.glowHex}20` : undefined 
            }}
            className="glass-panel rounded-3xl overflow-hidden border border-[#27272a] relative shadow-xl flex flex-col transition-shadow duration-500 bg-[#121212]"
          >
            {/* Card Top Header */}
            <div className="p-3.5 sm:p-4 pb-0 flex items-start justify-between relative z-10">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getRoleBadgeClass(player.role)}`}>
                  {player.role}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#1e1e1e] border border-[#27272a] text-[#f3f4f6] flex items-center gap-1">
                  <Globe className="w-3 h-3 text-[#9ca3af]" />
                  {player.country} {player.isOverseas ? "✈️" : "🇮🇳"}
                </span>
              </div>

              <div className="flex items-center gap-1 bg-[#6366f1]/15 border border-[#6366f1]/30 px-2.5 py-0.5 rounded-full text-[#818cf8] font-heading font-bold text-xs">
                <Zap className="w-3.5 h-3.5 fill-[#818cf8]" />
                <span>{player.rating} OVR</span>
              </div>
            </div>

            {/* Player Media & Headline */}
            <div className="p-3.5 sm:p-4 flex flex-row items-center gap-3.5 sm:gap-4 relative">
              <PlayerPortrait player={player} size="md" />

              <div className="space-y-2 text-left flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-heading font-black text-white tracking-[-0.03em] truncate drop-shadow-md">
                  {player.name}
                </h2>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.1)]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300/80">Base Price</span>
                    <span className="text-xs sm:text-sm font-heading font-bold text-amber-400">
                      {formatCurrency(player.basePrice)}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#71717a] font-medium hidden sm:inline-block">
                    {player.role} • {player.country}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Desktop/Laptop: Franchise HUD fills the left column right below player */}
          <div className="hidden lg:block">
            <FranchiseHUD />
          </div>
        </div>

        {/* RIGHT COLUMN: Live Arena Command Center with Direct Bidding (7 cols on lg) */}
        <div className="lg:col-span-7 flex flex-col gap-3 sm:gap-3.5 order-2 lg:order-2">
          
          {/* Unified Live Auction Arena & Action Bidding Deck */}
          <div 
            style={{ 
              boxShadow: bidderMeta ? `0 0 45px ${bidderMeta.glowHex}20` : undefined,
              borderColor: bidderMeta ? `${bidderMeta.glowHex}40` : '#27272a'
            }}
            className="glass-panel p-3.5 sm:p-4 rounded-3xl border relative overflow-hidden flex flex-col gap-2.5 sm:gap-3 transition-all duration-500 bg-[#121212] shadow-xl"
          >
            {/* Top Row: Timer Ring, Broadcast Voice Bubble & Gavel */}
            <div className="flex items-center justify-between gap-3">
              {/* Circular Animated Countdown Meter */}
              <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center">
                  <svg className="w-12 h-12 sm:w-14 sm:h-14 transform -rotate-90">
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="text-[#1e1e1e]"
                      fill="transparent"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeDasharray={125.6}
                      strokeDashoffset={125.6 - (125.6 * timerProgress) / 100}
                      strokeLinecap="round"
                      className={`transition-all duration-500 ${
                        isUrgent ? "text-red-500" : "text-[#6366f1]"
                      }`}
                      fill="transparent"
                    />
                  </svg>
                  <span className={`absolute font-heading font-extrabold text-lg sm:text-xl ${
                    isUrgent ? "text-red-400" : "text-white"
                  }`}>
                    {timer}
                  </span>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.08em] font-semibold text-[#9ca3af]">Timer</div>
                  <div className={`text-xs font-bold ${isUrgent ? "text-red-400" : "text-[#f3f4f6]"}`}>
                    {timer <= 2 ? "Final Call!" : timer <= 5 ? "Closing Soon" : "Time Left"}
                  </div>
                </div>
              </div>

              {/* Live Auctioneer Broadcast Voice Bubble (Fills Center Space) */}
              <div className="flex-1 min-w-0 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#09090b] border border-[#27272a] flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 font-bold text-[9px] tracking-wider uppercase flex items-center gap-1 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> LIVE
                </span>
                <p className="text-xs text-[#d1d5db] truncate leading-normal">
                  {currentBid === 0
                    ? `Starting at ${formatCurrency(player.basePrice)}. Ready for bids!`
                    : auction.status === "GOING_TWICE"
                    ? `Going twice at ${formatCurrency(currentBid)} to ${highestBidderTeam?.name || "bidder"}!`
                    : auction.status === "GOING_ONCE"
                    ? `Going once at ${formatCurrency(currentBid)} to ${highestBidderTeam?.name || "bidder"}!`
                    : `Current bid: ${formatCurrency(currentBid)} by ${highestBidderTeam?.name || "bidder"}`}
                </p>
              </div>

              {/* Wooden Gavel Drop Icon */}
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#6366f1]/10 border border-[#6366f1]/20 flex items-center justify-center text-[#818cf8] shadow-inner shrink-0">
                <Gavel className="w-5 h-5 transform -rotate-45" />
              </div>
            </div>

            {/* Current Bid & Leading Bidder Row (Side by side, zero waste) */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center p-2 sm:p-2.5 rounded-2xl bg-[#09090b]/90 border border-[#27272a]">
              {/* Current Bid Display */}
              <div className="sm:col-span-6 flex flex-col justify-center text-center sm:text-left sm:pl-2">
                <div className="text-[10px] uppercase tracking-[0.1em] font-semibold text-[#9ca3af]">
                  Highest Bid
                </div>
                <motion.div 
                  key={currentBid}
                  initial={{ scale: 1.08, opacity: 0.8 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-3xl sm:text-4xl font-teko font-bold text-amber-400 tracking-wide leading-none"
                >
                  {currentBid > 0 ? formatCurrency(currentBid) : "No Bids Yet"}
                </motion.div>
                <div className="text-[11px] text-[#71717a] font-medium truncate mt-0.5">
                  {currentBid === 0 
                    ? `Base price: ${formatCurrency(player.basePrice)}` 
                    : `Opened at ${formatCurrency(player.basePrice)}`}
                </div>
              </div>

              {/* Leading Bidder Card */}
              <div className="sm:col-span-6">
                {highestBidderTeam ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-2 rounded-xl border ${bidderMeta?.borderClass || 'border-[#27272a]'} bg-[#121212] flex items-center justify-between shadow-md`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <TeamLogo meta={bidderMeta} size="sm" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-heading font-bold text-white truncate">{highestBidderTeam.name}</span>
                          <span className="text-[9px] font-bold px-1 rounded bg-amber-500/20 text-amber-400 shrink-0">
                            {highestBidderTeam.shortName}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#9ca3af] truncate flex items-center gap-1 mt-0.5">
                          <UserCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>{auction.highestBidderName}</span>
                        </div>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/30 shrink-0 ml-1">
                      <CheckCircle2 className="w-3 h-3" /> Leading
                    </span>
                  </motion.div>
                ) : (
                  <div className="p-2.5 rounded-xl border border-dashed border-[#27272a] text-center text-xs text-[#71717a] bg-[#121212]/50">
                    ⚡ Place opening bid to lead!
                  </div>
                )}
              </div>
            </div>

            {/* ACTION BIDDING DECK: Placed directly below Current Bid for instant 0-scroll bidding */}
            <ActionBiddingDeck />
          </div>

          {/* Mobile Only: Franchise HUD renders below bidding controls */}
          <div className="block lg:hidden">
            <FranchiseHUD />
          </div>

          {/* Live Bid Activity Ticker */}
          {renderBidTicker()}
        </div>

      </div>

    </div>
  );
}

