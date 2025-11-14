/**
 * LightCaves - Main Entry Point
 *
 * Initialize game and start the application
 */

import { GRID_CONFIG } from './utils/constants.js'

console.log('LightCaves v0.1.0 loading...')

// Initialize Canvas dimensions
function initializeCanvas() {
  const canvas = document.getElementById('gameCanvas')

  if (!canvas) {
    console.error('[Main] Canvas element not found!')
    return null
  }

  // Default grid size: 50 cells × 30 cells
  const gridWidth = 50
  const gridHeight = 30
  const canvasWidth = gridWidth * GRID_CONFIG.CELL_WIDTH_PX
  const canvasHeight = gridHeight * GRID_CONFIG.CELL_HEIGHT_PX

  canvas.width = canvasWidth
  canvas.height = canvasHeight

  console.log(`[Main] Canvas initialized: ${canvasWidth}×${canvasHeight}px (${gridWidth}×${gridHeight} cells)`)
  return canvas
}

// Initialize app
function initializeApp() {
  const canvas = initializeCanvas()

  if (!canvas) {
    return
  }

  console.log('[Main] App initialized and ready')

  // TODO: Import and initialize game systems (Story 1.4+)
  // import { Game } from './game/game.js'
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
    console.log('[HMR] Hot reload detected')
  })
}
