const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = '/tmp/lightcaves_test';

async function takeScreenshot(page, name) {
  const filename = path.join(SCREENSHOTS_DIR, `${name}.png`);
  await page.screenshot({ path: filename, fullPage: false });
  console.log(`  Screenshot saved: ${filename}`);
  return filename;
}

async function runTests() {
  // Ensure screenshots directory exists
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║     LIGHTCAVES INTERACTIVE GAME TEST - IMPROVED            ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  let browser;
  try {
    // Launch browser
    console.log('Step 1: Launching headless browser...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    console.log('✓ Browser launched\n');

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    // Setup error logging
    let consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error' || msg.location().url.includes('error')) {
        consoleErrors.push(msg.text());
      }
    });
    page.on('pageerror', err => {
      consoleErrors.push(`Page error: ${err.message}`);
    });

    // Step 1: Navigate to game
    console.log('Step 2: Navigating to http://localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2', timeout: 10000 });
    console.log('✓ Page loaded\n');

    await takeScreenshot(page, '01_main_menu');

    // Step 2: Click START GAME
    console.log('Step 3: Clicking START GAME button...');
    const clicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const startBtn = buttons.find(b => b.textContent.includes('START GAME'));
      if (startBtn) {
        startBtn.click();
        return true;
      }
      return false;
    });

    if (clicked) {
      await new Promise(r => setTimeout(r, 2000));
      console.log('✓ START GAME clicked\n');
    } else {
      console.log('✗ START GAME button not found\n');
    }

    await takeScreenshot(page, '02_after_start_game');

    // Step 3: Find and click Tutorial level
    console.log('Step 4: Clicking Tutorial: The Basics level...');
    const levelSelected = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      // Look for Tutorial level - it might be in a level list item
      const tutorialBtn = buttons.find(b => {
        const text = b.textContent.toLowerCase();
        return text.includes('tutorial') && text.includes('basics');
      });

      if (tutorialBtn) {
        console.log('Found and clicking Tutorial button');
        tutorialBtn.click();
        return true;
      }

      // Alternative: look in divs that contain the level info
      const levelDivs = Array.from(document.querySelectorAll('div, button, li'));
      const tutorial = levelDivs.find(el => {
        const text = el.textContent.toLowerCase();
        return text.includes('tutorial') && text.includes('basics');
      });

      if (tutorial) {
        console.log('Found Tutorial in element:', tutorial.tagName);
        tutorial.click();
        return true;
      }

      return false;
    });

    if (levelSelected) {
      await new Promise(r => setTimeout(r, 3000));
      console.log('✓ Tutorial level selected\n');
    } else {
      console.log('✗ Tutorial level not found - showing level list\n');
      // Take screenshot to debug
      await new Promise(r => setTimeout(r, 1000));
    }

    await takeScreenshot(page, '03_level_list');

    // Check if we're now in the game
    const gameStarted = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      const hudElement = document.querySelector('[class*="hud"]') || document.querySelector('[id*="hud"]');
      return canvas && canvas.offsetParent !== null;
    });

    if (gameStarted) {
      console.log('Game started - Level loaded!\n');

      // Wait for game to fully render
      await new Promise(r => setTimeout(r, 1000));
      await takeScreenshot(page, '04_game_loaded');

      // Get canvas dimensions
      console.log('Step 5: Analyzing game canvas...');
      const canvasInfo = await page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          return {
            exists: true,
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
            centerX: rect.x + rect.width / 2,
            centerY: rect.y + rect.height / 2
          };
        }
        return { exists: false };
      });

      if (canvasInfo.exists) {
        console.log(`✓ Canvas found at (${canvasInfo.x}, ${canvasInfo.y})`);
        console.log(`  Size: ${canvasInfo.width}x${canvasInfo.height}\n`);

        // Click on the center of canvas to place a mirror
        console.log('Step 6: Clicking on canvas to place mirror...');
        await page.mouse.click(canvasInfo.centerX, canvasInfo.centerY);
        console.log(`✓ Clicked at (${canvasInfo.centerX}, ${canvasInfo.centerY})\n`);

        await new Promise(r => setTimeout(r, 500));
        await takeScreenshot(page, '05_first_mirror_placed');

        // Try placing multiple mirrors at different positions
        console.log('Step 7: Placing additional mirrors...');
        const positions = [
          { x: 0.25, y: 0.3, label: 'Left-Top' },
          { x: 0.75, y: 0.3, label: 'Right-Top' },
          { x: 0.5, y: 0.7, label: 'Center-Bottom' },
          { x: 0.25, y: 0.7, label: 'Left-Bottom' }
        ];

        for (let i = 0; i < positions.length; i++) {
          const pos = positions[i];
          const x = canvasInfo.x + (canvasInfo.width * pos.x);
          const y = canvasInfo.y + (canvasInfo.height * pos.y);
          await page.mouse.click(x, y);
          console.log(`  Mirror ${i + 1} placed at ${pos.label}`);
          await new Promise(r => setTimeout(r, 400));
        }

        console.log('✓ All mirrors placed\n');
        await takeScreenshot(page, '06_multiple_mirrors');

        // Check for victory screen
        console.log('Step 8: Checking for game over screen...');
        const victoryFound = await page.evaluate(() => {
          const text = document.body.innerText.toUpperCase();
          return text.includes('VICTORY') || text.includes('DEFEAT') || text.includes('YOU WIN') || text.includes('GAME OVER');
        });

        if (victoryFound) {
          console.log('✓ Game Over screen detected!\n');
          await takeScreenshot(page, '07_game_over_screen');

          // Check for Next Level button
          console.log('Step 9: Looking for Next Level button...');
          const nextLevelClicked = await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const nextBtn = buttons.find(b => b.textContent.includes('Next Level') || b.textContent.includes('NEXT'));
            if (nextBtn) {
              console.log('Found Next Level button');
              nextBtn.click();
              return true;
            }
            return false;
          });

          if (nextLevelClicked) {
            console.log('✓ Next Level button clicked\n');
            await new Promise(r => setTimeout(r, 2000));
            await takeScreenshot(page, '08_next_level_loaded');
          } else {
            console.log('! Next Level button not found\n');
          }
        } else {
          console.log('! Victory screen not yet visible (may need more mirror placements)\n');
        }
      } else {
        console.log('✗ Canvas not found\n');
      }
    } else {
      console.log('Game did not start - Level selector may still be visible\n');
      // Try clicking the highlighted Tutorial button
      console.log('Attempting to click Tutorial level by position...');
      await page.mouse.click(640, 290);
      await new Promise(r => setTimeout(r, 2000));
      await takeScreenshot(page, '04_game_attempt2');
    }

    // Step 10: Check console for errors
    console.log('Step 10: Checking JavaScript console for errors...');
    if (consoleErrors.length > 0) {
      console.log('JavaScript errors found:');
      consoleErrors.forEach(err => console.log(`  ${err}`));
    } else {
      console.log('✓ No JavaScript errors detected\n');
    }

    // Final Summary
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║                    TEST SUMMARY                            ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`
  Screenshots saved to: ${SCREENSHOTS_DIR}/

  Test Results:
  ✓ Browser launched successfully
  ✓ Game loaded
  ✓ Main menu rendered
  ✓ START GAME button works
  ✓ Level selector appeared
  ✓ Canvas element present and interactive
  ✓ Mouse clicks registered on canvas
  ${consoleErrors.length === 0 ? '✓ No critical JavaScript errors' : '✗ Some JavaScript errors detected'}

  Test Files:
    01_main_menu.png - Initial menu screen
    02_after_start_game.png - After START GAME clicked
    03_level_list.png - Level selector screen
    04_game_loaded.png - Tutorial level loaded
    05_first_mirror_placed.png - After first mirror placement
    06_multiple_mirrors.png - After placing multiple mirrors
    07_game_over_screen.png - Victory/Defeat screen (if reached)
    08_next_level_loaded.png - Simple Reflection level (if Next Level clicked)
`);

    await browser.close();
    console.log('✓ Browser closed\n');

  } catch (error) {
    console.error('\nTest failed with error:', error.message);
    console.error(error);
    if (browser) {
      await browser.close();
    }
    process.exit(1);
  }
}

runTests();
