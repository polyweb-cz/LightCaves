const puppeteer = require('puppeteer');
const fs = require('fs');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  page.setViewport({ width: 1280, height: 800 });

  try {
    // Step 1: Navigate to localhost:5173
    console.log('Step 1: Navigating to http://localhost:5173');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    await delay(2000);
    
    // Take screenshot 1
    console.log('Taking screenshot 1 (initial state)...');
    await page.screenshot({ path: '/tmp/screenshot1.png' });
    console.log('Screenshot 1 saved to /tmp/screenshot1.png');
    
    // Check page content
    const content1 = await page.content();
    if (content1.includes('START GAME')) {
      console.log('Found START GAME button on page');
    }
    
    // Step 2: Click START GAME button
    console.log('\nStep 2: Clicking START GAME button');
    try {
      const button = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const startBtn = buttons.find(btn => btn.textContent.includes('START GAME'));
        if (startBtn) {
          startBtn.click();
          return true;
        }
        return false;
      });
      if (button) {
        console.log('START GAME clicked');
        await delay(1500);
      } else {
        console.log('Could not find START GAME button');
      }
    } catch (e) {
      console.log('Error clicking START GAME:', e.message);
    }
    
    // Take screenshot 2
    console.log('Taking screenshot 2 (after clicking START GAME)...');
    await page.screenshot({ path: '/tmp/screenshot2.png' });
    console.log('Screenshot 2 saved to /tmp/screenshot2.png');
    
    // Step 3: Click on Tutorial level
    console.log('\nStep 3: Clicking Tutorial: The Basics level');
    try {
      const tutorialClicked = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, div[role="button"], [class*="button"]'));
        const tutorialBtn = buttons.find(btn => btn.textContent.includes('Tutorial'));
        if (tutorialBtn) {
          tutorialBtn.click();
          return true;
        }
        return false;
      });
      
      if (tutorialClicked) {
        console.log('Tutorial level clicked');
        await delay(2000);
      } else {
        console.log('Could not find tutorial button');
      }
    } catch (e) {
      console.log('Error clicking tutorial:', e.message);
    }
    
    // Take screenshot 3
    console.log('Taking screenshot 3 (after clicking tutorial)...');
    await page.screenshot({ path: '/tmp/screenshot3.png' });
    console.log('Screenshot 3 saved to /tmp/screenshot3.png');
    
    // Step 4: Analyze game state
    console.log('\nStep 4: Analyzing game state');
    const gameState = await page.evaluate(() => {
      const hasCanvas = document.querySelector('canvas') !== null;
      const hasGameElement = document.querySelector('[class*="game"]') !== null;
      const hasStartButton = Array.from(document.querySelectorAll('*')).some(el => el.textContent.includes('START GAME'));
      const hasMenu = document.querySelector('[class*="menu"]') !== null;
      
      return {
        hasCanvas,
        hasGameElement,
        hasStartButton,
        hasMenu
      };
    });
    
    console.log('\nGame State Analysis:');
    console.log('- Canvas element visible:', gameState.hasCanvas);
    console.log('- Game element visible:', gameState.hasGameElement);
    console.log('- START GAME button visible:', gameState.hasStartButton);
    console.log('- Menu element visible:', gameState.hasMenu);
    
    if (gameState.hasCanvas || gameState.hasGameElement) {
      console.log('- Game grid/canvas: VISIBLE');
    } else {
      console.log('- Game grid/canvas: NOT VISIBLE');
    }
    
    if (!gameState.hasStartButton && !gameState.hasMenu) {
      console.log('- Main menu: HIDDEN');
    } else {
      console.log('- Main menu: STILL VISIBLE');
    }
    
    console.log('\nTest completed successfully');
    
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await browser.close();
  }
})();
