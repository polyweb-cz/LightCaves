/**
 * @fileoverview Grid rendering for game level
 * @module rendering/grid-renderer
 */

import { GRID_CONFIG, CELL_TYPES, COLORS } from '../utils/constants.js'

/**
 * GridRenderer class - handles rendering of level grid
 * @class GridRenderer
 */
export class GridRenderer {
  /**
   * Create a grid renderer
   * @param {Renderer} renderer - The Renderer instance
   * @param {Level} level - The Level object to render
   */
  constructor(renderer, level) {
    if (!renderer) {
      throw new Error('Invalid renderer')
    }
    if (!level) {
      throw new Error('Invalid level')
    }

    this.renderer = renderer
    this.level = level
    this.cellWidth = GRID_CONFIG.CELL_WIDTH_PX
    this.cellHeight = GRID_CONFIG.CELL_HEIGHT_PX

    console.log('[GridRenderer] Initialized for', level.metadata.name || 'Unnamed')
  }

  /**
   * Draw the entire grid
   */
  drawGrid() {
    // Draw all cells
    for (let y = 0; y < this.level.height; y++) {
      for (let x = 0; x < this.level.width; x++) {
        this.drawCell(x, y)
      }
    }

    // Optional: Draw grid lines
    this.drawGridLines()
  }

  /**
   * Draw a single cell
   * @param {number} x - Grid X coordinate
   * @param {number} y - Grid Y coordinate
   */
  drawCell(x, y) {
    const cellType = this.level.getCellType(x, y)

    // Calculate pixel coordinates
    const px = x * this.cellWidth
    const py = y * this.cellHeight

    // Determine color based on cell type
    let color = COLORS.BG

    if (cellType === CELL_TYPES.WALL) {
      color = '#333333' // Dark gray for walls
    } else if (cellType === CELL_TYPES.EMPTY) {
      color = COLORS.BG
    }

    // Draw the cell
    this.renderer.drawRect(px, py, this.cellWidth, this.cellHeight, color)
  }

  /**
   * Draw grid lines for visual reference
   * @private
   */
  drawGridLines() {
    this.renderer.setLineWidth(0.5)

    const gridColor = '#1a1a1a' // Very dark gray

    // Vertical lines
    for (let x = 0; x <= this.level.width; x++) {
      const px = x * this.cellWidth
      const py1 = 0
      const py2 = this.level.height * this.cellHeight

      this.renderer.drawLine(px, py1, px, py2, gridColor)
    }

    // Horizontal lines
    for (let y = 0; y <= this.level.height; y++) {
      const py = y * this.cellHeight
      const px1 = 0
      const px2 = this.level.width * this.cellWidth

      this.renderer.drawLine(px1, py, px2, py, gridColor)
    }

    // Reset line width
    this.renderer.setLineWidth(1)
  }

  /**
   * Draw a single cell with custom color
   * @param {number} x - Grid X coordinate
   * @param {number} y - Grid Y coordinate
   * @param {string} color - Color to use
   */
  drawCellWithColor(x, y, color) {
    const px = x * this.cellWidth
    const py = y * this.cellHeight

    this.renderer.drawRect(px, py, this.cellWidth, this.cellHeight, color)
  }

  /**
   * Highlight a cell (useful for debugging/selection)
   * @param {number} x - Grid X coordinate
   * @param {number} y - Grid Y coordinate
   * @param {string} color - Highlight color
   */
  highlightCell(x, y, color = '#FF00FF') {
    const px = x * this.cellWidth
    const py = y * this.cellHeight

    // Draw semi-transparent overlay
    this.renderer.ctx.globalAlpha = 0.3
    this.renderer.drawRect(px, py, this.cellWidth, this.cellHeight, color)
    this.renderer.ctx.globalAlpha = 1.0
  }

  /**
   * Get cell dimensions
   * @returns {Object} {width, height}
   */
  getCellDimensions() {
    return {
      width: this.cellWidth,
      height: this.cellHeight
    }
  }

  /**
   * Get grid dimensions in pixels
   * @returns {Object} {width, height}
   */
  getGridDimensions() {
    return {
      width: this.level.width * this.cellWidth,
      height: this.level.height * this.cellHeight
    }
  }

  /**
   * Convert grid coordinates to pixel coordinates
   * @param {number} gridX - Grid X
   * @param {number} gridY - Grid Y
   * @returns {Object} {x, y} in pixels
   */
  gridToPixels(gridX, gridY) {
    return {
      x: gridX * this.cellWidth,
      y: gridY * this.cellHeight
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
      x: Math.floor(pixelX / this.cellWidth),
      y: Math.floor(pixelY / this.cellHeight)
    }
  }
}
