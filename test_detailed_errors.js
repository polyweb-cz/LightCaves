import puppeteer from 'puppeteer';

(async () => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Capture response errors
    const failedRequests = [];
    page.on('response', response => {
      if (!response.ok() && response.status() !== 304) {
        failedRequests.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        });
      }
    });

    // Capture all logs
    const allLogs = [];
    page.on('console', msg => {
      allLogs.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location()
      });
    });

    console.log('Loading page...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2', timeout: 15000 });
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('\nFailed HTTP Requests:');
    console.log('---------------------');
    if (failedRequests.length === 0) {
      console.log('None');
    } else {
      failedRequests.forEach(req => {
        console.log('URL: ' + req.url);
        console.log('Status: ' + req.status + ' ' + req.statusText);
        console.log('---');
      });
    }

    console.log('\nAll Console Messages:');
    console.log('---------------------');
    allLogs.forEach((log, i) => {
      const type = log.type.toUpperCase().padEnd(5);
      console.log('[' + i + '] ' + type + ': ' + log.text.substring(0, 100));
    });

    console.log('\n\nDetailed Game State:');
    console.log('-------------------');
    const gameState = await page.evaluate(() => {
      return {
        hasCanvas: !!document.getElementById('gameCanvas'),
        hasUIRoot: !!document.getElementById('ui-root'),
        visibleText: document.body.innerText.substring(0, 300),
        allButtonsText: Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim()),
        domElementCount: document.querySelectorAll('*').length
      };
    });

    console.log('Canvas exists: ' + gameState.hasCanvas);
    console.log('UI root exists: ' + gameState.hasUIRoot);
    console.log('Total DOM elements: ' + gameState.domElementCount);
    console.log('Buttons found: ' + gameState.allButtonsText.join(', '));
    console.log('Visible text:\n' + gameState.visibleText);

  } catch (error) {
    console.error('ERROR:', error.message);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();
