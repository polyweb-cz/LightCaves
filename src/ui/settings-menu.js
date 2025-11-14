/**
 * @fileoverview Settings menu component
 * @module ui/settings-menu
 */

import { COLORS } from '../utils/constants.js'

/**
 * SettingsMenu class - handles game settings and preferences
 * @class SettingsMenu
 */
export class SettingsMenu {
  /**
   * Create a settings menu
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

    // Default settings
    this.settings = {
      soundEnabled: true,
      volume: 75,
      fpsLimit: 60,
      graphicsQuality: 'high',
      defaultDifficulty: 'normal',
      showKeyBindings: true
    }

    this.settingsElement = null
    this.boundKeyHandler = this.handleKeyDown.bind(this)

    console.log('[SettingsMenu] Initialized')
  }

  /**
   * Load settings from storage
   */
  loadSettings() {
    try {
      const stored = localStorage.getItem('lightcaves_settings')
      if (stored) {
        const parsed = JSON.parse(stored)
        Object.assign(this.settings, parsed)
        console.log('[SettingsMenu] Settings loaded from storage')
      }
    } catch (error) {
      console.warn('[SettingsMenu] Failed to load settings:', error)
    }
  }

  /**
   * Save settings to storage
   */
  saveSettings() {
    try {
      localStorage.setItem('lightcaves_settings', JSON.stringify(this.settings))
      console.log('[SettingsMenu] Settings saved to storage')
    } catch (error) {
      console.warn('[SettingsMenu] Failed to save settings:', error)
    }
  }

  /**
   * Get a setting value
   * @param {string} key - Setting key
   * @returns {*} Setting value
   */
  getSetting(key) {
    return this.settings[key]
  }

  /**
   * Set a setting value
   * @param {string} key - Setting key
   * @param {*} value - Setting value
   */
  setSetting(key, value) {
    if (this.settings.hasOwnProperty(key)) {
      this.settings[key] = value
      this.updateUI()
    }
  }

