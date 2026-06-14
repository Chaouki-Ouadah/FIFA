const API_KEY = import.meta.env.VITE_FOOTBALL_API_KEY;
const BASE = 'https://api.football-data.org/v4';
const COMPETITION_ID = 2000;

let _cache = null;
let _cacheTs = 0;

export async function fetchMatches() {
  const now = Date.now();
  const isLive = _cache?.some(m => m.status === 'IN_PLAY' || m.status === 'PAUSED');
  const ttl = isLive ? 60_000 : 300_000;

  if (_cache && now - _cacheTs < ttl) return _cache;

  const res = await fetch(`${BASE}/competitions/${COMPETITION_ID}/matches`, {
    headers: { 'X-Auth-Token': API_KEY },
  });

  if (!res.ok) throw new Error(`football-data.org ${res.status}`);

  const data = await res.json();
  _cache = data.matches ?? [];
  _cacheTs = now;
  return _cache;
}

export function isPickLocked(matchUtcDate) {
  return Date.now() >= new Date(matchUtcDate).getTime() - 60 * 60 * 1000;
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
