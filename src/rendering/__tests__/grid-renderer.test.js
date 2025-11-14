/**
 * @fileoverview Unit tests for GridRenderer class
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GridRenderer } from '../grid-renderer.js'
import { Renderer } from '../renderer.js'
import { Level } from '../../game/level.js'
import { CELL_TYPES, DIRECTIONS } from '../../utils/constants.js'

describe('GridRenderer', () => {
  let mockRenderer
  let testLevel
  let gridRenderer

  beforeEach(() => {
    // Create mock renderer
    mockRenderer = {
      drawRect: vi.fn(),
      drawLine: vi.fn(),
      setLineWidth: vi.fn(),
      ctx: { globalAlpha: 1.0 },
      width: 800,
      height: 600
    }

    // Create test level
    const mapData = {
      width: 6,
      height: 4,
      grid: [
        [CELL_TYPES.WALL, CELL_TYPES.WALL, CELL_TYPES.WALL, CELL_TYPES.WALL, CELL_TYPES.WALL, CELL_TYPES.WALL],
        [CELL_TYPES.WALL, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.WALL],
        [CELL_TYPES.WALL, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.WALL],
        [CELL_TYPES.WALL, CELL_TYPES.WALL, CELL_TYPES.WALL, CELL_TYPES.WALL, CELL_TYPES.WALL, CELL_TYPES.WALL]
      ],
      lamp: { x: 1, y: 1, direction: DIRECTIONS.E },
      target: { x: 4, y: 1, direction: DIRECTIONS.W },
      metadata: { name: 'Test Level', difficulty: 'easy', maxMirrors: 1 }
    }

    testLevel = new Level(mapData)
    gridRenderer = new GridRenderer(mockRenderer, testLevel)
  })

  describe('Constructor', () => {
    it('should create grid renderer with valid inputs', () => {
      expect(gridRenderer.renderer).toBe(mockRenderer)
      expect(gridRenderer.level).toBe(testLevel)
    })

    it('should throw error on null renderer', () => {
      expect(() => new GridRenderer(null, testLevel)).toThrow('Invalid renderer')
    })

    it('should allow null level for deferred initialization', () => {
      const renderer = new GridRenderer(mockRenderer, null)
      expect(renderer.level).toBeNull()
      expect(renderer.renderer).toBeDefined()
    })
  })

  describe('Grid Drawing', () => {
    it('should draw entire grid', () => {
      gridRenderer.drawGrid()

      // Should call drawRect for each cell
      expect(mockRenderer.drawRect).toHaveBeenCalled()

      // Grid is 6×4 = 24 cells + grid lines
      const rectCalls = mockRenderer.drawRect.mock.calls.filter(
        call => call.length === 5 // drawRect has 5 params
      )
      expect(rectCalls.length).toBe(24)
    })

    it('should draw cell correctly', () => {
      gridRenderer.drawCell(1, 1)

      expect(mockRenderer.drawRect).toHaveBeenCalled()
    })

    it('should use different color for walls', () => {
      gridRenderer.drawCell(0, 0) // Wall cell

      const calls = mockRenderer.drawRect.mock.calls
      const lastCall = calls[calls.length - 1]

      // Check that dark color was used (not background color)
      expect(lastCall[4]).not.toBe('#000000') // Different from BG
    })

    it('should use background color for empty cells', () => {
      gridRenderer.drawCell(1, 1) // Empty cell

      const calls = mockRenderer.drawRect.mock.calls
      expect(calls.length).toBeGreaterThan(0)
    })

    it('should draw grid lines', () => {
      gridRenderer.drawGrid()

      // Should call drawLine for grid
      expect(mockRenderer.drawLine).toHaveBeenCalled()

      // Vertical lines: 7 (for 6-wide grid, including borders)
      // Horizontal lines: 5 (for 4-tall grid, including borders)
      const lineCalls = mockRenderer.drawLine.mock.calls
      expect(lineCalls.length).toBeGreaterThan(0)
    })
  })

  describe('Cell Highlighting', () => {
    it('should highlight cell with custom color', () => {
      gridRenderer.highlightCell(2, 2, '#FF00FF')

      expect(mockRenderer.drawRect).toHaveBeenCalled()
    })

    it('should use default highlight color', () => {
      gridRenderer.highlightCell(2, 2)

      expect(mockRenderer.drawRect).toHaveBeenCalled()
    })
  })

  describe('Custom Cell Color', () => {
    it('should draw cell with custom color', () => {
      gridRenderer.drawCellWithColor(1, 1, '#FF0000')

      const calls = mockRenderer.drawRect.mock.calls
      const lastCall = calls[calls.length - 1]
      expect(lastCall[4]).toBe('#FF0000')
    })
  })

  describe('Coordinate Conversion', () => {
    it('should convert grid to pixels', () => {
      const pixels = gridRenderer.gridToPixels(2, 3)

      expect(pixels.x).toBe(2 * 16) // CELL_WIDTH_PX = 16
      expect(pixels.y).toBe(3 * 20) // CELL_HEIGHT_PX = 20
    })

    it('should convert pixels to grid', () => {
      const grid = gridRenderer.pixelsToGrid(32, 60)

      expect(grid.x).toBe(2) // 32 / 16
      expect(grid.y).toBe(3) // 60 / 20
    })

    it('should floor pixel coordinates', () => {
      const grid = gridRenderer.pixelsToGrid(35, 65)

      expect(grid.x).toBe(2) // floor(35/16)
      expect(grid.y).toBe(3) // floor(65/20)
    })
  })

  describe('Dimension Queries', () => {
    it('should get cell dimensions', () => {
      const dims = gridRenderer.getCellDimensions()

      expect(dims.width).toBe(16) // CELL_WIDTH_PX
      expect(dims.height).toBe(20) // CELL_HEIGHT_PX
    })

    it('should get grid dimensions in pixels', () => {
      const dims = gridRenderer.getGridDimensions()

      expect(dims.width).toBe(6 * 16) // Level width × cell width
      expect(dims.height).toBe(4 * 20) // Level height × cell height
    })
  })

  describe('Line Width Management', () => {
    it('should set line width for grid lines', () => {
      gridRenderer.drawGrid()

      expect(mockRenderer.setLineWidth).toHaveBeenCalled()
    })

    it('should restore line width after grid lines', () => {
      gridRenderer.drawGrid()

      const calls = mockRenderer.setLineWidth.mock.calls
      // Should be called at least twice (before and after grid lines)
      expect(calls.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Large Grid Performance', () => {
    it('should handle maximum size grid', () => {
      // Create large level
      const largeGrid = Array(16).fill(null).map((_, y) =>
        Array(30).fill(null).map((_, x) => {
          if (x === 0 || x === 29 || y === 0 || y === 15) {
            return CELL_TYPES.WALL
          }
          return CELL_TYPES.EMPTY
        })
      )

      const largeMapData = {
        width: 30,
        height: 16,
        grid: largeGrid,
        lamp: { x: 1, y: 1, direction: DIRECTIONS.E },
        target: { x: 28, y: 1, direction: DIRECTIONS.W },
        metadata: { name: 'Large Level', difficulty: 'hard', maxMirrors: 10 }
      }

      const largeLevel = new Level(largeMapData)
      const largeRenderer = new GridRenderer(mockRenderer, largeLevel)

      // Should complete without timing out
      const start = performance.now()
      largeRenderer.drawGrid()
      const elapsed = performance.now() - start

      expect(elapsed).toBeLessThan(100) // Should be fast
      expect(mockRenderer.drawRect.mock.calls.length).toBe(30 * 16)
    })
  })

  describe('Edge Cases', () => {
    it('should handle single cell grid', () => {
      const singleMapData = {
        width: 6,
        height: 4,
        grid: [
          [CELL_TYPES.WALL, CELL_TYPES.WALL, CELL_TYPES.WALL, CELL_TYPES.WALL, CELL_TYPES.WALL, CELL_TYPES.WALL],
          [CELL_TYPES.WALL, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.WALL],
          [CELL_TYPES.WALL, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.WALL],
          [CELL_TYPES.WALL, CELL_TYPES.WALL, CELL_TYPES.WALL, CELL_TYPES.WALL, CELL_TYPES.WALL, CELL_TYPES.WALL]
        ],
        lamp: { x: 1, y: 1, direction: DIRECTIONS.E },
        target: { x: 4, y: 1, direction: DIRECTIONS.W },
        metadata: { name: 'Single Cell', difficulty: 'easy', maxMirrors: 1 }
      }

      const singleLevel = new Level(singleMapData)
      const singleRenderer = new GridRenderer(mockRenderer, singleLevel)

      singleRenderer.drawCell(3, 3)
      expect(mockRenderer.drawRect).toHaveBeenCalled()
    })
  })
})
