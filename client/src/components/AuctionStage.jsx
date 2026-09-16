import React from "react";
import { useSocket } from "../context/SocketContext";
import { formatCurrency, getRoleBadgeClass } from "../utils/formatters";
import { TEAMS_DATA } from "../data/teams";
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
      <div className="glass-panel p-12 rounded-3xl text-center max-w-lg mx-auto my-12">
        <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4 animate-bounce">
          <Clock className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white">Preparing Next Lot...</h3>
        <p className="text-xs text-slate-400 mt-1">The auctioneer is setting up the next marquee cricket star.</p>
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

  return (
    <div className="w-full space-y-4">
      
      {/* Set & Lot Progress Tracker */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 font-bold text-amber-400 uppercase">
            {player.set || "Marquee Set"}
          </span>
          <span className="font-medium">
            Player {roomState.currentPlayerIndex + 1} of {roomState.totalPlayersCount}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Stage:</span>
          <span className={`font-bold uppercase tracking-wider ${
            auction.status === "GOING_TWICE" ? "text-red-400 animate-pulse" :
            auction.status === "GOING_ONCE" ? "text-amber-400" :
            auction.status === "SOLD" ? "text-emerald-400" : "text-blue-400"
          }`}>
            {auction.status === "GOING_TWICE" ? "⚠️ Going Twice!" :
             auction.status === "GOING_ONCE" ? "⚡ Going Once!" :
             auction.status === "SOLD" ? "🎉 SOLD!" :
             auction.status === "UNSOLD" ? "UNSOLD" : "Live Bidding"}
          </span>
        </div>
      </div>

      {/* Main Center Stage Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT / CENTER: The 3D High-Def Player Card (7 cols on lg) */}
        <motion.div 
          key={player.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="lg:col-span-7 glass-panel rounded-3xl overflow-hidden border border-white/10 relative shadow-2xl flex flex-col"
        >
          {/* Card Top Header */}
          <div className="p-5 pb-0 flex items-start justify-between relative z-10">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${getRoleBadgeClass(player.role)}`}>
                {player.role}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800/80 border border-slate-700/80 text-slate-300 flex items-center gap-1.5">
                <Globe className="w-3 h-3 text-slate-400" />
                {player.country} {player.isOverseas ? "✈️ (Overseas)" : "🇮🇳 (Indian)"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/40 px-2.5 py-1 rounded-full text-amber-300 font-bold text-xs">
              <Zap className="w-3.5 h-3.5 fill-amber-400" />
              <span>{player.rating} OVR</span>
            </div>
          </div>

          {/* Player Media & Headline */}
          <div className="p-5 flex flex-col sm:flex-row items-center sm:items-end gap-5 relative">
            <div className="relative w-36 h-44 sm:w-40 sm:h-48 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 bg-slate-900 shrink-0">
              <img
                src={player.image}
                alt={player.name}
                className="w-full h-full object-cover object-top hover:scale-105 transition duration-500"
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400&auto=format&fit=crop&q=80";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-2 left-2 right-2 text-center text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                {player.set}
              </div>
            </div>

            <div className="space-y-2 text-center sm:text-left flex-1">
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {player.name}
              </h2>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <div className="text-xs text-slate-400 font-medium">Base Price:</div>
                <div className="text-sm font-extrabold text-amber-400 px-2.5 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  {formatCurrency(player.basePrice)}
                </div>
              </div>
            </div>
          </div>

          {/* Player Cricket Career Stats Grid */}
          <div className="p-5 bg-slate-950/50 border-t border-white/5 mt-auto">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Career IPL / T20 Statistics
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="glass-card p-2.5 rounded-xl text-center">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Matches</div>
                <div className="text-base font-extrabold text-white">{player.stats?.matches || "-"}</div>
              </div>

              {player.stats?.runs !== undefined && (
                <div className="glass-card p-2.5 rounded-xl text-center">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Runs / Avg</div>
                  <div className="text-base font-extrabold text-white">
                    {player.stats.runs} <span className="text-xs font-normal text-slate-400">({player.stats.avg})</span>
                  </div>
                </div>
              )}

              {player.stats?.sr !== undefined && (
                <div className="glass-card p-2.5 rounded-xl text-center">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Strike Rate</div>
                  <div className="text-base font-extrabold text-amber-400">{player.stats.sr}</div>
                </div>
              )}

              {player.stats?.wickets !== undefined && (
                <div className="glass-card p-2.5 rounded-xl text-center">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Wickets</div>
                  <div className="text-base font-extrabold text-emerald-400">{player.stats.wickets}</div>
                </div>
              )}

              {player.stats?.econ !== undefined && (
                <div className="glass-card p-2.5 rounded-xl text-center">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Economy</div>
                  <div className="text-base font-extrabold text-emerald-300">{player.stats.econ}</div>
                </div>
              )}

              {player.stats?.dismissals !== undefined && (
                <div className="glass-card p-2.5 rounded-xl text-center">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Dismissals</div>
                  <div className="text-base font-extrabold text-cyan-300">{player.stats.dismissals}</div>
                </div>
              )}

              {player.stats?.hs !== undefined && (
                <div className="glass-card p-2.5 rounded-xl text-center">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">High Score</div>
                  <div className="text-base font-extrabold text-white">{player.stats.hs}</div>
                </div>
              )}

              {player.stats?.bb !== undefined && (
                <div className="glass-card p-2.5 rounded-xl text-center">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Best Bowling</div>
                  <div className="text-base font-extrabold text-white">{player.stats.bb}</div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* RIGHT: Live Auction Arena, Timer & Gavel (5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {/* Current Bid & Gavel Arena */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 relative overflow-hidden flex flex-col justify-between">
            {/* Top Row: Timer Ring and Auctioneer Gavel */}
            <div className="flex items-center justify-between">
              
              {/* Circular Animated Countdown Meter */}
              <div className="flex items-center gap-3">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="5"
                      className="text-slate-800"
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
                        isUrgent ? "text-red-500" : "text-amber-400"
                      }`}
                      fill="transparent"
                    />
                  </svg>
                  <span className={`absolute font-black text-xl font-mono ${
                    isUrgent ? "text-red-400 animate-ping" : "text-white"
                  }`}>
                    {timer}
                  </span>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Countdown</div>
                  <div className={`text-xs font-bold ${isUrgent ? "text-red-400" : "text-slate-200"}`}>
                    {timer <= 2 ? "Final Call!" : timer <= 5 ? "Closing Soon" : "Active Bidding"}
                  </div>
                </div>
              </div>

              {/* Wooden Gavel Drop Icon with Dynamic Motion */}
              <motion.div 
                animate={isUrgent ? { rotate: [-20, 15, 0], scale: [1, 1.15, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1 }}
                className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-inner"
              >
                <Gavel className="w-7 h-7 transform -rotate-45" />
              </motion.div>
            </div>

            {/* Middle Section: Giant Current Bid Display */}
            <div className="my-6 text-center">
              <div className="text-xs uppercase tracking-widest font-extrabold text-slate-400 mb-1">
                Current Highest Bid
              </div>
              <motion.div 
                key={currentBid}
                initial={{ scale: 1.15, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 tracking-tight font-teko"
              >
                {currentBid > 0 ? formatCurrency(currentBid) : "No Bids Yet"}
              </motion.div>
              {currentBid === 0 && (
                <div className="text-xs text-slate-500 mt-1">
                  Waiting for opening bid at base price ({formatCurrency(player.basePrice)})
                </div>
              )}
            </div>

            {/* Bottom Row: Highest Bidder Card */}
            {highestBidderTeam ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3.5 rounded-2xl border ${bidderMeta?.borderClass || 'border-amber-500'} bg-slate-900/90 flex items-center justify-between shadow-lg`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{bidderMeta?.logoEmoji || "🏏"}</div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-white">{highestBidderTeam.name}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400">
                        {highestBidderTeam.shortName}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                      <UserCheck className="w-3 h-3 text-emerald-400" />
                      Bid by: {auction.highestBidderName}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" /> Leading
                  </span>
                </div>
              </motion.div>
            ) : (
              <div className="p-3.5 rounded-2xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
                Click a bid button below to open the bidding!
              </div>
            )}
          </div>

          {/* Real-Time Bid Activity Ticker */}
          <div className="glass-panel p-4 rounded-2xl border border-white/10 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500" /> Live Bid Ticker
              </span>
              <span className="text-[10px] text-slate-500">
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
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-white/5 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-2.5 h-2.5 rounded-full" 
                          style={{ backgroundColor: b.teamColor || '#F59E0B' }} 
                        />
                        <span className="font-extrabold text-white">{b.teamShortName}</span>
                        <span className="text-[11px] text-slate-400">({b.bidderName})</span>
                      </div>
                      <div className="font-mono font-bold text-amber-400">
                        {formatCurrency(b.amount)}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-4 text-xs text-slate-600">
                    No bids recorded for this player yet.
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
