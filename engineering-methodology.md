# Engineering Methodology — Portable Edition

A playbook distilled from the DevOSX work. Carry it into any new repo, software project, or AI project. Stack-agnostic; the patterns travel even when the framework, language, or DB does not.

Use this file in three ways:

1. **Initial workspace setup** — what to install, configure, and load before you write the first line of code.
2. **Per-task discipline** — the 11-phase flow that takes a ticket from spec to merged PR with a paper trail.
3. **Standing rules** — the anti-patterns, naming conventions, and quality gates that run in your head while coding.

---

## 1. Establish the workplace (one-time per repo)

The five things to check before any feature work.

### 1.1 Read the project's own contract

In this order:

1. `CLAUDE.md` / `AGENTS.md` / `GEMINI.md` at repo root — your AI assistant's standing instructions.
2. `CONTRIBUTING.md` and `README.md` — human conventions.
3. Any `docs/`, `docs/specs/`, `docs/architecture/` index.
4. The persistent memory directory (`~/.claude/projects/<project-slug>/memory/`) if one exists.

If any of these are missing, **create them**. A repo with no standing rules drifts.

### 1.2 Confirm the technical stack

Map these explicitly before touching code:

- Language + framework + package manager
- Base branch (`main` / `staging` / `develop` / `trunk`)
- Lint command, type-check command, test runner, integration-test command
- DB / ORM (if any) and how migrations work
- GitHub repo `<owner>/<name>` and whether PRs target `main` or a staging branch
- Deploy: where, gated by what

### 1.3 Install the tooling

Cross-platform basics:

- `gh` CLI (GitHub) — `winget install GitHub.cli` on Windows; auth via `gh auth login --web` (persists in keyring; never has to be re-authed unless token expires).
- A solid editor with AI integration.
- Your AI assistant's CLI / extension.

### 1.4 Install the portable skill set

User-scoped skills (reusable across all repos). Drop these into your AI assistant's skills directory:

