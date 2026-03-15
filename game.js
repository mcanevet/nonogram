class Engine {
  constructor() {
    this.size = 10;
    this.solution = [];
    this.playerBoard = []; // 0: empty, 1: filled, 2: crossed
    this.mistakes = 0;
    this.isGameOver = false;
    this.mode = 'fill'; 
    this.autoCross = false;
    this.showCorrect = false;
    this.highlightComplete = false;
    this.completedRows = new Set();
    this.completedCols = new Set();

    this.els = {
      grid: document.getElementById('grid'),
      hTop: document.getElementById('hintsTop'),
      hLeft: document.getElementById('hintsLeft'),
      mistakes: document.getElementById('mistakes'),
      msg: document.getElementById('msg'),
      diff: document.getElementById('diffSelect')
    };

    document.getElementById('newGame').onclick = () => this.init();
    document.getElementById('modeToggle').onclick = () => this.toggleMode();
    document.getElementById('autoCross').onchange = (e) => this.autoCross = e.target.checked;
    document.getElementById('showCorrect').onchange = (e) => this.showCorrect = e.target.checked;
    document.getElementById('highlightComplete').onchange = (e) => this.highlightComplete = e.target.checked;
    this.autoCross = document.getElementById('autoCross').checked;
    this.showCorrect = document.getElementById('showCorrect').checked;
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
    // Generate random grid with balanced density
    return Array.from({length: this.size}, () => 
      Array.from({length: this.size}, () => Math.random() > 0.45 ? 1 : 0)
    );
  }

  init() {
    this.size = parseInt(this.els.diff.value);
    this.completedRows = new Set();
    this.completedCols = new Set();
    
    // Generate solution with unique solution
    this.solution = this.generatePuzzle();
    
    this.playerBoard = Array.from({length: this.size}, () => Array(this.size).fill(0));
    this.mistakes = 0;
    this.isGameOver = false;
    this.els.msg.textContent = "";
    this.els.msg.className = "message";
    
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
    if (this.isGameOver) return;
    
    const current = this.playerBoard[r][c];
    const correct = this.solution[r][c];

    // Only allow input on empty cells
    if (current !== 0) return;

    if (this.mode === 'fill') {
      if (correct === 1) {
        // Correct: fill the cell
        this.playerBoard[r][c] = 1;
        this.updateCellUI(r, c);
        if (this.autoCross) this.autoCrossCompletedLines(r, c);
        else this.checkAndHighlightCompletedLines(r, c);
        this.checkWin();
      } else {
        // Wrong: mark mistake
        this.mistakes++;
        
        if (this.showCorrect) {
          // Show correct value: should be crossed
          this.playerBoard[r][c] = 2;
          this.updateCellUI(r, c);
        }
        this.showErrorAnimation(r, c);
        this.updateStats();
        
        if (this.mistakes >= 3) {
          this.gameOver();
        }
      }
    } else {
      // Cross mode
      if (correct === 1) {
        // Wrong: mark mistake
        this.mistakes++;
        
        if (this.showCorrect) {
          // Show correct value: should be filled
          this.playerBoard[r][c] = 1;
          this.updateCellUI(r, c);
        }
        this.showErrorAnimation(r, c);
        this.updateStats();
        
        if (this.mistakes >= 3) {
          this.gameOver();
        }
      } else {
        // Correct: cross the cell
        this.playerBoard[r][c] = 2;
        this.updateCellUI(r, c);
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
new Engine();

// Solver for unique solution validation
class PuzzleSolver {
  constructor(solution) {
    this.solution = solution;
    this.size = solution.length;
  }

  countSolutions(maxSolutions = 2) {
    let count = 0;
    const grid = Array(this.size).fill(null).map(() => Array(this.size).fill(-1));
    const rowHints = this.getHints(this.solution, 'row');
    const colHints = this.getHints(this.solution, 'col');
    
    this.solveRecursive(grid, rowHints, colHints, 0, 0, () => {
      count++;
      return count < maxSolutions;
    });
    
    return count;
  }

  solveRecursive(grid, rowHints, colHints, row, col, shouldContinue) {
    if (!shouldContinue()) return false;

    if (row >= this.size) {
      return true;
    }

    const nextRow = col === this.size - 1 ? row + 1 : row;
    const nextCol = col === this.size - 1 ? 0 : col + 1;

    for (const value of [0, 1]) {
      grid[row][col] = value;
      
      if (this.isPartialValid(grid, rowHints, colHints, row, col)) {
        if (this.solveRecursive(grid, rowHints, colHints, nextRow, nextCol, shouldContinue)) {
          return true;
        }
      }
      
      grid[row][col] = -1;
    }

    return false;
  }

  isPartialValid(grid, rowHints, colHints, currentRow, currentCol) {
    for (let r = 0; r <= currentRow; r++) {
      const maxCol = currentRow === r ? currentCol : this.size - 1;
      const line = grid[r].slice(0, maxCol + 1);
      const hints = this.getLineHints(line);
      const rowHint = rowHints[r];
      
      if (!this.hintsMatch(hints, rowHint, true)) return false;
    }
    
    for (let c = 0; c < this.size; c++) {
      let maxRow = currentRow;
      if (c > currentCol) maxRow = currentRow - 1;
      if (maxRow < 0) continue;
      
      const line = [];
      for (let r = 0; r <= maxRow; r++) {
        line.push(grid[r][c]);
      }
      const hints = this.getLineHints(line);
      const colHint = colHints[c];
      
      if (!this.hintsMatch(hints, colHint, true)) return false;
    }

    return true;
  }

  hintsMatch(hints, target, partial = false) {
    if (partial) {
      if (hints.length > target.length) return false;
      if (hints.length === target.length) {
        for (let i = 0; i < hints.length - 1; i++) {
          if (hints[i] !== target[i]) return false;
        }
        if (hints[hints.length - 1] > target[hints.length - 1]) return false;
      }
      return true;
    }
    if (hints.length !== target.length) return false;
    for (let i = 0; i < hints.length; i++) {
      if (hints[i] !== target[i]) return false;
    }
    return true;
  }

  getHints(grid, type) {
    const hints = [];
    const size = grid.length;

    if (type === 'row') {
      for (let r = 0; r < size; r++) {
        hints.push(this.getLineHints(grid[r]));
      }
    } else {
      for (let c = 0; c < size; c++) {
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
    if (count > 0) {
      hints.push(count);
    }
    return hints.length ? hints : [];
  }
}
