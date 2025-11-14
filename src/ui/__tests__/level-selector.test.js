/**
 * @fileoverview Tests for LevelSelector component
 * @module ui/__tests__/level-selector.test.js
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { LevelSelector } from '../level-selector.js'
import { COLORS } from '../../utils/constants.js'

describe('LevelSelector', () => {
  let selector
  let renderer
  let uiRoot
  let testLevels

  beforeEach(() => {
    renderer = {
      clear: vi.fn(),
      drawRect: vi.fn(),
      drawText: vi.fn(),
    }

    uiRoot = document.createElement('div')
    uiRoot.id = 'ui-root'
    document.body.appendChild(uiRoot)

    testLevels = [
      { id: 'level-1', name: 'Tutorial', description: 'Learn the basics', difficulty: 'easy' },
      { id: 'level-2', name: 'First Challenge', description: 'Your first challenge', difficulty: 'normal' },
      { id: 'level-3', name: 'Mirror Maze', description: 'Complex reflections', difficulty: 'hard' },
      { id: 'level-4', name: 'Expert Level', description: 'Ultimate challenge', difficulty: 'expert' },
    ]

    selector = new LevelSelector(renderer, uiRoot, testLevels)
  })

  afterEach(() => {
    if (selector) {
      selector.destroy()
    }
    if (uiRoot && uiRoot.parentNode) {
      uiRoot.parentNode.removeChild(uiRoot)
    }
  })

  describe('Constructor', () => {
    it('should create selector with valid inputs', () => {
      expect(selector).toBeDefined()
      expect(selector.levels).toEqual(testLevels)
      expect(selector.isVisible).toBe(false)
    })

    it('should throw error on null renderer', () => {
      expect(() => {
        new LevelSelector(null, uiRoot, testLevels)
      }).toThrow('Invalid renderer')
    })

    it('should throw error on null UI root', () => {
      expect(() => {
        new LevelSelector(renderer, null, testLevels)
      }).toThrow('Invalid UI root')
    })

    it('should initialize with empty levels by default', () => {
      const emptySelector = new LevelSelector(renderer, uiRoot)
      expect(emptySelector.levels).toEqual([])
      emptySelector.destroy()
    })

    it('should initialize with default values', () => {
      expect(selector.selectedLevelIndex).toBe(0)
      expect(selector.currentDifficultyFilter).toBeNull()
      expect(selector.searchQuery).toBe('')
    })
  })

  describe('Level Stats', () => {
    it('should set and get level stats', () => {
      const stats = { moves: 10, time: 120, completed: true }
      selector.setLevelStats('level-1', stats)

      expect(selector.getLevelStats('level-1')).toEqual(stats)
    })

    it('should return null for non-existent level stats', () => {
      expect(selector.getLevelStats('unknown')).toBeNull()
    })

    it('should update existing level stats', () => {
      selector.setLevelStats('level-1', { moves: 10, time: 120, completed: true })
      selector.setLevelStats('level-1', { moves: 8, time: 100, completed: true })

      expect(selector.getLevelStats('level-1').moves).toBe(8)
    })
  })

  describe('Level State', () => {
    it('should mark first level as unlocked', () => {
      expect(selector.getLevelState('level-1')).toBe('unlocked')
    })

    it('should mark level as completed when stats exist and completed is true', () => {
      selector.setLevelStats('level-1', { completed: true })
      expect(selector.getLevelState('level-1')).toBe('completed')
    })

    it('should mark subsequent level as locked if previous not completed', () => {
      expect(selector.getLevelState('level-2')).toBe('locked')
    })

    it('should unlock subsequent level if previous is completed', () => {
      selector.setLevelStats('level-1', { completed: true })
      expect(selector.getLevelState('level-2')).toBe('unlocked')
    })

    it('should handle non-existent level ID', () => {
      expect(selector.getLevelState('unknown')).toBe('unlocked')
    })

    it('should chain unlocking: unlock 1, then 2, then 3', () => {
      selector.setLevelStats('level-1', { completed: true })
      expect(selector.getLevelState('level-2')).toBe('unlocked')

      selector.setLevelStats('level-2', { completed: true })
      expect(selector.getLevelState('level-3')).toBe('unlocked')
    })
  })

  describe('Filtering', () => {
    it('should return all levels when no filter', () => {
      const filtered = selector.getFilteredLevels()
      expect(filtered).toHaveLength(4)
    })

    it('should filter by difficulty', () => {
      selector.currentDifficultyFilter = 'easy'
      const filtered = selector.getFilteredLevels()

      expect(filtered).toHaveLength(1)
      expect(filtered[0].difficulty).toBe('easy')
    })

    it('should filter by search query (name)', () => {
      selector.searchQuery = 'mirror'
      const filtered = selector.getFilteredLevels()

      expect(filtered).toHaveLength(1)
      expect(filtered[0].name).toContain('Mirror')
    })

    it('should filter by search query (description)', () => {
      selector.searchQuery = 'basics'
      const filtered = selector.getFilteredLevels()

      expect(filtered).toHaveLength(1)
      expect(filtered[0].description).toContain('basics')
    })

    it('should filter by both difficulty and search', () => {
      selector.currentDifficultyFilter = 'hard'
      selector.searchQuery = 'maze'
      const filtered = selector.getFilteredLevels()

      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe('level-3')
    })

    it('should return empty array for no matches', () => {
      selector.searchQuery = 'nonexistent'
      const filtered = selector.getFilteredLevels()

      expect(filtered).toHaveLength(0)
    })

    it('should be case insensitive in search', () => {
      selector.searchQuery = 'TUTORIAL'
      const filtered = selector.getFilteredLevels()

      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe('level-1')
    })
  })

  describe('Level List Display', () => {
    beforeEach(() => {
      selector.showLevelList()
    })

    it('should show level list', () => {
      expect(selector.isVisible).toBe(true)
      expect(selector.selectorElement).toBeDefined()
      expect(uiRoot.querySelector('#level-selector')).toBeDefined()
    })

    it('should render all levels initially', () => {
      const levelItems = uiRoot.querySelectorAll('[data-level-id]')
      expect(levelItems).toHaveLength(4)
    })

    it('should create search input', () => {
      const searchInput = uiRoot.querySelector('#level-search')
      expect(searchInput).toBeDefined()
    })

    it('should update list when search changes', () => {
      const searchInput = uiRoot.querySelector('#level-search')
      searchInput.value = 'mirror'
      searchInput.dispatchEvent(new Event('input'))

      const levelItems = uiRoot.querySelectorAll('[data-level-id]')
      expect(levelItems).toHaveLength(1)
    })

    it('should show empty message when no results', () => {
      const searchInput = uiRoot.querySelector('#level-search')
      searchInput.value = 'nonexistent'
      searchInput.dispatchEvent(new Event('input'))

      const emptyMsg = uiRoot.querySelector('#level-selector')
      expect(emptyMsg.textContent).toContain('No levels match')
    })

    it('should display level names', () => {
      expect(uiRoot.textContent).toContain('Tutorial')
      expect(uiRoot.textContent).toContain('First Challenge')
      expect(uiRoot.textContent).toContain('Mirror Maze')
    })

    it('should display difficulty badges', () => {
      expect(uiRoot.textContent).toContain('easy')
      expect(uiRoot.textContent).toContain('normal')
      expect(uiRoot.textContent).toContain('hard')
      expect(uiRoot.textContent).toContain('expert')
    })
  })

  describe('Level Selection', () => {
    beforeEach(() => {
      selector.showLevelList()
    })

    it('should select unlocked level', () => {
      const callback = vi.fn()
      selector.on('levelSelected', callback)

      selector.selectLevel('level-1')

      expect(callback).toHaveBeenCalledWith('level-1')
    })

    it('should not select locked level', () => {
      const callback = vi.fn()
      selector.on('levelSelected', callback)

      selector.selectLevel('level-2')

      expect(callback).not.toHaveBeenCalled()
    })

    it('should select level with Enter key', () => {
      const callback = vi.fn()
      selector.on('levelSelected', callback)

      const event = new KeyboardEvent('keydown', { key: 'Enter' })
      document.dispatchEvent(event)

      expect(callback).toHaveBeenCalledWith('level-1')
    })

    it('should trigger callback on level click', () => {
      const callback = vi.fn()
      selector.on('levelSelected', callback)

      const levelEl = uiRoot.querySelector('[data-level-id="level-1"]')
      levelEl.click()

      expect(callback).toHaveBeenCalledWith('level-1')
    })
  })

  describe('Keyboard Navigation', () => {
    beforeEach(() => {
      selector.showLevelList()
    })

    it('should move selection down with ArrowDown', () => {
      expect(selector.selectedLevelIndex).toBe(0)

      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
      document.dispatchEvent(event)

      expect(selector.selectedLevelIndex).toBe(1)
    })

    it('should move selection up with ArrowUp', () => {
      selector.selectedLevelIndex = 2
      selector.refreshLevelList()

      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' })
      document.dispatchEvent(event)

      expect(selector.selectedLevelIndex).toBe(1)
    })

    it('should wrap around when going down from last', () => {
      selector.selectedLevelIndex = 3
      selector.refreshLevelList()

      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
      document.dispatchEvent(event)

      expect(selector.selectedLevelIndex).toBe(0)
    })

    it('should wrap around when going up from first', () => {
      selector.selectedLevelIndex = 0
      selector.refreshLevelList()

      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' })
      document.dispatchEvent(event)

      expect(selector.selectedLevelIndex).toBe(3)
    })

    it('should close list with Escape key', () => {
      expect(selector.isVisible).toBe(true)

      const event = new KeyboardEvent('keydown', { key: 'Escape' })
      document.dispatchEvent(event)

      expect(selector.isVisible).toBe(false)
    })
  })

  describe('Difficulty Filtering UI', () => {
    beforeEach(() => {
      selector.showLevelList()
    })

    it('should have difficulty filter buttons', () => {
      const buttons = uiRoot.querySelectorAll('[data-difficulty]')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should filter when difficulty button clicked', () => {
      const buttons = uiRoot.querySelectorAll('[data-difficulty]')
      const easyBtn = Array.from(buttons).find((b) => b.dataset.difficulty === 'easy')

      easyBtn.click()

      const levelItems = uiRoot.querySelectorAll('[data-level-id]')
      expect(levelItems).toHaveLength(1)
    })

    it('should toggle filter off when clicking same button again', () => {
      const buttons = uiRoot.querySelectorAll('[data-difficulty]')
      const easyBtn = Array.from(buttons).find((b) => b.dataset.difficulty === 'easy')

      easyBtn.click()
      expect(selector.currentDifficultyFilter).toBe('easy')

      easyBtn.click()
      expect(selector.currentDifficultyFilter).toBeNull()
    })
  })

  describe('Event Callbacks', () => {
    it('should register and trigger levelSelected callback', () => {
      const callback = vi.fn()
      selector.on('levelSelected', callback)

      selector.selectLevel('level-1')

      expect(callback).toHaveBeenCalledWith('level-1')
    })

    it('should register and trigger levelClosed callback', () => {
      const callback = vi.fn()
      selector.on('levelClosed', callback)

      selector.showLevelList()
      selector.hideLevelList()

      expect(callback).toHaveBeenCalled()
    })

    it('should remove callback with off()', () => {
      const callback = vi.fn()
      selector.on('levelSelected', callback)
      selector.off('levelSelected')

      selector.selectLevel('level-1')

      expect(callback).not.toHaveBeenCalled()
    })
  })

  describe('List Display States', () => {
    beforeEach(() => {
      selector.showLevelList()
    })

    it('should show locked state indicator', () => {
      const levelItems = uiRoot.querySelectorAll('[data-level-id]')
      expect(levelItems[1].textContent).toContain('🔒')
    })

    it('should show completed state indicator', () => {
      selector.setLevelStats('level-1', { completed: true })
      selector.refreshLevelList()

      const levelItems = uiRoot.querySelectorAll('[data-level-id]')
      expect(levelItems[0].textContent).toContain('✓')
    })

    it('should display level stats when completed', () => {
      selector.setLevelStats('level-1', { moves: 15, time: 120, completed: true })
      selector.refreshLevelList()

      const levelEl = uiRoot.querySelector('[data-level-id="level-1"]')
      expect(levelEl.textContent).toContain('15')
    })
  })

  describe('Lifecycle', () => {
    it('should hide level list', () => {
      selector.showLevelList()
      expect(selector.isVisible).toBe(true)

      selector.hideLevelList()
      expect(selector.isVisible).toBe(false)
      expect(selector.selectorElement).toBeNull()
    })

    it('should destroy properly', () => {
      selector.showLevelList()
      selector.destroy()

      expect(selector.isVisible).toBe(false)
      expect(selector.selectorElement).toBeNull()
    })

    it('should not show list twice', () => {
      selector.showLevelList()
      const firstElement = selector.selectorElement

      selector.showLevelList()
      expect(selector.selectorElement).toBe(firstElement)
    })

    it('should remove event listeners on destroy', () => {
      selector.showLevelList()
      selector.destroy()

      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
      document.dispatchEvent(event)

      // After destroy, navigation shouldn't work
      expect(selector.selectedLevelIndex).toBe(0)
    })
  })

  describe('Multiple Selections', () => {
    it('should handle rapid level unlocking', () => {
      selector.setLevelStats('level-1', { completed: true })
      selector.setLevelStats('level-2', { completed: true })
      selector.setLevelStats('level-3', { completed: true })

      expect(selector.getLevelState('level-4')).toBe('unlocked')
    })

    it('should update filtered list after stats change', () => {
      selector.showLevelList()

      // Initially only level-1 and level-2 visible
      let filtered = selector.getFilteredLevels()
      expect(filtered.length).toBeGreaterThanOrEqual(1)

      // Complete level-1 to unlock level-2
      selector.setLevelStats('level-1', { completed: true })
      selector.refreshLevelList()

      filtered = selector.getFilteredLevels()
      expect(filtered.length).toBeGreaterThanOrEqual(2)
    })
  })
})
