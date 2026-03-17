class Engine {
  constructor() {
    this.size = 10;
    this.solution = [];
    this.playerBoard = []; // 0: empty, 1: filled, 2: crossed
    this.isGameOver = false;

    this.els = {
      grid: document.getElementById('grid'),
      hTop: document.getElementById('hintsTop'),
      hLeft: document.getElementById('hintsLeft'),
      msg: document.getElementById('msg'),
      diff: document.getElementById('diffSelect')
    };

    document.getElementById('newGame').onclick = () => this.init();
    
    this.init();
  }

  generatePuzzle() {
    // Pre-defined emoji-like patterns (each is 5x5 or scaled)
    const patterns = [
      [[0,1,0,1,0],[1,1,1,1,1],[1,1,1,1,1],[0,1,1,1,0],[0,0,1,0,0]],
      [[0,0,1,0,0],[0,1,1,1,0],[1,1,1,1,1],[0,1,1,1,0],[1,0,1,0,1]],
      [[1,1,1,1,1],[1,0,1,0,1],[1,1,1,1,1],[1,1,0,1,1],[1,1,1,1,1]],
      [[1,0,1,0,1],[1,0,1,0,1],[1,1,1,1,1],[1,0,1,0,1],[1,1,0,1,1]],
      [[0,1,0,1,0],[1,1,1,1,1],[0,1,1,1,0],[0,0,1,0,0],[0,1,0,1,0]],
    ];
    
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    
    if (this.size === 5) {
      return pattern;
    }
    
    // Scale up for larger grids
    const scale = this.size / 5;
    return Array.from({length: this.size}, (_, r) =>
      Array.from({length: this.size}, (_, c) => 
        pattern[Math.floor(r / scale)][Math.floor(c / scale)]
      )
    );
  }

  init() {
    this.size = parseInt(this.els.diff.value);
    this.solution = this.generatePuzzle();
    this.playerBoard = Array.from({length: this.size}, () => Array(this.size).fill(0));
    this.isGameOver = false;
    this.els.msg.textContent = "";
    this.els.msg.className = "message";
    
    this.render();
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
    this.dragAction = null; // Track drag action
    
    for(let r=0; r<this.size; r++) {
      for(let c=0; c<this.size; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        if ((c + 1) % 5 === 0 && c !== this.size - 1) cell.classList.add('border-right');
        if ((r + 1) % 5 === 0 && r !== this.size - 1) cell.classList.add('border-bottom');
        
        cell.onpointerdown = (e) => {
          cell.releasePointerCapture(e.pointerId);
          this.startDrag(r, c);
          this.handleInput(r, c);
        };
        cell.onpointerenter = (e) => {
          if (e.buttons === 1 && this.dragAction !== null) {
            this.applyDrag(r, c);
          }
        };
        cell.onpointerup = () => {
          this.dragAction = null;
        };
        
        this.els.grid.appendChild(cell);
      }
    }
    
    // Global pointerup to end drag
    document.onpointerup = () => {
      this.dragAction = null;
    };
    
    this.syncHintWidths();
  }

  startDrag(r, c) {
    // Record the action based on starting cell state
    const current = this.playerBoard[r][c];
    // 0 -> 1 (fill), 1 -> 2 (cross), 2 -> 0 (clear)
    this.dragAction = current;
  }

  applyDrag(r, c) {
    // Apply the same action to all dragged cells
    const current = this.playerBoard[r][c];
    
    // Skip if cell already has the target state from drag action
    let target;
    if (this.dragAction === 0) target = 1;
    else if (this.dragAction === 1) target = 2;
    else target = 0;
    
    if (current !== target) {
      if (target === 1) {
        this.playerBoard[r][c] = 1;
      } else if (target === 2) {
        this.playerBoard[r][c] = 2;
      } else {
        this.playerBoard[r][c] = 0;
      }
      this.updateCellUI(r, c);
      this.checkWinZen();
    }
  }

  handleInput(r, c) {
    if (this.isGameOver) return;
    
    // Haptic feedback
    const hapticTrigger = document.getElementById('haptic-trigger');
    if (hapticTrigger) {
      hapticTrigger.checked = !hapticTrigger.checked;
    } else if (navigator.vibrate) {
      navigator.vibrate(10);
    }

    // Click cycles: empty -> fill -> cross -> empty
    const current = this.playerBoard[r][c];
    if (current === 0) {
      this.playerBoard[r][c] = 1;
    } else if (current === 1) {
      this.playerBoard[r][c] = 2;
    } else {
      this.playerBoard[r][c] = 0;
    }
    this.updateCellUI(r, c);
    this.checkWinZen();
  }

  updateCellUI(r, c) {
    const idx = r * this.size + c;
    const el = this.els.grid.children[idx];
    const state = this.playerBoard[r][c];
    
    el.classList.remove('filled', 'crossed');
    if (state === 1) el.classList.add('filled');
    if (state === 2) el.classList.add('crossed');
    
    this.syncHintWidths();
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
      this.els.msg.textContent = "SOLVED!";
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
}

// Start the game
window.game = new Engine();
