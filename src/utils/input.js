/**
 * @fileoverview Input handling (mouse, keyboard)
 * @module utils/input
 */

/**
 * InputManager - handles all user input
 * @class InputManager
 */
export class InputManager {
  constructor() {
    this.listeners = new Map()
    console.log('[Input] Initialized')
  }

  /**
   * Register input listener
   * @param {string} eventType - 'click', 'rightclick', 'keydown', etc.
   * @param {Function} callback - Handler function
   */
  on(eventType, callback) {
    console.log('[Input] Registered listener:', eventType)
    // TODO: Implement in Epic 1.7+
  }

  /**
   * Get mouse position on canvas
   * @param {MouseEvent} event - Mouse event
   * @param {HTMLCanvasElement} canvas - Canvas element
   * @returns {Object} {x, y, gridX, gridY}
   */
  static getMousePosition(event, canvas) {
    console.log('[Input] Getting mouse position')
    // TODO: Implement in Epic 1.7+
    return { x: 0, y: 0, gridX: 0, gridY: 0 }
  }
}
