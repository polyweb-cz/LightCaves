/**
 * @fileoverview Unit tests for Level class
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { Level } from '../level.js'
import { CELL_TYPES, DIRECTIONS } from '../../utils/constants.js'

describe('Level Class', () => {
  let testLevelData

  beforeEach(() => {
    testLevelData = {
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
      target: { x: 8, y: 6, direction: DIRECTIONS.W },
      metadata: { name: 'Test Level', difficulty: 'easy', maxMirrors: 3 }
    }
  })

  describe('Constructor', () => {
    it('should create a level with valid data', () => {
      const level = new Level(testLevelData)
      expect(level.width).toBe(10)
      expect(level.height).toBe(8)
      expect(level.metadata.name).toBe('Test Level')
    })

    it('should throw error on invalid data', () => {
      expect(() => {
        new Level(null)
      }).toThrow('Invalid mapData')
    })
  })

  describe('Position Validation', () => {
    let level

    beforeEach(() => {
      level = new Level(testLevelData)
    })

    it('should validate positions within bounds', () => {
      expect(level.isValidPosition(0, 0)).toBe(true)
      expect(level.isValidPosition(9, 7)).toBe(true)
      expect(level.isValidPosition(5, 4)).toBe(true)
    })

    it('should reject positions out of bounds', () => {
      expect(level.isValidPosition(-1, 0)).toBe(false)
      expect(level.isValidPosition(10, 0)).toBe(false)
      expect(level.isValidPosition(0, -1)).toBe(false)
      expect(level.isValidPosition(0, 8)).toBe(false)
    })
  })

  describe('Cell Access', () => {
    let level

    beforeEach(() => {
      level = new Level(testLevelData)
    })

    it('should get cell type correctly', () => {
      expect(level.getCellType(0, 0)).toBe(CELL_TYPES.WALL)
      expect(level.getCellType(1, 1)).toBe(CELL_TYPES.EMPTY)
    })

    it('should return null for out of bounds', () => {
      expect(level.getCellType(-1, 0)).toBeNull()
      expect(level.getCellType(10, 0)).toBeNull()
    })

    it('should identify empty cells', () => {
      expect(level.isEmptyCell(1, 1)).toBe(true)
      expect(level.isEmptyCell(5, 5)).toBe(true)
      expect(level.isEmptyCell(0, 0)).toBe(false)
    })

    it('should identify walls', () => {
      expect(level.isWall(0, 0)).toBe(true)
      expect(level.isWall(1, 1)).toBe(false)
    })
  })

  describe('Lamp and Target', () => {
    let level

    beforeEach(() => {
      level = new Level(testLevelData)
    })

    it('should store lamp position and direction', () => {
      expect(level.lamp.x).toBe(1)
      expect(level.lamp.y).toBe(1)
      expect(level.lamp.direction).toBe(DIRECTIONS.E)
    })

    it('should store target position and direction', () => {
      expect(level.target.x).toBe(8)
      expect(level.target.y).toBe(6)
      expect(level.target.direction).toBe(DIRECTIONS.W)
    })
  })

  describe('Validation Errors', () => {
    it('should throw error on invalid lamp position', () => {
      const badData = { ...testLevelData, lamp: { x: 100, y: 100, direction: DIRECTIONS.E } }
      expect(() => new Level(badData)).toThrow('Invalid lamp position')
    })

    it('should throw error on invalid target position', () => {
      const badData = { ...testLevelData, target: { x: 100, y: 100, direction: DIRECTIONS.W } }
      expect(() => new Level(badData)).toThrow('Invalid target position')
    })

    it('should throw error on invalid direction', () => {
      const badData = { ...testLevelData, lamp: { x: 1, y: 1, direction: 'INVALID' } }
      expect(() => new Level(badData)).toThrow('Invalid lamp direction')
    })
  })
})
