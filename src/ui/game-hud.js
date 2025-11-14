/**
 * @fileoverview In-game HUD component
 * @module ui/game-hud
 */

import { COLORS } from '../utils/constants.js'

/**
 * GameHUD class - manages in-game HUD display and interaction
 * @class GameHUD
 */
export class GameHUD {
  /**
   * Create a game HUD
   * @param {Renderer} renderer - The Renderer instance
   * @param {HTMLElement} uiRoot - The UI root container element
   */
  constructor(renderer, uiRoot) {
    if (!renderer) {
      throw new Error('Invalid renderer')
    }
    if (!uiRoot) {
      throw new Error('Invalid UI root')
    }

    this.renderer = renderer
    this.uiRoot = uiRoot
    this.isVisible = false

    // Stats
    this.stats = {
      levelName: 'Untitled',
      moves: 0,
      time: 0,
      difficulty: 'normal',
      targetCount: 0,
      illuminatedCount: 0,
    }

    // Action buttons
    this.buttons = [
      { id: 'undo', label: '↶ Undo', x: 0, y: 0, width: 60, height: 40 },
      { id: 'redo', label: '↷ Redo', x: 0, y: 0, width: 60, height: 40 },
      { id: 'reset', label: '⟳ Reset', x: 0, y: 0, width: 60, height: 40 },
      { id: 'menu', label: '☰ Menu', x: 0, y: 0, width: 60, height: 40 },
    ]

    this.callbacks = {
      undo: null,
      redo: null,
      reset: null,
      menu: null,
    }

    this.hudElement = null
    this.timerInterval = null
    this.boundMouseMove = this.handleMouseMove.bind(this)

    console.log('[GameHUD] Initialized')
  }

  /**
   * Update HUD stats
   * @param {Object} stats - Stats object { levelName, moves, time, difficulty, targetCount, illuminatedCount }
   */
  updateStats(stats) {
    Object.assign(this.stats, stats)
    this.refresh()
  }

