/**
 * @fileoverview Unit tests for PaletteRenderer class
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PaletteRenderer } from '../palette-renderer.js'

describe('PaletteRenderer', () => {
  let mockRenderer
  let mockGridRenderer
  let paletteRenderer

  beforeEach(() => {
    // Mock renderer
    mockRenderer = {
      drawText: vi.fn(),
      drawRect: vi.fn(),
      ctx: { globalAlpha: 1.0 }
    }

    // Mock grid renderer
    mockGridRenderer = {
      cellWidth: 16,
      cellHeight: 20
    }

    paletteRenderer = new PaletteRenderer(mockRenderer, mockGridRenderer)
  })

  describe('Constructor', () => {
    it('should create palette renderer with valid inputs', () => {
      expect(paletteRenderer.renderer).toBe(mockRenderer)
      expect(paletteRenderer.gridRenderer).toBe(mockGridRenderer)
    })

    it('should throw error on null renderer', () => {
      expect(() => new PaletteRenderer(null, mockGridRenderer)).toThrow('Invalid renderer')
    })

    it('should throw error on null gridRenderer', () => {
      expect(() => new PaletteRenderer(mockRenderer, null)).toThrow('Invalid gridRenderer')
    })
  })

  describe('Mirror Option Rendering', () => {
    it('should draw slash mirror option', () => {
      paletteRenderer.drawMirrorOption('/', 10, 50)

      expect(mockRenderer.drawText).toHaveBeenCalled()
      const call = mockRenderer.drawText.mock.calls[0]
      expect(call[0]).toContain('/')
    })

    it('should draw backslash mirror option', () => {
      paletteRenderer.drawMirrorOption('\\', 10, 50)

      expect(mockRenderer.drawText).toHaveBeenCalled()
      const call = mockRenderer.drawText.mock.calls[0]
      expect(call[0]).toContain('\\')
    })

    it('should highlight selected mirror', () => {
      paletteRenderer.drawMirrorOption('/', 10, 50, true)

      expect(mockRenderer.drawRect).toHaveBeenCalled()
      expect(mockRenderer.drawText).toHaveBeenCalled()
    })

    it('should not highlight unselected mirror', () => {
      paletteRenderer.drawMirrorOption('/', 10, 50, false)

      expect(mockRenderer.drawRect).not.toHaveBeenCalled()
    })

    it('should draw mirror count when provided', () => {
      paletteRenderer.drawMirrorOption('/', 10, 50, false, 5)

      const calls = mockRenderer.drawText.mock.calls
      expect(calls.length).toBeGreaterThanOrEqual(2)
      const countCall = calls.find(call => call[0].includes('x5'))
      expect(countCall).toBeDefined()
    })

    it('should not draw count when zero', () => {
      mockRenderer.drawText.mockClear()

      paletteRenderer.drawMirrorOption('/', 10, 50, false, 0)

      const calls = mockRenderer.drawText.mock.calls
      const countCall = calls.find(call => call[0].includes('x'))
      expect(countCall).toBeUndefined()
    })

    it('should not draw count when null', () => {
      mockRenderer.drawText.mockClear()

      paletteRenderer.drawMirrorOption('/', 10, 50, false, null)

      const calls = mockRenderer.drawText.mock.calls
      const countCall = calls.find(call => call[0].includes('x'))
      expect(countCall).toBeUndefined()
    })
  })

  describe('Complete Palette Rendering', () => {
    it('should draw complete palette', () => {
      paletteRenderer.drawPalette('/', {})

      expect(mockRenderer.drawText).toHaveBeenCalled()
      const calls = mockRenderer.drawText.mock.calls
      expect(calls.length).toBeGreaterThanOrEqual(2) // At least 2 mirrors
    })

    it('should draw palette with slash selected', () => {
      paletteRenderer.drawPalette('/', {})

      expect(mockRenderer.drawRect).toHaveBeenCalled()
    })

    it('should draw palette with backslash selected', () => {
      paletteRenderer.drawPalette('\\', {})

      expect(mockRenderer.drawRect).toHaveBeenCalled()
    })

    it('should draw palette with mirror counts', () => {
      const counts = { '/': 5, '\\': 3 }
      paletteRenderer.drawPalette('/', counts)

      const calls = mockRenderer.drawText.mock.calls
      const call5 = calls.find(call => call[0].includes('x5'))
      const call3 = calls.find(call => call[0].includes('x3'))
      expect(call5).toBeDefined()
      expect(call3).toBeDefined()
    })

    it('should draw palette at custom coordinates', () => {
      paletteRenderer.drawPalette('/', {}, 50, 100)

      const calls = mockRenderer.drawText.mock.calls
      calls.forEach(call => {
        if (call[0] !== 'Mirrors:') {
          expect(call[1]).toBeGreaterThanOrEqual(50)
        }
      })
    })

    it('should include palette label', () => {
      paletteRenderer.drawPalette('/', {})

      const calls = mockRenderer.drawText.mock.calls
      const labelCall = calls.find(call => call[0].includes('Mirrors'))
      expect(labelCall).toBeDefined()
    })
  })

  describe('Palette with Hint', () => {
    it('should draw palette with keyboard hint', () => {
      paletteRenderer.drawPaletteWithHint('/', {})

      const calls = mockRenderer.drawText.mock.calls
      const hintCall = calls.find(call => call[0].includes('[1]'))
      expect(hintCall).toBeDefined()
    })

    it('should include hint about key selection', () => {
      paletteRenderer.drawPaletteWithHint('/', {})

      const calls = mockRenderer.drawText.mock.calls
      const hintCall = calls.find(call => call[0].includes('select'))
      expect(hintCall).toBeDefined()
    })
  })

  describe('Palette Status', () => {
    it('should draw palette status for slash selected', () => {
      const counts = { '/': 5, '\\': 3 }
      paletteRenderer.drawPaletteStatus('/', counts)

      const calls = mockRenderer.drawText.mock.calls
      const statusCall = calls.find(call => call[0].includes('Selected'))
      expect(statusCall).toBeDefined()
      expect(statusCall[0]).toContain('/')
    })

    it('should draw palette status for backslash selected', () => {
      const counts = { '/': 5, '\\': 3 }
      paletteRenderer.drawPaletteStatus('\\', counts)

      const calls = mockRenderer.drawText.mock.calls
      const statusCall = calls.find(call => call[0].includes('Selected'))
      expect(statusCall).toBeDefined()
      expect(statusCall[0]).toContain('\\')
    })

    it('should show available count in status', () => {
      const counts = { '/': 5, '\\': 3 }
      paletteRenderer.drawPaletteStatus('/', counts)

      const calls = mockRenderer.drawText.mock.calls
      const statusCall = calls.find(call => call[0].includes('available'))
      expect(statusCall[0]).toContain('5')
    })

    it('should handle missing counts gracefully', () => {
      paletteRenderer.drawPaletteStatus('/', {})

      const calls = mockRenderer.drawText.mock.calls
      const statusCall = calls.find(call => call[0].includes('Selected'))
      expect(statusCall).toBeDefined()
    })
  })

  describe('Disabled Mirror Rendering', () => {
    it('should draw disabled slash mirror', () => {
      paletteRenderer.drawDisabledMirror('/', 10, 50)

      expect(mockRenderer.drawText).toHaveBeenCalled()
      const calls = mockRenderer.drawText.mock.calls
      expect(calls.length).toBeGreaterThanOrEqual(2) // Mirror + × symbol
    })

    it('should draw disabled backslash mirror', () => {
      paletteRenderer.drawDisabledMirror('\\', 10, 50)

      expect(mockRenderer.drawText).toHaveBeenCalled()
      const calls = mockRenderer.drawText.mock.calls
      expect(calls.length).toBeGreaterThanOrEqual(2) // Mirror + × symbol
    })

    it('should draw × indicator for disabled mirror', () => {
      paletteRenderer.drawDisabledMirror('/', 10, 50)

      const calls = mockRenderer.drawText.mock.calls
      const xCall = calls.find(call => call[0] === '×')
      expect(xCall).toBeDefined()
    })
  })

  describe('Palette with Availability', () => {
    it('should draw available mirrors normally', () => {
      const counts = { '/': 5, '\\': 3 }
      paletteRenderer.drawPaletteWithAvailability('/', counts)

      expect(mockRenderer.drawText).toHaveBeenCalled()
      expect(mockRenderer.drawRect).toHaveBeenCalled()
    })

    it('should draw unavailable mirrors as disabled', () => {
      const counts = { '/': 0, '\\': 0 }
      paletteRenderer.drawPaletteWithAvailability('/', counts)

      const calls = mockRenderer.drawText.mock.calls
      const xCall = calls.find(call => call[0] === '×')
      expect(xCall).toBeDefined()
    })

    it('should draw partially available mirrors', () => {
      const counts = { '/': 5, '\\': 0 }
      paletteRenderer.drawPaletteWithAvailability('/', counts)

      const calls = mockRenderer.drawText.mock.calls
      const hasSlash = calls.some(call => call[0].includes('/'))
      const hasX = calls.some(call => call[0] === '×')
      expect(hasSlash).toBe(true)
      expect(hasX).toBe(true)
    })

    it('should include label in availability view', () => {
      paletteRenderer.drawPaletteWithAvailability('/', {})

      const calls = mockRenderer.drawText.mock.calls
      const labelCall = calls.find(call => call[0].includes('Mirrors'))
      expect(labelCall).toBeDefined()
    })
  })

  describe('Multiple Palette Instances', () => {
    it('should render multiple palettes independently', () => {
      paletteRenderer.drawPalette('/', { '/': 5, '\\': 3 })
      const firstCallCount = mockRenderer.drawText.mock.calls.length

      mockRenderer.drawText.mockClear()
      mockRenderer.drawRect.mockClear()

      paletteRenderer.drawPalette('\\', { '/': 1, '\\': 8 })
      const secondCallCount = mockRenderer.drawText.mock.calls.length

      expect(firstCallCount).toBeGreaterThan(0)
      expect(secondCallCount).toBeGreaterThan(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined mirror counts', () => {
      paletteRenderer.drawPalette('/', undefined)

      expect(mockRenderer.drawText).toHaveBeenCalled()
    })

    it('should handle empty mirror counts object', () => {
      paletteRenderer.drawPalette('/', {})

      expect(mockRenderer.drawText).toHaveBeenCalled()
    })

    it('should handle invalid mirror type gracefully', () => {
      expect(() => paletteRenderer.drawMirrorOption('invalid', 10, 50)).not.toThrow()
    })

    it('should handle negative coordinates', () => {
      expect(() => paletteRenderer.drawPalette('/', {}, -10, -50)).not.toThrow()
    })
  })
})
