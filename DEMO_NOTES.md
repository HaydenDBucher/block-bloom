# In-Class Demonstration and Reflection

## Concise live demo (about 90 seconds)

1. **Open signed out (10 sec):** show the public URL in a private window. State: “No installation or creator account is required.”
2. **Explain the loop (10 sec):** “Choose one of three pieces, place it, fill a row or column to clear it, and continue until no piece fits.”
3. **Play silently (25 sec):** drag one piece, tap-select and tap-place another, show score feedback, then complete a line if practical.
4. **Show resilience (15 sec):** use Undo, refresh to show persistence, and point out the New board confirmation.
5. **Show ending (10 sec):** use a prepared near-end board if needed; show Run complete, score, lines, best flow, and Play again.
6. **Name the revision (10 sec):** explain that early drag math ignored board gaps, causing cursor/preview drift; the fix measures actual rendered cell centers.
7. **Reflection (10 sec):** deliver the statement below.

## Specific reflection

“My important failure was treating a visually gridded interface as mathematically uniform. Dividing total board width by eight seemed reasonable, but padding and gaps made the preview drift from the actual cells. I diagnosed it by comparing pointer coordinates with rendered cell rectangles, then changed placement to snap against measured centers. The transferable lesson is that interaction geometry should use the user’s rendered interface as its source of truth, especially across responsive layouts.”

## Questions I should be ready to answer

- `shapeFits` checks every occupied shape cell for bounds and collision.
- `detectLines` finds full rows and columns after placement.
- Logical cells clear and save immediately; the old DOM remains briefly only to animate safely.
- `resolving` blocks additional moves while a clear animation finishes.
- The tray generator retries until at least one offered piece has a legal move.
- Local storage preserves the board and settings; defensive validation rejects malformed saved state.
- Undo restores the exact pre-placement board, tray, score, combo, and statistics.
- The service worker uses the network first, then cached assets when offline.
