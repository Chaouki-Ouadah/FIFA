import { describe, it, expect } from 'vitest';
import { scoreMatch, computeScores } from './scoring.js';

const match = (home, away, extra = {}) => ({
  id: 1,
  status: 'FINISHED',
  utcDate: '2026-06-14T19:00:00Z',
  score: { fullTime: { home, away } },
  ...extra,
});

describe('scoreMatch', () => {
  it('returns 0 for null pick', () => {
    expect(scoreMatch(null, match(2, 1))).toBe(0);
  });

  it('returns 0 for unfinished match', () => {
    expect(scoreMatch({ winner: 'home', homeGoals: 1, awayGoals: 0 },
      { status: 'TIMED', score: { fullTime: { home: null, away: null } } }
    )).toBe(0);
  });

  it('returns 0 for wrong winner', () => {
    expect(scoreMatch({ winner: 'away', homeGoals: 0, awayGoals: 1 }, match(2, 1))).toBe(0);
  });

  it('returns 3 for correct winner only', () => {
    // 1-0 pick vs 3-1 result: winner correct, goal diff 1 ≠ 2 → +3
    expect(scoreMatch({ winner: 'home', homeGoals: 1, awayGoals: 0 }, match(3, 1))).toBe(3);
  });

  it('returns 5 for correct winner + goal diff', () => {
    expect(scoreMatch({ winner: 'home', homeGoals: 3, awayGoals: 2 }, match(2, 1))).toBe(5);
  });

  it('returns 10 for exact non-draw score', () => {
    expect(scoreMatch({ winner: 'home', homeGoals: 2, awayGoals: 1 }, match(2, 1))).toBe(10);
  });

  it('returns 3 for correct draw (wrong score)', () => {
    expect(scoreMatch({ winner: 'draw', homeGoals: 2, awayGoals: 2 }, match(1, 1))).toBe(3);
  });

  it('returns 8 for exact draw score', () => {
    expect(scoreMatch({ winner: 'draw', homeGoals: 1, awayGoals: 1 }, match(1, 1))).toBe(8);
  });

  it('returns 0 for wrong draw (predicted draw but match not draw)', () => {
    expect(scoreMatch({ winner: 'draw', homeGoals: 1, awayGoals: 1 }, match(2, 1))).toBe(0);
  });

  it('returns 0 for 0-0 draw picked on non-draw match', () => {
    expect(scoreMatch({ winner: 'home', homeGoals: 0, awayGoals: 0 }, match(1, 1))).toBe(0);
  });

  it('returns 10 for correct winner via penalties + exact fullTime score', () => {
    // Match ended 1-1, home won on pens. Picking home + 1-1 = correct winner + exact score = 10
    const penMatch = {
      ...match(1, 1),
      score: { fullTime: { home: 1, away: 1 }, winner: 'HOME_TEAM' },
    };
    expect(scoreMatch({ winner: 'home', homeGoals: 1, awayGoals: 1 }, penMatch)).toBe(10);
  });

  it('returns 3 for correct winner via penalties, wrong fullTime score', () => {
    // Match ended 1-1, home won on pens. Picking home + 2-1 = correct winner only = 3
    const penMatch = {
      ...match(1, 1),
      score: { fullTime: { home: 1, away: 1 }, winner: 'HOME_TEAM' },
    };
    expect(scoreMatch({ winner: 'home', homeGoals: 2, awayGoals: 1 }, penMatch)).toBe(3);
  });

  it('returns 0 for predicting draw when home won on penalties', () => {
    const penMatch = {
      ...match(1, 1),
      score: { fullTime: { home: 1, away: 1 }, winner: 'HOME_TEAM' },
    };
    expect(scoreMatch({ winner: 'draw', homeGoals: 1, awayGoals: 1 }, penMatch)).toBe(0);
  });
});

describe('computeScores', () => {
  const players = [
    { id: 'chaouki', name: 'Chaouki' },
    { id: 'oussama', name: 'Oussama' },
  ];

  it('returns empty object for no finished matches', () => {
    const m = { ...match(2, 1), status: 'TIMED' };
    const scores = computeScores(players, [m], {}, {});
    expect(scores.chaouki ?? 0).toBe(0);
  });

  it('scores all players correctly from allPicks', () => {
    const m = { ...match(3, 1), id: 99, group: 'GROUP_A' };
    const allPicks = {
      99: {
        chaouki: { winner: 'home', homeGoals: 3, awayGoals: 1 }, // exact → 10
        oussama: { winner: 'home', homeGoals: 1, awayGoals: 0 }, // winner only (diff 1≠2) → 3
      },
    };
    const scores = computeScores(players, [m], allPicks, {});
    expect(scores.chaouki).toBe(10);
    expect(scores.oussama).toBe(3);
  });

  it('accumulates scores across multiple matches', () => {
    const m1 = { ...match(1, 0), id: 1, group: 'GROUP_A' };
    const m2 = { ...match(1, 1), id: 2, group: 'GROUP_A' };
    const allPicks = {
      1: { chaouki: { winner: 'home', homeGoals: 1, awayGoals: 0 } }, // exact → 10
      2: { chaouki: { winner: 'draw', homeGoals: 1, awayGoals: 1 } }, // exact draw → 8
    };
    const scores = computeScores(players, [m1, m2], allPicks, {});
    expect(scores.chaouki).toBe(18);
  });

  it('skips matches before cutoff date', () => {
    const old = { ...match(2, 0), id: 10, utcDate: '2026-06-13T12:00:00Z', group: 'GROUP_A' };
    const allPicks = { 10: { chaouki: { winner: 'home', homeGoals: 2, awayGoals: 0 } } };
    const scores = computeScores(players, [old], allPicks, {});
    expect(scores.chaouki ?? 0).toBe(0);
  });
});
