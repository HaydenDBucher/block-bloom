const GRID_SIZE = 8;
const COLORS = ['coral', 'mint', 'gold', 'blue'];
const THEMES = ['Meadow', 'Forest', 'Canyon'];
const SHAPES = [
  [[1]], [[1,1]], [[1,1,1]], [[1,1,1,1]],
  [[1],[1]], [[1],[1],[1]], [[1],[1],[1],[1]],
  [[1,1],[1,1]], [[1,0],[1,1]], [[0,1],[1,1]],
  [[1,1],[1,0]], [[1,1],[0,1]], [[1,1,1],[0,1,0]],
  [[1,0],[1,0],[1,1]], [[1,1,0],[0,1,1]]
];

const $ = id => document.getElementById(id);
const emptyBoard = () => Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
const defaultState = { board: emptyBoard(), tray: [], score: 0, lines: 0, combo: 0, runBestCombo: 0, bestScore: 0, bestCombo: 0, totalLines: 0, theme: 0, sound: true, haptics: true, turns: 0, runRecorded: false };

function loadState() {
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem('block-bloom-state') || 'null'); } catch { localStorage.removeItem('block-bloom-state'); }
  const next = { ...defaultState, ...(saved || {}) };
  const validBoard = Array.isArray(next.board) && next.board.length === GRID_SIZE && next.board.every(row => Array.isArray(row) && row.length === GRID_SIZE);
  next.board = validBoard ? next.board.map(row => row.map(cell => COLORS.includes(cell) ? cell : null)) : emptyBoard();
  next.tray = Array.isArray(next.tray) ? next.tray.filter(validPiece).slice(0, 3) : [];
  ['score','lines','combo','runBestCombo','bestScore','bestCombo','totalLines','turns'].forEach(key => next[key] = Math.max(0, Number.isFinite(Number(next[key])) ? Number(next[key]) : 0));
  next.theme = Math.max(0, Math.min(THEMES.length - 1, Math.round(Number(next.theme) || 0)));
  next.sound = next.sound !== false; next.haptics = next.haptics !== false;
  return next;
}

function validPiece(piece) { return piece && Array.isArray(piece.matrix) && piece.matrix.length && piece.matrix.length <= 4 && piece.matrix.every(row => Array.isArray(row) && row.length === piece.matrix[0].length && row.length <= 4 && row.every(cell => cell === 0 || cell === 1)) && COLORS.includes(piece.color); }

let state = loadState();
let selectedIndex = null;
let pointerState = null;
let resolving = false;
let resolveTimer = null;
let undoSnapshot = null;
let audioContext = null;

const save = () => { try { localStorage.setItem('block-bloom-state', JSON.stringify(state)); } catch { toast('Progress could not be saved'); } };
const cloneRunState = () => JSON.parse(JSON.stringify({ board: state.board, tray: state.tray, score: state.score, lines: state.lines, combo: state.combo, runBestCombo: state.runBestCombo, bestScore: state.bestScore, bestCombo: state.bestCombo, totalLines: state.totalLines, turns: state.turns, runRecorded: state.runRecorded }));

function shapeFits(matrix, row, col, board = state.board) {
  return matrix.every((line, r) => line.every((cell, c) => !cell || (row + r >= 0 && col + c >= 0 && row + r < GRID_SIZE && col + c < GRID_SIZE && !board[row + r][col + c])));
}

function hasMove(tray = state.tray, board = state.board) {
  return tray.some(piece => board.some((line, row) => line.some((_, col) => shapeFits(piece.matrix, row, col, board))));
}

function randomPiece(index) {
  const matrix = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  return { matrix, color: COLORS[(state.turns + index + Math.floor(Math.random() * COLORS.length)) % COLORS.length] };
}

function fillTray() {
  let candidate;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    candidate = [randomPiece(0), randomPiece(1), randomPiece(2)];
    if (hasMove(candidate)) break;
  }
  if (!hasMove(candidate)) candidate[0] = { matrix: [[1]], color: COLORS[state.turns % COLORS.length] };
  state.tray = candidate;
  selectedIndex = null;
}

