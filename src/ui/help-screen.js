/**
 * HelpScreen - Help/Tutorial screen component
 *
 * Displays help and tutorial information about the game.
 * Organized in sections with keyboard navigation.
 *
 * @class HelpScreen
 */
export class HelpScreen {
  /**
   * Create a help screen
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
    this.helpElement = null
    this.currentSection = 0

    // Bind keyboard handler
    this.handleKeyDown = this.handleKeyDown.bind(this)

    // Event callbacks
    this.callbacks = {
      close: []
    }

    // Help content sections
    this.sections = [
      {
        title: 'Game Objective',
        content: [
          'Guide the light beam from the lamp to illuminate the target.',
          'Place mirrors on the grid to reflect the light beam.',
          'Complete each level with minimum moves and time.'
        ]
      },
      {
        title: 'Controls',
        content: [
          'Arrow Keys: Navigate the grid or menu',
          'Enter: Select/Place mirror',
          'Esc: Pause game or close menu',
          'Mouse: Click to place mirrors',
          'Undo/Redo: Use game HUD buttons'
        ]
      },
      {
        title: 'Mirror Mechanics',
        content: [
          'Mirrors reflect light at 90 degrees.',
          '/ mirror: Reflects from left to up, right to down',
          '\\ mirror: Reflects from left to down, right to up',
          'Mirrors cannot overlap on the same cell.',
          'Maximum mirrors per level shown in HUD'
        ]
      },
      {
        title: 'Tips & Tricks',
        content: [
          'Plan your mirror placement before starting.',
          'Use fewer mirrors to achieve better scores.',
          'Walls block light - use them strategically.',
          'Each level has an optimal solution.',
          'Take your time - there is no time limit!'
        ]
      }
    ]
  }

  /**
   * Register event callback
   * @param {string} event - Event name (close)
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
   * Show help screen
   */
  show() {
    if (this.isVisible) return

    this.isVisible = true
    this.currentSection = 0

    // Create modal overlay
    this.helpElement = document.createElement('div')
    this.helpElement.id = 'help-screen'
    this.helpElement.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(20, 20, 30, 0.95);
      border: 2px solid #00ffff;
      border-radius: 8px;
      padding: 30px;
      max-width: 500px;
      max-height: 500px;
      overflow-y: auto;
      text-align: center;
      z-index: 1500;
      font-family: 'Courier New', monospace;
      color: #00ffff;
      box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
    `

    // Create header
    const header = document.createElement('div')
    header.id = 'help-header'
    header.style.cssText = `
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 20px;
      color: #00ffff;
    `

    // Create content area
    const contentArea = document.createElement('div')
    contentArea.id = 'help-content'
    contentArea.style.cssText = `
      text-align: left;
      margin-bottom: 20px;
      line-height: 1.6;
      font-size: 13px;
    `

    // Create section navigation
    const navContainer = document.createElement('div')
    navContainer.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-top: 15px;
      border-top: 1px solid rgba(0, 255, 255, 0.2);
    `

    const prevButton = document.createElement('button')
    prevButton.id = 'help-prev'
    prevButton.textContent = '← Previous'
    prevButton.style.cssText = `
      padding: 8px 15px;
      background: rgba(0, 255, 255, 0.1);
      border: 1px solid #00ffff;
      color: #00ffff;
      font-family: 'Courier New', monospace;
      cursor: pointer;
      border-radius: 4px;
      font-size: 12px;
    `

    const sectionIndicator = document.createElement('span')
    sectionIndicator.id = 'help-section'
    sectionIndicator.style.cssText = `
      color: rgba(0, 255, 255, 0.7);
      font-size: 12px;
    `

    const nextButton = document.createElement('button')
    nextButton.id = 'help-next'
    nextButton.textContent = 'Next →'
    nextButton.style.cssText = `
      padding: 8px 15px;
      background: rgba(0, 255, 255, 0.1);
      border: 1px solid #00ffff;
      color: #00ffff;
      font-family: 'Courier New', monospace;
      cursor: pointer;
      border-radius: 4px;
      font-size: 12px;
    `

    prevButton.addEventListener('click', () => this.previousSection())
    nextButton.addEventListener('click', () => this.nextSection())

    navContainer.appendChild(prevButton)
    navContainer.appendChild(sectionIndicator)
    navContainer.appendChild(nextButton)

    // Create back button
    const backButton = document.createElement('button')
    backButton.id = 'help-back'
    backButton.textContent = 'Back to Menu'
    backButton.style.cssText = `
      padding: 10px 20px;
      background: rgba(0, 255, 255, 0.2);
      border: 2px solid #00ffff;
      color: #00ffff;
      font-family: 'Courier New', monospace;
      cursor: pointer;
      border-radius: 4px;
      font-size: 13px;
      width: 100%;
    `
    backButton.addEventListener('click', () => this.emit('close'))

    this.helpElement.appendChild(header)
    this.helpElement.appendChild(contentArea)
    this.helpElement.appendChild(navContainer)
    this.helpElement.appendChild(backButton)

    this.uiRoot.appendChild(this.helpElement)
    this.updateDisplay()

    // Add keyboard listener
    document.addEventListener('keydown', this.handleKeyDown)
  }

  /**
   * Hide help screen
   */
  hide() {
    if (!this.isVisible) return

    this.isVisible = false

    if (this.helpElement && this.helpElement.parentNode) {
      this.helpElement.parentNode.removeChild(this.helpElement)
    }
    this.helpElement = null

    // Remove keyboard listener
    document.removeEventListener('keydown', this.handleKeyDown)
  }

  /**
   * Update display with current section
   * @private
   */
  updateDisplay() {
    if (!this.helpElement) return

    const section = this.sections[this.currentSection]

    // Update header
    const header = this.helpElement.querySelector('#help-header')
    if (header) {
      header.textContent = section.title
    }

    // Update content
    const content = this.helpElement.querySelector('#help-content')
    if (content) {
      content.innerHTML = section.content.map((line) => `<div>• ${line}</div>`).join('')
    }

    // Update section indicator
    const indicator = this.helpElement.querySelector('#help-section')
    if (indicator) {
      indicator.textContent = `${this.currentSection + 1} / ${this.sections.length}`
    }

    // Update button states
    const prevBtn = this.helpElement.querySelector('#help-prev')
    const nextBtn = this.helpElement.querySelector('#help-next')
    if (prevBtn) {
      prevBtn.style.opacity = this.currentSection === 0 ? '0.5' : '1'
      prevBtn.disabled = this.currentSection === 0
    }
    if (nextBtn) {
      nextBtn.style.opacity = this.currentSection === this.sections.length - 1 ? '0.5' : '1'
      nextBtn.disabled = this.currentSection === this.sections.length - 1
    }
  }

  /**
   * Go to previous section
   */
  previousSection() {
    if (this.currentSection > 0) {
      this.currentSection--
      this.updateDisplay()
    }
  }

  /**
   * Go to next section
   */
  nextSection() {
    if (this.currentSection < this.sections.length - 1) {
      this.currentSection++
      this.updateDisplay()
    }
  }

  /**
   * Handle keyboard input
   * @param {KeyboardEvent} event - The keyboard event
   * @private
   */
  handleKeyDown(event) {
    if (!this.isVisible) return

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault()
        this.previousSection()
        break

      case 'ArrowRight':
        event.preventDefault()
        this.nextSection()
        break

      case 'Escape':
        event.preventDefault()
        this.emit('close')
        break
    }
  }

  /**
   * Destroy help screen and clean up
   */
  destroy() {
    this.hide()
    document.removeEventListener('keydown', this.handleKeyDown)
  }
}
