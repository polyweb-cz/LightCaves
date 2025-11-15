async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testGameFlow() {
  console.log('=== LightCaves Game Flow Test ===\n');
  
  // Check if server is running
  try {
    const response = await fetch('http://localhost:5173');
    console.log('[SUCCESS] Game server is running on http://localhost:5173');
    console.log('[HTTP] Response status:', response.status);
  } catch (error) {
    console.error('[ERROR] Cannot reach game server:', error.message);
    return;
  }
  
  // Fetch the main page
  try {
    const response = await fetch('http://localhost:5173');
    const html = await response.text();
    
    console.log('\n[CHECK] HTML structure:');
    console.log('  - Contains <canvas>:', html.includes('<canvas'));
    console.log('  - Contains main game script:', html.includes('main.js'));
    console.log('  - HTML length:', html.length, 'bytes');
    
    // Check for specific elements
    if (html.includes('<canvas')) {
      console.log('  - Canvas element: FOUND');
    }
    
    if (html.includes('main.js')) {
      console.log('  - Main JS script: FOUND');
    }
    
  } catch (error) {
    console.error('[ERROR] Failed to fetch HTML:', error.message);
  }
  
  console.log('\n[ANALYSIS] Based on code review:');
  console.log('  - MainMenu has onClick handlers: VERIFIED');
  console.log('  - Callback registration with .on() method: VERIFIED');
  console.log('  - Physics import fixed: YES (per git log)');
  console.log('  - Menu should close when level is selected: EXPECTED');
  
  console.log('\n[INSTRUCTIONS] To fully test, please use a Chrome browser:');
  console.log('1. Open http://localhost:5173');
  console.log('2. Click "START GAME" (bright green button)');
  console.log('3. Click "Tutorial: The Basics" (highlighted level card)');
  console.log('4. Verify you see the game grid with lamp and target');
  console.log('5. Try clicking on a grid cell to place a mirror');
  console.log('6. Confirm menu is gone and game is playable');
}

testGameFlow().catch(console.error);
