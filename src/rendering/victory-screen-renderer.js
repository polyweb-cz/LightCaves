/**
 * @fileoverview Victory screen rendering for level completion
 * @module rendering/victory-screen-renderer
 */

import { COLORS } from '../utils/constants.js'

/**
 * VictoryScreenRenderer class - handles rendering of level completion screen
 * @class VictoryScreenRenderer
 */
export class VictoryScreenRenderer {
  /**
   * Create a victory screen renderer
   * @param {Renderer} renderer - The Renderer instance
   * @param {number} canvasWidth - Canvas width
   * @param {number} canvasHeight - Canvas height
   */
  constructor(renderer, canvasWidth = 640, canvasHeight = 480) {
    if (!renderer) {
      throw new Error('Invalid renderer')
    }

    this.renderer = renderer
    this.canvasWidth = canvasWidth
    this.canvasHeight = canvasHeight

    console.log('[VictoryScreenRenderer] Initialized')
  }

  /**
   * Format time in seconds to MM:SS format
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
   * Draw victory title
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   */
  drawVictoryTitle(x, y) {
    this.renderer.drawText('═══════════════════', x, y, COLORS.ACCENT)
    this.renderer.drawText('LEVEL COMPLETE!', x + 10, y + 10, COLORS.ACCENT)
    this.renderer.drawText('═══════════════════', x, y + 20, COLORS.ACCENT)
  }

  /**
   * Draw current level statistics
   * @param {Object} stats - Statistics object
   * @param {number} stats.moves - Number of moves made
   * @param {number} stats.time - Time elapsed in seconds
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   */
  drawLevelStats(stats = {}, x, y) {
    const moves = stats.moves !== undefined ? stats.moves : 0
    const time = stats.time !== undefined ? stats.time : 0

    this.renderer.drawText('Your Score:', x, y, COLORS.TEXT)
    this.renderer.drawText(`  Moves: ${moves}`, x + 5, y + 10, COLORS.ACCENT)
    this.renderer.drawText(`  Time: ${this.formatTime(time)}`, x + 5, y + 20, COLORS.ACCENT)
  }

  /**
   * Draw best statistics (personal best)
   * @param {Object} bestStats - Best stats object
   * @param {number} bestStats.moves - Best move count
   * @param {number} bestStats.time - Best time in seconds
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   */
  drawBestStats(bestStats = {}, x, y) {
    const bestMoves = bestStats.moves !== undefined ? bestStats.moves : '-'
    const bestTime = bestStats.time !== undefined ? this.formatTime(bestStats.time) : '-'

    this.renderer.drawText('Personal Best:', x, y, COLORS.TEXT)
    this.renderer.drawText(`  Moves: ${bestMoves}`, x + 5, y + 10, COLORS.TEXT)
    this.renderer.drawText(`  Time: ${bestTime}`, x + 5, y + 20, COLORS.TEXT)
  }

  /**
   * Draw victory buttons (Next, Retry, Menu)
   * @param {number} x - X coordinate for first button
   * @param {number} y - Y coordinate for buttons
   * @param {boolean} hasNextLevel - Whether there's a next level
   */
  drawVictoryButtons(x, y, hasNextLevel = true) {
    const buttonWidth = 12
    const spacing = 20

    // Next Level button
    if (hasNextLevel) {
      const nextText = '[Next]'
      this.renderer.drawText(nextText, x, y, COLORS.ACCENT)
    }

    // Retry button
    const retryText = '[Retry]'
    this.renderer.drawText(retryText, x + spacing + (hasNextLevel ? buttonWidth : 0), y, COLORS.TEXT)

    // Menu button
    const menuText = '[Menu]'
    this.renderer.drawText(
      menuText,
      x + spacing * 2 + (hasNextLevel ? buttonWidth : 0),
      y,
      COLORS.TEXT
    )
  }

  /**
   * Draw semi-transparent overlay (dark background)
   * @param {number} opacity - Opacity level (0-1)
   */
  drawOverlay(opacity = 0.7) {
    this.renderer.ctx.globalAlpha = opacity
    this.renderer.drawRect(0, 0, this.canvasWidth, this.canvasHeight, '#000000')
    this.renderer.ctx.globalAlpha = 1.0
  }

