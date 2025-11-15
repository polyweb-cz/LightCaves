import puppeteer from 'puppeteer';

(async () => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1024, height: 768 });

    // Step 1: Load main menu
    console.log('Step 1: Loading main menu...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2', timeout: 10000 });
    await page.screenshot({ path: '/tmp/step1_menu.png' });
    console.log('Screenshot 1 saved');

    // Step 2: Click START GAME button
    console.log('\nStep 2: Clicking START GAME button...');
    try {
      await page.click('#menu-btn-start', { timeout: 3000 });
      console.log('Clicked button with ID menu-btn-start');
    } catch (e) {
      console.log('Could not find button by ID:', e.message);
    }

    await page.evaluate(() => new Promise(r => setTimeout(r, 1500)));
    await page.screenshot({ path: '/tmp/step2_level_selector.png' });
    console.log('Screenshot 2 saved');

    // Step 3: Click Tutorial level by clicking its div element
    console.log('\nStep 3: Clicking Tutorial level...');
    try {
      // Use evaluate to find and click the Tutorial level
      const clicked = await page.evaluate(() => {
        const levelElements = document.querySelectorAll('[data-level-id]');
        let tutorialFound = false;

        for (const el of levelElements) {
          if (el.textContent.includes('Tutorial: The Basics')) {
            console.log('Found Tutorial level element');
            el.click();
            tutorialFound = true;
            break;
          }
        }

        if (!tutorialFound && levelElements.length > 0) {
          console.log('Tutorial not found, clicking first level');
          levelElements[0].click();
        }

        return tutorialFound;
      });

      console.log(`Tutorial clicked: ${clicked}`);
    } catch (e) {
      console.log('Error clicking level:', e.message);
    }

    await page.evaluate(() => new Promise(r => setTimeout(r, 2500)));
    await page.screenshot({ path: '/tmp/step3_game_screen.png' });
    console.log('Screenshot 3 saved');

    // Step 4: Detailed game state analysis
    console.log('\nStep 4: Analyzing game state...');
    const gameState = await page.evaluate(() => {
      const canvas = document.getElementById('gameCanvas');
      const mainMenu = document.getElementById('main-menu');
      const levelSelector = document.getElementById('level-selector');

      // Check visible elements
      const buttons = Array.from(document.querySelectorAll('button'));
      const buttonTexts = buttons.map(b => b.textContent.trim()).filter(t => t);

      // Detailed state check
      const pageText = document.body.textContent;

      return {
        canvasExists: !!canvas,
        canvasSize: canvas ? { width: canvas.width, height: canvas.height } : null,
        mainMenuVisible: mainMenu && mainMenu.offsetParent !== null,
        levelSelectorVisible: levelSelector && levelSelector.offsetParent !== null,
        visibleButtons: buttonTexts,
        hasUNDO: pageText.includes('UNDO'),
        hasREDO: pageText.includes('REDO'),
        hasRESET: pageText.includes('RESET'),
        hasMENU: pageText.includes('MENU'),
        hasLamp: pageText.includes(''),
        hasTarget: pageText.includes(''),
        gameCanvasRendering: canvas ? canvas.width > 0 && canvas.height > 0 : false
      };
    });

    console.log('Game state:', JSON.stringify(gameState, null, 2));

    // Step 5: Try clicking on a game cell
    console.log('\nStep 5: Attempting to click on a game cell...');
    try {
      const canvas = await page.$('#gameCanvas');
      if (canvas) {
        const box = await canvas.boundingBox();
        if (box) {
          // Click in the middle of the canvas
          await page.click('#gameCanvas', {
            offset: {
              x: Math.floor(box.width / 3),
              y: Math.floor(box.height / 3)
            }
          });
          console.log('Clicked canvas at offset');
        }
      }
    } catch (e) {
      console.log('Error clicking canvas:', e.message);
    }

    await page.evaluate(() => new Promise(r => setTimeout(r, 500)));
    await page.screenshot({ path: '/tmp/step5_after_click.png' });
    console.log('Screenshot 5 saved');

    console.log('\nAll screenshots captured successfully!');
  } catch (error) {
    console.error('Fatal error:', error.message);
    console.error(error.stack);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();
