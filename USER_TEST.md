# Unfamiliar-User Test Note

> Required before submission: complete this with a real person who has not seen the game. Do not coach them while they play and do not invent observations.

## Silent test protocol

1. Open the public URL in a private/incognito window or on a second device.
2. Say only: “Please play this for two minutes and talk aloud if you want.”
3. Do not explain the objective, controls, scoring, line clearing, undo, or restart.
4. Record observable behavior, not interpretations: first click/tap, pauses, repeated failed actions, accidental drops, whether a line is cleared, and whether restart is found.
5. Ask afterward: “What was the goal?” and “What, if anything, felt unclear?”
6. Make one revision addressing the most consequential friction.
7. Give the revised build to the same tester or a second unfamiliar person and verify the behavior on a new attempt.

## Test record — fill in before submission

- **Tester description (no full name needed):** TODO
- **Device/browser:** TODO
- **Date and build/commit:** TODO
- **Creator remained silent:** Yes / No

### Concrete observations

- First action: TODO
- Time until first successful placement: TODO
- Time until objective was understood: TODO
- Most consequential friction observed: TODO
- Exact behavior showing the friction: TODO
- Tester’s answer to “What was the goal?”: TODO

### Revision and verification

- Diagnosis: TODO
- Product change made because of the test: TODO
- Commit containing the revision: TODO
- New-attempt verification behavior: TODO
- Why this verifies the friction was fixed: TODO

## Existing engineering observation (supporting context, not a substitute for the human test)

During implementation review, drag placement was observed to drift because the original calculation divided the full board width by eight while ignoring CSS padding and gaps. The revised implementation measures actual cell rectangles and snaps the carried piece and placement preview to those centers. Automated mechanics tests still pass after the change.