  /**
   * Show the HUD
   */
  show() {
    if (this.isVisible) return

    this.isVisible = true

    // Create HUD container
    this.hudElement = document.createElement('div')
    this.hudElement.id = 'game-hud'
    this.hudElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 500;
      font-family: Arial, sans-serif;
    `

    // Top info bar
    const topBar = document.createElement('div')
    topBar.id = 'hud-top-bar'
    topBar.style.cssText = `
      position: absolute;
      top: 10px;
      left: 10px;
      right: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      pointer-events: auto;
      background: rgba(20, 20, 30, 0.8);
      padding: 15px;
      border-radius: 8px;
      border: 1px solid ${COLORS.ACCENT};
    `

    // Level info
    const levelInfo = document.createElement('div')
    levelInfo.id = 'level-info'
    levelInfo.style.cssText = `
      color: ${COLORS.TEXT};
      font-size: 16px;
      font-weight: bold;
    `
    levelInfo.innerHTML = `
      <div style="color: ${COLORS.ACCENT}; margin-bottom: 5px;">${this.stats.levelName}</div>
      <div style="font-size: 12px; opacity: 0.7;">Difficulty: ${this.stats.difficulty}</div>
    `
    topBar.appendChild(levelInfo)

    // Progress info
    const progressInfo = document.createElement('div')
    progressInfo.id = 'progress-info'
    progressInfo.style.cssText = `
      color: ${COLORS.TEXT};
      font-size: 14px;
      text-align: center;
    `
    progressInfo.innerHTML = `
      <div>Targets: <span style="color: ${COLORS.BEAM};">${this.stats.illuminatedCount}/${this.stats.targetCount}</span></div>
      <div>Moves: <span style="color: ${COLORS.ACCENT};">${this.stats.moves}</span></div>
    `
    topBar.appendChild(progressInfo)

    // Timer
    const timerDiv = document.createElement('div')
    timerDiv.id = 'timer'
    timerDiv.style.cssText = `
      color: ${COLORS.TEXT};
      font-size: 16px;
      font-weight: bold;
      min-width: 60px;
      text-align: right;
    `
    timerDiv.textContent = `${this.formatTime(this.stats.time)}`
    topBar.appendChild(timerDiv)

    this.hudElement.appendChild(topBar)

    // Bottom action buttons
    const bottomBar = document.createElement('div')
    bottomBar.id = 'hud-bottom-bar'
    bottomBar.style.cssText = `
      position: absolute;
      bottom: 20px;
      right: 20px;
      display: flex;
      gap: 10px;
      pointer-events: auto;
    `

    this.buttons.forEach((btn) => {
      const btnEl = document.createElement('button')
      btnEl.id = `btn-${btn.id}`
      btnEl.textContent = btn.label
      btnEl.dataset.action = btn.id
      btnEl.style.cssText = `
        padding: 10px 15px;
        background: ${COLORS.BG};
        color: ${COLORS.TEXT};
        border: 1px solid ${COLORS.ACCENT};
        border-radius: 5px;
        cursor: pointer;
        font-size: 12px;
        font-weight: bold;
        transition: all 0.2s;
      `

      btnEl.addEventListener('mouseenter', () => {
        btnEl.style.background = COLORS.ACCENT
        btnEl.style.color = '#000'
      })

      btnEl.addEventListener('mouseleave', () => {
        btnEl.style.background = COLORS.BG
        btnEl.style.color = COLORS.TEXT
      })

      btnEl.addEventListener('click', () => {
        this.handleButtonClick(btn.id)
      })

      bottomBar.appendChild(btnEl)
    })

    this.hudElement.appendChild(bottomBar)

    this.uiRoot.appendChild(this.hudElement)

    // Start timer interval
    this.startTimer()

    // Add mouse move listener for button hover
    document.addEventListener('mousemove', this.boundMouseMove)

    console.log('[GameHUD] Shown')
  }

  /**
   * Hide the HUD
   */
  hide() {
    if (!this.isVisible) return

    this.isVisible = false
    this.stopTimer()

    if (this.hudElement) {
      this.hudElement.remove()
      this.hudElement = null
    }

    document.removeEventListener('mousemove', this.boundMouseMove)

    console.log('[GameHUD] Hidden')
  }

  /**
   * Refresh HUD display
   */
  refresh() {
    if (!this.isVisible || !this.hudElement) return

    const levelInfo = this.hudElement.querySelector('#level-info')
    if (levelInfo) {
      levelInfo.innerHTML = `
        <div style="color: ${COLORS.ACCENT}; margin-bottom: 5px;">${this.stats.levelName}</div>
        <div style="font-size: 12px; opacity: 0.7;">Difficulty: ${this.stats.difficulty}</div>
      `
    }

    const progressInfo = this.hudElement.querySelector('#progress-info')
    if (progressInfo) {
      progressInfo.innerHTML = `
        <div>Targets: <span style="color: ${COLORS.BEAM};">${this.stats.illuminatedCount}/${this.stats.targetCount}</span></div>
        <div>Moves: <span style="color: ${COLORS.ACCENT};">${this.stats.moves}</span></div>
      `
    }
  }

  /**
   * Format time in seconds to MM:SS format
   * @param {number} seconds - Time in seconds
   * @returns {string} Formatted time
   */
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  /**
   * Start the timer
   */
  startTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval)
    }

    this.timerInterval = setInterval(() => {
      this.stats.time += 1
      const timerDiv = this.hudElement?.querySelector('#timer')
      if (timerDiv) {
        timerDiv.textContent = this.formatTime(this.stats.time)
      }
    }, 1000)
  }

  /**
   * Stop the timer
   */
  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval)
      this.timerInterval = null
    }
  }

  /**
   * Handle button click
   * @param {string} action - Action ID
   */
  handleButtonClick(action) {
    const callback = this.callbacks[action]
    if (callback && typeof callback === 'function') {
      callback()
    }

    console.log(`[GameHUD] Action clicked: ${action}`)
  }

  /**
   * Handle mouse move for button hover effects
   * @param {MouseEvent} event - The mouse event
   */
  handleMouseMove(event) {
    if (!this.isVisible || !this.hudElement) return

    // This can be extended for additional hover effects
  }

  /**
   * Register event callback
   * @param {string} eventType - Event type (undo, redo, reset, menu)
   * @param {Function} callback - The callback function
   */
  on(eventType, callback) {
    if (this.callbacks.hasOwnProperty(eventType)) {
      this.callbacks[eventType] = callback
    }
  }

  /**
   * Remove event callback
   * @param {string} eventType - Event type
   */
  off(eventType) {
    if (this.callbacks.hasOwnProperty(eventType)) {
      this.callbacks[eventType] = null
    }
  }

  /**
   * Get button at position
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {Object|null} Button object or null
   */
  getButtonAtPoint(x, y) {
    const buttons = this.hudElement?.querySelectorAll('[data-action]')
    if (!buttons) return null

    for (let btn of buttons) {
      const rect = btn.getBoundingClientRect()
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return {
          id: btn.dataset.action,
          element: btn,
        }
      }
    }

    return null
  }

  /**
   * Destroy the HUD
   */
  destroy() {
    this.hide()
    document.removeEventListener('mousemove', this.boundMouseMove)
  }
}
