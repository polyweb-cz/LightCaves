/**
 * @fileoverview Palette rendering for mirror selection display
 * @module rendering/palette-renderer
 */

import { COLORS, SYMBOLS } from '../utils/constants.js'

/**
 * PaletteRenderer class - handles rendering of mirror selection palette
 * @class PaletteRenderer
 */
export class PaletteRenderer {
  /**
   * Create a palette renderer
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

    console.log('[PaletteRenderer] Initialized')
  }

  /**
   * Draw a single mirror option in the palette
   * @param {string} mirrorType - Mirror type ('/' or '\')
   * @param {number} x - X pixel coordinate
   * @param {number} y - Y pixel coordinate
   * @param {boolean} isSelected - Whether this mirror is selected
   * @param {number} count - Optional count of available mirrors
   */
  drawMirrorOption(mirrorType, x, y, isSelected = false, count = null) {
    const symbol = mirrorType === '/' ? SYMBOLS.MIRROR_SLASH : SYMBOLS.MIRROR_BACKSLASH
    const textColor = isSelected ? COLORS.BG : COLORS.TEXT
    const backgroundColor = isSelected ? COLORS.ACCENT : COLORS.BG

    // Draw background box if selected
    if (isSelected) {
      this.renderer.drawRect(x - 15, y - 8, 30, 16, backgroundColor)
    }

    // Draw mirror symbol
    this.renderer.drawText(symbol, x, y, textColor)

    // Draw count if provided
    if (count !== null && count !== undefined && count > 0) {
      const countText = `x${count}`
      this.renderer.drawText(countText, x + 12, y, COLORS.TEXT)
    }
  }

  /**
   * Draw all mirror options in the palette
   * @param {string} selectedType - Currently selected mirror type ('/' or '\')
   * @param {Object} mirrorCounts - Count of available mirrors: { '/': 5, '\': 3 }
   * @param {number} x - Starting X coordinate
   * @param {number} y - Y coordinate for palette
   */
  drawPalette(selectedType, mirrorCounts = {}, x = 10, y = 50) {
    const slashCount = mirrorCounts['/'] || null
    const backslashCount = mirrorCounts['\\'] || null

    // Draw slash mirror
    this.drawMirrorOption('/', x, y, selectedType === '/', slashCount)

    // Draw backslash mirror
    this.drawMirrorOption('\\', x + 60, y, selectedType === '\\', backslashCount)

    // Draw label
    const labelColor = COLORS.TEXT
    this.renderer.drawText('Mirrors:', x - 30, y, labelColor)
  }

  /**
   * Draw palette with keyboard hint
   * @param {string} selectedType - Currently selected mirror type
   * @param {Object} mirrorCounts - Available mirror counts
   * @param {number} x - Starting X coordinate
   * @param {number} y - Y coordinate
   */
  drawPaletteWithHint(selectedType, mirrorCounts = {}, x = 10, y = 50) {
    this.drawPalette(selectedType, mirrorCounts, x, y)

    // Draw keyboard hint
    const hintText = '[1] [2] to select'
    this.renderer.drawText(hintText, x + 130, y, COLORS.TEXT)
  }

  /**
   * Draw palette status bar showing current selection and availability
   * @param {string} selectedType - Currently selected mirror type
   * @param {Object} mirrorCounts - Available mirror counts
   * @param {number} x - Starting X coordinate
   * @param {number} y - Y coordinate
   */
  drawPaletteStatus(selectedType, mirrorCounts = {}, x = 10, y = 50) {
    const slashAvailable = mirrorCounts['/'] || 0
    const backslashAvailable = mirrorCounts['\\'] || 0

    let statusText = 'Selected: '
    if (selectedType === '/') {
      statusText += `/ (${slashAvailable} available)`
    } else if (selectedType === '\\') {
      statusText += `\\ (${backslashAvailable} available)`
    } else {
      statusText += 'None'
    }

    this.renderer.drawText(statusText, x, y, COLORS.ACCENT)
  }

  /**
   * Draw a disabled/unavailable mirror type
   * @param {string} mirrorType - Mirror type
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   */
  drawDisabledMirror(mirrorType, x, y) {
    const symbol = mirrorType === '/' ? SYMBOLS.MIRROR_SLASH : SYMBOLS.MIRROR_BACKSLASH

    // Draw with disabled color
    this.renderer.drawText(symbol, x, y, '#555555')

    // Draw "×" to indicate unavailable
    this.renderer.drawText('×', x + 10, y, '#FF0000')
  }

  /**
   * Draw palette with availability indicators
   * @param {string} selectedType - Currently selected mirror type
   * @param {Object} mirrorCounts - Available mirror counts
   * @param {number} x - Starting X coordinate
   * @param {number} y - Y coordinate
   */
  drawPaletteWithAvailability(selectedType, mirrorCounts = {}, x = 10, y = 50) {
    const slashCount = mirrorCounts['/'] || 0
    const backslashCount = mirrorCounts['\\'] || 0

    // Draw label
    this.renderer.drawText('Mirrors:', x - 30, y, COLORS.TEXT)

    // Draw slash mirror with availability
    if (slashCount > 0) {
      this.drawMirrorOption('/', x, y, selectedType === '/', slashCount)
    } else {
      this.drawDisabledMirror('/', x, y)
    }

    // Draw backslash mirror with availability
    if (backslashCount > 0) {
      this.drawMirrorOption('\\', x + 60, y, selectedType === '\\', backslashCount)
    } else {
      this.drawDisabledMirror('\\', x + 60, y)
    }
  }
}
