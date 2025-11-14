# Story 3.10: Rendering Optimization

## User Story

**As a** vývojář
**I want to** optimalizovat vykreslování pro hladkou 60 FPS
**So that** hra běží plynule i na starším hardwaru

## Popis

Implementovat optimalizace vykreslovacího systému:
- Dirty rectangle tracking (překreslí jen změněné oblasti)
- Canvas render caching (cachuje statické prvky)
- Request animation frame synchronizace
- Performance monitoring (FPS, render time)
- Efficient batch rendering (minimalizuje Canvas API calls)

## Acceptance Criteria

- [ ] Třída RenderingOptimizer
- [ ] markDirty(x, y, width, height) - označí oblast k překreslení
- [ ] isDirtyInRegion(x, y, width, height) - zkontroluje zda je oblast znečištěná
- [ ] clearDirty() - vymaže dirty flag
- [ ] cacheStaticBackground() - cachuje statické prvky
- [ ] batchDrawCalls() - agreguje kreslící volání
- [ ] Performance monitoring (FPS tracking)
- [ ] Unit testy: 14 testů (včetně performance)
- [ ] npm test projde

## Technical Details

```javascript
// Dirty rectangle tracking
class RenderingOptimizer {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth
    this.canvasHeight = canvasHeight
    this.dirtyRectangles = [] // Array of {x, y, width, height}
    this.isDirty = false
    this.frameCount = 0
    this.lastFrameTime = performance.now()
  }

  markDirty(x, y, width, height) {
    // Add dirty region, merge overlapping rectangles
    this.dirtyRectangles.push({ x, y, width, height })
    this.isDirty = true
    this.mergeOverlappingRectangles()
  }

  mergeOverlappingRectangles() {
    // Algorithm: Combine rectangles that overlap or are adjacent
    // Reduces number of redraw regions
    if (this.dirtyRectangles.length > 10) {
      // If too many dirty regions, just redraw everything
      this.dirtyRectangles = [
        { x: 0, y: 0, width: this.canvasWidth, height: this.canvasHeight }
      ]
    }
  }

  clearDirty() {
    this.dirtyRectangles = []
    this.isDirty = false
  }

  // Cache static background
  cacheStaticBackground(renderer, level) {
    const canvas = document.createElement('canvas')
    canvas.width = level.width * GRID_CONFIG.CELL_WIDTH
    canvas.height = level.height * GRID_CONFIG.CELL_HEIGHT

    const ctx = canvas.getContext('2d')
    // Draw grid + walls (static, won't change)
    // This cached image is reused each frame

    this.backgroundCache = canvas
  }

  // Performance monitoring
  measureFrameTime() {
    const now = performance.now()
    const frameTime = now - this.lastFrameTime
    const fps = 1000 / frameTime
    this.lastFrameTime = now
    this.frameCount++

    if (this.frameCount % 60 === 0) {
      console.log(`FPS: ${fps.toFixed(2)}`)
    }
  }
}

// Usage in game loop
function gameLoop() {
  renderOptimizer.measureFrameTime()

  if (renderOptimizer.isDirty) {
    // Redraw only dirty regions
    renderOptimizer.dirtyRectangles.forEach(rect => {
      ctx.clearRect(rect.x, rect.y, rect.width, rect.height)
      renderer.drawRegion(rect.x, rect.y, rect.width, rect.height)
    })
    renderOptimizer.clearDirty()
  }

  requestAnimationFrame(gameLoop)
}
```

## Performance Targets

- **Initial render:** < 100ms
- **Frame time:** < 16.67ms (for 60 FPS)
- **Dirty region update:** < 5ms
- **Memory usage:** < 50MB for a 30×16 level

## Odhad

- 1 den (optimizer + performance tests + profiling)
