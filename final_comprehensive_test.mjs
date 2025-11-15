import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  page.setViewport({ width: 800, height: 1000 });
  
  const results = {
    menuScreenshot: false,
    startGameClicked: false,
    levelCount: 0,
    levelsFound: [],
    tutorialLoaded: false,
    canvasClickedInTutorial: false,
    menuButtonWorked: false,
    secondLevelLoaded: false,
    secondLevelName: null,
    consoleErrors: []
  };
  
  const consoleMessages = [];
  page.on('console', msg => {
    const msg_text = msg.text();
    consoleMessages.push(msg_text);
    if (msg_text.toLowerCase().includes('error')) {
      results.consoleErrors.push(msg_text);
    }
  });
  
  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  
  try {
    // Step 1: Navigate
    console.log('STEP 1: Navigate to game');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2', timeout: 10000 });
    await wait(1500);
    
    // Step 2: Screenshot menu
    console.log('STEP 2: Take menu screenshot');
    await page.screenshot({ path: '/tmp/final-01-menu.png', fullPage: true });
    results.menuScreenshot = true;
    
    // Step 3: Click Start Game
    console.log('STEP 3: Click Start Game');
    const startGameWorked = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => 
        b.textContent.includes('Start Game')
      );
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    results.startGameClicked = startGameWorked;
    await wait(1500);
    
    // Step 4: Get level information
    console.log('STEP 4: Get level information');
    const levelInfo = await page.evaluate(() => {
      const text = document.body.innerText;
      const levels = [];
      
      if (text.includes('Tutorial: The Basics')) levels.push('Tutorial: The Basics');
      if (text.includes('Simple Reflection')) levels.push('Simple Reflection');
      if (text.includes('Light Maze')) levels.push('Light Maze');
      if (text.includes('Double Path')) levels.push('Double Path');
      if (text.includes('Mirror Complex')) levels.push('Mirror Complex');
      if (text.includes('Expert Challenge')) levels.push('Expert Challenge');
      
      return {
        count: levels.length,
        levels: levels,
        fullText: text
      };
    });
    results.levelCount = levelInfo.count;
    results.levelsFound = levelInfo.levels;
    console.log('Found levels:', levelInfo.levels);
    
    // Step 5: Screenshot level selector
    console.log('STEP 5: Screenshot level selector');
    await page.screenshot({ path: '/tmp/final-02-levels.png', fullPage: true });
    
    // Step 6: Select Tutorial by pressing Enter
    console.log('STEP 6: Select Tutorial level (Enter)');
    await page.keyboard.press('Enter');
    await wait(2000);
    
    // Step 7: Check if Tutorial loaded
    console.log('STEP 7: Verify Tutorial loaded');
    const tutorialState = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasTutorialTitle: text.includes('Tutorial: The Basics'),
        canvasExists: !!document.getElementById('gameCanvas'),
        canvasVisible: !!(document.getElementById('gameCanvas')?.offsetParent),
        hasMenuButton: text.includes('MENU'),
        text: text.substring(0, 400)
      };
    });
    results.tutorialLoaded = tutorialState.hasTutorialTitle && tutorialState.canvasExists;
    console.log('Tutorial loaded:', tutorialState);
    
    // Step 8: Screenshot Tutorial game
    console.log('STEP 8: Screenshot Tutorial game');
    await page.screenshot({ path: '/tmp/final-03-tutorial.png', fullPage: true });
    
    // Step 9: Click canvas to place mirror
    console.log('STEP 9: Click canvas');
    const canvasClicked = await page.evaluate(() => {
      const canvas = document.getElementById('gameCanvas');
      if (canvas && canvas.offsetParent) {
        const rect = canvas.getBoundingClientRect();
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
    results.canvasClickedInTutorial = canvasClicked;
    await wait(500);
    
    // Step 10: Screenshot after click
    console.log('STEP 10: Screenshot after canvas click');
    await page.screenshot({ path: '/tmp/final-04-after-click.png', fullPage: true });
    
    // Step 11: Click MENU button
    console.log('STEP 11: Click MENU button');
    const menuClicked = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => 
        b.textContent.includes('MENU')
      );
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    results.menuButtonWorked = menuClicked;
    await wait(1500);
    
    // Step 12: Check if back at level selector
    console.log('STEP 12: Check if back at level selector');
    const backAtLevels = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasSelectLevel: text.includes('Select Level'),
        hasTutorial: text.includes('Tutorial: The Basics'),
        hasSimpleReflection: text.includes('Simple Reflection'),
        text: text.substring(0, 400)
      };
    });
    console.log('Back at levels?', backAtLevels);
    
    // Step 13: Screenshot level selector again
    console.log('STEP 13: Screenshot after returning to level selector');
    await page.screenshot({ path: '/tmp/final-05-back-to-selector.png', fullPage: true });
    
    // Step 14: Navigate to second level
    console.log('STEP 14: Navigate to second level');
    await page.keyboard.press('ArrowDown');
    await wait(500);
    
    // Step 15: Check which level is selected
    const selectedLevel = await page.evaluate(() => {
      // Get the highlighted level
      const container = Array.from(document.querySelectorAll('div')).find(div => {
        const style = window.getComputedStyle(div);
        const bgColor = style.backgroundColor || style.background;
        return bgColor && (bgColor.includes('rgb(0, 255') || bgColor.includes('rgb(34, 255'));
      });
      
      return {
        selectedText: container ? container.textContent.trim() : 'Not determined',
        pageText: document.body.innerText.substring(150, 350)
      };
    });
    console.log('Selected level:', selectedLevel);
    
    // Step 16: Select second level
    console.log('STEP 16: Select second level (Enter)');
    await page.keyboard.press('Enter');
    await wait(2000);
    
    // Step 17: Check if second level loaded
    console.log('STEP 17: Verify second level loaded');
    const level2State = await page.evaluate(() => {
      const text = document.body.innerText;
      let levelName = null;
      
      if (text.includes('Simple Reflection') && !text.includes('Tutorial')) {
        levelName = 'Simple Reflection';
      } else if (text.includes('Light Maze') && !text.includes('Tutorial')) {
        levelName = 'Light Maze';
      } else if (text.includes('Double Path') && !text.includes('Tutorial')) {
        levelName = 'Double Path';
      }
      
      return {
        levelName: levelName,
        canvasExists: !!document.getElementById('gameCanvas'),
        canvasVisible: !!(document.getElementById('gameCanvas')?.offsetParent),
        hasMenuButton: text.includes('MENU'),
        text: text.substring(0, 400)
      };
    });
    results.secondLevelLoaded = level2State.canvasExists;
    results.secondLevelName = level2State.levelName;
    console.log('Level 2 state:', level2State);
    
    // Step 18: Screenshot level 2
    console.log('STEP 18: Screenshot second level');
    await page.screenshot({ path: '/tmp/final-06-level2.png', fullPage: true });
    
    // Summary
    console.log('\n=== COMPREHENSIVE TEST RESULTS ===');
    console.log('Menu screenshot taken:', results.menuScreenshot);
    console.log('Start Game clicked:', results.startGameClicked);
    console.log('Levels found:', results.levelCount, '- Names:', results.levelsFound);
    console.log('Tutorial loaded:', results.tutorialLoaded);
    console.log('Canvas click in Tutorial:', results.canvasClickedInTutorial);
    console.log('Menu button worked:', results.menuButtonWorked);
    console.log('Second level loaded:', results.secondLevelLoaded);
    console.log('Second level name:', results.secondLevelName);
    console.log('Console errors:', results.consoleErrors.length);
    
    // Save results
    fs.writeFileSync('/tmp/test-results.json', JSON.stringify(results, null, 2));
    console.log('\nResults saved to /tmp/test-results.json');
    
  } catch (error) {
    console.error('Test error:', error.message);
    results.error = error.message;
  } finally {
    await browser.close();
  }
})();
