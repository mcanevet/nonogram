# Nonogram Pro - Technical Research Report

## Project Overview

**Nonogram Pro** is a vanilla JavaScript nonogram/picross puzzle game that runs directly in the browser without a build step. It functions as a Progressive Web App (PWA) installable on mobile devices.

## Architecture

### Technology Stack
- **Frontend**: Vanilla HTML, CSS, JavaScript (no build tools)
- **PWA**: Service Worker (sw.js) + Web App Manifest
- **Testing**: Playwright for E2E tests
- **Tooling**: mise for Node.js version management

### File Structure
```
nonogram/
├── index.html          # Main HTML with game UI structure
├── style.css          # All styling (308 lines)
├── game.js            # Game engine (~607 lines)
├── sw.js              # Service worker for PWA (58 lines)
├── manifest.json      # PWA manifest
├── favicon.svg        # App icon
├── test-e2e.js       # Playwright E2E tests
├── package.json       # NPM config with Playwright dev dependency
├── mise.toml          # Node.js version management
├── AGENTS.md          # Developer guidelines
├── plan.md            # Original development plan
├── README.md          # Project documentation
├── CHANGELOG.md       # Auto-generated changelog
└── .github/
    ├── workflows/
    │   ├── deploy.yml          # GitHub Pages deployment
    │   └── release-please.yml   # Automated releases
    └── (workflows folder)
```

## Core Components

### 1. Engine Class (game.js)

The main game controller with ~607 lines of JavaScript.

**State Properties:**
- `this.size` - Grid dimension (5, 10, 15, or 20)
- `this.solution` - 2D array of correct answers (0/1)
- `this.playerBoard` - 2D array of player input (0=empty, 1=filled, 2=crossed)
- `this.mode` - Input mode: 'fill' or 'cross'
- `this.gameMode` - 'classic' or 'zen'
- `this.mistakes` - Error count (0-3)
- `this.isGameOver` - Game state flag
- `this.autoCross` - Auto-fill crosses option
- `this.highlightComplete` - Highlight completed lines
- `this.completedRows/Cols` - Sets tracking completed lines
- `this.errorCooldown` - 500ms pause after mistake

**Key Methods:**
- `init()` - Initialize new game, generates puzzle, hides/shows UI based on mode
- `generatePuzzle()` - Creates random grid with ~55% density
- `handleInput(r, c)` - Main interaction handler with different behavior per mode
- `getHints(arr)` - Calculates hint numbers from line array
- `render()` - Renders grid, hints, and cells
- `checkWin()` - Classic mode win detection
- `checkWinZen()` - Zen mode win detection (all cells must be filled/crossed)
- `playWinAnimation()` - Gold ripple animation on win

**Input Handling (handleInput):**
- **Zen Mode**: Click cycles empty → fill → cross → empty (no correctness checking)
- **Classic Mode**: 
  - Fill mode: click fills cell if correct, marks mistake if wrong
  - Cross mode: click crosses cell if correct, marks mistake if wrong
  - Always reveals correct answer on mistake (fills if should be crossed, crosses if should be filled)

### 2. PuzzleSolver Class (game.js)

An incomplete/backburner feature for validating puzzle uniqueness. Uses recursive backtracking to check if a puzzle has a unique solution.

**Status**: Disabled in current code (never called)

### 3. HTML Structure (index.html)

**Head:**
- Cache-control meta tags to prevent browser caching
- Viewport meta for mobile (with safe-area-inset-bottom support)
- PWA meta tags: mobile-web-app-capable, apple-mobile-web-app-*
- Favicon (inline SVG)
- Manifest link

**Body:**
- Header with title and version display
- Stats bar: difficulty selector, game mode selector, new game button, lives counter
- Game layout: CSS Grid with hints (top/left) and main grid
- Controls footer: mode toggle button, options (auto-cross, highlight)
- Hidden haptic trigger checkbox for iOS 18+

**Inline Scripts:**
1. Version fetcher - reads from manifest.json
2. Service worker registration

### 4. CSS Styling (style.css)

**CSS Variables:**
```css
--bg: #1a1a2e        /* Dark blue background */
--surface: #16213e    /* Slightly lighter surface */
--accent: #e94560     /* Pink/red accent */
--text: #eaeaea       /* Light text */
--empty: #16213e      /* Empty cell */
--filled: #e94560     /* Filled cell */
--crossed: #2a2a4a    /* Crossed cell */
--border: #0f3460     /* Border color */
--grid-line: #4e4e6a /* Grid lines */
```

**Layout:**
- Mobile-first responsive design
- CSS Grid for game layout (2x2: hints + grid)
- Flexbox for controls and stats
- vmin units for responsive grid sizing
- Media queries at 400px, 600px breakpoints

**Cell States:**
- `.cell.filled` - Pink background
- `.cell.crossed` - X character via ::after pseudo-element
- `.cell.error` - Red background with shake animation
- `.cell.win-anim` - Gold background with pop animation
- `.cell.line-complete` - Brightness flash on auto-cross

**Animations:**
- `shake` - 200ms horizontal shake on error
- `lineFlash` - 500ms brightness flash on line completion
- `winPop` - 400ms scale + gold glow on win

