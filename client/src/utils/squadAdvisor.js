/**
 * Tactical Squad Advisor & Purse Optimization Engine
 */

export function analyzeSquad(myTeam, currentPlayer, rules = {}) {
  if (!myTeam) return null;

  const minSquad = rules.minSquadSize || 18;
  const maxSquad = rules.maxSquadSize || 25;
  const maxOverseas = rules.maxOverseas || 8;
  const minBasePrice = 2000000; // ₹20 Lakhs min IPL reserve

  const squad = myTeam.squad || [];
  const squadCount = squad.length;

  const minSlotsNeeded = Math.max(0, minSquad - squadCount);
  const maxSlotsRemaining = Math.max(0, maxSquad - squadCount);

  // Reserve required for other remaining slots if user buys current lot
  const reserveForOthers = minSlotsNeeded > 1 ? (minSlotsNeeded - 1) * minBasePrice : 0;
  const maxSafeBid = Math.max(0, myTeam.purse - reserveForOthers);

  // Average budget per remaining slot
  const divisor = minSlotsNeeded > 0 ? minSlotsNeeded : Math.max(1, maxSlotsRemaining);
  const avgBudgetPerSlot = Math.round(myTeam.purse / divisor);

  // Squad role breakdown
  let batters = 0;
  let bowlers = 0;
  let allRounders = 0;
  let wicketkeepers = 0;
  let overseas = 0;

  squad.forEach((p) => {
    if (p.isOverseas) overseas++;
    const roleLower = (p.role || "").toLowerCase();
    if (roleLower.includes("keeper") || roleLower.includes("wicket")) {
      wicketkeepers++;
    } else if (roleLower.includes("all")) {
      allRounders++;
    } else if (roleLower.includes("bowl")) {
      bowlers++;
    } else {
      batters++;
    }
  });

  const needsWicketkeeper = wicketkeepers === 0;
  const needsBowlers = bowlers < 4;
  const needsBatters = batters < 4;
  const needsAllRounders = allRounders < 2;
  const overseasFull = overseas >= maxOverseas;
  const overseasSlotsLeft = maxOverseas - overseas;

  // Contextual advice for current player lot
  let lotAdvice = null;
  if (currentPlayer) {
    const isOver = currentPlayer.isOverseas;
    const pRoleLower = (currentPlayer.role || "").toLowerCase();
    const isWk = pRoleLower.includes("keeper") || pRoleLower.includes("wicket");
    const isBowl = pRoleLower.includes("bowl");
    const isBat = pRoleLower.includes("bat");

    if (isOver && overseasFull) {
      lotAdvice = {
        type: "DANGER",
        badge: "Quota Exceeded",
        text: `Overseas quota full (${maxOverseas}/${maxOverseas}) - Cannot acquire`,
        color: "text-rose-400 border-rose-500/30 bg-rose-500/10"
      };
    } else if (isWk && needsWicketkeeper) {
      lotAdvice = {
        type: "PRIORITY",
        badge: "High Priority",
        text: `Critical Target: You have 0 wicketkeepers signed!`,
        color: "text-amber-300 border-amber-400/40 bg-amber-500/15"
      };
    } else if (isOver && overseasSlotsLeft === 1) {
      lotAdvice = {
        type: "CAUTION",
        badge: "Final Slot",
        text: `Consumes your 8th and final overseas slot`,
        color: "text-amber-400 border-amber-500/30 bg-amber-500/10"
      };
    } else if (isBowl && needsBowlers) {
      lotAdvice = {
        type: "RECOMMENDED",
        badge: "Recommended",
        text: `Strengthen bowling: Currently have only ${bowlers} frontline bowlers`,
        color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
      };
    } else if (isBat && needsBatters) {
      lotAdvice = {
        type: "RECOMMENDED",
        badge: "Recommended",
        text: `Build batting depth: Currently have ${batters} specialist batters`,
        color: "text-blue-400 border-blue-500/30 bg-blue-500/10"
      };
    } else {
      lotAdvice = {
        type: "NEUTRAL",
        badge: "Tactical Pick",
        text: `${currentPlayer.rating || 90} OVR ${currentPlayer.role} • Fits overall squad balance`,
        color: "text-[#818cf8] border-[#6366f1]/30 bg-[#6366f1]/10"
      };
    }
  }

  return {
    squadCount,
    minSquad,
    maxSquad,
    minSlotsNeeded,
    maxSlotsRemaining,
    mandatoryReserve: reserveForOthers,
    maxSafeBid,
    avgBudgetPerSlot,
    roles: {
      batters,
      bowlers,
      allRounders,
      wicketkeepers,
      overseas
    },
    needs: {
      needsWicketkeeper,
      needsBowlers,
      needsBatters,
      needsAllRounders,
      overseasSlotsLeft
    },
    lotAdvice
  };
}
