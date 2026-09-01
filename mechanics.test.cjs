const fs = require('fs');
const vm = require('vm');

let source = fs.readFileSync('game.js', 'utf8');
const html = fs.readFileSync('index.html', 'utf8');
const referencedIds = [...source.matchAll(/\$\('([^']+)'\)/g)].map(match => match[1]);
const missingIds = [...new Set(referencedIds)].filter(id => !html.includes(`id="${id}"`));
if (missingIds.length) throw new Error(`Missing HTML targets: ${missingIds.join(', ')}`);
source = source.slice(0, source.indexOf("document.addEventListener('pointermove'"));
source += `
  let passed = 0;
  function assert(value, name) { if (!value) throw new Error(name); passed += 1; }
  state.board = emptyBoard();
  assert(shapeFits([[1]], 0, 0), 'fits origin');
  assert(shapeFits([[1]], 7, 7), 'fits far edge');
  assert(!shapeFits([[1,1]], 7, 7), 'rejects right overflow');
  assert(!shapeFits([[1],[1]], 7, 7), 'rejects bottom overflow');
  state.board[0][0] = 'coral';
  assert(!shapeFits([[1]], 0, 0), 'rejects collision');
  state.board = emptyBoard();
  state.board[0].fill('blue');
  state.board.forEach(row => { row[0] = 'mint'; });
  const lines = detectLines();
  assert(lines.count === 2 && lines.rows[0] === 0 && lines.columns[0] === 0, 'detects simultaneous row and column');
  clearDetected(lines);
  assert(state.board[0].every(cell => cell === null) && state.board.every(row => row[0] === null), 'clears simultaneous lines');
  assert(scorePlacement(4, 0, 0) === 80, 'scores large placement quickly');
  assert(scorePlacement(6, 1, 1) === 420, 'scores first line clear');
  assert(scorePlacement(9, 2, 2) === 1580, 'rewards combo and multi-line clear');
  state.board = emptyBoard();
  let largePieces = 0;
  for (let run = 0; run < 200; run += 1) {
    state.tray = [];
    fillTray();
    assert(state.tray.length === 3, 'tray contains three pieces');
    assert(hasMove(), 'generated tray has a legal move');
    const trayLargePieces = state.tray.filter(piece => piece.matrix.flat().filter(Boolean).length >= 4 && piece.matrix.length >= 2 && piece.matrix[0].length >= 2).length;
    assert(trayLargePieces >= 2, 'each fresh tray contains at least two large blocks');
    largePieces += trayLargePieces;
  }
  assert(largePieces >= 400, 'large blocks make up at least two thirds of generated pieces');
  console.log('Mechanics assertions passed:', passed);
`;

vm.runInNewContext(source, {
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  console, Math, JSON, Number, Array, setTimeout, clearTimeout
});
