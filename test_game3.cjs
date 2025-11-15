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
    console.log('Navigating to game...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    await delay(2000);
    
    // Click START GAME
    console.log('Clicking START GAME...');
    await page.click('button');
    await delay(2000);
    
    // Find and click the Tutorial level button
    console.log('Clicking Tutorial level...');
    const buttons = await page.$$('button');
    if (buttons.length > 0) {
      await buttons[0].click();
      console.log('Clicked Tutorial button');
      await delay(3000);
    }
    
    // Now take the game screenshot
    console.log('Taking final game screenshot...');
    await page.screenshot({ path: '/tmp/screenshot_game.png' });
    console.log('Game screenshot saved');
    
    // Analyze game state
    const gameState = await page.evaluate(() => {
      const canvases = document.querySelectorAll('canvas');
      const gameContainer = document.querySelector('[class*="game"], canvas, [class*="Game"]');
      const pageText = document.body.innerText;
      
      return {
        canvasCount: canvases.length,
        hasGameContainer: gameContainer !== null,
        pageTextLength: pageText.length,
        isGamePage: pageText.includes('Place') || pageText.includes('Mirror') || pageText.includes('Target'),
        pageText: pageText.substring(0, 500)
      };
    });
    
    console.log('\n=== GAME STATE ===');
    console.log('Number of canvases:', gameState.canvasCount);
    console.log('Game container exists:', gameState.hasGameContainer);
    console.log('Is game page:', gameState.isGamePage);
    console.log('Page text preview:\n', gameState.pageText);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();
