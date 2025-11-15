import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  page.setViewport({ width: 1024, height: 768 });

  const consoleLogs = [];
  const consoleErrors = [];

  // Capture ALL console messages
  page.on('console', msg => {
    const text = msg.text();
    const msgType = msg.type();
    consoleLogs.push({
      type: msgType,
      text: text
    });
    console.log(`[${msgType.toUpperCase()}] ${text}`);

    if (msgType === 'error') {
      consoleErrors.push(text);
    }
  });

  const wait = (ms) => new Promise(r => setTimeout(r, ms));

  try {
    console.log('\n====== STARTING TEST ======\n');

    // Step 1: Navigate to the game
    console.log('1. Navigating to http://localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2', timeout: 10000 });
    await wait(1000);

    console.log('\n2. Waiting for menu to render...');
    await wait(1000);

    // Step 2: Click START GAME
    console.log('\n3. Looking for START GAME button...');
    const startGameFound = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent.includes('START GAME') || b.textContent.includes('Start Game'));
      console.log('[EVALUATE] Found button:', btn?.textContent);
      return !!btn;
    });

    if (startGameFound) {
      console.log('   START GAME button found, clicking...');
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const btn = buttons.find(b => b.textContent.includes('START GAME') || b.textContent.includes('Start Game'));
        if (btn) btn.click();
      });
      await wait(1500);
    } else {
      console.log('   ERROR: START GAME button not found');
    }

    // Step 3: Find and click Tutorial
    console.log('\n4. Looking for Tutorial level button...');
    const tutorialFound = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent.includes('Tutorial'));
      console.log('[EVALUATE] Found tutorial button:', btn?.textContent);
      return !!btn;
    });

    if (tutorialFound) {
      console.log('   Tutorial button found, clicking...');
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const btn = buttons.find(b => b.textContent.includes('Tutorial'));
        if (btn) btn.click();
      });
      await wait(2000);
    } else {
      console.log('   ERROR: Tutorial button not found');
    }

    // Step 4: Check current state
    console.log('\n5. Checking current game state...');
    const gameState = await page.evaluate(() => {
      return {
        hasCanvas: !!document.getElementById('gameCanvas'),
        canvasVisible: !!(document.getElementById('gameCanvas')?.offsetParent),
        hasMenuOverlay: !!document.querySelector('[class*="menu"], [id*="menu"]'),
        bodyText: document.body.innerText.substring(0, 200)
      };
    });
    console.log('   Canvas visible:', gameState.canvasVisible);
    console.log('   Body text:', gameState.bodyText);

    // Step 5: Take screenshots
    console.log('\n6. Taking screenshot after menu operations...');
    await page.screenshot({ path: '/home/steinbauer/PhpstormProjects/LightCaves/test-console-logs.png', fullPage: true });
    console.log('   Screenshot saved to test-console-logs.png');

    // Save all console logs
    console.log('\n7. Saving console logs...');
    fs.writeFileSync(
      '/home/steinbauer/PhpstormProjects/LightCaves/console-logs.json',
      JSON.stringify(consoleLogs, null, 2)
    );
    console.log('   Console logs saved to console-logs.json');

    // Summary
    console.log('\n====== TEST SUMMARY ======');
    console.log(`Total console messages: ${consoleLogs.length}`);
    console.log(`Console errors: ${consoleErrors.length}`);

    console.log('\nAll console logs captured:');
    consoleLogs.forEach((log, idx) => {
      console.log(`  [${idx}] ${log.type}: ${log.text}`);
    });

    if (consoleErrors.length > 0) {
      console.log('\nErrors found:');
      consoleErrors.forEach(err => console.log(`  - ${err}`));
    }

  } catch (error) {
    console.error('Test error:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
})();
