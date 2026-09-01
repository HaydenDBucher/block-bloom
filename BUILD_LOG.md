# Block Bloom — Concise Build Log

## Product specification

An original, single-player 8×8 block puzzle for desktop and mobile. The player drags a piece—or taps a piece and then a board cell—to place it. A completed row or column clears. The run ends when none of the three available pieces fits. The player can immediately restart.

Design priorities: understandable without narration, accurate touch placement, restrained visual hierarchy, immediate feedback, persistent progress, keyboard access, and a complete ending/restart loop.

## Incremental agent workflow

### 1. Playable puzzle conversion — August 25

- Specification: replace an earlier clicker prototype with a spatial block-placement loop.
- Change: created board state, shape-fit rules, scoring, row/column detection, line clearing, piece tray, game-over detection, and local persistence.
- Inspection: counted rendered cells, placed shapes, cleared lines, reloaded saved state, and exercised restart.
- Diagnosis: the original dashboard competed with the core action and the board was too large for a compact browser view.

### 2. Focused interface and direct manipulation — August 27

- Specification: make the game usable by pointer and touch without narrated instructions.
- Change: reduced the interface to home, score, board, tray, and run controls; added drag preview, valid/invalid projection, source-piece hiding, and responsive sizing.
- Diagnosis: early dragging duplicated the piece, obscured touch targets, and mapped the pointer imprecisely.
- Revision: lifted touch previews above the finger, added tap-to-select/tap-to-place, centered shapes around an anchor cell, and measured actual rendered cell positions so the preview snaps one-for-one with board squares.
- Verification: tested edge fits, collisions, invalid drops, pointer cancellation, and narrow-screen sizing.

### 3. Product-quality feedback and edge-state repair — August 27

- Specification: produce a coherent state → action → feedback → ending → restart loop.
- Change: added staggered clear animations, score messages, combo feedback, tray-refill motion, sound/haptic toggles, undo, run summary, confirmations, and three themes.
- Diagnosis: deferred logical clearing could save completed lines or briefly report game over before animation ended; tap selection and interrupted pointer gestures were unreliable.
- Revision: clear logical state before saving, lock input only during visual resolution, cancel pending timers on restart, centralize pointer cleanup, and check game over only after resolution.
- Verification: an independent mechanics review found no remaining P0 correctness blockers. The automated suite passes 407 assertions, including edge fits, collision, simultaneous row/column clears, and 200 generated trays with a legal move.

### 4. Deployment and rubric-readiness pass — September 1

- Specification: provide a public, update-safe build and concise assessment evidence.
- Change: published the repository and GitHub Pages site; added PWA metadata, icon, offline support, explicit objective/action/ending copy, full run summary, submission checklist, test protocol, and demonstration notes.
- Diagnosis: the old cache-first service worker could show a stale build, and the historical log contained obsolete 9×9/81-cell claims.
- Revision: changed the service worker to network-first with offline fallback and replaced the log with this current, decision-focused record.
- Verification: syntax checks, mechanics tests, Git status/remote checks, public HTTP checks, and a second-device signed-out check are listed in `SUBMISSION.md`.

## Major choices the student should be able to explain

- **Why 8×8:** large enough for planning while remaining readable on a 320px-wide phone.
- **Why three pieces:** fewer choices reduce visual competition and match the plan/place/refill rhythm.
- **Why immediate logical clearing:** animation must never delay or corrupt saved game state.
- **Why two placement modes:** dragging is direct; tap-select/tap-place is more accessible and reliable on small screens.
- **Why measured grid snapping:** CSS padding and gaps make `board width ÷ 8` inaccurate; using actual cell rectangles keeps preview and placement identical.
- **Why restrained retention:** best scores, flow, replay, and themes encourage return without timers, forced ads, or punitive streaks.

## Current verification commands

```powershell
node mechanics.test.cjs
node --check game.js
node --check service-worker.js
git status -sb
```

### 5. Endless-run progression tuning — September 1

- Specification: keep the run endless until no move fits, offer large rectangular blocks more often, and make score growth feel immediate.
- Change: weighted 70% of initial piece draws toward 2×2, 2×3, 3×2, and 3×3 blocks while preserving smaller recovery shapes and the legal-move safeguard.
- Change: increased placement scoring to 20 points per occupied square, line clears to 300 points per line multiplied by flow, and simultaneous-clear bonuses to 200 points per extra line.
- Verification: added exact score assertions and a 600-piece distribution test requiring at least half of generated pieces to be large blocks.

### 6. Guaranteed large-piece trays — September 1

- Diagnosis: the weighted generator could still produce a visibly small tray, and existing saved trays survived the generator update.
- Revision: every refill now guarantees two large shapes, the third has an 85% large-shape preference, and a piece-set version refreshes older saved trays immediately.
- Fairness: if the board is too crowded for the generated tray, a 1×1 recovery piece is paired with two large choices so the run can continue without losing the requested large-piece identity.
- Verification: 200 generated trays must each contain at least two large pieces and at least one legal move.

### 7. Balanced mixed trays — September 1

- Human feedback: guaranteeing two large pieces made the tray feel repetitive and too heavy.
- Revision: each tray now contains one large rectangle, one original-style shape, and one 50/50 choice between those categories.
- Result: no tray can be entirely large, while large rectangles average approximately 50% across repeated refills.
- Verification: 200 generated trays must contain one or two large rectangles, retain a legal move, and remain within a 43–57% distribution band.
