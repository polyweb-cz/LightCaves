/**
 * @fileoverview Unit tests for physics engine
 */

import { describe, it, expect } from 'vitest'
import { PhysicsEngine } from '../physics.js'
import { Level } from '../level.js'
import { CELL_TYPES, DIRECTIONS } from '../../utils/constants.js'

describe('PhysicsEngine', () => {
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
      metadata: { name: 'Test Level', difficulty: 'easy', maxMirrors: 3 }
    }

    testLevel = new Level(mapData)
  })

  describe('Beam Propagation', () => {
    it('should propagate beam straight without obstacles', () => {
      const path = physics.propagateBeam(testLevel, 1, 1, DIRECTIONS.E)
      expect(path.length).toBeGreaterThan(0)
      expect(path[0].x).toBe(2)
      expect(path[0].y).toBe(1)
    })

    it('should stop at wall', () => {
      const path = physics.propagateBeam(testLevel, 1, 1, DIRECTIONS.E)
      // Beam should stop before hitting wall at x=9 (y=1)
      const lastCell = path[path.length - 1]
      expect(lastCell.x).toBe(8)
      expect(lastCell.y).toBe(1)
    })

    it('should stop at boundary', () => {
      const path = physics.propagateBeam(testLevel, 1, 1, DIRECTIONS.N)
      // Beam going up from (1,1) should hit wall at y=0 immediately
      expect(path.length).toBe(0)
    })

    it('should track direction in path', () => {
      const path = physics.propagateBeam(testLevel, 1, 1, DIRECTIONS.E)
      expect(path[0].direction).toBe(DIRECTIONS.E)
      path.forEach(cell => {
        expect(cell.direction).toBe(DIRECTIONS.E)
      })
    })

    it('should handle empty mirrors parameter', () => {
      const path1 = physics.propagateBeam(testLevel, 1, 1, DIRECTIONS.E, {})
      const path2 = physics.propagateBeam(testLevel, 1, 1, DIRECTIONS.E)
      expect(path1.length).toBe(path2.length)
    })
  })

  describe('Target Completion', () => {
    it('should detect target completion', () => {
      const path = physics.propagateBeam(testLevel, 1, 1, DIRECTIONS.E)
      const isComplete = physics.isTargetComplete(path, testLevel.target)
      expect(isComplete).toBe(true)
    })

    it('should return false for empty path', () => {
      const isComplete = physics.isTargetComplete([], testLevel.target)
      expect(isComplete).toBe(false)
    })

    it('should return false for null path', () => {
      const isComplete = physics.isTargetComplete(null, testLevel.target)
      expect(isComplete).toBe(false)
    })
  })
})