  /**
   * Show the settings menu
   */
  show() {
    if (this.isVisible) return

    this.isVisible = true
    this.loadSettings()

    // Create settings container
    this.settingsElement = document.createElement('div')
    this.settingsElement.id = 'settings-menu'
    this.settingsElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(20, 20, 30, 0.95);
      display: flex;
      flex-direction: column;
      z-index: 1100;
      font-family: Arial, sans-serif;
      overflow-y: auto;
    `

    // Header
    const header = document.createElement('div')
    header.style.cssText = `
      padding: 30px;
      background: rgba(0, 0, 0, 0.5);
      border-bottom: 2px solid ${COLORS.ACCENT};
      flex-shrink: 0;
    `

    const title = document.createElement('h1')
    title.textContent = 'Settings'
    title.style.cssText = `
      color: ${COLORS.ACCENT};
      margin: 0;
      font-size: 32px;
    `
    header.appendChild(title)
    this.settingsElement.appendChild(header)

    // Content area
    const content = document.createElement('div')
    content.id = 'settings-content'
    content.style.cssText = `
      flex: 1;
      padding: 30px;
      display: flex;
      flex-direction: column;
      gap: 30px;
      max-width: 600px;
      margin: 0 auto;
      width: 100%;
    `

    // Sound settings
    content.appendChild(this.createSoundSection())

    // Graphics settings
    content.appendChild(this.createGraphicsSection())

    // Difficulty settings
    content.appendChild(this.createDifficultySection())

    // Controls settings
    content.appendChild(this.createControlsSection())

    this.settingsElement.appendChild(content)

    // Footer with buttons
    const footer = document.createElement('div')
    footer.style.cssText = `
      padding: 20px 30px;
      border-top: 2px solid ${COLORS.ACCENT};
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      gap: 15px;
      justify-content: center;
      flex-shrink: 0;
    `

    const resetBtn = document.createElement('button')
    resetBtn.textContent = 'Reset to Defaults'
    resetBtn.style.cssText = `
      padding: 12px 24px;
      background: #ff6b6b;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: bold;
    `
    resetBtn.addEventListener('click', () => this.resetSettings())

    const closeBtn = document.createElement('button')
    closeBtn.textContent = 'Close Settings'
    closeBtn.style.cssText = `
      padding: 12px 24px;
      background: ${COLORS.ACCENT};
      color: #000;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: bold;
    `
    closeBtn.addEventListener('click', () => this.hide())

    footer.appendChild(resetBtn)
    footer.appendChild(closeBtn)
    this.settingsElement.appendChild(footer)

    this.uiRoot.appendChild(this.settingsElement)
    document.addEventListener('keydown', this.boundKeyHandler)

    console.log('[SettingsMenu] Settings shown')
  }

  /**
   * Create sound settings section
   * @private
   */
  createSoundSection() {
    const section = document.createElement('div')
    section.style.cssText = `
      background: rgba(255, 255, 255, 0.05);
      padding: 20px;
      border-radius: 8px;
      border: 1px solid ${COLORS.ACCENT};
    `

    const title = document.createElement('h2')
    title.textContent = '🔊 Audio Settings'
    title.style.cssText = `
      color: ${COLORS.ACCENT};
      margin: 0 0 20px 0;
      font-size: 20px;
    `
    section.appendChild(title)

    // Sound toggle
    const toggleContainer = document.createElement('div')
    toggleContainer.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    `

    const toggleLabel = document.createElement('label')
    toggleLabel.textContent = 'Sound Enabled'
    toggleLabel.style.cssText = `
      color: ${COLORS.TEXT};
      flex: 1;
    `

    const toggle = document.createElement('input')
    toggle.type = 'checkbox'
    toggle.id = 'sound-toggle'
    toggle.checked = this.settings.soundEnabled
    toggle.style.cssText = `
      width: 20px;
      height: 20px;
      cursor: pointer;
    `
    toggle.addEventListener('change', (e) => {
      this.setSetting('soundEnabled', e.target.checked)
    })

    toggleContainer.appendChild(toggleLabel)
    toggleContainer.appendChild(toggle)
    section.appendChild(toggleContainer)

    // Volume slider
    const volumeContainer = document.createElement('div')
    volumeContainer.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
    `

    const volumeLabel = document.createElement('label')
    volumeLabel.textContent = 'Volume'
    volumeLabel.style.cssText = `
      color: ${COLORS.TEXT};
      min-width: 80px;
    `

    const volumeSlider = document.createElement('input')
    volumeSlider.type = 'range'
    volumeSlider.id = 'volume-slider'
    volumeSlider.min = '0'
    volumeSlider.max = '100'
    volumeSlider.value = this.settings.volume
    volumeSlider.style.cssText = `
      flex: 1;
      cursor: pointer;
    `
    volumeSlider.addEventListener('input', (e) => {
      this.setSetting('volume', parseInt(e.target.value))
      volumeValue.textContent = e.target.value + '%'
    })

    const volumeValue = document.createElement('span')
    volumeValue.textContent = this.settings.volume + '%'
    volumeValue.style.cssText = `
      color: ${COLORS.ACCENT};
      min-width: 60px;
      text-align: right;
    `

    volumeContainer.appendChild(volumeLabel)
    volumeContainer.appendChild(volumeSlider)
    volumeContainer.appendChild(volumeValue)
    section.appendChild(volumeContainer)

    return section
  }

  /**
   * Create graphics settings section
   * @private
   */
  createGraphicsSection() {
    const section = document.createElement('div')
    section.style.cssText = `
      background: rgba(255, 255, 255, 0.05);
      padding: 20px;
      border-radius: 8px;
      border: 1px solid ${COLORS.ACCENT};
    `

    const title = document.createElement('h2')
    title.textContent = '🎨 Graphics Settings'
    title.style.cssText = `
      color: ${COLORS.ACCENT};
      margin: 0 0 20px 0;
      font-size: 20px;
    `
    section.appendChild(title)

    // FPS Limit
    const fpsContainer = document.createElement('div')
    fpsContainer.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
      margin-bottom: 20px;
    `

    const fpsLabel = document.createElement('label')
    fpsLabel.textContent = 'FPS Limit'
    fpsLabel.style.cssText = `
      color: ${COLORS.TEXT};
      min-width: 80px;
    `

    const fpsSlider = document.createElement('input')
    fpsSlider.type = 'range'
    fpsSlider.id = 'fps-slider'
    fpsSlider.min = '30'
    fpsSlider.max = '144'
    fpsSlider.step = '10'
    fpsSlider.value = this.settings.fpsLimit
    fpsSlider.style.cssText = `
      flex: 1;
      cursor: pointer;
    `
    fpsSlider.addEventListener('input', (e) => {
      this.setSetting('fpsLimit', parseInt(e.target.value))
      fpsValue.textContent = e.target.value + ' FPS'
    })

    const fpsValue = document.createElement('span')
    fpsValue.textContent = this.settings.fpsLimit + ' FPS'
    fpsValue.style.cssText = `
      color: ${COLORS.ACCENT};
      min-width: 80px;
      text-align: right;
    `

    fpsContainer.appendChild(fpsLabel)
    fpsContainer.appendChild(fpsSlider)
    fpsContainer.appendChild(fpsValue)
    section.appendChild(fpsContainer)

    // Graphics Quality
    const qualityContainer = document.createElement('div')
    qualityContainer.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
    `

    const qualityLabel = document.createElement('label')
    qualityLabel.textContent = 'Graphics Quality'
    qualityLabel.style.cssText = `
      color: ${COLORS.TEXT};
      flex: 1;
    `

    const qualitySelect = document.createElement('select')
    qualitySelect.id = 'quality-select'
    qualitySelect.style.cssText = `
      padding: 8px 12px;
      background: ${COLORS.BG};
      color: ${COLORS.TEXT};
      border: 1px solid ${COLORS.ACCENT};
      border-radius: 3px;
      cursor: pointer;
    `
    ;['Low', 'Medium', 'High'].forEach((quality) => {
      const option = document.createElement('option')
      option.value = quality.toLowerCase()
      option.textContent = quality
      option.selected = this.settings.graphicsQuality === quality.toLowerCase()
      qualitySelect.appendChild(option)
    })
    qualitySelect.addEventListener('change', (e) => {
      this.setSetting('graphicsQuality', e.target.value)
    })

    qualityContainer.appendChild(qualityLabel)
    qualityContainer.appendChild(qualitySelect)
    section.appendChild(qualityContainer)

    return section
  }

  /**
   * Create difficulty settings section
   * @private
   */
  createDifficultySection() {
    const section = document.createElement('div')
    section.style.cssText = `
      background: rgba(255, 255, 255, 0.05);
      padding: 20px;
      border-radius: 8px;
      border: 1px solid ${COLORS.ACCENT};
    `

    const title = document.createElement('h2')
    title.textContent = '⚔️ Difficulty Settings'
    title.style.cssText = `
      color: ${COLORS.ACCENT};
      margin: 0 0 20px 0;
      font-size: 20px;
    `
    section.appendChild(title)

    const diffContainer = document.createElement('div')
    diffContainer.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
    `

    const diffLabel = document.createElement('label')
    diffLabel.textContent = 'Default Difficulty'
    diffLabel.style.cssText = `
      color: ${COLORS.TEXT};
      flex: 1;
    `

    const diffSelect = document.createElement('select')
    diffSelect.id = 'difficulty-select'
    diffSelect.style.cssText = `
      padding: 8px 12px;
      background: ${COLORS.BG};
      color: ${COLORS.TEXT};
      border: 1px solid ${COLORS.ACCENT};
      border-radius: 3px;
      cursor: pointer;
    `
    ;['easy', 'normal', 'hard', 'expert'].forEach((diff) => {
      const option = document.createElement('option')
      option.value = diff
      option.textContent = diff.charAt(0).toUpperCase() + diff.slice(1)
      option.selected = this.settings.defaultDifficulty === diff
      diffSelect.appendChild(option)
    })
    diffSelect.addEventListener('change', (e) => {
      this.setSetting('defaultDifficulty', e.target.value)
    })

    diffContainer.appendChild(diffLabel)
    diffContainer.appendChild(diffSelect)
    section.appendChild(diffContainer)

    return section
  }