  /**
   * Draw box border for modal
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} width - Box width
   * @param {number} height - Box height
   * @param {string} color - Border color
   */
  drawBox(x, y, width, height, color = COLORS.ACCENT) {
    const boxChars = {
      topLeft: '╔',
      topRight: '╗',
      bottomLeft: '╚',
      bottomRight: '╝',
      horizontal: '═',
      vertical: '║'
    }

    // Corners
    this.renderer.drawText(boxChars.topLeft, x, y, color)
    this.renderer.drawText(boxChars.topRight, x + width, y, color)
    this.renderer.drawText(boxChars.bottomLeft, x, y + height, color)
    this.renderer.drawText(boxChars.bottomRight, x + width, y + height, color)

    // Top and bottom lines
    for (let i = 1; i < width; i++) {
      this.renderer.drawText(boxChars.horizontal, x + i, y, color)
      this.renderer.drawText(boxChars.horizontal, x + i, y + height, color)
    }

    // Left and right lines
    for (let i = 1; i < height; i++) {
      this.renderer.drawText(boxChars.vertical, x, y + i, color)
      this.renderer.drawText(boxChars.vertical, x + width, y + i, color)
    }
  }

  /**
   * Draw complete victory screen with all elements
   * @param {Object} levelStats - Current level statistics
   * @param {Object} bestStats - Best statistics
   * @param {boolean} hasNextLevel - Whether next level exists
   */
  drawCompleteScreen(levelStats = {}, bestStats = {}, hasNextLevel = true) {
    // Draw dark overlay
    this.drawOverlay(0.7)

    // Calculate box position (centered)
    const boxWidth = 50
    const boxHeight = 40
    const boxX = (this.canvasWidth - boxWidth) / 2
    const boxY = (this.canvasHeight - boxHeight) / 2

    // Draw box border
    this.drawBox(boxX, boxY, boxWidth, boxHeight)

    // Draw content inside box
    let contentY = boxY + 3

    // Title
    this.drawVictoryTitle(boxX + 5, contentY)
    contentY += 10

    // Current stats
    this.drawLevelStats(levelStats, boxX + 5, contentY)
    contentY += 10

    // Best stats
    this.drawBestStats(bestStats, boxX + 5, contentY)
    contentY += 10

    // Buttons
    this.drawVictoryButtons(boxX + 5, contentY + 5, hasNextLevel)
  }

  /**
   * Draw simple victory screen (minimal version)
   * @param {Object} stats - Level statistics
   */
  drawSimpleVictory(stats = {}) {
    const centerX = this.canvasWidth / 2
    const centerY = this.canvasHeight / 2

    // Draw overlay
    this.drawOverlay(0.7)

    // Draw title
    this.renderer.drawText('LEVEL COMPLETE!', centerX - 50, centerY - 20, COLORS.ACCENT)

    // Draw stats
    const moves = stats.moves || 0
    const time = stats.time || 0
    this.renderer.drawText(`Moves: ${moves}  Time: ${this.formatTime(time)}`, centerX - 40, centerY, COLORS.TEXT)

    // Draw buttons
    this.renderer.drawText('[Next] [Retry] [Menu]', centerX - 50, centerY + 30, COLORS.TEXT)
  }

  /**
   * Draw star rating based on performance
   * @param {number} stars - Number of stars (1-3)
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   */
  drawStarRating(stars, x, y) {
    const maxStars = 3
    const fullStar = '★'
    const emptyStar = '☆'

    let rating = ''
    for (let i = 0; i < maxStars; i++) {
      rating += i < stars ? fullStar : emptyStar
      rating += ' '
    }

    this.renderer.drawText(rating, x, y, '#FFD700')
  }

  /**
   * Draw congratulations message
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {string} message - Custom message
   */
  drawMessage(x, y, message = 'Congratulations!') {
    this.renderer.drawText(message, x, y, COLORS.ACCENT)
  }

  /**
   * Draw trophy/achievement icon
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   */
  drawTrophy(x, y) {
    const trophy = '🏆'
    this.renderer.drawText(trophy, x, y, '#FFD700')
  }

  /**
   * Draw statistics comparison with best
   * @param {Object} current - Current stats
   * @param {Object} best - Best stats
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   */
  drawStatsComparison(current = {}, best = {}, x, y) {
    const currentMoves = current.moves || 0
    const bestMoves = best.moves !== undefined ? best.moves : null

    this.renderer.drawText('Statistics:', x, y, COLORS.TEXT)

    // Moves comparison
    let movesText = `Moves: ${currentMoves}`
    if (bestMoves !== null) {
      if (currentMoves < bestMoves) {
        movesText += ' (NEW BEST!)'
      } else if (currentMoves === bestMoves) {
        movesText += ' (TIED)'
      }
    }
    this.renderer.drawText(movesText, x + 5, y + 10, COLORS.ACCENT)

    // Time comparison
    const currentTime = current.time || 0
    const bestTime = best.time
    let timeText = `Time: ${this.formatTime(currentTime)}`
    if (bestTime !== undefined) {
      if (currentTime < bestTime) {
        timeText += ' (NEW BEST!)'
      }
    }
    this.renderer.drawText(timeText, x + 5, y + 20, COLORS.ACCENT)
  }
}
