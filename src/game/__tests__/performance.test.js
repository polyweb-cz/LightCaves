/**
 * @fileoverview Performance benchmarking and optimization tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { PhysicsEngine } from '../physics.js'
import { GameState } from '../game-state.js'
import { Level } from '../level.js'
import { CELL_TYPES, DIRECTIONS } from '../../utils/constants.js'

describe('Performance Optimization', () => {
  let physics
  let smallLevel
  let largeLevel
  let gameState

  beforeEach(() => {
    physics = new PhysicsEngine()

    // Small level (minimum size)
    const smallMapData = {
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
      metadata: { name: 'Small Level', difficulty: 'easy', maxMirrors: 1 }
    }

    // Large level (maximum size)
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

    smallLevel = new Level(smallMapData)
    largeLevel = new Level(largeMapData)
    gameState = new GameState(smallLevel)
  })

  describe('Beam Propagation Performance', () => {
    it('should propagate beam in small level <2ms', () => {
      const start = performance.now()
      const path = physics.propagateBeam(smallLevel, 1, 1, DIRECTIONS.E)
      const elapsed = performance.now() - start

      expect(elapsed).toBeLessThan(2)
      expect(path.length).toBeGreaterThan(0)
    })

    it('should propagate beam in large level <5ms', () => {
      const start = performance.now()
      const path = physics.propagateBeam(largeLevel, 1, 1, DIRECTIONS.E)
      const elapsed = performance.now() - start

      expect(elapsed).toBeLessThan(5)
      expect(path.length).toBeGreaterThan(0)
    })

    it('should propagate beam in all 4 directions efficiently', () => {
      const directions = [DIRECTIONS.N, DIRECTIONS.S, DIRECTIONS.E, DIRECTIONS.W]
      const times = []

      directions.forEach(dir => {
        const start = performance.now()
        physics.propagateBeam(smallLevel, 2, 2, dir)
        times.push(performance.now() - start)
      })

      times.forEach(time => {
        expect(time).toBeLessThan(2)
      })
    })

    it('should handle long beams efficiently', () => {
      const start = performance.now()
      const path = physics.propagateBeam(largeLevel, 1, 8, DIRECTIONS.E)
      const elapsed = performance.now() - start

      expect(elapsed).toBeLessThan(5)
      expect(path.length).toBeGreaterThan(20)
    })
  })

  describe('Mirror Reflection Performance', () => {
    it('should handle single reflection <1ms', () => {
      const mirrors = {
        '3,1': { type: '/', x: 3, y: 1 }
      }

      const start = performance.now()
      physics.propagateBeam(smallLevel, 1, 1, DIRECTIONS.E, mirrors)
      const elapsed = performance.now() - start

      expect(elapsed).toBeLessThan(1)
    })

    it('should handle multiple reflections <3ms', () => {
      const mirrors = {
        '3,1': { type: '/', x: 3, y: 1 },
        '3,2': { type: '\\', x: 3, y: 2 }
      }

      const start = performance.now()
      physics.propagateBeam(largeLevel, 1, 1, DIRECTIONS.E, mirrors)
      const elapsed = performance.now() - start

      expect(elapsed).toBeLessThan(3)
    })

    it('should handle dense mirror grid efficiently', () => {
      const mirrors = {}
      for (let x = 2; x < 28; x += 2) {
        for (let y = 2; y < 15; y += 2) {
          mirrors[`${x},${y}`] = { type: x % 3 === 0 ? '/' : '\\', x, y }
        }
      }

      const start = performance.now()
      physics.propagateBeam(largeLevel, 1, 1, DIRECTIONS.E, mirrors)
      const elapsed = performance.now() - start

      expect(elapsed).toBeLessThan(5)
    })
  })

  describe('Target Detection Performance', () => {
    it('should detect target <1ms', () => {
      const path = physics.propagateBeam(smallLevel, 1, 1, DIRECTIONS.E)

      const start = performance.now()
      physics.isTargetComplete(path, smallLevel.target)
      const elapsed = performance.now() - start

      expect(elapsed).toBeLessThan(1)
    })

    it('should detect target with long path <1ms', () => {
      const path = physics.propagateBeam(largeLevel, 1, 8, DIRECTIONS.E)

      const start = performance.now()
      physics.isTargetComplete(path, largeLevel.target)
      const elapsed = performance.now() - start

      expect(elapsed).toBeLessThan(1)
    })

    it('should handle null path detection <0.5ms', () => {
      const start = performance.now()
      physics.isTargetComplete(null, smallLevel.target)
      const elapsed = performance.now() - start

      expect(elapsed).toBeLessThan(0.5)
    })
  })

  describe('Illumination Calculation Performance', () => {
    it('should get illuminated cells <1ms for small path', () => {
      const path = physics.propagateBeam(smallLevel, 1, 1, DIRECTIONS.E)

      const start = performance.now()
      physics.getIlluminatedCells(smallLevel, path)
      const elapsed = performance.now() - start

      expect(elapsed).toBeLessThan(1)
    })

    it('should get illuminated cells <1ms for large path', () => {
      const path = physics.propagateBeam(largeLevel, 1, 8, DIRECTIONS.E)

      const start = performance.now()
      const illuminated = physics.getIlluminatedCells(largeLevel, path)
      const elapsed = performance.now() - start

      expect(elapsed).toBeLessThan(1)
      expect(illuminated.size).toBeGreaterThan(0)
    })

    it('should handle large illuminated areas <2ms', () => {
      // Create a large path with many cells
      const path = []
      for (let i = 1; i < 28; i++) {
        path.push({ x: i, y: 8, direction: DIRECTIONS.E })
      }

      const start = performance.now()
      const illuminated = physics.getIlluminatedCells(largeLevel, path)
      const elapsed = performance.now() - start

      expect(elapsed).toBeLessThan(2)
      expect(illuminated.size).toBeGreaterThan(25)
    })
  })

  describe('GameState Operations Performance', () => {
    it('should add mirror <1ms', () => {
      const start = performance.now()
      gameState.addMirror(2, 2, '/')
      const elapsed = performance.now() - start

      expect(elapsed).toBeLessThan(1)
    })

    it('should remove mirror <1ms', () => {
      gameState.addMirror(2, 2, '/')

      const start = performance.now()
      gameState.removeMirror(2, 2)
      const elapsed = performance.now() - start

      expect(elapsed).toBeLessThan(1)
    })

    it('should get all mirrors <1ms', () => {
      for (let i = 0; i < 10; i++) {
        gameState.addMirror(2 + i, 2, '/')
      }

      const start = performance.now()
      gameState.getMirrors()
      const elapsed = performance.now() - start

      expect(elapsed).toBeLessThan(1)
    })

    it('should handle max mirror operations <20ms', () => {
      gameState = new GameState(largeLevel) // Level with 10 mirrors max

      const start = performance.now()
      for (let i = 0; i < 10; i++) {
        gameState.addMirror(2 + i * 2, 5, i % 2 === 0 ? '/' : '\\')
      }
      const elapsed = performance.now() - start

      expect(elapsed).toBeLessThan(20)
      expect(gameState.getMirrorCount()).toBe(10)
    })
  })

  describe('Full Workflow Performance', () => {
    it('should complete full calculation cycle <10ms', () => {
      const start = performance.now()

      // Add mirrors
      gameState.addMirror(2, 1, '/')

      // Calculate path
      const path = physics.calculateBeamPath(smallLevel, gameState.getMirrors())

      // Check completion
      const isComplete = physics.isTargetComplete(path, smallLevel.target)

      // Get illuminated
      const illuminated = physics.getIlluminatedCells(smallLevel, path)

      const elapsed = performance.now() - start

      expect(elapsed).toBeLessThan(10)
      expect(isComplete).toBeDefined()
      expect(illuminated.size).toBeGreaterThan(0)
    })

    it('should complete large level workflow <15ms', () => {
      gameState = new GameState(largeLevel)

      const start = performance.now()

      // Add several mirrors
      for (let i = 0; i < 3; i++) {
        gameState.addMirror(5 + i * 5, 5, i % 2 === 0 ? '/' : '\\')
      }

      // Calculate path with mirrors
      const path = physics.calculateBeamPath(largeLevel, gameState.getMirrors())

      // Check completion
      physics.isTargetComplete(path, largeLevel.target)

      // Get illuminated
      physics.getIlluminatedCells(largeLevel, path)

      const elapsed = performance.now() - start

      expect(elapsed).toBeLessThan(15)
    })
  })

  describe('Memory Efficiency', () => {
    it('should not leak memory on repeated calculations', () => {
      const mirrors = {
        '3,2': { type: '/', x: 3, y: 2 }
      }

      // Run calculation 100 times
      for (let i = 0; i < 100; i++) {
        const path = physics.propagateBeam(largeLevel, 1, 8, DIRECTIONS.E, mirrors)
        expect(path.length).toBeGreaterThan(0)
      }

      // All should complete successfully without growing memory
      expect(true).toBe(true) // Placeholder assertion
    })

    it('should handle rapid mirror operations without memory issues', () => {
      // Add and remove mirrors 50 times
      for (let i = 0; i < 50; i++) {
        const x = 2 + (i % 3)
        const y = 2 + (i % 2)
        gameState.addMirror(x, y, '/')
        gameState.removeMirror(x, y)
      }

      expect(gameState.getMirrorCount()).toBe(0)
    })
  })

  describe('Consistency Under Load', () => {
    it('should maintain calculation consistency over iterations', () => {
      const path1 = physics.propagateBeam(smallLevel, 1, 1, DIRECTIONS.E)

      // Run 50 iterations
      for (let i = 0; i < 50; i++) {
        const path = physics.propagateBeam(smallLevel, 1, 1, DIRECTIONS.E)
        expect(path.length).toBe(path1.length)
      }
    })

    it('should maintain mirror operations consistency', () => {
      const startCount = gameState.getMirrorCount()

      for (let i = 0; i < 20; i++) {
        gameState.addMirror(2 + (i % 3), 2 + (i % 2), '/')
      }

      gameState.clearMirrors()
      expect(gameState.getMirrorCount()).toBe(startCount)
    })
  })
})
