/**
 * @fileoverview Level selection menu component
 * @module ui/level-selector
 */

import { COLORS } from '../utils/constants.js'

/**
 * LevelSelector class - handles level selection and filtering
 * @class LevelSelector
 */
export class LevelSelector {
  /**
   * Create a level selector
   * @param {Renderer} renderer - The Renderer instance
   * @param {HTMLElement} uiRoot - The UI root container element
   * @param {Array} levels - Array of available levels
   */
  constructor(renderer, uiRoot, levels = []) {
    if (!renderer) {
      throw new Error('Invalid renderer')
    }
    if (!uiRoot) {
      throw new Error('Invalid UI root')
    }

    this.renderer = renderer
    this.uiRoot = uiRoot
    this.levels = levels
    this.isVisible = false
    this.selectedLevelIndex = 0
    this.currentDifficultyFilter = null // null = show all
    this.searchQuery = ''

    this.levelStats = new Map() // levelId -> { moves, time, completed }
    this.callbacks = {
      levelSelected: null,
      levelClosed: null,
    }

    this.selectorElement = null
    this.boundKeyHandler = this.handleKeyDown.bind(this)

    console.log('[LevelSelector] Initialized with', levels.length, 'levels')
  }

  /**
   * Add or update level stats
   * @param {string} levelId - Level ID
   * @param {Object} stats - Stats object { moves, time, completed }
   */
  setLevelStats(levelId, stats) {
    this.levelStats.set(levelId, stats)
  }

  /**
   * Get level stats
   * @param {string} levelId - Level ID
   * @returns {Object|null} Stats object or null if not found
   */
  getLevelStats(levelId) {
    return this.levelStats.get(levelId) || null
  }

  /**
   * Get level state (locked, unlocked, completed)
   * @param {string|number} levelId - Level ID
   * @returns {string} 'locked', 'unlocked', or 'completed'
   */
  getLevelState(levelId) {
    const stats = this.getLevelStats(levelId)

    if (stats && stats.completed) {
      return 'completed'
    }

    // First level is always unlocked
    const levelIndex = this.levels.findIndex((l) => l.id === levelId)
    if (levelIndex === 0 || levelIndex === -1) {
      return 'unlocked'
    }

    // Subsequent levels are unlocked if previous level is completed
    const previousLevel = this.levels[levelIndex - 1]
    const previousStats = this.getLevelStats(previousLevel.id)

    return previousStats && previousStats.completed ? 'unlocked' : 'locked'
  }

  /**
   * Get filtered level list
   * @returns {Array} Filtered levels
   */
  getFilteredLevels() {
    let filtered = [...this.levels]

    // Filter by difficulty
    if (this.currentDifficultyFilter) {
      filtered = filtered.filter((l) => l.difficulty === this.currentDifficultyFilter)
    }

    // Filter by search query
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase()
      filtered = filtered.filter(
        (l) =>
          l.name.toLowerCase().includes(query) ||
          (l.description && l.description.toLowerCase().includes(query))
      )
    }

