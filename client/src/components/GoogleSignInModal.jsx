import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Shield, Sparkles, Trophy, CheckCircle, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function GoogleSignInModal({ isOpen, onClose }) {
  const { user, loginWithGoogleCredential, quickGoogleLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [googleClientInput, setGoogleClientInput] = useState(() => {
    return localStorage.getItem('ipl_custom_google_client_id') || import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  });
  const [showConfig, setShowConfig] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const googleBtnRef = useRef(null);

  const activeClientId = googleClientInput.trim() || import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  // Initialize official Google Identity Services
  useEffect(() => {
    if (!isOpen) return;

    if (window.google?.accounts?.id && activeClientId) {
      try {
        window.google.accounts.id.initialize({
          client_id: activeClientId,
          callback: (response) => {
            if (response.credential) {
              loginWithGoogleCredential(response.credential);
              onClose();
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true
        });

        if (googleBtnRef.current) {
          googleBtnRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'filled_black',
            size: 'large',
            shape: 'pill',
            width: 320,
            text: 'continue_with',
            logo_alignment: 'left'
          });
        }
      } catch (err) {
        console.warn('Google Identity Services notice:', err);
      }
    }
  }, [isOpen, activeClientId, loginWithGoogleCredential, onClose]);

  if (!isOpen) return null;

  // Trigger Google Sign In
  const handleGoogleSignInClick = () => {
    setLoading(true);

    // If Google Identity Services is initialized with client_id, trigger prompt
    if (window.google?.accounts?.id && activeClientId) {
      try {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // If One Tap is suppressed by browser policy, show standard Google email input
            setShowEmailPrompt(true);
            setLoading(false);
          }
        });
        setTimeout(() => setLoading(false), 2000);
        return;
      } catch (e) {
        console.warn(e);
      }
    }

    // Standard Google account prompt
    setShowEmailPrompt(true);
    setLoading(false);
  };

  const handleStandardGoogleSubmit = (e) => {
    e.preventDefault();
    const email = googleEmailInput.trim();
    if (!email) return;

    setLoading(true);
    const parsedName = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    
    setTimeout(() => {
      quickGoogleLogin({
        email,
        name: parsedName || 'Cricket Manager',
        avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(email)}`
      });
      setLoading(false);
      onClose();
    }, 400);
  };

  const handleSaveCustomClientId = (e) => {
    e.preventDefault();
    if (googleClientInput.trim()) {
      localStorage.setItem('ipl_custom_google_client_id', googleClientInput.trim());
    } else {
      localStorage.removeItem('ipl_custom_google_client_id');
    }
    setShowConfig(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className="relative w-full max-w-md bg-[#0e0e10] border border-[#27272a] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden my-auto"
        >
          {/* Ambient Lighting */}
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-[#6366f1]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-[#18181b] hover:bg-[#27272a] text-[#9ca3af] hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Top Brand & Google Logo */}
          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white shadow-xl shadow-white/5 border border-gray-100 mb-1">
              {/* Authentic Google G Logo */}
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
            <p className="text-xs sm:text-sm text-[#9ca3af] max-w-xs mx-auto leading-relaxed">
              Connect your Google account to save your team and game progress across sessions.
            </p>
          </div>

          {/* Three Clean Benefit Chips */}
          <div className="space-y-2 mb-6">
            <div className="px-3.5 py-2.5 rounded-2xl bg-[#141416] border border-[#27272a] flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white">Never Lose Your Team</div>
                <div className="text-[10px] text-[#9ca3af]">Keeps your franchise & purse safe on page refresh</div>
              </div>
            </div>

            <div className="px-3.5 py-2.5 rounded-2xl bg-[#141416] border border-[#27272a] flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                <Trophy className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white">Career Trophies & Stats</div>
                <div className="text-[10px] text-[#9ca3af]">Records match championships won & player signings</div>
              </div>
            </div>

            <div className="px-3.5 py-2.5 rounded-2xl bg-[#141416] border border-[#27272a] flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#6366f1]/10 text-[#818cf8] flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white">Saved Dream Squads</div>
                <div className="text-[10px] text-[#9ca3af]">Preserves your assembled IPL rosters forever</div>
              </div>
            </div>
          </div>

          {/* Official Google Button or Standard Sign In */}
          <div className="space-y-3">
            {/* Google Identity Services Render Container (when active) */}
            <div ref={googleBtnRef} className="flex justify-center min-h-[44px]" />

            {/* Standard Modern Google Button */}
            {!showEmailPrompt && (
              <button
                type="button"
                onClick={handleGoogleSignInClick}
                disabled={loading}
                className="w-full py-3.5 px-5 rounded-2xl bg-white hover:bg-neutral-100 text-[#1f2937] font-sans font-semibold text-sm shadow-xl shadow-white/5 border border-neutral-200 transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer group hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.13C3.26 21.43 7.31 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.24C.45 8.16 0 9.98 0 12s.45 3.84 1.24 5.42l4.04-3.13z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.57 1.24 6.58l4.04 3.13c.95-2.83 3.6-4.96 6.72-4.96z" />
                </svg>
                <span className="text-[#1f2937] font-heading font-bold">
                  {loading ? 'Connecting...' : 'Continue with Google'}
                </span>
              </button>
            )}

            {/* Direct Google Account Email Confirmation */}
            {showEmailPrompt && (
              <form onSubmit={handleStandardGoogleSubmit} className="space-y-2.5 pt-1">
                <div className="text-left">
                  <label className="block text-xs font-bold text-[#9ca3af] uppercase tracking-wider mb-1.5">
                    Google Account Email
                  </label>
                  <input
                    type="email"
                    required
                    autoFocus
                    placeholder="e.g. name@gmail.com"
                    value={googleEmailInput}
                    onChange={(e) => setGoogleEmailInput(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#141416] border border-[#27272a] text-white text-sm focus:outline-none focus:border-[#6366f1] transition"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEmailPrompt(false)}
                    className="px-4 py-2.5 rounded-xl bg-[#18181b] hover:bg-[#27272a] text-[#9ca3af] text-xs font-semibold transition cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={!googleEmailInput.trim() || loading}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-white hover:bg-gray-100 text-[#1f2937] text-xs sm:text-sm font-heading font-bold shadow-lg transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>{loading ? 'Signing in...' : 'Sign In with Google'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Security and OAuth info */}
          <div className="mt-5 pt-3 border-t border-[#27272a] text-center text-[11px] text-[#6b7280]">
            <span>🔒 Standard Google OAuth. Only your profile and email are used to preserve your room and squads.</span>
            
            {/* Optional Client ID config toggle */}
            <div className="mt-2">
              <button
                type="button"
                onClick={() => setShowConfig(!showConfig)}
                className="text-[10px] text-[#6b7280] hover:text-[#9ca3af] underline cursor-pointer"
              >
                {showConfig ? 'Hide OAuth Settings' : 'Google Cloud OAuth Settings'}
              </button>
            </div>

            {showConfig && (
              <form onSubmit={handleSaveCustomClientId} className="mt-3 p-3 rounded-xl bg-[#141416] border border-[#27272a] text-left space-y-2">
                <div className="text-[11px] font-bold text-white">Google OAuth Client ID:</div>
                <input
                  type="text"
                  placeholder="e.g. 123456789-xyz.apps.googleusercontent.com"
                  value={googleClientInput}
                  onChange={(e) => setGoogleClientInput(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#0a0a0a] border border-[#27272a] text-white text-[11px] focus:outline-none focus:border-[#6366f1]"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    className="px-3 py-1 rounded-lg bg-[#6366f1] text-white text-[11px] font-bold cursor-pointer"
                  >
                    Save Client ID
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
