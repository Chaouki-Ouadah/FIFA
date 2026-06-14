import { useState, useEffect, useMemo } from 'react';
import { getAllPicksForMatches, getWcWinners } from '../firebase';
import { computeScores, scoreMatch } from '../scoring';

const CUTOFF_TS = new Date('2026-06-14T00:00:00Z').getTime();

export default function LeaderboardTab({ players, matches }) {
  const [allPicks, setAllPicks] = useState({});
  const [wcWinners, setWcWinners] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (players.length === 0) { setLoading(false); return; }

    const finishedIds = matches
      .filter(m => m.status === 'FINISHED')
      .map(m => m.id);

    Promise.all([
      getAllPicksForMatches(finishedIds),
      getWcWinners(),
    ]).then(([picks, winners]) => {
      setAllPicks(picks);
      setWcWinners(winners);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [matches, players]);

  const scores = useMemo(
    () => computeScores(players, matches, allPicks, wcWinners),
    [players, matches, allPicks, wcWinners]
  );

  const sorted = useMemo(
    () => [...players].sort((a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0)),
    [players, scores]
  );

  const finishedMatches = useMemo(
    () => matches
      .filter(m => m.status === 'FINISHED' && new Date(m.utcDate).getTime() >= CUTOFF_TS)
      .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate)),
    [matches]
  );

  if (loading) return <div className="empty-state">Calculating scores...</div>;
  if (players.length === 0) return <div className="empty-state">No players yet.</div>;

  return (
    <div>
      {sorted.length >= 2 && <Podium players={sorted} scores={scores} />}
      <div className="section-title">Rankings</div>
      <div className="rank-list">
        {sorted.map((p, i) => (
          <div key={p.id} style={{ marginBottom: 6 }}>
            <div
              className={`rank-row rank-${i + 1}${expandedId === p.id ? ' expanded' : ''}`}
              onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
            >
              <span className="rank-num">#{i + 1}</span>
              <span className="rank-name">{p.name}</span>
              <span style={{ flex: 1 }} />
              <span className="rank-pts">{scores[p.id] ?? 0} pts</span>
              <span className="rank-chevron">{expandedId === p.id ? '▲' : '▼'}</span>
            </div>

            {expandedId === p.id && (
              <PlayerBreakdown
                player={p}
                matches={finishedMatches}
                allPicks={allPicks}
                wcWinners={wcWinners}
              />
            )}
          </div>
        ))}
      </div>
      <ScoringGuide />
    </div>
  );
}

function PlayerBreakdown({ player, matches, allPicks, wcWinners }) {
  if (matches.length === 0) {
    return (
      <div className="breakdown-panel">
        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No finished matches yet.</span>
      </div>
    );
  }

  return (
    <div className="breakdown-panel">
      <table className="breakdown-table">
        <thead>
          <tr>
            <th>Match</th>
            <th>Predicted</th>
            <th>Actual</th>
            <th>Pts</th>
          </tr>
        </thead>
        <tbody>
          {matches.map(m => {
            const pick = allPicks[m.id]?.[player.id];
            const pts = scoreMatch(pick, m);
            const home = m.homeTeam?.shortName ?? m.homeTeam?.name ?? '?';
            const away = m.awayTeam?.shortName ?? m.awayTeam?.name ?? '?';
            const ah = m.score?.fullTime?.home;
            const aa = m.score?.fullTime?.away;

            const predictedLabel = pick
              ? `${pick.homeGoals ?? '?'} – ${pick.awayGoals ?? '?'} (${pick.winner === 'home' ? home : pick.winner === 'away' ? away : 'Draw'})`
              : '—';

            return (
              <tr key={m.id} className={pts > 0 ? 'breakdown-scored' : ''}>
                <td className="breakdown-match">{home} vs {away}</td>
                <td className="breakdown-pred">{predictedLabel}</td>
                <td className="breakdown-actual">{ah} – {aa}</td>
                <td className="breakdown-pts">
                  {pts > 0
                    ? <span className="pts-badge">{`+${pts}`}</span>
                    : <span style={{ color: 'var(--text-muted)' }}>{pick ? '0' : '—'}</span>
                  }
                </td>
              </tr>
            );
          })}
          {wcWinners[player.id] && (
            <tr className="breakdown-wc-row">
              <td colSpan={2} style={{ color: 'var(--accent-gold)', fontFamily: 'var(--font-heading)', fontSize: '0.78rem', paddingTop: 8 }}>
                WC Winner: {wcWinners[player.id].team}
              </td>
              <td />
              <td className="breakdown-pts">
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>TBD</span>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Podium({ players, scores }) {
  const top = players.slice(0, Math.min(3, players.length));
  const display = top.length >= 3
    ? [top[1], top[0], top[2]]
    : top.length === 2
    ? [top[1], top[0]]
    : [top[0]];

  const META = [
    { label: '2', height: '72px', bg: '#94a3b8' },
    { label: '1', height: '100px', bg: 'var(--accent-gold)' },
    { label: '3', height: '52px', bg: '#b45309' },
  ];

  return (
    <div className="podium">
      {display.map((p, i) => (
        <div key={p.id} className="podium-place">
          <div className="podium-name">{p.name}</div>
          <div className="podium-pts">{scores[p.id] ?? 0} pts</div>
          <div
            className="podium-bar"
            style={{ height: META[i].height, background: META[i].bg }}
          >
            {META[i].label}
          </div>
        </div>
      ))}
    </div>
  );
}

function ScoringGuide() {
  return (
    <div className="card" style={{ marginTop: 24 }}>
      <div className="card-title">Scoring Rules</div>
      <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
        <tbody>
          {[
            ['Correct winner', '+3'],
            ['Correct winner + goal diff', '+5 total'],
            ['Exact score', '+10 total'],
            ['Correct draw', '+3'],
            ['Exact draw score', '+8 total'],
            ['WC winner (one-time)', '+10'],
          ].map(([rule, pts]) => (
            <tr key={rule} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '7px 0', color: 'var(--text-muted)' }}>{rule}</td>
              <td style={{ padding: '7px 0', textAlign: 'right', color: 'var(--accent)', fontWeight: 700 }}>{pts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
