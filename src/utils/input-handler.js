/**
 * @fileoverview Input handling for keyboard and mouse events
 * @module utils/input-handler
 */

import { GRID_CONFIG } from './constants.js'

/**
 * InputHandler class - manages user input (keyboard + mouse)
 * @class InputHandler
 */
export class InputHandler {
  /**
   * Create an input handler
   * @param {HTMLCanvasElement} canvas - The game canvas
   */
  constructor(canvas) {
    if (!canvas) {
      throw new Error('Invalid canvas element')
    }

    this.canvas = canvas
    this.pressedKeys = new Set()
    this.eventCallbacks = new Map()

    // Mouse state
    this.lastMousePos = { x: 0, y: 0 }

    // Register event listeners
    this.setupEventListeners()

    console.log('[InputHandler] Initialized')
  }

  /**
   * Setup all event listeners
   * @private
   */
  setupEventListeners() {
    // Store bound methods for later removal
    this.boundHandleKeyDown = this.handleKeyDown.bind(this)
    this.boundHandleKeyUp = this.handleKeyUp.bind(this)
    this.boundHandleMouseClick = this.handleMouseClick.bind(this)
    this.boundHandleMouseMove = this.handleMouseMove.bind(this)
    this.boundHandleRightClick = this.handleRightClick.bind(this)

    // Keyboard events
    document.addEventListener('keydown', this.boundHandleKeyDown)
    document.addEventListener('keyup', this.boundHandleKeyUp)

    // Mouse events
    this.canvas.addEventListener('click', this.boundHandleMouseClick)
    this.canvas.addEventListener('mousemove', this.boundHandleMouseMove)
    this.canvas.addEventListener('contextmenu', this.boundHandleRightClick)

    // Prevent context menu on canvas
    this.canvas.addEventListener('contextmenu', e => e.preventDefault())
  }

  /**
   * Handle keydown event
   * @param {KeyboardEvent} event
   * @private
   */
  handleKeyDown(event) {
    const key = event.code || event.key

    if (!this.pressedKeys.has(key)) {
      this.pressedKeys.add(key)
      this.triggerCallback('keydown', { key, originalEvent: event })
    }
  }

  /**
   * Handle keyup event
   * @param {KeyboardEvent} event
   * @private
   */
  handleKeyUp(event) {
    const key = event.code || event.key
    this.pressedKeys.delete(key)
    this.triggerCallback('keyup', { key, originalEvent: event })
  }

  /**
   * Handle mouse click event
   * @param {MouseEvent} event
   * @private
   */
  handleMouseClick(event) {
    const { gridX, gridY } = this.pixelsToGrid(event.offsetX, event.offsetY)
    this.triggerCallback('mouseClick', { gridX, gridY, originalEvent: event })
  }

  /**
   * Handle mouse move event
   * @param {MouseEvent} event
   * @private
   */
  handleMouseMove(event) {
    const { gridX, gridY } = this.pixelsToGrid(event.offsetX, event.offsetY)
    this.lastMousePos = { x: gridX, y: gridY }
    this.triggerCallback('mouseMove', { gridX, gridY, originalEvent: event })
  }

  /**
   * Handle right click (context menu)
   * @param {MouseEvent} event
   * @private
   */
  handleRightClick(event) {
    event.preventDefault()
    const { gridX, gridY } = this.pixelsToGrid(event.offsetX, event.offsetY)
    this.triggerCallback('rightClick', { gridX, gridY, originalEvent: event })
  }

  /**
   * Convert pixel coordinates to grid coordinates
   * @param {number} pixelX - Pixel X coordinate
   * @param {number} pixelY - Pixel Y coordinate
   * @returns {Object} Grid coordinates {gridX, gridY}
   */
  pixelsToGrid(pixelX, pixelY) {
    const gridX = Math.floor(pixelX / GRID_CONFIG.CELL_WIDTH_PX)
    const gridY = Math.floor(pixelY / GRID_CONFIG.CELL_HEIGHT_PX)

    return { gridX, gridY }
  }

