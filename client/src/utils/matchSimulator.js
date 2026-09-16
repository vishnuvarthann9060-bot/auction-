/**
 * IPL Tournament & T20 Match Simulator Engine
 * Realistic statistical simulation based on authentic player attributes and squad balance.
 */

import { TEAMS_DATA } from "../data/teams";

// Calculate tactical ratings for a franchise squad
export function evaluateTeamStrength(team) {
  const squad = team.squad || [];
  const meta = TEAMS_DATA[team.id] || {};

  // If squad has fewer than 11 players, populate balanced replacement players (75 OVR)
  const fullRoster = [...squad];
  const defaultRoles = ["Batter", "Batter", "Batter", "Wicketkeeper", "All-Rounder", "All-Rounder", "Bowler", "Bowler", "Bowler", "Bowler", "Batter"];
  let slot = 0;
  while (fullRoster.length < 11) {
    fullRoster.push({
      id: `rep-${team.id}-${slot}`,
      name: `Roster Player #${slot + 1}`,
      role: defaultRoles[slot % defaultRoles.length],
      rating: 74 + (slot % 4),
      isOverseas: false,
      stats: { matches: 15, runs: 280, sr: 130, wickets: 8, econ: 8.5 }
    });
    slot++;
  }

  // Sort and select best XI respecting maximum 4 overseas rule
  let overseasCount = 0;
  const sorted = [...fullRoster].sort((a, b) => (b.rating || 80) - (a.rating || 80));
  const playingXI = [];

  for (const player of sorted) {
    if (playingXI.length >= 11) break;
    if (player.isOverseas) {
      if (overseasCount < 4) {
        overseasCount++;
        playingXI.push(player);
      }
    } else {
      playingXI.push(player);
    }
  }

  // If still under 11, fill with any available domestic players
  for (const player of sorted) {
    if (playingXI.length >= 11) break;
    if (!playingXI.includes(player)) {
      playingXI.push(player);
    }
  }

  // Calculate Batting Strength (Top 6 ratings + SRs)
  const batters = playingXI.slice(0, 6);
  const avgBatRating = batters.reduce((acc, p) => acc + (p.rating || 82), 0) / batters.length;

  // Calculate Bowling Strength (5 bowlers)
  const bowlers = playingXI.slice(5, 11);
  const avgBowlRating = bowlers.reduce((acc, p) => acc + (p.rating || 82), 0) / bowlers.length;

  // Check critical balance: has genuine wicketkeeper
  const hasWk = playingXI.some(p => (p.role || "").toLowerCase().includes("keeper") || (p.role || "").toLowerCase().includes("wicket"));
  const balanceBonus = (hasWk ? 3 : -6) + (playingXI.filter(p => (p.role || "").includes("All")).length >= 2 ? 2 : 0);

  const battingStrength = Math.min(99, Math.max(65, Math.round(avgBatRating)));
  const bowlingStrength = Math.min(99, Math.max(65, Math.round(avgBowlRating)));
  const overallRating = Math.min(99, Math.max(65, Math.round((battingStrength * 0.48) + (bowlingStrength * 0.48) + balanceBonus)));

  return {
    teamId: team.id,
    teamName: team.name,
    shortName: team.shortName,
    logoEmoji: meta.logoEmoji || "🏏",
    color: team.color || meta.primaryColor || "#F59E0B",
    playingXI,
    battingStrength,
    bowlingStrength,
    hasWk,
    overallRating
  };
}

