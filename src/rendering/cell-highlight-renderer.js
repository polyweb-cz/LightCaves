/**
 * @fileoverview Cell highlighting and interaction visualization
 * @module rendering/cell-highlight-renderer
 */

import { COLORS } from '../utils/constants.js'

/**
 * CellHighlightRenderer class - handles cell highlighting and interaction effects
 * @class CellHighlightRenderer
 */
export class CellHighlightRenderer {
  /**
   * Create a cell highlight renderer
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

    // Highlight type configurations
    this.highlightTypes = {
      hover: { color: '#FFFF00', opacity: 0.3, name: 'HOVER' },
      selected: { color: '#00FF00', opacity: 0.5, name: 'SELECTED' },
      valid_placement: { color: '#00FF00', opacity: 0.2, name: 'VALID_PLACEMENT' },
      invalid: { color: '#FF0000', opacity: 0.4, name: 'INVALID' },
      target: { color: '#00FFFF', opacity: 0.3, name: 'TARGET' },
      beam_path: { color: '#FFFF00', opacity: 0.15, name: 'BEAM_PATH' }
    }

    console.log('[CellHighlightRenderer] Initialized')
  }

  /**
   * Draw a cell highlight of specified type
   * @param {number} x - Grid X coordinate
   * @param {number} y - Grid Y coordinate
   * @param {string} type - Highlight type (hover, selected, valid_placement, invalid, target, beam_path)
   */
  drawCellHighlight(x, y, type) {
    const config = this.highlightTypes[type]
    if (!config) {
      console.warn(`[CellHighlightRenderer] Unknown highlight type: ${type}`)
      return
    }

    const px = x * this.gridRenderer.cellWidth
    const py = y * this.gridRenderer.cellHeight

    // Set transparency
    this.renderer.ctx.globalAlpha = config.opacity

    // Draw highlight rectangle
    this.renderer.drawRect(
      px,
      py,
      this.gridRenderer.cellWidth,
      this.gridRenderer.cellHeight,
      config.color
    )

    // Reset transparency
    this.renderer.ctx.globalAlpha = 1.0
  }

  /**
   * Draw hover effect on a cell
   * @param {number} x - Grid X coordinate
   * @param {number} y - Grid Y coordinate
   */
  drawHoverCell(x, y) {
    this.drawCellHighlight(x, y, 'hover')
  }

  /**
   * Draw selected cell indicator
   * @param {number} x - Grid X coordinate
   * @param {number} y - Grid Y coordinate
   */
  drawSelectedCell(x, y) {
    this.drawCellHighlight(x, y, 'selected')
  }

  /**
   * Draw valid placement indicator
   * @param {number} x - Grid X coordinate
   * @param {number} y - Grid Y coordinate
   */
  drawValidPlacement(x, y) {
    this.drawCellHighlight(x, y, 'valid_placement')
  }

  /**
   * Draw invalid cell indicator
   * @param {number} x - Grid X coordinate
   * @param {number} y - Grid Y coordinate
   */
  drawInvalidCell(x, y) {
    this.drawCellHighlight(x, y, 'invalid')
  }

  /**
   * Draw target cell highlight
   * @param {number} x - Grid X coordinate
   * @param {number} y - Grid Y coordinate
   */
  drawTargetHighlight(x, y) {
    this.drawCellHighlight(x, y, 'target')
  }

  /**
   * Draw beam path highlight
   * @param {number} x - Grid X coordinate
   * @param {number} y - Grid Y coordinate
   */
  drawBeamPathHighlight(x, y) {
    this.drawCellHighlight(x, y, 'beam_path')
  }

  /**
   * Draw all highlights from a collection
   * @param {Array<Object>} highlights - Array of {x, y, type}
   */
  drawAllHighlights(highlights = []) {
    if (!Array.isArray(highlights)) {
      console.warn('[CellHighlightRenderer] Highlights must be an array')
      return
    }

    highlights.forEach(highlight => {
      if (highlight.x !== undefined && highlight.y !== undefined && highlight.type) {
        this.drawCellHighlight(highlight.x, highlight.y, highlight.type)
      }
    })
  }

