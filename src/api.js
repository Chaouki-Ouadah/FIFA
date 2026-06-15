let _cache = null;
let _cacheTs = 0;

export async function fetchMatches() {
  const now = Date.now();
  const isLive = _cache?.some(m => m.status === 'IN_PLAY' || m.status === 'PAUSED');
  const ttl = isLive ? 60_000 : 300_000;

  if (_cache && now - _cacheTs < ttl) return _cache;

  const res = await fetch('/api/matches');

  if (!res.ok) throw new Error(`API error ${res.status}`);

  const data = await res.json();
  if (data.error) throw new Error(data.error);

  _cache = data.matches ?? [];
  _cacheTs = now;
  return _cache;
}

export function isPickLocked(matchUtcDate) {
  return Date.now() >= new Date(matchUtcDate).getTime() - 10 * 60 * 1000;
}

export function isWcWinnerLocked() {
  return Date.now() >= new Date('2026-06-24T00:00:00Z').getTime();
}

export function matchStatusLabel(status) {
  const MAP = {
    TIMED: 'Upcoming',
    SCHEDULED: 'Upcoming',
    IN_PLAY: 'LIVE',
    PAUSED: 'HT',
    FINISHED: 'FT',
    POSTPONED: 'Postponed',
    SUSPENDED: 'Suspended',
    CANCELLED: 'Cancelled',
  };
  return MAP[status] ?? status;
}
