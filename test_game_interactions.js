import puppeteer from 'puppeteer';

(async () => {
  let browser;
  try {
    console.log('[1] Launching browser...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Capture console messages
    const consoleLogs = [];
    page.on('console', msg => {
      consoleLogs.push({
        type: msg.type(),
        text: msg.text()
      });
    });

    console.log('[2] Navigating to localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2', timeout: 15000 });
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('[3] Verifying main menu is visible...');
    const hasStartButton = await page.evaluate(() => {
      return document.body.textContent.includes('START GAME');
    });
    console.log('Main menu visible: ' + hasStartButton);

    console.log('\n[4] CLICKING "START GAME" BUTTON...');
    await page.click('button:has-text("START GAME")').catch(async () => {
      // Fallback: find button by text content
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, div[role="button"], [data-action]'));
        const startBtn = buttons.find(btn => btn.textContent.includes('START GAME'));
        if (startBtn) {
          startBtn.click();
          console.log('[Fallback] Clicked START GAME');
        }
      });
    });

    console.log('[5] Waiting for level selector to appear...');
    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log('[6] Taking screenshot of level selector...');
    await page.screenshot({ path: '/tmp/game_level_selector.png', fullPage: true });
    console.log('Screenshot saved');

    const levelSelectorText = await page.evaluate(() => document.body.innerText);
    console.log('[7] Level selector text:');
    console.log(levelSelectorText);

    console.log('\n[8] Looking for level buttons...');
    const hasLevelButtons = await page.evaluate(() => {
      return document.body.textContent.includes('Tutorial') || 
             document.body.textContent.includes('Level');
    });
    console.log('Level buttons found: ' + hasLevelButtons);

    console.log('\n[9] Clicking first level (Tutorial)...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, div[role="button"], [data-action]'));
      const tutorialBtn = buttons.find(btn => btn.textContent.includes('Tutorial'));
      if (tutorialBtn) {
        tutorialBtn.click();
        console.log('[Game] Clicked Tutorial');
      }
    });

    console.log('[10] Waiting for game to load...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('[11] Taking screenshot of game...');
    await page.screenshot({ path: '/tmp/game_gameplay.png', fullPage: true });
    console.log('Screenshot saved');

    const gameText = await page.evaluate(() => document.body.innerText);
    console.log('[12] Game screen text:');
    console.log(gameText);

    console.log('\n[13] Checking if game canvas has rendered...');
    const canvasInfo = await page.evaluate(() => {
      const canvas = document.getElementById('gameCanvas');
      if (!canvas) return 'Canvas not found';
      return {
        width: canvas.width,
        height: canvas.height,
        visible: canvas.offsetParent !== null
      };
    });
    console.log('Canvas info: ' + JSON.stringify(canvasInfo));

    console.log('\n[14] Trying to click on game canvas to place a mirror...');
    const canvasRect = await page.evaluate(() => {
      const canvas = document.getElementById('gameCanvas');
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      return {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
      };
    });

    if (canvasRect) {
      console.log('Canvas position: ' + JSON.stringify(canvasRect));
      const clickX = canvasRect.x + canvasRect.width / 3;
      const clickY = canvasRect.y + canvasRect.height / 2;
      console.log('Clicking at canvas coords: ' + clickX + ', ' + clickY);
      await page.mouse.click(clickX, clickY);
      
      console.log('[15] Waiting after click...');
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('[16] Taking screenshot after clicking...');
      await page.screenshot({ path: '/tmp/game_after_click.png', fullPage: true });
      console.log('Screenshot saved');

      console.log('[17] Checking mirror was placed...');
      const mirrorPlaced = await page.evaluate(() => {
        // Check if we can find evidence of a mirror in the game state
        return document.body.innerText.substring(0, 500);
      });
      console.log('Game state after click:');
      console.log(mirrorPlaced);
    }

    console.log('\n[18] Console logs during gameplay:');
    consoleLogs.slice(15).forEach((log, i) => {
      const typeStr = log.type.toUpperCase();
      console.log('  [' + (15 + i) + '] ' + typeStr + ': ' + log.text);
    });

    console.log('\n[DONE] All tests complete!');

  } catch (error) {
    console.error('[ERROR]', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();
