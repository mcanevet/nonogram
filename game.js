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
    // Pre-defined patterns with emoji names
    const patterns = [
      { emoji: '❤️', grid: [[0,1,0,1,0],[1,1,1,1,1],[1,1,1,1,1],[0,1,1,1,0],[0,0,1,0,0]] },
      { emoji: '⭐', grid: [[0,0,1,0,0],[0,1,1,1,0],[1,1,1,1,1],[0,1,1,1,0],[1,0,1,0,1]] },
      { emoji: '😊', grid: [[1,1,1,1,1],[1,0,1,0,1],[1,1,1,1,1],[1,1,0,1,1],[1,1,1,1,1]] },
      { emoji: '🐱', grid: [[1,0,1,0,1],[1,0,1,0,1],[1,1,1,1,1],[1,0,1,0,1],[1,1,0,1,1]] },
      { emoji: '🌸', grid: [[0,1,0,1,0],[1,1,1,1,1],[0,1,1,1,0],[0,0,1,0,0],[0,1,0,1,0]] },
      { emoji: '🍀', grid: [[0,0,1,0,0],[0,1,1,1,0],[0,0,1,0,0],[1,1,1,1,1],[0,1,0,1,0]] },
      { emoji: '🔥', grid: [[0,1,0,1,0],[1,1,1,1,1],[0,1,1,1,0],[1,1,1,1,1],[0,1,0,1,0]] },
      { emoji: '💎', grid: [[0,0,1,0,0],[0,1,1,1,0],[1,1,1,1,1],[1,1,1,1,1],[1,1,0,1,1]] },
      { emoji: '🎮', grid: [[1,1,1,1,1],[1,0,1,0,1],[1,1,1,1,1],[0,1,0,1,0],[0,1,1,1,0]] },
      { emoji: '⚽', grid: [[0,1,1,1,0],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[0,1,1,1,0]] },
      { emoji: '🚀', grid: [[0,0,1,0,0],[0,1,1,1,0],[1,1,1,1,1],[0,1,0,1,0],[0,1,0,1,0]] },
      { emoji: '🌙', grid: [[0,0,1,0,0],[0,1,1,1,0],[1,1,1,1,1],[1,0,1,0,1],[0,0,1,0,0]] },
      { emoji: '☀️', grid: [[0,0,1,0,0],[0,1,1,1,0],[1,1,1,1,1],[0,1,1,1,0],[0,0,1,0,0]] },
      { emoji: '🌈', grid: [[0,0,1,0,0],[0,1,1,1,0],[1,1,1,1,1],[1,0,1,0,1],[1,0,1,0,1]] },
      { emoji: '🍕', grid: [[1,1,1,1,1],[1,0,1,0,1],[1,1,1,1,1],[0,1,1,1,0],[0,1,0,1,0]] },
      { emoji: '🎸', grid: [[1,0,1,0,1],[1,0,1,0,1],[1,1,1,1,1],[0,1,1,1,0],[0,0,1,0,0]] },
      { emoji: '🎯', grid: [[0,0,1,0,0],[0,1,1,1,0],[1,1,0,1,1],[0,1,1,1,0],[0,0,1,0,0]] },
      { emoji: '🏆', grid: [[0,1,1,1,0],[0,0,1,0,0],[0,1,1,1,0],[1,1,1,1,1],[1,0,1,0,1]] },
      { emoji: '🐶', grid: [[1,0,0,0,1],[1,1,1,1,1],[1,0,1,0,1],[1,1,1,1,1],[0,1,0,1,0]] },
      { emoji: '🦁', grid: [[1,0,1,0,1],[0,1,1,1,0],[1,1,1,1,1],[1,0,1,0,1],[1,0,1,0,1]] },
      { emoji: '🍄', grid: [[0,1,0,1,0],[1,1,1,1,1],[0,1,1,1,0],[0,1,0,1,0],[0,1,0,1,0]] },
      { emoji: '🌵', grid: [[0,0,1,0,0],[0,1,1,1,0],[0,0,1,0,0],[0,1,0,1,0],[0,1,0,1,0]] },
      { emoji: '⏰', grid: [[1,1,1,1,1],[1,0,1,0,1],[1,1,1,1,1],[0,1,0,1,0],[0,1,1,1,0]] },
      { emoji: '🔔', grid: [[0,1,0,1,0],[1,1,1,1,1],[0,1,0,1,0],[0,1,0,1,0],[0,1,0,1,0]] },
    ];
    
    const selected = patterns[Math.floor(Math.random() * patterns.length)];
    this.currentEmoji = selected.emoji;
    const pattern = selected.grid;
    
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
    
    // Show preview emoji
    const previewEl = document.getElementById('preview');
    if (previewEl) previewEl.textContent = this.currentEmoji || '';
    
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

  syncHintWidths() {
    const gridStyle = getComputedStyle(this.els.grid);
    const gridCols = gridStyle.gridTemplateColumns;
    const gridRows = gridStyle.gridTemplateRows;
    
    if (gridCols && gridCols !== 'none') {
      this.els.hTop.style.gridTemplateColumns = gridCols;
    }
    if (gridRows && gridRows !== 'none') {
      this.els.hLeft.style.gridTemplateRows = gridRows;
    }
  }

  startDrag(r, c) {
    // Record the action based on starting cell state
    const current = this.playerBoard[r][c];
    // 0 -> 1 (fill), 1 -> 2 (cross), 2 -> 0 (clear)
    this.dragAction = current;
  }

  applyDrag(r, c) {
    // Only apply to cells that are in the SAME state as the starting cell
    // This protects already-set cells from being changed
    const current = this.playerBoard[r][c];
    
    // Skip if cell is not in the same state as drag started
    if (current !== this.dragAction) return;
    
    // Cycle to next state: empty(0)→fill(1)→cross(2)→empty(0)
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
    // Check if all filled cells in solution are correctly filled
    const allFilled = this.solution.every((row, r) => 
      row.every((val, c) => {
        if (val === 1) return this.playerBoard[r][c] === 1;
        return true; // Empty/crossed cells don't matter for 0s in solution
      })
    );
    
    if (allFilled) {
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
