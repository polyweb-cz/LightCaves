/**
 * @fileoverview Beam rendering for visualization of light paths
 * @module rendering/beam-renderer
 */

import { COLORS, DIRECTIONS } from '../utils/constants.js'

/**
 * BeamRenderer class - handles rendering of light beams
 * @class BeamRenderer
 */
export class BeamRenderer {
  /**
   * Create a beam renderer
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

    console.log('[BeamRenderer] Initialized')
  }

  /**
   * Draw the entire beam path
   * @param {Array} beamPath - Array of {x, y, direction} cells
   * @param {Object} mirrors - Map of mirrors (optional, for reflection visualization)
   */
  drawBeam(beamPath, mirrors = {}) {
    if (!beamPath || beamPath.length === 0) {
      return
    }

    this.renderer.setLineWidth(3)

    // Draw line segments between consecutive cells
    for (let i = 0; i < beamPath.length; i++) {
      const cell = beamPath[i]

      // Get center of current cell
      const x = cell.x * this.gridRenderer.cellWidth + this.gridRenderer.cellWidth / 2
      const y = cell.y * this.gridRenderer.cellHeight + this.gridRenderer.cellHeight / 2

      if (i === 0) {
        // Start point - don't draw yet
        continue
      }

      const prevCell = beamPath[i - 1]
      const prevX = prevCell.x * this.gridRenderer.cellWidth + this.gridRenderer.cellWidth / 2
      const prevY = prevCell.y * this.gridRenderer.cellHeight + this.gridRenderer.cellHeight / 2

      // Check if this is a mirror cell
      const mirrorKey = `${cell.x},${cell.y}`
      const isMirror = mirrors[mirrorKey] !== undefined

      // Use different color for reflection points
      const color = isMirror ? COLORS.ACCENT : COLORS.BEAM

      // Draw line from previous to current
      this.renderer.drawLine(prevX, prevY, x, y, color)

      // Draw reflection marker if it's a mirror
      if (isMirror) {
        this.drawReflectionMarker(x, y)
      }
    }

    // Reset line width
    this.renderer.setLineWidth(1)
  }

  /**
   * Draw a reflection marker at a position
   * @param {number} x - Pixel X coordinate
   * @param {number} y - Pixel Y coordinate
   * @private
   */
  drawReflectionMarker(x, y) {
    const radius = 4
    this.renderer.drawCircle(x, y, radius, COLORS.ACCENT)
    this.renderer.drawCircleOutline(x, y, radius + 2, COLORS.ACCENT)
  }

  /**
   * Draw beam path with gradient effect
   * @param {Array} beamPath - Array of {x, y, direction} cells
   * @param {Object} mirrors - Map of mirrors
   */
  drawBeamGradient(beamPath, mirrors = {}) {
    if (!beamPath || beamPath.length === 0) {
      return
    }

    // Draw beam with varying opacity (gradient effect)
    const maxLength = beamPath.length
    const baseColor = COLORS.BEAM

    for (let i = 0; i < beamPath.length; i++) {
      const cell = beamPath[i]
      const x = cell.x * this.gridRenderer.cellWidth + this.gridRenderer.cellWidth / 2
      const y = cell.y * this.gridRenderer.cellHeight + this.gridRenderer.cellHeight / 2

      if (i === 0) continue

      const prevCell = beamPath[i - 1]
      const prevX = prevCell.x * this.gridRenderer.cellWidth + this.gridRenderer.cellWidth / 2
      const prevY = prevCell.y * this.gridRenderer.cellHeight + this.gridRenderer.cellHeight / 2

      // Opacity decreases toward the end
      const opacity = 0.3 + (i / maxLength) * 0.7
      this.renderer.ctx.globalAlpha = opacity

      this.renderer.setLineWidth(3)
      const mirrorKey = `${cell.x},${cell.y}`
      const color = mirrors[mirrorKey] ? COLORS.ACCENT : baseColor
      this.renderer.drawLine(prevX, prevY, x, y, color)

      this.renderer.ctx.globalAlpha = 1.0
    }

    this.renderer.setLineWidth(1)
  }

  /**
   * Draw endpoint indicator (usually at target)
   * @param {number} x - Grid X coordinate
   * @param {number} y - Grid Y coordinate
   * @param {boolean} isComplete - Whether target is complete
   */
  drawEndpoint(x, y, isComplete = false) {
    const px = x * this.gridRenderer.cellWidth + this.gridRenderer.cellWidth / 2
    const py = y * this.gridRenderer.cellHeight + this.gridRenderer.cellHeight / 2

    const color = isComplete ? '#00FF00' : COLORS.BEAM
    const radius = 6

    this.renderer.drawCircle(px, py, radius, color)
    this.renderer.drawCircleOutline(px, py, radius + 2, color)
  }

  /**
   * Draw direction indicator on beam cell
   * @param {number} cellX - Grid X
   * @param {number} cellY - Grid Y
   * @param {string} direction - Direction (N, S, E, W)
   */
  drawDirectionArrow(cellX, cellY, direction) {
    const x = cellX * this.gridRenderer.cellWidth + this.gridRenderer.cellWidth / 2
    const y = cellY * this.gridRenderer.cellHeight + this.gridRenderer.cellHeight / 2
    const size = 5

    let p1, p2, p3

    switch (direction) {
      case DIRECTIONS.N:
        p1 = { x: x - size, y: y + size }
        p2 = { x: x + size, y: y + size }
        p3 = { x: x, y: y - size }
        break
      case DIRECTIONS.S:
        p1 = { x: x - size, y: y - size }
        p2 = { x: x + size, y: y - size }
        p3 = { x: x, y: y + size }
        break
      case DIRECTIONS.E:
        p1 = { x: x - size, y: y - size }
        p2 = { x: x - size, y: y + size }
        p3 = { x: x + size, y: y }
        break
      case DIRECTIONS.W:
        p1 = { x: x + size, y: y - size }
        p2 = { x: x + size, y: y + size }
        p3 = { x: x - size, y: y }
        break
      default:
        return
    }

    this.renderer.drawTriangle(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y, COLORS.BEAM)
  }

  /**
   * Draw entire beam with all effects
   * @param {Array} beamPath - Beam path
   * @param {Object} options - Drawing options
   */
  drawBeamWithEffects(beamPath, options = {}) {
    const {
      showGradient = false,
      showArrows = false,
      showEndpoint = false,
      mirrors = {},
      endpointComplete = false
    } = options

    if (!beamPath || beamPath.length === 0) return

    // Draw main beam
    if (showGradient) {
      this.drawBeamGradient(beamPath, mirrors)
    } else {
      this.drawBeam(beamPath, mirrors)
    }

    // Draw direction arrows
    if (showArrows) {
      beamPath.forEach(cell => {
        this.drawDirectionArrow(cell.x, cell.y, cell.direction)
      })
    }

    // Draw endpoint indicator
    if (showEndpoint && beamPath.length > 0) {
      const lastCell = beamPath[beamPath.length - 1]
      this.drawEndpoint(lastCell.x, lastCell.y, endpointComplete)
    }
  }
}
