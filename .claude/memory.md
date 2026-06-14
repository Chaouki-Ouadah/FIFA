# Session Memory

## Now
Building WC 2026 Soubella app. All source files written. Running build verification.

## State
- Vite scaffold: done
- Firebase + API deps: installed
- All src files: written (firebase.js, api.js, scoring.js, App.jsx, 3 tab components, index.css)
- CLAUDE.md: done
- .env.example: done
- GitHub repo Chaouki-Ouadah/FIFA: NOT YET — needs `gh auth login`
- Netlify: NOT YET — waiting on GitHub

## Blockers
1. `gh auth login` — run: `& "C:\Program Files\GitHub CLI\gh.exe" auth login --web --hostname github.com --git-protocol https`
2. Firebase project creds needed → create project → add to `.env`
3. football-data.org API key needed → add to `.env`

## Recent Decisions
- Firestore pick path: `picks/{matchId}/playerPicks/{playerId}` (subcollection)
- Pick scoring is totals not additive: 3 → 5 → 10 for non-draw, 3 → 8 for draw
- CUTOFF date 2026-06-14 hardcoded in scoring.js (pure function, no I/O)
- No App.css — all styles in index.css
