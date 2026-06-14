const CUTOFF_TS = new Date('2026-06-14T00:00:00Z').getTime();

export function scoreMatch(pick, match) {
  if (!pick || !match || match.status !== 'FINISHED') return 0;

  const home = match.score?.fullTime?.home;
  const away = match.score?.fullTime?.away;
  if (home === null || home === undefined || away === null || away === undefined) return 0;

  const actualWinner = home > away ? 'home' : home < away ? 'away' : 'draw';
  const pH = Number(pick.homeGoals ?? 0);
  const pA = Number(pick.awayGoals ?? 0);

  if (actualWinner === 'draw') {
    if (pick.winner !== 'draw') return 0;
    if (pH === home && pA === away) return 8;
    return 3;
  }

  if (pick.winner !== actualWinner) return 0;
  if (pH === home && pA === away) return 10;
  if (pH - pA === home - away) return 5;
  return 3;
}

export function computeScores(players, matches, allPicks, wcWinners = {}) {
  const scores = {};

  for (const match of matches) {
    if (match.status !== 'FINISHED') continue;
    if (new Date(match.utcDate).getTime() < CUTOFF_TS) continue;
    const matchPicks = allPicks[match.id] ?? {};
    for (const player of players) {
      const pts = scoreMatch(matchPicks[player.id], match);
      scores[player.id] = (scores[player.id] ?? 0) + pts;
    }
  }

  const final = matches.find(m => m.stage === 'FINAL' && m.status === 'FINISHED');
  if (final) {
    const fh = final.score.fullTime.home;
    const fa = final.score.fullTime.away;
    const wcWinner = fh > fa ? final.homeTeam.name : final.awayTeam.name;
    for (const player of players) {
      if (wcWinners[player.id]?.team === wcWinner) {
        scores[player.id] = (scores[player.id] ?? 0) + 10;
      }
    }
  }

  return scores;
}
