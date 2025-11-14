import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  const errors = [];
  const logs = [];
  
  page.on('console', msg => {
    const logType = msg.type();
    logs.push({
      type: logType,
      text: msg.text()
    });
    if (logType === 'error' || logType === 'warning') {
      errors.push('[' + logType.toUpperCase() + '] ' + msg.text());
    }
  });
  
  page.on('pageerror', err => {
    errors.push('[PAGE ERROR] ' + err.toString());
  });
  
  try {
    console.log('Navigating to http://localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2', timeout: 10000 });
    console.log('Page loaded, waiting for initialization...');
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 2000)));
    
    console.log('\n=== PAGE LOAD RESULT ===');
    console.log('Status: SUCCESS');
    
    const canvasExists = await page.evaluate(() => document.getElementById('gameCanvas') !== null);
    const uiRootExists = await page.evaluate(() => document.getElementById('ui-root') !== null);
    
    console.log('\n=== DOM ELEMENTS ===');
    console.log('Canvas element exists: ' + canvasExists);
    console.log('UI Root element exists: ' + uiRootExists);
    
    if (canvasExists) {
      const canvasInfo = await page.evaluate(() => {
        const canvas = document.getElementById('gameCanvas');
        return {
          width: canvas.width,
          height: canvas.height,
          visible: canvas.style.display !== 'none'
        };
      });
      console.log('Canvas dimensions: ' + canvasInfo.width + 'x' + canvasInfo.height);
      console.log('Canvas visible: ' + canvasInfo.visible);
    }
    
    if (uiRootExists) {
      const uiContent = await page.evaluate(() => {
        return document.getElementById('ui-root').innerHTML.length;
      });
      console.log('UI Root has content: ' + (uiContent > 0) + ' (' + uiContent + ' chars)');
    }
    
    console.log('\n=== CONSOLE LOGS ===');
    if (logs.length === 0) {
      console.log('No console messages recorded');
    } else {
      logs.forEach(log => {
        console.log('[' + log.type.toUpperCase() + '] ' + log.text);
      });
    }
    
    console.log('\n=== ERRORS ===');
    if (errors.length === 0) {
      console.log('No errors detected!');
    } else {
      errors.forEach(err => {
        console.log(err);
      });
    }
    
    console.log('\n=== INTERACTION TEST ===');
    try {
      const buttons = await page.evaluate(() => {
        const btns = document.querySelectorAll('button');
        return Array.from(btns).map(btn => ({
          text: btn.textContent,
          visible: btn.offsetParent !== null
        }));
      });
      console.log('Buttons found: ' + buttons.length);
      buttons.forEach(btn => {
        console.log('  - "' + btn.text + '" (visible: ' + btn.visible + ')');
      });
    } catch (e) {
      console.log('Could not query buttons: ' + e.message);
    }
    
  } catch (error) {
    console.log('\n=== ERROR ===');
    console.log('Navigation failed: ' + error.message);
    console.log('Stack: ' + error.stack);
  }
  
  await browser.close();
})();
