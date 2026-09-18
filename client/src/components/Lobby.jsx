import React, { useState, useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";
import { TEAMS_DATA } from "../data/teams";
import TeamLogo from "./TeamLogo";
import { formatCurrency } from "../utils/formatters";
import { 
  Users, Play, Settings, PlusCircle, Sparkles, Shield, 
  Clock, DollarSign, Globe, Award, ChevronRight, CheckCircle2,
  Zap, Lock, Radio, Copy, Check, RefreshCw, UserCheck, ArrowLeft, Home, X
} from "lucide-react";
import { motion } from "framer-motion";

export function Lobby({ onOpenGoogleSignIn, onOpenUserProfile }) {
  const { 
    roomState, 
    publicRooms,
    urlRoomCode,
    createRoom, 
    joinRoom, 
    quickMatch,
    leaveRoom,
    selectTeam, 
    myTeam, 
    isHost, 
    startAuction, 
    userName: defaultUserName 
  } = useSocket();

  const { user, activeRoomId, setActiveRoomId } = useAuth();
  const [dismissedRoomId, setDismissedRoomId] = useState(null);

  // Mode: 'public_browser' | 'create' | 'join'
  const [activeTab, setActiveTab] = useState("public_browser");
  const [nameInput, setNameInput] = useState(user?.name || defaultUserName || "");
  const [roomCodeInput, setRoomCodeInput] = useState(urlRoomCode || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  const handleIgnoreActiveRoom = (e) => {
    e?.stopPropagation();
    setDismissedRoomId(activeRoomId);
    if (setActiveRoomId) setActiveRoomId(null);
    localStorage.removeItem("ipl_active_room_id");
  };

  // Sync nameInput if user signs in
  useEffect(() => {
    if (user?.name) {
      setNameInput(user.name);
    }
  }, [user?.name]);

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
                100% Free Online Cricket Auction • Play With Friends
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-heading font-extrabold text-white tracking-[-0.03em] leading-[1.12]">
                BUILD YOUR DREAM TEAM.<br />
                <span className="bg-gradient-to-r from-[#6366f1] via-[#818cf8] to-[#c084fc] bg-clip-text text-transparent">
                  WIN THE IPL AUCTION.
                </span>
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-[#9ca3af] mt-3.5 sm:mt-4 max-w-xl leading-relaxed">
                Feel the real excitement of an IPL auction. Bid against your friends with a ₹100 Crore budget, live countdown clock, foreign player limits, and pick your best Playing 11.
              </p>
            </div>

            {/* 3 Step Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
              <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-[#27272a] bg-[#121212] flex flex-col justify-between">
                <div>
                  <span className="step-indicator text-2xl sm:text-3xl font-extrabold block mb-1.5">01</span>
                  <h3 className="font-heading font-bold text-white text-base sm:text-lg tracking-[-0.02em]">Choose Your Team</h3>
                  <p className="text-xs sm:text-sm text-[#9ca3af] mt-1.5 leading-relaxed">
                    Play as CSK, MI, RCB, KKR, or any of the 10 teams with a full ₹100 Crore budget.
                  </p>
                </div>
              </div>

              <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-[#27272a] bg-[#121212] flex flex-col justify-between">
                <div>
                  <span className="step-indicator text-2xl sm:text-3xl font-extrabold block mb-1.5">02</span>
                  <h3 className="font-heading font-bold text-white text-base sm:text-lg tracking-[-0.02em]">Live Bidding</h3>
                  <p className="text-xs sm:text-sm text-[#9ca3af] mt-1.5 leading-relaxed">
                    Fast real-time bids, instant timer resets, and sold hammer drops when time runs out.
                  </p>
                </div>
              </div>

              <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-[#27272a] bg-[#121212] flex flex-col justify-between">
                <div>
                  <span className="step-indicator text-2xl sm:text-3xl font-extrabold block mb-1.5">03</span>
                  <h3 className="font-heading font-bold text-white text-base sm:text-lg tracking-[-0.02em]">Set Playing 11</h3>
                  <p className="text-xs sm:text-sm text-[#9ca3af] mt-1.5 leading-relaxed">
                    Check foreign player limits, arrange your best 11 on the pitch, and see your full team.
                  </p>
                </div>
              </div>
            </div>

            {/* Platform Highlights */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs sm:text-sm">
              <span className="px-3 py-1.5 rounded-xl bg-[#121212] border border-[#27272a] text-[#9ca3af] font-medium">🇮🇳 Built for India</span>
              <span className="px-3 py-1.5 rounded-xl bg-[#121212] border border-[#27272a] text-[#9ca3af] font-medium">⚡ 80+ Real T20 Stars</span>
              <span className="px-3 py-1.5 rounded-xl bg-[#121212] border border-[#27272a] text-[#9ca3af] font-medium">👥 100% Real Players</span>
              <span className="px-3 py-1.5 rounded-xl bg-[#121212] border border-[#27272a] text-[#9ca3af] font-medium">📲 WhatsApp Invites</span>
            </div>
          </motion.div>

          {/* RIGHT: The Interactive Action Terminal (5 cols on lg) */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full lg:col-span-5 glass-panel p-5 sm:p-7 rounded-3xl relative z-10 shadow-2xl border border-[#27272a] bg-[#121212]"
          >
            {/* Google Account & Progress Status Card */}
            {user ? (
              <div 
                onClick={onOpenUserProfile}
                className="mb-3.5 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between gap-2 shadow-sm cursor-pointer hover:bg-emerald-500/15 transition"
              >
                <div className="flex items-center gap-2 truncate">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span className="truncate">
                    Signed in as <strong>{user.name}</strong> • Progress Synced
                  </span>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">
                  View Profile
                </span>
              </div>
            ) : (
              <div className="mb-4 p-3.5 sm:p-4 rounded-2xl bg-[#18181b] border border-[#3f3f46] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3 text-left w-full sm:w-auto">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-md">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z" />
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.13C3.26 21.43 7.31 24 12 24z" />
                      <path fill="#FBBC05" d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.24C.45 8.16 0 9.98 0 12s.45 3.84 1.24 5.42l4.04-3.13z" />
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.57 1.24 6.58l4.04 3.13c.95-2.83 3.6-4.96 6.72-4.96z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                      <span>Sign In with Google</span>
                      <span className="text-[10px] bg-[#6366f1]/25 text-[#a5b4fc] px-1.5 py-0.5 rounded font-bold uppercase">Save Progress</span>
                    </div>
                    <p className="text-[11px] text-[#9ca3af] leading-tight mt-0.5">
                      Never lose your team or auction progress on page reload!
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onOpenGoogleSignIn}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white hover:bg-gray-100 text-[#1f2937] font-heading font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                >
                  <span>Sign In</span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
                </button>
              </div>
            )}

            {/* Quick Nickname Input */}
            <div className="mb-4 sm:mb-5 p-4 rounded-2xl bg-[#0a0a0a] border border-[#27272a]">
              <label className="block text-xs sm:text-sm font-bold text-[#9ca3af] uppercase tracking-[0.1em] mb-1.5">
                Your Name / Nickname
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Dhoni / Virat / Your Name"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full px-4 py-3 sm:py-3.5 rounded-xl bg-[#050505] border border-[#27272a] text-white placeholder-[#71717a] text-sm sm:text-base focus:outline-none focus:border-[#6366f1] transition"
              />
            </div>

            {/* Resume Active Auction Banner (If player refreshed or disconnected) */}
            {activeRoomId && activeRoomId !== dismissedRoomId && (!roomState || roomState.id !== activeRoomId) && (
              <div className="mb-4 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 border border-amber-500/40 flex items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-bold text-amber-300">
                      Live Auction in Progress
                    </div>
                    <div className="text-[11px] text-[#9ca3af] truncate">
                      Your seat is waiting in room <span className="font-mono text-white font-bold">{activeRoomId}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleIgnoreActiveRoom}
                    title="Ignore and dismiss this alert"
                    className="px-2.5 sm:px-3 py-2 rounded-xl bg-[#1e1e1e] hover:bg-[#27272a] text-[#9ca3af] hover:text-white text-xs font-semibold border border-[#27272a] hover:border-[#3f3f46] transition cursor-pointer flex items-center gap-1 shadow-sm"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Ignore</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => joinRoom(activeRoomId, nameInput || defaultUserName)}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs sm:text-sm font-heading font-bold transition shadow-md shadow-amber-500/20 cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Resume Stage</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

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
                <span>Open Rooms ({publicRooms.length})</span>
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
                <span>🔑 Enter Code</span>
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
                    <span className="text-base sm:text-lg font-heading font-bold text-white tracking-[-0.02em]">Quick Play</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#9ca3af] mt-1.5 leading-relaxed">
                    Join an open room right away to play with waiting cricket fans.
                  </p>
                </div>
                <button
                  onClick={handleQuickMatch}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:from-[#4f46e5] hover:to-[#7c3aed] text-white font-heading font-bold text-xs sm:text-sm uppercase tracking-[0.05em] shadow-lg shadow-[#6366f1]/25 transition cursor-pointer shrink-0"
                >
                  {isSubmitting ? "Finding Room..." : "⚡ Quick Play"}
                </button>
              </div>

              {/* Public Rooms List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-[#9ca3af] px-1">
                  <span className="uppercase tracking-[0.08em] text-xs">Available Rooms</span>
                  <span className="text-xs text-[#71717a]">{publicRooms.length} Rooms Active</span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {publicRooms.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-[#121212]/50 border border-dashed border-[#27272a] text-center text-xs sm:text-sm text-[#71717a]">
                      No open rooms right now. Click "Create" to start your own room!
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
                            <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30">
                              👥 Live Players
                            </span>
                          </div>
                          <div className="text-xs sm:text-sm text-[#9ca3af] mt-1.5">
                            Host: <strong className="text-white">{room.hostName}</strong> • {room.claimedTeamsCount}/{room.totalTeams} Teams Taken
                          </div>
                        </div>

                        <button
                          onClick={() => handleJoinSpecificPublicRoom(room.id)}
                          className="px-4 py-2.5 rounded-xl bg-[#1e1e1e] hover:bg-[#27272a] border border-[#27272a] text-[#818cf8] font-heading font-bold text-xs sm:text-sm transition cursor-pointer shrink-0"
                        >
                          Join Room →
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
                    <span>Public Room</span>
                  </div>
                  <p className="text-xs text-[#9ca3af] mt-1">Anyone online can see and join</p>
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
                    <span>Private Room</span>
                  </div>
                  <p className="text-xs text-[#9ca3af] mt-1">Only friends with code or link</p>
                </div>
              </div>

              {/* Auction Mode */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#121212] border border-[#27272a] flex items-center justify-between text-xs sm:text-sm">
                <span className="font-heading font-bold text-white">Auction Type</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAuctionMode("MEGA")}
                    className={`px-3.5 py-2 rounded-xl font-heading font-bold text-xs sm:text-sm cursor-pointer ${
                      auctionMode === "MEGA" ? "bg-[#6366f1] text-white" : "bg-[#1e1e1e] text-[#9ca3af]"
                    }`}
                  >
                    Mega Auction (All Players)
                  </button>
                </div>
              </div>

              {/* Rules Sliders */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#121212] border border-[#27272a] space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs sm:text-sm text-[#9ca3af] block font-medium">Team Budget (Crores)</label>
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
                    <label className="text-xs sm:text-sm text-[#9ca3af] block font-medium">Timer Per Bid (Seconds)</label>
                    <div className="flex items-center gap-2 mt-1.5">
                      <input
                        type="range"
                        min="5"
                        max="30"
                        step="1"
                        value={timerSec}
                        onChange={(e) => setTimerSec(Number(e.target.value))}
                        className="w-full accent-[#6366f1]"
                      />
                      <span className="font-mono text-xs sm:text-sm font-bold text-amber-300 w-10 text-right">{timerSec}s</span>
                    </div>
                    {/* Quick Preset Buttons */}
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {[5, 10, 15, 20, 30].map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => setTimerSec(sec)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-bold border transition cursor-pointer ${
                            timerSec === sec
                              ? "bg-[#6366f1] text-white border-[#6366f1] shadow-sm"
                              : "bg-[#0a0a0a] text-[#9ca3af] border-[#27272a] hover:border-[#3f3f46] hover:text-white"
                          }`}
                        >
                          {sec}s
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:from-[#4f46e5] hover:to-[#7c3aed] text-white font-heading font-bold text-sm sm:text-base tracking-tight shadow-lg shadow-[#6366f1]/25 transition cursor-pointer"
              >
                {isSubmitting ? "Creating Room..." : "Create Room 🚀"}
              </button>
            </form>
          )}

          {/* TAB 3: JOIN VIA PIN / LINK */}
          {activeTab === "join" && (
            <form onSubmit={handleJoinRoom} className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#9ca3af] uppercase tracking-[0.1em] mb-1.5">
                  Room Code
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
                {isSubmitting ? "Joining Room..." : "Join Room 🏏"}
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
                All 10 IPL Teams Ready to Play
              </h3>
            </div>
            <span className="text-xs sm:text-sm text-[#9ca3af] hidden sm:inline">Pick your team when you enter</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2.5">
            {Object.values(TEAMS_DATA).map((team) => (
              <div 
                key={team.id}
                className="p-3 sm:p-3.5 rounded-2xl bg-[#0a0a0a] border border-[#27272a] text-center flex flex-col items-center justify-between hover:border-[#3f3f46] transition"
              >
                <div className="h-10 sm:h-12 flex items-center justify-center mb-1 sm:mb-1.5">
                  <TeamLogo meta={team} size="lg" />
                </div>
                <div className="text-xs sm:text-sm font-heading font-bold text-white">{team.shortName}</div>
                <div className="text-[10px] sm:text-xs text-[#71717a] font-medium mt-0.5">{team.trophies > 0 ? `${team.trophies} 🏆` : "IPL Team"}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Frequently Asked Questions (FAQ) */}
        <div className="glass-panel p-6 sm:p-9 rounded-3xl border border-[#27272a] space-y-5 bg-[#121212]">
          <div className="badge-tag text-xs tracking-[0.1em] text-[#818cf8] font-bold">HELP & FAQS</div>
          <h3 className="text-xl sm:text-2xl font-heading font-bold text-white tracking-[-0.03em]">
            Common Questions
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="p-5 rounded-2xl bg-[#0a0a0a] border border-[#27272a]">
              <h4 className="font-heading font-bold text-white text-sm sm:text-base tracking-[-0.02em]">Is this game completely free?</h4>
              <p className="text-xs sm:text-sm text-[#9ca3af] mt-2 leading-relaxed">
                Yes! It is 100% free with unlimited rooms and no payment needed. You can create or join rooms with your friends anytime.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-[#0a0a0a] border border-[#27272a]">
              <h4 className="font-heading font-bold text-white text-sm sm:text-base tracking-[-0.02em]">How do I invite my friends?</h4>
              <p className="text-xs sm:text-sm text-[#9ca3af] mt-2 leading-relaxed">
                Click "Create Room", choose Private or Public, and copy your Room Code or tap "WhatsApp Invite" to send the link directly to your friends.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-[#0a0a0a] border border-[#27272a]">
              <h4 className="font-heading font-bold text-white text-sm sm:text-base tracking-[-0.02em]">How many friends can play together?</h4>
              <p className="text-xs sm:text-sm text-[#9ca3af] mt-2 leading-relaxed">
                Up to 10 friends can join one room, with each person managing their own IPL team in real-time.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-[#0a0a0a] border border-[#27272a]">
              <h4 className="font-heading font-bold text-white text-sm sm:text-base tracking-[-0.02em]">How does bidding and budget work?</h4>
              <p className="text-xs sm:text-sm text-[#9ca3af] mt-2 leading-relaxed">
                Each player comes up with a countdown timer (e.g. 15 seconds). Every new bid resets the clock. The game makes sure you don't spend more money than your budget allows.
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
      
      {/* Top Banner with Room Code, Share Link, & Host Controls */}
      <div className="glass-panel p-6 sm:p-7 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-[#27272a]">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={leaveRoom}
              title="Return to Home Lobby"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1e1e1e] hover:bg-[#27272a] text-[#9ca3af] hover:text-white border border-[#27272a] hover:border-[#6366f1]/50 text-xs font-semibold transition cursor-pointer group shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#818cf8] group-hover:-translate-x-0.5 transition-transform" />
              <span>Home</span>
            </button>

            <span className="px-3 py-1 rounded-full bg-[#6366f1]/15 border border-[#6366f1]/30 text-[#818cf8] text-xs sm:text-sm font-bold tracking-[0.05em]">
              ROOM CODE: {roomState.id}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-[0.08em] ${
              roomState.isPublic ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-[#1e1e1e] text-[#9ca3af] border border-[#27272a]"
            }`}>
              {roomState.isPublic ? "🌐 Public Room" : "🔒 Private Room"}
            </span>
            <span className="text-xs sm:text-sm text-[#9ca3af] font-medium">
              {roomState.users.length} {roomState.users.length === 1 ? 'Player' : 'Players'} Joined
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold text-white tracking-[-0.03em] mt-2">
            Auction Waiting Room
          </h2>
          <p className="text-xs sm:text-sm text-[#9ca3af] mt-1">
            Pick your team below. Share the room code or WhatsApp link to invite your friends!
          </p>
        </div>

        {/* Action Controls for Host & Players */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap w-full md:w-auto">
          {/* Leave Room & Go to Home */}
          <button
            onClick={leaveRoom}
            title="Leave room and return to Home page"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#121212] hover:bg-rose-500/10 text-[#9ca3af] hover:text-rose-400 text-xs sm:text-sm font-semibold border border-[#27272a] hover:border-rose-500/30 transition cursor-pointer shadow-sm"
          >
            <Home className="w-4 h-4 text-[#818cf8]" />
            <span>Leave Room</span>
          </button>

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
            <button
              onClick={startAuction}
              className="flex items-center justify-center gap-2 px-6 sm:px-7 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:from-[#4f46e5] hover:to-[#7c3aed] text-white font-heading font-bold text-xs sm:text-sm uppercase tracking-wide shadow-lg shadow-[#6366f1]/25 transition transform active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Auction</span>
            </button>
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
            <div className="text-[10px] sm:text-xs uppercase tracking-[0.08em] font-semibold text-[#9ca3af]">Total Budget</div>
            <div className="text-sm sm:text-base font-heading font-bold text-white">{formatCurrency(roomState.rules.totalPurse)}</div>
          </div>
        </div>

        <div className="glass-card p-3 sm:p-4 rounded-2xl flex items-center gap-3 border border-[#27272a]">
          <div className="p-2 sm:p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="text-[10px] sm:text-xs uppercase tracking-[0.08em] font-semibold text-[#9ca3af]">Bid Timer</div>
            <div className="text-sm sm:text-base font-heading font-bold text-white">{roomState.rules.timerSeconds} Seconds</div>
          </div>
        </div>

        <div className="glass-card p-3 sm:p-4 rounded-2xl flex items-center gap-3 border border-[#27272a]">
          <div className="p-2 sm:p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
            <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="text-[10px] sm:text-xs uppercase tracking-[0.08em] font-semibold text-[#9ca3af]">Foreign Players</div>
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
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-[#818cf8]" /> Choose Your Team
          </h3>
          <span className="text-xs sm:text-sm text-[#9ca3af]">
            {roomState.teams.filter(t => t.ownerId).length} of 10 Teams Taken
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-4">
          {roomState.teams.map((team) => {
            const meta = TEAMS_DATA[team.id];
            const isSelectedByMe = myTeam?.id === team.id;
            const isClaimedByHuman = team.ownerId && team.ownerId !== myTeam?.ownerId;

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
                    : "border-[#27272a] bg-[#121212] hover:border-[#3f3f46]"
                }`}
              >
                <div 
                  className="absolute top-0 left-0 right-0 h-1" 
                  style={{ backgroundColor: team.color }} 
                />

                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <TeamLogo meta={meta} size="md" />
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
                      Taken
                    </span>
                  )}
                  {!team.ownerId && !isSelectedByMe && (
                    <span className="text-[10px] sm:text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-medium">
                      Available
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
                  <span className="text-[#9ca3af]">Owner:</span>
                  <span className="font-semibold text-white truncate max-w-[90px] sm:max-w-[130px]">
                    {team.ownerName || "Available"}
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
