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
    console.log('Screenshot 1 saved');
    
    // Investigate page structure
    console.log('\nInvestigating page structure...');
    const pageInfo = await page.evaluate(() => {
      const allElements = Array.from(document.querySelectorAll('*'));
      const textContent = document.body.innerText;
      const buttonCount = document.querySelectorAll('button').length;
      return {
        textContent: textContent.substring(0, 500),
        buttonCount,
        allText: allElements.map(el => el.textContent).filter(t => t.length < 50 && t.length > 0)
      };
    });
    
    console.log('Page buttons found:', pageInfo.buttonCount);
    console.log('Text sample:', pageInfo.textContent);
    
    // Step 2: Click START GAME button with multiple strategies
    console.log('\nStep 2: Clicking START GAME button');
    let clicked = false;
    
    // Strategy 1: XPath with contains
    try {
      await page.click('button');
      console.log('Clicked first button');
      clicked = true;
      await delay(2000);
    } catch (e1) {
      console.log('Strategy 1 failed:', e1.message);
    }
    
    if (clicked) {
      // Take screenshot 2
      console.log('Taking screenshot 2 (after clicking)...');
      await page.screenshot({ path: '/tmp/screenshot2.png' });
      console.log('Screenshot 2 saved');
      
      // Check if level selector appears
      await delay(1000);
      
      // Step 3: Click Tutorial level
      console.log('\nStep 3: Looking for Tutorial level');
      const levelInfo = await page.evaluate(() => {
        const allElements = Array.from(document.querySelectorAll('*'));
        const tutorialElements = allElements.filter(el => el.textContent.includes('Tutorial'));
        return {
          foundTutorial: tutorialElements.length > 0,
          tutorialCount: tutorialElements.length,
          tutorialText: tutorialElements.slice(0, 3).map(el => el.textContent)
        };
      });
      
      console.log('Tutorial elements found:', levelInfo.foundTutorial, 'Count:', levelInfo.foundTutorial);
      
      if (levelInfo.foundTutorial) {
        // Click first button (assuming it's the Tutorial button)
        try {
          const buttons = await page.$$('button');
          if (buttons.length > 0) {
            console.log('Found', buttons.length, 'buttons. Clicking second button (Tutorial)');
            await buttons[0].click();
            await delay(2000);
          }
        } catch (e) {
          console.log('Error clicking tutorial button:', e.message);
        }
      }
      
      // Take screenshot 3
      console.log('Taking screenshot 3 (final state)...');
      await page.screenshot({ path: '/tmp/screenshot3.png' });
      console.log('Screenshot 3 saved');
    }
    
    // Final state analysis
    console.log('\nFinal State Analysis:');
    const finalState = await page.evaluate(() => {
      const hasCanvas = document.querySelector('canvas') !== null;
      const hasMenu = document.body.innerText.includes('START GAME');
      return {
        hasCanvas,
        hasMenu,
        pageText: document.body.innerText.substring(0, 300)
      };
    });
    
    console.log('Canvas visible:', finalState.hasCanvas);
    console.log('Menu visible:', finalState.hasMenu);
    console.log('\nFinal page text:\n', finalState.pageText);
    
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await browser.close();
  }
})();
