# Nonogram Game - Agent Guidelines

This is a vanilla JavaScript nonogram/picross puzzle game. It runs directly in the browser without a build step.

## Project Structure

```
/nonogram
├── index.html    # Main HTML file
├── style.css     # All styles
├── game.js       # Main game engine
├── plan.md       # Development plan
└── AGENTS.md     # This file
```

## Running the Project

Simply open `index.html` in a browser. No build step required.

For local development, you can use any static file server:
```bash
npx serve .
# or
python -m http.server 8000
```

Then open http://localhost:8000 (or the port shown)

## Code Style Guidelines

### General Principles
- Keep code simple and readable - this is a small vanilla JS project
- No external dependencies required
- Use ES6+ features (classes, arrow functions, const/let)
- Avoid over-engineering - solve the problem directly

### File Organization
- `index.html` - HTML structure only, no inline scripts
- `style.css` - All CSS, organized by component/section
- `game.js` - Single JavaScript file containing:
  - `Engine` class - main game controller
  - Game logic methods
  - UI update methods
  - Event handlers

### JavaScript Conventions
- Use **camelCase** for variables and methods
- Use **PascalCase** for class names
- Use **UPPER_SNAKE_CASE** for constants
- Use `const` by default, `let` only when reassignment needed
- Prefer arrow functions for callbacks
- Use template literals for string interpolation

### Class Structure (Engine class)
```javascript
class Engine {
  constructor() {
    // Initialize state and DOM references
    // Set up event listeners
    // Start game
  }

  // Game state methods
  init() { }        // Start new game
  setMode(m) { }    // Set fill/cross mode

  // Rendering methods
  render() { }           // Full render
  renderGrid() { }       // Grid only
  renderHints() { }      // Hints only

  // Game logic
  handleInput(r, c) { }  // Cell click handling
  checkWin() { }         // Win condition
  mistake(r, c) { }      // Handle error

  // Utility methods
  getHints(arr) { }      // Calculate hints
}
```

### CSS Guidelines
- Use CSS custom properties (variables) for colors
- Use `clamp()` for responsive sizing
- Keep styles scoped with specific class names
- Group related styles together
- Use flexbox and grid for layout
- Mobile-first approach for responsive design

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Variables | camelCase | `this.playerBoard` |
| Methods | camelCase | `handleInput()` |
| Classes | PascalCase | `class Engine` |
| CSS classes | kebab-case | `.game-layout` |
| Constants | UPPER_SNAKE | `this.MAX_MISTAKES` |

### Event Handling
- Use `onclick` for simple click handlers
- Use pointer events (`onpointerdown`, `onpointerenter`) for drag support
- Always check `this.isGameOver` before processing input

### State Management
Game state is stored in class properties:
- `this.solution` - 2D array of correct answers (0/1)
- `this.playerBoard` - 2D array of player input (0=empty, 1=filled, 2=crossed)
- `this.mode` - Current input mode ('fill' or 'cross')
- `this.mistakes` - Current mistake count
- `this.isGameOver` - Game state flag
- `this.autoCross` - Auto-fill crosses option

### Error Handling
- Use `console.warn()` for non-critical issues
- Display errors to user via the message element
- Don't crash on invalid input - validate before processing

### DOM Updates
- Update only the cells that changed via `updateCellUI()`
- Use `classList.add/remove` for state changes
- Avoid full re-renders during gameplay

### Adding New Features

1. **New Game Option**: Add checkbox in HTML, bind to Engine class
2. **New Visual Style**: Add CSS, use CSS variables for theming
3. **New Game Logic**: Add method to Engine class, call from appropriate place

### Common Patterns

**Toggle cell state:**
```javascript
if (current === 1) {
  this.playerBoard[r][c] = 0;  // Clear
} else if (current === 0) {
  this.playerBoard[r][c] = 1;  // Fill
}
```

**Check if line is complete:**
```javascript
const hints = this.getHints(this.solution[row]);
const playerHints = this.getHints(this.playerBoard[row]);
if (this.arraysEqual(hints, playerHints)) {
  // Line complete
}
```

**Animation:**
```javascript
el.classList.add('anim-class');
setTimeout(() => el.classList.remove('anim-class'), duration);
```

## Testing

Manual testing only - open `index.html` in browser and play.

For automated testing, consider adding a test framework (Jest, Vitest) with:
```bash
npm init -y
npm install -D vitest
```

Then add test scripts to package.json.

## PWA Support (Future)

To add PWA installability:
1. Add `manifest.json` with app metadata
2. Add service worker (`sw.js`) for offline support
3. Register SW in index.html

## Questions?

For features not covered here, use your best judgment following the patterns established in the existing code.

## Commit Conventions

This project uses Conventional Commits.

### Format
```
<type>(<scope>): <description>

[optional body]
```

### Types
- `feat` - new feature
- `fix` - bug fix
- `docs` - documentation changes
- `style` - formatting, no code change
- `refactor` - code restructure
- `test` - testing
- `chore` - maintenance

### Examples
```bash
git commit -m "feat: add auto-cross completed lines option"
git commit -m "fix: align column hints with grid"
git commit -m "docs: update README with new features"
git commit -m "refactor: extract hint calculation to utility"
```
