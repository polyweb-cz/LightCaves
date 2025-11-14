/**
 * @fileoverview Edge cases and error handling tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { PhysicsEngine } from '../physics.js'
import { GameState } from '../game-state.js'
import { Level } from '../level.js'
import { CELL_TYPES, DIRECTIONS } from '../../utils/constants.js'

describe('Edge Cases & Error Handling', () => {
  let physics

  beforeEach(() => {
    physics = new PhysicsEngine()
  })

  describe('Invalid Input Handling', () => {
    it('should handle null level in propagateBeam', () => {
      expect(() => {
        physics.propagateBeam(null, 1, 1, DIRECTIONS.E)
      }).toThrow()
    })

    it('should handle undefined level in propagateBeam', () => {
      expect(() => {
        physics.propagateBeam(undefined, 1, 1, DIRECTIONS.E)
      }).toThrow()
    })

    it('should handle invalid direction', () => {
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
        metadata: { name: 'Test', difficulty: 'easy', maxMirrors: 1 }
      }
      const level = new Level(mapData)

      // Invalid direction should return current position (no movement)
      const path = physics.propagateBeam(level, 2, 2, 'INVALID')
      expect(Array.isArray(path)).toBe(true)
    })

    it('should truncate float coordinates to valid array indices', () => {
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
        metadata: { name: 'Test', difficulty: 'easy', maxMirrors: 1 }
      }
      const level = new Level(mapData)

      // Float coordinates will be treated as array indices - JavaScript will use them as strings
      // This should fail or return empty path when truncated to invalid indices
      expect(() => {
        physics.propagateBeam(level, 1.5, 1.5, DIRECTIONS.E)
      }).toThrow() // Will throw because grid[1.5] is undefined
    })

    it('should handle negative coordinates', () => {
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
        metadata: { name: 'Test', difficulty: 'easy', maxMirrors: 1 }
      }
      const level = new Level(mapData)

      const path = physics.propagateBeam(level, -1, -1, DIRECTIONS.E)
      expect(path.length).toBe(0) // Out of bounds
    })
  })

  describe('Minimum Level Size', () => {
    it('should handle minimum size level (6×4)', () => {
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
        metadata: { name: 'Min Level', difficulty: 'easy', maxMirrors: 1 }
      }

      const level = new Level(mapData)
      const gameState = new GameState(level)

      expect(level.width).toBe(6)
      expect(level.height).toBe(4)
      expect(gameState.getMirrorCount()).toBe(0)
    })
  })

  describe('Maximum Level Size', () => {
    it('should handle maximum size level (30×16)', () => {
      const largeGrid = Array(16).fill(null).map((_, y) =>
        Array(30).fill(null).map((_, x) => {
          if (x === 0 || x === 29 || y === 0 || y === 15) {
            return CELL_TYPES.WALL
          }
          return CELL_TYPES.EMPTY
        })
      )

      const mapData = {
        width: 30,
        height: 16,
        grid: largeGrid,
        lamp: { x: 1, y: 1, direction: DIRECTIONS.E },
        target: { x: 28, y: 1, direction: DIRECTIONS.W },
        metadata: { name: 'Max Level', difficulty: 'hard', maxMirrors: 10 }
      }

      const level = new Level(mapData)
      expect(level.width).toBe(30)
      expect(level.height).toBe(16)

      // Should calculate path without crashing
      const path = physics.propagateBeam(level, 1, 1, DIRECTIONS.E)
      expect(path.length).toBeGreaterThan(0)
    })
  })

  describe('Boundary Conditions', () => {
    it('should handle beam at left edge', () => {
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
        metadata: { name: 'Test', difficulty: 'easy', maxMirrors: 1 }
      }
      const level = new Level(mapData)

      const path = physics.propagateBeam(level, 1, 1, DIRECTIONS.W)
      expect(path.length).toBe(0) // Immediately hits wall
    })

    it('should handle beam at right edge', () => {
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
        metadata: { name: 'Test', difficulty: 'easy', maxMirrors: 1 }
      }
      const level = new Level(mapData)

      const path = physics.propagateBeam(level, 4, 1, DIRECTIONS.E)
      expect(path.length).toBe(0) // Immediately hits wall
    })

    it('should handle beam at top edge', () => {
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
        metadata: { name: 'Test', difficulty: 'easy', maxMirrors: 1 }
      }
      const level = new Level(mapData)

      const path = physics.propagateBeam(level, 1, 1, DIRECTIONS.N)
      expect(path.length).toBe(0) // Immediately hits wall
    })

    it('should handle beam at bottom edge', () => {
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
        metadata: { name: 'Test', difficulty: 'easy', maxMirrors: 1 }
      }
      const level = new Level(mapData)

      const path = physics.propagateBeam(level, 1, 2, DIRECTIONS.S)
      expect(path.length).toBe(0) // Immediately hits wall
    })
  })

  describe('GameState Error Handling', () => {
    let level
    let gameState

    beforeEach(() => {
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
        metadata: { name: 'Test', difficulty: 'easy', maxMirrors: 1 }
      }
      level = new Level(mapData)
      gameState = new GameState(level)
    })

    it('should reject invalid mirror coordinates', () => {
      const result = gameState.addMirror(-1, 0, '/')
      expect(result).toBe(false)
    })

    it('should reject out-of-bounds mirror coordinates', () => {
      const result = gameState.addMirror(100, 100, '/')
      expect(result).toBe(false)
    })

    it('should reject invalid mirror type', () => {
      const result = gameState.addMirror(2, 2, 'INVALID')
      expect(result).toBe(false)
    })

    it('should reject mirror on wall', () => {
      const result = gameState.addMirror(0, 0, '/') // Wall
      expect(result).toBe(false)
    })

    it('should handle null level in GameState', () => {
      expect(() => new GameState(null)).toThrow()
    })
  })

  describe('Special Characters & Unicode', () => {
    it('should handle backslash mirror correctly', () => {
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
        metadata: { name: 'Test', difficulty: 'easy', maxMirrors: 1 }
      }
      const level = new Level(mapData)
      const gameState = new GameState(level)

      const result = gameState.addMirror(2, 2, '\\')
      expect(result).toBe(true)
      expect(gameState.getMirror(2, 2).type).toBe('\\')
    })
  })

  describe('Rapid State Changes', () => {
    it('should handle rapid mirror add/remove cycles', () => {
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
        metadata: { name: 'Test', difficulty: 'easy', maxMirrors: 3 }
      }
      const level = new Level(mapData)
      const gameState = new GameState(level)

      for (let i = 0; i < 20; i++) {
        gameState.addMirror(2, 2, '/')
        expect(gameState.getMirrorCount()).toBe(1)
        gameState.removeMirror(2, 2)
        expect(gameState.getMirrorCount()).toBe(0)
      }
    })
  })
})