  /**
   * Convert grid coordinates to pixel coordinates
   * @param {number} gridX - Grid X coordinate
   * @param {number} gridY - Grid Y coordinate
   * @returns {Object} Pixel coordinates {pixelX, pixelY}
   */
  gridToPixels(gridX, gridY) {
    const pixelX = gridX * GRID_CONFIG.CELL_WIDTH_PX
    const pixelY = gridY * GRID_CONFIG.CELL_HEIGHT_PX

    return { pixelX, pixelY }
  }

  /**
   * Check if a key is currently pressed
   * @param {string} key - Key code or name
   * @returns {boolean} True if key is pressed
   */
  isKeyPressed(key) {
    return this.pressedKeys.has(key)
  }

  /**
   * Register callback for event
   * @param {string} eventType - Event type (mouseClick, keydown, keyup, mouseMove, rightClick)
   * @param {Function} callback - Callback function
   */
  on(eventType, callback) {
    if (!this.eventCallbacks.has(eventType)) {
      this.eventCallbacks.set(eventType, [])
    }

    this.eventCallbacks.get(eventType).push(callback)
  }

  /**
   * Remove callback for event
   * @param {string} eventType - Event type
   * @param {Function} callback - Callback function to remove
   */
  off(eventType, callback) {
    if (!this.eventCallbacks.has(eventType)) {
      return
    }

    const callbacks = this.eventCallbacks.get(eventType)
    const index = callbacks.indexOf(callback)

    if (index > -1) {
      callbacks.splice(index, 1)
    }
  }

  /**
   * Trigger event callbacks
   * @param {string} eventType - Event type
   * @param {Object} data - Event data
   * @private
   */
  triggerCallback(eventType, data) {
    if (!this.eventCallbacks.has(eventType)) {
      return
    }

    this.eventCallbacks.get(eventType).forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error(`[InputHandler] Callback error for ${eventType}:`, error)
      }
    })
  }

  /**
   * Get last mouse position on grid
   * @returns {Object} Last mouse grid position {gridX, gridY}
   */
  getLastMousePos() {
    return { ...this.lastMousePos }
  }

  /**
   * Bind keyboard shortcut
   * @param {string} key - Key code to bind
   * @param {Function} action - Action to perform
   */
  bindKey(key, action) {
    this.on('keydown', data => {
      if (data.key === key) {
        action()
      }
    })
  }

  /**
   * Unbind keyboard shortcut
   * @param {string} key - Key code to unbind
   */
  unbindKey(key) {
    // Note: Current implementation doesn't store bindings separately
    // This is a placeholder for potential future optimization
  }

  /**
   * Get all currently pressed keys
   * @returns {Array<string>} Array of pressed key codes
   */
  getPressedKeys() {
    return Array.from(this.pressedKeys)
  }

  /**
   * Clear all pressed keys (useful for focus loss)
   */
  clearPressedKeys() {
    this.pressedKeys.clear()
  }

  /**
   * Check if a modifier key is pressed
   * @returns {boolean} True if Ctrl, Cmd, Alt, or Shift is pressed
   */
  isModifierPressed() {
    return (
      this.isKeyPressed('ControlLeft') ||
      this.isKeyPressed('ControlRight') ||
      this.isKeyPressed('MetaLeft') ||
      this.isKeyPressed('MetaRight') ||
      this.isKeyPressed('AltLeft') ||
      this.isKeyPressed('AltRight') ||
      this.isKeyPressed('ShiftLeft') ||
      this.isKeyPressed('ShiftRight')
    )
  }

  /**
   * Destroy input handler and remove listeners
   */
  destroy() {
    if (this.boundHandleKeyDown) {
      document.removeEventListener('keydown', this.boundHandleKeyDown)
      document.removeEventListener('keyup', this.boundHandleKeyUp)
      this.canvas.removeEventListener('click', this.boundHandleMouseClick)
      this.canvas.removeEventListener('mousemove', this.boundHandleMouseMove)
      this.canvas.removeEventListener('contextmenu', this.boundHandleRightClick)
    }
    this.eventCallbacks.clear()
    this.pressedKeys.clear()
  }
}
