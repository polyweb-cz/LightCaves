/**
 * @fileoverview Game state management for levels
 * @module game/game-state
 */

/**
 * GameState class - tracks level completion and mirror placement
 * @class GameState
 */
export class GameState {
  /**
   * Create game state for a level
   * @param {Level} level - The level object
   */
  constructor(level) {
    if (!level) {
      throw new Error('Invalid level: must provide a valid Level object')
    }

    this.level = level
    this.mirrors = {} // Map of mirrors: {'x,y': {type, x, y}}
    this.isComplete = false

    console.log('[GameState] Initialized for level:', this.level.metadata.name || 'Unnamed')
  }

  /**
   * Add a mirror to the game state
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {string} type - Mirror type ('/' or '\')
   * @returns {boolean} True if mirror was added, false if invalid
   */
  addMirror(x, y, type) {
    // Validate coordinates
    if (!Number.isInteger(x) || !Number.isInteger(y)) {
      console.warn('[GameState] Invalid mirror coordinates:', x, y)
      return false
    }

    if (!this.level.isValidPosition(x, y)) {
      console.warn('[GameState] Mirror position out of bounds:', x, y)
      return false
    }

    // Validate mirror type
    if (type !== '/' && type !== '\\') {
      console.warn('[GameState] Invalid mirror type:', type)
      return false
    }

    // Check if cell is empty
    if (!this.level.isEmptyCell(x, y)) {
      console.warn('[GameState] Cannot place mirror on non-empty cell:', x, y)
      return false
    }

    // Check max mirrors
    if (this.getMirrorCount() >= this.level.metadata.maxMirrors) {
      console.warn('[GameState] Reached maximum mirrors:', this.level.metadata.maxMirrors)
      return false
    }

    const key = `${x},${y}`
    this.mirrors[key] = { type, x, y }
    console.log('[GameState] Mirror added at', key, 'type:', type)
    return true
  }

  /**
   * Remove a mirror from the game state
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {boolean} True if mirror was removed, false if not found
   */
  removeMirror(x, y) {
    const key = `${x},${y}`
    if (this.mirrors[key]) {
      delete this.mirrors[key]
      console.log('[GameState] Mirror removed at', key)
      return true
    }
    return false
  }

  /**
   * Get mirror at position
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {Object|null} Mirror object or null if not found
   */
  getMirror(x, y) {
    const key = `${x},${y}`
    return this.mirrors[key] || null
  }

  /**
   * Update level completion status
   * @param {boolean} isComplete - Whether level is completed
   */
  updateCompletion(isComplete) {
    this.isComplete = isComplete
    console.log('[GameState] Completion status:', isComplete ? 'COMPLETE' : 'INCOMPLETE')
  }

  /**
   * Get current mirror count
   * @returns {number} Number of mirrors placed
   */
  getMirrorCount() {
    return Object.keys(this.mirrors).length
  }

  /**
   * Get maximum allowed mirrors
   * @returns {number} Maximum mirrors allowed
   */
  getMaxMirrors() {
    return this.level.metadata.maxMirrors || 0
  }

  /**
   * Get remaining mirrors available
   * @returns {number} Remaining mirrors
   */
  getRemainingMirrors() {
    return Math.max(0, this.getMaxMirrors() - this.getMirrorCount())
  }

  /**
   * Get all placed mirrors
   * @returns {Object} Map of mirrors
   */
  getMirrors() {
    return { ...this.mirrors }
  }

  /**
   * Clear all mirrors
   */
  clearMirrors() {
    this.mirrors = {}
    console.log('[GameState] All mirrors cleared')
  }

  /**
   * Reset level to initial state
   */
  reset() {
    this.mirrors = {}
    this.isComplete = false
    console.log('[GameState] Reset to initial state')
  }

  /**
   * Get game state info
   * @returns {string} Info string
   */
  toString() {
    return `GameState: ${this.getMirrorCount()}/${this.getMaxMirrors()} mirrors, ${this.isComplete ? 'COMPLETE' : 'incomplete'}`
  }
}
