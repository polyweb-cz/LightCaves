/**
 * @fileoverview Button controls rendering for game action buttons
 * @module rendering/button-renderer
 */

import { COLORS } from '../utils/constants.js'

/**
 * ButtonRenderer class - handles rendering of interactive control buttons
 * @class ButtonRenderer
 */
export class ButtonRenderer {
  /**
   * Create a button renderer
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

    console.log('[ButtonRenderer] Initialized')
  }

  /**
   * Draw a single button
   * @param {string} text - Button label text
   * @param {number} x - X pixel coordinate (center)
   * @param {number} y - Y pixel coordinate (center)
   * @param {boolean} isEnabled - Whether button is enabled
   * @param {string} style - Button style ('default' or 'highlight')
   */
  drawButton(text, x, y, isEnabled = true, style = 'default') {
    const width = 40
    const height = 10

    // Determine colors based on enabled state and style
    let borderColor, textColor, bgColor

    if (!isEnabled) {
      borderColor = '#555555'
      textColor = '#555555'
      bgColor = '#222222'
    } else if (style === 'highlight') {
      borderColor = COLORS.ACCENT
      textColor = COLORS.BG
      bgColor = COLORS.ACCENT
    } else {
      borderColor = COLORS.TEXT
      textColor = COLORS.TEXT
      bgColor = COLORS.BG
    }

    // Draw button background
    this.renderer.drawRect(
      x - width / 2,
      y - height / 2,
      width,
      height,
      bgColor
    )

    // Draw button border (outline)
    this.drawButtonBorder(x - width / 2, y - height / 2, width, height, borderColor)

    // Draw button text
    this.renderer.drawText(text, x, y, textColor)
  }

  /**
   * Draw button border using lines
   * @param {number} x - Left X coordinate
   * @param {number} y - Top Y coordinate
   * @param {number} width - Button width
   * @param {number} height - Button height
   * @param {string} color - Border color
   * @private
   */
  drawButtonBorder(x, y, width, height, color) {
    // Draw border using corner characters or simple lines
    // Top-left, top-right, bottom-left, bottom-right corners
    const corners = {
      topLeft: '┌',
      topRight: '┐',
      bottomLeft: '└',
      bottomRight: '┘',
      horizontal: '─',
      vertical: '│'
    }

    this.renderer.drawText(corners.topLeft, x, y, color)
    this.renderer.drawText(corners.topRight, x + width, y, color)
    this.renderer.drawText(corners.bottomLeft, x, y + height, color)
    this.renderer.drawText(corners.bottomRight, x + width, y + height, color)
  }

  /**
   * Draw Undo button
   * @param {boolean} isEnabled - Whether undo is available
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   */
  drawUndoButton(isEnabled = true, x = 10, y = 70) {
    this.drawButton('Undo', x, y, isEnabled)
  }

  /**
   * Draw Redo button
   * @param {boolean} isEnabled - Whether redo is available
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   */
  drawRedoButton(isEnabled = true, x = 60, y = 70) {
    this.drawButton('Redo', x, y, isEnabled)
  }

  /**
   * Draw Reset button
   * @param {boolean} isEnabled - Whether reset is available
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   */
  drawResetButton(isEnabled = true, x = 110, y = 70) {
    this.drawButton('Reset', x, y, isEnabled)
  }

  /**
   * Draw Menu button
   * @param {boolean} isEnabled - Whether menu is available
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   */
  drawMenuButton(isEnabled = true, x = 160, y = 70) {
    this.drawButton('Menu', x, y, isEnabled)
  }

  /**
   * Draw all control buttons
   * @param {Object} gameState - Current game state
   * @param {boolean} gameState.canUndo - Whether undo is available
   * @param {boolean} gameState.canRedo - Whether redo is available
   * @param {number} y - Y coordinate for all buttons
   */
  drawAllButtons(gameState = {}, y = 70) {
    const canUndo = gameState.canUndo !== undefined ? gameState.canUndo : true
    const canRedo = gameState.canRedo !== undefined ? gameState.canRedo : true

    this.drawUndoButton(canUndo, 10, y)
    this.drawRedoButton(canRedo, 60, y)
    this.drawResetButton(true, 110, y) // Reset always enabled
    this.drawMenuButton(true, 160, y) // Menu always enabled
  }

  /**
   * Draw a button with hover effect
   * @param {string} text - Button label
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {boolean} isEnabled - Whether button is enabled
   * @param {boolean} isHovered - Whether button is hovered
   */
  drawButtonWithHover(text, x, y, isEnabled = true, isHovered = false) {
    const style = isHovered ? 'highlight' : 'default'
    this.drawButton(text, x, y, isEnabled, style)
  }

  /**
   * Draw keyboard shortcut hint below buttons
   * @param {number} y - Y coordinate
   */
  drawButtonHints(y = 85) {
    const hints = [
      'U: Undo',
      'R: Redo',
      'Shift+R: Reset',
      'Esc: Menu'
    ]

    let xPos = 10
    hints.forEach(hint => {
      this.renderer.drawText(hint, xPos, y, COLORS.TEXT)
      xPos += 60
    })
  }

  /**
   * Get button rectangle for hit detection
   * @param {string} buttonType - Type of button (undo, redo, reset, menu)
   * @returns {Object} Rectangle with {x, y, width, height}
   */
  getButtonRect(buttonType) {
    const buttonWidth = 40
    const buttonHeight = 10
    const baseY = 70

    const positions = {
      undo: { x: 10, y: baseY },
      redo: { x: 60, y: baseY },
      reset: { x: 110, y: baseY },
      menu: { x: 160, y: baseY }
    }

    const pos = positions[buttonType.toLowerCase()]
    if (!pos) return null

    return {
      x: pos.x - buttonWidth / 2,
      y: pos.y - buttonHeight / 2,
      width: buttonWidth,
      height: buttonHeight
    }
  }

  /**
   * Check if point is inside button
   * @param {number} px - Point X coordinate
   * @param {number} py - Point Y coordinate
   * @param {string} buttonType - Button type to check
   * @returns {boolean} True if point is inside button
   */
  isPointInButton(px, py, buttonType) {
    const rect = this.getButtonRect(buttonType)
    if (!rect) return false

    return (
      px >= rect.x &&
      px <= rect.x + rect.width &&
      py >= rect.y &&
      py <= rect.y + rect.height
    )
  }

  /**
   * Get button at coordinates (hit test)
   * @param {number} px - Point X coordinate
   * @param {number} py - Point Y coordinate
   * @returns {string|null} Button type or null if no button hit
   */
  getButtonAtPoint(px, py) {
    const buttonTypes = ['undo', 'redo', 'reset', 'menu']

    for (const buttonType of buttonTypes) {
      if (this.isPointInButton(px, py, buttonType)) {
        return buttonType
      }
    }

    return null
  }

  /**
   * Draw button group with label
   * @param {string} label - Group label
   * @param {Array<string>} buttons - Button labels
   * @param {number} x - Starting X coordinate
   * @param {number} y - Starting Y coordinate
   * @param {Array<boolean>} enabledStates - Enabled state for each button
   */
  drawButtonGroup(label, buttons = [], x = 10, y = 70, enabledStates = []) {
    // Draw group label
    this.renderer.drawText(label, x - 30, y, COLORS.TEXT)

    // Draw each button
    let xPos = x
    buttons.forEach((buttonText, index) => {
      const isEnabled = enabledStates[index] !== undefined ? enabledStates[index] : true
      this.drawButton(buttonText, xPos, y, isEnabled)
      xPos += 50
    })
  }
}
