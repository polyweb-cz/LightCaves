/**
 * @fileoverview Main menu UI component
 * @module ui/main-menu
 */

import { COLORS } from '../utils/constants.js'

/**
 * MainMenu class - handles main menu display and interaction
 * @class MainMenu
 */
export class MainMenu {
  /**
   * Create a main menu
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
    this.selectedButtonIndex = 0

    this.buttons = [
      { label: 'Start Game', id: 'start', x: 0, y: 0, width: 200, height: 50 },
      { label: 'Settings', id: 'settings', x: 0, y: 0, width: 200, height: 50 },
      { label: 'About', id: 'about', x: 0, y: 0, width: 200, height: 50 },
      { label: 'Quit', id: 'quit', x: 0, y: 0, width: 200, height: 50 },
    ]

    this.callbacks = {
      start: null,
      settings: null,
      about: null,
      quit: null,
      menuClosed: null,
    }

    this.menuElement = null
    this.boundKeyHandler = this.handleKeyDown.bind(this)
    this.boundClickHandler = this.handleMenuClick.bind(this)

    console.log('[MainMenu] Initialized')
  }

  /**
   * Show the main menu
   */
  showMenu() {
    if (this.isVisible) return

    this.isVisible = true
    this.selectedButtonIndex = 0

    // Create menu HTML element
    this.menuElement = document.createElement('div')
    this.menuElement.id = 'main-menu'
    this.menuElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(20, 20, 30, 0.95);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      font-family: Arial, sans-serif;
    `

    // Logo and title
    const titleDiv = document.createElement('div')
    titleDiv.style.cssText = `
      color: ${COLORS.ACCENT};
      font-size: 48px;
      font-weight: bold;
      margin-bottom: 40px;
      text-align: center;
    `
    titleDiv.textContent = '🔆 LightCaves 🔆'

    const versionDiv = document.createElement('div')
    versionDiv.style.cssText = `
      color: ${COLORS.TEXT};
      font-size: 12px;
      margin-bottom: 30px;
      text-align: center;
      opacity: 0.7;
    `
    versionDiv.textContent = 'v0.1.0'

    // Buttons container
    const buttonsContainer = document.createElement('div')
    buttonsContainer.id = 'menu-buttons'
    buttonsContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 15px;
      width: 250px;
    `

    // Create button elements
    this.buttons.forEach((btn, index) => {
      const buttonEl = document.createElement('button')
      buttonEl.id = `menu-btn-${btn.id}`
      buttonEl.textContent = btn.label
      buttonEl.dataset.index = index
      buttonEl.style.cssText = `
        padding: 15px 30px;
        font-size: 18px;
        background: ${index === 0 ? COLORS.ACCENT : COLORS.BG};
        color: ${index === 0 ? '#000' : COLORS.TEXT};
        border: 2px solid ${COLORS.ACCENT};
        border-radius: 5px;
        cursor: pointer;
        transition: all 0.2s ease;
        font-weight: ${index === 0 ? 'bold' : 'normal'};
      `

      buttonEl.addEventListener('mouseenter', () => {
        this.selectButton(index)
      })

      buttonEl.addEventListener('click', (e) => {
        this.handleButtonClick(btn.id)
      })

      buttonsContainer.appendChild(buttonEl)
    })

    this.menuElement.appendChild(titleDiv)
    this.menuElement.appendChild(versionDiv)
    this.menuElement.appendChild(buttonsContainer)

    this.uiRoot.appendChild(this.menuElement)

    // Add event listeners
    document.addEventListener('keydown', this.boundKeyHandler)
    this.menuElement.addEventListener('click', this.boundClickHandler)

    console.log('[MainMenu] Menu shown')
  }

  /**
   * Hide the main menu
   */
  hideMenu() {
    if (!this.isVisible) return

    this.isVisible = false

    if (this.menuElement) {
      this.menuElement.remove()
      this.menuElement = null
    }

    // Remove event listeners
    document.removeEventListener('keydown', this.boundKeyHandler)

    if (this.callbacks.menuClosed) {
      this.callbacks.menuClosed()
    }

    console.log('[MainMenu] Menu hidden')
  }

  /**
   * Select a button by index
   * @param {number} index - Button index
   */
  selectButton(index) {
    if (index < 0 || index >= this.buttons.length) return

    this.selectedButtonIndex = index

    // Update button styles
    const buttons = this.menuElement?.querySelectorAll('button')
    if (buttons) {
      buttons.forEach((btn, idx) => {
        if (idx === index) {
          btn.style.background = COLORS.ACCENT
          btn.style.color = '#000'
          btn.style.fontWeight = 'bold'
        } else {
          btn.style.background = COLORS.BG
          btn.style.color = COLORS.TEXT
          btn.style.fontWeight = 'normal'
        }
      })
    }
  }

  /**
   * Handle keyboard input for menu navigation
   * @param {KeyboardEvent} event - The keyboard event
   */
  handleKeyDown(event) {
    if (!this.isVisible) return

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault()
        this.selectButton(
          (this.selectedButtonIndex - 1 + this.buttons.length) % this.buttons.length
        )
        break
      case 'ArrowDown':
        event.preventDefault()
        this.selectButton((this.selectedButtonIndex + 1) % this.buttons.length)
        break
      case 'Tab':
        event.preventDefault()
        this.selectButton((this.selectedButtonIndex + 1) % this.buttons.length)
        break
      case 'Enter':
        event.preventDefault()
        const selectedBtn = this.buttons[this.selectedButtonIndex]
        this.handleButtonClick(selectedBtn.id)
        break
      case 'Escape':
        event.preventDefault()
        this.hideMenu()
        break
    }
  }

  /**
   * Handle menu click events
   * @param {MouseEvent} event - The click event
   */
  handleMenuClick(event) {
    if (!this.isVisible) return
    // Clicks are handled by individual button listeners
  }

  /**
   * Handle button click
   * @param {string} buttonId - The button ID
   */
  handleButtonClick(buttonId) {
    const callback = this.callbacks[buttonId]
    if (callback && typeof callback === 'function') {
      callback()
    }

    console.log(`[MainMenu] Button clicked: ${buttonId}`)
  }

  /**
   * Register event callback
   * @param {string} eventType - Event type (start, settings, about, quit, menuClosed)
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
    const buttons = this.menuElement?.querySelectorAll('button')
    if (!buttons) return null

    for (let btn of buttons) {
      const rect = btn.getBoundingClientRect()
      if (
        x >= rect.left &&
        x <= rect.right &&
        y >= rect.top &&
        y <= rect.bottom
      ) {
        return {
          id: btn.id.replace('menu-btn-', ''),
          element: btn,
        }
      }
    }

    return null
  }

  /**
   * Destroy the menu
   */
  destroy() {
    this.hideMenu()
    document.removeEventListener('keydown', this.boundKeyHandler)
  }
}
