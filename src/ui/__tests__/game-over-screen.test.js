/**
 * @fileoverview Tests for GameOverScreen component
 * @module ui/__tests__/game-over-screen.test.js
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { GameOverScreen } from '../game-over-screen.js'

describe('GameOverScreen', () => {
  let screen
  let renderer
  let uiRoot

  beforeEach(() => {
    renderer = {
      clear: vi.fn(),
      drawRect: vi.fn(),
      drawText: vi.fn(),
    }

    uiRoot = document.createElement('div')
    uiRoot.id = 'ui-root'
    document.body.appendChild(uiRoot)

    screen = new GameOverScreen(renderer, uiRoot)
  })

  afterEach(() => {
    if (screen) {
      screen.destroy()
    }
    if (uiRoot && uiRoot.parentNode) {
      uiRoot.parentNode.removeChild(uiRoot)
    }
  })

  describe('Constructor', () => {
    it('should create game over screen with valid inputs', () => {
      expect(screen).toBeDefined()
      expect(screen.isVisible).toBe(false)
    })

    it('should throw error on null renderer', () => {
      expect(() => {
        new GameOverScreen(null, uiRoot)
      }).toThrow('Invalid renderer')
    })

    it('should throw error on null UI root', () => {
      expect(() => {
        new GameOverScreen(renderer, null)
      }).toThrow('Invalid UI root')
    })
  })

  describe('Victory Screen', () => {
    beforeEach(() => {
      screen.showVictory({ time: 45, moves: 8, levelName: 'Level 1' })
    })

    it('should show victory screen', () => {
      expect(screen.isVisible).toBe(true)
      expect(screen.currentState).toBe('victory')
      expect(uiRoot.querySelector('#game-over-screen')).toBeDefined()
    })

    it('should display victory header', () => {
      const text = uiRoot.textContent
      expect(text).toContain('LEVEL COMPLETE')
    })

    it('should display level name', () => {
      const text = uiRoot.textContent
      expect(text).toContain('Level 1')
    })

    it('should display game stats', () => {
      const stats = uiRoot.querySelector('#game-over-stats')
      expect(stats).toBeDefined()
      const text = uiRoot.textContent
      expect(text).toContain('Time:')
      expect(text).toContain('Moves:')
    })

    it('should have three buttons on victory', () => {
      const buttons = uiRoot.querySelectorAll('#game-over-buttons button')
      expect(buttons.length).toBe(3)
    })

    it('should have restart button', () => {
      const button = uiRoot.querySelector('#btn-restart')
      expect(button).toBeDefined()
      expect(button.textContent).toContain('Restart')
    })

    it('should have next level button', () => {
      const button = uiRoot.querySelector('#btn-next')
      expect(button).toBeDefined()
      expect(button.textContent).toContain('Next')
    })

    it('should have menu button', () => {
      const button = uiRoot.querySelector('#btn-menu')
      expect(button).toBeDefined()
      expect(button.textContent).toContain('Main Menu')
    })

    it('should have green border for victory', () => {
      const element = uiRoot.querySelector('#game-over-screen')
      expect(element.style.border).toContain('rgb(0, 255, 0)')
    })
  })

  describe('Defeat Screen', () => {
    beforeEach(() => {
      screen.showDefeat({ time: 120, moves: 25, levelName: 'Level 2' })
    })

    it('should show defeat screen', () => {
      expect(screen.isVisible).toBe(true)
      expect(screen.currentState).toBe('defeat')
      expect(uiRoot.querySelector('#game-over-screen')).toBeDefined()
    })

    it('should display defeat header', () => {
      const text = uiRoot.textContent
      expect(text).toContain('LEVEL FAILED')
    })

    it('should have two buttons on defeat', () => {
      const buttons = uiRoot.querySelectorAll('#game-over-buttons button')
      expect(buttons.length).toBe(2)
    })

    it('should have retry button instead of restart', () => {
      const button = uiRoot.querySelector('#btn-restart')
      expect(button).toBeDefined()
      expect(button.textContent).toContain('Retry')
    })

    it('should not have next level button on defeat', () => {
      const button = uiRoot.querySelector('#btn-next')
      expect(button).toBeNull()
    })

    it('should have red border for defeat', () => {
      const element = uiRoot.querySelector('#game-over-screen')
      expect(element.style.border).toContain('rgb(255, 0, 0)')
    })
  })

  describe('Stats Display', () => {
    it('should display time correctly', () => {
      screen.showVictory({ time: 65, moves: 5, levelName: 'Test' })

      const text = uiRoot.textContent
      expect(text).toContain('1m 5s')
    })

    it('should display moves correctly', () => {
      screen.showVictory({ time: 10, moves: 42, levelName: 'Test' })

      const text = uiRoot.textContent
      expect(text).toContain('42')
    })

    it('should update stats when showing new screen', () => {
      screen.showVictory({ time: 30, moves: 5, levelName: 'Level A' })
      screen.hide()

      screen.showVictory({ time: 60, moves: 10, levelName: 'Level B' })

      const text = uiRoot.textContent
      expect(text).toContain('Level B')
      expect(text).toContain('1m 0s')
    })
  })

  describe('Event System', () => {
    beforeEach(() => {
      screen.showVictory({ time: 30, moves: 5, levelName: 'Test' })
    })

    it('should register restart callback', () => {
      const callback = vi.fn()
      screen.on('restart', callback)

      const button = uiRoot.querySelector('#btn-restart')
      button.click()

      expect(callback).toHaveBeenCalled()
    })

    it('should register next callback', () => {
      const callback = vi.fn()
      screen.on('next', callback)

      const button = uiRoot.querySelector('#btn-next')
      button.click()

      expect(callback).toHaveBeenCalled()
    })

    it('should register menu callback', () => {
      const callback = vi.fn()
      screen.on('menu', callback)

      const button = uiRoot.querySelector('#btn-menu')
      button.click()

      expect(callback).toHaveBeenCalled()
    })

    it('should support multiple callbacks', () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()
      screen.on('restart', callback1)
      screen.on('restart', callback2)

      const button = uiRoot.querySelector('#btn-restart')
      button.click()

      expect(callback1).toHaveBeenCalled()
      expect(callback2).toHaveBeenCalled()
    })
  })

  describe('Keyboard Navigation', () => {
    beforeEach(() => {
      screen.showVictory({ time: 30, moves: 5, levelName: 'Test' })
    })

    it('should move selection down with ArrowDown', () => {
      expect(screen.selectedIndex).toBe(0)

      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
      document.dispatchEvent(event)

      expect(screen.selectedIndex).toBe(1)
    })

    it('should move selection up with ArrowUp', () => {
      screen.selectedIndex = 2

      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' })
      document.dispatchEvent(event)

      expect(screen.selectedIndex).toBe(1)
    })

    it('should not go above first button', () => {
      screen.selectedIndex = 0

      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' })
      document.dispatchEvent(event)

      expect(screen.selectedIndex).toBe(0)
    })

    it('should not go below last button', () => {
      screen.selectedIndex = 2

      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
      document.dispatchEvent(event)

      expect(screen.selectedIndex).toBe(2)
    })

    it('should activate selected button with Enter', () => {
      const callback = vi.fn()
      screen.on('restart', callback)

      const event = new KeyboardEvent('keydown', { key: 'Enter' })
      document.dispatchEvent(event)

      expect(callback).toHaveBeenCalled()
    })

    it('should ignore other keys', () => {
      screen.selectedIndex = 0
      const event = new KeyboardEvent('keydown', { key: 'q' })
      document.dispatchEvent(event)

      expect(screen.selectedIndex).toBe(0)
    })
  })

  describe('Button Selection', () => {
    beforeEach(() => {
      screen.showVictory({ time: 30, moves: 5, levelName: 'Test' })
    })

    it('should highlight first button by default', () => {
      const button = uiRoot.querySelector('#btn-restart')
      expect(button.style.background).toContain('rgba(0, 255, 0, 0.3)')
    })

    it('should update selection on arrow navigation', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
      document.dispatchEvent(event)

      const button = uiRoot.querySelector('#btn-next')
      expect(button.style.background).toContain('rgba(0, 255, 0, 0.3)')
    })

    it('should update selection on mouse hover', () => {
      const button = uiRoot.querySelector('#btn-next')
      const event = new MouseEvent('mouseenter')
      button.dispatchEvent(event)

      expect(screen.selectedIndex).toBe(1)
    })
  })

  describe('Lifecycle', () => {
    it('should be hideable', () => {
      screen.showVictory({ time: 30, moves: 5, levelName: 'Test' })
      expect(screen.isVisible).toBe(true)

      screen.hide()
      expect(screen.isVisible).toBe(false)
      expect(screen.screenElement).toBeNull()
    })

    it('should be reshowable', () => {
      screen.showVictory({ time: 30, moves: 5, levelName: 'Test' })
      screen.hide()

      screen.showVictory({ time: 30, moves: 5, levelName: 'Test' })
      expect(screen.isVisible).toBe(true)
      expect(uiRoot.querySelector('#game-over-screen')).toBeDefined()
    })

    it('should not show twice without hiding', () => {
      screen.showVictory({ time: 30, moves: 5, levelName: 'Test' })
      const firstElement = screen.screenElement

      screen.showVictory({ time: 30, moves: 5, levelName: 'Test' })
      expect(screen.screenElement).toBe(firstElement)
    })

    it('should destroy properly', () => {
      screen.showVictory({ time: 30, moves: 5, levelName: 'Test' })
      screen.destroy()

      expect(screen.isVisible).toBe(false)
      expect(screen.screenElement).toBeNull()
    })

    it('should remove event listeners on destroy', () => {
      const callback = vi.fn()
      screen.on('restart', callback)
      screen.showVictory({ time: 30, moves: 5, levelName: 'Test' })
      screen.destroy()

      const event = new KeyboardEvent('keydown', { key: 'Enter' })
      document.dispatchEvent(event)

      expect(callback).not.toHaveBeenCalled()
    })
  })

  describe('Visual Appearance', () => {
    it('should have fixed positioning', () => {
      screen.showVictory({ time: 30, moves: 5, levelName: 'Test' })
      const element = uiRoot.querySelector('#game-over-screen')
      expect(element.style.position).toBe('fixed')
    })

    it('should be centered on screen', () => {
      screen.showVictory({ time: 30, moves: 5, levelName: 'Test' })
      const element = uiRoot.querySelector('#game-over-screen')
      expect(element.style.transform).toContain('translate(-50%, -50%)')
    })

    it('should have high z-index', () => {
      screen.showVictory({ time: 30, moves: 5, levelName: 'Test' })
      const element = uiRoot.querySelector('#game-over-screen')
      const zIndex = parseInt(element.style.zIndex)
      expect(zIndex).toBeGreaterThan(1000)
    })
  })

  describe('Time Formatting', () => {
    it('should format time correctly', () => {
      screen.showVictory({ time: 0, moves: 0, levelName: 'Test' })
      expect(screen.formatTime(0)).toBe('0m 0s')
    })

    it('should format minutes and seconds', () => {
      screen.showVictory({ time: 0, moves: 0, levelName: 'Test' })
      expect(screen.formatTime(65)).toBe('1m 5s')
    })

    it('should handle large times', () => {
      screen.showVictory({ time: 0, moves: 0, levelName: 'Test' })
      expect(screen.formatTime(3661)).toBe('61m 1s')
    })
  })
})
