/**
 * @fileoverview Unit tests for mirror reflection logic
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { PhysicsEngine } from '../physics.js'
import { Level } from '../level.js'
import { CELL_TYPES, DIRECTIONS, REFLECTION_TABLE } from '../../utils/constants.js'

describe('Mirror Reflection Logic', () => {
  let physics
  let testLevel

  beforeEach(() => {
    physics = new PhysicsEngine()

    // Create a simple 10×8 test level
    const mapData = {
      width: 10,
      height: 8,
      grid: [
        [CELL_TYPES.WALL, CELL_TYPES.WALL, CELL_TYPES.WALL, CELL_TYPES.WALL, CELL_TYPES.WALL, CELL_TYPES.WALL, CELL_TYPES.WALL, CELL_TYPES.WALL, CELL_TYPES.WALL, CELL_TYPES.WALL],
        [CELL_TYPES.WALL, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.WALL],
        [CELL_TYPES.WALL, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.WALL],
        [CELL_TYPES.WALL, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.WALL],
        [CELL_TYPES.WALL, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.WALL],
        [CELL_TYPES.WALL, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.WALL],
        [CELL_TYPES.WALL, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.WALL],
        [CELL_TYPES.WALL, CELL_TYPES.WALL, CELL_TYPES.WALL, CELL_TYPES.WALL, CELL_TYPES.WALL, CELL_TYPES.WALL, CELL_TYPES.WALL, CELL_TYPES.WALL, CELL_TYPES.WALL, CELL_TYPES.WALL]
      ],
      lamp: { x: 1, y: 1, direction: DIRECTIONS.E },
      target: { x: 8, y: 1, direction: DIRECTIONS.W },
      metadata: { name: 'Mirror Test Level', difficulty: 'easy', maxMirrors: 3 }
    }

    testLevel = new Level(mapData)
  })

  describe('Reflection Table', () => {
    it('should have reflection table for slash mirror', () => {
      expect(REFLECTION_TABLE['/']).toBeDefined()
      expect(REFLECTION_TABLE['/'][DIRECTIONS.N]).toBe(DIRECTIONS.E)
      expect(REFLECTION_TABLE['/'][DIRECTIONS.S]).toBe(DIRECTIONS.W)
      expect(REFLECTION_TABLE['/'][DIRECTIONS.E]).toBe(DIRECTIONS.N)
      expect(REFLECTION_TABLE['/'][DIRECTIONS.W]).toBe(DIRECTIONS.S)
    })

    it('should have reflection table for backslash mirror', () => {
      expect(REFLECTION_TABLE['\\']). toBeDefined()
      expect(REFLECTION_TABLE['\\'][DIRECTIONS.N]).toBe(DIRECTIONS.W)
      expect(REFLECTION_TABLE['\\'][DIRECTIONS.S]).toBe(DIRECTIONS.E)
      expect(REFLECTION_TABLE['\\'][DIRECTIONS.E]).toBe(DIRECTIONS.S)
      expect(REFLECTION_TABLE['\\'][DIRECTIONS.W]).toBe(DIRECTIONS.N)
    })
  })

  describe('Beam Reflection - Slash Mirror', () => {
    it('should reflect beam from E to N with slash mirror', () => {
      const mirrors = {
        '4,4': { type: '/', x: 4, y: 4 }
      }
      const path = physics.propagateBeam(testLevel, 1, 4, DIRECTIONS.E, mirrors)

      // Should reach mirror at (4,4) going E, then reflect to N
      const mirrorHit = path.find(cell => cell.x === 4 && cell.y === 4)
      expect(mirrorHit).toBeDefined()
      expect(mirrorHit.direction).toBe(DIRECTIONS.E)

      // After mirror, should continue going N (upward, decreasing y)
      const afterMirror = path.filter(cell => cell.y < 4 && cell.x === 4)
      expect(afterMirror.length).toBeGreaterThan(0)
      expect(afterMirror[0].direction).toBe(DIRECTIONS.N)
    })

    it('should reflect beam from N to E with slash mirror', () => {
      const mirrors = {
        '5,3': { type: '/', x: 5, y: 3 }
      }
      const path = physics.propagateBeam(testLevel, 5, 5, DIRECTIONS.N, mirrors)

      // Should reach mirror at (5,3) going N, then reflect to E
      const mirrorHit = path.find(cell => cell.x === 5 && cell.y === 3)
      expect(mirrorHit).toBeDefined()
      expect(mirrorHit.direction).toBe(DIRECTIONS.N)

      // After mirror, should continue going E
      const afterMirror = path.filter(cell => cell.x > 5 && cell.y === 3)
      expect(afterMirror.length).toBeGreaterThan(0)
      expect(afterMirror[0].direction).toBe(DIRECTIONS.E)
    })
  })

  describe('Beam Reflection - Backslash Mirror', () => {
    it('should reflect beam from E to S with backslash mirror', () => {
      const mirrors = {
        '4,2': { type: '\\', x: 4, y: 2 }
      }
      const path = physics.propagateBeam(testLevel, 1, 2, DIRECTIONS.E, mirrors)

      // Should reach mirror at (4,2) going E, then reflect to S
      const mirrorHit = path.find(cell => cell.x === 4 && cell.y === 2)
      expect(mirrorHit).toBeDefined()
      expect(mirrorHit.direction).toBe(DIRECTIONS.E)

      // After mirror, should continue going S
      const afterMirror = path.filter(cell => cell.y > 2 && cell.x === 4)
      expect(afterMirror.length).toBeGreaterThan(0)
      expect(afterMirror[0].direction).toBe(DIRECTIONS.S)
    })

    it('should reflect beam from N to W with backslash mirror', () => {
      const mirrors = {
        '5,3': { type: '\\', x: 5, y: 3 }
      }
      const path = physics.propagateBeam(testLevel, 5, 5, DIRECTIONS.N, mirrors)

      // Should reach mirror at (5,3) going N, then reflect to W
      const mirrorHit = path.find(cell => cell.x === 5 && cell.y === 3)
      expect(mirrorHit).toBeDefined()
      expect(mirrorHit.direction).toBe(DIRECTIONS.N)

      // After mirror, should continue going W
      const afterMirror = path.filter(cell => cell.x < 5 && cell.y === 3)
      expect(afterMirror.length).toBeGreaterThan(0)
      expect(afterMirror[0].direction).toBe(DIRECTIONS.W)
    })
  })

  describe('Cycle Detection', () => {
    it('should detect and stop infinite reflection loop', () => {
      // Create mirrors that would cause infinite loop
      const mirrors = {
        '3,3': { type: '/', x: 3, y: 3 },
        '4,3': { type: '\\', x: 4, y: 3 }
      }
      const path = physics.propagateBeam(testLevel, 1, 3, DIRECTIONS.E, mirrors)

      // Should have finite path, not infinite
      expect(path.length).toBeGreaterThan(0)
      expect(path.length).toBeLessThan(1000) // MAX_STEPS
    })

    it('should handle single mirror without infinite loop', () => {
      const mirrors = {
        '4,1': { type: '/', x: 4, y: 1 }
      }
      const path = physics.propagateBeam(testLevel, 1, 1, DIRECTIONS.E, mirrors)

      // Should stop after hitting wall, not loop infinitely
      expect(path.length).toBeGreaterThan(0)
      expect(path.length).toBeLessThan(1000)
    })
  })

  describe('Multiple Reflections', () => {
    it('should handle chain of mirrors (E -> N -> W)', () => {
      // Setup: Start at (1,3) going E
      // Hit / at (4,3): E -> N (goes up to y=2)
      // Hit \ at (4,2): N -> W (goes left)
      const mirrors = {
        '4,3': { type: '/', x: 4, y: 3 },   // E->N
        '4,2': { type: '\\', x: 4, y: 2 }   // N->W
      }
      const path = physics.propagateBeam(testLevel, 1, 3, DIRECTIONS.E, mirrors)

      // Should reach first mirror and reflect
      expect(path.length).toBeGreaterThan(3)

      // Verify first reflection point
      const firstMirror = path.find(cell => cell.x === 4 && cell.y === 3)
      expect(firstMirror).toBeDefined()
      expect(firstMirror.direction).toBe(DIRECTIONS.E)
    })
  })

  describe('Edge Cases', () => {
    it('should ignore mirrors not in the map', () => {
      const mirrors = {} // No mirrors
      const path = physics.propagateBeam(testLevel, 1, 1, DIRECTIONS.E, mirrors)

      // Should just go straight like Story 2.2
      expect(path.length).toBeGreaterThan(0)
      path.forEach(cell => {
        expect(cell.direction).toBe(DIRECTIONS.E)
      })
    })

    it('should handle mirror at lamp position', () => {
      const mirrors = {
        '1,1': { type: '/', x: 1, y: 1 }
      }
      const path = physics.propagateBeam(testLevel, 1, 1, DIRECTIONS.E, mirrors)

      // Should still propagate (first cell is already at (2,1))
      expect(path.length).toBeGreaterThan(0)
    })

    it('should stop at wall even after reflection', () => {
      const mirrors = {
        '4,1': { type: '/', x: 4, y: 1 }
      }
      const path = physics.propagateBeam(testLevel, 1, 1, DIRECTIONS.E, mirrors)

      // After reflecting at (4,1) going N, should stop at wall at y=0
      const lastCell = path[path.length - 1]
      expect(lastCell.y).toBeGreaterThan(0) // Should not hit wall
    })
  })
})
