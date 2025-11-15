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
    console.log('Step 1: Navigating to game...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    await delay(2000);
    
    console.log('Step 2: Pressing Enter to click START GAME...');
    await page.keyboard.press('Enter');
    await delay(2000);
    
    console.log('Step 3: Pressing Enter to select Tutorial level...');
    await page.keyboard.press('Enter');
    await delay(3000);
    
    console.log('Step 4: Taking game screenshot...');
    await page.screenshot({ path: '/tmp/screenshot_game.png' });
    console.log('Screenshot saved');
    
    // Check game state
    const gameState = await page.evaluate(() => {
      const pageText = document.body.innerText;
      const hasCanvas = document.querySelector('canvas') !== null;
      const isGameActive = pageText.includes('Place') || pageText.includes('Mirror') || !pageText.includes('Select Level');
      
      return {
        hasCanvas,
        isGameActive,
        pageTextPreview: pageText.substring(0, 600)
      };
    });
    
    console.log('\n=== RESULT ===');
    console.log('Canvas visible:', gameState.hasCanvas);
    console.log('Game active:', gameState.isGameActive);
    console.log('\nPage content:\n', gameState.pageTextPreview);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();
