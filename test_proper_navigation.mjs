import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  page.setViewport({ width: 800, height: 1000 });
  
  const consoleMessages = [];
  page.on('console', msg => {
    const msg_text = msg.text();
    if (msg_text.includes('[') || msg_text.includes('Error')) {
      console.log('BROWSER:', msg_text);
    }
    consoleMessages.push(msg_text);
  });
  
  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  
  try {
    // Navigate to game
    console.log('=== NAVIGATE ===');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2', timeout: 10000 });
    await wait(1500);
    
    // Click Start Game
    console.log('=== START GAME ===');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => 
        b.textContent.includes('Start Game')
      );
      if (btn) btn.click();
    });
    await wait(1500);
    
    // Get level list
    console.log('\n=== LEVEL LIST ===');
    const levelList = await page.evaluate(() => document.body.innerText);
    console.log(levelList);
    
    console.log('\n=== ALL 6 LEVELS VISIBLE ===');
    const hasAllLevels = levelList.includes('Tutorial') && 
                        levelList.includes('Simple Reflection') &&
                        levelList.includes('Light Maze') &&
                        levelList.includes('Double Path') &&
                        levelList.includes('Mirror Complex') &&
                        levelList.includes('Expert Challenge');
    console.log('All 6 levels present:', hasAllLevels);
    
    // Take screenshot of full level list
    await page.screenshot({ path: '/tmp/test-full-levels.png', fullPage: true });
    console.log('Screenshot: /tmp/test-full-levels.png');
    
    // Press Enter to select first level (Tutorial)
    console.log('\n=== SELECT TUTORIAL (ENTER) ===');
    await page.keyboard.press('Enter');
    await wait(2000);
    
    // Check if game loaded
    const gameState1 = await page.evaluate(() => {
      return {
        pageText: document.body.innerText.substring(0, 300),
        canvasExists: !!document.getElementById('gameCanvas'),
        title: document.title
      };
    });
    console.log('Game state after Enter:', gameState1);
    
    // Take screenshot
    await page.screenshot({ path: '/tmp/test-tutorial-game.png', fullPage: true });
    console.log('Screenshot: /tmp/test-tutorial-game.png');
    
    // Try clicking on canvas to place mirror
    console.log('\n=== CLICK CANVAS TO PLACE MIRROR ===');
    const clickedCanvas = await page.evaluate(() => {
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
        console.log('Canvas clicked at center');
        return true;
      }
      return false;
    });
    console.log('Canvas click successful:', clickedCanvas);
    
    await wait(500);
    
    // Take screenshot after click
    await page.screenshot({ path: '/tmp/test-after-click.png', fullPage: true });
    console.log('Screenshot: /tmp/test-after-click.png');
    
    // Press Escape to exit game
    console.log('\n=== EXIT GAME (ESC) ===');
    await page.keyboard.press('Escape');
    await wait(1500);
    
    // Check if back at level selector
    const backAtSelector = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasSelectLevel: text.includes('Select Level'),
        hasTutorial: text.includes('Tutorial'),
        hasSimpleReflection: text.includes('Simple Reflection')
      };
    });
    console.log('Back at level selector:', backAtSelector);
    
    // Navigate to second level using arrow keys
    console.log('\n=== NAVIGATE TO SECOND LEVEL (DOWN ARROW) ===');
    await page.keyboard.press('ArrowDown');
    await wait(500);
    
    // Check which level is now selected
    const selectedLevel = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const greenButton = buttons.find(b => {
        const style = window.getComputedStyle(b);
        return style.backgroundColor.includes('rgb(0, 255, 0)') || 
               b.style.backgroundColor.includes('rgb(0, 255, 0)') ||
               b.className.includes('selected') ||
               b.textContent.toLowerCase().includes('simple');
      });
      return {
        selectedText: greenButton ? greenButton.textContent.trim() : 'Not found',
        pageText: document.body.innerText.substring(150, 300)
      };
    });
    console.log('Current selection:', selectedLevel);
    
    // Take screenshot
    await page.screenshot({ path: '/tmp/test-level2-selected.png', fullPage: true });
    console.log('Screenshot: /tmp/test-level2-selected.png');
    
    // Press Enter to select second level
    console.log('\n=== SELECT SECOND LEVEL (ENTER) ===');
    await page.keyboard.press('Enter');
    await wait(2000);
    
    // Check if second level loaded
    const gameState2 = await page.evaluate(() => {
      return {
        pageText: document.body.innerText.substring(0, 300),
        canvasExists: !!document.getElementById('gameCanvas')
      };
    });
    console.log('Game state after second level:', gameState2);
    
    // Take screenshot
    await page.screenshot({ path: '/tmp/test-level2-game.png', fullPage: true });
    console.log('Screenshot: /tmp/test-level2-game.png');
    
    console.log('\n=== TEST COMPLETE ===');
    
    // Print summary
    console.log('\nSUMMARY OF RESULTS:');
    console.log('- All 6 levels visible:', hasAllLevels);
    console.log('- Tutorial level loaded:', gameState1.canvasExists);
    console.log('- Canvas click worked:', clickedCanvas);
    console.log('- Back to selector:', backAtSelector.hasSelectLevel);
    console.log('- Second level loaded:', gameState2.canvasExists);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
