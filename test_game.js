const puppeteer = require('puppeteer');

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
    console.log('Screenshot 1 saved: /tmp/step1_menu.png');

    // Step 2: Click START GAME
    console.log('\nStep 2: Clicking START GAME...');
    await page.click('button:has-text("START GAME")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/tmp/step2_level_selector.png' });
    console.log('Screenshot 2 saved: /tmp/step2_level_selector.png');

    // Step 3: Click Tutorial level
    console.log('\nStep 3: Clicking Tutorial level...');
    const buttons = await page.$$eval('button', buttons => 
      buttons.map(b => ({ text: b.textContent, html: b.outerHTML.substring(0, 100) }))
    );
    console.log('Available buttons:', buttons);

    // Try to find and click tutorial button
    const tutorialButton = await page.$('button');
    if (tutorialButton) {
      const text = await page.evaluate(el => el.textContent, tutorialButton);
      console.log('First button text:', text);
    }

    // Click the first level button in the list
    await page.click('button:nth-of-type(1)');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/tmp/step3_game_screen.png' });
    console.log('Screenshot 3 saved: /tmp/step3_game_screen.png');

    // Step 4: Analyze game state
    console.log('\nStep 4: Analyzing game state...');
    const gameState = await page.evaluate(() => {
      const canvas = document.getElementById('gameCanvas');
      const uiRoot = document.getElementById('ui-root');
      
      return {
        canvasExists: !!canvas,
        canvasSize: canvas ? { width: canvas.width, height: canvas.height } : null,
        uiRootExists: !!uiRoot,
        bodyClasses: document.body.className,
        allDivs: document.querySelectorAll('div').length,
        allButtons: document.querySelectorAll('button').length
      };
    });

    console.log('Game state:', JSON.stringify(gameState, null, 2));

    // Step 5: Try clicking on a cell
    console.log('\nStep 5: Attempting to click on a game cell...');
    const canvasElement = await page.$('#gameCanvas');
    if (canvasElement) {
      const boundingBox = await canvasElement.boundingBox();
      if (boundingBox) {
        const clickX = boundingBox.x + boundingBox.width / 3;
        const clickY = boundingBox.y + boundingBox.height / 3;
        console.log(`Clicking at (${clickX}, ${clickY})`);
        await page.click('#gameCanvas', { offset: { x: 50, y: 50 } });
        await page.waitForTimeout(500);
        await page.screenshot({ path: '/tmp/step5_after_click.png' });
        console.log('Screenshot 5 saved: /tmp/step5_after_click.png');
      }
    }

    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error during test:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();
