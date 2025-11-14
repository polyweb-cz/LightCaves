/**
 * PauseMenu - Pause menu component during gameplay
 *
 * Displays pause menu with options to resume, access settings, or return to main menu.
 * Handles keyboard navigation and event callbacks.
 *
 * @class PauseMenu
 */
export class PauseMenu {
  /**
   * Create a pause menu
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
    this.pauseElement = null
    this.selectedIndex = 0

    // Bind keyboard handler
    this.handleKeyDown = this.handleKeyDown.bind(this)

    // Event callbacks
    this.callbacks = {
      resume: [],
      settings: [],
      menu: []
    }
  }

  /**
   * Register event callback
   * @param {string} event - Event name (resume, settings, menu)
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
   * Show pause menu
   */
  show() {
    if (this.isVisible) return

    this.isVisible = true
    this.selectedIndex = 0

    // Create modal overlay
    this.pauseElement = document.createElement('div')
    this.pauseElement.id = 'pause-menu'
    this.pauseElement.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(20, 20, 30, 0.95);
      border: 2px solid #00ffff;
      border-radius: 8px;
      padding: 30px;
      min-width: 300px;
      text-align: center;
      z-index: 1500;
      font-family: 'Courier New', monospace;
      color: #00ffff;
      box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
    `

    // Create header
    const header = document.createElement('div')
    header.style.cssText = `
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 30px;
      color: #00ffff;
    `
    header.textContent = '⏸ PAUSED'

    // Create button container
    const buttonContainer = document.createElement('div')
    buttonContainer.id = 'pause-buttons'
    buttonContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 15px;
    `

    const buttons = [
      { id: 'pause-resume', label: 'Resume Game', callback: () => this.emit('resume') },
      { id: 'pause-settings', label: 'Settings', callback: () => this.emit('settings') },
      { id: 'pause-menu-btn', label: 'Main Menu', callback: () => this.emit('menu') }
    ]

    this.buttons = buttons.map((btnDef, index) => {
      const button = document.createElement('button')
      button.id = btnDef.id
      button.style.cssText = `
        padding: 12px 20px;
        background: ${index === 0 ? 'rgba(0, 255, 255, 0.2)' : 'transparent'};
        border: 2px solid #00ffff;
        color: #00ffff;
        font-size: 14px;
        font-family: 'Courier New', monospace;
        cursor: pointer;
        border-radius: 4px;
        transition: all 0.2s;
      `
      button.textContent = btnDef.label
      button.style.background = index === 0 ? 'rgba(0, 255, 255, 0.3)' : 'rgba(0, 255, 255, 0.1)'

      button.addEventListener('click', btnDef.callback)
      button.addEventListener('mouseenter', () => {
        this.selectedIndex = index
        this.updateButtonSelection()
      })

      buttonContainer.appendChild(button)
      return button
    })

    // Add tips
    const tips = document.createElement('div')
    tips.style.cssText = `
      margin-top: 25px;
      padding-top: 20px;
      border-top: 1px solid rgba(0, 255, 255, 0.3);
      font-size: 12px;
      color: rgba(0, 255, 255, 0.6);
    `
    tips.innerHTML = `
      <div>↑↓ Navigate | Enter Select | Esc Resume</div>
    `

    this.pauseElement.appendChild(header)
    this.pauseElement.appendChild(buttonContainer)
    this.pauseElement.appendChild(tips)

    this.uiRoot.appendChild(this.pauseElement)

    // Add keyboard listener
    document.addEventListener('keydown', this.handleKeyDown)
  }

  /**
   * Hide pause menu
   */
  hide() {
    if (!this.isVisible) return

    this.isVisible = false

    if (this.pauseElement && this.pauseElement.parentNode) {
      this.pauseElement.parentNode.removeChild(this.pauseElement)
    }
    this.pauseElement = null
    this.buttons = []

    // Remove keyboard listener
    document.removeEventListener('keydown', this.handleKeyDown)
  }

  /**
   * Update button selection styling
   * @private
   */
  updateButtonSelection() {
    if (!this.buttons) return

    this.buttons.forEach((button, index) => {
      if (index === this.selectedIndex) {
        button.style.background = 'rgba(0, 255, 255, 0.3)'
        button.style.boxShadow = '0 0 10px rgba(0, 255, 255, 0.5)'
      } else {
        button.style.background = 'rgba(0, 255, 255, 0.1)'
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

      case 'Escape':
        event.preventDefault()
        this.emit('resume')
        break
    }
  }

  /**
   * Destroy pause menu and clean up
   */
  destroy() {
    this.hide()
    document.removeEventListener('keydown', this.handleKeyDown)
  }
}
