/**
 * LightCaves - Main Entry Point
 *
 * Initialize game and start the application
 */

console.log('LightCaves loading...')

// TODO: Import game modules (will be added in later stories)
// import { Game } from './game/game.js'
// import { UIManager } from './ui/ui.js'

// Initialize app
function initializeApp() {
  const canvas = document.getElementById('gameCanvas')

  if (!canvas) {
    console.error('Canvas element not found!')
    return
  }

  console.log('Canvas element found, game ready for initialization')

  // TODO: Initialize game systems (Story 1.2+)
  // const game = new Game(canvas)
  // game.start()
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp)
} else {
  initializeApp()
}

// HMR support for development
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    console.log('HMR update')
  })
}