function detectLines(board = state.board) {
  const rows = board.map((row, index) => row.every(Boolean) ? index : -1).filter(index => index >= 0);
  const columns = Array.from({ length: GRID_SIZE }, (_, col) => board.every(row => row[col]) ? col : -1).filter(index => index >= 0);
  return { rows, columns, count: rows.length + columns.length };
}

function clearDetected(lines) {
  lines.rows.forEach(row => state.board[row].fill(null));
  lines.columns.forEach(col => state.board.forEach(row => { row[col] = null; }));
}

function drawBoard() {
  const board = $('board'); board.innerHTML = '';
  state.board.forEach((row, r) => row.forEach((color, c) => {
    const cell = document.createElement('button');
    cell.type = 'button'; cell.className = `cell ${color || ''} ${color ? 'filled' : ''}`;
    cell.dataset.row = r; cell.dataset.col = c; cell.tabIndex = r === 0 && c === 0 ? 0 : -1; cell.setAttribute('role', 'gridcell');
    cell.setAttribute('aria-label', `Row ${r + 1}, column ${c + 1}${color ? ', filled' : ', empty'}`);
    cell.addEventListener('pointerenter', () => previewFromAnchor(r, c));
    cell.addEventListener('focus', () => previewFromAnchor(r, c));
    cell.addEventListener('click', () => placeFromAnchor(r, c));
    cell.addEventListener('keydown', event => navigateBoard(event, r, c));
    board.appendChild(cell);
  }));
}

function navigateBoard(event, row, col) {
  const movement = { ArrowUp: [-1,0], ArrowDown: [1,0], ArrowLeft: [0,-1], ArrowRight: [0,1] }[event.key];
  if (!movement) return;
  event.preventDefault();
  const nextRow = Math.max(0, Math.min(GRID_SIZE - 1, row + movement[0]));
  const nextCol = Math.max(0, Math.min(GRID_SIZE - 1, col + movement[1]));
  document.querySelectorAll('.cell').forEach(cell => { cell.tabIndex = -1; });
  const next = document.querySelector(`.cell[data-row="${nextRow}"][data-col="${nextCol}"]`);
  if (next) { next.tabIndex = 0; next.focus(); }
}

function renderTray(entering = false) {
  const tray = $('pieceTray'); tray.innerHTML = '';
  state.tray.forEach((piece, index) => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = `piece ${selectedIndex === index ? 'selected' : ''} ${entering ? 'entering' : ''}`;
    button.dataset.index = index; button.setAttribute('aria-pressed', selectedIndex === index);
    button.setAttribute('aria-label', `Piece ${index + 1}, ${piece.matrix.flat().filter(Boolean).length} blocks. Press to select or drag to board.`);
    button.addEventListener('pointerdown', beginPointer);
    button.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectPiece(index); } });
    piece.matrix.forEach(line => { const row = document.createElement('div'); row.className = 'piece-row'; line.forEach(value => { const block = document.createElement('i'); block.className = `piece-block ${value ? piece.color : 'blank'}`; row.appendChild(block); }); button.appendChild(row); });
    tray.appendChild(button);
  });
  $('piecesLeft').textContent = state.tray.length;
}

function renderStats() {
  $('scoreValue').textContent = state.score.toLocaleString(); $('bestScore').textContent = state.bestScore.toLocaleString();
  $('homeBestScore').textContent = state.bestScore.toLocaleString(); $('homeLines').textContent = state.totalLines.toLocaleString(); $('homeBestCombo').textContent = state.bestCombo;
  $('linesValue').textContent = state.lines; $('comboValue').textContent = `×${Math.max(1, state.combo)}`; $('comboFill').style.width = `${Math.min(100, state.combo * 20)}%`;
  $('undoButton').disabled = !undoSnapshot || resolving; $('continueLabel').textContent = state.score ? 'CONTINUE RUN' : 'NEW GAME';
  document.body.dataset.theme = state.theme; $('themeButton').querySelector('em').textContent = THEMES[state.theme];
  $('soundButton').querySelector('em').textContent = state.sound ? 'On' : 'Off'; $('hapticsButton').querySelector('em').textContent = state.haptics ? 'On' : 'Off';
}

function render(entering = false) { drawBoard(); renderTray(entering); renderStats(); $('gameOver').classList.remove('visible'); $('gameOver').setAttribute('aria-hidden', 'true'); }

