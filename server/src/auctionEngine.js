// Helper to calculate minimum increment based on current price
export function getMinBidIncrement(currentBid) {
  if (currentBid < 10000000) {
    // Under 1 Cr -> 10 Lakhs
    return 1000000;
  } else if (currentBid < 50000000) {
    // 1 Cr to 5 Cr -> 25 Lakhs
    return 2500000;
  } else if (currentBid < 100000000) {
    // 5 Cr to 10 Cr -> 50 Lakhs
    return 5000000;
  } else {
    // 10 Cr and above -> 1 Cr
    return 10000000;
  }
}

// Get convenient bid jump buttons for the UI (+min, +medium, +high)
export function getBidOptions(currentBid, basePrice) {
  if (!currentBid || currentBid === 0) {
    return [basePrice];
  }
  const minInc = getMinBidIncrement(currentBid);
  return [
    currentBid + minInc,
    currentBid + minInc * 2,
    currentBid + minInc * 4
  ];
}

// Check if a team is eligible to place a specific bid
export function validateBid(team, player, bidAmount, rules) {
  if (!team) {
    return { valid: false, reason: "Team not found" };
  }

  // Check if squad is already full
  if (team.squad.length >= rules.maxSquadSize) {
    return { valid: false, reason: `Squad limit of ${rules.maxSquadSize} players reached!` };
  }

  // Check overseas quota
  if (player.isOverseas) {
    const currentOverseas = team.squad.filter(p => p.isOverseas).length;
    if (currentOverseas >= rules.maxOverseas) {
      return { valid: false, reason: `Overseas quota limit (${rules.maxOverseas}) reached!` };
    }
  }

  // Check if team has enough purse for this bid
  if (bidAmount > team.purse) {
    return { valid: false, reason: "Insufficient purse balance!" };
  }

  // Check minimum reserve budget:
  // Must have at least 20 Lakhs (2,000,000) for every remaining slot to reach minSquadSize
  const playersNeededForMin = Math.max(0, rules.minSquadSize - (team.squad.length + 1));
  const minReserveNeeded = playersNeededForMin * 2000000; // 20 Lakhs reserve per slot

  if ((team.purse - bidAmount) < minReserveNeeded) {
    return {
      valid: false,
      reason: `Must retain at least ₹${(minReserveNeeded / 10000000).toFixed(2)} Cr reserve to complete minimum squad size (${rules.minSquadSize} players)`
    };
  }

  return { valid: true };
}
