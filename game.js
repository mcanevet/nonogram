class Engine {
  constructor() {
    this.size = 10;
    this.solution = [];
    this.playerBoard = []; // 0: empty, 1: filled, 2: crossed
    this.mistakes = 0;
    this.isGameOver = false;
    this.mode = 'fill'; 
    this.seconds = 0;
    this.timerInt = null;
    this.autoCross = false;
    this.showCorrect = false;

    this.els = {
      grid: document.getElementById('grid'),
      hTop: document.getElementById('hintsTop'),
      hLeft: document.getElementById('hintsLeft'),
      mistakes: document.getElementById('mistakes'),
      timer: document.getElementById('timer'),
      msg: document.getElementById('msg'),
      diff: document.getElementById('diffSelect')
    };

    document.getElementById('newGame').onclick = () => this.init();
    document.getElementById('modeFill').onclick = () => this.setMode('fill');
    document.getElementById('modeCross').onclick = () => this.setMode('cross');
    document.getElementById('autoCross').onchange = (e) => this.autoCross = e.target.checked;
    document.getElementById('showCorrect').onchange = (e) => this.showCorrect = e.target.checked;
    this.autoCross = document.getElementById('autoCross').checked;
    this.showCorrect = document.getElementById('showCorrect').checked;
    
    this.init();
  }

  setMode(m) {
    this.mode = m;
    document.getElementById('modeFill').classList.toggle('active', m === 'fill');
    document.getElementById('modeCross').classList.toggle('active', m === 'cross');
  }

  init() {
    clearInterval(this.timerInt);
    this.size = parseInt(this.els.diff.value);
    
    // Generate solution with balanced density
    this.solution = Array.from({length: this.size}, () => 
      Array.from({length: this.size}, () => Math.random() > 0.45 ? 1 : 0)
    );
    
    this.playerBoard = Array.from({length: this.size}, () => Array(this.size).fill(0));
    this.mistakes = 0;
    this.seconds = 0;
    this.isGameOver = false;
    this.els.msg.textContent = "";
    this.els.msg.className = "message";
    
    this.render();
    this.startTimer();
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
    return hints.length ? hints : [0];
  }

  render() {
    // Render Top Hints
    this.els.hTop.innerHTML = "";
    for(let c=0; c<this.size; c++) {
      const col = this.solution.map(row => row[c]);
      const div = document.createElement('div');
      div.className = 'hint-box top';
      div.innerHTML = this.getHints(col).join('<br>');
      this.els.hTop.appendChild(div);
    }

    // Render Left Hints
    this.els.hLeft.style.gridTemplateRows = `repeat(${this.size}, 1fr)`;
    this.els.hLeft.innerHTML = "";
    for(let r=0; r<this.size; r++) {
      const div = document.createElement('div');
      div.className = 'hint-box left';
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
    clearInterval(this.timerInt);
  }

  getHintsFromSolution(line) {
    const hints = [];
    let count = 0;
    for (const v of line) {
      if (v === 1) count++;
      else if (count > 0) { hints.push(count); count = 0; }
    }
    if (count > 0) hints.push(count);
    return hints.length ? hints : [0];
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
    // Check row
    const rowHints = this.getHintsFromSolution(this.solution[row]);
    const playerRowHints = this.getPlayerHints(this.playerBoard[row]);
    
    if (this.arraysEqual(rowHints, playerRowHints)) {
      let hasAutoCross = false;
      for (let c = 0; c < this.size; c++) {
        if (this.playerBoard[row][c] === 0) {
          this.playerBoard[row][c] = 2;
          this.updateCellUI(row, c);
          this.addLineCompleteAnimation(row, c);
          hasAutoCross = true;
        }
      }
    }

    // Check column
    const colData = this.solution.map(r => r[col]);
    const colHints = this.getHintsFromSolution(colData);
    
    const playerColData = this.playerBoard.map(r => r[col]);
    const playerColHints = this.getPlayerHints(playerColData);

    if (this.arraysEqual(colHints, playerColHints)) {
      for (let r = 0; r < this.size; r++) {
        if (this.playerBoard[r][col] === 0) {
          this.playerBoard[r][col] = 2;
          this.updateCellUI(r, col);
          this.addLineCompleteAnimation(r, col);
        }
      }
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
      clearInterval(this.timerInt);
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
    this.els.mistakes.textContent = `${this.mistakes}/3`;
  }

  startTimer() {
    this.timerInt = setInterval(() => {
      this.seconds++;
      const m = Math.floor(this.seconds / 60).toString().padStart(2, '0');
      const s = (this.seconds % 60).toString().padStart(2, '0');
      this.els.timer.textContent = `${m}:${s}`;
    }, 1000);
  }
}

// Start the game
new Engine();
