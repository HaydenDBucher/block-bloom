# Block Bloom Submission Evidence

## Required links

- **Public game:** https://haydendbucher.github.io/block-bloom/
- **Repository/source:** https://github.com/HaydenDBucher/block-bloom
- **Build log:** `BUILD_LOG.md`
- **Unfamiliar-user note:** `USER_TEST.md`
- **Demonstration/reflection:** `DEMO_NOTES.md`

## Rubric evidence map

### Working deployment and playable loop — 30%

- Public GitHub Pages URL requires no sign-in.
- State: 8×8 board, score, best score, line count, flow, and three-piece tray.
- Action: drag, touch, tap-to-select/tap-to-place, or keyboard placement.
- Feedback: exact landing preview, invalid-state indication, sound/haptic options, score message, line-clear cascade, and tray refill motion.
- Ending: no legal move opens a Run complete summary with score, lines, and best flow.
- Restart: Play again begins a fresh run; New board and reset actions confirm destructive changes.
- Persistence: board, score, progress, and settings survive refresh.

### Product clarity and restraint — 15%

- Home screen states the action, objective, and ending in three short sentences.
- Play screen repeats the placement and clearing instruction beside the available pieces.
- The interface keeps attention on one board and three large piece targets.
- Common edges handled: invalid placement, interrupted pointer, touch occlusion, no moves, reload, undo, destructive resets, corrupt save data, reduced motion, and offline fallback.

### Unfamiliar-user test and revision — 20%

- Complete `USER_TEST.md` with a genuine silent test.
- The note must contain behavior, diagnosis, consequential revision, and verification on a new attempt.
- Do not submit the TODO template as completed evidence.

### Agent workflow and ownership — 20%

- `BUILD_LOG.md` records specifications, incremental changes, inspections, diagnoses, revisions, and verification.
- `DEMO_NOTES.md` lists the major mechanics the student should be able to explain.
- `mechanics.test.cjs` is executable verification, not a claimed result without evidence.

### Demonstration and learning reflection — 15%

- `DEMO_NOTES.md` provides a concise live sequence showing the full loop and a specific failure → diagnosis → change → lesson narrative.

## Final verification record

Run immediately before submission and record the date/results:

- [ ] Public URL opens signed out in a private window.
- [ ] Public URL opens on a second device.
- [ ] A piece can be dragged and lands exactly where previewed.
- [ ] A piece can be tapped, then placed by tapping the board.
- [ ] A line visibly clears and score/line totals change.
- [ ] Refresh preserves the current run.
- [ ] A no-move board shows Run complete.
- [ ] Play again produces a fresh playable board.
- [ ] `node mechanics.test.cjs` passes 407 assertions.
- [ ] `node --check game.js` passes.
- [ ] `node --check service-worker.js` passes.
- [ ] `git status -sb` is clean and synchronized with `origin/main`.