function selectPiece(index) {
  if (resolving || !state.tray[index]) return;
  selectedIndex = selectedIndex === index ? null : index;
  renderTray();
  $('trayHint').textContent = selectedIndex === null ? 'Drag or tap · fill a row or column' : 'Now tap a board space';
  if (selectedIndex !== null) { pulse('select'); haptic(8); }
}

function anchorFor(matrix, row, col) { return { row: row - Math.floor(matrix.length / 2), col: col - Math.floor(matrix[0].length / 2) }; }

function clearPreview() { document.querySelectorAll('.cell.preview,.cell.invalid').forEach(cell => cell.classList.remove('preview','invalid')); }

function preview(matrix, row, col) {
  clearPreview(); const fits = shapeFits(matrix, row, col);
  matrix.forEach((line, r) => line.forEach((value, c) => { if (!value) return; const cell = document.querySelector(`.cell[data-row="${row + r}"][data-col="${col + c}"]`); if (cell) cell.classList.add(fits ? 'preview' : 'invalid'); }));
  return fits;
}

function previewFromAnchor(row, col) { if (selectedIndex === null || resolving) return; const piece = state.tray[selectedIndex]; const start = anchorFor(piece.matrix, row, col); preview(piece.matrix, start.row, start.col); }
function placeFromAnchor(row, col) { if (selectedIndex === null || resolving) return; const piece = state.tray[selectedIndex]; const start = anchorFor(piece.matrix, row, col); placePiece(start.row, start.col); }

function beginPointer(event) {
  if (resolving) return; event.preventDefault();
  const index = Number(event.currentTarget.dataset.index);
  pointerState = { id: event.pointerId, index, startX: event.clientX, startY: event.clientY, dragging: false, ghost: null, row: -1, col: -1, type: event.pointerType };
  event.currentTarget.setPointerCapture?.(event.pointerId);
}

function pointerPosition(event, piece) {
  const lift = event.pointerType === 'touch' ? 72 : 0;
  const x = event.clientX, y = event.clientY - lift;
  const first = document.querySelector('.cell[data-row="0"][data-col="0"]')?.getBoundingClientRect();
  const right = document.querySelector('.cell[data-row="0"][data-col="1"]')?.getBoundingClientRect();
  const below = document.querySelector('.cell[data-row="1"][data-col="0"]')?.getBoundingClientRect();
  if (!first || !right || !below) return { x, y, row: -1, col: -1, ghostX: x, ghostY: y, size: 28, gap: 2 };
  const strideX = right.left - first.left, strideY = below.top - first.top;
  const anchorRow = Math.round((y - (first.top + first.height / 2)) / strideY);
  const anchorCol = Math.round((x - (first.left + first.width / 2)) / strideX);
  const start = anchorFor(piece.matrix, anchorRow, anchorCol);
  return {
    ...start,
    ghostX: first.left + first.width / 2 + (start.col + (piece.matrix[0].length - 1) / 2) * strideX,
    ghostY: first.top + first.height / 2 + (start.row + (piece.matrix.length - 1) / 2) * strideY,
    size: first.width,
    gap: Math.max(0, strideX - first.width)
  };
}

function makeGhost(piece) {
  const ghost = document.createElement('div'); ghost.className = 'drag-ghost';
  ghost.style.gridTemplateColumns = `repeat(${piece.matrix[0].length}, var(--ghost-size))`;
  piece.matrix.forEach(line => line.forEach(value => { const block = document.createElement('i'); block.className = `ghost-block ${value ? piece.color : 'blank'}`; ghost.appendChild(block); }));
  document.body.appendChild(ghost); return ghost;
}

