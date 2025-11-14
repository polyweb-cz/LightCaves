/**
 * @fileoverview Level data model and representation
 * @module game/level
 */

import { GRID_CONFIG, CELL_TYPES, DIRECTIONS } from '../utils/constants.js'
import { Physics } from './physics.js'

/**
 * Level class - represents a single level/puzzle
 * @class Level
 */
export class Level {
  /**
   * Create a level from data
   * @param {Object} mapData - Level data
   * @param {number} mapData.width - Grid width in cells
   * @param {number} mapData.height - Grid height in cells
   * @param {Array<Array>} mapData.grid - 2D array of cell types
   * @param {Object} mapData.lamp - {x, y, direction}
   * @param {Object} mapData.target - {x, y, direction}
   * @param {Object} mapData.metadata - {name, difficulty, maxMirrors}
   */
  constructor(mapData) {
    if (!mapData || !mapData.grid) {
      throw new Error('Invalid mapData: missing grid')
    }

    this.width = mapData.width || mapData.grid[0]?.length || 0
    this.height = mapData.height || mapData.grid.length || 0
    this.grid = mapData.grid
    this.lamp = mapData.lamp
    this.target = mapData.target
    this.metadata = mapData.metadata || {}

    // Gameplay state
    this.mirrors = []
    this.illuminatedCells = new Set()

    this._validate()
    console.log(`[Level] Created: ${this.metadata.name || 'Unnamed'} (${this.width}×${this.height})`)
  }

  /**
   * Validate level data
   * @private
   */
  _validate() {
    // Check grid dimensions
    if (this.width < GRID_CONFIG.MIN_WIDTH || this.width > GRID_CONFIG.MAX_WIDTH) {
      throw new Error(`Invalid width: ${this.width} (min: ${GRID_CONFIG.MIN_WIDTH}, max: ${GRID_CONFIG.MAX_WIDTH})`)
    }

    if (this.height < GRID_CONFIG.MIN_HEIGHT || this.height > GRID_CONFIG.MAX_HEIGHT) {
      throw new Error(`Invalid height: ${this.height} (min: ${GRID_CONFIG.MIN_HEIGHT}, max: ${GRID_CONFIG.MAX_HEIGHT})`)
    }

    // Check grid structure
    if (!Array.isArray(this.grid) || this.grid.length !== this.height) {
      throw new Error(`Grid height mismatch: expected ${this.height}, got ${this.grid.length}`)
    }

    for (let y = 0; y < this.height; y++) {
      if (this.grid[y].length !== this.width) {
        throw new Error(`Grid row ${y} has wrong width: expected ${this.width}, got ${this.grid[y].length}`)
      }
    }

    // Check lamp and target positions
    if (!this.lamp || !this._isValidPosition(this.lamp.x, this.lamp.y)) {
      throw new Error('Invalid lamp position')
    }

    if (!this.target || !this._isValidPosition(this.target.x, this.target.y)) {
      throw new Error('Invalid target position')
    }

    // Check directions
    const validDirections = Object.values(DIRECTIONS)
    if (!validDirections.includes(this.lamp.direction)) {
      throw new Error(`Invalid lamp direction: ${this.lamp.direction}`)
    }

    if (!validDirections.includes(this.target.direction)) {
      throw new Error(`Invalid target direction: ${this.target.direction}`)
    }
  }

  /**
   * Check if position is within grid bounds
   * @param {number} x - X coordinate (column)
   * @param {number} y - Y coordinate (row)
   * @returns {boolean}
   * @private
   */
  _isValidPosition(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height
  }

  /**
   * Check if position is within grid bounds (public)
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {boolean}
   */
  isValidPosition(x, y) {
    return this._isValidPosition(x, y)
  }

  /**
   * Get cell type at position
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {string|null} Cell type or null if out of bounds
   */
  getCellType(x, y) {
    if (!this.isValidPosition(x, y)) {
      return null
    }
    return this.grid[y][x]
  }

  /**
   * Get cell at position
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {*} Cell value or null
   */
  getCell(x, y) {
    return this.getCellType(x, y)
  }

  /**
   * Check if cell is empty (can place mirror)
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {boolean}
   */
  isEmptyCell(x, y) {
    const cellType = this.getCellType(x, y)
    return cellType === CELL_TYPES.EMPTY
  }

  /**
   * Check if cell is a wall
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {boolean}
   */
  isWall(x, y) {
    const cellType = this.getCellType(x, y)
    return cellType === CELL_TYPES.WALL
  }

  /**
   * Calculate beam path with current mirrors
   * @returns {Array} Array of illuminated cells
   */
  calculateBeamPath() {
    const physics = new Physics(this)
    const beamPath = physics.calculateBeamPath()
    return beamPath
  }

  /**
   * Get level info string
   * @returns {string}
   */
  toString() {
    return `Level: ${this.metadata.name || 'Unnamed'} (${this.width}×${this.height}, ${this.metadata.difficulty || 'unknown'})`
  }
}
