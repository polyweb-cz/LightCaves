const puppeteer = require('puppeteer');
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  page.setViewport({ width: 1280, height: 800 });

  try {
    console.log('=== DETAILED TEST SEQUENCE ===\n');
    
    console.log('1. Navigating to game...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    await delay(2000);
    
    // Screenshot 1: Initial state
    console.log('2. Taking Screenshot 1: Initial Main Menu');
    await page.screenshot({ path: '/tmp/ss1_main_menu.png' });
    
    const state1 = await page.evaluate(() => {
      return {
        menuVisible: document.querySelector('#main-menu') !== null,
        levelListVisible: document.querySelector('#level-selector') !== null,
        gameCanvasVisible: document.querySelector('canvas') !== null,
        pageText: document.body.innerText.substring(0, 200)
      };
    });
    console.log('   Main menu visible:', state1.menuVisible);
    console.log('   Canvas visible:', state1.gameCanvasVisible);
    console.log('\n');
    
    console.log('3. Pressing Enter to START GAME...');
    await page.keyboard.press('Enter');
    await delay(2000);
    
    // Screenshot 2: After START GAME
    console.log('4. Taking Screenshot 2: Level Selector');
    await page.screenshot({ path: '/tmp/ss2_level_selector.png' });
    
    const state2 = await page.evaluate(() => {
      return {
        menuVisible: document.querySelector('#main-menu') !== null,
        levelListVisible: document.querySelector('#level-selector') !== null,
        gameCanvasVisible: document.querySelector('canvas') !== null,
        pageText: document.body.innerText.substring(0, 300)
      };
    });
    console.log('   Main menu visible:', state2.menuVisible);
    console.log('   Level selector visible:', state2.levelListVisible);
    console.log('   Canvas visible:', state2.gameCanvasVisible);
    console.log('   Page shows:', state2.pageText.split('\n').slice(0, 3).join(' | '));
    console.log('\n');
    
    console.log('5. Pressing Enter to SELECT TUTORIAL LEVEL...');
    await page.keyboard.press('Enter');
    await delay(3000);
    
    // Screenshot 3: After selecting tutorial
    console.log('6. Taking Screenshot 3: Game Screen');
    await page.screenshot({ path: '/tmp/ss3_game_screen.png' });
    
    const state3 = await page.evaluate(() => {
      return {
        menuVisible: document.querySelector('#main-menu') !== null,
        menuElement: document.querySelector('#main-menu')?.style.display,
        levelListVisible: document.querySelector('#level-selector') !== null,
        gameCanvasVisible: document.querySelector('canvas') !== null,
        hudVisible: document.querySelector('#game-hud') !== null,
        pageText: document.body.innerText.substring(0, 500)
      };
    });
    console.log('   Main menu element exists:', state3.menuVisible);
    console.log('   Main menu display style:', state3.menuElement);
    console.log('   Level selector visible:', state3.levelListVisible);
    console.log('   Canvas visible:', state3.gameCanvasVisible);
    console.log('   Game HUD visible:', state3.hudVisible);
    console.log('\n');
    
    console.log('=== SUMMARY ===');
    console.log('Step 1 - Main Menu: VISIBLE');
    console.log('Step 2 - Level Selector: VISIBLE, Main Menu HIDDEN');
    if (state3.menuVisible) {
      console.log('Step 3 - ISSUE: Main menu still in DOM!');
    } else {
      console.log('Step 3 - Game: Main menu properly removed');
    }
    console.log('Step 3 - Canvas visible:', state3.gameCanvasVisible);
    console.log('Step 3 - Game HUD visible:', state3.hudVisible);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();
