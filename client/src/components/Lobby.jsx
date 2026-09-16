import React, { useState, useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import { TEAMS_DATA } from "../data/teams";
import { formatCurrency } from "../utils/formatters";
import { 
  Users, Play, Settings, PlusCircle, Sparkles, Shield, 
  Clock, DollarSign, Globe, Award, ChevronRight, CheckCircle2,
  Zap, Lock, Radio, Bot, Copy, Check, RefreshCw
} from "lucide-react";
import { motion } from "framer-motion";

export function Lobby({ onOpenCustomPlayer }) {
  const { 
    roomState, 
    publicRooms,
    urlRoomCode,
    createRoom, 
    joinRoom, 
    quickMatch,
    selectTeam, 
    toggleAIBots,
    myTeam, 
    isHost, 
    startAuction, 
    userName: defaultUserName 
  } = useSocket();

  // Mode: 'public_browser' | 'create' | 'join'
  const [activeTab, setActiveTab] = useState("public_browser");
  const [nameInput, setNameInput] = useState(defaultUserName || "");
  const [roomCodeInput, setRoomCodeInput] = useState(urlRoomCode || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  // Custom rules setup state
  const [isPublicRoom, setIsPublicRoom] = useState(true);
  const [auctionMode, setAuctionMode] = useState("MEGA"); // "MEGA" | "MINI"
  const [purseCr, setPurseCr] = useState(100);
  const [timerSec, setTimerSec] = useState(15);
  const [maxOverseas, setMaxOverseas] = useState(8);
  const [minSquad, setMinSquad] = useState(15);
  const [maxSquad, setMaxSquad] = useState(25);

  // If visiting with ?room=CODE, switch directly to Join tab
  useEffect(() => {
    if (urlRoomCode) {
      setRoomCodeInput(urlRoomCode);
      setActiveTab("join");
    }
  }, [urlRoomCode]);

  const handleQuickMatch = async () => {
    if (!nameInput.trim()) {
      setFormError("Please enter your nickname first to quick match!");
      return;
    }
    setIsSubmitting(true);
    setFormError("");
    try {
      await quickMatch(nameInput.trim());
    } catch (err) {
      setFormError(err.toString());
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      setFormError("Please enter your name / franchise owner nickname");
      return;
    }
    setIsSubmitting(true);
    setFormError("");
    try {
      await createRoom(nameInput.trim(), {
        isPublic: isPublicRoom,
        auctionMode,
        totalPurse: purseCr * 10000000,
        timerSeconds: timerSec,
        maxOverseas: maxOverseas,
        minSquadSize: minSquad,
        maxSquadSize: maxSquad
      });
    } catch (err) {
      setFormError(err.toString());
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      setFormError("Please enter your name");
      return;
    }
    if (!roomCodeInput.trim()) {
      setFormError("Please enter the Room PIN (e.g. IPL-XXXX)");
      return;
    }
    setIsSubmitting(true);
    setFormError("");
    try {
      await joinRoom(roomCodeInput.trim(), nameInput.trim());
    } catch (err) {
      setFormError(err.toString());
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinSpecificPublicRoom = async (code) => {
    if (!nameInput.trim()) {
      setFormError("Please enter your nickname first!");
      return;
    }
    setIsSubmitting(true);
    setFormError("");
    try {
      await joinRoom(code, nameInput.trim());
    } catch (err) {
      setFormError(err.toString());
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyShareLink = () => {
    if (!roomState) return;
    const url = `${window.location.origin}/?room=${roomState.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const shareOnWhatsApp = () => {
    if (!roomState) return;
    const url = `${window.location.origin}/?room=${roomState.id}`;
    const text = encodeURIComponent(`🏏 Join my IPL Mega Auction War Room!\n🏆 Room PIN: ${roomState.id}\n💰 Purse: ₹${(roomState.rules?.totalPurse || 1000000000) / 10000000} Cr\n\nPick your franchise (CSK, MI, RCB, KKR) and let's bid:\n${url}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  // --- LANDING SCREEN (WHEN NOT IN ROOM) ---
  if (!roomState) {
    return (
      <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-10 relative">
        {/* Soft Radial Ambient Glows */}
        <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-[#6366f1]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-[#a855f7]/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Hero & Interactive Terminal Dual-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start relative z-10">
          
          {/* LEFT: Headline, Description, Step Badges, Quality Badges (7 cols on lg) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-7 flex flex-col justify-between space-y-6 sm:space-y-7"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#6366f1]/15 border border-[#6366f1]/35 text-[#a5b4fc] text-xs sm:text-sm font-bold tracking-[0.1em] uppercase mb-3.5 sm:mb-4">
                <Sparkles className="w-4 h-4 text-[#818cf8]" />
                100% Free Online Cricket Auction Platform • India
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-heading font-extrabold text-white tracking-[-0.03em] leading-[1.12]">
                LEAD YOUR FRANCHISE.<br />
                <span className="bg-gradient-to-r from-[#6366f1] via-[#818cf8] to-[#c084fc] bg-clip-text text-transparent">
                  COMMAND THE MEGA AUCTION.
                </span>
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-[#9ca3af] mt-3.5 sm:mt-4 max-w-xl leading-relaxed">
                Experience the authentic thrill of a live IPL Mega Auction arena. Outbid cricket managers across India with official ₹100 Crore budgets, dynamic countdown timers, overseas player limits, and tactical XI pitches.
              </p>
            </div>

            {/* 3 Step Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
              <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-[#27272a] bg-[#121212] flex flex-col justify-between">
                <div>
                  <span className="step-indicator text-2xl sm:text-3xl font-extrabold block mb-1.5">01</span>
                  <h3 className="font-heading font-bold text-white text-base sm:text-lg tracking-[-0.02em]">Official Franchises</h3>
                  <p className="text-xs sm:text-sm text-[#9ca3af] mt-1.5 leading-relaxed">
                    CSK, MI, RCB, KKR, and all 10 franchises with real ₹100 Cr purse caps.
                  </p>
                </div>
              </div>

              <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-[#27272a] bg-[#121212] flex flex-col justify-between">
                <div>
                  <span className="step-indicator text-2xl sm:text-3xl font-extrabold block mb-1.5">02</span>
                  <h3 className="font-heading font-bold text-white text-base sm:text-lg tracking-[-0.02em]">Live Bidding Engine</h3>
                  <p className="text-xs sm:text-sm text-[#9ca3af] mt-1.5 leading-relaxed">
                    Sub-50ms synchronized bids, dynamic countdown resets & gavel strikes.
                  </p>
                </div>
              </div>

              <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-[#27272a] bg-[#121212] flex flex-col justify-between">
                <div>
                  <span className="step-indicator text-2xl sm:text-3xl font-extrabold block mb-1.5">03</span>
                  <h3 className="font-heading font-bold text-white text-base sm:text-lg tracking-[-0.02em]">Tactical Dream XI</h3>
                  <p className="text-xs sm:text-sm text-[#9ca3af] mt-1.5 leading-relaxed">
                    Enforce overseas quotas, arrange Playing XI on turf & inspect rosters.
                  </p>
                </div>
              </div>
            </div>

            {/* Platform Highlights */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs sm:text-sm">
              <span className="px-3 py-1.5 rounded-xl bg-[#121212] border border-[#27272a] text-[#9ca3af] font-medium">🇮🇳 Built for India</span>
              <span className="px-3 py-1.5 rounded-xl bg-[#121212] border border-[#27272a] text-[#9ca3af] font-medium">⚡ 100+ Star Players</span>
              <span className="px-3 py-1.5 rounded-xl bg-[#121212] border border-[#27272a] text-[#9ca3af] font-medium">🤖 Smart AI Bots</span>
              <span className="px-3 py-1.5 rounded-xl bg-[#121212] border border-[#27272a] text-[#9ca3af] font-medium">📲 WhatsApp Invites</span>
            </div>
          </motion.div>

          {/* RIGHT: The Interactive Action Terminal (5 cols on lg) */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full lg:col-span-5 glass-panel p-5 sm:p-7 rounded-3xl relative z-10 shadow-2xl border border-[#27272a] bg-[#121212]"
          >
            {/* Quick Nickname Input */}
            <div className="mb-4 sm:mb-5 p-4 rounded-2xl bg-[#0a0a0a] border border-[#27272a]">
              <label className="block text-xs sm:text-sm font-bold text-[#9ca3af] uppercase tracking-[0.1em] mb-1.5">
                Franchise Manager Nickname
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Captain Cool / King Kohli"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full px-4 py-3 sm:py-3.5 rounded-xl bg-[#050505] border border-[#27272a] text-white placeholder-[#71717a] text-sm sm:text-base focus:outline-none focus:border-[#6366f1] transition"
              />
            </div>

            {/* Tab Switcher */}
            <div className="flex bg-[#0a0a0a] p-1 sm:p-1.5 rounded-2xl border border-[#27272a] mb-4 sm:mb-5 gap-1">
              <button
                onClick={() => setActiveTab("public_browser")}
                className={`flex-1 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-heading font-bold tracking-[-0.01em] transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === "public_browser"
                    ? "bg-[#6366f1] text-white shadow-lg shadow-[#6366f1]/25"
                    : "text-[#9ca3af] hover:text-white hover:bg-[#1e1e1e]"
                }`}
              >
                <Radio className="w-4 h-4 shrink-0 hidden xs:inline" />
                <span>Public ({publicRooms.length})</span>
              </button>
              <button
                onClick={() => setActiveTab("create")}
                className={`flex-1 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-heading font-bold tracking-[-0.01em] transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === "create"
                    ? "bg-[#6366f1] text-white shadow-lg shadow-[#6366f1]/25"
                    : "text-[#9ca3af] hover:text-white hover:bg-[#1e1e1e]"
                }`}
              >
                <span>👑 Create</span>
              </button>
              <button
                onClick={() => setActiveTab("join")}
                className={`flex-1 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-heading font-bold tracking-[-0.01em] transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === "join"
                    ? "bg-[#6366f1] text-white shadow-lg shadow-[#6366f1]/25"
                    : "text-[#9ca3af] hover:text-white hover:bg-[#1e1e1e]"
                }`}
              >
                <span>🔑 Enter PIN</span>
              </button>
            </div>

          {formError && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs sm:text-sm">
              {formError}
            </div>
          )}

          {/* TAB 1: PUBLIC ROOMS & QUICK MATCH */}
          {activeTab === "public_browser" && (
            <div className="space-y-4">
              {/* Hero Quick Match Button */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#121212] border border-[#27272a] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-[#818cf8] fill-[#818cf8]" />
                    <span className="text-base sm:text-lg font-heading font-bold text-white tracking-[-0.02em]">Instant Quick Match</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#9ca3af] mt-1.5 leading-relaxed">
                    Instantly connect to an active lobby waiting for franchise managers across India.
                  </p>
                </div>
                <button
                  onClick={handleQuickMatch}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:from-[#4f46e5] hover:to-[#7c3aed] text-white font-heading font-bold text-xs sm:text-sm uppercase tracking-[0.05em] shadow-lg shadow-[#6366f1]/25 transition cursor-pointer shrink-0"
                >
                  {isSubmitting ? "Matching..." : "⚡ Quick Match"}
                </button>
              </div>

              {/* Public Rooms List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-[#9ca3af] px-1">
                  <span className="uppercase tracking-[0.08em] text-xs">Open Public Arenas</span>
                  <span className="text-xs text-[#71717a]">{publicRooms.length} Arenas Active</span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {publicRooms.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-[#121212]/50 border border-dashed border-[#27272a] text-center text-xs sm:text-sm text-[#71717a]">
                      No public rooms currently waiting. Be the first to create one!
                    </div>
                  ) : (
                    publicRooms.map((room) => (
                      <div
                        key={room.id}
                        className="p-4 sm:p-4.5 rounded-2xl bg-[#121212] border border-[#27272a] hover:border-[#3f3f46] transition flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-amber-400 text-sm sm:text-base">{room.id}</span>
                            <span className="text-[10px] sm:text-xs uppercase font-semibold px-2 py-0.5 rounded-full bg-[#1e1e1e] text-[#9ca3af] border border-[#27272a]">
                              {room.auctionMode} Auction
                            </span>
                            {room.aiBotsEnabled && (
                              <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-[#6366f1]/15 text-[#818cf8] font-semibold border border-[#6366f1]/30">
                                🤖 AI Bots
                              </span>
                            )}
                          </div>
                          <div className="text-xs sm:text-sm text-[#9ca3af] mt-1.5">
                            Host: <strong className="text-white">{room.hostName}</strong> • {room.claimedTeamsCount}/{room.totalTeams} Franchises Claimed
                          </div>
                        </div>

                        <button
                          onClick={() => handleJoinSpecificPublicRoom(room.id)}
                          className="px-4 py-2.5 rounded-xl bg-[#1e1e1e] hover:bg-[#27272a] border border-[#27272a] text-[#818cf8] font-heading font-bold text-xs sm:text-sm transition cursor-pointer shrink-0"
                        >
                          Join Arena →
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CREATE ARENA */}
          {activeTab === "create" && (
            <form onSubmit={handleCreateRoom} className="space-y-4">
              {/* Room Privacy & Mode Toggles */}
              <div className="grid grid-cols-2 gap-3">
                <div 
                  onClick={() => setIsPublicRoom(true)}
                  className={`p-3.5 sm:p-4 rounded-2xl border cursor-pointer transition ${
                    isPublicRoom 
                      ? "bg-[#6366f1]/10 border-[#6366f1]/40 text-white" 
                      : "bg-[#121212] border-[#27272a] text-[#9ca3af] hover:border-[#3f3f46]"
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-heading font-bold">
                    <Globe className="w-4 h-4 text-[#818cf8]" />
                    <span>Public Arena</span>
                  </div>
                  <p className="text-xs text-[#9ca3af] mt-1">Listed for all online players</p>
                </div>

                <div 
                  onClick={() => setIsPublicRoom(false)}
                  className={`p-3.5 sm:p-4 rounded-2xl border cursor-pointer transition ${
                    !isPublicRoom 
                      ? "bg-[#6366f1]/10 border-[#6366f1]/40 text-white" 
                      : "bg-[#121212] border-[#27272a] text-[#9ca3af] hover:border-[#3f3f46]"
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-heading font-bold">
                    <Lock className="w-4 h-4 text-[#818cf8]" />
                    <span>Private Arena</span>
                  </div>
                  <p className="text-xs text-[#9ca3af] mt-1">Invite PIN / Link only</p>
                </div>
              </div>

              {/* Auction Mode */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#121212] border border-[#27272a] flex items-center justify-between text-xs sm:text-sm">
                <span className="font-heading font-bold text-white">Auction Pool Mode</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAuctionMode("MEGA")}
                    className={`px-3.5 py-2 rounded-xl font-heading font-bold text-xs sm:text-sm cursor-pointer ${
                      auctionMode === "MEGA" ? "bg-[#6366f1] text-white" : "bg-[#1e1e1e] text-[#9ca3af]"
                    }`}
                  >
                    Mega Auction (Full Pool)
                  </button>
                </div>
              </div>

              {/* Rules Sliders */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#121212] border border-[#27272a] space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs sm:text-sm text-[#9ca3af] block font-medium">Team Purse (Crores)</label>
                    <div className="flex items-center gap-2 mt-1.5">
                      <input
                        type="range"
                        min="50"
                        max="200"
                        step="5"
                        value={purseCr}
                        onChange={(e) => setPurseCr(Number(e.target.value))}
                        className="w-full accent-[#6366f1]"
                      />
                      <span className="font-mono text-xs sm:text-sm font-bold text-amber-300 w-14 text-right">₹{purseCr}Cr</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm text-[#9ca3af] block font-medium">Bid Timer (Seconds)</label>
                    <div className="flex items-center gap-2 mt-1.5">
                      <input
                        type="range"
                        min="10"
                        max="30"
                        step="1"
                        value={timerSec}
                        onChange={(e) => setTimerSec(Number(e.target.value))}
                        className="w-full accent-[#6366f1]"
                      />
                      <span className="font-mono text-xs sm:text-sm font-bold text-amber-300 w-10 text-right">{timerSec}s</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:from-[#4f46e5] hover:to-[#7c3aed] text-white font-heading font-bold text-sm sm:text-base tracking-tight shadow-lg shadow-[#6366f1]/25 transition cursor-pointer"
              >
                {isSubmitting ? "Launching Arena..." : "Launch Auction Room 🚀"}
              </button>
            </form>
          )}

          {/* TAB 3: JOIN VIA PIN / LINK */}
          {activeTab === "join" && (
            <form onSubmit={handleJoinRoom} className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#9ca3af] uppercase tracking-[0.1em] mb-1.5">
                  Room PIN Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. IPL-7X4K"
                  value={roomCodeInput}
                  onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3.5 sm:py-4 rounded-xl bg-[#050505] border border-[#27272a] text-amber-400 font-mono font-bold tracking-widest placeholder-[#71717a] focus:outline-none focus:border-[#6366f1] transition text-sm sm:text-base"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:from-[#4f46e5] hover:to-[#7c3aed] text-white font-heading font-bold text-sm sm:text-base tracking-tight shadow-lg shadow-[#6366f1]/25 transition cursor-pointer"
              >
                {isSubmitting ? "Entering Arena..." : "Enter Auction Room 🏏"}
              </button>
            </form>
          )}
        </motion.div>
        </div>

        {/* 10 Official Franchises Showcase Bar */}
        <div className="glass-panel p-5 sm:p-7 rounded-3xl border border-[#27272a] space-y-3.5 bg-[#121212]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#818cf8]" />
              <h3 className="text-sm sm:text-base font-heading font-bold uppercase tracking-[-0.01em] text-white">
                All 10 Official IPL Franchises Available
              </h3>
            </div>
            <span className="text-xs sm:text-sm text-[#9ca3af] hidden sm:inline">Pick any franchise upon entering arena</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2.5">
            {Object.values(TEAMS_DATA).map((team) => (
              <div 
                key={team.id}
                className="p-3 sm:p-3.5 rounded-2xl bg-[#0a0a0a] border border-[#27272a] text-center flex flex-col items-center justify-between hover:border-[#3f3f46] transition"
              >
                <div className="text-2xl sm:text-3xl mb-1 sm:mb-1.5">{team.logoEmoji}</div>
                <div className="text-xs sm:text-sm font-heading font-bold text-white">{team.shortName}</div>
                <div className="text-[10px] sm:text-xs text-[#71717a] font-medium mt-0.5">{team.trophies > 0 ? `${team.trophies} 🏆` : "IPL Team"}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Frequently Asked Questions (FAQ) */}
        <div className="glass-panel p-6 sm:p-9 rounded-3xl border border-[#27272a] space-y-5 bg-[#121212]">
          <div className="badge-tag text-xs tracking-[0.1em] text-[#818cf8] font-bold">KNOWLEDGE BASE</div>
          <h3 className="text-xl sm:text-2xl font-heading font-bold text-white tracking-[-0.03em]">
            Frequently Asked Questions
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="p-5 rounded-2xl bg-[#0a0a0a] border border-[#27272a]">
              <h4 className="font-heading font-bold text-white text-sm sm:text-base tracking-[-0.02em]">Is this IPL auction game completely free to play?</h4>
              <p className="text-xs sm:text-sm text-[#9ca3af] mt-2 leading-relaxed">
                Yes, IPL Auction Game is 100% free with unlimited rooms and no in-app purchases. You can create or join public and private rooms with friends anytime.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-[#0a0a0a] border border-[#27272a]">
              <h4 className="font-heading font-bold text-white text-sm sm:text-base tracking-[-0.02em]">How do I invite friends across India?</h4>
              <p className="text-xs sm:text-sm text-[#9ca3af] mt-2 leading-relaxed">
                Click "Create Arena", choose Private or Public, and copy your unique 8-character Room PIN or click "WhatsApp Invite" to send it straight to your cricket group chat.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-[#0a0a0a] border border-[#27272a]">
              <h4 className="font-heading font-bold text-white text-sm sm:text-base tracking-[-0.02em]">Can I play solo or with less than 10 people?</h4>
              <p className="text-xs sm:text-sm text-[#9ca3af] mt-2 leading-relaxed">
                Yes! Toggle "Auto-Fill with AI" in the lobby to let smart AI bots manage the remaining franchises. They actively place realistic bids based on player ratings and budget constraints.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-[#0a0a0a] border border-[#27272a]">
              <h4 className="font-heading font-bold text-white text-sm sm:text-base tracking-[-0.02em]">How does the bidding timer and budget work?</h4>
              <p className="text-xs sm:text-sm text-[#9ca3af] mt-2 leading-relaxed">
                Each lot starts with a customizable timer (e.g. 15 seconds). Every new bid resets the countdown. The engine automatically enforces reserve purse limits.
              </p>
            </div>
          </div>
        </div>

      </div>
    );
  }

  // --- INSIDE LOBBY / WAR ROOM SCREEN ---
  return (
    <div className="max-w-[1600px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
      
      {/* Top Banner with Room PIN, Share Link, & Host Controls */}
      <div className="glass-panel p-6 sm:p-7 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-[#27272a]">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-[#6366f1]/15 border border-[#6366f1]/30 text-[#818cf8] text-xs sm:text-sm font-bold tracking-[0.05em]">
              ROOM: {roomState.id}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-[0.08em] ${
              roomState.isPublic ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-[#1e1e1e] text-[#9ca3af] border border-[#27272a]"
            }`}>
              {roomState.isPublic ? "🌐 Public Arena" : "🔒 Private Arena"}
            </span>
            <span className="text-xs sm:text-sm text-[#9ca3af] font-medium">
              {roomState.users.length} {roomState.users.length === 1 ? 'Manager' : 'Managers'} Joined
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold text-white tracking-[-0.03em] mt-2">
            Auction Strategy War Room
          </h2>
          <p className="text-xs sm:text-sm text-[#9ca3af] mt-1">
            Select an available franchise. Invite friends or enable AI bots to auto-fill unoccupied teams!
          </p>
        </div>

        {/* Action Controls for Host & Players */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap w-full md:w-auto">
          {/* 1-Click Share URL button */}
          <button
            onClick={copyShareLink}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#121212] hover:bg-[#1e1e1e] text-[#f3f4f6] text-xs sm:text-sm font-semibold border border-[#27272a] transition cursor-pointer"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#818cf8]" />}
            <span>{copiedLink ? "Link Copied!" : "Copy Link"}</span>
          </button>

          {/* 1-Tap WhatsApp Invite */}
          <button
            onClick={shareOnWhatsApp}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs sm:text-sm font-bold border border-emerald-500/30 transition cursor-pointer"
          >
            <span>📲 WhatsApp Invite</span>
          </button>

          {isHost && (
            <>
              {/* Toggle AI Bots button */}
              <button
                onClick={() => toggleAIBots(!roomState.aiBotsEnabled)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition cursor-pointer ${
                  roomState.aiBotsEnabled
                    ? "bg-[#6366f1] border-[#6366f1] text-white shadow-sm"
                    : "bg-[#121212] hover:bg-[#1e1e1e] text-[#9ca3af] border-[#27272a]"
                }`}
              >
                <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{roomState.aiBotsEnabled ? "AI Bots Active" : "Auto-Fill AI"}</span>
              </button>

              <button
                onClick={onOpenCustomPlayer}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#121212] hover:bg-[#1e1e1e] border border-[#27272a] text-xs sm:text-sm font-semibold text-[#f3f4f6] transition cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#818cf8]" />
                <span>Add Star</span>
              </button>

              <button
                onClick={startAuction}
                className="flex items-center justify-center gap-2 px-6 sm:px-7 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:from-[#4f46e5] hover:to-[#7c3aed] text-white font-heading font-bold text-xs sm:text-sm uppercase tracking-wide shadow-lg shadow-[#6366f1]/25 transition transform active:scale-95 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start Auction</span>
              </button>
            </>
          )}

          {!isHost && (
            <div className="px-4 py-2.5 rounded-xl bg-[#121212] border border-[#27272a] text-xs sm:text-sm text-[#9ca3af] flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400 animate-spin" />
              <span>Waiting for Host to start auction...</span>
            </div>
          )}
        </div>
      </div>

      {/* Rules Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
        <div className="glass-card p-3 sm:p-4 rounded-2xl flex items-center gap-3 border border-[#27272a]">
          <div className="p-2 sm:p-2.5 rounded-xl bg-[#6366f1]/10 text-[#818cf8]">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="text-[10px] sm:text-xs uppercase tracking-[0.08em] font-semibold text-[#9ca3af]">Purse Budget</div>
            <div className="text-sm sm:text-base font-heading font-bold text-white">{formatCurrency(roomState.rules.totalPurse)}</div>
          </div>
        </div>

        <div className="glass-card p-3 sm:p-4 rounded-2xl flex items-center gap-3 border border-[#27272a]">
          <div className="p-2 sm:p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="text-[10px] sm:text-xs uppercase tracking-[0.08em] font-semibold text-[#9ca3af]">Bid Countdown</div>
            <div className="text-sm sm:text-base font-heading font-bold text-white">{roomState.rules.timerSeconds} Seconds</div>
          </div>
        </div>

        <div className="glass-card p-3 sm:p-4 rounded-2xl flex items-center gap-3 border border-[#27272a]">
          <div className="p-2 sm:p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
            <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="text-[10px] sm:text-xs uppercase tracking-[0.08em] font-semibold text-[#9ca3af]">Overseas Cap</div>
            <div className="text-sm sm:text-base font-heading font-bold text-white">Max {roomState.rules.maxOverseas} Players</div>
          </div>
        </div>

        <div className="glass-card p-3 sm:p-4 rounded-2xl flex items-center gap-3 border border-[#27272a]">
          <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Award className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="text-[10px] sm:text-xs uppercase tracking-[0.08em] font-semibold text-[#9ca3af]">Squad Size</div>
            <div className="text-sm sm:text-base font-heading font-bold text-white">{roomState.rules.minSquadSize} - {roomState.rules.maxSquadSize} Players</div>
          </div>
        </div>
      </div>

      {/* Team Selection Grid */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-base sm:text-lg font-heading font-bold text-white tracking-[-0.02em] flex items-center gap-2">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-[#818cf8]" /> Choose Your Franchise
          </h3>
          <span className="text-xs sm:text-sm text-[#9ca3af]">
            {roomState.teams.filter(t => t.ownerId || t.isBot).length} of 10 Franchises Assigned
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-4">
          {roomState.teams.map((team) => {
            const meta = TEAMS_DATA[team.id];
            const isSelectedByMe = myTeam?.id === team.id;
            const isClaimedByHuman = team.ownerId && team.ownerId !== myTeam?.ownerId && !team.isBot;
            const isBotManaged = team.isBot;

            return (
              <motion.div
                key={team.id}
                whileHover={!isClaimedByHuman ? { scale: 1.02 } : {}}
                onClick={() => {
                  if (!isClaimedByHuman) selectTeam(team.id);
                }}
                className={`p-3.5 sm:p-4 rounded-2xl border transition relative overflow-hidden cursor-pointer flex flex-col justify-between ${
                  isSelectedByMe
                    ? `border-2 ${meta?.borderClass || 'border-[#6366f1]'} bg-[#121212] shadow-lg shadow-[#6366f1]/15`
                    : isClaimedByHuman
                    ? "border-[#27272a]/50 bg-[#0a0a0a]/50 opacity-50 cursor-not-allowed"
                    : isBotManaged
                    ? "border-blue-500/40 bg-blue-950/20 hover:border-blue-500"
                    : "border-[#27272a] bg-[#121212] hover:border-[#3f3f46]"
                }`}
              >
                <div 
                  className="absolute top-0 left-0 right-0 h-1" 
                  style={{ backgroundColor: team.color }} 
                />

                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl sm:text-3xl">{meta?.logoEmoji || "🏏"}</span>
                    {meta?.trophies > 0 && (
                      <span className="text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {meta.trophies} 🏆
                      </span>
                    )}
                  </div>
                  {isSelectedByMe && (
                    <span className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Selected
                    </span>
                  )}
                  {isClaimedByHuman && (
                    <span className="text-[10px] sm:text-xs text-[#9ca3af] bg-[#1e1e1e] px-2 py-0.5 rounded-full border border-[#27272a] font-medium">
                      Claimed
                    </span>
                  )}
                  {isBotManaged && !isSelectedByMe && (
                    <span className="text-[10px] sm:text-xs text-[#818cf8] bg-[#6366f1]/15 px-2 py-0.5 rounded-full border border-[#6366f1]/30 font-semibold">
                      🤖 AI Bot
                    </span>
                  )}
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-[#9ca3af]">
                    <span>{team.shortName}</span>
                    {meta?.captain && (
                      <span className="text-[10px] sm:text-xs text-[#71717a] font-normal truncate max-w-[80px]">Cap: {meta.captain}</span>
                    )}
                  </div>
                  <div className="text-sm sm:text-base font-heading font-bold text-white tracking-[-0.02em] leading-snug truncate">
                    {team.name}
                  </div>
                  <div className="text-[11px] sm:text-xs text-[#71717a] italic mt-0.5 truncate">{meta?.tagline}</div>
                </div>

                <div className="mt-3 pt-2 border-t border-[#27272a] flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-[#9ca3af]">Manager:</span>
                  <span className="font-semibold text-white truncate max-w-[90px] sm:max-w-[130px]">
                    {team.ownerName || "Unassigned"}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
