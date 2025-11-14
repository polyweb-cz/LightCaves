/**
 * @fileoverview Tests for GameHUD component
 * @module ui/__tests__/game-hud.test.js
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { GameHUD } from '../game-hud.js'
import { COLORS } from '../../utils/constants.js'

describe('GameHUD', () => {
  let hud
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

    hud = new GameHUD(renderer, uiRoot)
  })

  afterEach(() => {
    if (hud) {
      hud.destroy()
    }
    if (uiRoot && uiRoot.parentNode) {
      uiRoot.parentNode.removeChild(uiRoot)
    }
  })

  describe('Constructor', () => {
    it('should create HUD with valid inputs', () => {
      expect(hud).toBeDefined()
      expect(hud.isVisible).toBe(false)
      expect(hud.stats).toBeDefined()
    })

    it('should throw error on null renderer', () => {
      expect(() => {
        new GameHUD(null, uiRoot)
      }).toThrow('Invalid renderer')
    })

    it('should throw error on null UI root', () => {
      expect(() => {
        new GameHUD(renderer, null)
      }).toThrow('Invalid UI root')
    })

    it('should initialize with default stats', () => {
      expect(hud.stats.levelName).toBe('Untitled')
      expect(hud.stats.moves).toBe(0)
      expect(hud.stats.time).toBe(0)
      expect(hud.stats.difficulty).toBe('normal')
      expect(hud.stats.targetCount).toBe(0)
      expect(hud.stats.illuminatedCount).toBe(0)
    })

    it('should have 4 action buttons', () => {
      expect(hud.buttons).toHaveLength(4)
      expect(hud.buttons[0].id).toBe('undo')
      expect(hud.buttons[1].id).toBe('redo')
      expect(hud.buttons[2].id).toBe('reset')
      expect(hud.buttons[3].id).toBe('menu')
    })
  })

  describe('HUD Display', () => {
    it('should show HUD', () => {
      hud.show()

      expect(hud.isVisible).toBe(true)
      expect(hud.hudElement).toBeDefined()
      expect(uiRoot.querySelector('#game-hud')).toBeDefined()
    })

    it('should hide HUD', () => {
      hud.show()
      expect(hud.isVisible).toBe(true)

      hud.hide()
      expect(hud.isVisible).toBe(false)
      expect(hud.hudElement).toBeNull()
    })

    it('should not show HUD twice', () => {
      hud.show()
      const firstElement = hud.hudElement

      hud.show()
      expect(hud.hudElement).toBe(firstElement)
    })

    it('should create HUD structure with bars', () => {
      hud.show()

      expect(uiRoot.querySelector('#hud-top-bar')).toBeDefined()
      expect(uiRoot.querySelector('#hud-bottom-bar')).toBeDefined()
    })

    it('should display level info', () => {
      hud.show()

      const levelInfo = uiRoot.querySelector('#level-info')
      expect(levelInfo).toBeDefined()
      expect(levelInfo.textContent).toContain('Untitled')
    })

    it('should display progress info', () => {
      hud.show()

      const progressInfo = uiRoot.querySelector('#progress-info')
      expect(progressInfo).toBeDefined()
      expect(progressInfo.textContent).toContain('Targets')
      expect(progressInfo.textContent).toContain('Moves')
    })

    it('should display timer', () => {
      hud.show()

      const timer = uiRoot.querySelector('#timer')
      expect(timer).toBeDefined()
      expect(timer.textContent).toContain('00:00')
    })
  })

  describe('Stats Update', () => {
    beforeEach(() => {
      hud.show()
    })

    it('should update stats', () => {
      const newStats = {
        levelName: 'Test Level',
        moves: 5,
        difficulty: 'hard',
        targetCount: 3,
        illuminatedCount: 2,
      }

      hud.updateStats(newStats)

      expect(hud.stats.levelName).toBe('Test Level')
      expect(hud.stats.moves).toBe(5)
      expect(hud.stats.difficulty).toBe('hard')
    })

    it('should update display when stats change', () => {
      hud.updateStats({ levelName: 'New Level', moves: 10 })

      const levelInfo = uiRoot.querySelector('#level-info')
      expect(levelInfo.textContent).toContain('New Level')

      const progressInfo = uiRoot.querySelector('#progress-info')
      expect(progressInfo.textContent).toContain('10')
    })

    it('should update progress display', () => {
      hud.updateStats({ targetCount: 5, illuminatedCount: 3 })

      const progressInfo = uiRoot.querySelector('#progress-info')
      expect(progressInfo.textContent).toContain('3/5')
    })

    it('should preserve unmodified stats', () => {
      const originalTime = hud.stats.time

      hud.updateStats({ moves: 5 })

      expect(hud.stats.time).toBe(originalTime)
    })
  })

  describe('Time Formatting', () => {
    it('should format time correctly', () => {
      expect(hud.formatTime(0)).toBe('00:00')
      expect(hud.formatTime(5)).toBe('00:05')
      expect(hud.formatTime(60)).toBe('01:00')
      expect(hud.formatTime(65)).toBe('01:05')
      expect(hud.formatTime(125)).toBe('02:05')
    })

    it('should pad seconds with leading zero', () => {
      expect(hud.formatTime(9)).toBe('00:09')
      expect(hud.formatTime(69)).toBe('01:09')
    })

    it('should pad minutes with leading zero', () => {
      expect(hud.formatTime(600)).toBe('10:00')
      expect(hud.formatTime(3599)).toBe('59:59')
    })
  })

  describe('Timer', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      hud.show()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should start timer on show', () => {
      expect(hud.timerInterval).toBeDefined()
    })

    it('should increment time every second', () => {
      const initialTime = hud.stats.time

      vi.advanceTimersByTime(1000)

      expect(hud.stats.time).toBe(initialTime + 1)
    })

    it('should update timer display', () => {
      const timer = uiRoot.querySelector('#timer')
      expect(timer.textContent).toBe('00:00')

      vi.advanceTimersByTime(5000)

      expect(timer.textContent).toBe('00:05')
    })

    it('should increment multiple times', () => {
      const initialTime = hud.stats.time

      vi.advanceTimersByTime(3000)

      expect(hud.stats.time).toBe(initialTime + 3)
    })

    it('should stop timer on hide', () => {
      const intervalId = hud.timerInterval
      hud.hide()

      expect(hud.timerInterval).toBeNull()

      // Verify timer stopped by advancing time
      const timeBeforeAdvance = hud.stats.time
      vi.advanceTimersByTime(5000)

      // Time should not have incremented since timer was stopped
      expect(hud.stats.time).toBe(timeBeforeAdvance)
    })
  })

  describe('Action Buttons', () => {
    beforeEach(() => {
      hud.show()
    })

    it('should create action buttons', () => {
      const buttons = uiRoot.querySelectorAll('[data-action]')
      expect(buttons).toHaveLength(4)
    })

    it('should trigger undo callback', () => {
      const callback = vi.fn()
      hud.on('undo', callback)

      const undoBtn = uiRoot.querySelector('[data-action="undo"]')
      undoBtn.click()

      expect(callback).toHaveBeenCalled()
    })

    it('should trigger redo callback', () => {
      const callback = vi.fn()
      hud.on('redo', callback)

      const redoBtn = uiRoot.querySelector('[data-action="redo"]')
      redoBtn.click()

      expect(callback).toHaveBeenCalled()
    })

    it('should trigger reset callback', () => {
      const callback = vi.fn()
      hud.on('reset', callback)

      const resetBtn = uiRoot.querySelector('[data-action="reset"]')
      resetBtn.click()

      expect(callback).toHaveBeenCalled()
    })

    it('should trigger menu callback', () => {
      const callback = vi.fn()
      hud.on('menu', callback)

      const menuBtn = uiRoot.querySelector('[data-action="menu"]')
      menuBtn.click()

      expect(callback).toHaveBeenCalled()
    })

    it('should change button style on hover', () => {
      const undoBtn = uiRoot.querySelector('[data-action="undo"]')
      const originalBg = undoBtn.style.background

      const mouseoverEvent = new MouseEvent('mouseenter')
      undoBtn.dispatchEvent(mouseoverEvent)

      expect(undoBtn.style.background).not.toBe(originalBg)
    })

    it('should restore button style on leave', () => {
      const undoBtn = uiRoot.querySelector('[data-action="undo"]')

      const mouseoverEvent = new MouseEvent('mouseenter')
      undoBtn.dispatchEvent(mouseoverEvent)
      const hoverColor = undoBtn.style.color

      const mouseleaveEvent = new MouseEvent('mouseleave')
      undoBtn.dispatchEvent(mouseleaveEvent)
      const leaveColor = undoBtn.style.color

      // Color should be different when hovering vs when leaving
      expect(hoverColor).not.toBe(leaveColor)
    })
  })

  describe('Event Callbacks', () => {
    it('should register callback with on()', () => {
      const callback = vi.fn()
      hud.on('undo', callback)

      expect(hud.callbacks.undo).toBe(callback)
    })

    it('should remove callback with off()', () => {
      const callback = vi.fn()
      hud.on('undo', callback)
      expect(hud.callbacks.undo).toBe(callback)

      hud.off('undo')
      expect(hud.callbacks.undo).toBeNull()
    })

    it('should handle all action types', () => {
      const callbacks = {
        undo: vi.fn(),
        redo: vi.fn(),
        reset: vi.fn(),
        menu: vi.fn(),
      }

      Object.entries(callbacks).forEach(([action, callback]) => {
        hud.on(action, callback)
      })

      hud.handleButtonClick('undo')
      hud.handleButtonClick('redo')
      hud.handleButtonClick('reset')
      hud.handleButtonClick('menu')

      expect(callbacks.undo).toHaveBeenCalled()
      expect(callbacks.redo).toHaveBeenCalled()
      expect(callbacks.reset).toHaveBeenCalled()
      expect(callbacks.menu).toHaveBeenCalled()
    })
  })

  describe('Button Position Detection', () => {
    beforeEach(() => {
      hud.show()
    })

    it('should have getButtonAtPoint method', () => {
      expect(typeof hud.getButtonAtPoint).toBe('function')
    })

    it('should detect button at position with mock rect', () => {
      const undoBtn = uiRoot.querySelector('[data-action="undo"]')

      const mockRect = {
        left: 100,
        right: 150,
        top: 200,
        bottom: 240,
      }

      vi.spyOn(undoBtn, 'getBoundingClientRect').mockReturnValue(mockRect)

      const result = hud.getButtonAtPoint(125, 220)
      expect(result).toBeDefined()
      expect(result.id).toBe('undo')
    })

    it('should return null for position outside buttons', () => {
      const buttons = uiRoot.querySelectorAll('[data-action]')
      buttons.forEach((btn) => {
        const mockRect = {
          left: 100,
          right: 150,
          top: 200,
          bottom: 240,
        }
        vi.spyOn(btn, 'getBoundingClientRect').mockReturnValue(mockRect)
      })

      const result = hud.getButtonAtPoint(500, 500)
      expect(result).toBeNull()
    })
  })

  describe('Lifecycle', () => {
    it('should destroy HUD properly', () => {
      hud.show()
      expect(hud.isVisible).toBe(true)

      hud.destroy()
      expect(hud.isVisible).toBe(false)
      expect(hud.hudElement).toBeNull()
    })

    it('should stop timer on destroy', () => {
      vi.useFakeTimers()
      hud.show()
      const timerInterval = hud.timerInterval

      hud.destroy()

      expect(hud.timerInterval).toBeNull()
      vi.useRealTimers()
    })

    it('should remove event listeners on destroy', () => {
      hud.show()
      const callback = vi.fn()
      hud.on('undo', callback)

      hud.destroy()

      // After destroy, callbacks should still exist but HUD is gone
      expect(hud.callbacks.undo).toBe(callback)
      expect(hud.hudElement).toBeNull()
    })
  })

  describe('Refresh', () => {
    beforeEach(() => {
      hud.show()
    })

    it('should refresh when HUD is visible', () => {
      hud.updateStats({ levelName: 'Refreshed', moves: 20 })

      const levelInfo = uiRoot.querySelector('#level-info')
      expect(levelInfo.textContent).toContain('Refreshed')
    })

    it('should not refresh when HUD is not visible', () => {
      hud.hide()
      const updatedStats = { levelName: 'NotRefreshed', moves: 30 }

      hud.updateStats(updatedStats)

      // Stats should be updated internally but not displayed
      expect(hud.stats.levelName).toBe('NotRefreshed')
      expect(uiRoot.querySelector('#level-info')).toBeNull()
    })
  })

  describe('Concurrent Operations', () => {
    it('should handle multiple stat updates', () => {
      hud.show()

      hud.updateStats({ moves: 5, targetCount: 3 })
      hud.updateStats({ illuminatedCount: 2 })
      hud.updateStats({ difficulty: 'expert' })

      expect(hud.stats.moves).toBe(5)
      expect(hud.stats.targetCount).toBe(3)
      expect(hud.stats.illuminatedCount).toBe(2)
      expect(hud.stats.difficulty).toBe('expert')
    })

    it('should handle rapid button clicks', () => {
      hud.show()
      const callback = vi.fn()
      hud.on('undo', callback)

      const undoBtn = uiRoot.querySelector('[data-action="undo"]')
      undoBtn.click()
      undoBtn.click()
      undoBtn.click()

      expect(callback).toHaveBeenCalledTimes(3)
    })
  })
})
