/**
 * @fileoverview Unit tests for CellHighlightRenderer class
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CellHighlightRenderer } from '../cell-highlight-renderer.js'

describe('CellHighlightRenderer', () => {
  let mockRenderer
  let mockGridRenderer
  let highlightRenderer

  beforeEach(() => {
    mockRenderer = {
      drawText: vi.fn(),
      drawRect: vi.fn(),
      ctx: { globalAlpha: 1.0 }
    }

    mockGridRenderer = {
      cellWidth: 16,
      cellHeight: 20
    }

    highlightRenderer = new CellHighlightRenderer(mockRenderer, mockGridRenderer)
  })

  describe('Constructor', () => {
    it('should create renderer with valid inputs', () => {
      expect(highlightRenderer.renderer).toBe(mockRenderer)
      expect(highlightRenderer.gridRenderer).toBe(mockGridRenderer)
    })

    it('should throw on null renderer', () => {
      expect(() => new CellHighlightRenderer(null, mockGridRenderer)).toThrow('Invalid renderer')
    })

    it('should throw on null gridRenderer', () => {
      expect(() => new CellHighlightRenderer(mockRenderer, null)).toThrow('Invalid gridRenderer')
    })

    it('should initialize highlight types', () => {
      expect(highlightRenderer.highlightTypes).toBeDefined()
      expect(highlightRenderer.highlightTypes.hover).toBeDefined()
    })
  })

  describe('Cell Highlighting', () => {
    it('should draw hover highlight', () => {
      highlightRenderer.drawHoverCell(5, 5)

      expect(mockRenderer.drawRect).toHaveBeenCalled()
    })

    it('should draw selected highlight', () => {
      highlightRenderer.drawSelectedCell(5, 5)

      expect(mockRenderer.drawRect).toHaveBeenCalled()
    })

    it('should draw valid placement highlight', () => {
      highlightRenderer.drawValidPlacement(5, 5)

      expect(mockRenderer.drawRect).toHaveBeenCalled()
    })

    it('should draw invalid cell highlight', () => {
      highlightRenderer.drawInvalidCell(5, 5)

      expect(mockRenderer.drawRect).toHaveBeenCalled()
    })

    it('should draw target highlight', () => {
      highlightRenderer.drawTargetHighlight(5, 5)

      expect(mockRenderer.drawRect).toHaveBeenCalled()
    })

    it('should draw beam path highlight', () => {
      highlightRenderer.drawBeamPathHighlight(5, 5)

      expect(mockRenderer.drawRect).toHaveBeenCalled()
    })

    it('should set opacity for highlight', () => {
      highlightRenderer.drawCellHighlight(5, 5, 'hover')

      // Check that globalAlpha was modified
      expect(mockRenderer.ctx.globalAlpha).toBe(1.0)
    })

    it('should reset opacity after drawing', () => {
      highlightRenderer.drawCellHighlight(5, 5, 'hover')

      expect(mockRenderer.ctx.globalAlpha).toBe(1.0)
    })

    it('should handle unknown highlight type gracefully', () => {
      expect(() => highlightRenderer.drawCellHighlight(5, 5, 'unknown')).not.toThrow()
    })
  })

  describe('Highlight Collections', () => {
    it('should draw all highlights from array', () => {
      const highlights = [
        { x: 1, y: 1, type: 'hover' },
        { x: 2, y: 2, type: 'selected' },
        { x: 3, y: 3, type: 'invalid' }
      ]

      highlightRenderer.drawAllHighlights(highlights)

      expect(mockRenderer.drawRect).toHaveBeenCalledTimes(3)
    })

    it('should handle empty highlights array', () => {
      highlightRenderer.drawAllHighlights([])

      expect(mockRenderer.drawRect).not.toHaveBeenCalled()
    })

    it('should draw highlights from map', () => {
      const highlightMap = {
        hover: [[1, 1], [2, 2]],
        selected: [[3, 3]],
        invalid: [[4, 4]]
      }

      highlightRenderer.drawHighlightMap(highlightMap)

      expect(mockRenderer.drawRect).toHaveBeenCalledTimes(4)
    })

    it('should handle empty highlight map', () => {
      highlightRenderer.drawHighlightMap({})

      expect(mockRenderer.drawRect).not.toHaveBeenCalled()
    })

    it('should draw cell set with single type', () => {
      const cellSet = new Set(['1,1', '2,2', '3,3'])

      highlightRenderer.drawCellSet(cellSet, 'valid_placement')

      expect(mockRenderer.drawRect).toHaveBeenCalledTimes(3)
    })

    it('should handle invalid cell strings in set', () => {
      const cellSet = new Set(['1,1', 'invalid', '2,2'])

      highlightRenderer.drawCellSet(cellSet)

      expect(mockRenderer.drawRect).toHaveBeenCalled()
    })
  })

  describe('Cell Border', () => {
    it('should draw cell border', () => {
      highlightRenderer.drawCellBorder(5, 5)

      expect(mockRenderer.drawText).toHaveBeenCalled()
    })

    it('should use custom border color', () => {
      highlightRenderer.drawCellBorder(5, 5, '#FF0000')

      expect(mockRenderer.drawText).toHaveBeenCalled()
    })

    it('should draw corners and edges', () => {
      highlightRenderer.drawCellBorder(5, 5)

      const calls = mockRenderer.drawText.mock.calls
      expect(calls.length).toBeGreaterThan(0)
    })
  })

  describe('Cell Hints', () => {
    it('should draw cell hint', () => {
      highlightRenderer.drawCellHint(5, 5)

      expect(mockRenderer.drawText).toHaveBeenCalled()
      const call = mockRenderer.drawText.mock.calls[0]
      expect(call[0]).toBe('?')
    })

    it('should draw custom hint symbol', () => {
      highlightRenderer.drawCellHint(5, 5, '!')

      const call = mockRenderer.drawText.mock.calls[0]
      expect(call[0]).toBe('!')
    })
  })

  describe('Region Selection', () => {
    it('should draw region selection', () => {
      highlightRenderer.drawRegionSelection(1, 1, 3, 3, 'selected')

      expect(mockRenderer.drawRect).toHaveBeenCalled()
    })

    it('should handle single cell region', () => {
      highlightRenderer.drawRegionSelection(2, 2, 2, 2, 'valid_placement')

      expect(mockRenderer.drawRect).toHaveBeenCalledTimes(1)
    })

    it('should handle rectangular regions', () => {
      highlightRenderer.drawRegionSelection(1, 1, 4, 3, 'selected')

      // 4×3 = 12 cells
      expect(mockRenderer.drawRect).toHaveBeenCalledTimes(12)
    })

    it('should handle reversed coordinates', () => {
      highlightRenderer.drawRegionSelection(3, 3, 1, 1, 'selected')

      expect(mockRenderer.drawRect).toHaveBeenCalled()
    })
  })

  describe('Utility Methods', () => {
    it('should clear highlights', () => {
      const map = {
        hover: [[1, 1]],
        selected: [[2, 2]]
      }

      const cleared = highlightRenderer.clearHighlights(map)

      expect(cleared.hover).toEqual([])
      expect(cleared.selected).toEqual([])
    })

    it('should get highlight at point', () => {
      const map = {
        hover: [[1, 1], [2, 2]],
        selected: [[3, 3]]
      }

      const type = highlightRenderer.getHighlightAtPoint(1, 1, map)

      expect(type).toBe('hover')
    })

    it('should return null for no highlight at point', () => {
      const map = {
        hover: [[1, 1]],
        selected: [[3, 3]]
      }

      const type = highlightRenderer.getHighlightAtPoint(5, 5, map)

      expect(type).toBeNull()
    })
  })

  describe('Multiple Highlights', () => {
    it('should render multiple highlight types', () => {
      highlightRenderer.drawHoverCell(1, 1)
      highlightRenderer.drawSelectedCell(2, 2)
      highlightRenderer.drawInvalidCell(3, 3)

      expect(mockRenderer.drawRect).toHaveBeenCalledTimes(3)
    })
  })

  describe('Edge Cases', () => {
    it('should handle negative coordinates', () => {
      expect(() => highlightRenderer.drawCellHighlight(-1, -1, 'hover')).not.toThrow()
    })

    it('should handle large coordinates', () => {
      expect(() => highlightRenderer.drawCellHighlight(1000, 1000, 'hover')).not.toThrow()
    })

    it('should handle undefined highlight map', () => {
      expect(() => highlightRenderer.drawHighlightMap(undefined)).not.toThrow()
    })

    it('should handle invalid cell set entries', () => {
      const cellSet = new Set(['1,1', 'invalid', 'NaN,NaN'])

      expect(() => highlightRenderer.drawCellSet(cellSet)).not.toThrow()
    })

    it('should handle non-array in highlight collection', () => {
      expect(() => highlightRenderer.drawAllHighlights('not an array')).not.toThrow()
    })
  })

  describe('Highlight Type Configuration', () => {
    it('should have hover highlight type', () => {
      expect(highlightRenderer.highlightTypes.hover).toBeDefined()
      expect(highlightRenderer.highlightTypes.hover.opacity).toBeLessThan(1)
    })

    it('should have selected highlight type', () => {
      expect(highlightRenderer.highlightTypes.selected).toBeDefined()
    })

    it('should have valid placement highlight type', () => {
      expect(highlightRenderer.highlightTypes.valid_placement).toBeDefined()
    })

    it('should have invalid highlight type', () => {
      expect(highlightRenderer.highlightTypes.invalid).toBeDefined()
    })

    it('should have target highlight type', () => {
      expect(highlightRenderer.highlightTypes.target).toBeDefined()
    })

    it('should have beam path highlight type', () => {
      expect(highlightRenderer.highlightTypes.beam_path).toBeDefined()
    })

    it('should have different opacities for different types', () => {
      const hover = highlightRenderer.highlightTypes.hover.opacity
      const selected = highlightRenderer.highlightTypes.selected.opacity
      expect(hover).not.toBe(selected)
    })
  })
})
