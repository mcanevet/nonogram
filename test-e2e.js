const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8765;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
};

function startServer(dir) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let filePath = path.join(dir, req.url === '/' ? 'index.html' : req.url);
      const ext = path.extname(filePath);
      const contentType = MIME_TYPES[ext] || 'text/plain';
      
      fs.readFile(filePath, (err, content) => {
        if (err) {
          res.writeHead(404);
          res.end('Not found');
        } else {
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content);
        }
      });
    });
    server.listen(PORT, () => resolve(server));
  });
}

async function runTests() {
  const server = await startServer('.');
  console.log(`Server started on http://localhost:${PORT}`);
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  let passed = 0;
  let failed = 0;
  
  function test(name, fn) {
    try {
      fn();
      console.log(`✓ ${name}`);
      passed++;
    } catch (e) {
      console.log(`✗ ${name}: ${e.message}`);
      failed++;
    }
  }
  
  function assert(condition, msg) {
    if (!condition) throw new Error(msg || 'Assertion failed');
  }
  
  try {
    // Test 1: Page loads
    await page.goto(`http://localhost:${PORT}`);
    const title = await page.title();
    test('Page loads without errors', () => {
      assert(title.includes('Nonogram'), `Expected title to include Nonogram, got: ${title}`);
    });
    
    // Test 2: Default mode is Zen (lives hidden)
    const livesDisplay = await page.locator('#livesContainer').evaluate(el => getComputedStyle(el).display);
    test('Zen mode hides lives by default', () => {
      assert(livesDisplay === 'none', `Expected lives to be hidden, got: ${livesDisplay}`);
    });
    
    // Test 3: Zen mode hides mode toggle
    const modeToggleDisplay = await page.locator('#modeToggle').evaluate(el => getComputedStyle(el).display);
    test('Zen mode hides fill/cross toggle', () => {
      assert(modeToggleDisplay === 'none', `Expected mode toggle to be hidden, got: ${modeToggleDisplay}`);
    });
    
    // Test 4: Zen mode hides auto-cross option
    const autoCrossLabel = page.locator('label:has(#autoCross)');
    const autoCrossDisplay = await autoCrossLabel.evaluate(el => getComputedStyle(el).display);
    test('Zen mode hides auto-cross option', () => {
      assert(autoCrossDisplay === 'none', `Expected auto-cross to be hidden, got: ${autoCrossDisplay}`);
    });
    
    // Test 5: Zen mode click cycles through states
    await page.reload();
    await page.waitForSelector('.cell');
    
    const firstCell = page.locator('.cell').first();
    
    // First click: empty -> fill
    await firstCell.click({ force: true });
    const cellClass1 = await firstCell.getAttribute('class');
    test('Zen mode: first click fills cell', () => {
      assert(cellClass1.includes('filled'), `Expected filled class, got: ${cellClass1}`);
    });
    
    // Second click: fill -> cross
    await firstCell.click({ force: true });
    const cellClass2 = await firstCell.getAttribute('class');
    test('Zen mode: second click crosses cell', () => {
      assert(cellClass2.includes('crossed'), `Expected crossed class, got: ${cellClass2}`);
    });
    
    // Third click: cross -> empty
    await firstCell.click({ force: true });
    const cellClass3 = await firstCell.getAttribute('class');
    test('Zen mode: third click clears cell', () => {
      assert(!cellClass3.includes('filled') && !cellClass3.includes('crossed'), `Expected empty, got: ${cellClass3}`);
    });
    
    // Test 6: Classic mode shows lives
    await page.locator('#gameMode').selectOption('classic');
    await page.locator('#newGame').click();
    await page.waitForTimeout(500);
    
    const classicLivesDisplay = await page.locator('#livesContainer').evaluate(el => getComputedStyle(el).display);
    test('Classic mode shows lives', () => {
      assert(classicLivesDisplay === 'block', `Expected lives to be shown, got: ${classicLivesDisplay}`);
    });
    
    // Test 7: Classic mode shows mode toggle
    const classicModeToggleDisplay = await page.locator('#modeToggle').evaluate(el => getComputedStyle(el).display);
    test('Classic mode shows fill/cross toggle', () => {
      assert(classicModeToggleDisplay === 'flex', `Expected mode toggle to be shown, got: ${classicModeToggleDisplay}`);
    });
    
    // Test 8: Classic mode shows auto-cross option
    const classicAutoCrossDisplay = await page.locator('label:has(#autoCross)').evaluate(el => getComputedStyle(el).display);
    test('Classic mode shows auto-cross option', () => {
      assert(classicAutoCrossDisplay === 'flex', `Expected auto-cross to be shown, got: ${classicAutoCrossDisplay}`);
    });
    
    // Test 9: Win animation triggers on solve (classic mode)
    const solution = await page.evaluate(() => window.game?.solution || []);
    if (solution.length > 0) {
      console.log(`  Testing win on ${solution.length}x${solution[0].length} solution`);
      
      for (let r = 0; r < solution.length; r++) {
        for (let c = 0; c < solution[r].length; c++) {
          if (solution[r][c] === 1) {
            await page.locator('.cell').nth(r * solution.length + c).click({ force: true });
          }
        }
      }
      
      await page.waitForTimeout(2000);
      
      const winMsg = await page.locator('#msg').textContent();
      test('Shows "PUZZLE SOLVED!" message', () => {
        assert(winMsg === 'PUZZLE SOLVED!', `Expected "PUZZLE SOLVED!", got: "${winMsg}"`);
      });
      
      const animatedCells = await page.locator('.cell.win-anim').count();
      const correctCells = solution.flat().filter(x => x === 1).length;
      test('Win animation applied to filled cells', () => {
        assert(animatedCells === correctCells, `Expected ${correctCells} animated cells, got ${animatedCells}`);
      });
    }
    
    // Test 10: Mode toggle works in classic mode
    const initialMode = await page.locator('#modeToggle .mode-label').textContent();
    await page.locator('#modeToggle').click();
    const newMode = await page.locator('#modeToggle .mode-label').textContent();
    test('Mode toggles between FILL and CROSS', () => {
      assert(initialMode !== newMode, 'Mode should change after clicking');
    });
    
    // Test 11: Version displays
    const version = await page.locator('#version').textContent();
    test('Version displays', () => {
      assert(version.startsWith('v'), `Expected version to start with v, got: "${version}"`);
    });
    
    // Test 12: New puzzle button works
    await page.locator('#newGame').click();
    await page.waitForTimeout(500);
    const gridCells = await page.locator('.cell').count();
    test('New puzzle button resets grid', () => {
      assert(gridCells === 100, `Expected 100 cells for 10x10, got: ${gridCells}`);
    });
    
  } catch (e) {
    console.log(`Test error: ${e.message}`);
    failed++;
  }
  
  await browser.close();
  server.close();
  
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
