/**
 * @fileoverview Unit tests for GameState class
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { GameState } from '../game-state.js'
import { Level } from '../level.js'
import { CELL_TYPES, DIRECTIONS } from '../../utils/constants.js'

describe('GameState', () => {
  let testLevel
  let gameState

  beforeEach(() => {
    // Create a test level
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
    gameState = new GameState(testLevel)
  })

  describe('Constructor', () => {
    it('should create game state with valid level', () => {
      expect(gameState.level).toBe(testLevel)
      expect(gameState.mirrors).toEqual({})
      expect(gameState.isComplete).toBe(false)
    })

    it('should throw error on null level', () => {
      expect(() => new GameState(null)).toThrow('Invalid level')
    })

    it('should throw error on undefined level', () => {
      expect(() => new GameState(undefined)).toThrow('Invalid level')
    })
  })

  describe('Mirror Management', () => {
    it('should add mirror successfully', () => {
      const result = gameState.addMirror(3, 3, '/')
      expect(result).toBe(true)
      expect(gameState.getMirrorCount()).toBe(1)
    })

    it('should add multiple mirrors', () => {
      gameState.addMirror(3, 3, '/')
      gameState.addMirror(5, 5, '\\')
      gameState.addMirror(2, 4, '/')

      expect(gameState.getMirrorCount()).toBe(3)
    })

    it('should not exceed max mirrors', () => {
      gameState.addMirror(3, 3, '/')
      gameState.addMirror(5, 5, '\\')
      gameState.addMirror(2, 4, '/')
      const result = gameState.addMirror(7, 7, '\\')

      expect(result).toBe(false)
      expect(gameState.getMirrorCount()).toBe(3)
    })

    it('should remove mirror successfully', () => {
      gameState.addMirror(3, 3, '/')
      expect(gameState.getMirrorCount()).toBe(1)

      const result = gameState.removeMirror(3, 3)
      expect(result).toBe(true)
      expect(gameState.getMirrorCount()).toBe(0)
    })

    it('should return false when removing non-existent mirror', () => {
      const result = gameState.removeMirror(3, 3)
      expect(result).toBe(false)
    })

    it('should get mirror at position', () => {
      gameState.addMirror(3, 3, '/')
      const mirror = gameState.getMirror(3, 3)

      expect(mirror).toBeDefined()
      expect(mirror.type).toBe('/')
      expect(mirror.x).toBe(3)
      expect(mirror.y).toBe(3)
    })

    it('should return null for non-existent mirror', () => {
      const mirror = gameState.getMirror(3, 3)
      expect(mirror).toBeNull()
    })

    it('should not add mirror on wall', () => {
      const result = gameState.addMirror(0, 0, '/') // Wall position
      expect(result).toBe(false)
    })

    it('should not add mirror with invalid type', () => {
      const result = gameState.addMirror(3, 3, 'X')
      expect(result).toBe(false)
    })

    it('should not add mirror with invalid coordinates', () => {
      const result = gameState.addMirror(999, 999, '/')
      expect(result).toBe(false)
    })

    it('should clear all mirrors', () => {
      gameState.addMirror(3, 3, '/')
      gameState.addMirror(5, 5, '\\')
      expect(gameState.getMirrorCount()).toBe(2)

      gameState.clearMirrors()
      expect(gameState.getMirrorCount()).toBe(0)
    })
  })

  describe('Completion Status', () => {
    it('should update completion status', () => {
      expect(gameState.isComplete).toBe(false)

      gameState.updateCompletion(true)
      expect(gameState.isComplete).toBe(true)

      gameState.updateCompletion(false)
      expect(gameState.isComplete).toBe(false)
    })
  })

  describe('Mirror Counting', () => {
    it('should return correct mirror count', () => {
      expect(gameState.getMirrorCount()).toBe(0)

      gameState.addMirror(3, 3, '/')
      expect(gameState.getMirrorCount()).toBe(1)

      gameState.addMirror(5, 5, '\\')
      expect(gameState.getMirrorCount()).toBe(2)
    })

    it('should return max mirrors', () => {
      expect(gameState.getMaxMirrors()).toBe(3)
    })

    it('should return remaining mirrors', () => {
      expect(gameState.getRemainingMirrors()).toBe(3)

      gameState.addMirror(3, 3, '/')
      expect(gameState.getRemainingMirrors()).toBe(2)

      gameState.addMirror(5, 5, '\\')
      expect(gameState.getRemainingMirrors()).toBe(1)

      gameState.addMirror(2, 4, '/')
      expect(gameState.getRemainingMirrors()).toBe(0)
    })
  })

  describe('Mirror Access', () => {
    it('should get all mirrors', () => {
      gameState.addMirror(3, 3, '/')
      gameState.addMirror(5, 5, '\\')

      const mirrors = gameState.getMirrors()
      expect(Object.keys(mirrors).length).toBe(2)
      expect(mirrors['3,3'].type).toBe('/')
      expect(mirrors['5,5'].type).toBe('\\')
    })

    it('should return copy of mirrors object', () => {
      gameState.addMirror(3, 3, '/')
      const mirrors1 = gameState.getMirrors()
      const mirrors2 = gameState.getMirrors()

      expect(mirrors1).toEqual(mirrors2)
      expect(mirrors1).not.toBe(mirrors2) // Different objects
    })
  })

  describe('Reset', () => {
    it('should reset to initial state', () => {
      gameState.addMirror(3, 3, '/')
      gameState.updateCompletion(true)

      expect(gameState.getMirrorCount()).toBe(1)
      expect(gameState.isComplete).toBe(true)

      gameState.reset()

      expect(gameState.getMirrorCount()).toBe(0)
      expect(gameState.isComplete).toBe(false)
    })
  })

  describe('String Representation', () => {
    it('should generate info string', () => {
      const str = gameState.toString()
      expect(str).toContain('GameState')
      expect(str).toContain('mirrors')
    })
  })
})
