/**
 * @fileoverview Entity rendering for lamps, targets, and mirrors
 * @module rendering/entity-renderer
 */

import { SYMBOLS, COLORS, DIRECTIONS } from '../utils/constants.js'

/**
 * EntityRenderer class - handles rendering of game entities
 * @class EntityRenderer
 */
export class EntityRenderer {
  /**
   * Create an entity renderer
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

    console.log('[EntityRenderer] Initialized')
  }

  /**
   * Draw a lamp (light source)
   * @param {number} x - Grid X coordinate
   * @param {number} y - Grid Y coordinate
   * @param {string} direction - Direction (N, S, E, W)
   */
  drawLamp(x, y, direction) {
    const symbol = this.getDirectionalSymbol('LAMP', direction)
    const px = x * this.gridRenderer.cellWidth + this.gridRenderer.cellWidth / 2
    const py = y * this.gridRenderer.cellHeight + this.gridRenderer.cellHeight / 2

    // Draw lamp background circle
    this.renderer.drawCircle(px, py, 6, COLORS.ACCENT)

    // Draw lamp symbol
    this.renderer.drawText(symbol, px, py, COLORS.BG)
  }

  /**
   * Draw a target (goal)
   * @param {number} x - Grid X coordinate
   * @param {number} y - Grid Y coordinate
   * @param {string} direction - Direction (N, S, E, W)
   */
  drawTarget(x, y, direction) {
    const symbol = this.getDirectionalSymbol('TARGET', direction)
    const px = x * this.gridRenderer.cellWidth + this.gridRenderer.cellWidth / 2
    const py = y * this.gridRenderer.cellHeight + this.gridRenderer.cellHeight / 2

    // Draw target background circle
    this.renderer.drawCircleOutline(px, py, 6, COLORS.ACCENT)

    // Draw target symbol
    this.renderer.drawText(symbol, px, py, COLORS.ACCENT)
  }

  /**
   * Draw a mirror
   * @param {number} x - Grid X coordinate
   * @param {number} y - Grid Y coordinate
   * @param {string} type - Mirror type ('/' or '\')
   */
  drawMirror(x, y, type) {
    const symbol = type === '/' ? SYMBOLS.MIRROR_SLASH : SYMBOLS.MIRROR_BACKSLASH
    const px = x * this.gridRenderer.cellWidth + this.gridRenderer.cellWidth / 2
    const py = y * this.gridRenderer.cellHeight + this.gridRenderer.cellHeight / 2

    // Draw mirror symbol
    this.renderer.drawText(symbol, px, py, '#888888')
  }

  /**
   * Draw an illuminated cell (for visibility map)
   * @param {number} x - Grid X coordinate
   * @param {number} y - Grid Y coordinate
   */
  drawIlluminatedCell(x, y) {
    const px = x * this.gridRenderer.cellWidth
    const py = y * this.gridRenderer.cellHeight

    // Draw semi-transparent overlay
    this.renderer.ctx.globalAlpha = 0.15
    this.renderer.drawRect(px, py, this.gridRenderer.cellWidth, this.gridRenderer.cellHeight, COLORS.BEAM)
    this.renderer.ctx.globalAlpha = 1.0
  }

  /**
   * Draw all lamps in a level
   * @param {Level} level - The Level object
   */
  drawAllLamps(level) {
    if (level.lamp) {
      this.drawLamp(level.lamp.x, level.lamp.y, level.lamp.direction)
    }
  }

  /**
   * Draw all targets in a level
   * @param {Level} level - The Level object
   */
  drawAllTargets(level) {
    if (level.target) {
      this.drawTarget(level.target.x, level.target.y, level.target.direction)
    }
  }

  /**
   * Draw all mirrors
   * @param {Object} mirrors - Map of mirrors
   */
  drawAllMirrors(mirrors) {
    Object.values(mirrors).forEach(mirror => {
      this.drawMirror(mirror.x, mirror.y, mirror.type)
    })
  }

  /**
   * Draw all illuminated cells
   * @param {Set} illuminatedCells - Set of 'x,y' coordinates
   */
  drawAllIlluminatedCells(illuminatedCells) {
    illuminatedCells.forEach(cellKey => {
      const [x, y] = cellKey.split(',').map(Number)
      this.drawIlluminatedCell(x, y)
    })
  }

  /**
   * Get directional symbol for entity
   * @param {string} entityType - Entity type (LAMP, TARGET)
   * @param {string} direction - Direction (N, S, E, W)
   * @returns {string} Symbol character
   * @private
   */
  getDirectionalSymbol(entityType, direction) {
    const key = `${entityType}_${direction}`
    return SYMBOLS[key] || '?'
  }

  /**
   * Draw complete level entities
   * @param {Level} level - The Level object
   * @param {Object} mirrors - Map of mirrors
   * @param {Set} illuminatedCells - Illuminated cells (optional)
   */
  drawLevelEntities(level, mirrors = {}, illuminatedCells = null) {
    // Draw illuminated cells first (background)
    if (illuminatedCells && illuminatedCells.size > 0) {
      this.drawAllIlluminatedCells(illuminatedCells)
    }

    // Draw mirrors
    this.drawAllMirrors(mirrors)

    // Draw lamp
    this.drawAllLamps(level)

    // Draw target
    this.drawAllTargets(level)
  }
}
