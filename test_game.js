import puppeteer from 'puppeteer';

(async () => {
  let browser;
  try {
    console.log('[1] Launching browser...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    console.log('[2] Opening page...');
    const page = await browser.newPage();

    // Capture console messages
    const consoleLogs = [];
    page.on('console', msg => {
      consoleLogs.push({
        type: msg.type(),
        text: msg.text()
      });
    });

    console.log('[3] Navigating to localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2', timeout: 15000 });

    console.log('[4] Waiting for page to load...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('[5] Taking screenshot...');
    await page.screenshot({ path: '/tmp/game_screenshot.png', fullPage: true });
    console.log('Screenshot saved to /tmp/game_screenshot.png');

    console.log('[6] Getting page title...');
    const title = await page.title();
    console.log('Page title: ' + title);

    console.log('[7] Checking DOM elements...');
    const hasCanvas = await page.evaluate(() => !!document.getElementById('gameCanvas'));
    const hasUIRoot = await page.evaluate(() => !!document.getElementById('ui-root'));

    console.log('Has canvas: ' + hasCanvas);
    console.log('Has ui-root: ' + hasUIRoot);

    console.log('[8] Checking for main menu...');
    const mainMenuExists = await page.evaluate(() => {
      return document.body.textContent.includes('Start Game');
    });
    console.log('Main menu visible (Start Game button): ' + mainMenuExists);

    console.log('[9] Getting all visible text...');
    const allText = await page.evaluate(() => document.body.innerText);
    console.log('Page text:');
    console.log(allText);

    console.log('\n[10] Console logs (' + consoleLogs.length + ' messages):');
    consoleLogs.slice(0, 20).forEach((log, i) => {
      const typeStr = log.type.toUpperCase();
      console.log('  [' + i + '] ' + typeStr + ': ' + log.text);
    });

    // Check for JavaScript errors
    console.log('\n[11] Checking for errors...');
    const jsErrors = await page.evaluate(() => {
      return window.__errors || [];
    });
    console.log('JS Errors: ' + JSON.stringify(jsErrors));

    console.log('\n[DONE] Test complete');

  } catch (error) {
    console.error('[ERROR]', error.message);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();
