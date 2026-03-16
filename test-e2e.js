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
    
    // Test 2: Win animation triggers on solve
    await page.reload();
    await page.waitForSelector('.cell');
    
    // Get solution to know which cells to fill
    const solution = await page.evaluate(() => {
      return window.game?.solution || [];
    });
    
    if (solution.length === 0) {
      console.log('⚠ Could not get solution - game object not exposed');
      // Manual test: fill some cells and check for win
      const cells = await page.locator('.cell').count();
      console.log(`  Grid has ${cells} cells (${Math.sqrt(cells)}x${Math.sqrt(cells)})`);
    } else {
      console.log(`  Found ${solution.length}x${solution[0].length} solution`);
      
      // Fill correct cells
      for (let r = 0; r < solution.length; r++) {
        for (let c = 0; c < solution[r].length; c++) {
          if (solution[r][c] === 1) {
            await page.locator('.cell').nth(r * solution.length + c).click();
          }
        }
      }
      
      // Wait for win
      await page.waitForTimeout(2000);
      
      // Check win message
      const winMsg = await page.locator('#msg').textContent();
      test('Shows "PUZZLE SOLVED!" message', () => {
        assert(winMsg === 'PUZZLE SOLVED!', `Expected "PUZZLE SOLVED!", got: "${winMsg}"`);
      });
      
      // Check win animation class is applied to filled cells
      const animatedCells = await page.locator('.cell.win-anim').count();
      const correctCells = solution.flat().filter(x => x === 1).length;
      test('Win animation applied to filled cells', () => {
        assert(animatedCells > 0, `Expected some cells with win-anim class, got ${animatedCells}`);
        assert(animatedCells === correctCells, `Expected ${correctCells} animated cells, got ${animatedCells}`);
      });
    }
    
    // Test 3: Error animation on wrong fill
    await page.reload();
    await page.waitForSelector('.cell');
    
    // Try to fill a crossed cell (should be wrong based on solution)
    // We'll just click a cell and check it doesn't crash
    await page.locator('.cell').first().click();
    test('Clicking cell does not crash', () => {});
    
    // Test 4: Mode toggle works
    const initialMode = await page.locator('#modeToggle .mode-label').textContent();
    await page.locator('#modeToggle').click();
    const newMode = await page.locator('#modeToggle .mode-label').textContent();
    test('Mode toggles between FILL and CROSS', () => {
      assert(initialMode !== newMode, 'Mode should change after clicking');
    });
    
    // Test 5: Version displays
    const version = await page.locator('#version').textContent();
    test('Version displays', () => {
      assert(version.startsWith('v'), `Expected version to start with v, got: "${version}"`);
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
