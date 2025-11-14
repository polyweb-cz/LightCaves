/**
 * @fileoverview Physics engine for beam propagation and reflection
 * @module game/physics
 */

import { DIRECTIONS, REFLECTION_TABLE } from '../utils/constants.js'

/**
 * PhysicsEngine class - handles beam propagation and reflections
 * @class PhysicsEngine
 */
export class PhysicsEngine {
  constructor() {
    console.log('[Physics] Initialized')
  }

  /**
   * Propagate beam from starting position in given direction
   * @param {Level} level - Level object
   * @param {number} startX - Starting X position
   * @param {number} startY - Starting Y position
   * @param {string} direction - Direction (N, S, E, W)
   * @param {Object} mirrors - Map of mirror positions {key: {x, y, type}}
   * @returns {Array} Array of beam path coordinates [{x, y, direction}, ...]
   */
  propagateBeam(level, startX, startY, direction, mirrors = {}) {
    let x = startX
    let y = startY
    let dir = direction
    const path = []
    const visited = new Set()
    const MAX_STEPS = 1000

    let steps = 0
    while (steps < MAX_STEPS) {
      steps++

      // Get next position
      const next = this._getNextPosition(x, y, dir)

      // Check bounds
      if (!level.isValidPosition(next.x, next.y)) {
        break
      }

      // Check wall
      if (level.isWall(next.x, next.y)) {
        break
      }

      // Move to next position
      x = next.x
      y = next.y
      path.push({ x, y, direction: dir })

      // Check for mirror
      const mirrorKey = `${x},${y}`
      if (mirrors[mirrorKey]) {
        const mirror = mirrors[mirrorKey]
        // Reflect beam
        dir = REFLECTION_TABLE[mirror.type][dir]
      }

      // Prevent infinite loops
      const stateKey = `${x},${y},${dir}`
      if (visited.has(stateKey)) {
        console.warn('[Physics] Beam cycle detected, stopping')
        break
      }
      visited.add(stateKey)
    }

    return path
  }

  /**
   * Get next position in given direction
   * @param {number} x - Current X
   * @param {number} y - Current Y
   * @param {string} direction - Direction (N, S, E, W)
   * @returns {Object} Next position {x, y}
   * @private
   */
  _getNextPosition(x, y, direction) {
    switch (direction) {
      case DIRECTIONS.N:
        return { x, y: y - 1 }
      case DIRECTIONS.S:
        return { x, y: y + 1 }
      case DIRECTIONS.E:
        return { x: x + 1, y }
      case DIRECTIONS.W:
        return { x: x - 1, y }
      default:
        return { x, y }
    }
  }

  /**
   * Calculate beam path through the map
   * @param {Level} level - Level object
   * @param {Object} mirrors - Map of placed mirrors
   * @returns {Array} Beam path coordinates
   */
  calculateBeamPath(level, mirrors = {}) {
    console.log('[Physics] Calculating beam path')
    const path = this.propagateBeam(level, level.lamp.x, level.lamp.y, level.lamp.direction, mirrors)
    return path
  }

  /**
   * Check if target is illuminated correctly
   * @param {Array} beamPath - Calculated beam path
   * @param {Object} target - Target object {x, y, direction}
   * @returns {boolean} True if target is correctly illuminated
   */
  isTargetComplete(beamPath, target) {
    if (!beamPath || beamPath.length === 0) {
      return false
    }

    // Find if target is in beam path
    const lastBeam = beamPath[beamPath.length - 1]
    const isTargetHit = lastBeam.x === target.x && lastBeam.y === target.y

    // Map direction to opposite (where beam is coming FROM)
    const oppositeDirection = {
      [DIRECTIONS.N]: DIRECTIONS.S,
      [DIRECTIONS.S]: DIRECTIONS.N,
      [DIRECTIONS.E]: DIRECTIONS.W,
      [DIRECTIONS.W]: DIRECTIONS.E
    }

    // Beam travels in a direction, arrives from opposite direction
    const beamArrivalDirection = oppositeDirection[lastBeam.direction]

    // Beam must arrive from target's expected direction
    const isCorrectDirection = beamArrivalDirection === target.direction

    return isTargetHit && isCorrectDirection
  }
}
