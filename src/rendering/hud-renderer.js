/**
 * @fileoverview HUD (Heads-Up Display) rendering for game status information
 * @module rendering/hud-renderer
 */

import { COLORS } from '../utils/constants.js'

/**
 * HUDRenderer class - handles rendering of game status information
 * @class HUDRenderer
 */
export class HUDRenderer {
  /**
   * Create a HUD renderer
   * @param {Renderer} renderer - The Renderer instance
   * @param {GridRenderer} gridRenderer - The GridRenderer instance
   */
  constructor(renderer, gridRenderer) {
    if (!renderer) {
      throw new Error('Invalid renderer')
    }
    if (!gridRenderer) {
      throw new Error('Invalid gridRenderer')
    }

    this.renderer = renderer
    this.gridRenderer = gridRenderer

    console.log('[HUDRenderer] Initialized')
  }

  /**
   * Format seconds to MM:SS format
   * @param {number} seconds - Total seconds
   * @returns {string} Formatted time string
   * @private
   */
  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  /**
   * Draw level name/number
   * @param {number|string} levelName - Level identifier
   * @param {number} x - X pixel coordinate
   * @param {number} y - Y pixel coordinate
   */
  drawLevelName(levelName, x = 10, y = 10) {
    const text = `Level: ${levelName}`
    this.renderer.drawText(text, x, y, COLORS.TEXT)
  }

  /**
   * Draw move counter
   * @param {number} moves - Number of moves made
   * @param {number} x - X pixel coordinate
   * @param {number} y - Y pixel coordinate
   */
  drawMoveCounter(moves, x = 150, y = 10) {
    const text = `Moves: ${moves}`
    this.renderer.drawText(text, x, y, COLORS.ACCENT)
  }

  /**
   * Draw timer display
   * @param {number} seconds - Elapsed seconds
   * @param {number} x - X pixel coordinate
   * @param {number} y - Y pixel coordinate
   */
  drawTimer(seconds, x = 280, y = 10) {
    const text = `Time: ${this.formatTime(seconds)}`
    this.renderer.drawText(text, x, y, COLORS.TEXT)
  }

  /**
   * Draw difficulty indicator
   * @param {string} difficulty - Difficulty level (Easy, Medium, Hard)
   * @param {number} x - X pixel coordinate
   * @param {number} y - Y pixel coordinate
   */
  drawDifficulty(difficulty, x = 420, y = 10) {
    const text = `Difficulty: ${difficulty}`
    const color = this.getDifficultyColor(difficulty)
    this.renderer.drawText(text, x, y, color)
  }

  /**
   * Get color based on difficulty level
   * @param {string} difficulty - Difficulty level
   * @returns {string} Color hex code
   * @private
   */
  getDifficultyColor(difficulty) {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return '#00FF00' // Green
      case 'medium':
        return '#FFFF00' // Yellow
      case 'hard':
        return '#FF0000' // Red
      default:
        return COLORS.TEXT
    }
  }

  /**
   * Draw complete HUD with all information
   * @param {Object} gameState - Current game state
   * @param {number|string} gameState.levelName - Level name or number
   * @param {number} gameState.moves - Number of moves
   * @param {number} gameState.elapsedTime - Elapsed seconds
   * @param {string} gameState.difficulty - Difficulty level
   * @param {number} hudY - Y position for HUD line (optional)
   */
  drawHUD(gameState, hudY = 10) {
    if (!gameState) {
      console.warn('[HUDRenderer] No gameState provided')
      return
    }

    // Draw level name
    if (gameState.levelName !== undefined) {
      this.drawLevelName(gameState.levelName, 10, hudY)
    }

    // Draw move counter
    if (gameState.moves !== undefined) {
      this.drawMoveCounter(gameState.moves, 150, hudY)
    }

    // Draw timer
    if (gameState.elapsedTime !== undefined) {
      this.drawTimer(gameState.elapsedTime, 280, hudY)
    }

    // Draw difficulty
    if (gameState.difficulty !== undefined) {
      this.drawDifficulty(gameState.difficulty, 420, hudY)
    }
  }

  /**
   * Draw HUD separator line
   * @param {number} y - Y pixel coordinate of separator
   * @param {number} width - Width of separator
   */
  drawHUDSeparator(y, width = 640) {
    const separatorChar = '─'
    for (let x = 0; x < width; x += 8) {
      this.renderer.drawText(separatorChar, x, y, COLORS.TEXT)
    }
  }
}
