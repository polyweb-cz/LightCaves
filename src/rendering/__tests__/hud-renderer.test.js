/**
 * @fileoverview Unit tests for HUDRenderer class
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { HUDRenderer } from '../hud-renderer.js'

describe('HUDRenderer', () => {
  let mockRenderer
  let mockGridRenderer
  let hudRenderer

  beforeEach(() => {
    // Mock renderer
    mockRenderer = {
      drawText: vi.fn(),
      ctx: { globalAlpha: 1.0 }
    }

    // Mock grid renderer
    mockGridRenderer = {
      cellWidth: 16,
      cellHeight: 20
    }

    hudRenderer = new HUDRenderer(mockRenderer, mockGridRenderer)
  })

  describe('Constructor', () => {
    it('should create HUD renderer with valid inputs', () => {
      expect(hudRenderer.renderer).toBe(mockRenderer)
      expect(hudRenderer.gridRenderer).toBe(mockGridRenderer)
    })

    it('should throw error on null renderer', () => {
      expect(() => new HUDRenderer(null, mockGridRenderer)).toThrow('Invalid renderer')
    })

    it('should throw error on null gridRenderer', () => {
      expect(() => new HUDRenderer(mockRenderer, null)).toThrow('Invalid gridRenderer')
    })
  })

  describe('Time Formatting', () => {
    it('should format zero seconds as 0:00', () => {
      const formatted = hudRenderer.formatTime(0)
      expect(formatted).toBe('0:00')
    })

    it('should format 59 seconds as 0:59', () => {
      const formatted = hudRenderer.formatTime(59)
      expect(formatted).toBe('0:59')
    })

    it('should format 60 seconds as 1:00', () => {
      const formatted = hudRenderer.formatTime(60)
      expect(formatted).toBe('1:00')
    })

    it('should format 123 seconds as 2:03', () => {
      const formatted = hudRenderer.formatTime(123)
      expect(formatted).toBe('2:03')
    })

    it('should format 3661 seconds as 61:01', () => {
      const formatted = hudRenderer.formatTime(3661)
      expect(formatted).toBe('61:01')
    })

    it('should pad seconds with leading zero', () => {
      const formatted = hudRenderer.formatTime(5)
      expect(formatted).toBe('0:05')
    })
  })

  describe('Level Name Rendering', () => {
    it('should draw level name with number', () => {
      hudRenderer.drawLevelName(1)

      expect(mockRenderer.drawText).toHaveBeenCalled()
      const call = mockRenderer.drawText.mock.calls[0]
      expect(call[0]).toContain('Level')
      expect(call[0]).toContain('1')
    })

    it('should draw level name with string', () => {
      hudRenderer.drawLevelName('Tutorial 1')

      expect(mockRenderer.drawText).toHaveBeenCalled()
      const call = mockRenderer.drawText.mock.calls[0]
      expect(call[0]).toContain('Tutorial 1')
    })

    it('should draw at correct coordinates', () => {
      hudRenderer.drawLevelName('Test', 50, 100)

      const call = mockRenderer.drawText.mock.calls[0]
      expect(call[1]).toBe(50)
      expect(call[2]).toBe(100)
    })
  })

  describe('Move Counter Rendering', () => {
    it('should draw move counter', () => {
      hudRenderer.drawMoveCounter(5)

      expect(mockRenderer.drawText).toHaveBeenCalled()
      const call = mockRenderer.drawText.mock.calls[0]
      expect(call[0]).toContain('Moves')
      expect(call[0]).toContain('5')
    })

    it('should draw zero moves', () => {
      hudRenderer.drawMoveCounter(0)

      expect(mockRenderer.drawText).toHaveBeenCalled()
      const call = mockRenderer.drawText.mock.calls[0]
      expect(call[0]).toContain('0')
    })

    it('should draw large move count', () => {
      hudRenderer.drawMoveCounter(999)

      expect(mockRenderer.drawText).toHaveBeenCalled()
      const call = mockRenderer.drawText.mock.calls[0]
      expect(call[0]).toContain('999')
    })
  })

  describe('Timer Rendering', () => {
    it('should draw timer with formatted time', () => {
      hudRenderer.drawTimer(90)

      expect(mockRenderer.drawText).toHaveBeenCalled()
      const call = mockRenderer.drawText.mock.calls[0]
      expect(call[0]).toContain('Time')
      expect(call[0]).toContain('1:30')
    })

    it('should draw zero time', () => {
      hudRenderer.drawTimer(0)

      expect(mockRenderer.drawText).toHaveBeenCalled()
      const call = mockRenderer.drawText.mock.calls[0]
      expect(call[0]).toContain('0:00')
    })

    it('should draw long duration', () => {
      hudRenderer.drawTimer(3661)

      expect(mockRenderer.drawText).toHaveBeenCalled()
      const call = mockRenderer.drawText.mock.calls[0]
      expect(call[0]).toContain('61:01')
    })
  })

  describe('Difficulty Rendering', () => {
    it('should draw easy difficulty', () => {
      hudRenderer.drawDifficulty('Easy')

      expect(mockRenderer.drawText).toHaveBeenCalled()
      const call = mockRenderer.drawText.mock.calls[0]
      expect(call[0]).toContain('Easy')
    })

    it('should draw medium difficulty', () => {
      hudRenderer.drawDifficulty('Medium')

      expect(mockRenderer.drawText).toHaveBeenCalled()
      const call = mockRenderer.drawText.mock.calls[0]
      expect(call[0]).toContain('Medium')
    })

    it('should draw hard difficulty', () => {
      hudRenderer.drawDifficulty('Hard')

      expect(mockRenderer.drawText).toHaveBeenCalled()
      const call = mockRenderer.drawText.mock.calls[0]
      expect(call[0]).toContain('Hard')
    })

    it('should use green color for easy', () => {
      const color = hudRenderer.getDifficultyColor('Easy')
      expect(color).toBe('#00FF00')
    })

    it('should use yellow color for medium', () => {
      const color = hudRenderer.getDifficultyColor('Medium')
      expect(color).toBe('#FFFF00')
    })

    it('should use red color for hard', () => {
      const color = hudRenderer.getDifficultyColor('Hard')
      expect(color).toBe('#FF0000')
    })

    it('should be case-insensitive', () => {
      const color1 = hudRenderer.getDifficultyColor('EASY')
      const color2 = hudRenderer.getDifficultyColor('easy')
      expect(color1).toBe(color2)
    })
  })

  describe('Complete HUD Rendering', () => {
    it('should draw complete HUD with all fields', () => {
      const gameState = {
        levelName: 1,
        moves: 5,
        elapsedTime: 90,
        difficulty: 'Medium'
      }

      hudRenderer.drawHUD(gameState)

      expect(mockRenderer.drawText).toHaveBeenCalledTimes(4)
    })

    it('should draw HUD with missing fields', () => {
      const gameState = {
        levelName: 1,
        moves: 5
      }

      hudRenderer.drawHUD(gameState)

      expect(mockRenderer.drawText).toHaveBeenCalledTimes(2)
    })

    it('should handle null gameState gracefully', () => {
      hudRenderer.drawHUD(null)

      expect(mockRenderer.drawText).not.toHaveBeenCalled()
    })

    it('should draw HUD at custom Y position', () => {
      const gameState = {
        levelName: 1,
        moves: 5,
        elapsedTime: 60,
        difficulty: 'Easy'
      }

      hudRenderer.drawHUD(gameState, 50)

      // All drawText calls should have y = 50
      mockRenderer.drawText.mock.calls.forEach(call => {
        expect(call[2]).toBe(50)
      })
    })

    it('should handle zero moves', () => {
      const gameState = {
        levelName: 'Start',
        moves: 0,
        elapsedTime: 0,
        difficulty: 'Easy'
      }

      hudRenderer.drawHUD(gameState)

      expect(mockRenderer.drawText).toHaveBeenCalledTimes(4)
    })

    it('should handle undefined difficulty', () => {
      const gameState = {
        levelName: 1,
        moves: 5,
        elapsedTime: 100,
        difficulty: undefined
      }

      hudRenderer.drawHUD(gameState)

      // Should still draw level name, moves, and time (3 calls)
      expect(mockRenderer.drawText).toHaveBeenCalledTimes(3)
    })
  })

  describe('HUD Separator', () => {
    it('should draw HUD separator line', () => {
      hudRenderer.drawHUDSeparator(30)

      expect(mockRenderer.drawText).toHaveBeenCalled()
    })

    it('should draw separator at correct Y position', () => {
      hudRenderer.drawHUDSeparator(50)

      const calls = mockRenderer.drawText.mock.calls
      calls.forEach(call => {
        expect(call[2]).toBe(50)
      })
    })

    it('should draw custom width separator', () => {
      mockRenderer.drawText.mockClear()

      hudRenderer.drawHUDSeparator(30, 200)

      // With 200px width and 8px per character, we get ~25 separator chars
      expect(mockRenderer.drawText).toHaveBeenCalled()
      expect(mockRenderer.drawText.mock.calls.length).toBeGreaterThan(0)
    })
  })

  describe('Multiple HUD Instances', () => {
    it('should render multiple HUD instances independently', () => {
      const gameState1 = {
        levelName: 1,
        moves: 5,
        elapsedTime: 60,
        difficulty: 'Easy'
      }

      const gameState2 = {
        levelName: 2,
        moves: 10,
        elapsedTime: 120,
        difficulty: 'Hard'
      }

      hudRenderer.drawHUD(gameState1)
      const firstCallCount = mockRenderer.drawText.mock.calls.length

      mockRenderer.drawText.mockClear()

      hudRenderer.drawHUD(gameState2)
      const secondCallCount = mockRenderer.drawText.mock.calls.length

      expect(firstCallCount).toBe(4)
      expect(secondCallCount).toBe(4)
    })
  })
})
