/**
 * LightCaves - Main Entry Point
 *
 * Initialize game and start the application
 */

import { GRID_CONFIG, COLORS } from './utils/constants.js'
import { Renderer } from './rendering/renderer.js'
import { GridRenderer } from './rendering/grid-renderer.js'
import { InputHandler } from './utils/input-handler.js'
import { MainMenu } from './ui/main-menu.js'
import { LevelSelector } from './ui/level-selector.js'
import { GameHUD } from './ui/game-hud.js'
import { SettingsMenu } from './ui/settings-menu.js'
import { PauseMenu } from './ui/pause-menu.js'
import { GameOverScreen } from './ui/game-over-screen.js'
import { Level } from './game/level.js'
import { LEVEL_DATABASE, getAllLevels, getLevelData, isLevelUnlocked } from './game/level-database.js'
import { CELL_TYPES, DIRECTIONS } from './utils/constants.js'

console.log('LightCaves v0.1.0 loading...')

let gameState = {
  isLoading: true,
  currentScene: 'menu', // menu, levelSelect, game
  isPaused: false,
  canvas: null,
  renderer: null,
  gridRenderer: null,
  inputHandler: null,
  currentLevel: null,
  animationFrameId: null,
  uiRoot: null,
  mainMenu: null,
  levelSelector: null,
  gameHUD: null,
  settingsMenu: null,
  pauseMenu: null,
  gameOverScreen: null,

  // Level data
  availableLevels: getAllLevels().map((level) => ({
    id: level.id,
    name: level.name,
    description: level.description,
    difficulty: level.difficulty
  })),
  completedLevels: []
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

// Create a level by ID
function createLevel(levelId) {
  // Get level data from database
  const levelDefData = getLevelData(levelId)
  if (!levelDefData) {
    console.error(`[Main] Level not found in database: ${levelId}`)
    return null
  }

  const { width, height, lamp, target, walls, maxMirrors, name, difficulty } = levelDefData

  // Create grid (all empty)
  const grid = []
  for (let y = 0; y < height; y++) {
    grid[y] = []
    for (let x = 0; x < width; x++) {
      grid[y][x] = CELL_TYPES.EMPTY
    }
  }

  // Place walls
  walls.forEach((wall) => {
    if (grid[wall.y] && grid[wall.y][wall.x] !== undefined) {
      grid[wall.y][wall.x] = CELL_TYPES.WALL
    }
  })

  // Create level data with exact specifications
  const mapData = {
    width,
    height,
    grid,
    lamp,
    target,
    metadata: {
      levelId,
      name,
      difficulty,
      maxMirrors
    }
  }

  const level = new Level(mapData)
  console.log(`[Main] Created level: ${name} (${difficulty}, max ${maxMirrors} mirrors)`)
  return level
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

// Initialize UI systems
function initializeUI() {
  gameState.uiRoot = document.getElementById('ui-root') || document.body

  // Create main menu
  gameState.mainMenu = new MainMenu(gameState.renderer, gameState.uiRoot)
  gameState.mainMenu.on('start', () => {
    showLevelSelector()
  })
  gameState.mainMenu.on('settings', () => {
    showSettings()
  })
  gameState.mainMenu.on('about', () => {
    console.log('[Main] About clicked')
  })
  gameState.mainMenu.on('quit', () => {
    console.log('[Main] Quit clicked')
  })

  // Create level selector
  gameState.levelSelector = new LevelSelector(gameState.renderer, gameState.uiRoot, gameState.availableLevels)
  gameState.levelSelector.on('levelSelected', (levelId) => {
    startGame(levelId)
  })
  gameState.levelSelector.on('levelClosed', () => {
    showMainMenu()
  })

  // Create game HUD
  gameState.gameHUD = new GameHUD(gameState.renderer, gameState.uiRoot)
  gameState.gameHUD.on('undo', () => {
    console.log('[Main] Undo clicked')
  })
  gameState.gameHUD.on('redo', () => {
    console.log('[Main] Redo clicked')
  })
  gameState.gameHUD.on('reset', () => {
    console.log('[Main] Reset clicked')
  })
  gameState.gameHUD.on('menu', () => {
    endGame()
  })

  // Create settings menu
  gameState.settingsMenu = new SettingsMenu(gameState.renderer, gameState.uiRoot)

  // Create pause menu
  gameState.pauseMenu = new PauseMenu(gameState.renderer, gameState.uiRoot)
  gameState.pauseMenu.on('resume', () => {
    resumeGame()
  })
  gameState.pauseMenu.on('settings', () => {
    showSettingsFromPause()
  })
  gameState.pauseMenu.on('menu', () => {
    endGame()
  })

  // Create game over screen
  gameState.gameOverScreen = new GameOverScreen(gameState.renderer, gameState.uiRoot)
  gameState.gameOverScreen.on('restart', () => {
    restartLevel()
  })
  gameState.gameOverScreen.on('next', () => {
    nextLevel()
  })
  gameState.gameOverScreen.on('menu', () => {
    endGame()
  })
}

// Show main menu scene
function showMainMenu() {
  gameState.currentScene = 'menu'
  gameState.mainMenu.showMenu()
  console.log('[Main] Showing main menu')
}

// Show level selector scene
function showLevelSelector() {
  gameState.currentScene = 'levelSelect'
  gameState.mainMenu.hideMenu()
  gameState.levelSelector.showLevelList()
  console.log('[Main] Showing level selector')
}

// Start game with a level
function startGame(levelId) {
  gameState.currentScene = 'game'
  gameState.levelSelector.hideLevelList()
  gameState.isPaused = false

  // Create level
  const level = createLevel(levelId)
  if (!level) {
    console.error('[Main] Failed to create level')
    showLevelSelector()
    return
  }

  gameState.currentLevel = level
  gameState.gridRenderer.level = level

  // Initialize gameplay state
  gameState.gameplayState = {
    startTime: Date.now(),
    moveCount: 0,
    undoStack: [],
    redoStack: [],
    gameOver: false,
    won: false
  }

  // Show game HUD with stats
  gameState.gameHUD.show()
  updateGameStats()

  // Add input event handlers for gameplay
  setupGameplayInput()

  console.log('[Main] Game started with level:', levelId)
}

// Setup gameplay input handlers
function setupGameplayInput() {
  // Handle click to place mirrors
  gameState.canvas.addEventListener('click', (event) => {
    if (gameState.currentScene !== 'game' || gameState.isPaused || gameState.gameplayState?.gameOver) return
    handleCellClick(event)
  })

  // Handle undo via HUD button
  gameState.gameHUD.off?.('undo') // Remove old handler if exists
  gameState.gameHUD.on('undo', () => {
    if (gameState.gameplayState?.undoStack.length > 0) {
      const state = gameState.gameplayState.undoStack.pop()
      gameState.gameplayState.redoStack.push(JSON.parse(JSON.stringify(gameState.currentLevel.mirrors)))
      gameState.currentLevel.mirrors = state
      gameState.gameplayState.moveCount++
      recalculateLight()
      updateGameStats()
    }
  })

  // Handle redo via HUD button
  gameState.gameHUD.off?.('redo') // Remove old handler if exists
  gameState.gameHUD.on('redo', () => {
    if (gameState.gameplayState?.redoStack.length > 0) {
      const state = gameState.gameplayState.redoStack.pop()
      gameState.gameplayState.undoStack.push(JSON.parse(JSON.stringify(gameState.currentLevel.mirrors)))
      gameState.currentLevel.mirrors = state
      gameState.gameplayState.moveCount++
      recalculateLight()
      updateGameStats()
    }
  })

  // Handle reset via HUD button
  gameState.gameHUD.off?.('reset') // Remove old handler if exists
  gameState.gameHUD.on('reset', () => {
    if (confirm('Reset level and lose all progress?')) {
      gameState.currentLevel.mirrors = []
      gameState.gameplayState.moveCount = 0
      gameState.gameplayState.undoStack = []
      gameState.gameplayState.redoStack = []
      recalculateLight()
      updateGameStats()
    }
  })
}

// Handle clicking on a cell to place mirror
function handleCellClick(event) {
  const rect = gameState.canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  const gridX = Math.floor(x / GRID_CONFIG.CELL_WIDTH_PX)
  const gridY = Math.floor(y / GRID_CONFIG.CELL_HEIGHT_PX)

  // Validate grid bounds
  if (gridX < 0 || gridY < 0 || gridX >= gameState.currentLevel.width || gridY >= gameState.currentLevel.height) {
    return
  }

  // Check if cell is empty
  const cell = gameState.currentLevel.grid[gridY]?.[gridX]
  if (cell !== CELL_TYPES.EMPTY) {
    return
  }

  // Check if mirror already exists at this position
  const existingMirror = gameState.currentLevel.mirrors.find((m) => m.x === gridX && m.y === gridY)
  if (existingMirror) {
    // Remove mirror (toggle)
    gameState.gameplayState.undoStack.push(JSON.parse(JSON.stringify(gameState.currentLevel.mirrors)))
    gameState.gameplayState.redoStack = []
    gameState.currentLevel.mirrors = gameState.currentLevel.mirrors.filter(
      (m) => !(m.x === gridX && m.y === gridY)
    )
    gameState.gameplayState.moveCount++
    recalculateLight()
    updateGameStats()
    return
  }

  // Check max mirrors
  if (gameState.currentLevel.mirrors.length >= gameState.currentLevel.metadata.maxMirrors) {
    console.log('[Game] Max mirrors reached')
    return
  }

  // Add new mirror (alternate between / and \\)
  gameState.gameplayState.undoStack.push(JSON.parse(JSON.stringify(gameState.currentLevel.mirrors)))
  gameState.gameplayState.redoStack = []

  const lastMirror = gameState.currentLevel.mirrors[gameState.currentLevel.mirrors.length - 1]
  const mirrorType = lastMirror?.type === '/' ? '\\' : '/'

  gameState.currentLevel.mirrors.push({ x: gridX, y: gridY, type: mirrorType })
  gameState.gameplayState.moveCount++

  recalculateLight()
  updateGameStats()
}

// Recalculate light path and check victory
function recalculateLight() {
  if (!gameState.currentLevel) return

  // Calculate illuminated cells
  const beamPath = gameState.currentLevel.calculateBeamPath()
  gameState.currentLevel.illuminatedCells = new Set(
    beamPath.map((cell) => `${cell.x},${cell.y}`)
  )

  // Check victory condition
  const targetKey = `${gameState.currentLevel.target.x},${gameState.currentLevel.target.y}`
  const isTargetIlluminated = gameState.currentLevel.illuminatedCells.has(targetKey)

  if (isTargetIlluminated && !gameState.gameplayState.gameOver) {
    gameState.gameplayState.gameOver = true
    gameState.gameplayState.won = true
    triggerVictory()
  }
}

// Update game HUD stats
function updateGameStats() {
  if (!gameState.gameplayState) return

  const elapsedSeconds = Math.floor((Date.now() - gameState.gameplayState.startTime) / 1000)
  const illuminatedCount = gameState.currentLevel.illuminatedCells?.size || 0

  gameState.gameHUD.updateStats({
    levelName: gameState.currentLevel.metadata.name,
    difficulty: gameState.currentLevel.metadata.difficulty,
    moves: gameState.gameplayState.moveCount,
    targetCount: 1,
    illuminatedCount: Math.min(illuminatedCount, gameState.currentLevel.width * gameState.currentLevel.height),
    time: elapsedSeconds
  })
}

// Trigger victory screen
function triggerVictory() {
  const elapsedSeconds = Math.floor((Date.now() - gameState.gameplayState.startTime) / 1000)
  gameState.gameHUD.hide()
  gameState.gameOverScreen.showVictory({
    time: elapsedSeconds,
    moves: gameState.gameplayState.moveCount,
    levelName: gameState.currentLevel.metadata.name
  })
  console.log('[Main] Victory! Time:', elapsedSeconds, 's, Moves:', gameState.gameplayState.moveCount)
}

// Show settings menu
function showSettings() {
  gameState.mainMenu.hideMenu()
  gameState.settingsMenu.show()

  // When settings closes, return to menu
  const originalHide = gameState.settingsMenu.hide.bind(gameState.settingsMenu)
  gameState.settingsMenu.hide = function () {
    originalHide()
    showMainMenu()
  }

  console.log('[Main] Settings shown')
}

// Pause game
function pauseGame() {
  if (gameState.currentScene !== 'game' || gameState.isPaused) return

  gameState.isPaused = true
  gameState.pauseMenu.show()
  console.log('[Main] Game paused')
}

// Resume game
function resumeGame() {
  if (!gameState.isPaused) return

  gameState.isPaused = false
  gameState.pauseMenu.hide()
  console.log('[Main] Game resumed')
}

// Show settings from pause menu
function showSettingsFromPause() {
  gameState.pauseMenu.hide()
  gameState.settingsMenu.show()

  // When settings closes, return to pause menu
  const originalHide = gameState.settingsMenu.hide.bind(gameState.settingsMenu)
  gameState.settingsMenu.hide = function () {
    originalHide()
    pauseGame()
  }

  console.log('[Main] Settings shown from pause menu')
}

// End game and return to menu
function endGame() {
  gameState.currentScene = 'menu'
  gameState.isPaused = false
  gameState.gameHUD.hide()
  gameState.pauseMenu.hide()
  gameState.gameOverScreen.hide()
  gameState.currentLevel = null
  showMainMenu()
  console.log('[Main] Game ended')
}

// Restart current level
function restartLevel() {
  const levelId = gameState.currentLevel?.metadata?.levelId || gameState.availableLevels[0].id
  gameState.gameOverScreen.hide()
  startGame(levelId)
  console.log('[Main] Level restarted')
}

// Start next level
function nextLevel() {
  const currentLevelIndex = gameState.availableLevels.findIndex(
    (l) => l.id === gameState.currentLevel?.metadata?.levelId
  )
  const nextIndex = currentLevelIndex + 1

  if (nextIndex < gameState.availableLevels.length) {
    gameState.gameOverScreen.hide()
    startGame(gameState.availableLevels[nextIndex].id)
    console.log('[Main] Next level started')
  } else {
    // No more levels, go to menu
    endGame()
  }
}

// Game loop
function gameLoop() {
  // Render only when in game scene
  if (gameState.currentScene === 'game' && gameState.renderer && gameState.gridRenderer && gameState.currentLevel) {
    gameState.renderer.clear()
    gameState.gridRenderer.drawGrid()

    // Draw illuminated cells with semi-transparent overlay
    if (gameState.currentLevel.illuminatedCells && gameState.currentLevel.illuminatedCells.size > 0) {
      gameState.currentLevel.illuminatedCells.forEach((cellKey) => {
        const [x, y] = cellKey.split(',').map(Number)
        gameState.renderer.drawRect(
          x * GRID_CONFIG.CELL_WIDTH_PX,
          y * GRID_CONFIG.CELL_HEIGHT_PX,
          GRID_CONFIG.CELL_WIDTH_PX,
          GRID_CONFIG.CELL_HEIGHT_PX,
          COLORS.BEAM,
          0.2
        )
      })
    }

    // Draw mirrors
    gameState.currentLevel.mirrors.forEach((mirror) => {
      const x = mirror.x * GRID_CONFIG.CELL_WIDTH_PX + GRID_CONFIG.CELL_WIDTH_PX / 2
      const y = mirror.y * GRID_CONFIG.CELL_HEIGHT_PX + GRID_CONFIG.CELL_HEIGHT_PX / 2
      gameState.renderer.drawText(mirror.type, x - 4, y + 5, COLORS.ACCENT)
    })

    // Draw lamp and target
    const lamp = gameState.currentLevel.lamp
    const target = gameState.currentLevel.target
    gameState.renderer.drawText('🔆', lamp.x * GRID_CONFIG.CELL_WIDTH_PX + 8, lamp.y * GRID_CONFIG.CELL_HEIGHT_PX + 10, COLORS.ACCENT)
    gameState.renderer.drawText('◯', target.x * GRID_CONFIG.CELL_WIDTH_PX + 8, target.y * GRID_CONFIG.CELL_HEIGHT_PX + 10, COLORS.BEAM)
  }

  gameState.animationFrameId = requestAnimationFrame(gameLoop)
}

// Initialize app
function initializeApp() {
  try {
    // Hide loading indicator
    const loading = document.getElementById('loading')
    if (loading) {
      loading.style.display = 'none'
    }

    // Initialize canvas
    const canvas = initializeCanvas()
    if (!canvas) {
      console.error('[Main] Failed to initialize canvas')
      showError('Canvas initialization failed')
      return
    }
    gameState.canvas = canvas

    // Initialize renderers
    const { renderer, gridRenderer } = initializeRenderers(canvas)
    gameState.renderer = renderer
    gameState.gridRenderer = gridRenderer

    // Initialize input
    const input = initializeInput(canvas)
    gameState.inputHandler = input

    // Initialize UI systems
    initializeUI()

    // Add global keyboard listener for pause
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && gameState.currentScene === 'game') {
        if (gameState.isPaused) {
          resumeGame()
        } else {
          pauseGame()
        }
      }
    })

    console.log('[Main] App initialized and ready')
    gameState.isLoading = false

    // Show main menu and start game loop
    showMainMenu()
    gameLoop()
  } catch (error) {
    console.error('[Main] Initialization error:', error)
    showError(`Initialization failed: ${error.message}`)
  }
}

// Show error message
function showError(message) {
  const errorDiv = document.createElement('div')
  errorDiv.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(255, 0, 0, 0.9);
    color: white;
    padding: 30px;
    border-radius: 10px;
    text-align: center;
    z-index: 2000;
    font-family: Arial, sans-serif;
    max-width: 500px;
  `
  errorDiv.textContent = message
  document.body.appendChild(errorDiv)
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
