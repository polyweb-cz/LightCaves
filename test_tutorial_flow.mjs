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
      text: text,
      timestamp: new Date().toISOString()
    });
    console.log(`[${msgType.toUpperCase()}] ${text}`);

    if (msgType === 'error') {
      consoleErrors.push(text);
    }
  });

  const wait = (ms) => new Promise(r => setTimeout(r, ms));

  try {
    console.log('\n====== TESTING TUTORIAL FLOW ======\n');

    // Step 1: Navigate
    console.log('1. Navigating to http://localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2', timeout: 10000 });
    await wait(2000);

    // Step 2: Click START GAME
    console.log('\n2. Clicking START GAME...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent.includes('START GAME') || b.textContent.includes('Start Game'));
      if (btn) btn.click();
    });
    await wait(1500);

    // Step 3: Use keyboard to select Tutorial and start it
    console.log('\n3. Using arrow keys and Enter to select Tutorial...');
    await page.keyboard.press('Enter'); // Should select first item (Tutorial)
    await wait(2500);

    // Step 4: Check game state
    console.log('\n4. Checking game state after Tutorial starts...');
    const gameState = await page.evaluate(() => {
      const menuOverlay = document.querySelector('[class*="MainMenu"]') || document.getElementById('menu-overlay');
      return {
        canvasVisible: !!(document.getElementById('gameCanvas')?.offsetParent),
        hasMenuOverlay: !!menuOverlay,
        menuOverlayVisible: menuOverlay ? window.getComputedStyle(menuOverlay).display !== 'none' : false,
        bodyText: document.body.innerText.substring(0, 150)
      };
    });
    console.log('   Canvas visible:', gameState.canvasVisible);
    console.log('   Menu overlay present:', gameState.hasMenuOverlay);
    console.log('   Menu overlay visible:', gameState.menuOverlayVisible);

    // Step 5: Take screenshot
    console.log('\n5. Taking screenshot of Tutorial...');
    await page.screenshot({ path: '/home/steinbauer/PhpstormProjects/LightCaves/test-tutorial-flow.png', fullPage: true });
    console.log('   Screenshot saved to test-tutorial-flow.png');

    // Step 6: Save logs
    console.log('\n6. Saving all console logs...');
    fs.writeFileSync(
      '/home/steinbauer/PhpstormProjects/LightCaves/tutorial-flow-logs.json',
      JSON.stringify(consoleLogs, null, 2)
    );
    console.log('   Logs saved to tutorial-flow-logs.json');

    // Summary
    console.log('\n====== SUMMARY ======');
    console.log(`Total console messages: ${consoleLogs.length}`);
    console.log(`Console errors: ${consoleErrors.length}`);

    // Look for specific hideMenu logs
    const hideMenuLogs = consoleLogs.filter(log => log.text.includes('hideMenu'));
    console.log(`\nhideMenu() related logs: ${hideMenuLogs.length}`);
    hideMenuLogs.forEach(log => {
      console.log(`  - ${log.text}`);
    });

    // Look for isVisible mentions
    const isVisibleLogs = consoleLogs.filter(log => log.text.includes('isVisible'));
    console.log(`\nisVisible related logs: ${isVisibleLogs.length}`);
    isVisibleLogs.forEach(log => {
      console.log(`  - ${log.text}`);
    });

    // Look for menu visibility mentions
    const menuLogs = consoleLogs.filter(log =>
      log.text.includes('Menu') || log.text.includes('menu') || log.text.includes('Removing')
    );
    console.log(`\nMenu related logs: ${menuLogs.length}`);
    menuLogs.forEach(log => {
      console.log(`  - ${log.text}`);
    });

  } catch (error) {
    console.error('Test error:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
})();
