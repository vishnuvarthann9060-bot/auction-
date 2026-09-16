import React from "react";
import { useSocket } from "../context/SocketContext";
import { formatCurrency } from "../utils/formatters";
import { TEAMS_DATA } from "../data/teams";
import { Users, ChevronRight, Trophy } from "lucide-react";

export function TeamsOverview({ onSelectTeamDetail }) {
  const { roomState, myTeam } = useSocket();

  if (!roomState || !roomState.teams) return null;

  const totalPurse = roomState.rules?.totalPurse || 1000000000;

  return (
    <div className="glass-panel p-5 rounded-3xl border border-[#27272a] space-y-4 bg-[#121212]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-[#818cf8]" />
          <h3 className="text-sm font-heading font-bold uppercase tracking-[-0.01em] text-white">
            Franchise Standings & Purses
          </h3>
        </div>
        <span className="text-[11px] text-[#9ca3af]">Click any franchise to inspect roster</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {roomState.teams.map((team) => {
          const meta = TEAMS_DATA[team.id];
          const isMine = myTeam?.id === team.id;
          const pursePercent = (team.purse / totalPurse) * 100;
          const overseasCount = team.squad.filter(p => p.isOverseas).length;

          return (
            <div
              key={team.id}
              onClick={() => onSelectTeamDetail(team)}
              className={`p-3.5 rounded-2xl border transition cursor-pointer relative overflow-hidden ${
                isMine 
                  ? "bg-[#121212] border-[#6366f1] shadow-md shadow-[#6366f1]/10" 
                  : "bg-[#121212] border-[#27272a] hover:border-[#3f3f46]"
              }`}
            >
              {/* Colored left edge bar */}
              <div 
                className="absolute left-0 top-0 bottom-0 w-1" 
                style={{ backgroundColor: team.color }} 
              />

              <div className="flex items-start justify-between pl-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{meta?.logoEmoji || "🏏"}</span>
                  <div>
                    <div className="text-xs font-heading font-bold text-white flex items-center gap-1.5">
                      {team.shortName}
                      {isMine && (
                        <span className="text-[9px] text-[#818cf8] bg-[#6366f1]/20 px-1 rounded font-bold">YOU</span>
                      )}
                    </div>
                    <div className="text-[10px] text-[#9ca3af] truncate max-w-[100px]">
                      {team.ownerName || "Unclaimed"}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-emerald-400">
                    {formatCurrency(team.purse)}
                  </div>
                  <div className="text-[10px] text-[#71717a]">Purse Left</div>
                </div>
              </div>

              {/* Progress bar of purse */}
              <div className="w-full bg-[#050505] rounded-full h-1.5 mt-2.5 overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500" 
                  style={{ 
                    width: `${pursePercent}%`, 
                    backgroundColor: team.color 
                  }} 
                />
              </div>

              {/* Squad & Overseas Tally */}
              <div className="mt-2 pt-2 border-t border-[#27272a] flex items-center justify-between text-[10px] text-[#9ca3af] pl-1">
                <span>Squad: <strong className="text-white">{team.squad.length}</strong></span>
                <span>Overseas: <strong className="text-white">{overseasCount}</strong>/{roomState.rules?.maxOverseas || 8}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