// Simulate a realistic 20-over T20 match between two teams
export function simulateT20Match(teamAData, teamBData, matchTitle = "IPL Match") {
  const teamAStrength = evaluateTeamStrength(teamAData);
  const teamBStrength = evaluateTeamStrength(teamBData);

  // Random variance factor (+- 8%) to allow upsets
  const varianceA = (Math.random() * 16) - 8;
  const varianceB = (Math.random() * 16) - 8;

  const effStrengthA = teamAStrength.overallRating + varianceA;
  const effStrengthB = teamBStrength.overallRating + varianceB;

  // Innings 1: Team A bats
  // Base par score between 155 and 205 based on batting vs opponent bowling
  const scoreDiffA = (teamAStrength.battingStrength - teamBStrength.bowlingStrength);
  const teamAScore = Math.max(125, Math.min(228, Math.round(168 + (scoreDiffA * 1.8) + (Math.random() * 24 - 12))));
  const teamAWickets = Math.min(9, Math.max(2, Math.round(5 + (Math.random() * 4) - (teamAStrength.battingStrength > 88 ? 1 : 0))));

  // Innings 2: Team B chases
  let teamBScore = 0;
  let teamBWickets = 0;
  let teamBOvers = "20.0";
  let winnerTeam = null;
  let loserTeam = null;
  let marginText = "";

  const bWinProb = 0.5 + ((effStrengthB - effStrengthA) * 0.025);
  const teamBWins = Math.random() < bWinProb;

  if (teamBWins) {
    teamBScore = teamAScore + Math.floor(Math.random() * 4) + 1;
    teamBWickets = Math.min(9, Math.max(2, Math.floor(Math.random() * 5) + 3));
    const ballsRemaining = Math.floor(Math.random() * 10) + 1;
    const overDecimal = ((120 - ballsRemaining) % 6);
    const overWhole = Math.floor((120 - ballsRemaining) / 6);
    teamBOvers = `${overWhole}.${overDecimal}`;
    winnerTeam = teamBStrength;
    loserTeam = teamAStrength;
    marginText = `${teamBStrength.shortName} won by ${10 - teamBWickets} wickets (${ballsRemaining} balls left)`;
  } else {
    teamBScore = teamAScore - Math.floor(Math.random() * 22) - 3;
    teamBWickets = Math.min(10, Math.max(4, Math.floor(Math.random() * 4) + 6));
    teamBOvers = "20.0";
    winnerTeam = teamAStrength;
    loserTeam = teamBStrength;
    const runDiff = teamAScore - teamBScore;
    marginText = `${teamAStrength.shortName} won by ${runDiff} runs`;
  }

  // Top performers
  const topBatterA = teamAStrength.playingXI[0] || { name: "Star Batter", role: "Batter" };
  const topBatterB = teamBStrength.playingXI[0] || { name: "Star Batter", role: "Batter" };
  const topBowlerA = teamAStrength.playingXI.find(p => (p.role || "").includes("Bowl")) || teamAStrength.playingXI[6];
  const topBowlerB = teamBStrength.playingXI.find(p => (p.role || "").includes("Bowl")) || teamBStrength.playingXI[6];

  const batterARuns = Math.round((teamAScore * 0.38) + (Math.random() * 15));
  const batterABalls = Math.round(batterARuns / (1.3 + Math.random() * 0.4));
  const batterBRuns = Math.round((teamBScore * 0.36) + (Math.random() * 15));
  const batterBBalls = Math.round(batterBRuns / (1.3 + Math.random() * 0.4));

  const motm = winnerTeam.teamId === teamAStrength.teamId ? topBatterA : topBatterB;

  return {
    matchTitle,
    winner: winnerTeam,
    loser: loserTeam,
    margin: marginText,
    motm: {
      name: motm.name,
      teamShortName: winnerTeam.shortName,
      performance: `${winnerTeam.teamId === teamAStrength.teamId ? batterARuns : batterBRuns} runs (${winnerTeam.teamId === teamAStrength.teamId ? batterABalls : batterBBalls}b)`
    },
    innings1: {
      teamId: teamAStrength.teamId,
      teamName: teamAStrength.teamName,
      shortName: teamAStrength.shortName,
      logoEmoji: teamAStrength.logoEmoji,
      color: teamAStrength.color,
      score: teamAScore,
      wickets: teamAWickets,
      overs: "20.0",
      topBatter: `${topBatterA.name} ${batterARuns} (${batterABalls})`,
      topBowler: `${topBowlerB?.name || 'Lead Pacer'} 3/28 (4 ov)`
    },
    innings2: {
      teamId: teamBStrength.teamId,
      teamName: teamBStrength.teamName,
      shortName: teamBStrength.shortName,
      logoEmoji: teamBStrength.logoEmoji,
      color: teamBStrength.color,
      score: teamBScore,
      wickets: teamBWickets,
      overs: teamBOvers,
      topBatter: `${topBatterB.name} ${batterBRuns} (${batterBBalls})`,
      topBowler: `${topBowlerA?.name || 'Lead Pacer'} 2/31 (4 ov)`
    }
  };
}

// Run complete official IPL Playoff simulation across all 10 franchises
export function runFullPlayoffs(teams) {
  if (!teams || teams.length === 0) return null;

  // 1. Evaluate and rank all franchises
  const evaluated = teams.map(t => evaluateTeamStrength(t));
  const rankings = [...evaluated].sort((a, b) => b.overallRating - a.overallRating);

  const seed1 = teams.find(t => t.id === rankings[0].teamId);
  const seed2 = teams.find(t => t.id === rankings[1].teamId);
  const seed3 = teams.find(t => t.id === rankings[2].teamId);
  const seed4 = teams.find(t => t.id === rankings[3].teamId);

  // 2. Qualifier 1: Rank 1 vs Rank 2 (Winner to Final, Loser to Q2)
  const q1 = simulateT20Match(seed1, seed2, "Qualifier 1");
  const q1WinnerTeam = teams.find(t => t.id === q1.winner.teamId);
  const q1LoserTeam = teams.find(t => t.id === q1.loser.teamId);

  // 3. Eliminator: Rank 3 vs Rank 4 (Winner to Q2, Loser out)
  const elim = simulateT20Match(seed3, seed4, "Eliminator");
  const elimWinnerTeam = teams.find(t => t.id === elim.winner.teamId);

  // 4. Qualifier 2: Loser Q1 vs Winner Eliminator (Winner to Final)
  const q2 = simulateT20Match(q1LoserTeam, elimWinnerTeam, "Qualifier 2");
  const q2WinnerTeam = teams.find(t => t.id === q2.winner.teamId);

  // 5. Grand Final: Winner Q1 vs Winner Q2
  const grandFinal = simulateT20Match(q1WinnerTeam, q2WinnerTeam, "Grand Final");
  const champion = grandFinal.winner;
  const runnerUp = grandFinal.loser;

  return {
    rankings,
    playoffs: {
      qualifier1: q1,
      eliminator: elim,
      qualifier2: q2,
      grandFinal
    },
    champion,
    runnerUp
  };
}
