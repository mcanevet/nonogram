# Nonogram Pro

A vanilla JavaScript nonogram/picross puzzle game that runs directly in the browser.

## Features

- Multiple difficulty levels: 5x5, 10x10, 15x15
- Fill and Cross modes for solving puzzles
- Auto-cross completed lines (auto-fills empty cells when a line is solved)
- Show correct on error option (reveals correct answer on mistakes)
- Mistake counter (3 lives)
- Timer
- Win animation
- Responsive design for mobile and desktop

## How to Play

1. Open `index.html` in a web browser
2. Select a difficulty level
3. Click "New Puzzle" to start
4. Use the clues on the top and left to figure out which cells to fill
5. Numbers indicate consecutive filled cells
6. Multiple numbers mean multiple groups of filled cells with at least one empty space between them

## Controls

- **Fill mode**: Click cells to fill them
- **Cross mode**: Click cells to mark them as empty (X)
- Toggle between modes using the buttons

## Options

- **Auto-cross**: When enabled, automatically marks empty cells with X when a row or column is fully solved
- **Show correct on error**: When enabled, shows the correct answer when you make a mistake

## Running Locally

Simply open `index.html` in your browser. No build step or server required.

For development with auto-refresh:
```bash
npx serve .
# or
python -m http.server 8000
```

Then open http://localhost:8000

## Development

This is a vanilla JavaScript project with no dependencies.

### File Structure
```
├── index.html    # Main HTML file
├── style.css     # All styles
├── game.js       # Game engine
├── AGENTS.md     # Developer guidelines
├── plan.md       # Development plan
└── README.md     # This file
```

### Code Style

- ES6+ features (classes, arrow functions, const/let)
- CSS custom properties for theming
- Mobile-first responsive design
- See AGENTS.md for detailed guidelines

## License

MIT
