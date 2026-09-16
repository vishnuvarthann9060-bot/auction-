import React, { useState } from "react";
import { formatCurrency } from "../utils/formatters";
import { analyzeSquad } from "../utils/squadAdvisor";
import { 
  ShieldCheck, AlertCircle, Sparkles, ChevronDown, ChevronUp, 
  HelpCircle, CheckCircle2, TrendingUp, Info 
} from "lucide-react";

export function SmartPurseAdvisor({ myTeam, currentPlayer, rules }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!myTeam) return null;

  const analysis = analyzeSquad(myTeam, currentPlayer, rules);
  if (!analysis) return null;

  const { roles, needs, lotAdvice, maxSafeBid, avgBudgetPerSlot, minSlotsNeeded } = analysis;

  return (
    <div className="rounded-2xl border border-[#27272a] bg-[#0c0c0e] p-3 transition duration-200 shadow-sm space-y-2.5">
      
      {/* Header Bar: Safe Bid & Slot Average */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-heading font-bold text-[#818cf8]">
          <ShieldCheck className="w-4 h-4 text-[#818cf8]" />
          <span className="uppercase tracking-[0.06em]">Purse & Squad Advisor</span>
        </div>

        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-[11px] text-[#9ca3af] hover:text-white transition cursor-pointer"
        >
          <span>{isExpanded ? "Less" : "Details"}</span>
          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2 rounded-xl bg-[#141416] border border-[#27272a]/70 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-medium text-[#71717a]">Safe Max Bid</div>
            <div className="text-sm font-teko font-bold text-amber-300">
              {formatCurrency(maxSafeBid)}
            </div>
          </div>
          <span className="text-[10px] text-[#71717a]" title="Purse minus reserve needed for remaining slots">
            Cap
          </span>
        </div>

        <div className="p-2 rounded-xl bg-[#141416] border border-[#27272a]/70 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-medium text-[#71717a]">Avg / Rem. Slot</div>
            <div className="text-sm font-teko font-bold text-emerald-400">
              {formatCurrency(avgBudgetPerSlot)}
            </div>
          </div>
          <span className="text-[10px] text-[#71717a]">
            {minSlotsNeeded > 0 ? `${minSlotsNeeded} req` : "Full"}
          </span>
        </div>
      </div>

      {/* Role Composition Radar */}
      <div className="flex items-center justify-between gap-1 text-[11px] font-mono py-1 px-1.5 rounded-xl bg-[#070708] border border-[#1f1f23]">
        <div className="flex items-center gap-1 text-[#f3f4f6]" title="Specialist Batters">
          <span>🏏</span>
          <span className={needs.needsBatters ? "text-amber-400 font-bold" : "text-[#9ca3af]"}>
            {roles.batters}
          </span>
        </div>

        <span className="text-[#27272a]">•</span>

        <div className="flex items-center gap-1 text-[#f3f4f6]" title="Wicketkeepers">
          <span>🧤</span>
          <span className={needs.needsWicketkeeper ? "text-rose-400 font-bold underline" : "text-emerald-400 font-bold"}>
            {roles.wicketkeepers}
          </span>
        </div>

        <span className="text-[#27272a]">•</span>

        <div className="flex items-center gap-1 text-[#f3f4f6]" title="All-Rounders">
          <span>👑</span>
          <span className="text-[#9ca3af]">{roles.allRounders}</span>
        </div>

        <span className="text-[#27272a]">•</span>

        <div className="flex items-center gap-1 text-[#f3f4f6]" title="Frontline Bowlers">
          <span>⚡</span>
          <span className={needs.needsBowlers ? "text-amber-400 font-bold" : "text-[#9ca3af]"}>
            {roles.bowlers}
          </span>
        </div>

        <span className="text-[#27272a]">•</span>

        <div className="flex items-center gap-1 text-[#f3f4f6]" title="Overseas Players">
          <span>✈️</span>
          <span className={roles.overseas >= (rules?.maxOverseas || 8) ? "text-rose-400 font-bold" : "text-[#9ca3af]"}>
            {roles.overseas}/{rules?.maxOverseas || 8}
          </span>
        </div>
      </div>

      {/* Contextual Recommendation for Current Player */}
      {lotAdvice && (
        <div className={`px-2.5 py-1.5 rounded-xl border text-xs flex items-center justify-between gap-2 ${lotAdvice.color}`}>
          <div className="flex items-center gap-1.5 truncate">
            <Sparkles className="w-3 h-3 shrink-0" />
            <span className="truncate">{lotAdvice.text}</span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-black/30 shrink-0">
            {lotAdvice.badge}
          </span>
        </div>
      )}

      {/* Expanded Breakdown */}
      {isExpanded && (
        <div className="pt-2 border-t border-[#1f1f23] text-xs space-y-1.5 text-[#9ca3af]">
          <div className="flex justify-between">
            <span>Minimum Squad Goal:</span>
            <strong className="text-white">{analysis.minSquad} players</strong>
          </div>
          <div className="flex justify-between">
            <span>Mandatory Reserve Fund:</span>
            <strong className="text-amber-300">{formatCurrency(analysis.mandatoryReserve)}</strong>
          </div>
          <div className="flex justify-between">
            <span>Wicketkeeper Requirement:</span>
            <strong className={needs.needsWicketkeeper ? "text-rose-400" : "text-emerald-400"}>
              {needs.needsWicketkeeper ? "0 (Urgent Need)" : `${roles.wicketkeepers} Secured`}
            </strong>
          </div>
          <p className="text-[10px] text-[#71717a] pt-1 leading-relaxed">
            *Safe Max Bid ensures you retain at least ₹20 Lakhs per required slot to satisfy official IPL roster rules.
          </p>
        </div>
      )}

    </div>
  );
}
