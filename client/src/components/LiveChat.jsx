import React, { useState, useRef, useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import { MessageSquare, Send, X, ChevronUp, ChevronDown, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const QUICK_REACTIONS = ["🔥", "🔨", "💸", "👑", "😱", "🏏", "🦁", "👏"];

export function LiveChat() {
  const { roomState, myTeam, sendChat, sendReaction, floatingReactions } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef(null);

  const chats = roomState?.chats || [];

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chats, isOpen]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    sendChat(inputMessage.trim());
    setInputMessage("");
  };

  if (!roomState) return null;

  return (
    <>
      {/* Floating Animated Reaction Bubbles across the screen */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <AnimatePresence>
          {floatingReactions.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ 
                opacity: 1, 
                y: "85vh", 
                x: `${15 + (i * 12) % 70}vw`, 
                scale: 0.8 
              }}
              animate={{ 
                opacity: 0, 
                y: "20vh", 
                scale: [0.8, 1.4, 1.2],
                rotate: [-10, 15, -10]
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.2, ease: "easeOut" }}
              className="absolute flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-white/20 shadow-2xl backdrop-blur-md text-sm font-bold"
            >
              <span className="text-2xl">{r.emoji}</span>
              <span className="text-xs text-white">
                {r.teamShortName ? `${r.teamShortName}: ${r.sender}` : r.sender}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Floating Chat Launcher Button & Reaction Bar */}
      <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2">
        
        {/* Quick Reaction Bar */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-[#121212]/90 border border-[#27272a] shadow-2xl backdrop-blur-md">
          {QUICK_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => sendReaction(emoji)}
              className="w-8 h-8 rounded-full hover:bg-[#1e1e1e] flex items-center justify-center text-lg hover:scale-125 transition transform active:scale-90 cursor-pointer"
              title={`React ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Chat Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:from-[#4f46e5] hover:to-[#7c3aed] text-white font-heading font-semibold text-xs shadow-xl shadow-[#6366f1]/25 transition cursor-pointer"
        >
          <MessageSquare className="w-4 h-4 fill-white" />
          <span>Live Banter ({chats.length})</span>
          {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>

        {/* Collapsible Chat Box */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="w-80 sm:w-96 h-96 glass-panel rounded-3xl border border-[#27272a] shadow-2xl flex flex-col overflow-hidden bg-[#121212]/95"
            >
              {/* Chat Header */}
              <div className="p-3.5 border-b border-[#27272a] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-heading font-bold uppercase tracking-[0.08em] text-white">
                    Auction War Room Chat
                  </span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg text-[#9ca3af] hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat Messages Stream */}
              <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs">
                {chats.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-[#71717a] p-4">
                    <Sparkles className="w-8 h-8 mb-2 opacity-30 text-[#818cf8]" />
                    <p className="font-semibold text-[#9ca3af]">No banter yet!</p>
                    <p className="text-[11px] text-[#71717a]">Send a message or react to celebrate a bid.</p>
                  </div>
                ) : (
                  chats.map((c) => (
                    <div key={c.id} className="p-2.5 rounded-xl bg-[#050505] border border-[#27272a] space-y-0.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span 
                          className="font-bold uppercase tracking-wider" 
                          style={{ color: c.teamColor || '#818cf8' }}
                        >
                          {c.teamShortName ? `[${c.teamShortName}] ${c.sender}` : c.sender}
                        </span>
                        <span className="text-[#71717a]">
                          {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[#f3f4f6] break-words leading-relaxed text-xs">
                        {c.text}
                      </p>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSend} className="p-2.5 border-t border-[#27272a] bg-[#121212] flex items-center gap-2">
                <input
                  type="text"
                  maxLength={150}
                  placeholder={myTeam ? `Chat as ${myTeam.shortName}...` : "Send a message..."}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-[#050505] border border-[#27272a] text-white placeholder-[#71717a] text-xs focus:outline-none focus:border-[#6366f1]"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="p-2 rounded-xl bg-[#6366f1] hover:bg-[#4f46e5] disabled:opacity-40 text-white transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </>
  );
}
