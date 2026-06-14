const CUTOFF_TS = new Date('2026-06-14T00:00:00Z').getTime();

function resolveWinner(match) {
  // Use API's score.winner when present — covers penalty shootout results.
  // Falls back to fullTime goal comparison for matches without it.
  const api = match.score?.winner;
  if (api === 'HOME_TEAM') return 'home';
  if (api === 'AWAY_TEAM') return 'away';
  if (api === 'DRAW') return 'draw';
  const h = match.score?.fullTime?.home;
  const a = match.score?.fullTime?.away;
  if (h == null || a == null) return null;
  return h > a ? 'home' : h < a ? 'away' : 'draw';
}

export function scoreMatch(pick, match) {
  if (!pick || !match || match.status !== 'FINISHED') return 0;

  const home = match.score?.fullTime?.home;
  const away = match.score?.fullTime?.away;
  if (home == null || away == null) return 0;

  const actualWinner = resolveWinner(match);
  if (!actualWinner) return 0;

  const pH = Number(pick.homeGoals ?? 0);
  const pA = Number(pick.awayGoals ?? 0);

  if (actualWinner === 'draw') {
    if (pick.winner !== 'draw') return 0;
    if (pH === home && pA === away) return 8;
    return 3;
  }

  if (pick.winner !== actualWinner) return 0;
  // Exact score: based on 90-min fullTime goals
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
    const finalWinner = resolveWinner(final);
    const wcWinner = finalWinner === 'home'
      ? final.homeTeam?.name
      : finalWinner === 'away'
      ? final.awayTeam?.name
      : null;
    if (wcWinner) {
      for (const player of players) {
        if (wcWinners[player.id]?.team === wcWinner) {
          scores[player.id] = (scores[player.id] ?? 0) + 10;
        }
      }
    }
  }

  return scores;
}
