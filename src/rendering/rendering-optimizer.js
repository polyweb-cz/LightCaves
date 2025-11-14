/**
 * @fileoverview Rendering optimization with dirty rectangles and caching
 * @module rendering/rendering-optimizer
 */

/**
 * RenderingOptimizer class - handles performance optimization for rendering
 * @class RenderingOptimizer
 */
export class RenderingOptimizer {
  /**
   * Create a rendering optimizer
   * @param {number} canvasWidth - Canvas width
   * @param {number} canvasHeight - Canvas height
   */
  constructor(canvasWidth = 640, canvasHeight = 480) {
    this.canvasWidth = canvasWidth
    this.canvasHeight = canvasHeight

    // Dirty rectangle tracking
    this.dirtyRectangles = []
    this.isDirty = false

    // Performance metrics
    this.frameCount = 0
    this.lastFrameTime = performance.now()
    this.frameTimes = []
    this.maxFrameHistory = 60 // Keep last 60 frames

    // Caching
    this.caches = new Map()
    this.cacheEnabled = true

    // Optimization settings
    this.maxDirtyRegions = 10
    this.batchMode = false
    this.renderCalls = []

    console.log('[RenderingOptimizer] Initialized')
  }

  /**
   * Mark a rectangular region as dirty (needing redraw)
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} width - Rectangle width
   * @param {number} height - Rectangle height
   */
  markDirty(x, y, width, height) {
    if (x === undefined || y === undefined || width === undefined || height === undefined) {
      console.warn('[RenderingOptimizer] Invalid dirty region parameters')
      return
    }

    this.dirtyRectangles.push({ x, y, width, height })
    this.isDirty = true

    // Merge overlapping rectangles if too many
    if (this.dirtyRectangles.length > this.maxDirtyRegions) {
      this.optimizeDirtyRegions()
    }
  }

  /**
   * Check if a region is dirty
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} width - Rectangle width
   * @param {number} height - Rectangle height
   * @returns {boolean} True if region overlaps with any dirty rectangle
   */
  isDirtyInRegion(x, y, width, height) {
    return this.dirtyRectangles.some(rect => {
      return !(
        x + width < rect.x ||
        x > rect.x + rect.width ||
        y + height < rect.y ||
        y > rect.y + rect.height
      )
    })
  }

  /**
   * Clear all dirty rectangles
   */
  clearDirty() {
    this.dirtyRectangles = []
    this.isDirty = false
  }

  /**
   * Optimize dirty regions by merging overlapping rectangles
   * @private
   */
  optimizeDirtyRegions() {
    if (this.dirtyRectangles.length <= this.maxDirtyRegions) {
      return
    }

    // If too many regions, just redraw everything
    if (this.dirtyRectangles.length > this.maxDirtyRegions * 2) {
      this.dirtyRectangles = [
        { x: 0, y: 0, width: this.canvasWidth, height: this.canvasHeight }
      ]
      return
    }

    // Try to merge rectangles
    const merged = []
    let changed = true

    while (changed && this.dirtyRectangles.length > this.maxDirtyRegions) {
      changed = false

      // Find two overlapping rectangles and merge them
      for (let i = 0; i < this.dirtyRectangles.length; i++) {
        for (let j = i + 1; j < this.dirtyRectangles.length; j++) {
          if (this.rectanglesOverlap(this.dirtyRectangles[i], this.dirtyRectangles[j])) {
            // Merge rectangles i and j
            const merged_rect = this.mergeRectangles(this.dirtyRectangles[i], this.dirtyRectangles[j])

            // Remove both and add merged
            this.dirtyRectangles.splice(j, 1)
            this.dirtyRectangles[i] = merged_rect

            changed = true
            break
          }
        }
        if (changed) break
      }
    }
  }

  /**
   * Check if two rectangles overlap or are adjacent
   * @param {Object} rect1 - Rectangle 1
   * @param {Object} rect2 - Rectangle 2
   * @returns {boolean} True if rectangles overlap or touch
   * @private
   */
  rectanglesOverlap(rect1, rect2) {
    return !(
      rect1.x + rect1.width < rect2.x ||
      rect1.x > rect2.x + rect2.width ||
      rect1.y + rect1.height < rect2.y ||
      rect1.y > rect2.y + rect2.height
    )
  }

