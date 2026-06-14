import { useState, useEffect, useMemo } from 'react';
import { getAllPicksForMatches, getWcWinners } from '../firebase';
import { computeScores } from '../scoring';

export default function LeaderboardTab({ players, matches }) {
  const [allPicks, setAllPicks] = useState({});
  const [wcWinners, setWcWinners] = useState({});
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="empty-state">Calculating scores...</div>;
  if (players.length === 0) return <div className="empty-state">No players yet.</div>;

  return (
    <div>
      {sorted.length >= 2 && <Podium players={sorted} scores={scores} />}
      <div className="section-title">Rankings</div>
      <div className="rank-list">
        {sorted.map((p, i) => (
          <div key={p.id} className="rank-row">
            <span className="rank-num">#{i + 1}</span>
            <span className="rank-name">{p.name}</span>
            <span className="rank-pts">{scores[p.id] ?? 0} pts</span>
          </div>
        ))}
      </div>
      <ScoringGuide />
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
    { label: '1', height: '100px', bg: '#f59e0b' },
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