### 5. Service Worker (sw.js)

**Caching Strategy:**
- **Network-first** for HTML (index.html) - checks for updates first
- **Cache-first** for assets (CSS, JS, favicon, manifest)

**Cache Management:**
- Versioned cache name: `nonogram-v1.0.0`
- Automatic old cache cleanup on activate
- Includes: index.html, style.css, game.js, manifest.json, favicon.svg

### 6. Web App Manifest (manifest.json)

- Name: "Nonogram Pro"
- Display: standalone (fullscreen PWA)
- Theme color: #e94560
- Background color: #1a1a2e
- Start URL: /nonogram/
- Icon: Inline SVG (same design as favicon)

### 7. E2E Tests (test-e2e.js)

Custom Playwright test runner (not using a test framework).

**Test Coverage (22 tests):**
1. Page loads without errors
2. Zen mode hides lives by default
3. Zen mode hides fill/cross toggle
4. Zen mode hides auto-cross option
5. Zen mode: first click fills cell
6. Zen mode: second click crosses cell
7. Zen mode: third click clears cell
8. Classic mode shows lives
9. Classic mode shows fill/cross toggle
10. Classic mode shows auto-cross option
11. Can solve puzzle
12. Shows "PUZZLE SOLVED!" message
13. Win animation applied to filled cells
14. Mode toggles between FILL and CROSS
15. Version displays
16. New puzzle button resets grid
17. 5x5 grid creates 25 cells
18. 15x15 grid creates 225 cells
19. 20x20 grid creates 400 cells
20. Shows "GAME OVER" after 3 mistakes (skipped)
21. Hints render in header rows
22. Can switch to cross mode (skipped)

**Test Infrastructure:**
- Custom HTTP server on port 8765
- In-process browser launch
- Test runner with assertions
- Force click option for elements potentially blocked by overlays

## Game Modes

### Classic Mode
- Checks correctness on each click
- 3 lives (mistakes allowed)
- Shows correct answer on mistake
- Lives displayed in UI
- Mode toggle visible (fill/cross)
- Auto-cross and highlight options available

### Zen Mode
- No correctness checking
- Click cycles: empty → fill → cross → empty
- Win only checked when all cells filled/crossed
- No lives system
- Lives hidden in UI
- Mode toggle hidden
- Auto-cross and highlight hidden

## PWA Features

### Installation
- Installable on mobile via manifest.json
- Standalone display mode (no browser chrome)
- Theme color matches game accent

### Offline Support
- Service worker caches all assets
- Works offline after first visit
- Network-first for HTML prevents stale content

### Mobile Optimizations
- Touch-action: none on grid prevents scrolling while playing
- Pointer events for drag-fill support
- Safe area insets for notched devices
- User-select disabled to prevent text selection

## Build & Deployment

### GitHub Pages Deployment
- Automatic deployment on push to main
- Pull request previews with /nonogram-pr-{number}/
- Updates manifest.json start_url for preview vs production

### Release Process
- release-please action auto-generates changelog
- Semantic versioning (simple type)
- CHANGELOG.md auto-updated

### Local Development
- No build step required
- Static file server for testing
- E2E tests run against local server

## Unique Features

### Haptic Feedback
- Android: Vibration API (`navigator.vibrate(10)`)
- iOS 18+: Checkbox switch trick (toggles hidden checkbox to trigger haptic)
- Fallback: none for older iOS

### Visual Feedback
- Error shake animation
- Line completion flash
- Win celebration animation (gold ripple)
- Heart-based lives indicator

### Responsive Design
- vmin-based sizing fits any screen
- Dynamic hint sizing for larger grids (15x15, 20x20)
- Font size scaling via clamp()

## Development Practices

### Code Style
- ES6+ (classes, arrow functions, const/let)
- CSS custom properties for theming
- camelCase for JS, kebab-case for CSS
- Conventional commits (feat, fix, docs, test, chore)

### State Management
- Single Engine class manages all state
- Player board separate from solution
- DOM updates via classList manipulation

### Testing
- Playwright for E2E (browser automation)
- No unit tests (simple project)
- Tests run via `npm test`

## Dependencies

### Runtime
- None (vanilla JavaScript)

### Development
- Node.js (via mise)
- Playwright (for E2E testing)

## Known Limitations

1. **No unique solution validation** - PuzzleSolver class exists but is disabled
2. **No undo/redo** - Cannot undo moves
3. **Random puzzles only** - No pre-designed puzzles or emoji generation yet
4. **No statistics** - No tracking of wins/times
5. **iOS haptics require iOS 18+** - Older iOS has no haptic feedback
6. **release-please may fail** - GitHub Actions needs write permissions for PRs

## Future Enhancements (From Plan)

- [ ] Emoji-based puzzle generation (render emoji to canvas, read pixels)
- [ ] Pre-made puzzle library
- [ ] Daily puzzles with streaks
- [ ] Hint system
- [ ] Undo/redo functionality
- [ ] Statistics tracking
- [ ] Multiple color themes
- [ ] Timer for speed runs
- [ ] Save progress to localStorage
