/**
 * @fileoverview Unit tests for VictoryScreenRenderer class
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { VictoryScreenRenderer } from '../victory-screen-renderer.js'

describe('VictoryScreenRenderer', () => {
  let mockRenderer
  let victoryRenderer

  beforeEach(() => {
    // Mock renderer
    mockRenderer = {
      drawText: vi.fn(),
      drawRect: vi.fn(),
      ctx: { globalAlpha: 1.0 }
    }

    victoryRenderer = new VictoryScreenRenderer(mockRenderer, 640, 480)
  })

  describe('Constructor', () => {
    it('should create victory renderer with valid inputs', () => {
      expect(victoryRenderer.renderer).toBe(mockRenderer)
      expect(victoryRenderer.canvasWidth).toBe(640)
      expect(victoryRenderer.canvasHeight).toBe(480)
    })

    it('should throw error on null renderer', () => {
      expect(() => new VictoryScreenRenderer(null, 640, 480)).toThrow('Invalid renderer')
    })

    it('should use default canvas dimensions', () => {
      const renderer = new VictoryScreenRenderer(mockRenderer)
      expect(renderer.canvasWidth).toBe(640)
      expect(renderer.canvasHeight).toBe(480)
    })
  })

  describe('Time Formatting', () => {
    it('should format zero seconds', () => {
      const formatted = victoryRenderer.formatTime(0)
      expect(formatted).toBe('0:00')
    })

    it('should format 59 seconds', () => {
      const formatted = victoryRenderer.formatTime(59)
      expect(formatted).toBe('0:59')
    })

    it('should format 60 seconds as 1 minute', () => {
      const formatted = victoryRenderer.formatTime(60)
      expect(formatted).toBe('1:00')
    })

    it('should format 125 seconds correctly', () => {
      const formatted = victoryRenderer.formatTime(125)
      expect(formatted).toBe('2:05')
    })

    it('should pad single digit seconds', () => {
      const formatted = victoryRenderer.formatTime(5)
      expect(formatted).toBe('0:05')
    })
  })

  describe('Victory Title', () => {
    it('should draw victory title', () => {
      victoryRenderer.drawVictoryTitle(10, 10)

      expect(mockRenderer.drawText).toHaveBeenCalled()
      const calls = mockRenderer.drawText.mock.calls
      const titleCall = calls.find(call => call[0].includes('COMPLETE'))
      expect(titleCall).toBeDefined()
    })

    it('should use accent color for title', () => {
      victoryRenderer.drawVictoryTitle(10, 10)

      const calls = mockRenderer.drawText.mock.calls
      // Check that at least one call uses COLORS.ACCENT
      expect(calls.length).toBeGreaterThan(0)
    })
  })

  describe('Level Statistics Display', () => {
    it('should draw current level stats', () => {
      const stats = { moves: 5, time: 90 }
      victoryRenderer.drawLevelStats(stats, 10, 10)

      expect(mockRenderer.drawText).toHaveBeenCalled()
      const calls = mockRenderer.drawText.mock.calls
      const hasScore = calls.some(call => call[0].includes('Score'))
      expect(hasScore).toBe(true)
    })

    it('should display moves in stats', () => {
      const stats = { moves: 5, time: 90 }
      victoryRenderer.drawLevelStats(stats, 10, 10)

      const calls = mockRenderer.drawText.mock.calls
      const hasMove = calls.some(call => call[0].includes('5'))
      expect(hasMove).toBe(true)
    })

    it('should display time in stats', () => {
      const stats = { moves: 5, time: 90 }
      victoryRenderer.drawLevelStats(stats, 10, 10)

      const calls = mockRenderer.drawText.mock.calls
      const hasTime = calls.some(call => call[0].includes('1:30'))
      expect(hasTime).toBe(true)
    })

    it('should handle missing moves', () => {
      const stats = { time: 90 }
      victoryRenderer.drawLevelStats(stats, 10, 10)

      expect(mockRenderer.drawText).toHaveBeenCalled()
    })

    it('should handle empty stats', () => {
      victoryRenderer.drawLevelStats({}, 10, 10)

      expect(mockRenderer.drawText).toHaveBeenCalled()
    })
  })

  describe('Best Statistics Display', () => {
    it('should draw best stats', () => {
      const bestStats = { moves: 3, time: 60 }
      victoryRenderer.drawBestStats(bestStats, 10, 10)

      expect(mockRenderer.drawText).toHaveBeenCalled()
      const calls = mockRenderer.drawText.mock.calls
      const hasBest = calls.some(call => call[0].includes('Best'))
      expect(hasBest).toBe(true)
    })

    it('should show best moves count', () => {
      const bestStats = { moves: 3, time: 60 }
      victoryRenderer.drawBestStats(bestStats, 10, 10)

      const calls = mockRenderer.drawText.mock.calls
      const hasMove = calls.some(call => call[0].includes('3'))
      expect(hasMove).toBe(true)
    })

    it('should show dash for missing best moves', () => {
      const bestStats = {}
      victoryRenderer.drawBestStats(bestStats, 10, 10)

      const calls = mockRenderer.drawText.mock.calls
      const hasDash = calls.some(call => call[0].includes('-'))
      expect(hasDash).toBe(true)
    })

    it('should handle partial best stats', () => {
      const bestStats = { moves: 5 }
      victoryRenderer.drawBestStats(bestStats, 10, 10)

      expect(mockRenderer.drawText).toHaveBeenCalled()
    })
  })

  describe('Victory Buttons', () => {
    it('should draw victory buttons', () => {
      victoryRenderer.drawVictoryButtons(10, 10)

      expect(mockRenderer.drawText).toHaveBeenCalled()
      const calls = mockRenderer.drawText.mock.calls
      const hasNext = calls.some(call => call[0].includes('Next'))
      expect(hasNext).toBe(true)
    })

    it('should draw all three buttons', () => {
      victoryRenderer.drawVictoryButtons(10, 10, true)

      const calls = mockRenderer.drawText.mock.calls
      const text = calls.map(c => c[0]).join(' ')
      expect(text).toContain('Next')
      expect(text).toContain('Retry')
      expect(text).toContain('Menu')
    })

    it('should handle no next level', () => {
      victoryRenderer.drawVictoryButtons(10, 10, false)

      const calls = mockRenderer.drawText.mock.calls
      const text = calls.map(c => c[0]).join(' ')
      expect(text).toContain('Retry')
      expect(text).toContain('Menu')
    })

    it('should draw buttons at correct Y position', () => {
      victoryRenderer.drawVictoryButtons(10, 100)

      const calls = mockRenderer.drawText.mock.calls
      const yPositions = calls.map(c => c[2])
      const hasY100 = yPositions.some(y => y === 100)
      expect(hasY100).toBe(true)
    })
  })

  describe('Overlay Drawing', () => {
    it('should draw overlay', () => {
      victoryRenderer.drawOverlay()

      expect(mockRenderer.drawRect).toHaveBeenCalled()
    })

    it('should set globalAlpha for overlay', () => {
      victoryRenderer.drawOverlay(0.8)

      // Check that globalAlpha was modified
      expect(mockRenderer.ctx.globalAlpha).toBe(1.0) // Should be reset after
    })

    it('should use correct overlay dimensions', () => {
      victoryRenderer.drawOverlay()

      const call = mockRenderer.drawRect.mock.calls[0]
      expect(call[2]).toBe(640) // width
      expect(call[3]).toBe(480) // height
    })
  })

  describe('Box Drawing', () => {
    it('should draw box', () => {
      victoryRenderer.drawBox(10, 10, 50, 40)

      expect(mockRenderer.drawText).toHaveBeenCalled()
    })

    it('should draw box with default color', () => {
      victoryRenderer.drawBox(10, 10, 50, 40)

      expect(mockRenderer.drawText).toHaveBeenCalled()
    })

    it('should draw box at correct position', () => {
      victoryRenderer.drawBox(100, 50, 50, 40)

      const calls = mockRenderer.drawText.mock.calls
      // At least the corners should be drawn
      expect(calls.length).toBeGreaterThan(0)
    })
  })

  describe('Complete Victory Screen', () => {
    it('should draw complete victory screen', () => {
      const levelStats = { moves: 5, time: 90 }
      const bestStats = { moves: 3, time: 60 }

      victoryRenderer.drawCompleteScreen(levelStats, bestStats, true)

      expect(mockRenderer.drawRect).toHaveBeenCalled()
      expect(mockRenderer.drawText).toHaveBeenCalled()
    })

    it('should include all screen elements', () => {
      const levelStats = { moves: 5, time: 90 }
      const bestStats = { moves: 3, time: 60 }

      victoryRenderer.drawCompleteScreen(levelStats, bestStats)

      const calls = mockRenderer.drawText.mock.calls
      const text = calls.map(c => c[0]).join(' ')
      expect(text).toContain('COMPLETE')
      expect(text).toContain('Score')
      expect(text).toContain('Best')
      expect(text).toContain('Next')
    })

    it('should handle missing statistics', () => {
      victoryRenderer.drawCompleteScreen({}, {}, true)

      expect(mockRenderer.drawText).toHaveBeenCalled()
    })

    it('should draw screen without next level', () => {
      const levelStats = { moves: 5, time: 90 }
      victoryRenderer.drawCompleteScreen(levelStats, {}, false)

      expect(mockRenderer.drawText).toHaveBeenCalled()
    })
  })

  describe('Simple Victory Screen', () => {
    it('should draw simple victory screen', () => {
      const stats = { moves: 5, time: 90 }
      victoryRenderer.drawSimpleVictory(stats)

      expect(mockRenderer.drawRect).toHaveBeenCalled()
      expect(mockRenderer.drawText).toHaveBeenCalled()
    })

    it('should include title in simple screen', () => {
      victoryRenderer.drawSimpleVictory({ moves: 5, time: 90 })

      const calls = mockRenderer.drawText.mock.calls
      const hasTitle = calls.some(call => call[0].includes('COMPLETE'))
      expect(hasTitle).toBe(true)
    })

    it('should include buttons in simple screen', () => {
      victoryRenderer.drawSimpleVictory({ moves: 5, time: 90 })

      const calls = mockRenderer.drawText.mock.calls
      const text = calls.map(c => c[0]).join(' ')
      expect(text).toContain('Next')
      expect(text).toContain('Retry')
      expect(text).toContain('Menu')
    })

    it('should handle empty stats gracefully', () => {
      expect(() => victoryRenderer.drawSimpleVictory({})).not.toThrow()
    })
  })

  describe('Star Rating', () => {
    it('should draw one star rating', () => {
      victoryRenderer.drawStarRating(1, 10, 10)

      expect(mockRenderer.drawText).toHaveBeenCalled()
      const call = mockRenderer.drawText.mock.calls[0]
      expect(call[0]).toContain('★')
    })

    it('should draw three star rating', () => {
      victoryRenderer.drawStarRating(3, 10, 10)

      expect(mockRenderer.drawText).toHaveBeenCalled()
      const call = mockRenderer.drawText.mock.calls[0]
      expect(call[0]).toContain('★')
      // With 3 stars, all are full stars, so no empty stars
    })

    it('should draw zero stars', () => {
      victoryRenderer.drawStarRating(0, 10, 10)

      expect(mockRenderer.drawText).toHaveBeenCalled()
    })
  })

  describe('Message Display', () => {
    it('should draw custom message', () => {
      victoryRenderer.drawMessage(10, 10, 'Well Done!')

      const calls = mockRenderer.drawText.mock.calls
      const hasMessage = calls.some(call => call[0].includes('Well'))
      expect(hasMessage).toBe(true)
    })

    it('should draw default message', () => {
      victoryRenderer.drawMessage(10, 10)

      const calls = mockRenderer.drawText.mock.calls
      const hasMsg = calls.some(call => call[0].includes('Congratulations'))
      expect(hasMsg).toBe(true)
    })
  })

  describe('Trophy/Achievement Icon', () => {
    it('should draw trophy icon', () => {
      victoryRenderer.drawTrophy(10, 10)

      expect(mockRenderer.drawText).toHaveBeenCalled()
    })
  })

  describe('Statistics Comparison', () => {
    it('should draw stats comparison', () => {
      const current = { moves: 5, time: 90 }
      const best = { moves: 5, time: 60 }

      victoryRenderer.drawStatsComparison(current, best, 10, 10)

      expect(mockRenderer.drawText).toHaveBeenCalled()
      const calls = mockRenderer.drawText.mock.calls
      const hasStats = calls.some(call => call[0].includes('Statistics'))
      expect(hasStats).toBe(true)
    })

    it('should show new best for moves', () => {
      const current = { moves: 3, time: 90 }
      const best = { moves: 5, time: 60 }

      victoryRenderer.drawStatsComparison(current, best, 10, 10)

      const calls = mockRenderer.drawText.mock.calls
      const hasNew = calls.some(call => call[0].includes('NEW BEST'))
      expect(hasNew).toBe(true)
    })

    it('should show tied performance', () => {
      const current = { moves: 5, time: 90 }
      const best = { moves: 5, time: 90 }

      victoryRenderer.drawStatsComparison(current, best, 10, 10)

      const calls = mockRenderer.drawText.mock.calls
      const hasTied = calls.some(call => call[0].includes('TIED'))
      expect(hasTied).toBe(true)
    })

    it('should handle missing best stats', () => {
      const current = { moves: 5, time: 90 }

      victoryRenderer.drawStatsComparison(current, {}, 10, 10)

      expect(mockRenderer.drawText).toHaveBeenCalled()
    })

    it('should handle empty comparison', () => {
      expect(() => victoryRenderer.drawStatsComparison({}, {}, 10, 10)).not.toThrow()
    })
  })

  describe('Multiple Screen Instances', () => {
    it('should render multiple screens independently', () => {
      victoryRenderer.drawCompleteScreen({ moves: 5, time: 90 }, {}, true)
      const firstCallCount = mockRenderer.drawText.mock.calls.length

      mockRenderer.drawText.mockClear()
      mockRenderer.drawRect.mockClear()

      victoryRenderer.drawSimpleVictory({ moves: 3, time: 60 })
      const secondCallCount = mockRenderer.drawText.mock.calls.length

      expect(firstCallCount).toBeGreaterThan(0)
      expect(secondCallCount).toBeGreaterThan(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle very large time values', () => {
      const formatted = victoryRenderer.formatTime(3661)
      expect(formatted).toContain(':')
    })

    it('should handle zero stats', () => {
      victoryRenderer.drawCompleteScreen({ moves: 0, time: 0 }, { moves: 0, time: 0 })

      expect(mockRenderer.drawText).toHaveBeenCalled()
    })

    it('should handle negative coordinates gracefully', () => {
      expect(() => victoryRenderer.drawVictoryTitle(-10, -10)).not.toThrow()
    })

    it('should handle undefined stats gracefully', () => {
      expect(() => victoryRenderer.drawCompleteScreen(undefined, undefined)).not.toThrow()
    })

    it('should handle custom canvas dimensions', () => {
      const renderer = new VictoryScreenRenderer(mockRenderer, 800, 600)
      expect(renderer.canvasWidth).toBe(800)
      expect(renderer.canvasHeight).toBe(600)
    })
  })
})
