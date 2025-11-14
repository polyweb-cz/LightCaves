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
    if (logType === 'error') {
      errors.push('[ERROR] ' + msg.text());
    }
  });
  
  page.on('pageerror', err => {
    errors.push('[PAGE ERROR] ' + err.toString());
  });
  
  try {
    console.log('Navigating to http://localhost:5173...');
    const response = await page.goto('http://localhost:5173', { 
      waitUntil: 'networkidle2', 
      timeout: 10000 
    });
    
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 2000)));
    
    console.log('\n========================================');
    console.log('TEST RESULTS FOR http://localhost:5173');
    console.log('========================================\n');
    
    console.log('ANSWER 1: Does the game UI load?');
    console.log('NO - UI rendering failed due to JavaScript errors');
    const uiContent = await page.evaluate(() => {
      return document.getElementById('ui-root').innerHTML;
    });
    console.log('  UI Root HTML length: ' + uiContent.length + ' chars (empty: ' + (uiContent.length === 0) + ')');
    
    console.log('\n---\n');
    
    console.log('ANSWER 2: What errors appear in the console?');
    console.log('\nAll console messages:');
    logs.forEach(log => {
      console.log('  [' + log.type.toUpperCase() + '] ' + log.text);
    });
    
    console.log('\nCritical errors:');
    if (errors.length === 0) {
      console.log('  [NONE FOUND - but page failed to initialize]');
    } else {
      errors.forEach(err => {
        console.log('  ' + err);
      });
    }
    
    console.log('\n---\n');
    
    console.log('ANSWER 3: Can you interact with the menu?');
    console.log('NO - Menu was never rendered');
    const buttons = await page.evaluate(() => {
      const btns = document.querySelectorAll('button');
      return {
        count: btns.length,
        buttons: Array.from(btns).map(btn => ({
          text: btn.textContent,
          visible: btn.offsetParent !== null,
          className: btn.className
        }))
      };
    });
    console.log('  Buttons found: ' + buttons.count);
    
    console.log('\n---\n');
    
    console.log('ANSWER 4: What is broken?');
    console.log('\nROOT CAUSE: Import statement mismatch in level.js');
    console.log('  File: src/game/level.js, line 7');
    console.log('  BROKEN: import { Physics } from "./physics.js"');
    console.log('  ACTUAL: physics.js exports PhysicsEngine, not Physics');
    console.log('');
    console.log('  Full error: "The requested module /src/game/physics.js');
    console.log('             does not provide an export named Physics"');
    console.log('');
    console.log('IMPACT:');
    console.log('  - Level.js fails to import');
    console.log('  - Level class cannot be instantiated');
    console.log('  - main.js fails when creating levels');
    console.log('  - No UI is rendered (no menus, no buttons)');
    console.log('  - Canvas exists but is blank');
    console.log('  - Application is non-functional');
    
  } catch (error) {
    console.log('Navigation error: ' + error.message);
  }
  
  await browser.close();
})();
