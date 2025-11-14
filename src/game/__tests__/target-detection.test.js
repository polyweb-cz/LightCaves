/**
 * @fileoverview Unit tests for target detection logic
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { PhysicsEngine } from '../physics.js'
import { Level } from '../level.js'
import { CELL_TYPES, DIRECTIONS } from '../../utils/constants.js'

describe('Target Detection', () => {
  let physics
  let testLevel

  beforeEach(() => {
    physics = new PhysicsEngine()

    // Create a 10×8 test level
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
      metadata: { name: 'Target Detection Test Level', difficulty: 'easy', maxMirrors: 3 }
    }

    testLevel = new Level(mapData)
  })

  describe('Direct beam targeting', () => {
    it('should detect target when beam hits directly', () => {
      const path = physics.propagateBeam(testLevel, 1, 1, DIRECTIONS.E)
      const isComplete = physics.isTargetComplete(path, testLevel.target)
      expect(isComplete).toBe(true)
    })

    it('should not detect target if beam misses position', () => {
      const path = physics.propagateBeam(testLevel, 1, 3, DIRECTIONS.E) // Different row
      const target = { x: 8, y: 1, direction: DIRECTIONS.W }
      const isComplete = physics.isTargetComplete(path, target)
      expect(isComplete).toBe(false)
    })

    it('should not detect target if beam arrives from wrong direction', () => {
      const path = physics.propagateBeam(testLevel, 1, 1, DIRECTIONS.E)
      const target = { x: 8, y: 1, direction: DIRECTIONS.E } // Wrong direction (expects E, gets W)
      const isComplete = physics.isTargetComplete(path, target)
      expect(isComplete).toBe(false)
    })

    it('should detect target when beam travels North and target expects South', () => {
      const path = physics.propagateBeam(testLevel, 5, 6, DIRECTIONS.N)
      const target = { x: 5, y: 1, direction: DIRECTIONS.S } // Expects beam from South
      const isComplete = physics.isTargetComplete(path, target)
      expect(isComplete).toBe(true)
    })

    it('should detect target when beam travels South and target expects North', () => {
      const path = physics.propagateBeam(testLevel, 5, 1, DIRECTIONS.S)
      const target = { x: 5, y: 6, direction: DIRECTIONS.N } // Expects beam from North
      const isComplete = physics.isTargetComplete(path, target)
      expect(isComplete).toBe(true)
    })

    it('should detect target when beam travels West and target expects East', () => {
      const path = physics.propagateBeam(testLevel, 8, 4, DIRECTIONS.W)
      const target = { x: 1, y: 4, direction: DIRECTIONS.E } // Expects beam from East
      const isComplete = physics.isTargetComplete(path, target)
      expect(isComplete).toBe(true)
    })
  })

  describe('Reflected beam targeting', () => {
    it('should detect target after single mirror reflection', () => {
      const mirrors = {
        '4,4': { type: '/', x: 4, y: 4 }
      }
      const path = physics.propagateBeam(testLevel, 1, 4, DIRECTIONS.E, mirrors)
      const target = { x: 4, y: 1, direction: DIRECTIONS.S } // Beam reflects E->N, arrives from S
      const isComplete = physics.isTargetComplete(path, target)
      // Path should reflect at (4,4) going E->N, so last beam should be going N
      // Target at (4,1) expects from S (beam traveling N = arriving from S)
      expect(isComplete).toBe(true)
    })

    it('should not detect target if reflected beam misses', () => {
      const mirrors = {
        '4,4': { type: '/', x: 4, y: 4 }
      }
      const path = physics.propagateBeam(testLevel, 1, 4, DIRECTIONS.E, mirrors)
      const target = { x: 5, y: 1, direction: DIRECTIONS.S } // Wrong position
      const isComplete = physics.isTargetComplete(path, target)
      expect(isComplete).toBe(false)
    })

    it('should detect target after double reflection', () => {
      const mirrors = {
        '4,3': { type: '/', x: 4, y: 3 },
        '4,2': { type: '\\', x: 4, y: 2 }
      }
      const path = physics.propagateBeam(testLevel, 1, 3, DIRECTIONS.E, mirrors)
      // First reflects E->N, then N->W
      expect(path.length).toBeGreaterThan(0)
      // Check if any cell matches expected target position
      const cellAtTarget = path.some(cell => cell.x === 4 && cell.y === 2)
      expect(cellAtTarget).toBe(true)
    })
  })

  describe('Edge cases', () => {
    it('should return false for null path', () => {
      const target = { x: 8, y: 1, direction: DIRECTIONS.W }
      const isComplete = physics.isTargetComplete(null, target)
      expect(isComplete).toBe(false)
    })

    it('should return false for empty path', () => {
      const target = { x: 8, y: 1, direction: DIRECTIONS.W }
      const isComplete = physics.isTargetComplete([], target)
      expect(isComplete).toBe(false)
    })

    it('should return false for undefined path', () => {
      const target = { x: 8, y: 1, direction: DIRECTIONS.W }
      const isComplete = physics.isTargetComplete(undefined, target)
      expect(isComplete).toBe(false)
    })

    it('should handle target with invalid position', () => {
      const path = physics.propagateBeam(testLevel, 1, 1, DIRECTIONS.E)
      const target = { x: 999, y: 999, direction: DIRECTIONS.W }
      const isComplete = physics.isTargetComplete(path, target)
      expect(isComplete).toBe(false)
    })

    it('should correctly compare all direction pairs', () => {
      const testCases = [
        { beamDir: DIRECTIONS.N, targetDir: DIRECTIONS.S, shouldMatch: true },
        { beamDir: DIRECTIONS.S, targetDir: DIRECTIONS.N, shouldMatch: true },
        { beamDir: DIRECTIONS.E, targetDir: DIRECTIONS.W, shouldMatch: true },
        { beamDir: DIRECTIONS.W, targetDir: DIRECTIONS.E, shouldMatch: true },
        { beamDir: DIRECTIONS.N, targetDir: DIRECTIONS.E, shouldMatch: false },
        { beamDir: DIRECTIONS.N, targetDir: DIRECTIONS.W, shouldMatch: false },
      ]

      testCases.forEach(({ beamDir, targetDir, shouldMatch }) => {
        const path = [{ x: 5, y: 5, direction: beamDir }]
        const target = { x: 5, y: 5, direction: targetDir }
        const isComplete = physics.isTargetComplete(path, target)
        expect(isComplete).toBe(shouldMatch)
      })
    })
  })

  describe('Multiple path positions', () => {
    it('should use only the last beam position for detection', () => {
      // Create a path with multiple cells
      const path = [
        { x: 2, y: 1, direction: DIRECTIONS.E },
        { x: 3, y: 1, direction: DIRECTIONS.E },
        { x: 4, y: 1, direction: DIRECTIONS.E },
        { x: 5, y: 1, direction: DIRECTIONS.E },
        { x: 6, y: 1, direction: DIRECTIONS.E },
        { x: 7, y: 1, direction: DIRECTIONS.E },
        { x: 8, y: 1, direction: DIRECTIONS.E }
      ]
      const target = { x: 8, y: 1, direction: DIRECTIONS.W }
      const isComplete = physics.isTargetComplete(path, target)
      expect(isComplete).toBe(true)
    })

    it('should not detect target if it is in middle of path', () => {
      const path = [
        { x: 2, y: 1, direction: DIRECTIONS.E },
        { x: 3, y: 1, direction: DIRECTIONS.E },
        { x: 8, y: 1, direction: DIRECTIONS.E }, // Target position but not last
        { x: 9, y: 1, direction: DIRECTIONS.E }  // Last position
      ]
      const target = { x: 8, y: 1, direction: DIRECTIONS.W }
      const isComplete = physics.isTargetComplete(path, target)
      expect(isComplete).toBe(false)
    })
  })
})
