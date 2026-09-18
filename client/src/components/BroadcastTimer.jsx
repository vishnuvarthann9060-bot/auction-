import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, AlertTriangle, Flame } from "lucide-react";

export function BroadcastTimer({ timer = 15, totalTimer = 15, status }) {
  const timerProgress = Math.max(0, Math.min(100, (timer / totalTimer) * 100));
  const isCritical = timer <= 2;
  const isUrgent = timer <= 5 && !isCritical;
  
  // Phase colors & gradients
  const phase = isCritical ? "critical" : isUrgent ? "urgent" : "normal";
  
  // Center & Radius for the SVG
  const size = 64;
  const cx = 32;
  const cy = 32;
  const r = 24;
  const circumference = 2 * Math.PI * r; // ~150.8
  const strokeDashoffset = circumference - (circumference * timerProgress) / 100;

  // Tracer bead coordinates (starts at -90deg / top, rotates clockwise)
  const angle = -Math.PI / 2 + 2 * Math.PI * (timerProgress / 100);
  const tracerX = cx + r * Math.cos(angle);
  const tracerY = cy + r * Math.sin(angle);

  // Gradient ID & Glow styles
  const gradientId = `timer-grad-${phase}`;
  const glowColor = isCritical 
    ? "rgba(239, 68, 68, 0.6)" 
    : isUrgent 
    ? "rgba(245, 158, 11, 0.5)" 
    : "rgba(99, 102, 241, 0.45)";

  const strokeGlowFilter = isCritical
    ? "drop-shadow(0 0 6px #ef4444)"
    : isUrgent
    ? "drop-shadow(0 0 5px #f59e0b)"
    : "drop-shadow(0 0 4px #818cf8)";

  return (
    <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
      {/* Visual Dial Container */}
      <div className="relative flex items-center justify-center">
        {/* Pulsing Shockwave Ring when Critical (<= 2s) */}
        {isCritical && (
          <motion.div
            animate={{ scale: [1, 1.45], opacity: [0.7, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "easeOut" }}
            className="absolute inset-0 rounded-full border-2 border-red-500 pointer-events-none"
          />
        )}

        {isUrgent && (
          <motion.div
            animate={{ scale: [1, 1.25], opacity: [0.4, 0] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: "easeOut" }}
            className="absolute inset-0 rounded-full border border-amber-500/50 pointer-events-none"
          />
        )}

        {/* Dial Base Frame */}
        <motion.div
          animate={isCritical ? { scale: [1, 1.06, 1] } : {}}
          transition={{ duration: 0.4, repeat: isCritical ? Infinity : 0 }}
          className="relative w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-gradient-to-b from-[#1c1c20] to-[#09090b] p-0.5 shadow-2xl border border-[#27272a] flex items-center justify-center overflow-hidden"
          style={{
            boxShadow: `0 0 18px ${glowColor}`
          }}
        >
          {/* Subtle Ambient Radial Flare */}
          <div 
            className="absolute inset-0 rounded-full opacity-35 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${glowColor} 0%, transparent 70%)`
            }}
          />

          <svg 
            width={size} 
            height={size} 
            viewBox="0 0 64 64" 
            className="w-full h-full transform -rotate-90 relative z-10"
          >
            <defs>
              {/* Normal State: Electric Indigo to Cyan Gradient */}
              <linearGradient id="timer-grad-normal" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>

              {/* Urgent State: Amber to Vibrant Orange Gradient */}
              <linearGradient id="timer-grad-urgent" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="70%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>

              {/* Critical State: Intense Neon Red to Crimson Laser */}
              <linearGradient id="timer-grad-critical" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff0055" />
                <stop offset="50%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#dc2626" />
              </linearGradient>
            </defs>

            {/* Subtle Dotted Chronometer Track */}
            <circle
              cx={cx}
              cy={cy}
              r={r}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="3.5"
              fill="transparent"
            />

            {/* Precision Micro-Tick Marks (12 ticks like a luxury chronograph) */}
            {Array.from({ length: 12 }).map((_, i) => {
              const tickAngle = (i * 30 * Math.PI) / 180;
              const x1 = cx + (r - 2) * Math.cos(tickAngle);
              const y1 = cy + (r - 2) * Math.sin(tickAngle);
              const x2 = cx + (r + 1) * Math.cos(tickAngle);
              const y2 = cy + (r + 1) * Math.sin(tickAngle);
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="rgba(255,255,255,0.18)"
                  strokeWidth="1"
                />
              );
            })}

            {/* Glowing Active Progress Arc */}
            <circle
              cx={cx}
              cy={cy}
              r={r}
              stroke={`url(#${gradientId})`}
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-300 ease-out"
              style={{ filter: strokeGlowFilter }}
            />

            {/* Traveling Tracer Bead at Arc Tip */}
            {timerProgress > 2 && (
              <circle
                cx={tracerX}
                cy={tracerY}
                r="2.5"
                fill="#ffffff"
                className="transition-all duration-300 ease-out"
                style={{
                  filter: `drop-shadow(0 0 5px ${isCritical ? "#ff0055" : isUrgent ? "#f59e0b" : "#6366f1"})`
                }}
              />
            )}
          </svg>

          {/* Central Digits with Animated Spring Flip */}
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={timer}
                initial={{ y: -6, scale: 1.25, opacity: 0 }}
                animate={{ y: 0, scale: 1, opacity: 1 }}
                exit={{ y: 6, scale: 0.75, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                className={`font-teko font-black text-2xl sm:text-3xl leading-none select-none ${
                  isCritical 
                    ? "text-red-400 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]" 
                    : isUrgent 
                    ? "text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.7)]" 
                    : "text-white drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]"
                }`}
              >
                {timer}
              </motion.span>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Broadcast Telemetry Label & Dynamic Pulse Pill */}
      <div className="flex flex-col justify-center min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-[0.1em] font-extrabold text-[#9ca3af]">
            Timer
          </span>
          {/* Animated Mini Equalizer / Pulse Indicator */}
          <div className="flex items-end gap-0.5 h-2.5">
            <span 
              className={`w-0.5 rounded-full transition-all duration-300 ${
                isCritical ? "bg-red-500 animate-bounce h-2.5" : isUrgent ? "bg-amber-400 animate-pulse h-2" : "bg-[#818cf8] h-1.5"
              }`} 
            />
            <span 
              className={`w-0.5 rounded-full transition-all duration-300 ${
                isCritical ? "bg-red-500 animate-ping h-3" : isUrgent ? "bg-amber-400 animate-bounce h-2.5" : "bg-[#818cf8] h-2"
              }`} 
            />
            <span 
              className={`w-0.5 rounded-full transition-all duration-300 ${
                isCritical ? "bg-red-500 animate-bounce h-2" : isUrgent ? "bg-amber-400 animate-pulse h-1.5" : "bg-[#818cf8] h-1"
              }`} 
            />
          </div>
        </div>

        <div className={`text-xs sm:text-sm font-heading font-black tracking-wide flex items-center gap-1 truncate ${
          isCritical 
            ? "text-red-400 animate-pulse" 
            : isUrgent 
            ? "text-amber-400" 
            : "text-[#f3f4f6]"
        }`}>
          {isCritical ? (
            <>
              <Flame className="w-3.5 h-3.5 text-red-500 shrink-0 animate-bounce" />
              <span>FINAL CALL!</span>
            </>
          ) : isUrgent ? (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Closing Soon</span>
            </>
          ) : (
            <>
              <Zap className="w-3 h-3 text-[#818cf8] shrink-0" />
              <span>Bidding Active</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
