# World Cup 2026 Soubella — Claude Workspace

## Project

Match prediction app for 3 players: Chaouki, Oussama, Taleb.
Stack: React 18 + Vite · Firebase Firestore · football-data.org API · deploy via GitHub → Netlify auto-deploy.

## Key Constraints

- **No auth** — player identity is trust-based (name picker, stored in localStorage)
- **Pick lock** — 1 hour before kickoff, enforced client-side using user's browser timezone
- **WC winner deadline** — 2026-06-24
- **Leaderboard cutoff** — only matches with kickoff ≥ 2026-06-14 count
- **API rate limit** — football-data.org free tier: 10 req/min; cache responses, poll every 60s live / 5min otherwise

## Scoring Rules (stack additively)

| Outcome | Points |
|---|---|
| Correct winner (home/away) | +3 |
| Correct winner + correct goal diff | +5 total |
| Exact score (non-draw) | +10 total |
| Correct draw | +3 |
| Exact draw score | +8 total |
| WC winner correct | +10 (one-time) |

## File Map

```
src/
  main.jsx
  App.jsx               — tab state + active player state
  firebase.js           — Firestore init + CRUD helpers
  api.js                — football-data.org fetcher + polling
  scoring.js            — pure scoring function (no side effects)
  components/
    TabNav.jsx
    GroupsTab.jsx        — 12 group cards, fixtures, live scores
    LeaderboardTab.jsx   — scoring panel + podium + ranked list
    MyPicksTab.jsx       — player picker + match cards + WC winner + admin
  index.css             — dark theme CSS variables + global styles
```

## Firestore Schema

```
players/{playerId}          → { name: string }
picks/{matchId}/{playerId}  → { winner: 'home'|'draw'|'away', homeGoals: number, awayGoals: number, savedAt: timestamp }
wcWinner/{playerId}         → { team: string, savedAt: timestamp }
```

## Deploy

GitHub repo: https://github.com/Chaouki-Ouadah/FIFA
Netlify auto-deploys on push to `main`. Build command: `npm run build`. Publish dir: `dist`.

## Hard Rules

1. `scoring.js` must be a pure function — no Firebase imports, no API calls
2. Never expose Firebase credentials in committed code — use `.env` (gitignored)
3. Lock enforcement is client-side only — acceptable for a hobby app
4. Admin panel (add/remove players) accessible only when active player is "Chaouki"
5. `npm run build` must pass with 0 errors before any deploy
6. football-data.org competition code = `WC`, ID = `2000`
