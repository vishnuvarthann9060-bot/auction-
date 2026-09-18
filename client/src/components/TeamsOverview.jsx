import React, { useState } from "react";
import { useSocket } from "../context/SocketContext";
import { formatCurrency } from "../utils/formatters";
import { TEAMS_DATA } from "../data/teams";
import TeamLogo from "./TeamLogo";
import { Users, ChevronRight, ChevronDown, ChevronUp, Trophy } from "lucide-react";

export function TeamsOverview({ onSelectTeamDetail }) {
  const { roomState, myTeam } = useSocket();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!roomState || !roomState.teams) return null;

  const totalPurse = roomState.rules?.totalPurse || 1000000000;

  return (
    <div className="glass-panel p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-[#27272a] bg-[#121212] transition-all duration-300 shadow-lg">
      
      {/* Header Bar with Toggle */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-[#818cf8]" />
          <h3 className="text-xs sm:text-sm font-heading font-bold uppercase tracking-wider text-white">
            All 10 Teams & Budgets
          </h3>
          <span className="text-[10px] text-[#71717a] hidden md:inline">
            (Click any team to inspect squad)
          </span>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#1e1e1e] hover:bg-[#27272a] border border-[#27272a] text-xs font-semibold text-[#818cf8] transition cursor-pointer"
        >
          <span>{isExpanded ? "Collapse" : "Expand All"}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Collapsed Mode: Sleek Single-Line Horizontal Strip */}
      {!isExpanded ? (
        <div className="pt-2 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {roomState.teams.map((team) => {
            const meta = TEAMS_DATA[team.id];
            const isMine = myTeam?.id === team.id;
            return (
              <button
                key={team.id}
                onClick={() => onSelectTeamDetail(team)}
                className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-2 shrink-0 transition cursor-pointer text-xs ${
                  isMine
                    ? "bg-[#6366f1]/15 border-[#6366f1] text-white shadow-sm"
                    : "bg-[#0a0a0a] border-[#27272a] text-[#9ca3af] hover:border-[#3f3f46] hover:text-white"
                }`}
              >
                <TeamLogo meta={meta} size="xs" />
                <span className="font-heading font-bold text-white">{team.shortName}</span>
                <span className="font-mono text-emerald-400 font-semibold">{formatCurrency(team.purse)}</span>
                {isMine && (
                  <span className="text-[9px] bg-[#6366f1] text-white px-1 rounded font-bold">YOU</span>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        /* Expanded Mode: Full Detailed 10-Team Grid */
        <div className="pt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-10 gap-2 sm:gap-3">
          {roomState.teams.map((team) => {
            const meta = TEAMS_DATA[team.id];
            const isMine = myTeam?.id === team.id;
            const pursePercent = (team.purse / totalPurse) * 100;
            const overseasCount = team.squad.filter(p => p.isOverseas).length;

            return (
              <div
                key={team.id}
                onClick={() => onSelectTeamDetail(team)}
                className={`p-2.5 sm:p-3 rounded-2xl border transition cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isMine 
                    ? "bg-[#121212] border-[#6366f1] shadow-md shadow-[#6366f1]/10" 
                    : "bg-[#121212] border-[#27272a] hover:border-[#3f3f46]"
                }`}
              >
                {/* Colored left edge bar */}
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1.5" 
                  style={{ backgroundColor: team.color }} 
                />

                <div className="flex items-start justify-between pl-1">
                  <div className="flex items-center gap-2">
                    <TeamLogo meta={meta} size="xs" />
                    <div>
                      <div className="text-xs font-heading font-bold text-white flex items-center gap-1">
                        <span>{team.shortName}</span>
                        {isMine && (
                          <span className="text-[8px] text-[#818cf8] bg-[#6366f1]/20 px-1 rounded font-bold">YOU</span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#9ca3af] truncate max-w-[70px]">
                        {team.ownerName || "Open"}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-emerald-400">
                      {formatCurrency(team.purse)}
                    </div>
                  </div>
                </div>

                {/* Progress bar of purse */}
                <div className="w-full bg-[#050505] rounded-full h-1 mt-2 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500" 
                    style={{ 
                      width: `${pursePercent}%`, 
                      backgroundColor: team.color 
                    }} 
                  />
                </div>

                {/* Squad & Overseas Tally */}
                <div className="mt-1.5 pt-1.5 border-t border-[#27272a] flex items-center justify-between text-[10px] text-[#9ca3af] pl-1">
                  <span>Sq: <strong className="text-white">{team.squad.length}</strong>/{roomState.rules?.maxSquadSize || 25}</span>
                  <span>OS: <strong className="text-white">{overseasCount}</strong>/{roomState.rules?.maxOverseas || 8}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
