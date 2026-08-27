# Block Bloom

A calm, colorful block puzzle built for mouse, touch, and keyboard play.

## Play locally

Open `index.html` directly in a browser. For installability and offline caching, serve the folder over HTTP.

```powershell
npx serve .
```

## Test

```powershell
node mechanics.test.cjs
node --check game.js
node --check service-worker.js
```

## Highlights

- Responsive 8×8 puzzle board
- Drag, touch, tap-to-place, and keyboard controls
- Animated line clears and combo scoring
- Undo, themes, sound, and haptic settings
- Persistent progress and defensive save validation
- Installable PWA with offline caching
