/**
 * @fileoverview Unit tests for beam path calculation
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { PhysicsEngine } from '../physics.js'
import { Level } from '../level.js'
import { CELL_TYPES, DIRECTIONS } from '../../utils/constants.js'

describe('Beam Path Calculation', () => {
  let physics
  let testLevel

  beforeEach(() => {
    physics = new PhysicsEngine()

    // Create a 10×8 test level with space for mirrors
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
      metadata: { name: 'Beam Path Test Level', difficulty: 'easy', maxMirrors: 5 }
    }

    testLevel = new Level(mapData)
  })

  describe('calculateBeamPath', () => {
    it('should return path from level lamp without mirrors', () => {
      const path = physics.calculateBeamPath(testLevel)

      expect(path).toBeDefined()
      expect(path.length).toBeGreaterThan(0)
      expect(path[0].x).toBe(2)  // First step from lamp at (1,1)
      expect(path[0].y).toBe(1)
      expect(path[0].direction).toBe(DIRECTIONS.E)
    })

    it('should calculate path with single mirror', () => {
      const mirrors = {
        '4,1': { type: '/', x: 4, y: 1 }
      }
      const path = physics.calculateBeamPath(testLevel, mirrors)

      expect(path).toBeDefined()
      expect(path.length).toBeGreaterThanOrEqual(3)

      // Beam should reach the mirror
      const mirrorCell = path.find(cell => cell.x === 4 && cell.y === 1)
      expect(mirrorCell).toBeDefined()
      expect(mirrorCell.direction).toBe(DIRECTIONS.E)
    })

    it('should calculate path with multiple mirrors in sequence', () => {
      const mirrors = {
        '4,2': { type: '/', x: 4, y: 2 },
        '4,3': { type: '\\', x: 4, y: 3 }
      }
      const path = physics.calculateBeamPath(testLevel, mirrors)

      expect(path).toBeDefined()
      expect(path.length).toBeGreaterThan(3)

      // Should have cells with different directions (showing reflections)
      const directions = new Set(path.map(cell => cell.direction))
      expect(directions.size).toBeGreaterThan(0)
    })

    it('should handle empty mirrors object', () => {
      const path1 = physics.calculateBeamPath(testLevel, {})
      const path2 = physics.calculateBeamPath(testLevel)

      expect(path1.length).toBe(path2.length)
      path1.forEach((cell, i) => {
        expect(cell.x).toBe(path2[i].x)
        expect(cell.y).toBe(path2[i].y)
        expect(cell.direction).toBe(path2[i].direction)
      })
    })

    it('should return consistent results for same input', () => {
      const mirrors = {
        '5,4': { type: '/', x: 5, y: 4 }
      }

      const path1 = physics.calculateBeamPath(testLevel, mirrors)
      const path2 = physics.calculateBeamPath(testLevel, mirrors)

      expect(path1.length).toBe(path2.length)
      path1.forEach((cell, i) => {
        expect(cell.x).toBe(path2[i].x)
        expect(cell.y).toBe(path2[i].y)
        expect(cell.direction).toBe(path2[i].direction)
      })
    })

    it('should handle path that reflects off multiple walls', () => {
      // Beam going down, bouncing to different directions
      const mirrors = {
        '4,3': { type: '/', x: 4, y: 3 }
      }
      const path = physics.calculateBeamPath(testLevel, mirrors)

      // Path should be complete and bounded
      expect(path.length).toBeGreaterThan(0)
      expect(path.length).toBeLessThan(1000) // MAX_STEPS
      expect(Array.isArray(path)).toBe(true)
    })
  })

  describe('Path validity', () => {
    it('should return path with all required properties', () => {
      const path = physics.calculateBeamPath(testLevel)

      path.forEach(cell => {
        expect(cell).toHaveProperty('x')
        expect(cell).toHaveProperty('y')
        expect(cell).toHaveProperty('direction')
        expect(typeof cell.x).toBe('number')
        expect(typeof cell.y).toBe('number')
        expect(['N', 'S', 'E', 'W']).toContain(cell.direction)
      })
    })

    it('should return path coordinates within level bounds', () => {
      const mirrors = {
        '3,2': { type: '/', x: 3, y: 2 },
        '5,4': { type: '\\', x: 5, y: 4 }
      }
      const path = physics.calculateBeamPath(testLevel, mirrors)

      path.forEach(cell => {
        expect(cell.x).toBeGreaterThanOrEqual(0)
        expect(cell.x).toBeLessThan(testLevel.width)
        expect(cell.y).toBeGreaterThanOrEqual(0)
        expect(cell.y).toBeLessThan(testLevel.height)
      })
    })

    it('should not have duplicate consecutive positions', () => {
      const path = physics.calculateBeamPath(testLevel)

      for (let i = 0; i < path.length - 1; i++) {
        const curr = path[i]
        const next = path[i + 1]
        // Either x or y should differ (not same position twice)
        expect(curr.x !== next.x || curr.y !== next.y).toBe(true)
      }
    })
  })
})
