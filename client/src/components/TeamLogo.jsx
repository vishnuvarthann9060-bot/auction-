import React, { useState } from "react";
import { TEAMS_DATA } from "../data/teams";

/**
 * TeamLogo renders an official franchise logo from /logos/{id}.png,
 * with fallback to the team's emoji if the image fails or isn't available.
 */
export default function TeamLogo({ teamId, meta, size = "md", className = "" }) {
  const [hasError, setHasError] = useState(false);

  const teamMeta = meta || (teamId ? TEAMS_DATA[teamId?.toLowerCase()] : null);
  const logoUrl = teamMeta?.logoUrl || (teamId ? `/logos/${teamId.toLowerCase()}.png` : null);
  const emoji = teamMeta?.logoEmoji || "🏏";
  const name = teamMeta?.shortName || teamMeta?.name || "Team";

  const sizeMap = {
    xs: "w-4 h-4 text-xs",
    sm: "w-6 h-6 text-sm",
    md: "w-8 h-8 sm:w-9 sm:h-9 text-lg sm:text-xl",
    lg: "w-10 h-10 sm:w-12 sm:h-12 text-2xl sm:text-3xl",
    xl: "w-14 h-14 sm:w-16 sm:h-16 text-4xl",
    "2xl": "w-20 h-20 sm:w-24 sm:h-24 text-5xl",
  };

  const currentSize = sizeMap[size] || size;

  if (logoUrl && !hasError) {
    return (
      <img
        src={logoUrl}
        alt={`${name} logo`}
        className={`${currentSize} object-contain inline-block drop-shadow-md transition-transform duration-200 ${className}`}
        onError={() => setHasError(true)}
        loading="lazy"
      />
    );
  }

  return (
    <span className={`inline-flex items-center justify-center ${currentSize} ${className}`}>
      {emoji}
    </span>
  );
}
