import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2', timeout: 10000 });
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));
    
    // Take screenshot
    await page.screenshot({ path: '/tmp/lightcaves-page.png', fullPage: true });
    console.log('Screenshot saved to /tmp/lightcaves-page.png');
    
    // Get page dimensions for reference
    const dimensions = await page.evaluate(() => ({
      width: window.innerWidth,
      height: window.innerHeight,
      documentWidth: document.documentElement.scrollWidth,
      documentHeight: document.documentElement.scrollHeight
    }));
    console.log('Page dimensions: ' + JSON.stringify(dimensions));
    
  } catch (error) {
    console.log('Error: ' + error.message);
  }
  
  await browser.close();
})();