function movePointer(event) {
  if (!pointerState || event.pointerId !== pointerState.id) return;
  const distance = Math.hypot(event.clientX - pointerState.startX, event.clientY - pointerState.startY);
  if (!pointerState.dragging && distance < 7) return;
  const piece = state.tray[pointerState.index]; if (!piece) return cancelPointer();
  if (!pointerState.dragging) { pointerState.dragging = true; pointerState.ghost = makeGhost(piece); selectedIndex = pointerState.index; document.querySelector(`.piece[data-index="${selectedIndex}"]`)?.classList.add('picked'); }
  const pos = pointerPosition(event, piece); pointerState.row = pos.row; pointerState.col = pos.col;
  pointerState.ghost.style.setProperty('--ghost-size', `${pos.size}px`);
  pointerState.ghost.style.gap = `${pos.gap}px`;
  pointerState.ghost.style.left = `${pos.ghostX}px`; pointerState.ghost.style.top = `${pos.ghostY}px`;
  pointerState.ghost.classList.toggle('invalid', !preview(piece.matrix, pos.row, pos.col));
}

function endPointer(event) {
  if (!pointerState || event.pointerId !== pointerState.id) return;
  const current = pointerState;
  if (!current.dragging) { cancelPointer(false); selectPiece(current.index); return; }
  const piece = state.tray[current.index]; const valid = piece && shapeFits(piece.matrix, current.row, current.col);
  cancelPointer(false);
  if (valid) { selectedIndex = current.index; placePiece(current.row, current.col); }
  else { selectedIndex = null; renderTray(); toast('Try another open space'); haptic([16,30,16]); }
}

function cancelPointer(resetSelection = true) { pointerState?.ghost?.remove(); pointerState = null; clearPreview(); document.querySelectorAll('.piece.picked').forEach(piece => piece.classList.remove('picked')); if (resetSelection) { selectedIndex = null; renderTray(); } }

function placePiece(row, col) {
  if (resolving) return; const piece = state.tray[selectedIndex];
  if (!piece || !shapeFits(piece.matrix, row, col)) { toast('That piece needs more room'); haptic([16,30,16]); return; }
  undoSnapshot = cloneRunState();
  piece.matrix.forEach((line, r) => line.forEach((value, c) => { if (value) state.board[row + r][col + c] = piece.color; }));
  state.tray.splice(selectedIndex, 1); selectedIndex = null; state.turns += 1;
  const cleared = detectLines();
  const blocks = piece.matrix.flat().filter(Boolean).length;
  const nextCombo = cleared.count ? state.combo + 1 : 0;
  const lineBonus = cleared.count ? 100 * cleared.count * nextCombo + Math.max(0, cleared.count - 1) * 75 : 0;
  const gained = blocks * 5 + lineBonus;
  state.score += gained; state.combo = nextCombo; state.lines += cleared.count; state.totalLines += cleared.count;
  state.runBestCombo = Math.max(state.runBestCombo, state.combo); state.bestScore = Math.max(state.bestScore, state.score); state.bestCombo = Math.max(state.bestCombo, state.combo);
  const refilled = !state.tray.length;
  if (refilled) fillTray();
  drawBoard(); renderTray(refilled); renderStats();
  pulse(cleared.count ? 'clear' : 'place'); haptic(cleared.count ? [18,30,28] : 10);
  if (cleared.count) resolveClear(cleared, gained); else { save(); render(); showGain(gained); checkGameOver(); }
}

function resolveClear(lines, gained) {
  resolving = true; $('undoButton').disabled = true; $('gameOver').classList.remove('visible');
  const cells = lines.rows.flatMap(row => [...document.querySelectorAll(`.cell[data-row="${row}"]`)]).concat(lines.columns.flatMap(col => [...document.querySelectorAll(`.cell[data-col="${col}"]`)]));
  [...new Set(cells)].forEach((cell, index) => { cell.style.animationDelay = `${index * 12}ms`; cell.classList.add('clearing'); });
  clearDetected(lines); save(); showGain(gained, lines.count > 1 ? `${lines.count} LINES!` : state.combo > 1 ? `FLOW ×${state.combo}` : 'LINE CLEAR!');
  clearTimeout(resolveTimer); resolveTimer = setTimeout(() => { resolving = false; render(true); checkGameOver(); }, 560);
}

function showGain(points, message = `+${points}`) { const element = $('boardMessage'); element.textContent = message; element.classList.remove('show'); void element.offsetWidth; element.classList.add('show'); }
function checkGameOver() { if (!resolving && !hasMove()) endGame(); }
function endGame() { if (!state.runRecorded) state.runRecorded = true; save(); $('finalScore').textContent = state.score.toLocaleString(); $('finalLines').textContent = state.lines; $('finalFlow').textContent = state.runBestCombo; $('gameOver').classList.add('visible'); $('gameOver').setAttribute('aria-hidden', 'false'); pulse('gameover'); }

