import { useState, useEffect, useMemo } from 'react';

function formatCountdown(ms) {
  if (ms <= 0) return null;
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = n => String(n).padStart(2, '0');
  if (h > 0) return `${h}h ${pad(m)}m ${pad(s)}s`;
  if (m > 0) return `${pad(m)}m ${pad(s)}s`;
  return `${pad(s)}s`;
}

export default function NextMatchBanner({ matches, onGoToPicks, lang }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const nextMatch = useMemo(() => {
    return matches
      .filter(m => ['TIMED', 'SCHEDULED', 'IN_PLAY', 'PAUSED'].includes(m.status))
      .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate))[0] ?? null;
  }, [matches]);

  if (!nextMatch) return null;

  const isLive = nextMatch.status === 'IN_PLAY';
  const isHT   = nextMatch.status === 'PAUSED';
  const msUntil = new Date(nextMatch.utcDate).getTime() - now;
  const countdown = formatCountdown(msUntil);

  const home = nextMatch.homeTeam?.shortName ?? nextMatch.homeTeam?.name ?? '?';
  const away = nextMatch.awayTeam?.shortName ?? nextMatch.awayTeam?.name ?? '?';
  const isAr = lang === 'ar';

  return (
    <div
      className={`next-match-banner${isLive || isHT ? ' is-live' : ''}`}
      onClick={onGoToPicks}
      title={isAr ? 'اذهب إلى تنبؤاتي' : 'Go to My Picks'}
    >
      <div className="next-match-teams">
        <span className={`next-match-dot${isLive ? ' live' : ''}`} />
        {home} <span className="vs">vs</span> {away}
      </div>
      {(isLive || isHT) ? (
        <div className="next-match-live-text">{isHT ? 'HT' : '● LIVE'}</div>
      ) : countdown ? (
        <div className="next-match-countdown">{countdown}</div>
      ) : null}
      <div className="next-match-cta">
        {isAr ? 'ضع توقعك ←' : '▶ Place your bet'}
      </div>
    </div>
  );
}
