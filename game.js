class Engine {
  constructor() {
    this.size = 10;
    this.solution = [];
    this.playerBoard = []; // 0: empty, 1: filled, 2: crossed
    this.mistakes = 0;
    this.isGameOver = false;
    this.mode = 'fill'; 
    this.gameMode = 'classic'; // 'classic' or 'zen'
    this.autoCross = false;
    this.highlightComplete = false;
    this.completedRows = new Set();
    this.completedCols = new Set();
    this.errorCooldown = false;

    this.els = {
      grid: document.getElementById('grid'),
      hTop: document.getElementById('hintsTop'),
      hLeft: document.getElementById('hintsLeft'),
      mistakes: document.getElementById('mistakes'),
      msg: document.getElementById('msg'),
      diff: document.getElementById('diffSelect'),
      livesContainer: document.getElementById('livesContainer')
    };

    document.getElementById('newGame').onclick = () => this.init();
    document.getElementById('modeToggle').onclick = () => this.toggleMode();
    document.getElementById('autoCross').onchange = (e) => this.autoCross = e.target.checked;
    document.getElementById('highlightComplete').onchange = (e) => this.highlightComplete = e.target.checked;
    this.autoCross = document.getElementById('autoCross').checked;
    this.highlightComplete = document.getElementById('highlightComplete').checked;
    
    this.init();
  }

  toggleMode() {
    this.mode = this.mode === 'fill' ? 'cross' : 'fill';
    this.updateModeButton();
  }

  updateModeButton() {
    const btn = document.getElementById('modeToggle');
    const icon = btn.querySelector('.mode-icon');
    const label = btn.querySelector('.mode-label');
    
    if (this.mode === 'fill') {
      btn.className = 'mode-toggle fill';
      icon.textContent = '●';
      label.textContent = 'FILL';
    } else {
      btn.className = 'mode-toggle cross';
      icon.textContent = '✕';
      label.textContent = 'CROSS';
    }
  }

  generatePuzzle() {
    let puzzle;
    let attempts = 0;
    const maxAttempts = 10;
    
    // Only validate for 5x5 (fast enough), skip for larger
    const shouldValidate = this.size <= 5;
    
    do {
      puzzle = Array.from({length: this.size}, () => 
        Array.from({length: this.size}, () => Math.random() > 0.45 ? 1 : 0)
      );
      attempts++;
    } while (shouldValidate && attempts < maxAttempts && new PuzzleSolver(puzzle).countSolutions(3) > 1);
    
    return puzzle;
  }

  init() {
    this.size = parseInt(this.els.diff.value);
    this.gameMode = document.getElementById('gameMode').value;
    this.completedRows = new Set();
    this.completedCols = new Set();
    
    // Generate solution with unique solution
    this.solution = this.generatePuzzle();
    
    this.playerBoard = Array.from({length: this.size}, () => Array(this.size).fill(0));
    this.mistakes = 0;
    this.isGameOver = false;
    this.els.msg.textContent = "";
    this.els.msg.className = "message";
    
    // Show/hide lives and options based on game mode
    this.els.livesContainer.style.display = this.gameMode === 'zen' ? 'none' : 'block';
    
    const optionsContainer = document.querySelector('.options');
    const autoCrossOption = document.querySelector('label:has(#autoCross)');
    const highlightOption = document.querySelector('label:has(#highlightComplete)');
    
    if (this.gameMode === 'zen') {
      if (autoCrossOption) autoCrossOption.style.display = 'none';
      if (highlightOption) highlightOption.style.display = 'none';
      this.autoCross = false;
      this.highlightComplete = false;
    } else {
      if (autoCrossOption) autoCrossOption.style.display = 'flex';
      if (highlightOption) highlightOption.style.display = 'flex';
      this.autoCross = document.getElementById('autoCross').checked;
      this.highlightComplete = document.getElementById('highlightComplete').checked;
    }
    
    // Hide mode toggle button in Zen mode
    document.getElementById('modeToggle').style.display = this.gameMode === 'zen' ? 'none' : 'flex';
    
    this.render();
    this.updateModeButton();
    this.updateStats();
  }

  getHints(arr) {
    const hints = [];
    let count = 0;
    arr.forEach(v => {
      if (v === 1) count++;
      else if (count > 0) { hints.push(count); count = 0; }
    });
    if (count > 0) hints.push(count);
    return hints;
  }

  render() {
    // Adjust hint box sizes based on grid size
    const hintMinHeight = this.size >= 20 ? '22px' : (this.size >= 15 ? '26px' : (this.size >= 10 ? '32px' : '38px'));
    const hintMinWidth = this.size >= 20 ? '22px' : (this.size >= 15 ? '26px' : (this.size >= 10 ? '32px' : '38px'));
    const hintFontSize = this.size >= 20 ? '0.45rem' : (this.size >= 15 ? '0.5rem' : (this.size >= 10 ? '0.6rem' : '0.7rem'));
    
    // Render Top Hints
    this.els.hTop.innerHTML = "";
    this.els.hTop.style.gap = '1px';
    for(let c=0; c<this.size; c++) {
      const col = this.solution.map(row => row[c]);
      const div = document.createElement('div');
      div.className = 'hint-box top';
      div.style.minHeight = hintMinHeight;
      div.style.fontSize = hintFontSize;
      div.innerHTML = this.getHints(col).join('<br>');
      this.els.hTop.appendChild(div);
    }

    // Render Left Hints
    this.els.hLeft.style.gridTemplateRows = `repeat(${this.size}, 1fr)`;
    this.els.hLeft.style.gap = '1px';
    this.els.hLeft.innerHTML = "";
    for(let r=0; r<this.size; r++) {
      const div = document.createElement('div');
      div.className = 'hint-box left';
      div.style.minWidth = hintMinWidth;
      div.style.fontSize = hintFontSize;
      div.textContent = this.getHints(this.solution[r]).join(' ');
      this.els.hLeft.appendChild(div);
    }

    // Render Grid
    this.els.grid.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`;
    this.els.grid.innerHTML = "";
    for(let r=0; r<this.size; r++) {
      for(let c=0; c<this.size; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        if ((c + 1) % 5 === 0 && c !== this.size - 1) cell.classList.add('border-right');
        if ((r + 1) % 5 === 0 && r !== this.size - 1) cell.classList.add('border-bottom');
        
        // Use pointer events for drag support
        cell.onpointerdown = (e) => {
          cell.releasePointerCapture(e.pointerId); 
          this.handleInput(r, c);
        };
        cell.onpointerenter = (e) => {
          if (e.buttons === 1) this.handleInput(r, c);
        };
        
        this.els.grid.appendChild(cell);
      }
    }
    
    // Sync column widths after grid renders
    this.syncHintWidths();
  }

  syncHintWidths() {
    const gridStyle = getComputedStyle(this.els.grid);
    const gridCols = gridStyle.gridTemplateColumns;
    const gridRows = gridStyle.gridTemplateRows;
    
    // Only sync if we have valid values
    if (gridCols && gridCols !== 'none') {
      this.els.hTop.style.gridTemplateColumns = gridCols;
    }
    if (gridRows && gridRows !== 'none') {
      this.els.hLeft.style.gridTemplateRows = gridRows;
    }
  }

  handleInput(r, c) {
    if (this.isGameOver || this.errorCooldown) return;
    
    const current = this.playerBoard[r][c];
    const correct = this.solution[r][c];

    // Haptic feedback
    const hapticTrigger = document.getElementById('haptic-trigger');
    if (hapticTrigger) {
      hapticTrigger.checked = !hapticTrigger.checked;
    } else if (navigator.vibrate) {
      navigator.vibrate(10);
    }

    if (this.gameMode === 'zen') {
      // Zen mode: cycle through empty -> fill -> cross -> empty
      const current = this.playerBoard[r][c];
      if (current === 0) {
        this.playerBoard[r][c] = 1; // fill
      } else if (current === 1) {
        this.playerBoard[r][c] = 2; // cross
      } else {
        this.playerBoard[r][c] = 0; // clear
      }
      this.updateCellUI(r, c);
      if (this.autoCross) this.autoCrossCompletedLines(r, c);
      else this.checkAndHighlightCompletedLines(r, c);
      
      // Check win only when all cells are filled
      this.checkWinZen();
    } else {
      // Classic mode: check correctness on each click
      if (this.mode === 'fill') {
        if (correct === 1) {
          this.playerBoard[r][c] = 1;
          this.updateCellUI(r, c);
          if (this.autoCross) this.autoCrossCompletedLines(r, c);
          else this.checkAndHighlightCompletedLines(r, c);
          this.checkWin();
        } else {
          this.mistakes++;
          this.playerBoard[r][c] = 2;
          this.updateCellUI(r, c);
          this.showErrorAnimation(r, c);
          this.updateStats();
          this.errorCooldown = true;
          setTimeout(() => this.errorCooldown = false, 500);
          if (this.mistakes >= 3) {
            this.gameOver();
          }
        }
      } else {
        // Cross mode
        if (correct === 1) {
          this.mistakes++;
          this.playerBoard[r][c] = 1;
          this.updateCellUI(r, c);
          this.showErrorAnimation(r, c);
          this.updateStats();
          this.errorCooldown = true;
          setTimeout(() => this.errorCooldown = false, 500);
          if (this.mistakes >= 3) {
            this.gameOver();
          }
        } else {
          this.playerBoard[r][c] = 2;
          this.updateCellUI(r, c);
        }
      }
    }
  }

  showErrorAnimation(r, c) {
    const idx = r * this.size + c;
    const el = this.els.grid.children[idx];
    el.classList.add('error');
    setTimeout(() => el.classList.remove('error'), 300);
  }

  gameOver() {
    this.isGameOver = true;
    this.els.msg.textContent = "GAME OVER";
    this.els.msg.className = "message lose";
    this.revealSolution();
  }

  getHintsFromSolution(line) {
    const hints = [];
    let count = 0;
    for (const v of line) {
      if (v === 1) count++;
      else if (count > 0) { hints.push(count); count = 0; }
    }
    if (count > 0) hints.push(count);
    return hints;
  }

  getPlayerHints(line) {
    const hints = [];
    let count = 0;
    for (const v of line) {
      if (v === 1) count++;
      else if (count > 0) { hints.push(count); count = 0; }
    }
    if (count > 0) hints.push(count);
    return hints.length ? hints : [0];
  }

  arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  autoCrossCompletedLines(row, col) {
    let rowComplete = false;
    let colComplete = false;

    // Check row
    const rowHints = this.getHintsFromSolution(this.solution[row]);
    const playerRowHints = this.getPlayerHints(this.playerBoard[row]);
    
    if (this.arraysEqual(rowHints, playerRowHints) && !this.completedRows.has(row)) {
      rowComplete = true;
      this.completedRows.add(row);
      for (let c = 0; c < this.size; c++) {
        if (this.playerBoard[row][c] === 0) {
          this.playerBoard[row][c] = 2;
          this.updateCellUI(row, c);
          this.addLineCompleteAnimation(row, c);
        }
      }
    }

    // Check column
    const colData = this.solution.map(r => r[col]);
    const colHints = this.getHintsFromSolution(colData);
    
    const playerColData = this.playerBoard.map(r => r[col]);
    const playerColHints = this.getPlayerHints(playerColData);

    if (this.arraysEqual(colHints, playerColHints) && !this.completedCols.has(col)) {
      colComplete = true;
      this.completedCols.add(col);
      for (let r = 0; r < this.size; r++) {
        if (this.playerBoard[r][col] === 0) {
          this.playerBoard[r][col] = 2;
          this.updateCellUI(r, col);
          this.addLineCompleteAnimation(r, col);
        }
      }
    }

    // Update hint highlighting if option enabled
    if ((rowComplete || colComplete) && this.highlightComplete) {
      this.updateHintHighlighting();
    }
  }

  updateHintHighlighting() {
    // Update row hints
    for (let r = 0; r < this.size; r++) {
      const hintEl = this.els.hLeft.children[r];
      if (this.completedRows.has(r)) {
        hintEl.classList.add('complete');
      }
    }
    // Update column hints
    for (let c = 0; c < this.size; c++) {
      const hintEl = this.els.hTop.children[c];
      if (this.completedCols.has(c)) {
        hintEl.classList.add('complete');
      }
    }
  }

  checkAndHighlightCompletedLines(row, col) {
    if (!this.highlightComplete) return;

    // Check row
    const rowHints = this.getHintsFromSolution(this.solution[row]);
    const playerRowHints = this.getPlayerHints(this.playerBoard[row]);
    
    if (this.arraysEqual(rowHints, playerRowHints) && !this.completedRows.has(row)) {
      this.completedRows.add(row);
      this.updateHintHighlighting();
    }

    // Check column
    const colData = this.solution.map(r => r[col]);
    const colHints = this.getHintsFromSolution(colData);
    
    const playerColData = this.playerBoard.map(r => r[col]);
    const playerColHints = this.getPlayerHints(playerColData);

    if (this.arraysEqual(colHints, playerColHints) && !this.completedCols.has(col)) {
      this.completedCols.add(col);
      this.updateHintHighlighting();
    }
  }

  addLineCompleteAnimation(r, c) {
    const idx = r * this.size + c;
    const el = this.els.grid.children[idx];
    el.classList.add('line-complete');
    setTimeout(() => el.classList.remove('line-complete'), 500);
  }

  updateCellUI(r, c) {
    const idx = r * this.size + c;
    const el = this.els.grid.children[idx];
    const state = this.playerBoard[r][c];
    
    el.classList.remove('filled', 'crossed');
    if (state === 1) el.classList.add('filled');
    if (state === 2) el.classList.add('crossed');
    
    // Keep hints synced in case of resize
    this.syncHintWidths();
  }

  revealSolution() {
    this.solution.forEach((row, r) => {
        row.forEach((val, c) => {
            if (val === 1 && this.playerBoard[r][c] !== 1) {
                const idx = r * this.size + c;
                this.els.grid.children[idx].style.border = "1px solid var(--accent)";
            }
        });
    });
  }

  checkWin() {
    const won = this.solution.every((row, r) => 
      row.every((val, c) => (val === 1 ? this.playerBoard[r][c] === 1 : true))
    );
    if (won) {
      this.isGameOver = true;
      this.els.msg.textContent = "PUZZLE SOLVED!";
      this.els.msg.className = "message win";
      this.playWinAnimation();
    }
  }

  checkWinZen() {
    // Check if all cells are filled (1=filled, 2=crossed)
    const allFilled = this.playerBoard.every(row => row.every(cell => cell !== 0));
    if (!allFilled) return;
    
    // Check if solution matches
    const correct = this.solution.every((row, r) => 
      row.every((val, c) => {
        if (val === 1) return this.playerBoard[r][c] === 1;
        return this.playerBoard[r][c] === 2;
      })
    );
    
    if (correct) {
      this.isGameOver = true;
      this.els.msg.textContent = "PUZZLE SOLVED!";
      this.els.msg.className = "message win";
      this.playWinAnimation();
    }
  }

  playWinAnimation() {
    const cells = this.els.grid.children;
    let delay = 0;
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.solution[r][c] === 1 && this.playerBoard[r][c] === 1) {
          const idx = r * this.size + c;
          setTimeout(() => {
            cells[idx].classList.add('win-anim');
          }, delay);
          delay += 30;
        }
      }
    }
  }

  updateStats() {
    const hearts = '❤️'.repeat(3 - this.mistakes) + '🖤'.repeat(this.mistakes);
    this.els.mistakes.textContent = hearts;
  }
}

// Start the game
window.game = new Engine();

// Solver for unique solution validation using random solving
class PuzzleSolver {
  constructor(solution) {
    this.solution = solution;
    this.size = solution.length;
    this.rowHints = this.getHints(solution, 'row');
    this.colHints = this.getHints(solution, 'col');
    this.startTime = Date.now();
    this.maxTime = 50; // 50ms time limit
    this.solutionsFound = 0;
  }

  // Fast probabilistic check: try to find multiple solutions
  countSolutions(maxAttempts = 5) {
    this.startTime = Date.now();
    
    // First try deterministic solving
    if (this.solve()) {
      this.solutionsFound = 1;
      // Try to find a different solution with random attempts
      for (let i = 0; i < maxAttempts; i++) {
        if (Date.now() - this.startTime > this.maxTime) break;
        if (this.solveRandom()) {
          return 2; // Found multiple solutions
        }
      }
      return 1; // Likely unique
    }
    return 0; // No solution found (invalid puzzle)
  }

  // Check time limit
  isTimedOut() {
    return Date.now() - this.startTime > this.maxTime;
  }

  // Fast probabilistic check: try to find multiple solutions
  // Returns true if likely unique (no second solution found)
  countSolutions(maxAttempts = 100) {
    // First try deterministic solving with random start
    if (this.solve()) {
      // Found first solution, try to find a different one
      for (let i = 0; i < maxAttempts; i++) {
        if (this.solveRandom()) {
          return 2; // Found multiple solutions
        }
      }
      return 1; // Likely unique
    }
    return 0; // No solution found (invalid puzzle)
  }

  // Deterministic solver - fills cells greedily
  solve() {
    const grid = Array(this.size).fill(null).map(() => Array(this.size).fill(0));
    return this.solveRecursive(grid, 0, 0);
  }

  // Random solver - makes random choices when ambiguous
  solveRandom() {
    const grid = Array(this.size).fill(null).map(() => Array(this.size).fill(-1));
    return this.solveRecursiveRandom(grid, 0, 0);
  }

  solveRecursive(grid, row, col) {
    if (this.isTimedOut()) return false;
    if (row >= this.size) return this.isComplete(grid);

    const nextRow = col === this.size - 1 ? row + 1 : row;
    const nextCol = col === this.size - 1 ? 0 : col + 1;

    // Try filled first, then empty (deterministic)
    for (const value of [1, 0]) {
      grid[row][col] = value;
      if (this.isPartialValid(grid, row, col) && 
          this.solveRecursive(grid, nextRow, nextCol)) {
        return true;
      }
    }
    grid[row][col] = -1;
    return false;
  }

  solveRecursiveRandom(grid, row, col) {
    if (this.isTimedOut()) return false;
    if (row >= this.size) return this.isComplete(grid);

    const nextRow = col === this.size - 1 ? row + 1 : row;
    const nextCol = col === this.size - 1 ? 0 : col + 1;

    // Random order for finding different solutions
    const values = Math.random() > 0.5 ? [1, 0] : [0, 1];
    for (const value of values) {
      grid[row][col] = value;
      if (this.isPartialValid(grid, row, col) && 
          this.solveRecursiveRandom(grid, nextRow, nextCol)) {
        return true;
      }
    }
    grid[row][col] = -1;
    return false;
  }

  isComplete(grid) {
    for (let r = 0; r < this.size; r++) {
      const hints = this.getLineHints(grid[r]);
      if (!this.arraysEqual(hints, this.rowHints[r])) return false;
    }
    for (let c = 0; c < this.size; c++) {
      const col = grid.map(row => row[c]);
      const hints = this.getLineHints(col);
      if (!this.arraysEqual(hints, this.colHints[c])) return false;
    }
    return true;
  }

  isPartialValid(grid, row, col) {
    // Check all rows up to current
    for (let r = 0; r <= row; r++) {
      const maxCol = row === r ? col : this.size - 1;
      const line = grid[r].slice(0, maxCol + 1);
      if (!this.hintsMatchPartial(line, this.rowHints[r])) return false;
    }
    
    // Check all columns up to current
    for (let c = 0; c < this.size; c++) {
      const maxRow = col === c ? row : (col < c ? row - 1 : row);
      if (maxRow < 0) continue;
      const line = grid.slice(0, maxRow + 1).map(r => r[c]);
      if (!this.hintsMatchPartial(line, this.colHints[c])) return false;
    }
    return true;
  }

  hintsMatchPartial(line, target) {
    const hints = this.getLineHints(line.filter(v => v !== -1));
    if (hints.length > target.length) return false;
    if (hints.length === target.length) {
      for (let i = 0; i < hints.length - 1; i++) {
        if (hints[i] !== target[i]) return false;
      }
      if (hints.length > 0 && hints[hints.length - 1] > target[hints.length - 1]) return false;
    }
    return true;
  }

  arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  getHints(grid, type) {
    const hints = [];
    if (type === 'row') {
      for (let r = 0; r < this.size; r++) {
        hints.push(this.getLineHints(grid[r]));
      }
    } else {
      for (let c = 0; c < this.size; c++) {
        const col = grid.map(row => row[c]);
        hints.push(this.getLineHints(col));
      }
    }
    return hints;
  }

  getLineHints(line) {
    const hints = [];
    let count = 0;
    for (const cell of line) {
      if (cell === 1) {
        count++;
      } else if (count > 0) {
        hints.push(count);
        count = 0;
      }
    }
    if (count > 0) hints.push(count);
    return hints.length ? hints : [];
  }
}
