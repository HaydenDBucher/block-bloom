# Block Bloom Build Log

## Project

An original browser puzzle game inspired by the quick-placement, line-clearing loop of block puzzle games. The project is intentionally self-contained and runs by opening `index.html`.

## Build History

### 2026-08-25: Initial progression game

- Created the first playable browser experience, originally called Ritual Rush.
- Added a short action loop with streaks, rewards, XP, levels, and persistent progress.
- Added a run history, milestone/relic view, responsive layout, and localStorage persistence.
- Verified the page loaded, the action updated state, and state survived reload.

### 2026-08-25: Block puzzle conversion

- Replaced the ritual clicker with Block Bloom, an original Block Blast-inspired game.
- Added a 9x9 board, generated shape tray, placement rules, horizontal and vertical line clearing, score, combo, XP, and game-over detection.
- Added a home dashboard with high score, best combo, total lines, and a Start Playing action.
- Added a separate play screen and milestone wall.
- Verified the board rendered 81 cells, shapes could be placed, score updated, state persisted, and milestones opened.

### 2026-08-27: Focused play and drag interaction

- Simplified the home and play screen relationship.
- Added pointer and touch dragging from the shape tray to the board.
- Added a full-shape floating drag ghost with live valid/invalid placement feedback.
- Hid the source tray piece while it is being carried so there is no duplicate visual reference.
- Added deeper nature-inspired color themes: Woodland, Moss, and Canyon.
- Added animated row and column clearing using a brief brightness/compression effect.
- Added drag boundary handling for pointer positions outside the board.
- Verified drag pickup, placement, source hiding, theme cycling, and state persistence.

### 2026-08-27: Playing-area refinement

- Reduced the board and surrounding interface so the game is easier to see in the browser.
- Set the board to approximately 300px on desktop and 280px on mobile.
- Removed the drag ghost shadow and vertical lift.
- Centered the dragged shape directly on the pointer/finger.
- Replaced the compressed stylesheet with a clean complete stylesheet after correcting a patch-marker integrity issue.
- Verified JavaScript and workspace diagnostics after the final layout changes.

## Current Features

- Home screen with high score, best combo, and total lines.
- Focused play screen with board, score, combo, lines, and shape tray.
- 9x9 placement board.
- Mouse, pointer, and touch dragging.
- Full carried-piece preview during drag.
- Source piece hidden during pickup.
- Live placement preview and invalid placement feedback.
- Horizontal and vertical line clearing.
- Row and column clear animation.
- Deep Woodland, Moss, and Canyon themes.
- Score, XP, levels, best score, best combo, and run history.
- Persistent state through `localStorage`.
- Milestone wall.
- Responsive desktop and mobile layouts.

## Validation Record

- `node --check .\\game.js` passes.
- Workspace diagnostics report no errors in `index.html`, `style.css`, or `game.js`.
- Browser checks confirmed the home screen loads first.
- Browser checks confirmed Start Playing opens the board.
- Browser checks confirmed the board renders 81 cells.
- Browser checks confirmed dragging creates one floating ghost and hides the tray source.
- Browser checks confirmed dropping a piece updates the board and score.
- Browser checks confirmed themes cycle and persist.
- Browser checks confirmed state survives reload.

## Files

- `index.html`: page structure, home screen, play screen, and milestone wall.
- `style.css`: responsive layout, board styling, natural themes, drag ghost, and clear animations.
- `game.js`: board state, piece generation, drag handling, scoring, clearing, persistence, and navigation.

### 2026-08-27: Compact 8x8 board and top score HUD

- Changed the board from 6x6 to 8x8, rendering 64 cells while keeping the compact browser-friendly footprint.
- Moved the available block tray directly below the board.
- Moved the live score and chain multiplier into the top bar.
- Updated the board accessibility label to 8x8.
- Preserved saved-game compatibility by resetting older boards whose dimensions do not match the active grid.
- Verified the browser renders 64 cells, the tray sits below the board, and the top HUD displays score and multiplier values.

