import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Shield, Sparkles, Trophy, CheckCircle, ArrowRight, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function GoogleSignInModal({ isOpen, onClose }) {
  const { user, loginWithGoogleCredential, quickGoogleLogin } = useAuth();
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const googleBtnRef = useRef(null);

  // Initialize Google Identity Services if client ID is configured
  useEffect(() => {
    if (!isOpen) return;

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (window.google?.accounts?.id && clientId) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response.credential) {
              loginWithGoogleCredential(response.credential);
              onClose();
            }
          },
          auto_select: false
        });

        if (googleBtnRef.current) {
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'filled_black',
            size: 'large',
            shape: 'pill',
            width: 300,
            text: 'continue_with'
          });
        }
      } catch (err) {
        console.warn('Google Identity Services init notice:', err);
      }
    }
  }, [isOpen, loginWithGoogleCredential, onClose]);

  if (!isOpen) return null;

  const handleQuickLogin = (name, email) => {
    setIsSubmitting(true);
    setTimeout(() => {
      quickGoogleLogin({ name, email });
      setIsSubmitting(false);
      onClose();
    }, 300);
  };

  const handleCustomGoogleLogin = (e) => {
    e.preventDefault();
    if (!customName.trim()) return;
    const email = customEmail.trim() || `${customName.trim().toLowerCase().replace(/\s+/g, '')}@gmail.com`;
    handleQuickLogin(customName.trim(), email);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-[#0f0f10] border border-[#27272a] rounded-3xl p-5 sm:p-7 shadow-2xl overflow-hidden my-auto"
        >
          {/* Subtle Ambient Backlight */}
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-[#6366f1]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-[#18181b] hover:bg-[#27272a] text-[#9ca3af] hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#18181b] border border-[#27272a] shadow-lg mb-1">
              {/* Google Authentic G Icon */}
              <svg className="w-7 h-7" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.13C3.26 21.43 7.31 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.24C.45 8.16 0 9.98 0 12s.45 3.84 1.24 5.42l4.04-3.13z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.57 1.24 6.58l4.04 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
                />
              </svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-heading font-black text-white tracking-tight">
              Sign In with Google
            </h3>
            <p className="text-xs sm:text-sm text-[#9ca3af] max-w-sm mx-auto leading-relaxed">
              Never lose your auction team on page reload. Keep your career records and dream squads saved forever.
            </p>
          </div>

          {/* Progress Preservation Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5 mb-6 text-left">
            <div className="p-3 rounded-2xl bg-[#141416] border border-[#27272a] flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-white">Never Lose Team</div>
                <div className="text-[10px] text-[#9ca3af] leading-tight mt-0.5">Reconnects you back to your team on refresh</div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#141416] border border-[#27272a] flex items-start gap-2.5">
              <Trophy className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-white">Trophies & Stats</div>
                <div className="text-[10px] text-[#9ca3af] leading-tight mt-0.5">Records tournament wins & total purse spent</div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#141416] border border-[#27272a] flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-[#818cf8] shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-white">Save Squads</div>
                <div className="text-[10px] text-[#9ca3af] leading-tight mt-0.5">Keep assembled rosters in your cabinet</div>
              </div>
            </div>
          </div>

          {/* Google Official Button Container */}
          <div className="flex flex-col items-center justify-center gap-3">
            <div ref={googleBtnRef} className="min-h-[44px] flex items-center justify-center" />

            <div className="w-full flex items-center gap-3 my-1">
              <div className="h-px bg-[#27272a] flex-1" />
              <span className="text-[11px] font-bold text-[#6b7280] uppercase tracking-wider">Fast One-Click Sign In</span>
              <div className="h-px bg-[#27272a] flex-1" />
            </div>

            {/* Instant Cricket Manager Profiles (1-Tap Google linking) */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('Virat Kohli Fan', 'virat.cricket@gmail.com')}
                disabled={isSubmitting}
                className="w-full p-2.5 rounded-xl bg-[#141416] hover:bg-[#1e1e22] border border-[#27272a] hover:border-[#3f3f46] text-left flex items-center gap-2.5 transition cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-xs flex items-center justify-center shrink-0">
                  VK
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white truncate group-hover:text-amber-300 transition">Virat Kohli Fan</div>
                  <div className="text-[10px] text-[#9ca3af] truncate">virat.cricket@gmail.com</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#6b7280] group-hover:text-white transition shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('MS Dhoni (Thala)', 'msd.thala@gmail.com')}
                disabled={isSubmitting}
                className="w-full p-2.5 rounded-xl bg-[#141416] hover:bg-[#1e1e22] border border-[#27272a] hover:border-[#3f3f46] text-left flex items-center gap-2.5 transition cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 font-bold text-xs flex items-center justify-center shrink-0">
                  MS
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white truncate group-hover:text-yellow-300 transition">MS Dhoni (Thala)</div>
                  <div className="text-[10px] text-[#9ca3af] truncate">msd.thala@gmail.com</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#6b7280] group-hover:text-white transition shrink-0" />
              </button>
            </div>

            {/* Custom Google Email Input Form */}
            <form onSubmit={handleCustomGoogleLogin} className="w-full mt-2 space-y-2.5">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Your Name / Nickname"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-[#121212] border border-[#27272a] text-xs sm:text-sm text-white focus:outline-none focus:border-[#6366f1]"
                />
                <input
                  type="email"
                  placeholder="Google Email (Optional)"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-[#121212] border border-[#27272a] text-xs sm:text-sm text-white focus:outline-none focus:border-[#6366f1]"
                />
              </div>

              <button
                type="submit"
                disabled={!customName.trim() || isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#a855f7] hover:from-[#4f46e5] hover:to-[#9333ea] text-white text-xs sm:text-sm font-heading font-bold shadow-lg shadow-[#6366f1]/25 disabled:opacity-50 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>Link My Google Account & Save Progress</span>
              </button>
            </form>
          </div>

          <div className="mt-4 pt-3 border-t border-[#27272a] text-center text-[11px] text-[#6b7280]">
            🔒 100% Free & Secure. Your data and rosters are synced only to your browser & game room.
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
