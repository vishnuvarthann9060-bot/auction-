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

  // --- LANDING SCREEN (WHEN NOT IN ROOM) ---
  if (!roomState) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 relative">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl glass-panel p-6 sm:p-8 rounded-3xl relative z-10 shadow-2xl shadow-black/80 border border-white/10"
        >
          {/* Header Banner */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              100% Free Online Cricket Auction Arena • No Sign-up Required
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              IPL AUCTION LIVE
            </h1>
            <p className="text-sm text-slate-400 mt-1.5 max-w-md mx-auto">
              Play real-time cricket franchise auctions with random cricket fans online or privately with your friends.
            </p>
          </div>

          {/* Quick Nickname Input */}
          <div className="mb-5 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Your Player / Manager Nickname
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Captain Cool / King Kohli"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 mb-6 gap-1">
            <button
              onClick={() => setActiveTab("public_browser")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "public_browser"
                  ? "bg-amber-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Public Arenas ({publicRooms.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("create")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "create"
                  ? "bg-amber-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>👑 Create Arena</span>
            </button>
            <button
              onClick={() => setActiveTab("join")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "join"
                  ? "bg-amber-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>🔑 Enter PIN</span>
            </button>
          </div>

          {formError && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs">
              {formError}
            </div>
          )}

          {/* TAB 1: PUBLIC ROOMS & QUICK MATCH */}
          {activeTab === "public_browser" && (
            <div className="space-y-4">
              {/* Hero Quick Match Button */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-sm font-black text-white">Instant Quick Match</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Jump right into an active public arena waiting for managers!
                  </p>
                </div>
                <button
                  onClick={handleQuickMatch}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition cursor-pointer shrink-0"
                >
                  {isSubmitting ? "Matching..." : "⚡ Quick Match Now"}
                </button>
              </div>

              {/* Public Rooms List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
                  <span>Open Public Arenas Waiting For Players</span>
                  <span className="text-[11px] text-slate-500">{publicRooms.length} Arenas Active</span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {publicRooms.length === 0 ? (
                    <div className="p-6 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center text-xs text-slate-500">
                      No public rooms currently waiting in lobby. Be the first to launch one!
                    </div>
                  ) : (
                    publicRooms.map((room) => (
                      <div
                        key={room.id}
                        className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-amber-400 text-sm">{room.id}</span>
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                              {room.auctionMode} Auction
                            </span>
                            {room.aiBotsEnabled && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-semibold">
                                🤖 AI Bots
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-1">
                            Host: <strong className="text-white">{room.hostName}</strong> • {room.claimedTeamsCount}/{room.totalTeams} Franchises Claimed
                          </div>
                        </div>

                        <button
                          onClick={() => handleJoinSpecificPublicRoom(room.id)}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs transition cursor-pointer shrink-0"
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
                  className={`p-3 rounded-2xl border cursor-pointer transition ${
                    isPublicRoom 
                      ? "bg-amber-500/10 border-amber-500/40 text-white" 
                      : "bg-slate-900/60 border-slate-800 text-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <Globe className="w-3.5 h-3.5 text-amber-400" />
                    <span>Public Arena</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Anyone online can see & join</p>
                </div>

                <div 
                  onClick={() => setIsPublicRoom(false)}
                  className={`p-3 rounded-2xl border cursor-pointer transition ${
                    !isPublicRoom 
                      ? "bg-amber-500/10 border-amber-500/40 text-white" 
                      : "bg-slate-900/60 border-slate-800 text-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Private Arena</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Invite code / link only</p>
                </div>
              </div>

              {/* Auction Mode */}
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300">Auction Pool Mode</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAuctionMode("MEGA")}
                    className={`px-3 py-1 rounded-lg font-bold text-xs cursor-pointer ${
                      auctionMode === "MEGA" ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    Mega Auction (Fresh)
                  </button>
                </div>
              </div>

              {/* Rules Sliders */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block font-medium">Team Purse (Crores)</label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="range"
                        min="50"
                        max="200"
                        step="5"
                        value={purseCr}
                        onChange={(e) => setPurseCr(Number(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                      <span className="font-mono text-xs font-bold text-amber-300 w-12 text-right">₹{purseCr}Cr</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block font-medium">Bid Timer (Seconds)</label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="range"
                        min="10"
                        max="30"
                        step="1"
                        value={timerSec}
                        onChange={(e) => setTimerSec(Number(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                      <span className="font-mono text-xs font-bold text-amber-300 w-8 text-right">{timerSec}s</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 transition cursor-pointer"
              >
                {isSubmitting ? "Launching Arena..." : "Launch Auction Room 🚀"}
              </button>
            </form>
          )}

          {/* TAB 3: JOIN VIA PIN / LINK */}
          {activeTab === "join" && (
            <form onSubmit={handleJoinRoom} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Room PIN Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. IPL-7X4K"
                  value={roomCodeInput}
                  onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-amber-400 font-mono font-bold tracking-widest placeholder-slate-600 focus:outline-none focus:border-amber-500 transition text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 transition cursor-pointer"
              >
                {isSubmitting ? "Entering Arena..." : "Enter Auction Room 🏏"}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    );
  }

  // --- INSIDE LOBBY / WAR ROOM SCREEN ---
  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner with Room PIN, Share Link, & Host Controls */}
      <div className="glass-panel p-6 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-white/10">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold">
              ROOM: {roomState.id}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
              roomState.isPublic ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-slate-800 text-slate-400"
            }`}>
              {roomState.isPublic ? "🌐 Public Arena" : "🔒 Private Arena"}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {roomState.users.length} {roomState.users.length === 1 ? 'Manager' : 'Managers'} Joined
            </span>
          </div>

          <h2 className="text-2xl font-black text-white mt-1">Auction Strategy War Room</h2>
          <p className="text-xs text-slate-400">
            Select an available franchise. Invite friends or enable AI bots to fill unoccupied teams!
          </p>
        </div>

        {/* Action Controls for Host & Players */}
        <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
          {/* 1-Click Share URL button */}
          <button
            onClick={copyShareLink}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition cursor-pointer"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
            <span>{copiedLink ? "Link Copied!" : "Copy Invite Link"}</span>
          </button>

          {isHost && (
            <>
              {/* Toggle AI Bots button */}
              <button
                onClick={() => toggleAIBots(!roomState.aiBotsEnabled)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  roomState.aiBotsEnabled
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                }`}
              >
                <Bot className="w-4 h-4" />
                <span>{roomState.aiBotsEnabled ? "AI Bots Active" : "Auto-Fill with AI"}</span>
              </button>

              <button
                onClick={onOpenCustomPlayer}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                <span>Add Custom Star</span>
              </button>

              <button
                onClick={startAuction}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/25 transition transform active:scale-95 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Start Auction</span>
              </button>
            </>
          )}

          {!isHost && (
            <div className="px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>Waiting for Host to start auction...</span>
            </div>
          )}
        </div>
      </div>

      {/* Rules Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card p-3 rounded-2xl flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Purse Budget</div>
            <div className="text-sm font-extrabold text-white">{formatCurrency(roomState.rules.totalPurse)}</div>
          </div>
        </div>

        <div className="glass-card p-3 rounded-2xl flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Bid Countdown</div>
            <div className="text-sm font-extrabold text-white">{roomState.rules.timerSeconds} Seconds</div>
          </div>
        </div>

        <div className="glass-card p-3 rounded-2xl flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Overseas Cap</div>
            <div className="text-sm font-extrabold text-white">Max {roomState.rules.maxOverseas} Players</div>
          </div>
        </div>

        <div className="glass-card p-3 rounded-2xl flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Squad Size</div>
            <div className="text-sm font-extrabold text-white">{roomState.rules.minSquadSize} - {roomState.rules.maxSquadSize} Players</div>
          </div>
        </div>
      </div>

      {/* Team Selection Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" /> Choose Your Franchise
          </h3>
          <span className="text-xs text-slate-400">
            {roomState.teams.filter(t => t.ownerId || t.isBot).length} of 10 Franchises Assigned
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
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
                className={`p-4 rounded-2xl border transition relative overflow-hidden cursor-pointer ${
                  isSelectedByMe
                    ? `border-2 ${meta?.borderClass || 'border-amber-400'} bg-slate-900/90 shadow-lg shadow-amber-500/15`
                    : isClaimedByHuman
                    ? "border-slate-800/60 bg-slate-950/40 opacity-60 cursor-not-allowed"
                    : isBotManaged
                    ? "border-blue-500/40 bg-blue-950/20 hover:border-blue-500"
                    : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
                }`}
              >
                <div 
                  className="absolute top-0 left-0 right-0 h-1" 
                  style={{ backgroundColor: team.color }} 
                />

                <div className="flex items-start justify-between">
                  <div className="text-2xl">{meta?.logoEmoji || "🏏"}</div>
                  {isSelectedByMe && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" /> Selected
                    </span>
                  )}
                  {isClaimedByHuman && (
                    <span className="text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full">
                      Claimed
                    </span>
                  )}
                  {isBotManaged && !isSelectedByMe && (
                    <span className="text-[10px] text-blue-400 bg-blue-500/15 px-2 py-0.5 rounded-full border border-blue-500/30">
                      🤖 AI Bot (Click to Take)
                    </span>
                  )}
                </div>

                <div className="mt-3">
                  <div className="text-xs font-semibold text-slate-400">{team.shortName}</div>
                  <div className="text-sm font-extrabold text-white leading-snug">{team.name}</div>
                  <div className="text-[11px] text-slate-500 italic mt-0.5">{meta?.tagline}</div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Manager:</span>
                  <span className="font-semibold text-white truncate max-w-[120px]">
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
