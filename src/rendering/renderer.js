/**
 * @fileoverview Canvas 2D renderer for game graphics
 * @module rendering/renderer
 */

import { GRID_CONFIG, COLORS } from '../utils/constants.js'

/**
 * Renderer class - handles all Canvas 2D drawing operations
 * @class Renderer
 */
export class Renderer {
  /**
   * Create a renderer for a canvas element
   * @param {HTMLCanvasElement} canvasElement - The canvas to render to
   * @throws {Error} If canvas element is invalid
   */
  constructor(canvasElement) {
    if (!canvasElement || !(canvasElement instanceof HTMLCanvasElement)) {
      throw new Error('Invalid canvas element')
    }

    this.canvas = canvasElement
    this.ctx = canvasElement.getContext('2d')

    if (!this.ctx) {
      throw new Error('Failed to get 2D context from canvas')
    }

    this.width = canvasElement.width
    this.height = canvasElement.height
    this.lineWidth = 1

    // Apply default font
    this.ctx.font = `${GRID_CONFIG.FONT_SIZE_PX}px ${GRID_CONFIG.FONT_FAMILY}`
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'

    console.log('[Renderer] Initialized:', `${this.width}×${this.height}px`)
  }

  /**
   * Clear the canvas
   * @param {string} color - Background color (hex or css color)
   */
  clear(color = COLORS.BG) {
    this.ctx.fillStyle = color
    this.ctx.fillRect(0, 0, this.width, this.height)
  }

  /**
   * Draw a filled rectangle in grid coordinates
   * @param {number} x - Grid X coordinate
   * @param {number} y - Grid Y coordinate
   * @param {number} width - Width in pixels
   * @param {number} height - Height in pixels
   * @param {string} color - Fill color (hex or css color)
   */
  drawRect(x, y, width, height, color) {
    this.ctx.fillStyle = color
    this.ctx.fillRect(x, y, width, height)
  }

  /**
   * Draw a line
   * @param {number} x1 - Starting X pixel
   * @param {number} y1 - Starting Y pixel
   * @param {number} x2 - Ending X pixel
   * @param {number} y2 - Ending Y pixel
   * @param {string} color - Line color (hex or css color)
   */
  drawLine(x1, y1, x2, y2, color) {
    this.ctx.strokeStyle = color
    this.ctx.lineWidth = this.lineWidth
    this.ctx.beginPath()
    this.ctx.moveTo(x1, y1)
    this.ctx.lineTo(x2, y2)
    this.ctx.stroke()
  }

  /**
   * Draw text
   * @param {string} text - Text to draw
   * @param {number} x - X pixel coordinate
   * @param {number} y - Y pixel coordinate
   * @param {string} color - Text color (hex or css color)
   * @param {string} align - Text alignment ('left', 'center', 'right')
   */
  drawText(text, x, y, color, align = 'center') {
    this.ctx.fillStyle = color
    this.ctx.textAlign = align
    this.ctx.fillText(text, x, y)
  }

  /**
   * Set line width for subsequent line draws
   * @param {number} width - Line width in pixels
   */
  setLineWidth(width) {
    this.lineWidth = width
    this.ctx.lineWidth = width
  }

  /**
   * Draw a circle
   * @param {number} x - Center X pixel
   * @param {number} y - Center Y pixel
   * @param {number} radius - Radius in pixels
   * @param {string} color - Fill color
   */
  drawCircle(x, y, radius, color) {
    this.ctx.fillStyle = color
    this.ctx.beginPath()
    this.ctx.arc(x, y, radius, 0, Math.PI * 2)
    this.ctx.fill()
  }

  /**
   * Draw a circle outline
   * @param {number} x - Center X pixel
   * @param {number} y - Center Y pixel
   * @param {number} radius - Radius in pixels
   * @param {string} color - Stroke color
   */
  drawCircleOutline(x, y, radius, color) {
    this.ctx.strokeStyle = color
    this.ctx.lineWidth = this.lineWidth
    this.ctx.beginPath()
    this.ctx.arc(x, y, radius, 0, Math.PI * 2)
    this.ctx.stroke()
  }

  /**
   * Draw a polygon (array of points)
   * @param {Array<{x, y}>} points - Array of {x, y} points
   * @param {string} color - Fill color
   */
  drawPolygon(points, color) {
    if (!points || points.length < 3) return

    this.ctx.fillStyle = color
    this.ctx.beginPath()
    this.ctx.moveTo(points[0].x, points[0].y)

    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i].x, points[i].y)
    }

    this.ctx.closePath()
    this.ctx.fill()
  }

  /**
   * Draw a triangle (convenience method)
   * @param {number} x1 - First point X
   * @param {number} y1 - First point Y
   * @param {number} x2 - Second point X
   * @param {number} y2 - Second point Y
   * @param {number} x3 - Third point X
   * @param {number} y3 - Third point Y
   * @param {string} color - Fill color
   */
  drawTriangle(x1, y1, x2, y2, x3, y3, color) {
    this.drawPolygon([
      { x: x1, y: y1 },
      { x: x2, y: y2 },
      { x: x3, y: y3 }
    ], color)
  }

  /**
   * Get canvas dimensions
   * @returns {Object} {width, height}
   */
  getDimensions() {
    return { width: this.width, height: this.height }
  }

  /**
   * Convert grid coordinates to pixel coordinates
   * @param {number} gridX - Grid X
   * @param {number} gridY - Grid Y
   * @returns {Object} {x, y} in pixels
   */
  gridToPixels(gridX, gridY) {
    return {
      x: gridX * GRID_CONFIG.CELL_WIDTH_PX,
      y: gridY * GRID_CONFIG.CELL_HEIGHT_PX
    }
  }

  /**
   * Convert pixel coordinates to grid coordinates
   * @param {number} pixelX - Pixel X
   * @param {number} pixelY - Pixel Y
   * @returns {Object} {x, y} in grid coordinates
   */
  pixelsToGrid(pixelX, pixelY) {
    return {
      x: Math.floor(pixelX / GRID_CONFIG.CELL_WIDTH_PX),
      y: Math.floor(pixelY / GRID_CONFIG.CELL_HEIGHT_PX)
    }
  }

  /**
   * Save current rendering context state
   */
  save() {
    this.ctx.save()
  }

  /**
   * Restore previous rendering context state
   */
  restore() {
    this.ctx.restore()
  }
}
