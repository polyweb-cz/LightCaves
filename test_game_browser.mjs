import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Set up console message and error logging
  const consoleMessages = [];
  page.on('console', msg => {
    const msg_text = msg.text();
    console.log('BROWSER CONSOLE:', msg_text);
    consoleMessages.push(msg_text);
  });
  page.on('error', err => console.log('BROWSER ERROR:', err));
  page.on('pageerror', err => console.log('PAGE ERROR:', err));
  
  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  
  try {
    // Step 1: Navigate to the game
    console.log('\n=== STEP 1: Navigate to game ===');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2', timeout: 10000 });
    console.log('Game loaded successfully');
    
    // Step 2: Take screenshot of menu
    console.log('\n=== STEP 2: Screenshot of game menu ===');
    await page.screenshot({ path: '/tmp/step1-menu.png', fullPage: true });
    console.log('Screenshot taken: /tmp/step1-menu.png');
    
    // Wait a bit for UI to render
    await wait(2000);
    
    // Step 3: Check page content
    console.log('\n=== STEP 3: Check page content ===');
    const pageContent = await page.evaluate(() => {
      return {
        title: document.title,
        bodyText: document.body.innerText.substring(0, 500),
        allButtons: Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim())
      };
    });
    console.log('Page content:', JSON.stringify(pageContent, null, 2));
    
    // Step 4: Click Start Game
    console.log('\n=== STEP 4: Click Start Game ===');
    try {
      const clicked = await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => 
          b.textContent.includes('Start Game')
        );
        if (btn) {
          console.log('Found and clicking Start Game button');
          btn.click();
          return true;
        } else {
          console.log('Start Game button not found');
          return false;
        }
      });
      console.log('Start Game click executed, found:', clicked);
    } catch (e) {
      console.log('Error clicking Start Game:', e.message);
    }
    
    await wait(2000);
    
    // Step 5: Take screenshot of level selector
    console.log('\n=== STEP 5: Screenshot of level selector ===');
    await page.screenshot({ path: '/tmp/step2-levels.png', fullPage: true });
    console.log('Screenshot taken: /tmp/step2-levels.png');
    
    // Step 6: Get all visible levels
    console.log('\n=== STEP 6: Check visible levels ===');
    const levelInfo = await page.evaluate(() => {
      // Get all text content to see what's displayed
      const allText = document.body.innerText;
      
      // Look for level-related buttons
      const levelButtons = Array.from(document.querySelectorAll('button')).filter(b => {
        const text = b.textContent.toLowerCase();
        return text.includes('tutorial') || text.includes('level') || 
               text.includes('reflection') || text.includes('maze') || 
               text.includes('path') || text.includes('complex') || text.includes('expert') ||
               text.includes('challenge');
      }).map(b => ({
        text: b.textContent.trim(),
        className: b.className
      }));
      
      return {
        fullText: allText.substring(0, 800),
        levelButtons: levelButtons,
        allButtons: Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim())
      };
    });
    console.log('Level info:', JSON.stringify(levelInfo, null, 2));
    
    // Step 7: Try to click Tutorial level
    console.log('\n=== STEP 7: Try to click Tutorial level ===');
    try {
      const found = await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => 
          b.textContent.toLowerCase().includes('tutorial') || 
          b.textContent.toLowerCase().includes('basics')
        );
        if (btn) {
          console.log('Found tutorial button, clicking...');
          btn.click();
          return true;
        } else {
          console.log('Tutorial button not found');
          return false;
        }
      });
      console.log('Tutorial found and clicked:', found);
    } catch (e) {
      console.log('Error clicking tutorial:', e.message);
    }
    
    await wait(2000);
    
    // Step 8: Check if game loaded
    console.log('\n=== STEP 8: Check if game loaded ===');
    const gameLoaded = await page.evaluate(() => {
      const canvas = document.getElementById('gameCanvas');
      return {
        canvasExists: !!canvas,
        canvasVisible: canvas ? canvas.offsetParent !== null : false,
        canvasWidth: canvas ? canvas.width : 0,
        canvasHeight: canvas ? canvas.height : 0,
        pageText: document.body.innerText.substring(0, 300)
      };
    });
    console.log('Game state:', JSON.stringify(gameLoaded, null, 2));
    
    // Step 9: Take screenshot of game
    console.log('\n=== STEP 9: Screenshot of game screen ===');
    await page.screenshot({ path: '/tmp/step3-game.png', fullPage: true });
    console.log('Screenshot taken: /tmp/step3-game.png');
    
    // Step 10: Try to place a mirror by clicking canvas
    console.log('\n=== STEP 10: Try to click canvas to place mirror ===');
    try {
      const clickResult = await page.evaluate(() => {
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          const event = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window,
            clientX: Math.round(rect.left + rect.width / 2),
            clientY: Math.round(rect.top + rect.height / 2)
          });
          canvas.dispatchEvent(event);
          return { success: true, message: 'Click event dispatched' };
        }
        return { success: false, message: 'Canvas not found' };
      });
      console.log('Canvas click result:', JSON.stringify(clickResult, null, 2));
    } catch (e) {
      console.log('Error clicking canvas:', e.message);
    }
    
    await wait(1000);
    
    // Step 11: Take screenshot after click
    console.log('\n=== STEP 11: Screenshot after canvas click ===');
    await page.screenshot({ path: '/tmp/step4-after-click.png', fullPage: true });
    console.log('Screenshot taken: /tmp/step4-after-click.png');
    
    // Step 12: Try to go back to levels and start a different level
    console.log('\n=== STEP 12: Try to click back or menu button ===');
    try {
      const clicked = await page.evaluate(() => {
        // Look for menu or back button
        const buttons = Array.from(document.querySelectorAll('button'));
        const menuBtn = buttons.find(b => 
          b.textContent.toLowerCase().includes('menu') || 
          b.textContent.toLowerCase().includes('back') ||
          b.textContent.toLowerCase().includes('main')
        );
        if (menuBtn) {
          console.log('Found menu/back button, clicking:', menuBtn.textContent.trim());
          menuBtn.click();
          return true;
        }
        return false;
      });
      console.log('Menu button found and clicked:', clicked);
    } catch (e) {
      console.log('Error clicking menu button:', e.message);
    }
    
    await wait(1500);
    
    // Step 13: Check for levels again and try different one
    console.log('\n=== STEP 13: Check if back at level selector ===');
    const backAtLevels = await page.evaluate(() => {
      const allButtons = Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim());
      return {
        hasSimpleReflection: allButtons.some(t => t.includes('Simple Reflection')),
        hasLightMaze: allButtons.some(t => t.includes('Light Maze')),
        allButtons: allButtons
      };
    });
    console.log('Level buttons visible:', JSON.stringify(backAtLevels, null, 2));
    
    // Step 14: Try to click another level
    console.log('\n=== STEP 14: Try to click Simple Reflection level ===');
    try {
      const clicked = await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => 
          b.textContent.includes('Simple Reflection')
        );
        if (btn) {
          console.log('Found Simple Reflection button, clicking...');
          btn.click();
          return true;
        } else {
          console.log('Simple Reflection button not found');
          return false;
        }
      });
      console.log('Simple Reflection clicked:', clicked);
    } catch (e) {
      console.log('Error clicking Simple Reflection:', e.message);
    }
    
    await wait(2000);
    
    // Step 15: Take final screenshot
    console.log('\n=== STEP 15: Final screenshot ===');
    await page.screenshot({ path: '/tmp/step5-final.png', fullPage: true });
    console.log('Screenshot taken: /tmp/step5-final.png');
    
    // Step 16: Check final console messages
    console.log('\n=== STEP 16: Final console check ===');
    console.log('Total console messages collected:', consoleMessages.length);
    console.log('Last 10 messages:');
    consoleMessages.slice(-10).forEach((msg, idx) => {
      console.log(`  ${idx + 1}. ${msg}`);
    });
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await browser.close();
    console.log('\n=== Test completed ===');
  }
})();
