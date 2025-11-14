/**
 * @fileoverview Unit tests for Renderer class
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Renderer } from '../renderer.js'

describe('Renderer', () => {
  let canvas
  let mockCtx
  let renderer

  beforeEach(() => {
    // Create mock canvas context
    mockCtx = {
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      font: '',
      textAlign: 'center',
      textBaseline: 'middle',
      fillRect: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      arc: vi.fn(),
      fillText: vi.fn(),
      save: vi.fn(),
      restore: vi.fn()
    }

    // Create a mock canvas element
    canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 600
    canvas.getContext = vi.fn(() => mockCtx)
    document.body.appendChild(canvas)

    renderer = new Renderer(canvas)
  })

  describe('Constructor', () => {
    it('should create renderer with valid canvas', () => {
      expect(renderer.canvas).toBe(canvas)
      expect(renderer.width).toBe(800)
      expect(renderer.height).toBe(600)
      expect(renderer.ctx).toBeDefined()
    })

    it('should throw error on null canvas', () => {
      expect(() => new Renderer(null)).toThrow('Invalid canvas element')
    })

    it('should throw error on invalid element', () => {
      const div = document.createElement('div')
      expect(() => new Renderer(div)).toThrow('Invalid canvas element')
    })

    it('should initialize context with default font', () => {
      expect(renderer.ctx.font).toContain('px')
      expect(renderer.ctx.textAlign).toBe('center')
    })
  })

  describe('Basic Drawing Operations', () => {
    it('should clear canvas', () => {
      const clearSpy = vi.spyOn(renderer.ctx, 'fillRect')
      renderer.clear('#000000')

      expect(clearSpy).toHaveBeenCalledWith(0, 0, 800, 600)
      clearSpy.mockRestore()
    })

    it('should draw rectangle', () => {
      const fillRectSpy = vi.spyOn(renderer.ctx, 'fillRect')
      renderer.drawRect(10, 20, 100, 50, '#FF0000')

      expect(fillRectSpy).toHaveBeenCalledWith(10, 20, 100, 50)
      fillRectSpy.mockRestore()
    })

    it('should draw line', () => {
      const moveToSpy = vi.spyOn(renderer.ctx, 'moveTo')
      const lineToSpy = vi.spyOn(renderer.ctx, 'lineTo')

      renderer.drawLine(0, 0, 100, 100, '#FFFFFF')

      expect(moveToSpy).toHaveBeenCalledWith(0, 0)
      expect(lineToSpy).toHaveBeenCalledWith(100, 100)
      moveToSpy.mockRestore()
      lineToSpy.mockRestore()
    })

    it('should draw text', () => {
      const fillTextSpy = vi.spyOn(renderer.ctx, 'fillText')
      renderer.drawText('Hello', 100, 100, '#FFFFFF')

      expect(fillTextSpy).toHaveBeenCalledWith('Hello', 100, 100)
      fillTextSpy.mockRestore()
    })

    it('should set line width', () => {
      renderer.setLineWidth(3)
      expect(renderer.lineWidth).toBe(3)
      expect(renderer.ctx.lineWidth).toBe(3)
    })
  })

  describe('Advanced Drawing', () => {
    it('should draw circle', () => {
      const arcSpy = vi.spyOn(renderer.ctx, 'arc')
      renderer.drawCircle(400, 300, 50, '#FF0000')

      expect(arcSpy).toHaveBeenCalled()
      arcSpy.mockRestore()
    })

    it('should draw circle outline', () => {
      const arcSpy = vi.spyOn(renderer.ctx, 'arc')
      renderer.drawCircleOutline(400, 300, 50, '#FF0000')

      expect(arcSpy).toHaveBeenCalled()
      arcSpy.mockRestore()
    })

    it('should draw polygon', () => {
      const moveToSpy = vi.spyOn(renderer.ctx, 'moveTo')
      const lineToSpy = vi.spyOn(renderer.ctx, 'lineTo')

      const points = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 50, y: 100 }
      ]

      renderer.drawPolygon(points, '#FF0000')

      expect(moveToSpy).toHaveBeenCalledWith(0, 0)
      expect(lineToSpy).toHaveBeenCalled()
      moveToSpy.mockRestore()
      lineToSpy.mockRestore()
    })

    it('should draw triangle', () => {
      const moveToSpy = vi.spyOn(renderer.ctx, 'moveTo')
      renderer.drawTriangle(0, 0, 100, 0, 50, 100, '#FF0000')

      expect(moveToSpy).toHaveBeenCalled()
      moveToSpy.mockRestore()
    })

    it('should ignore polygon with less than 3 points', () => {
      const moveToSpy = vi.spyOn(renderer.ctx, 'moveTo')
      renderer.drawPolygon([{ x: 0, y: 0 }], '#FF0000')

      expect(moveToSpy).not.toHaveBeenCalled()
      moveToSpy.mockRestore()
    })
  })

  describe('Coordinate Conversion', () => {
    it('should get canvas dimensions', () => {
      const dims = renderer.getDimensions()
      expect(dims.width).toBe(800)
      expect(dims.height).toBe(600)
    })

    it('should convert grid to pixels', () => {
      const pixels = renderer.gridToPixels(5, 10)

      expect(pixels.x).toBe(5 * 16) // CELL_WIDTH_PX = 16
      expect(pixels.y).toBe(10 * 20) // CELL_HEIGHT_PX = 20
    })

    it('should convert pixels to grid', () => {
      const grid = renderer.pixelsToGrid(80, 200)

      expect(grid.x).toBe(5) // 80 / 16 = 5
      expect(grid.y).toBe(10) // 200 / 20 = 10
    })

    it('should handle float pixel coordinates', () => {
      const grid = renderer.pixelsToGrid(85, 205)

      expect(grid.x).toBe(5) // floor(85/16) = 5
      expect(grid.y).toBe(10) // floor(205/20) = 10
    })
  })

  describe('Context State Management', () => {
    it('should save context state', () => {
      const saveSpy = vi.spyOn(renderer.ctx, 'save')
      renderer.save()

      expect(saveSpy).toHaveBeenCalled()
      saveSpy.mockRestore()
    })

    it('should restore context state', () => {
      const restoreSpy = vi.spyOn(renderer.ctx, 'restore')
      renderer.restore()

      expect(restoreSpy).toHaveBeenCalled()
      restoreSpy.mockRestore()
    })
  })

  describe('Text Alignment', () => {
    it('should draw text with different alignments', () => {
      const fillTextSpy = vi.spyOn(renderer.ctx, 'fillText')

      renderer.drawText('Left', 100, 100, '#FFF', 'left')
      expect(renderer.ctx.textAlign).toBe('left')

      renderer.drawText('Right', 200, 100, '#FFF', 'right')
      expect(renderer.ctx.textAlign).toBe('right')

      fillTextSpy.mockRestore()
    })
  })

  describe('Color Handling', () => {
    it('should accept hex colors', () => {
      renderer.drawRect(0, 0, 100, 100, '#FF0000')

      expect(renderer.ctx.fillStyle).toBe('#FF0000')
    })

    it('should accept CSS color names', () => {
      renderer.drawRect(0, 0, 100, 100, 'red')

      expect(renderer.ctx.fillStyle).toBe('red')
    })
  })

  describe('Multiple Operations', () => {
    it('should handle sequence of drawing operations', () => {
      renderer.clear('#000000')
      renderer.drawRect(10, 10, 100, 100, '#FF0000')
      renderer.drawLine(0, 0, 800, 600, '#FFFFFF')
      renderer.drawText('Test', 400, 300, '#00FF00')

      // If no error is thrown, sequence executed successfully
      expect(true).toBe(true)
    })

    it('should maintain line width across operations', () => {
      renderer.setLineWidth(5)
      renderer.drawLine(0, 0, 100, 100, '#FFF')
      renderer.drawLine(100, 100, 200, 200, '#FFF')

      expect(renderer.lineWidth).toBe(5)
    })
  })
})
