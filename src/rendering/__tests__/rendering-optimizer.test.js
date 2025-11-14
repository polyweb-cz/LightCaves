/**
 * @fileoverview Unit tests for RenderingOptimizer class
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { RenderingOptimizer } from '../rendering-optimizer.js'

describe('RenderingOptimizer', () => {
  let optimizer

  beforeEach(() => {
    optimizer = new RenderingOptimizer(640, 480)
  })

  describe('Constructor', () => {
    it('should create optimizer with default dimensions', () => {
      expect(optimizer.canvasWidth).toBe(640)
      expect(optimizer.canvasHeight).toBe(480)
    })

    it('should create optimizer with custom dimensions', () => {
      const opt = new RenderingOptimizer(800, 600)
      expect(opt.canvasWidth).toBe(800)
      expect(opt.canvasHeight).toBe(600)
    })

    it('should initialize dirty rectangles as empty', () => {
      expect(optimizer.dirtyRectangles).toEqual([])
      expect(optimizer.isDirty).toBe(false)
    })

    it('should initialize performance tracking', () => {
      expect(optimizer.frameCount).toBe(0)
      expect(optimizer.frameTimes).toEqual([])
    })

    it('should initialize cache', () => {
      expect(optimizer.caches).toBeDefined()
      expect(optimizer.cacheEnabled).toBe(true)
    })
  })

  describe('Dirty Rectangles', () => {
    it('should mark region as dirty', () => {
      optimizer.markDirty(10, 10, 50, 50)

      expect(optimizer.isDirty).toBe(true)
      expect(optimizer.dirtyRectangles.length).toBe(1)
    })

    it('should accumulate multiple dirty regions', () => {
      optimizer.markDirty(10, 10, 50, 50)
      optimizer.markDirty(100, 100, 30, 30)

      expect(optimizer.dirtyRectangles.length).toBe(2)
    })

    it('should clear dirty regions', () => {
      optimizer.markDirty(10, 10, 50, 50)
      optimizer.clearDirty()

      expect(optimizer.isDirty).toBe(false)
      expect(optimizer.dirtyRectangles.length).toBe(0)
    })

    it('should detect dirty region with overlap', () => {
      optimizer.markDirty(10, 10, 50, 50)

      const isDirty = optimizer.isDirtyInRegion(30, 30, 20, 20)
      expect(isDirty).toBe(true)
    })

    it('should detect non-overlapping region as not dirty', () => {
      optimizer.markDirty(10, 10, 50, 50)

      const isDirty = optimizer.isDirtyInRegion(200, 200, 20, 20)
      expect(isDirty).toBe(false)
    })

    it('should handle invalid dirty region gracefully', () => {
      expect(() => optimizer.markDirty(undefined, undefined, undefined, undefined)).not.toThrow()
    })
  })

  describe('Rectangle Operations', () => {
    it('should detect overlapping rectangles', () => {
      const rect1 = { x: 10, y: 10, width: 50, height: 50 }
      const rect2 = { x: 30, y: 30, width: 50, height: 50 }

      const overlap = optimizer.rectanglesOverlap(rect1, rect2)
      expect(overlap).toBe(true)
    })

    it('should detect non-overlapping rectangles', () => {
      const rect1 = { x: 10, y: 10, width: 50, height: 50 }
      const rect2 = { x: 200, y: 200, width: 50, height: 50 }

      const overlap = optimizer.rectanglesOverlap(rect1, rect2)
      expect(overlap).toBe(false)
    })

    it('should merge overlapping rectangles', () => {
      const rect1 = { x: 10, y: 10, width: 50, height: 50 }
      const rect2 = { x: 30, y: 30, width: 50, height: 50 }

      const merged = optimizer.mergeRectangles(rect1, rect2)

      expect(merged.x).toBe(10)
      expect(merged.y).toBe(10)
      expect(merged.width).toBe(70)
      expect(merged.height).toBe(70)
    })

    it('should optimize too many dirty regions', () => {
      // Mark more regions than max
      for (let i = 0; i < 15; i++) {
        optimizer.markDirty(i * 10, i * 10, 20, 20)
      }

      expect(optimizer.dirtyRectangles.length).toBeLessThanOrEqual(optimizer.maxDirtyRegions * 2)
    })
  })

  describe('Caching', () => {
    it('should cache a value', () => {
      const value = { data: 'test' }
      optimizer.setCache('test-key', value)

      expect(optimizer.getCache('test-key')).toBe(value)
    })

    it('should return undefined for missing cache key', () => {
      const value = optimizer.getCache('missing-key')

      expect(value).toBeUndefined()
    })

    it('should clear cache', () => {
      optimizer.setCache('key1', 'value1')
      optimizer.setCache('key2', 'value2')

      optimizer.clearCache()

      expect(optimizer.getCache('key1')).toBeUndefined()
      expect(optimizer.getCache('key2')).toBeUndefined()
    })

    it('should respect cache enabled flag', () => {
      optimizer.setCacheEnabled(false)
      optimizer.setCache('key', 'value')

      expect(optimizer.getCache('key')).toBeUndefined()
    })

    it('should re-enable caching', () => {
      optimizer.setCacheEnabled(false)
      optimizer.setCacheEnabled(true)
      optimizer.setCache('key', 'value')

      expect(optimizer.getCache('key')).toBe('value')
    })

    it('should clear cache when disabled', () => {
      optimizer.setCache('key', 'value')
      optimizer.setCacheEnabled(false)

      expect(optimizer.caches.size).toBe(0)
    })
  })

  describe('Performance Metrics', () => {
    it('should measure frame time', () => {
      optimizer.measureFrameTime()

      expect(optimizer.frameCount).toBe(1)
      expect(optimizer.frameTimes.length).toBeGreaterThan(0)
    })

    it('should calculate FPS', () => {
      optimizer.measureFrameTime()

      const fps = optimizer.getFPS()
      expect(fps).toBeGreaterThan(0)
    })

    it('should calculate average frame time', () => {
      optimizer.measureFrameTime()

      const avgTime = optimizer.getAverageFrameTime()
      expect(avgTime).toBeGreaterThan(0)
    })

    it('should not exceed max frame history', () => {
      for (let i = 0; i < 100; i++) {
        optimizer.measureFrameTime()
      }

      expect(optimizer.frameTimes.length).toBeLessThanOrEqual(optimizer.maxFrameHistory)
    })

    it('should get performance stats', () => {
      optimizer.measureFrameTime()
      optimizer.markDirty(0, 0, 10, 10)

      const stats = optimizer.getStats()

      expect(stats.fps).toBeGreaterThan(0)
      expect(stats.frameTime).toBeGreaterThan(0)
      expect(stats.dirtyRegions).toBe(1)
      expect(stats.frameCount).toBe(1)
      expect(stats.isDirty).toBe(true)
    })
  })

  describe('Batch Rendering', () => {
    it('should start batch mode', () => {
      optimizer.startBatch()

      expect(optimizer.batchMode).toBe(true)
    })

    it('should add render calls to batch', () => {
      optimizer.startBatch()
      optimizer.addBatchCall({ type: 'drawRect', x: 10, y: 10 })
      optimizer.addBatchCall({ type: 'drawText', text: 'hello' })

      expect(optimizer.getBatchSize()).toBe(2)
    })

    it('should execute batch and return calls', () => {
      optimizer.startBatch()
      optimizer.addBatchCall({ type: 'drawRect' })
      optimizer.addBatchCall({ type: 'drawText' })

      const calls = optimizer.executeBatch()

      expect(calls.length).toBe(2)
      expect(optimizer.batchMode).toBe(false)
    })

    it('should not add calls outside batch mode', () => {
      optimizer.addBatchCall({ type: 'drawRect' })

      expect(optimizer.getBatchSize()).toBe(0)
    })

    it('should handle empty batch', () => {
      optimizer.startBatch()

      const calls = optimizer.executeBatch()

      expect(calls.length).toBe(0)
    })
  })

  describe('Utility Methods', () => {
    it('should detect full screen redraw', () => {
      optimizer.markDirty(0, 0, 640, 480)

      const shouldRedraw = optimizer.shouldRedrawFullScreen()
      expect(shouldRedraw).toBe(true)
    })

    it('should not detect full screen redraw for partial', () => {
      optimizer.markDirty(10, 10, 100, 100)

      const shouldRedraw = optimizer.shouldRedrawFullScreen()
      expect(shouldRedraw).toBe(false)
    })

    it('should get dirty regions', () => {
      optimizer.markDirty(10, 10, 50, 50)
      optimizer.markDirty(100, 100, 30, 30)

      const regions = optimizer.getDirtyRegions()

      expect(regions.length).toBe(2)
      expect(Array.isArray(regions)).toBe(true)
    })

    it('should reset optimizer state', () => {
      optimizer.markDirty(10, 10, 50, 50)
      optimizer.setCache('key', 'value')
      optimizer.measureFrameTime()

      optimizer.reset()

      expect(optimizer.isDirty).toBe(false)
      expect(optimizer.caches.size).toBe(0)
      expect(optimizer.frameCount).toBe(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero-sized rectangles', () => {
      expect(() => optimizer.markDirty(10, 10, 0, 0)).not.toThrow()
    })

    it('should handle negative dimensions', () => {
      expect(() => optimizer.markDirty(10, 10, -50, -50)).not.toThrow()
    })

    it('should handle large canvas dimensions', () => {
      const largeOpt = new RenderingOptimizer(4000, 3000)
      expect(largeOpt.canvasWidth).toBe(4000)
      expect(largeOpt.canvasHeight).toBe(3000)
    })

    it('should handle rapid frame measurements', () => {
      for (let i = 0; i < 1000; i++) {
        optimizer.measureFrameTime()
      }

      expect(optimizer.frameCount).toBe(1000)
      expect(optimizer.frameTimes.length).toBeLessThanOrEqual(optimizer.maxFrameHistory)
    })

    it('should handle large number of dirty regions', () => {
      for (let i = 0; i < 100; i++) {
        optimizer.markDirty(i * 10, i * 10, 20, 20)
      }

      // Should optimize to prevent memory issues
      expect(optimizer.dirtyRectangles.length).toBeLessThanOrEqual(100)
    })
  })

  describe('Performance Monitoring', () => {
    it('should track frame history', () => {
      for (let i = 0; i < 10; i++) {
        optimizer.measureFrameTime()
      }

      expect(optimizer.frameTimes.length).toBe(10)
    })

    it('should maintain frame count', () => {
      optimizer.measureFrameTime()
      optimizer.measureFrameTime()
      optimizer.measureFrameTime()

      expect(optimizer.frameCount).toBe(3)
    })

    it('should handle FPS calculation with no frames', () => {
      const fps = optimizer.getFPS()
      expect(fps).toBe(0)
    })

    it('should handle average frame time with no frames', () => {
      const avgTime = optimizer.getAverageFrameTime()
      expect(avgTime).toBe(0)
    })
  })
})
