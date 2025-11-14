/**
 * @fileoverview Unit tests for visibility/illumination system
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { PhysicsEngine } from '../physics.js'
import { Level } from '../level.js'
import { CELL_TYPES, DIRECTIONS } from '../../utils/constants.js'

describe('Visibility System', () => {
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
      metadata: { name: 'Visibility Test Level', difficulty: 'easy', maxMirrors: 3 }
    }

    testLevel = new Level(mapData)
  })

  describe('Basic illumination', () => {
    it('should include lamp position in illuminated cells', () => {
      const path = []
      const illuminated = physics.getIlluminatedCells(testLevel, path)

      expect(illuminated.has('1,1')).toBe(true) // Lamp at (1,1)
    })

    it('should include direct beam cells', () => {
      const path = physics.propagateBeam(testLevel, 1, 1, DIRECTIONS.E)
      const illuminated = physics.getIlluminatedCells(testLevel, path)

      expect(illuminated.size).toBeGreaterThan(1) // At least lamp + beam cells
      // Check some beam cells
      expect(illuminated.has('2,1')).toBe(true)
      expect(illuminated.has('3,1')).toBe(true)
    })

    it('should return Set data structure', () => {
      const path = physics.propagateBeam(testLevel, 1, 1, DIRECTIONS.E)
      const illuminated = physics.getIlluminatedCells(testLevel, path)

      expect(illuminated instanceof Set).toBe(true)
    })
  })

  describe('Multiple beam directions', () => {
    it('should handle North beam', () => {
      const path = physics.propagateBeam(testLevel, 5, 6, DIRECTIONS.N)
      const illuminated = physics.getIlluminatedCells(testLevel, path)

      expect(illuminated.has('1,1')).toBe(true) // Lamp
      expect(illuminated.size).toBeGreaterThan(1)
    })

    it('should handle South beam', () => {
      const path = physics.propagateBeam(testLevel, 5, 1, DIRECTIONS.S)
      const illuminated = physics.getIlluminatedCells(testLevel, path)

      expect(illuminated.has('1,1')).toBe(true)
      expect(illuminated.size).toBeGreaterThan(1)
    })

    it('should handle West beam', () => {
      const path = physics.propagateBeam(testLevel, 8, 4, DIRECTIONS.W)
      const illuminated = physics.getIlluminatedCells(testLevel, path)

      expect(illuminated.has('1,1')).toBe(true)
      expect(illuminated.size).toBeGreaterThan(1)
    })
  })

  describe('Edge cases', () => {
    it('should handle null path', () => {
      const illuminated = physics.getIlluminatedCells(testLevel, null)

      expect(illuminated instanceof Set).toBe(true)
      expect(illuminated.has('1,1')).toBe(true) // Still includes lamp
      expect(illuminated.size).toBe(1)
    })

    it('should handle empty path array', () => {
      const illuminated = physics.getIlluminatedCells(testLevel, [])

      expect(illuminated instanceof Set).toBe(true)
      expect(illuminated.has('1,1')).toBe(true)
      expect(illuminated.size).toBe(1)
    })

    it('should handle undefined path', () => {
      const illuminated = physics.getIlluminatedCells(testLevel, undefined)

      expect(illuminated instanceof Set).toBe(true)
      expect(illuminated.has('1,1')).toBe(true)
      expect(illuminated.size).toBe(1)
    })

    it('should handle null level', () => {
      const path = [
        { x: 2, y: 1, direction: DIRECTIONS.E },
        { x: 3, y: 1, direction: DIRECTIONS.E }
      ]
      const illuminated = physics.getIlluminatedCells(null, path)

      // Should include only the beam cells (no lamp)
      expect(illuminated.size).toBe(2)
    })

    it('should not have duplicate cells', () => {
      // Create a path with overlapping cells (shouldn't happen, but test anyway)
      const path = [
        { x: 2, y: 1, direction: DIRECTIONS.E },
        { x: 2, y: 1, direction: DIRECTIONS.E }, // Duplicate
        { x: 3, y: 1, direction: DIRECTIONS.E }
      ]
      const illuminated = physics.getIlluminatedCells(testLevel, path)

      // Set should prevent duplicates
      expect(illuminated.size).toBe(3) // Lamp + 2 unique beam cells
    })
  })

  describe('Integration with beam paths', () => {
    it('should work with reflected beam paths', () => {
      const mirrors = {
        '4,1': { type: '/', x: 4, y: 1 }
      }
      const path = physics.propagateBeam(testLevel, 1, 1, DIRECTIONS.E, mirrors)
      const illuminated = physics.getIlluminatedCells(testLevel, path)

      expect(illuminated.has('1,1')).toBe(true) // Lamp
      expect(illuminated.size).toBeGreaterThan(1)
      // Should include the mirror cell
      expect(illuminated.has('4,1')).toBe(true)
    })

    it('should accumulate cells from entire path', () => {
      const path = physics.propagateBeam(testLevel, 1, 1, DIRECTIONS.E)
      const illuminated = physics.getIlluminatedCells(testLevel, path)

      // Count cells: lamp (1) + all path cells
      const expectedSize = 1 + path.length
      expect(illuminated.size).toBe(expectedSize)
    })
  })

  describe('Performance', () => {
    it('should handle large paths efficiently', () => {
      // Create a long path
      const longPath = []
      for (let i = 0; i < 100; i++) {
        longPath.push({ x: i % 10, y: Math.floor(i / 10), direction: DIRECTIONS.E })
      }

      const start = performance.now()
      const illuminated = physics.getIlluminatedCells(testLevel, longPath)
      const elapsed = performance.now() - start

      expect(elapsed).toBeLessThan(100) // Should be faster than 100ms
      expect(illuminated.size).toBeGreaterThan(0)
    })
  })
})