    return filtered
  }

  /**
   * Show the level selector
   */
  showLevelList() {
    if (this.isVisible) return

    this.isVisible = true
    this.selectedLevelIndex = 0

    // Create selector HTML element
    this.selectorElement = document.createElement('div')
    this.selectorElement.id = 'level-selector'
    this.selectorElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(20, 20, 30, 0.95);
      display: flex;
      flex-direction: column;
      z-index: 1000;
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
    title.textContent = 'Select Level'
    title.style.cssText = `
      color: ${COLORS.ACCENT};
      margin: 0 0 20px 0;
      font-size: 32px;
    `
    header.appendChild(title)

    // Search bar
    const searchContainer = document.createElement('div')
    searchContainer.style.cssText = `
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    `

    const searchInput = document.createElement('input')
    searchInput.id = 'level-search'
    searchInput.type = 'text'
    searchInput.placeholder = 'Search levels...'
    searchInput.style.cssText = `
      flex: 1;
      padding: 10px 15px;
      background: ${COLORS.BG};
      color: ${COLORS.TEXT};
      border: 1px solid ${COLORS.ACCENT};
      border-radius: 5px;
      font-size: 14px;
    `

    searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value
      this.refreshLevelList()
    })

    searchContainer.appendChild(searchInput)
    header.appendChild(searchContainer)

    // Difficulty filter
    const filterContainer = document.createElement('div')
    filterContainer.style.cssText = `
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    `

    const difficulties = ['Easy', 'Normal', 'Hard', 'Expert']
    difficulties.forEach((diff) => {
      const btn = document.createElement('button')
      btn.textContent = diff
      btn.dataset.difficulty = diff.toLowerCase()
      btn.style.cssText = `
        padding: 8px 15px;
        background: ${COLORS.BG};
        color: ${COLORS.TEXT};
        border: 1px solid ${COLORS.ACCENT};
        border-radius: 3px;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.2s;
      `

      btn.addEventListener('click', () => {
        if (this.currentDifficultyFilter === diff.toLowerCase()) {
          this.currentDifficultyFilter = null
          btn.style.background = COLORS.BG
        } else {
          // Reset other buttons
          filterContainer.querySelectorAll('button').forEach((b) => {
            b.style.background = COLORS.BG
          })
          this.currentDifficultyFilter = diff.toLowerCase()
          btn.style.background = COLORS.ACCENT
          btn.style.color = '#000'
        }
        this.refreshLevelList()
      })

      filterContainer.appendChild(btn)
    })

    header.appendChild(filterContainer)
    this.selectorElement.appendChild(header)

    // Levels container
    const levelsContainer = document.createElement('div')
    levelsContainer.id = 'levels-list'
    levelsContainer.style.cssText = `
      flex: 1;
      overflow-y: auto;
      padding: 20px;
    `
    this.selectorElement.appendChild(levelsContainer)

    // Footer
    const footer = document.createElement('div')
    footer.style.cssText = `
      padding: 20px;
      border-top: 2px solid ${COLORS.ACCENT};
      background: rgba(0, 0, 0, 0.5);
      color: ${COLORS.TEXT};
      font-size: 12px;
      flex-shrink: 0;
    `
    footer.textContent = 'Use Arrow Keys to navigate, Enter to select, Esc to cancel'
    this.selectorElement.appendChild(footer)

    this.uiRoot.appendChild(this.selectorElement)

    // Add event listeners
    document.addEventListener('keydown', this.boundKeyHandler)

    // Render level list
    this.refreshLevelList()

    console.log('[LevelSelector] List shown with', this.getFilteredLevels().length, 'levels')
  }

  /**
   * Refresh the level list display
   */
  refreshLevelList() {
    const listContainer = this.selectorElement?.querySelector('#levels-list')
    if (!listContainer) return

    listContainer.innerHTML = ''

    const filteredLevels = this.getFilteredLevels()

    if (filteredLevels.length === 0) {
      const emptyMsg = document.createElement('div')
      emptyMsg.style.cssText = `
        color: ${COLORS.TEXT};
        padding: 40px 20px;
        text-align: center;
      `
      emptyMsg.textContent = 'No levels match your search'
      listContainer.appendChild(emptyMsg)
      return
    }

    filteredLevels.forEach((level, index) => {
      const state = this.getLevelState(level.id)
      const isSelected = index === this.selectedLevelIndex
      const isLocked = state === 'locked'

      const levelEl = document.createElement('div')
      levelEl.dataset.levelId = level.id
      levelEl.dataset.levelIndex = index
      levelEl.style.cssText = `
        background: ${isSelected ? COLORS.ACCENT : COLORS.BG};
        color: ${isSelected ? '#000' : COLORS.TEXT};
        border: 2px solid ${isLocked ? '#666' : COLORS.ACCENT};
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 15px;
        cursor: ${isLocked ? 'not-allowed' : 'pointer'};
        opacity: ${isLocked ? 0.5 : 1};
        transition: all 0.2s;
      `

      // Level header
      const levelHeader = document.createElement('div')
      levelHeader.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        font-weight: bold;
      `

      const titleDiv = document.createElement('div')
      const stateIcon =
        state === 'locked' ? '🔒' : state === 'completed' ? '✓' : '▶'
      titleDiv.textContent = `${stateIcon} ${level.name}`
      titleDiv.style.fontSize = '18px'

      const difficultyDiv = document.createElement('div')
      difficultyDiv.textContent = level.difficulty
      difficultyDiv.style.cssText = `
        padding: 4px 8px;
        background: ${isSelected ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.1)'};
        border-radius: 3px;
        font-size: 12px;
      `

      levelHeader.appendChild(titleDiv)
      levelHeader.appendChild(difficultyDiv)
      levelEl.appendChild(levelHeader)

      // Description
      if (level.description) {
        const desc = document.createElement('div')
        desc.textContent = level.description
        desc.style.cssText = `
          font-size: 13px;
          margin-bottom: 10px;
          opacity: 0.8;
        `
        levelEl.appendChild(desc)
      }

      // Stats
      const stats = this.getLevelStats(level.id)
      if (stats && stats.completed) {
        const statsDiv = document.createElement('div')
        statsDiv.style.cssText = `
          font-size: 12px;
          opacity: 0.7;
          display: flex;
          gap: 20px;
        `
        statsDiv.innerHTML = `
          <span>Moves: <strong>${stats.moves || '-'}</strong></span>
          <span>Time: <strong>${stats.time || '-'}</strong>s</span>
        `
        levelEl.appendChild(statsDiv)
      }

      levelEl.addEventListener('click', () => {
        if (!isLocked) {
          this.selectLevel(level.id)
        }
      })

      levelEl.addEventListener('mouseenter', () => {
        if (!isLocked) {
          this.selectedLevelIndex = index
          this.refreshLevelList()
        }
      })

      listContainer.appendChild(levelEl)
    })
  }

  /**
   * Select a level
   * @param {string} levelId - Level ID
   */
  selectLevel(levelId) {
    const state = this.getLevelState(levelId)
    if (state === 'locked') {
      console.log('[LevelSelector] Cannot select locked level:', levelId)
      return
    }

    const callback = this.callbacks.levelSelected
    if (callback && typeof callback === 'function') {
      callback(levelId)
    }

    console.log('[LevelSelector] Level selected:', levelId)
  }

  /**
   * Handle keyboard navigation
   * @param {KeyboardEvent} event - The keyboard event
   */
  handleKeyDown(event) {
    if (!this.isVisible) return

    const filteredLevels = this.getFilteredLevels()

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault()
        this.selectedLevelIndex = (this.selectedLevelIndex - 1 + filteredLevels.length) % filteredLevels.length
        this.refreshLevelList()
        break
      case 'ArrowDown':
        event.preventDefault()
        this.selectedLevelIndex = (this.selectedLevelIndex + 1) % filteredLevels.length
        this.refreshLevelList()
        break
      case 'Enter':
        event.preventDefault()
        if (filteredLevels.length > 0) {
          const selected = filteredLevels[this.selectedLevelIndex]
          this.selectLevel(selected.id)
        }
        break
      case 'Escape':
        event.preventDefault()
        this.hideLevelList()
        break
    }
  }

  /**
   * Hide the level selector
   */
  hideLevelList() {
    if (!this.isVisible) return

    this.isVisible = false

    if (this.selectorElement) {
      this.selectorElement.remove()
      this.selectorElement = null
    }

    document.removeEventListener('keydown', this.boundKeyHandler)

    const callback = this.callbacks.levelClosed
    if (callback && typeof callback === 'function') {
      callback()
    }

    console.log('[LevelSelector] List hidden')
  }

  /**
   * Register event callback
   * @param {string} eventType - Event type
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
   * Destroy the selector
   */
  destroy() {
    this.hideLevelList()
    document.removeEventListener('keydown', this.boundKeyHandler)
  }
}
