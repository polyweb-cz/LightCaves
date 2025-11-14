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
    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log('[3] Main menu - Clicking START GAME by simulating keyboard');
    // Focus on page first
    await page.focus('body');
    
    // Try to find and click the button directly
    const clickedStart = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      for (let btn of buttons) {
        if (btn.textContent.trim().toUpperCase() === 'START GAME') {
          btn.click();
          return true;
        }
      }
      return false;
    });
    console.log('Start button clicked: ' + clickedStart);

    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log('[4] Level selector - Trying Enter key to select first level');
    await page.keyboard.press('Enter');
    
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('[5] Checking if game started...');
    const isGameRunning = await page.evaluate(() => {
      // Check if we're in game scene by looking for game-related elements
      return document.body.textContent.includes('Moves:') || 
             document.body.textContent.includes('Time:') ||
             document.getElementById('gameCanvas').offsetParent !== null;
    });
    console.log('Game running: ' + isGameRunning);

    console.log('[6] Taking screenshot of game...');
    await page.screenshot({ path: '/tmp/game_in_progress.png', fullPage: true });
    console.log('Screenshot saved');

    const gameScreenText = await page.evaluate(() => document.body.innerText);
    console.log('[7] Game screen content:');
    console.log(gameScreenText);

    // Get canvas info
    const canvasState = await page.evaluate(() => {
      const canvas = document.getElementById('gameCanvas');
      return {
        exists: !!canvas,
        width: canvas?.width,
        height: canvas?.height,
        context: !!canvas?.getContext('2d')
      };
    });
    console.log('\n[8] Canvas state: ' + JSON.stringify(canvasState));

    console.log('\n[9] Testing mirror placement on canvas...');
    await page.mouse.click(400, 300);
    
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('[10] Taking screenshot after canvas click...');
    await page.screenshot({ path: '/tmp/game_after_canvas_click.png', fullPage: true });

    console.log('[11] Recent console logs:');
    consoleLogs.slice(-15).forEach((log, i) => {
      const typeStr = log.type.toUpperCase();
      const idx = consoleLogs.length - 15 + i;
      console.log('  [' + idx + '] ' + typeStr + ': ' + log.text);
    });

    console.log('\n[DONE] Interaction test complete');

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