  /**
   * Create controls settings section
   * @private
   */
  createControlsSection() {
    const section = document.createElement('div')
    section.style.cssText = `
      background: rgba(255, 255, 255, 0.05);
      padding: 20px;
      border-radius: 8px;
      border: 1px solid ${COLORS.ACCENT};
    `

    const title = document.createElement('h2')
    title.textContent = '⌨️ Controls'
    title.style.cssText = `
      color: ${COLORS.ACCENT};
      margin: 0 0 20px 0;
      font-size: 20px;
    `
    section.appendChild(title)

    const controls = document.createElement('div')
    controls.style.cssText = `
      color: ${COLORS.TEXT};
      font-size: 14px;
      line-height: 1.8;
    `
    controls.innerHTML = `
      <p><strong>Menu Navigation:</strong></p>
      <p>↑ / ↓ - Navigate menu</p>
      <p>Tab - Next item</p>
      <p>Enter - Select</p>
      <p>Esc - Close menu</p>
      <p><strong>Game Controls:</strong></p>
      <p>Click - Place mirror / Select</p>
      <p>Arrow Keys - Navigate</p>
    `
    section.appendChild(controls)

    return section
  }

  /**
   * Reset settings to defaults
   */
  resetSettings() {
    if (confirm('Reset all settings to defaults?')) {
      this.settings = {
        soundEnabled: true,
        volume: 75,
        fpsLimit: 60,
        graphicsQuality: 'high',
        defaultDifficulty: 'normal',
        showKeyBindings: true
      }
      this.updateUI()
      console.log('[SettingsMenu] Settings reset to defaults')
    }
  }

