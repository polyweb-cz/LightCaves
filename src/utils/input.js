/**
 * @fileoverview Input handling (mouse, keyboard)
 * @module utils/input
 */

import { GRID_CONFIG } from './constants.js'

/**
 * InputManager - handles all user input with event delegation
 * @class InputManager
 */
export class InputManager {
  constructor() {
    this.listeners = new Map()
    this.mouseDown = false
    console.log('[Input] Initialized')
  }

  /**
   * Register input listener
   * @param {string} eventType - 'click', 'rightclick', 'keydown', 'keyup', etc.
   * @param {Function} callback - Handler function(event)
   */
  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, [])
    }
    this.listeners.get(eventType).push(callback)
    console.log(`[Input] Registered listener: ${eventType}`)
  }

  /**
   * Emit event to all registered listeners
   * @param {string} eventType - Event type
   * @param {Event} event - Event object
   */
  emit(eventType, event) {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType).forEach(callback => {
        try {
          callback(event)
        } catch (error) {
          console.error(`[Input] Error in ${eventType} listener:`, error)
        }
      })
    }
  }

  /**
   * Attach input listeners to canvas
   * @param {HTMLCanvasElement} canvas - Canvas element
   */
  attachToCanvas(canvas) {
    console.log('[Input] Attaching listeners to canvas')

    // Mouse events
    canvas.addEventListener('click', (e) => {
      const pos = InputManager.getMousePosition(e, canvas)
      this.emit('click', { ...e, pos })
    })

    canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault()
      const pos = InputManager.getMousePosition(e, canvas)
      this.emit('rightclick', { ...e, pos })
    })

    canvas.addEventListener('mousemove', (e) => {
      const pos = InputManager.getMousePosition(e, canvas)
      this.emit('mousemove', { ...e, pos })
    })

    // Keyboard events
    document.addEventListener('keydown', (e) => {
      this.emit('keydown', e)
      console.log(`[Input] Keydown: ${e.key}`)
    })

    document.addEventListener('keyup', (e) => {
      this.emit('keyup', e)
      console.log(`[Input] Keyup: ${e.key}`)
    })

    console.log('[Input] Listeners attached')
  }

  /**
   * Get mouse position on canvas (pixel coordinates)
   * @param {MouseEvent} event - Mouse event
   * @param {HTMLCanvasElement} canvas - Canvas element
   * @returns {Object} {x, y, gridX, gridY}
   */
  static getMousePosition(event, canvas) {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Convert pixel coordinates to grid coordinates
    const gridX = Math.floor(x / GRID_CONFIG.CELL_WIDTH_PX)
    const gridY = Math.floor(y / GRID_CONFIG.CELL_HEIGHT_PX)

    return { x, y, gridX, gridY }
  }
}