  /**
   * Draw highlights from multiple categories
   * @param {Object} highlightMap - Map of type -> coordinates array
   */
  drawHighlightMap(highlightMap = {}) {
    Object.entries(highlightMap).forEach(([type, coords]) => {
      if (Array.isArray(coords)) {
        coords.forEach(([x, y]) => {
          this.drawCellHighlight(x, y, type)
        })
      }
    })
  }

  /**
   * Draw focus border around a cell
   * @param {number} x - Grid X coordinate
   * @param {number} y - Grid Y coordinate
   * @param {string} color - Border color
   */
  drawCellBorder(x, y, color = COLORS.ACCENT) {
    const px = x * this.gridRenderer.cellWidth
    const py = y * this.gridRenderer.cellHeight
    const width = this.gridRenderer.cellWidth
    const height = this.gridRenderer.cellHeight

    // Draw border lines
    const cornerSize = 2

    // Top-left corner
    this.renderer.drawText('┌', px, py, color)
    this.renderer.drawText('─', px + cornerSize, py, color)

    // Top-right corner
    this.renderer.drawText('┐', px + width, py, color)
    this.renderer.drawText('─', px + width - cornerSize, py, color)

    // Bottom-left corner
    this.renderer.drawText('└', px, py + height, color)
    this.renderer.drawText('─', px + cornerSize, py + height, color)

    // Bottom-right corner
    this.renderer.drawText('┘', px + width, py + height, color)
    this.renderer.drawText('─', px + width - cornerSize, py + height, color)
  }

  /**
   * Draw a group of cells with highlighting
   * @param {Set<string>} cellSet - Set of 'x,y' coordinates
   * @param {string} type - Highlight type for all cells
   */
  drawCellSet(cellSet = new Set(), type = 'valid_placement') {
    cellSet.forEach(cellKey => {
      const [x, y] = cellKey.split(',').map(Number)
      if (!isNaN(x) && !isNaN(y)) {
        this.drawCellHighlight(x, y, type)
      }
    })
  }

  /**
   * Draw hint indicator for a cell (e.g., question mark for unknown cells)
   * @param {number} x - Grid X coordinate
   * @param {number} y - Grid Y coordinate
   * @param {string} symbol - Symbol to display ('?' or other)
   */
  drawCellHint(x, y, symbol = '?') {
    const px = x * this.gridRenderer.cellWidth + this.gridRenderer.cellWidth / 2
    const py = y * this.gridRenderer.cellHeight + this.gridRenderer.cellHeight / 2

    this.renderer.drawText(symbol, px, py, COLORS.TEXT)
  }

  /**
   * Draw region selection (rectangle from point A to point B)
   * @param {number} x1 - Start X
   * @param {number} y1 - Start Y
   * @param {number} x2 - End X
   * @param {number} y2 - End Y
   * @param {string} type - Highlight type
   */
  drawRegionSelection(x1, y1, x2, y2, type = 'selected') {
    const minX = Math.min(x1, x2)
    const maxX = Math.max(x1, x2)
    const minY = Math.min(y1, y2)
    const maxY = Math.max(y1, y2)

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        this.drawCellHighlight(x, y, type)
      }
    }
  }

  /**
   * Clear all active highlights
   * @param {Object} highlightMap - Map to clear (sets all to empty arrays)
   * @returns {Object} Cleared highlight map
   */
  clearHighlights(highlightMap = {}) {
    const cleared = {}
    Object.keys(highlightMap).forEach(key => {
      cleared[key] = []
    })
    return cleared
  }

  /**
   * Get highlight type at coordinates
   * @param {number} x - Grid X coordinate
   * @param {number} y - Grid Y coordinate
   * @param {Object} highlightMap - Current highlight map
   * @returns {string|null} Highlight type or null
   */
  getHighlightAtPoint(x, y, highlightMap = {}) {
    const key = `${x},${y}`

    for (const [type, coords] of Object.entries(highlightMap)) {
      if (Array.isArray(coords)) {
        const found = coords.some(([cx, cy]) => cx === x && cy === y)
        if (found) return type
      }
    }

    return null
  }
}
