import React, { useState } from "react";
import { Shield, Sparkles } from "lucide-react";

function getInitials(name) {
  if (!name) return "IPL";
  const trimmed = name.trim();
  if (trimmed.toUpperCase() === "MS DHONI") return "MSD";
  if (trimmed.toUpperCase() === "KL RAHUL") return "KLR";
  if (trimmed.toUpperCase() === "SURYAKUMAR YADAV") return "SKY";
  if (trimmed.toUpperCase() === "AB DE VILLIERS") return "ABD";
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getCountryFlag(country) {
  const c = (country || "").toLowerCase();
  if (c.includes("india")) return "🇮🇳";
  if (c.includes("australia")) return "🇦🇺";
  if (c.includes("south africa")) return "🇿🇦";
  if (c.includes("england")) return "🏴󠁧󠁢󠁥󠁮󠁧󠁿";
  if (c.includes("new zealand")) return "🇳🇿";
  if (c.includes("west indies")) return "🏝️";
  if (c.includes("afghanistan")) return "🇦🇫";
  if (c.includes("sri lanka")) return "🇱🇰";
  return "🏏";
}

function getRoleEmblem(role) {
  const r = (role || "").toLowerCase();
  if (r.includes("bat")) return { emoji: "🏏", label: "Batter", color: "text-blue-400" };
  if (r.includes("bowl")) return { emoji: "⚡", label: "Bowler", color: "text-rose-400" };
  if (r.includes("all")) return { emoji: "👑", label: "All-Rounder", color: "text-amber-400" };
  if (r.includes("keeper") || r.includes("wicket")) return { emoji: "🧤", label: "Wicketkeeper", color: "text-cyan-400" };
  return { emoji: "⭐", label: "Star", color: "text-purple-400" };
}

export function PlayerPortrait(props) {
  const p = props.player || props;
  const {
    name = "Player",
    image = null,
    role = "Batter",
    country = "India",
    isOverseas = false,
    rating = 90,
    set = "Marquee Set",
  } = p;

  const size = props.size || "normal";
  const className = props.className || "";
  const [imgFailed, setImgFailed] = useState(false);
  const initials = getInitials(name);
  const flag = getCountryFlag(country);
  const roleEmblem = getRoleEmblem(role);

  const sizeClass = 
    (size === "lg" || size === "large") ? "w-28 h-36 sm:w-40 sm:h-52 md:w-44 md:h-56 shrink-0" :
    (size === "md" || size === "medium") ? "w-20 h-26 sm:w-24 sm:h-32 shrink-0" :
    (size === "sm" || size === "small") ? "w-12 h-14 sm:w-14 sm:h-16 shrink-0" :
    (size === "xs" || size === "compact") ? "w-9 h-11 shrink-0" :
    "w-20 h-26 sm:w-24 sm:h-32 shrink-0";

  const hasValidPhoto = Boolean(image) && !imgFailed;

  if (hasValidPhoto) {
    return (
      <div className={`relative overflow-hidden rounded-2xl bg-[#0a0a0c] border border-[#d4af37]/35 shadow-[0_0_25px_rgba(212,175,55,0.18)] group ${sizeClass} ${className}` }>
        <img
          src={image}
          alt={name}
          onError={() => setImgFailed(true)}
          className="w-full h-full object-cover object-top transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-1 left-1 right-1 text-center text-[8px] sm:text-[10px] uppercase font-bold text-amber-400 tracking-wider truncate">
          {set || "IPL Mega Auction"}
        </div>
      </div>
    );
  }

  const isCompact = size === "compact" || size === "xs" || size === "sm";
  const isLarge = size === "large" || size === "lg";

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-[#d4af37]/45 bg-gradient-to-b from-[#18181d] via-[#0b0b0f] to-[#040405] shadow-[0_0_30px_rgba(212,175,55,0.22)] flex flex-col items-center justify-between p-2 select-none group transition-all duration-300 hover:border-[#fbbf24] ${sizeClass} ${className}` }
    >
      {/* Golden Specular Sheen Ribbon */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.05] to-transparent pointer-events-none" />
      
      {/* Background Radial Halo Light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#d4af37]/20 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header Row: Rating & Role Emblem */}
      <div className="w-full flex items-center justify-between z-10 px-1">
        <div className="flex items-center gap-1 bg-[#d4af37]/20 border border-[#d4af37]/40 px-1.5 py-0.5 rounded-md text-[10px] sm:text-xs font-heading font-extrabold text-amber-300 shadow-sm">
          <Sparkles className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
          <span>{rating || 90}</span>
        </div>
        <div className="text-xs sm:text-base filter drop-shadow" title={roleEmblem.label}>
          {roleEmblem.emoji}
        </div>
      </div>

      {/* Center: Luxury Metallic Gold Monogram Initials */}
      <div className="my-auto text-center z-10 flex flex-col items-center justify-center py-1">
        <div className="relative">
          <span className={`font-serif font-black tracking-tighter bg-gradient-to-b from-[#fffbeb] via-[#f59e0b] to-[#b45309] bg-clip-text text-transparent drop-shadow-[0_2px_14px_rgba(245,158,11,0.5)] ${
            isCompact ? "text-xl sm:text-2xl leading-none" : isLarge ? "text-4xl sm:text-5xl" : "text-2xl sm:text-3xl"
          }` }>
            {initials}
          </span>
        </div>
        <span className="text-[10px] font-mono tracking-widest text-[#fbbf24] uppercase font-bold mt-1 flex items-center justify-center gap-1">
          <span>{flag}</span>
          <span>{country ? country.slice(0, 3).toUpperCase() : "IND"}</span>
        </span>
      </div>

      {/* Bottom Footer Ribbon */}
      <div className="w-full text-center z-10 pb-0.5 border-t border-[#27272a]/70 pt-1">
        <span className="text-[8px] sm:text-[9px] uppercase font-bold tracking-[0.1em] text-[#a1a1aa] truncate block max-w-full">
          {set || "PLAYER"}
        </span>
      </div>
    </div>
  );
}
