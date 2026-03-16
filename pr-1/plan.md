# Nonogram Game - Development Plan

## Tech Stack
- **Vanilla**: HTML, CSS, JavaScript (no build step)
- **PWA**: manifest.json + service worker

## Features (MVP)

### Core Game
- Interactive grid with tap/click to fill/cross cells
- Random puzzle generator (solvable puzzles with unique solution)
- Auto-calculated row/column hints
- Win/lose validation
- Multiple difficulty levels: 5x5, 10x10, 15x15, 20x20

### PWA
- Installable on mobile (manifest.json)
- Offline support (service worker)

### UI
- Timer
- Lives/mistakes counter
- New game / difficulty selection
- Responsive design for mobile/desktop

## Development Steps

1. **HTML Structure**: Create index.html with game UI
2. **CSS Styling**: Responsive grid, cell states, controls
3. **JavaScript Logic**:
   - Puzzle generator with uniqueness validation
   - Hint calculation
   - Game state management
   - Cell interaction (tap to fill/cross)
   - Win/lose validation
4. **PWA**: Add manifest.json and service worker for installability

## File Structure

```
index.html      # Main game HTML
style.css       # All styles
game.js         # Game logic
generator.js    # Puzzle generation
solver.js       # Solver for validation
manifest.json   # PWA manifest
sw.js           # Service worker
```