### 2026-08-27: Wordle / NYT visual pass

- Removed the drag ghost shadow and kept the carried shape centered on the pointer.
- Restored the compact page after an interrupted markup replacement.
- Shifted the visual direction toward a restrained Wordle / NYT-style puzzle interface with warm paper tones, charcoal typography, crisp borders, and muted tile colors.
- Kept the natural color theme cycling and line-clear animation behavior.

### 2026-08-27: Vibrant tile pass

- Added `vibrant.css` as a visual overlay for brighter coral, green, yellow, and blue tiles.
- Removed drag-piece shadow effects with explicit `filter: none` and `box-shadow: none` rules.
- Kept the paper-like puzzle layout while increasing tile contrast and placement-preview visibility.
- Verified the page loads with the vibrant palette and no workspace diagnostics.

### 2026-08-27: Drag alignment polish

- Centered the moving shape directly on pointer coordinates using a transform instead of measuring and subtracting its rendered dimensions.
- Confirmed the drag ghost computes with `filter: none` and `box-shadow: none`.
- Added a clearer score chip, tray dividers, and stronger board contrast for a more finished puzzle presentation.
- Verified the browser still renders the full board and the drag ghost remains visually aligned.

### 2026-08-27: Typography and navigation polish

- Replaced the plain back arrow treatment with a clean circular icon button.
- Increased the current-score and high-score typography to bold, larger sizes.
- Strengthened available-block and footer labels for clearer scanning.
- Verified the back button dimensions, score typography, and 8x8 board in the browser.

### 2026-08-27: Final drag polish

- Removed any remaining visual shadow treatment from the moving piece.
- Centered the drag ghost using direct pointer coordinates and `translate(-50%, -50%)` to reduce perceived displacement.
- Added brighter, higher-contrast tile colors and cleaner score/tray presentation.
- Verified the drag ghost computes with no filter or box shadow and the board still renders correctly.

### 2026-08-27: Minimal game flow redesign

- Replaced the dashboard-heavy opening page with only Play, Settings, and a small looping mechanics animation.
- Added functional Settings controls for theme cycling and progress reset.
- Simplified the play screen to the live score, multiplier, high score, board, available blocks, line count, and new-board action.
- Kept the 8x8 board and positioned the available block tray directly below it.
- Added hidden engine-state targets so the existing persistence and scoring engine remains compatible with the minimal UI.
- Restored a missing history listener target to eliminate browser initialization errors.
- Verified the home controls, Settings panel, 64-cell board, score/high-score layout, and tray position in the browser.

### 2026-08-27: Four-piece placement cycles

- Replaced the loose random three-piece tray with curated four-piece configurations.
- Each cycle mixes compact, line, corner, and larger shapes to make planning meaningful without making the board unfair.
- A new configuration appears only after all four available blocks are placed.
- Older saved trays with fewer than four pieces are migrated to the new cycle format.
- Each completed tray advances to the next configuration and rotates its colors.
- Verified the browser shows four ready pieces with valid block matrices and the 8x8 board remains playable.

### 2026-08-27: Reliable line-clear game-over checks

- Deferred the no-more-moves check until completed rows and columns finish clearing.
- Prevented a valid line clear from briefly showing the game-over overlay while those cells were still logically occupied.
- Preserved the clear animation and now rechecks available moves against the correctly updated board.

### 2026-08-27: App-quality interaction redesign

- Rebuilt the home and play screens with a responsive, offline-friendly visual system and three accessible color themes.
- Added tap-to-select, tap-to-place, keyboard placement, centered pointer dragging, and a lifted touch preview.
- Added safe immediate line resolution, input locking during animations, pointer cancellation cleanup, and defensive saved-state validation.
- Added undo, sound and haptic controls, reset/new-board confirmations, reduced-motion support, and a clearer run-complete flow.
- Added combo-aware scoring, multi-line bonuses, staggered clear animation, score messages, tray refill motion, and a solvability guard for new piece trays.
- Removed the external font dependency and corrected broken character encoding throughout the interface.
