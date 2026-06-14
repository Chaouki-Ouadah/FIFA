# Knowledge Base — World Cup 2026 Soubella

## Hard Rules

1. `scoring.js` is pure — no Firebase, no API, no side effects
2. Never commit `.env` — use `.env.example` as template
3. Pick lock enforced client-side (1h before kickoff) — acceptable for hobby app
4. Admin panel (add/remove players) only visible when `activePlayer === 'Chaouki'`
5. `npm run build` must pass 0 errors before any deploy
6. football-data.org: competition code `WC`, ID `2000`, free tier 10 req/min
7. Leaderboard counts only matches with kickoff ≥ 2026-06-14
8. WC winner deadline: 2026-06-24

## Scoring (additive, totals shown)

| Scenario | Points |
|---|---|
| Correct winner | 3 |
| Correct winner + correct goal diff | 5 total |
| Exact score (non-draw) | 10 total |
| Correct draw | 3 |
| Exact draw score | 8 total |
| WC winner (one-time) | +10 |

## Architecture

- **No auth** — player identity trust-based, stored in localStorage key `wc_activePlayer`
- **Firestore paths**: `players/{id}`, `picks/{matchId}/playerPicks/{playerId}`, `wcWinner/{playerId}`
- **API polling**: 60s when live match in progress, 5min otherwise; module-level cache in `api.js`
- **State flow**: App owns `players` + `matches`; passes down; each tab manages its own Firestore fetches

## Deploy

- GitHub: `https://github.com/Chaouki-Ouadah/FIFA`
- Netlify auto-deploys on push to `main`
- Build: `npm run build` → publish dir `dist`
- Env vars set in Netlify dashboard (not in code)
