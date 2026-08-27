const fs = require('fs');
const vm = require('vm');

let source = fs.readFileSync('game.js', 'utf8');
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
  state.board = emptyBoard();
  for (let run = 0; run < 200; run += 1) {
    state.tray = [];
    fillTray();
    assert(state.tray.length === 3, 'tray contains three pieces');
    assert(hasMove(), 'generated tray has a legal move');
  }
  console.log('Mechanics assertions passed:', passed);
`;

vm.runInNewContext(source, {
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  console, Math, JSON, Number, Array, setTimeout, clearTimeout
});
