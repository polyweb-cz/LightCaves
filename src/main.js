/**
 * LightCaves - Main Entry Point
 *
 * Initialize game and start the application
 */

import { GRID_CONFIG, COLORS } from './utils/constants.js'
import { Renderer } from './rendering/renderer.js'
import { GridRenderer } from './rendering/grid-renderer.js'
import { InputHandler } from './utils/input-handler.js'
import { Level } from './game/level.js'
import { CELL_TYPES, DIRECTIONS } from './utils/constants.js'

console.log('LightCaves v0.1.0 loading...')

let gameState = {
  isLoading: true,
  canvas: null,
  renderer: null,
  gridRenderer: null,
  inputHandler: null,
  currentLevel: null,
  animationFrameId: null
}

// Initialize Canvas dimensions
function initializeCanvas() {
  const canvas = document.getElementById('gameCanvas')

  if (!canvas) {
    console.error('[Main] Canvas element not found!')
    return null
  }

  // Default grid size: 20 cells × 15 cells (small for demo)
  const gridWidth = 20
  const gridHeight = 15
  const canvasWidth = gridWidth * GRID_CONFIG.CELL_WIDTH_PX
  const canvasHeight = gridHeight * GRID_CONFIG.CELL_HEIGHT_PX

  canvas.width = canvasWidth
  canvas.height = canvasHeight

  console.log(`[Main] Canvas initialized: ${canvasWidth}×${canvasHeight}px (${gridWidth}×${gridHeight} cells)`)
  return canvas
}

// Create a simple test level
function createTestLevel() {
  const mapData = {
    width: 20,
    height: 15,
    grid: [],
    lamp: { x: 2, y: 2, direction: DIRECTIONS.E },
    target: { x: 17, y: 2, direction: DIRECTIONS.W },
    metadata: { name: 'Demo Level', difficulty: 'Easy', maxMirrors: 5 }
  }

  // Create simple grid (all empty except walls on edges)
  for (let y = 0; y < mapData.height; y++) {
    mapData.grid[y] = []
    for (let x = 0; x < mapData.width; x++) {
      // Create border walls
      if (x === 0 || x === mapData.width - 1 || y === 0 || y === mapData.height - 1) {
        mapData.grid[y][x] = CELL_TYPES.WALL
      } else {
        mapData.grid[y][x] = CELL_TYPES.EMPTY
      }
    }
  }

  return new Level(mapData)
}

// Initialize renderers
function initializeRenderers(canvas) {
  const renderer = new Renderer(canvas)
  const gridRenderer = new GridRenderer(renderer, null)

  return { renderer, gridRenderer }
}

// Initialize input
function initializeInput(canvas) {
  return new InputHandler(canvas)
}

// Game loop
function gameLoop() {
  if (!gameState.renderer || !gameState.gridRenderer || !gameState.currentLevel) {
    gameState.animationFrameId = requestAnimationFrame(gameLoop)
    return
  }

  // Clear canvas
  gameState.renderer.clear()

  // Draw grid
  gameState.gridRenderer.drawGrid()

  // Draw lamp and target
  const lamp = gameState.currentLevel.lamp
  const target = gameState.currentLevel.target

  // Simple rendering for demo
  gameState.renderer.drawText('🔆', lamp.x * GRID_CONFIG.CELL_WIDTH_PX + 8, lamp.y * GRID_CONFIG.CELL_HEIGHT_PX + 10, COLORS.ACCENT)
  gameState.renderer.drawText('◯', target.x * GRID_CONFIG.CELL_WIDTH_PX + 8, target.y * GRID_CONFIG.CELL_HEIGHT_PX + 10, COLORS.BEAM)

  // Draw HUD
  gameState.renderer.drawText('LightCaves Demo - Use mouse to explore', 10, gameState.canvas.height - 20, COLORS.TEXT)

  gameState.animationFrameId = requestAnimationFrame(gameLoop)
}

// Initialize app
function initializeApp() {
  // Hide loading indicator
  const loading = document.getElementById('loading')
  if (loading) {
    loading.style.display = 'none'
  }

  // Initialize canvas
  const canvas = initializeCanvas()
  if (!canvas) {
    console.error('[Main] Failed to initialize canvas')
    return
  }

  gameState.canvas = canvas

  // Create test level first
  const testLevel = createTestLevel()
  gameState.currentLevel = testLevel

  // Initialize renderers
  try {
    const renderer = new Renderer(canvas)
    const gridRenderer = new GridRenderer(renderer, testLevel)
    gameState.renderer = renderer
    gameState.gridRenderer = gridRenderer
  } catch (error) {
    console.error('[Main] Failed to initialize renderers:', error)
    return
  }

  // Initialize input
  try {
    const input = initializeInput(canvas)
    gameState.inputHandler = input

    // Log mouse clicks for demo
    input.on('mouseClick', (data) => {
      console.log(`[Main] Click at grid: ${data.gridX}, ${data.gridY}`)
    })
  } catch (error) {
    console.error('[Main] Failed to initialize input:', error)
  }

  console.log('[Main] App initialized and ready')
  gameState.isLoading = false

  // Start game loop
  gameLoop()
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