- `card` — 11-phase ticket execution (see §3; the methodology lives in the skill file you're holding)
- `superpowers:brainstorming` — pre-feature design
- `superpowers:writing-plans` — plan file before code
- `superpowers:executing-plans` — solo plan execution
- `superpowers:subagent-driven-development` — plan via subagents
- `superpowers:dispatching-parallel-agents` — fan out independent tasks
- `superpowers:test-driven-development` — TDD discipline
- `superpowers:systematic-debugging` — root-cause flow
- `superpowers:verification-before-completion` — evidence before "done"
- `superpowers:requesting-code-review` — pre-merge review
- `superpowers:receiving-code-review` — rigorous response to feedback
- `superpowers:finishing-a-development-branch` — merge/PR/cleanup
- `superpowers:using-git-worktrees` — isolated workspaces
- `superpowers:writing-skills` — author new skills
- `caveman` family — compressed-mode communication (saves ~75% tokens in chat without losing technical accuracy)
- `cavecrew` — delegate to compressed sub-agents (further main-context savings)
- `verify` — run app + observe behavior to confirm a fix
- `run` — launch project locally
- `simplify` — review changed code for reuse, quality, efficiency
- `fewer-permission-prompts` — reduce permission churn
- `loop` — recurring task / poll
- `schedule` — cron'd remote agent
- `claude-api` — Anthropic SDK projects only
- `ui-ux-pro-max` — UI/UX-heavy projects only

### 1.5 Establish memory

The AI memory system is per-project. Types of memory worth saving:

- **user** — your role, expertise, preferences (collaborate differently with a senior backend dev vs. a frontend novice).
- **feedback** — corrections AND confirmations the user has given you. Save the rule + the **why** + the **how-to-apply**.
- **project** — current initiatives, deadlines, stakeholders. Convert relative dates to absolute (`Thursday → 2026-03-05`).
- **reference** — pointers to external systems (Linear project, Grafana board, runbook URL).

Don't save: code conventions (derivable from the code), git history, debugging recipes (the commit message has it), ephemeral task state.

### 1.6 Kickoff prompt for a new workspace

Paste this in the first message of any new AI-assisted session in any repo:

```
I'm starting work in this repo. Before we touch code:

1. Read CLAUDE.md / AGENTS.md / GEMINI.md if present, plus auto-memory
   at the memory directory, plus any docs/conventions.md style files.
   Confirm what you found.
2. Map the project basics: language + framework + package manager,
   base branch (main / staging / develop / trunk), test runner +
   lint command + typecheck command, DB / ORM if any, PR target
   (GitHub repo <owner>/<name>).
3. Confirm available skills. I expect to use this set — invoke them
   via the Skill tool when they apply:
   - superpowers:brainstorming
   - superpowers:writing-plans
   - superpowers:executing-plans
   - superpowers:subagent-driven-development
   - superpowers:dispatching-parallel-agents
   - superpowers:test-driven-development
   - superpowers:systematic-debugging
   - superpowers:verification-before-completion
   - superpowers:requesting-code-review
   - superpowers:receiving-code-review
   - superpowers:finishing-a-development-branch
   - superpowers:using-git-worktrees
   - superpowers:writing-skills
   - caveman (compressed mode) + caveman-commit + caveman-review
   - cavecrew (delegate to compressed subagents)
   - verify (run app, observe behavior)
   - run (launch project locally)
   - card (the 11-phase ticket execution skill; trigger with /card)

4. When I paste a ticket / card / issue spec, treat it as a /card
   invocation: enter plan mode, re-grep cited lines, write a plan
   file, get my approval, then execute the 11 phases. Use
   `gh pr create --base <base-branch>` with a HEREDOC body. Do NOT
   default to base=main without confirming.

5. Default to caveman full mode for chat. Code, commits, PR bodies,
   security warnings: write normal.

6. Use git worktrees when working on isolated feature branches in
   parallel.

Confirm 1–6 by listing what you found and which skills are
available, then wait for me to paste the first card.
```

Drop the `claude-api` and `ui-ux-pro-max` lines if not relevant to the project.

---

## 2. Hard rules (apply on every card)

These rules are non-negotiable. Tune them to the project's branch model and team norms, but pick something in each category before you start.

| Rule | Why |
|---|---|
| **Fresh branch per task** — every new ticket cuts a branch from the current base | Avoids "this branch already has unrelated stuff" PRs |
| **Pull from the base branch only** — never `git pull main` if your team's PR target is `staging` | Main is updated only via staging → main promotion |
| **Pull base into branch before opening PR** — even tiny PRs | Surfaces merge conflicts before review, not during |
| **Run CI locally before push** — typecheck + lint + unit + integration must be green | "It works on my machine" should mean "it works in CI" |
| **Delete merged branch immediately (local + remote)** | A clean `git branch -a` is one less thing to scan |
| **DB owner approves destructive migrations before they apply** | Surface SQL diff + row count + rollback plan; don't `drizzle-kit push` on a shared DB |

---

## 3. The 11-phase card execution flow

The core methodology. Use whenever a discrete, defined unit of work lands ("card", "ticket", "issue", "story" — same shape).

### Phase 0 — pre-flight (always)

```bash
git status -sb
git checkout <base-branch>
git fetch origin
git pull origin <base-branch> --ff-only
# install if lockfile changed in the pull
# apply any new pending migrations (surface destructive ones to user FIRST)
git checkout -b <type>/<short-name> origin/<base-branch>
```

`<type>` ∈ `feature` | `fix` | `chore` | `refactor` | `test`. Match the team's naming.

### Plan-first (mandatory)

1. Enter plan mode (no edits, read-only exploration).
2. **Re-grep every line number cited in the ticket.** Line numbers drift. Don't trust them.
3. Read each cited file. Note where reality diverges from the ticket.
4. Classify scope: UI-only / API+UI / schema+migration / cross-spec.
5. Identify the ticket's "out of scope" section — respect it.
6. Use a structured Ask-User-Question tool for ambiguity. Don't proceed on assumptions.
7. Write a plan file with: **Context, State map (current vs claimed), Resolved tensions, Phase plan, Files to modify, Out of scope (verbatim), Verification matrix (AC → check), Risks + rollback, Commit message draft**.
8. Exit plan mode only after the user approves the plan.

### Plain-language brief (mandatory, AFTER plan approval, BEFORE Phase 1)

Post a 6–12 sentence summary in chat aimed at a **junior software engineer / non-technical reader**:

> **Problem.** What's broken / missing / risky, and why it matters in user-impact terms.
>
> **Fix.** The high-level approach in plain English. One sentence on the trade-off if relevant.
>
> **Why it teaches you** *(optional)*: The general pattern a junior dev should remember.

No code, no file paths, no jargon without a one-line gloss.

Skip on truly trivial cards (typo / single-line rename). Default to writing it.

### Phase 1 — schema + migration (skip if N/A)

Off-journal pattern (works on any ORM with a migrations folder):

1. Edit the schema source file.
2. Extend any enum in place.
3. Hand-write the migration SQL (next free slot — never auto-generate if the journal has drift).
4. Write an apply script with pre/post state assertions, wrapped in a transaction.
5. **Surface destructive migrations BEFORE applying.** Show: SQL diff, row count affected, rollback plan.
6. Apply only after the user OKs.

**Quality gate — enum coverage audit:** when extending an enum, grep every map referencing the same enum across the codebase (color/badge maps, status switch statements, stage-order arrays, group/filter helpers). Each map must cover all values or have an explicit "Other" bucket.

**Quality gate — migration journal note:** off-journal migrations must be documented (in `drizzle/README.md` or PR body) so the next dev on a fresh DB knows what to apply.

### Phase 2 — backend (validator + API)

1. Update validation schemas (Zod / Pydantic / etc.) for new fields.
2. Edit/add route handlers. Reuse the project's auth helpers.
3. Standard status codes:
   - **401** — no auth
   - **403** — auth but no permission
   - **400** — invalid input (Zod / Pydantic issues array)
   - **404** — resource not found
   - **409** — conflict (uniqueness violation, idempotency miss)
   - **200 / 201** — success
   - **429** — rate limited (with `Retry-After`)
   - **500** — server error (avoid these; always reach for 4xx when input is the cause)
   - **503** — known misconfig (missing required env var) **at boundary, not in handlers**

**Quality gate — field-in-API:** if a UI feature filters / displays a column, verify the API endpoint actually returns that column **BEFORE writing the UI filter or any client test that mocks the field**.

**Quality gate — scope tagging:** if a feature is scoped to a parent entity (panel / card / agent / finding), tag every persisted artifact with that parent's id. Filter queries by that id, not just a looser scope.

### Phase 3 — frontend (UI)

1. Reuse existing primitives. Don't reinvent buttons / dialogs / form controls.
2. Match the project's component library conventions (e.g. shadcn v4 uses `render` prop, NOT `asChild`).
3. Respect framework router contracts (e.g. Next.js 16 route params are `Promise` — `await params`).

**Quality gate — session-dependent UI:** any session-derived value used as filter input must gate its UI control until session loads.

**Quality gate — readOnly destructive actions:** if a component receives `readOnly`, wrap every destructive sub-element (delete / vote / mutate / approve) in `!readOnly`. Grep `readOnly` to find all entry points.

**Quality gate — composite loading-state keys:** state for "loading row X" needs a globally unique key. Index-based collides across parent containers. Use `${parentId}:${childId}` composite.

### Phase 4 — additional integrations (skip if N/A)

Notifications, events, inbox triggers, fan-out. Use the project's existing alert / event helpers; do not roll new ones.

Status grouping helpers MUST cover all enum values or have an "Other" bucket.

### Phase 5 — unit tests

#### Route test ladder per endpoint

- 401 not authenticated
- 403 not member / not in scope
- 403 RBAC failure (if applicable)
- 400 validation errors (one per Zod constraint)
- 404 not found
- 409 conflict (if idempotency)
- 200 / 201 happy path
- 429 rate limited (if applicable)

#### Quality gate — extracted logic over component tests

Components >150 lines with filter / group / sort logic — extract to a pure library file and unit-test the function. The component just wires state to the helper.

#### Quality gate — don't mock fields the API doesn't return

Always verify the live API returns the field FIRST (route test or `curl`). A test stub returning `{ createdById: "x" }` passes while production breaks if the live API doesn't include that key.

### Phase 6 — end-to-end (E2E)

At least **one live (non-skipped) scenario** per feature. Skip-marked-only tests aren't coverage.

Use page-level network stubs (e.g. Playwright `page.route()`) for everything except the slice that genuinely needs real AI / DB seed / external service. If everything ends up skipped, the scope was wrong OR you didn't try the stubs.

### Phase 7 — local CI gate

All four must pass before push:

```bash
<typecheck>          # tsc / mypy / etc.
<lint>               # 0 errors; warnings allowed per project policy
<unit tests>
<other test suites>  # extensions, packages, integration
```

If new errors introduced (vs. pre-existing rot), fix before push.

### Phase 8 — commits + push + PR

#### Commit grouping

Split by concern. Typical full-feature layout:

1. `feat(db): schema + enum extensions (migration NNNN)` — schema only
2. `feat(<feature>): backend` — validators + API
3. `feat(<feature>): integration` — notifications / events
4. `feat(ui): component` — frontend
5. `test(<feature>): unit + E2E`

For test-only PRs: one commit. For UI-only fixes: one or two commits is enough.

#### Commit message format

- Conventional Commits: `<type>(<scope>): <subject>` ≤72 chars
- Body: bullets describing the WHY + non-obvious WHAT
- Footer: `Card: <card name>` or `Closes #<issue>` + co-author line if using AI assistance

#### Push + PR — prefer `gh` CLI

Auth persists in OS keyring; skip the browser banner entirely.

```bash
gh auth status
# if not authed:
gh auth login --web --hostname github.com --git-protocol https
```

Create the PR with title + body via HEREDOC. **Always pass `--base <base-branch> --head <branch> --repo <owner/repo>` explicitly** so the base is not the upstream default (most repos default to `main`):

```bash
gh pr create \
  --base <base-branch> \
  --head <branch> \
  --repo <owner/repo> \
  --title "<conventional-commit subject>" \
  --body "$(cat <<'EOF'
## Card / Issue
<card title or issue link>

## Summary
- <bullet>

## Tests
- <typecheck status>
- <lint status>
- <unit status>
- <e2e / other>

## Acceptance criteria
- [x] AC 1
- [x] AC 2

## Out of scope (intentional)
- <thing>

## Rollback
<plan>
EOF
)"
```

**NEVER use GitHub's "Compare & pull request" banner** — it defaults to the upstream default branch (usually `main`). If your project's PR target is `staging` / `develop` / `trunk`, you'll spend the next 15 minutes fixing the base.

#### Fallback if `gh` unavailable

Base-anchored URL:

```
https://github.com/<owner>/<repo>/compare/<base-branch>...<branch>?expand=1
```

Confirm `base` in the page header before clicking Create.

#### Post-PR — card metadata block (in chat)

After the PR opens, post a fenced code block so the user can paste values into the team's task tracker:

```
Branch: <branch-name>
PR URL: <pr-url>
Spec Link: <spec-link-or-"n/a">
```

Never fabricate a Spec Link — write `n/a` if none.

#### Post-PR — one-line recap (in chat)

Right after the metadata block, one or two sentences max:

> **Shipped:** <1–2 sentences — what the PR actually does, in plain English>

Drop this into a Slack channel, daily update, or release notes.

### Phase 9 — manual verify

Walk the AC's manual-verification line items on a local instance. The user does this; the AI waits and diagnoses any failures.

### Phase 10 — post-merge cleanup

```bash
git checkout <base-branch>
git pull origin <base-branch> --ff-only
git branch -d <branch>
git push origin --delete <branch>
```

Confirm `git branch -a` no longer shows the deleted branch.

### Phase 11 — close the loop

- Update a daily / work log with what shipped.
- If new patterns / anti-patterns emerged, edit the methodology (this file) or the project's `card` skill.
- If a recurring rule emerged, write it to memory.

---

## 4. Anti-patterns (and the patterns that replace them)

These are the lessons that keep coming back across cards. Read this list before every PR.

1. **Wrong-mock tests.** Mock matches the test, not the API contract → production broken, tests green. Always verify the live API returns the field BEFORE writing client-side filter logic.
2. **Cross-scope data bleed.** Scoped feature pulling broader data. Tag scope from day one.
3. **Skeleton-only E2E.** All scenarios skipped = no coverage. Use route stubs.
4. **Non-unique loading keys.** Index-based loading state collides across parents. Use composite keys.
5. **Partial enum coverage.** New value missing from a color / group / order map. Grep before considering enum work done.
6. **Incomplete status grouping.** Helper covering 6 of N statuses = items disappear. Mirror full set or add "Other" bucket.
7. **Unguarded session UI.** Filter fires with `undefined` user. Disable the control until session loaded.
8. **`readOnly` ignored.** Destructive children render despite the prop.
9. **Off-journal migration without doc.** Next dev on fresh DB has no idea. Document.
10. **Untestable big components.** 190-line component with inline logic = no edge-case unit tests. Extract to lib + pure-function tests first.
11. **Unnormalized enum strings.** Callsite assumes case X, DB returns case Y. Normalize at one boundary, never at callsites.
12. **Test the family, not just the fixed file.** When you fix a bug in one route, write the same regression test on **every sibling route sharing the helper**. Bugs in helper-shared families trivially reappear in the route that wasn't covered yet.
13. **Pick happy-path inputs that hit known short-circuits.** When the route's happy path requires a heavy stack (DB / external API / queue), find an input that exits the handler early via a code path that needs no mocks. Saves mocking dozens of dynamic imports for what is really just "valid signature → 200" coverage.
14. **Assert sensitive fields don't leak in the response shape.** Any route returning rows from a table with secret-bearing columns (`passwordHash`, `apiKey`, `refreshToken`, `encryptedSecret`, `webhookSecret`, etc.) — the happy-path test MUST explicitly assert each sensitive field is **absent** from the response body. A future refactor switching to `db.select().from(table)` (full row) silently leaks every secret.

### Pre-existing anti-patterns (still apply)

- Don't trust documented line numbers — re-grep.
- Don't auto-generate migrations if journal drift exists — hand-write SQL.
- Don't include unrelated dirty files (Task Board.md, snapshot artifacts) in feature commits. Use selective `git add`.
- Don't click "Compare & pull request" — defaults to main.
- Don't be cute with helper types around ORM `findMany` — type inference traps. Duplicate the option block.
- Don't skip hooks (`--no-verify` / `--no-gpg-sign`) unless the user explicitly asks. Fix the hook failure, don't bypass it.

---

## 5. The quality-gate checklist

Run through this before declaring a phase done:

| # | Gate | Trigger |
|---|---|---|
| 1 | Field-in-API verified + route test added | UI filter on a column |
| 2 | Scope tagged on persisted artifacts | Scope-scoped feature |
| 3 | ≥1 live E2E scenario | Phase 6 exit |
| 4 | Composite loading-state keys | Lists with mutation buttons |
| 5 | Enum coverage audit (grep + update all maps) | Enum extension |
| 6 | Status helper covers all values or has "Other" bucket | Status map touched |
| 7 | Session-derived UI gated | Client component using session |
| 8 | `!readOnly` wrap on destructive children | Component receives `readOnly` |
| 9 | Off-journal migration documented | One-off apply script |
| 10 | Logic extracted to lib + pure tests | Component >150 lines |
| 11 | Enum strings normalized at boundary | String filter on enum |
| 12 | All CI gates green | Phase 7 exit |
| 13 | PR base confirmed | Phase 8 exit |
| 14 | Sensitive fields explicitly NOT in response | Routes returning rows with secrets |
| 15 | Manual verify per AC | Phase 9 exit |
| 16 | Local + remote branch deleted | Post-merge |

---

## 6. Compressed communication mode (caveman)

For chat / progress updates (not code, not commits, not PR bodies):

- Drop articles (a / an / the)
- Drop filler (just / really / basically / actually / simply)
- Drop pleasantries (sure / certainly / happy to)
- Drop hedging
- Fragments OK
- Short synonyms (big not extensive, fix not "implement a solution for")
- Technical terms exact
- Code blocks unchanged
- Errors quoted exact

Pattern: `[thing] [action] [reason]. [next step].`

**Not:** "Sure! I'd be happy to help you with that. The issue you're experiencing is likely caused by..."
**Yes:** "Bug in auth middleware. Token expiry check uses `<` not `<=`. Fix:"

**Auto-drop caveman for:** security warnings, irreversible action confirmations, multi-step sequences where fragment order risks misread, user asks to clarify or repeats question.

**Resume caveman** after the clear part is done.

Saves ~75% chat tokens with zero loss of technical accuracy. Equivalent: any explicit "be terse" mode your AI assistant supports.

---

## 7. Tooling stack

### Required

- **Git** with conventional commits.
- **GitHub CLI (`gh`)** — `gh pr create --base <base>` is the only PR-creation path. Browser banners default wrong.
- **Project's stack** — Node + npm / Bun / pnpm / Python + uv / Rust + cargo / etc.

### Strongly recommended

- **A type-checker** with no warning tolerance for your slice (warnings allowed if pre-existing).
- **A linter** with auto-fix.
- **A test runner with watch mode** (Vitest, Jest, pytest, cargo test).
- **A pre-commit hook framework** (husky / lefthook / pre-commit) running typecheck + lint + relevant tests on staged files.
- **Worktrees** for parallel feature work — `git worktree add ../<repo>-<branch> <branch>` so concurrent branches don't fight each other in the same checkout.

### Skill-level tools (AI assistant)

- A way to enter / exit a "plan mode" (don't write until approved).
- Structured `AskUserQuestion` for design choices, not free-text.
- Persistent memory keyed by project.
- Skills for subagent dispatch (parallel research, parallel code review).

---

## 8. The plan file pattern

Every non-trivial card produces a plan file at a stable location (e.g. `~/.<assistant>/plans/<short-name>.md`). The plan is:

- A contract between you and the AI before code touches disk.
- The reference the AI re-reads when implementing.
- The artifact you can review later to understand "why did we ship it this way".

Required sections:

- **Context** — Why this card. The user-facing problem.
- **State map** — Card's cited line numbers / claims vs. what the code actually shows.
- **Approach** — Recommended path, not all alternatives.
- **Files to modify** — Full paths, one pattern description if it repeats.
- **Out of scope** — Verbatim from the card if it had a section. Add your own deferrals.
- **Verification matrix** — Each AC mapped to how it's proven (test name / manual step / grep / etc.).
- **Risks + rollback** — At least one of each. "Revert this commit" is a valid rollback.
- **Phase plan** — Map of which of the 11 phases apply, with skip-and-why for the rest.
- **Commit message draft** — The exact commit body the implementation will use.

Approval gates: the user reads the plan, edits inline if needed, then explicitly OKs. Don't implement on tacit approval.

---

## 9. Memory system

Use a per-project persistent memory store. Save:

| Type | When | Body structure |
|---|---|---|
| `user` | Learning a user's role / expertise / preferences | Free-form, kept short |
| `feedback` | User corrects or confirms an approach | Rule + **Why** (the past incident) + **How to apply** (when/where this kicks in) |
| `project` | Initiatives, deadlines, who owns what | Absolute dates only ("Thursday" → "2026-03-05"); decay-prone, refresh often |
| `reference` | External system pointers (Linear, Grafana, Notion) | URL + purpose |

Don't save: code conventions (derivable), git history, debugging recipes (commit message has it), ephemeral task state.

Each memory entry is a single MD file with frontmatter. An index file (`MEMORY.md`) links all of them in one-line entries.

Before recommending from memory: **verify the file still exists / the function is still named that way / the flag is still there.** A memory that names a specific function or file is a claim about a past state.

---

## 10. The work rhythm (typical day)

1. Open editor, run the kickoff prompt against your AI assistant.
2. Paste the first card.
3. AI enters plan mode → plan file → approval.
4. Plain-language brief in chat.
5. Implementation across the relevant 11 phases.
6. CI gate locally.
7. Commit + push + `gh pr create` with HEREDOC body.
8. Card metadata block + one-line shipped recap in chat.
9. Manual verify on localhost when AC asks for it.
10. Wait for PR merge.
11. Post-merge cleanup.
12. Next card.

Cards take anywhere from 20 min (UI tweak) to a full day (schema + API + UI + tests). The 11-phase flow scales — phases just collapse to "skip" when irrelevant.

---

## 11. When to write a new skill

Any rule you find yourself repeating in three different cards.

Examples that survived to skill status from real work:

- A repeatable test pattern (Slack signature verification across `interactive` + `events` + `commands`).
- A repeatable refactor pattern ("test the family, not the file").
- A repeatable plumbing pattern (Next.js instrumentation register hook for boot-time checks).
- A repeatable PR formatting pattern (HEREDOC body with the same 6 sections).

Skills are markdown files with YAML frontmatter (`name`, `description`, optional `model`). They become invokable via the assistant's `Skill` tool.

Write skills generic — if the rule mentions a specific repo URL or table name, pull it into the skill body's "Project-specific overrides" section, not the rule itself.

---

## 12. The boundaries (when NOT to apply this methodology)

- **Throwaway scripts.** A one-off `mjs` to query a DB doesn't need a plan file.
- **Hotfix during an incident.** Get the fix out, retroactively document.
- **Pure research / exploration.** No plan mode — just read code and answer questions.
- **Personal projects with no review burden.** You're free to skip the PR description hygiene; keep the typecheck + lint gates.

For everything else: the methodology pays for itself by the third card.

---

## 13. Using this file as a private playbook

The methodology is portable across workplaces. Three deployment modes — pick by team norms.

### Mode A: personal playbook (default)

Keep the file at `~/engineering-methodology.md`. Reference it from your AI assistant's global config — never commit to any project. The team doesn't see it; you carry it from job to job.

### Mode B: project playbook

Commit the file to the repo. Team can read, suggest edits, fork their own copy. Useful when you want to onboard collaborators to the same flow.

```bash
cp ~/engineering-methodology.md <new-repo>/engineering-methodology.md
git add engineering-methodology.md
git commit -m "docs: add engineering methodology playbook"
```

### Mode C: hybrid

Personal master at `~/engineering-methodology.md`. Per-project fork at `<repo>/docs/methodology.md` with workplace-specific overrides at the top. Master is updated as you learn; project copies are tuned to each team.

### Wire it into the AI assistant's standing context

Add this block to the project's `CLAUDE.md` / `AGENTS.md` / `GEMINI.md` at the top:

```markdown
## Standing methodology

Before any task, read [`engineering-methodology.md`](./engineering-methodology.md)
(or `~/engineering-methodology.md` if using Mode A). Apply the 11-phase card
flow. Use the kickoff prompt in §1.6 on first session of every chat.
```

Every new chat in that repo loads the methodology by reference. The AI does not need to be re-briefed per session.

### Install the portable skill set (one-time per machine)

The methodology assumes these skills exist at `~/.claude/skills/`:

```
card/                          ← the 11-phase skill (generic version)
superpowers:brainstorming
superpowers:writing-plans
superpowers:executing-plans
superpowers:test-driven-development
superpowers:systematic-debugging
superpowers:verification-before-completion
superpowers:requesting-code-review
superpowers:receiving-code-review
superpowers:finishing-a-development-branch
superpowers:using-git-worktrees
superpowers:writing-skills
caveman / caveman-commit / caveman-review
verify, run, simplify
```

Missing skills degrade gracefully — auto-triggers fail but the 11-phase flow still runs when you invoke phases manually.

### Per-repo first-day checklist

On the first session in any new repo:

1. Paste the **§1.6 kickoff prompt** verbatim.
2. AI reads `CLAUDE.md` + `engineering-methodology.md` + memory.
3. AI confirms the 6 items from the kickoff (stack, base branch, lint / test commands, etc.).
4. Set up the `gh` CLI: `gh auth status` → `gh auth login --web` if needed.
5. Create the memory directory: `~/.claude/projects/<repo-slug>/memory/MEMORY.md`.
6. Cut the first branch from the agreed base.

### Per-card workflow

Paste a card / ticket / issue spec into chat → AI invokes the `card` skill → 11 phases run → PR opens.

You do NOT re-explain the methodology each time. The skill + the playbook reference handle it.

### Workplace-specific overrides

The file is portable but rarely 100% one-size. Add an overrides block at the very top of your project copy:

```markdown
## This workplace's overrides
- Base branch: `develop` (not `staging`)
- PR repo: `acme-corp/api-monolith`
- Required commit footer: `Jira: PROJ-XXXX`
- Lint: `pnpm lint` (not `npm run lint`)
- Migrations: Flyway (not Drizzle)
- Test runner: `pytest` (not Vitest)
```

Everything below the block stays generic. The override block is the only diff between projects.

### Evolve it

After every 3rd card on a new project, re-read §4 (anti-patterns) and add anything new you noticed. The DevOSX version started with ~5 anti-patterns and grew to 14 over the course of one session. Same growth path on any new workplace.

### Quick-start one-liner for a brand-new repo

```bash
mkdir -p ~/.claude/projects/$(basename $(pwd))/memory && \
echo "# Memory Index" > ~/.claude/projects/$(basename $(pwd))/memory/MEMORY.md && \
cp ~/engineering-methodology.md . && \
git add engineering-methodology.md && \
git commit -m "docs: methodology playbook"
```

Then paste the §1.6 kickoff prompt to the AI and you're live.

---

## 14. Reference

This methodology was distilled from work on a Next.js + Postgres + Drizzle SaaS in 2026, executed via an AI coding assistant across ~20+ shipped PRs. The patterns are stack-independent; the specific tool names (`gh`, Drizzle, Vitest, Next.js instrumentation) are interchangeable with equivalents in your stack.

The two artifacts that travel best:

1. **The card execution skill** — the 11-phase flow, codified.
2. **The kickoff prompt** — paste it once per repo.

Everything else here is supporting material.
