import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  page.setViewport({ width: 800, height: 1200 });
  
  const consoleMessages = [];
  page.on('console', msg => {
    const msg_text = msg.text();
    if (msg_text.includes('[') || msg_text.includes('error') || msg_text.includes('Error')) {
      console.log('BROWSER CONSOLE:', msg_text);
    }
    consoleMessages.push(msg_text);
  });
  page.on('error', err => console.log('BROWSER ERROR:', err));
  page.on('pageerror', err => console.log('PAGE ERROR:', err));
  
  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  
  try {
    // Navigate and get to level selector
    console.log('\n=== Navigate to game ===');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2', timeout: 10000 });
    await wait(2000);
    
    // Click Start Game
    console.log('=== Click Start Game ===');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => 
        b.textContent.includes('Start Game')
      );
      if (btn) btn.click();
    });
    
    await wait(1500);
    
    // Get ALL level information
    console.log('\n=== GET ALL LEVELS ===');
    const allLevels = await page.evaluate(() => {
      const levelElements = Array.from(document.querySelectorAll('[class*="level"], button')).filter(el => {
        const text = el.textContent.toLowerCase();
        return text.includes('tutorial') || text.includes('reflection') || text.includes('maze') || 
               text.includes('path') || text.includes('complex') || text.includes('expert') ||
               text.includes('challenge');
      });
      
      // Get all divs that contain level info
      const containers = Array.from(document.querySelectorAll('div')).filter(div => {
        const text = div.textContent;
        return (text.includes('Tutorial') || text.includes('Reflection') || text.includes('Maze') ||
                text.includes('Path') || text.includes('Complex') || text.includes('Challenge')) &&
               text.length < 200;
      }).map(div => ({
        text: div.textContent.trim().substring(0, 100),
        visible: div.offsetParent !== null
      }));
      
      // Just get the plain text content instead
      const bodyText = document.body.innerText;
      
      return {
        bodyText: bodyText,
        allContainers: containers.length
      };
    });
    
    console.log('Full page text:');
    console.log(allLevels.bodyText);
    
    // Take full page screenshot to see all levels
    console.log('\n=== Take full page screenshot ===');
    await page.screenshot({ path: '/tmp/full-levels.png', fullPage: true });
    console.log('Screenshot: /tmp/full-levels.png');
    
    // Now test selecting the Tutorial level
    console.log('\n=== SELECT TUTORIAL LEVEL ===');
    await page.evaluate(() => {
      // The first level item should be Tutorial: The Basics
      // Try clicking directly on it
      const items = Array.from(document.querySelectorAll('[class*="item"], [class*="level"], div')).filter(el => {
        return el.textContent.includes('Tutorial');
      });
      
      if (items.length > 0) {
        console.log('Found Tutorial item, attempting click');
        // Click the parent container
        let clickTarget = items[0];
        while (clickTarget && clickTarget.offsetParent === null) {
          clickTarget = clickTarget.parentElement;
        }
        clickTarget.click();
        return true;
      }
      return false;
    });
    
    await wait(2000);
    
    // Check game state
    console.log('\n=== CHECK GAME STATE ===');
    const gameState = await page.evaluate(() => {
      const canvas = document.getElementById('gameCanvas');
      return {
        canvasVisible: canvas && canvas.offsetParent !== null,
        pageText: document.body.innerText.substring(0, 400)
      };
    });
    console.log('Game state:', gameState);
    
    // Take screenshot
    await page.screenshot({ path: '/tmp/tutorial-loaded.png', fullPage: true });
    console.log('Screenshot: /tmp/tutorial-loaded.png');
    
    // Try clicking on canvas
    console.log('\n=== TRY CLICKING CANVAS ===');
    const clickResult = await page.evaluate(() => {
      const canvas = document.getElementById('gameCanvas');
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        console.log('Canvas found, dispatching click at center');
        const event = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window,
          clientX: Math.round(rect.left + rect.width / 2),
          clientY: Math.round(rect.top + rect.height / 2)
        });
        canvas.dispatchEvent(event);
        return true;
      }
      return false;
    });
    console.log('Canvas click executed:', clickResult);
    
    await wait(500);
    
    // Take screenshot after click
    await page.screenshot({ path: '/tmp/after-canvas-click.png', fullPage: true });
    console.log('Screenshot: /tmp/after-canvas-click.png');
    
    // Try to go back to levels
    console.log('\n=== GO BACK TO LEVELS ===');
    await page.keyboard.press('Escape');
    await wait(1000);
    
    // Take screenshot
    await page.screenshot({ path: '/tmp/back-to-selector.png', fullPage: true });
    console.log('Screenshot: /tmp/back-to-selector.png');
    
    // Try clicking Simple Reflection (second level)
    console.log('\n=== TRY SIMPLE REFLECTION LEVEL ===');
    await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('div')).filter(el => {
        return el.textContent.includes('Simple Reflection');
      });
      
      if (items.length > 0) {
        console.log('Found Simple Reflection item, attempting click');
        let clickTarget = items[0];
        while (clickTarget && clickTarget.offsetParent === null) {
          clickTarget = clickTarget.parentElement;
        }
        clickTarget.click();
        return true;
      }
      return false;
    });
    
    await wait(2000);
    
    // Take screenshot
    await page.screenshot({ path: '/tmp/simple-reflection-loaded.png', fullPage: true });
    console.log('Screenshot: /tmp/simple-reflection-loaded.png');
    
    console.log('\n=== TEST COMPLETED ===');
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await browser.close();
  }
})();