  /**
   * Merge two rectangles into their bounding box
   * @param {Object} rect1 - Rectangle 1
   * @param {Object} rect2 - Rectangle 2
   * @returns {Object} Merged rectangle
   * @private
   */
  mergeRectangles(rect1, rect2) {
    const minX = Math.min(rect1.x, rect2.x)
    const minY = Math.min(rect1.y, rect2.y)
    const maxX = Math.max(rect1.x + rect1.width, rect2.x + rect2.width)
    const maxY = Math.max(rect1.y + rect1.height, rect2.y + rect2.height)

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    }
  }

  /**
   * Cache a canvas or image
   * @param {string} key - Cache key
   * @param {Canvas|OffscreenCanvas} value - Value to cache
   */
  setCache(key, value) {
    if (!this.cacheEnabled) {
      return
    }
    this.caches.set(key, value)
  }

  /**
   * Get cached value
   * @param {string} key - Cache key
   * @returns {Canvas|OffscreenCanvas|undefined} Cached value or undefined
   */
  getCache(key) {
    if (!this.cacheEnabled) {
      return undefined
    }
    return this.caches.get(key)
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.caches.clear()
  }

  /**
   * Enable or disable caching
   * @param {boolean} enabled - Enable caching
   */
  setCacheEnabled(enabled) {
    this.cacheEnabled = enabled
    if (!enabled) {
      this.clearCache()
    }
  }

  /**
   * Measure frame time and update FPS
   */
  measureFrameTime() {
    const now = performance.now()
    const frameTime = now - this.lastFrameTime
    this.lastFrameTime = now

    this.frameTimes.push(frameTime)
    if (this.frameTimes.length > this.maxFrameHistory) {
      this.frameTimes.shift()
    }

    this.frameCount++
  }

  /**
   * Get current FPS (average of last frames)
   * @returns {number} Frames per second
   */
  getFPS() {
    if (this.frameTimes.length === 0) {
      return 0
    }

    const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length
    return avgFrameTime > 0 ? 1000 / avgFrameTime : 0
  }

  /**
   * Get average frame time in milliseconds
   * @returns {number} Average frame time (ms)
   */
  getAverageFrameTime() {
    if (this.frameTimes.length === 0) {
      return 0
    }

    return this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length
  }

  /**
   * Get performance statistics
   * @returns {Object} Performance stats
   */
  getStats() {
    return {
      fps: this.getFPS(),
      frameTime: this.getAverageFrameTime(),
      dirtyRegions: this.dirtyRectangles.length,
      cacheSize: this.caches.size,
      frameCount: this.frameCount,
      isDirty: this.isDirty
    }
  }

  /**
   * Start batch rendering mode
   */
  startBatch() {
    this.batchMode = true
    this.renderCalls = []
  }

  /**
   * Add render call to batch
   * @param {Object} call - Render call object
   */
  addBatchCall(call) {
    if (this.batchMode) {
      this.renderCalls.push(call)
    }
  }

  /**
   * Execute all batched render calls
   * @returns {Array<Object>} Array of render calls
   */
  executeBatch() {
    this.batchMode = false
    const calls = this.renderCalls
    this.renderCalls = []
    return calls
  }

  /**
   * Get number of batched calls
   * @returns {number} Number of render calls
   */
  getBatchSize() {
    return this.renderCalls.length
  }

  /**
   * Should redraw full screen
   * @returns {boolean} True if should redraw everything
   */
  shouldRedrawFullScreen() {
    return this.dirtyRectangles.length === 1 &&
      this.dirtyRectangles[0].x === 0 &&
      this.dirtyRectangles[0].y === 0 &&
      this.dirtyRectangles[0].width === this.canvasWidth &&
      this.dirtyRectangles[0].height === this.canvasHeight
  }

  /**
   * Get dirty rectangles to redraw
   * @returns {Array<Object>} Array of dirty rectangles
   */
  getDirtyRegions() {
    return [...this.dirtyRectangles]
  }

  /**
   * Reset optimizer state
   */
  reset() {
    this.clearDirty()
    this.clearCache()
    this.frameTimes = []
    this.frameCount = 0
    this.renderCalls = []
  }
}
