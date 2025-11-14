/**
 * GameOverScreen - Game over/victory screen component
 *
 * Displays game over screen with victory or defeat states.
 * Shows time, moves, and options to restart or continue.
 *
 * @class GameOverScreen
 */
export class GameOverScreen {
  /**
   * Create a game over screen
   * @param {Renderer} renderer - The renderer instance
   * @param {HTMLElement} uiRoot - The UI root element
   * @throws {Error} If renderer or uiRoot is null
   */
  constructor(renderer, uiRoot) {
    if (!renderer) throw new Error('Invalid renderer')
    if (!uiRoot) throw new Error('Invalid UI root')

    this.renderer = renderer
    this.uiRoot = uiRoot
    this.isVisible = false
    this.screenElement = null
    this.selectedIndex = 0
    this.currentState = null // 'victory' or 'defeat'
    this.stats = {
      time: 0,
      moves: 0,
      levelName: ''
    }

    // Bind keyboard handler
    this.handleKeyDown = this.handleKeyDown.bind(this)

    // Event callbacks
    this.callbacks = {
      restart: [],
      next: [],
      menu: []
    }
  }

  /**
   * Register event callback
   * @param {string} event - Event name (restart, next, menu)
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event].push(callback)
    }
  }

  /**
   * Emit event to all listeners
   * @param {string} event - Event name
   */
  emit(event) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach((callback) => callback())
    }
  }

  /**
   * Show victory screen
   * @param {Object} stats - Game statistics {time, moves, levelName}
   */
  showVictory(stats = {}) {
    this.stats = { ...this.stats, ...stats }
    this.currentState = 'victory'
    this.selectedIndex = 0
    this.show()
  }

  /**
   * Show defeat screen
   * @param {Object} stats - Game statistics {time, moves, levelName}
   */
  showDefeat(stats = {}) {
    this.stats = { ...this.stats, ...stats }
    this.currentState = 'defeat'
    this.selectedIndex = 0
    this.show()
  }

  /**
   * Show game over screen (internal)
   * @private
   */
  show() {
    if (this.isVisible) return

    this.isVisible = true

    // Create modal overlay
    this.screenElement = document.createElement('div')
    this.screenElement.id = 'game-over-screen'
    this.screenElement.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(20, 20, 30, 0.95);
      border: 2px solid ${this.currentState === 'victory' ? '#00ff00' : '#ff0000'};
      border-radius: 8px;
      padding: 30px;
      min-width: 350px;
      text-align: center;
      z-index: 1500;
      font-family: 'Courier New', monospace;
      color: ${this.currentState === 'victory' ? '#00ff00' : '#ff0000'};
      box-shadow: 0 0 20px ${this.currentState === 'victory' ? 'rgba(0, 255, 0, 0.3)' : 'rgba(255, 0, 0, 0.3)'};
    `

    // Create header
    const header = document.createElement('div')
    header.style.cssText = `
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 20px;
      color: ${this.currentState === 'victory' ? '#00ff00' : '#ff0000'};
    `
    header.textContent = this.currentState === 'victory' ? '🏆 LEVEL COMPLETE' : '💀 LEVEL FAILED'

    // Create level name
    const levelName = document.createElement('div')
    levelName.style.cssText = `
      font-size: 14px;
      margin-bottom: 20px;
      color: rgba(255, 255, 255, 0.7);
    `
    levelName.textContent = this.stats.levelName || 'Unknown Level'

    // Create stats section
    const statsContainer = document.createElement('div')
    statsContainer.id = 'game-over-stats'
    statsContainer.style.cssText = `
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid ${this.currentState === 'victory' ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 0, 0, 0.2)'};
      border-radius: 4px;
      padding: 15px;
      margin-bottom: 25px;
      text-align: left;
    `

    const timeStat = document.createElement('div')
    timeStat.style.cssText = `
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 14px;
    `
    timeStat.innerHTML = `<span>Time:</span><strong id="stat-time">${this.formatTime(this.stats.time)}</strong>`

    const movesStat = document.createElement('div')
    movesStat.style.cssText = `
      display: flex;
      justify-content: space-between;
      font-size: 14px;
    `
    movesStat.innerHTML = `<span>Moves:</span><strong id="stat-moves">${this.stats.moves}</strong>`

    statsContainer.appendChild(timeStat)
    statsContainer.appendChild(movesStat)

    // Create button container
    const buttonContainer = document.createElement('div')
    buttonContainer.id = 'game-over-buttons'
    buttonContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 20px;
    `

    // Button definitions based on state
    const buttonDefs =
      this.currentState === 'victory'
        ? [
            { id: 'btn-restart', label: 'Restart Level', callback: () => this.emit('restart') },
            { id: 'btn-next', label: 'Next Level', callback: () => this.emit('next') },
            { id: 'btn-menu', label: 'Main Menu', callback: () => this.emit('menu') }
          ]
        : [
            { id: 'btn-restart', label: 'Retry Level', callback: () => this.emit('restart') },
            { id: 'btn-menu', label: 'Main Menu', callback: () => this.emit('menu') }
          ]

    this.buttons = buttonDefs.map((btnDef, index) => {
      const button = document.createElement('button')
      button.id = btnDef.id
      button.style.cssText = `
        padding: 12px 20px;
        background: ${index === 0 ? 'rgba(0, 255, 0, 0.2)' : 'rgba(0, 255, 0, 0.1)'};
        border: 2px solid ${this.currentState === 'victory' ? '#00ff00' : '#ff0000'};
        color: ${this.currentState === 'victory' ? '#00ff00' : '#ff0000'};
        font-size: 14px;
        font-family: 'Courier New', monospace;
        cursor: pointer;
        border-radius: 4px;
        transition: all 0.2s;
      `
      button.textContent = btnDef.label

      button.addEventListener('click', btnDef.callback)
      button.addEventListener('mouseenter', () => {
        this.selectedIndex = index
        this.updateButtonSelection()
      })

      buttonContainer.appendChild(button)
      return button
    })

    // Create tips
    const tips = document.createElement('div')
    tips.style.cssText = `
      font-size: 12px;
      color: rgba(255, 255, 255, 0.5);
    `
    tips.innerHTML = `<div>↑↓ Navigate | Enter Select</div>`

    this.screenElement.appendChild(header)
    this.screenElement.appendChild(levelName)
    this.screenElement.appendChild(statsContainer)
    this.screenElement.appendChild(buttonContainer)
    this.screenElement.appendChild(tips)

    this.uiRoot.appendChild(this.screenElement)
    this.updateButtonSelection()

    // Add keyboard listener
    document.addEventListener('keydown', this.handleKeyDown)
  }

  /**
   * Hide game over screen
   */
  hide() {
    if (!this.isVisible) return

    this.isVisible = false

    if (this.screenElement && this.screenElement.parentNode) {
      this.screenElement.parentNode.removeChild(this.screenElement)
    }
    this.screenElement = null
    this.buttons = []
    this.currentState = null

    // Remove keyboard listener
    document.removeEventListener('keydown', this.handleKeyDown)
  }

  /**
   * Format time in seconds to readable format
   * @param {number} seconds - Time in seconds
   * @returns {string} Formatted time string
   * @private
   */
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  /**
   * Update button selection styling
   * @private
   */
  updateButtonSelection() {
    if (!this.buttons) return

    this.buttons.forEach((button, index) => {
      if (index === this.selectedIndex) {
        button.style.background =
          this.currentState === 'victory' ? 'rgba(0, 255, 0, 0.3)' : 'rgba(255, 0, 0, 0.3)'
        button.style.boxShadow =
          this.currentState === 'victory'
            ? '0 0 10px rgba(0, 255, 0, 0.5)'
            : '0 0 10px rgba(255, 0, 0, 0.5)'
      } else {
        button.style.background =
          this.currentState === 'victory' ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)'
        button.style.boxShadow = 'none'
      }
    })
  }

  /**
   * Handle keyboard input
   * @param {KeyboardEvent} event - The keyboard event
   * @private
   */
  handleKeyDown(event) {
    if (!this.isVisible) return

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault()
        this.selectedIndex = Math.max(0, this.selectedIndex - 1)
        this.updateButtonSelection()
        break

      case 'ArrowDown':
        event.preventDefault()
        this.selectedIndex = Math.min(this.buttons.length - 1, this.selectedIndex + 1)
        this.updateButtonSelection()
        break

      case 'Enter':
        event.preventDefault()
        if (this.buttons && this.buttons[this.selectedIndex]) {
          this.buttons[this.selectedIndex].click()
        }
        break
    }
  }

  /**
   * Destroy game over screen and clean up
   */
  destroy() {
    this.hide()
    document.removeEventListener('keydown', this.handleKeyDown)
  }
}