  /**
   * Update UI to reflect current settings
   * @private
   */
  updateUI() {
    const soundToggle = this.settingsElement?.querySelector('#sound-toggle')
    const volumeSlider = this.settingsElement?.querySelector('#volume-slider')
    const volumeValue = this.settingsElement?.querySelector('#settings-content')?.querySelector('span')
    const fpsSlider = this.settingsElement?.querySelector('#fps-slider')
    const qualitySelect = this.settingsElement?.querySelector('#quality-select')
    const diffSelect = this.settingsElement?.querySelector('#difficulty-select')

    if (soundToggle) soundToggle.checked = this.settings.soundEnabled
    if (volumeSlider) volumeSlider.value = this.settings.volume
    if (fpsSlider) fpsSlider.value = this.settings.fpsLimit
    if (qualitySelect) qualitySelect.value = this.settings.graphicsQuality
    if (diffSelect) diffSelect.value = this.settings.defaultDifficulty
  }

  /**
   * Handle keyboard input
   * @param {KeyboardEvent} event - The keyboard event
   */
  handleKeyDown(event) {
    if (!this.isVisible) return

    if (event.key === 'Escape') {
      event.preventDefault()
      this.hide()
    }
  }

  /**
   * Hide the settings menu
   */
  hide() {
    if (!this.isVisible) return

    this.isVisible = false
    this.saveSettings()

    if (this.settingsElement) {
      this.settingsElement.remove()
      this.settingsElement = null
    }

    document.removeEventListener('keydown', this.boundKeyHandler)

    console.log('[SettingsMenu] Settings hidden')
  }

  /**
   * Destroy the settings menu
   */
  destroy() {
    this.hide()
    document.removeEventListener('keydown', this.boundKeyHandler)
  }
}
