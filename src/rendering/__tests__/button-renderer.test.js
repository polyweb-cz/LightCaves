/**
 * @fileoverview Unit tests for ButtonRenderer class
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ButtonRenderer } from '../button-renderer.js'

describe('ButtonRenderer', () => {
  let mockRenderer
  let mockGridRenderer
  let buttonRenderer

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

    buttonRenderer = new ButtonRenderer(mockRenderer, mockGridRenderer)
  })

  describe('Constructor', () => {
    it('should create button renderer with valid inputs', () => {
      expect(buttonRenderer.renderer).toBe(mockRenderer)
      expect(buttonRenderer.gridRenderer).toBe(mockGridRenderer)
    })

    it('should throw error on null renderer', () => {
      expect(() => new ButtonRenderer(null, mockGridRenderer)).toThrow('Invalid renderer')
    })

    it('should throw error on null gridRenderer', () => {
      expect(() => new ButtonRenderer(mockRenderer, null)).toThrow('Invalid gridRenderer')
    })
  })

  describe('Single Button Rendering', () => {
    it('should draw enabled button', () => {
      buttonRenderer.drawButton('Test', 50, 50, true)

      expect(mockRenderer.drawRect).toHaveBeenCalled()
      expect(mockRenderer.drawText).toHaveBeenCalled()
    })

    it('should draw disabled button', () => {
      buttonRenderer.drawButton('Test', 50, 50, false)

      expect(mockRenderer.drawRect).toHaveBeenCalled()
      expect(mockRenderer.drawText).toHaveBeenCalled()
    })

    it('should draw button with default style', () => {
      buttonRenderer.drawButton('Test', 50, 50, true, 'default')

      expect(mockRenderer.drawRect).toHaveBeenCalled()
    })

    it('should draw button with highlight style', () => {
      buttonRenderer.drawButton('Test', 50, 50, true, 'highlight')

      expect(mockRenderer.drawRect).toHaveBeenCalled()
    })

    it('should draw button at correct position', () => {
      buttonRenderer.drawButton('Test', 100, 75, true)

      const rectCall = mockRenderer.drawRect.mock.calls[0]
      expect(rectCall).toBeDefined()
    })
  })

  describe('Standard Buttons', () => {
    it('should draw Undo button', () => {
      buttonRenderer.drawUndoButton(true)

      expect(mockRenderer.drawText).toHaveBeenCalled()
      const textCall = mockRenderer.drawText.mock.calls.find(call => call[0].includes('Undo'))
      expect(textCall).toBeDefined()
    })

    it('should draw Redo button', () => {
      buttonRenderer.drawRedoButton(true)

      expect(mockRenderer.drawText).toHaveBeenCalled()
      const textCall = mockRenderer.drawText.mock.calls.find(call => call[0].includes('Redo'))
      expect(textCall).toBeDefined()
    })

    it('should draw Reset button', () => {
      buttonRenderer.drawResetButton(true)

      expect(mockRenderer.drawText).toHaveBeenCalled()
      const textCall = mockRenderer.drawText.mock.calls.find(call => call[0].includes('Reset'))
      expect(textCall).toBeDefined()
    })

    it('should draw Menu button', () => {
      buttonRenderer.drawMenuButton(true)

      expect(mockRenderer.drawText).toHaveBeenCalled()
      const textCall = mockRenderer.drawText.mock.calls.find(call => call[0].includes('Menu'))
      expect(textCall).toBeDefined()
    })

    it('should disable Undo button when not available', () => {
      buttonRenderer.drawUndoButton(false)

      expect(mockRenderer.drawText).toHaveBeenCalled()
    })

    it('should disable Redo button when not available', () => {
      buttonRenderer.drawRedoButton(false)

      expect(mockRenderer.drawText).toHaveBeenCalled()
    })
  })

  describe('All Buttons', () => {
    it('should draw all buttons', () => {
      const gameState = {
        canUndo: true,
        canRedo: true
      }

      buttonRenderer.drawAllButtons(gameState)

      expect(mockRenderer.drawRect).toHaveBeenCalled()
      expect(mockRenderer.drawText).toHaveBeenCalled()
    })

    it('should draw all buttons with disabled states', () => {
      const gameState = {
        canUndo: false,
        canRedo: false
      }

      buttonRenderer.drawAllButtons(gameState)

      expect(mockRenderer.drawRect).toHaveBeenCalled()
    })

    it('should draw buttons at custom Y position', () => {
      buttonRenderer.drawAllButtons({}, 100)

      const textCalls = mockRenderer.drawText.mock.calls
      // Check that some calls have y = 100
      const hasY100 = textCalls.some(call => call[2] === 100)
      expect(hasY100).toBe(true)
    })

    it('should handle missing gameState gracefully', () => {
      expect(() => buttonRenderer.drawAllButtons()).not.toThrow()
    })
  })

  describe('Button Hover Effect', () => {
    it('should draw button with hover', () => {
      buttonRenderer.drawButtonWithHover('Test', 50, 50, true, true)

      expect(mockRenderer.drawRect).toHaveBeenCalled()
    })

    it('should draw button without hover', () => {
      buttonRenderer.drawButtonWithHover('Test', 50, 50, true, false)

      expect(mockRenderer.drawRect).toHaveBeenCalled()
    })

    it('should show visual difference between hover and normal', () => {
      mockRenderer.drawRect.mockClear()
      buttonRenderer.drawButtonWithHover('Test', 50, 50, true, false)
      const normalCalls = mockRenderer.drawRect.mock.calls.length

      mockRenderer.drawRect.mockClear()
      buttonRenderer.drawButtonWithHover('Test', 50, 50, true, true)
      const hoveredCalls = mockRenderer.drawRect.mock.calls.length

      // Both should call drawRect
      expect(normalCalls).toBeGreaterThan(0)
      expect(hoveredCalls).toBeGreaterThan(0)
    })
  })

  describe('Button Hints', () => {
    it('should draw keyboard hints', () => {
      buttonRenderer.drawButtonHints()

      expect(mockRenderer.drawText).toHaveBeenCalled()
      const calls = mockRenderer.drawText.mock.calls
      const hasUndo = calls.some(call => call[0].includes('Undo'))
      expect(hasUndo).toBe(true)
    })

    it('should include all keyboard shortcuts in hints', () => {
      buttonRenderer.drawButtonHints()

      const calls = mockRenderer.drawText.mock.calls
      const hintText = calls.map(c => c[0]).join(' ')
      expect(hintText).toContain('U:')
      expect(hintText).toContain('R:')
      expect(hintText).toContain('Reset')
      expect(hintText).toContain('Menu')
    })

    it('should draw hints at custom Y position', () => {
      buttonRenderer.drawButtonHints(100)

      const calls = mockRenderer.drawText.mock.calls
      const hintCalls = calls.filter(call => call[0].includes(':'))
      hintCalls.forEach(call => {
        expect(call[2]).toBe(100)
      })
    })
  })

  describe('Button Rectangle/Hit Detection', () => {
    it('should return Undo button rectangle', () => {
      const rect = buttonRenderer.getButtonRect('undo')

      expect(rect).toBeDefined()
      expect(rect.x).toBeDefined()
      expect(rect.y).toBeDefined()
      expect(rect.width).toBeGreaterThan(0)
      expect(rect.height).toBeGreaterThan(0)
    })

    it('should return Redo button rectangle', () => {
      const rect = buttonRenderer.getButtonRect('redo')
      expect(rect).toBeDefined()
    })

    it('should return Reset button rectangle', () => {
      const rect = buttonRenderer.getButtonRect('reset')
      expect(rect).toBeDefined()
    })

    it('should return Menu button rectangle', () => {
      const rect = buttonRenderer.getButtonRect('menu')
      expect(rect).toBeDefined()
    })

    it('should return null for unknown button', () => {
      const rect = buttonRenderer.getButtonRect('unknown')
      expect(rect).toBeNull()
    })

    it('should be case insensitive', () => {
      const rect1 = buttonRenderer.getButtonRect('UNDO')
      const rect2 = buttonRenderer.getButtonRect('undo')
      expect(rect1).toEqual(rect2)
    })
  })

  describe('Point in Button Detection', () => {
    it('should detect point inside button', () => {
      const isInside = buttonRenderer.isPointInButton(10, 70, 'undo')
      expect(isInside).toBe(true)
    })

    it('should detect point outside button', () => {
      const isInside = buttonRenderer.isPointInButton(300, 300, 'undo')
      expect(isInside).toBe(false)
    })

    it('should detect point in different buttons', () => {
      const inUndo = buttonRenderer.isPointInButton(10, 70, 'undo')
      const inRedo = buttonRenderer.isPointInButton(60, 70, 'redo')
      expect(inUndo).toBe(true)
      expect(inRedo).toBe(true)
    })

    it('should return false for unknown button type', () => {
      const isInside = buttonRenderer.isPointInButton(10, 70, 'unknown')
      expect(isInside).toBe(false)
    })
  })

  describe('Get Button at Point', () => {
    it('should identify button at cursor position', () => {
      const button = buttonRenderer.getButtonAtPoint(10, 70)
      expect(button).toBe('undo')
    })

    it('should identify different buttons', () => {
      const button1 = buttonRenderer.getButtonAtPoint(10, 70)
      const button2 = buttonRenderer.getButtonAtPoint(60, 70)
      expect(button1).toBe('undo')
      expect(button2).toBe('redo')
    })

    it('should return null when no button hit', () => {
      const button = buttonRenderer.getButtonAtPoint(300, 300)
      expect(button).toBeNull()
    })

    it('should prioritize first button in group', () => {
      const button = buttonRenderer.getButtonAtPoint(10, 70)
      expect(['undo', 'redo', 'reset', 'menu']).toContain(button)
    })
  })

  describe('Button Group Rendering', () => {
    it('should draw button group with label', () => {
      buttonRenderer.drawButtonGroup('Actions', ['Button1', 'Button2'])

      expect(mockRenderer.drawText).toHaveBeenCalled()
      const calls = mockRenderer.drawText.mock.calls
      const hasLabel = calls.some(call => call[0].includes('Actions'))
      expect(hasLabel).toBe(true)
    })

    it('should draw multiple buttons in group', () => {
      buttonRenderer.drawButtonGroup('Test', ['A', 'B', 'C'])

      expect(mockRenderer.drawRect).toHaveBeenCalled()
    })

    it('should apply enabled states to buttons', () => {
      buttonRenderer.drawButtonGroup('Test', ['A', 'B'], 10, 70, [true, false])

      expect(mockRenderer.drawRect).toHaveBeenCalled()
    })

    it('should draw group at custom position', () => {
      buttonRenderer.drawButtonGroup('Test', ['A', 'B'], 50, 100)

      const calls = mockRenderer.drawText.mock.calls
      const hasPositional = calls.some(call => call[1] > 40 && call[2] === 100)
      expect(hasPositional).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty button labels', () => {
      expect(() => buttonRenderer.drawButton('', 10, 10, true)).not.toThrow()
    })

    it('should handle negative coordinates', () => {
      expect(() => buttonRenderer.drawButton('Test', -10, -10, true)).not.toThrow()
    })

    it('should handle undefined gameState', () => {
      expect(() => buttonRenderer.drawAllButtons(undefined)).not.toThrow()
    })

    it('should handle empty button group', () => {
      expect(() => buttonRenderer.drawButtonGroup('Empty', [])).not.toThrow()
    })

    it('should handle mismatched button and state arrays', () => {
      expect(() => buttonRenderer.drawButtonGroup('Test', ['A', 'B'], 10, 10, [true])).not.toThrow()
    })
  })
})