function newGame(force = false) {
  if (!force && state.score > 0 && !confirm('Start a new board? Your current run will end.')) return;
  clearTimeout(resolveTimer); resolving = false; cancelPointer(false); state.board = emptyBoard(); state.tray = []; state.score = 0; state.lines = 0; state.combo = 0; state.runBestCombo = 0; state.turns = 0; state.runRecorded = false; undoSnapshot = null; fillTray(); save(); render(true); toast('Fresh board, fresh flow');
}

function undo() { if (!undoSnapshot || resolving) return; Object.assign(state, undoSnapshot); undoSnapshot = null; selectedIndex = null; save(); render(); toast('Move undone'); pulse('select'); }
function toast(message) { const element = $('toast'); element.textContent = message; element.classList.add('show'); clearTimeout(toast.timer); toast.timer = setTimeout(() => element.classList.remove('show'), 1600); }
function haptic(pattern) { if (state.haptics && navigator.vibrate) navigator.vibrate(pattern); }
function pulse(kind) { if (!state.sound) return; try { audioContext ||= new (window.AudioContext || window.webkitAudioContext)(); const oscillator = audioContext.createOscillator(), gain = audioContext.createGain(); const frequencies = { select: 260, place: 330, clear: 620, gameover: 170 }; oscillator.frequency.value = frequencies[kind] || 300; oscillator.type = 'sine'; gain.gain.setValueAtTime(.045, audioContext.currentTime); gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + (kind === 'clear' ? .22 : .1)); oscillator.connect(gain).connect(audioContext.destination); oscillator.start(); oscillator.stop(audioContext.currentTime + .24); } catch {} }

function showView(view) { $('homeView').classList.toggle('hidden', view !== 'home'); $('gameView').classList.toggle('hidden', view !== 'game'); if (view === 'home') renderStats(); }
function toggleSettings(open) { $('settingsPanel').classList.toggle('hidden', !open); $('settingsButton').setAttribute('aria-expanded', open); if (open) $('closeSettings').focus(); }

document.addEventListener('pointermove', movePointer);
document.addEventListener('pointerup', endPointer);
document.addEventListener('pointercancel', event => { if (pointerState?.id === event.pointerId) cancelPointer(); });
window.addEventListener('blur', () => { if (pointerState) cancelPointer(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') { if (!$('settingsPanel').classList.contains('hidden')) toggleSettings(false); cancelPointer(); clearPreview(); } });
$('startGame').addEventListener('click', () => showView('game')); $('backHome').addEventListener('click', () => showView('home')); $('gameOverHome').addEventListener('click', () => showView('home'));
$('playAgain').addEventListener('click', () => newGame(true)); $('newGame').addEventListener('click', () => newGame()); $('undoButton').addEventListener('click', undo);
$('settingsButton').addEventListener('click', () => toggleSettings(true)); $('closeSettings').addEventListener('click', () => toggleSettings(false)); $('closeSettingsScrim').addEventListener('click', () => toggleSettings(false));
$('themeButton').addEventListener('click', () => { state.theme = (state.theme + 1) % THEMES.length; save(); renderStats(); pulse('select'); });
$('soundButton').addEventListener('click', () => { state.sound = !state.sound; save(); renderStats(); if (state.sound) pulse('select'); });
$('hapticsButton').addEventListener('click', () => { state.haptics = !state.haptics; save(); renderStats(); haptic(10); });
$('resetProgress').addEventListener('click', () => { if (!confirm('Reset every score and saved board? This cannot be undone.')) return; localStorage.removeItem('block-bloom-state'); state = { ...defaultState, board: emptyBoard(), tray: [] }; undoSnapshot = null; fillTray(); save(); render(); toggleSettings(false); toast('Progress reset'); });

if (!state.tray.length) fillTray();
render(true);
window.BlockBloom = { shapeFits, detectLines, hasMove, newGame: () => newGame(true), getState: () => JSON.parse(JSON.stringify(state)) };
checkGameOver();
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('./service-worker.js').catch(() => {});
