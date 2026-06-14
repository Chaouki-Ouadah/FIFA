import { useMemo } from 'react';
import { matchStatusLabel } from '../api';

function formatTime(utcDate) {
  return new Date(utcDate).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const STAGE_ORDER = [
  'GROUP_STAGE',
  'ROUND_OF_16',
  'QUARTER_FINALS',
  'SEMI_FINALS',
  'THIRD_PLACE',
  'FINAL',
];

const STAGE_LABELS = {
  GROUP_STAGE: null,
  ROUND_OF_16: 'Round of 16',
  QUARTER_FINALS: 'Quarter-Finals',
  SEMI_FINALS: 'Semi-Finals',
  THIRD_PLACE: 'Third Place',
  FINAL: 'Final',
};

export default function GroupsTab({ matches }) {
  const sections = useMemo(() => {
    const byGroup = {};
    const byStage = {};

    for (const m of matches) {
      if (m.stage === 'GROUP_STAGE') {
        const g = m.group ?? 'GROUP_?';
        if (!byGroup[g]) byGroup[g] = [];
        byGroup[g].push(m);
      } else {
        const s = m.stage ?? 'OTHER';
        if (!byStage[s]) byStage[s] = [];
        byStage[s].push(m);
      }
    }

    const groups = Object.entries(byGroup)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, ms]) => ({
        key,
        label: key.replace('GROUP_', 'Group '),
        matches: ms.sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate)),
      }));

    const knockouts = STAGE_ORDER.filter(s => s !== 'GROUP_STAGE' && byStage[s])
      .map(s => ({
        key: s,
        label: STAGE_LABELS[s] ?? s,
        matches: byStage[s].sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate)),
      }));

    return { groups, knockouts };
  }, [matches]);

  if (matches.length === 0) {
    return <div className="empty-state">Loading fixtures...</div>;
  }

  return (
    <div className="groups-grid">
      {sections.groups.map(g => (
        <div key={g.key} className="card">
          <div className="card-title">{g.label}</div>
          {g.matches.map(m => <MatchRow key={m.id} match={m} />)}
        </div>
      ))}
      {sections.knockouts.map(k => (
        <div key={k.key} className="card">
          <div className="card-title">{k.label}</div>
          {k.matches.map(m => <MatchRow key={m.id} match={m} />)}
        </div>
      ))}
    </div>
  );
}

function MatchRow({ match }) {
  const { homeTeam, awayTeam, score, status, utcDate } = match;
  const isLive = status === 'IN_PLAY' || status === 'PAUSED';
  const isFinished = status === 'FINISHED';
  const showScore = isLive || isFinished;

  const homeGoals = score?.fullTime?.home;
  const awayGoals = score?.fullTime?.away;
  const statusLabel = matchStatusLabel(status);

  return (
    <div className="match-row">
      <div className="team home">{homeTeam?.shortName ?? homeTeam?.name ?? '?'}</div>
      <div className="score-display">
        {showScore ? (
          <>
            <span>{homeGoals ?? 0}</span>
            <span className="score-sep">–</span>
            <span>{awayGoals ?? 0}</span>
          </>
        ) : (
          <span className="match-time">{formatTime(utcDate)}</span>
        )}
      </div>
      <div className="team away">{awayTeam?.shortName ?? awayTeam?.name ?? '?'}</div>
      <span className={`status-badge ${isLive ? 'live' : isFinished ? 'finished' : 'upcoming'}`}>
        {statusLabel}
      </span>
    </div>
  );
}
