/**
 * @fileoverview Tests for level database system
 * @module game/__tests__/level-database.test.js
 */

import { describe, it, expect } from 'vitest'
import { LEVEL_DATABASE, getLevelData, getAllLevels, getLevelsByDifficulty, isLevelUnlocked } from '../level-database.js'

describe('LevelDatabase', () => {
  describe('Level Data Structure', () => {
    it('should have at least 6 levels', () => {
      const levels = getAllLevels()
      expect(levels.length).toBeGreaterThanOrEqual(6)
    })

    it('should have tutorial-1 level', () => {
      const level = getLevelData('tutorial-1')
      expect(level).toBeDefined()
      expect(level.id).toBe('tutorial-1')
    })

    it('should have all required level properties', () => {
      const level = getLevelData('tutorial-1')
      expect(level.id).toBeDefined()
      expect(level.name).toBeDefined()
      expect(level.description).toBeDefined()
      expect(level.difficulty).toBeDefined()
      expect(level.maxMirrors).toBeDefined()
      expect(level.width).toBeDefined()
      expect(level.height).toBeDefined()
      expect(level.lamp).toBeDefined()
      expect(level.target).toBeDefined()
      expect(level.walls).toBeDefined()
    })

    it('should have valid lamp position', () => {
      const level = getLevelData('tutorial-1')
      expect(level.lamp.x).toBeGreaterThanOrEqual(0)
      expect(level.lamp.y).toBeGreaterThanOrEqual(0)
      expect(level.lamp.direction).toBeDefined()
    })

    it('should have valid target position', () => {
      const level = getLevelData('tutorial-1')
      expect(level.target.x).toBeGreaterThanOrEqual(0)
      expect(level.target.y).toBeGreaterThanOrEqual(0)
      expect(level.target.direction).toBeDefined()
    })
  })

  describe('Level Retrieval', () => {
    it('should get level by ID', () => {
      const level = getLevelData('tutorial-1')
      expect(level).toBeDefined()
      expect(level.name).toBe('Tutorial: The Basics')
    })

    it('should return null for non-existent level', () => {
      const level = getLevelData('non-existent')
      expect(level).toBeNull()
    })

    it('should get all levels', () => {
      const levels = getAllLevels()
      expect(Array.isArray(levels)).toBe(true)
      expect(levels.length).toBeGreaterThan(0)
    })

    it('should get levels by difficulty', () => {
      const easyLevels = getLevelsByDifficulty('easy')
      expect(Array.isArray(easyLevels)).toBe(true)
      expect(easyLevels.length).toBeGreaterThan(0)
      expect(easyLevels.every((l) => l.difficulty === 'easy')).toBe(true)
    })

    it('should get normal difficulty levels', () => {
      const normalLevels = getLevelsByDifficulty('normal')
      expect(normalLevels.length).toBeGreaterThan(0)
    })

    it('should get hard difficulty levels', () => {
      const hardLevels = getLevelsByDifficulty('hard')
      expect(hardLevels.length).toBeGreaterThan(0)
    })
  })

  describe('Level Progression', () => {
    it('should have first level always unlocked', () => {
      const unlocked = isLevelUnlocked('tutorial-1', [])
      expect(unlocked).toBe(true)
    })

    it('should unlock second level after first is completed', () => {
      const unlocked = isLevelUnlocked('reflection-1', ['tutorial-1'])
      expect(unlocked).toBe(true)
    })

    it('should not unlock level without previous completion', () => {
      const unlocked = isLevelUnlocked('reflection-1', [])
      expect(unlocked).toBe(false)
    })

    it('should handle progression chain correctly', () => {
      const levels = Object.keys(LEVEL_DATABASE)

      // First level should be unlocked
      expect(isLevelUnlocked(levels[0], [])).toBe(true)

      // Second level should not be unlocked without progress
      expect(isLevelUnlocked(levels[1], [])).toBe(false)

      // Second level should be unlocked after first completion
      expect(isLevelUnlocked(levels[1], [levels[0]])).toBe(true)
    })
  })

  describe('Level Metadata', () => {
    it('should have unique IDs', () => {
      const levels = getAllLevels()
      const ids = levels.map((l) => l.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should have reasonable mirror limits', () => {
      const levels = getAllLevels()
      levels.forEach((level) => {
        expect(level.maxMirrors).toBeGreaterThan(0)
        expect(level.maxMirrors).toBeLessThanOrEqual(10)
      })
    })

    it('should have valid grid dimensions', () => {
      const levels = getAllLevels()
      levels.forEach((level) => {
        expect(level.width).toBeGreaterThan(10)
        expect(level.height).toBeGreaterThan(10)
        expect(level.width).toBeLessThanOrEqual(30)
        expect(level.height).toBeLessThanOrEqual(20)
      })
    })

    it('should have descriptions', () => {
      const levels = getAllLevels()
      levels.forEach((level) => {
        expect(level.description.length).toBeGreaterThan(0)
      })
    })

    it('should have hints', () => {
      const levels = getAllLevels()
      levels.forEach((level) => {
        expect(level.hints).toBeDefined()
        expect(level.hints.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Wall Configuration', () => {
    it('should have walls array for each level', () => {
      const levels = getAllLevels()
      levels.forEach((level) => {
        expect(Array.isArray(level.walls)).toBe(true)
        expect(level.walls.length).toBeGreaterThan(0)
      })
    })

    it('should have valid wall positions', () => {
      const level = getLevelData('tutorial-1')
      level.walls.forEach((wall) => {
        expect(wall.x).toBeGreaterThanOrEqual(0)
        expect(wall.x).toBeLessThan(level.width)
        expect(wall.y).toBeGreaterThanOrEqual(0)
        expect(wall.y).toBeLessThan(level.height)
      })
    })

    it('should have border walls', () => {
      const level = getLevelData('tutorial-1')
      const topBorder = level.walls.filter((w) => w.y === 0)
      const bottomBorder = level.walls.filter((w) => w.y === level.height - 1)
      const leftBorder = level.walls.filter((w) => w.x === 0)
      const rightBorder = level.walls.filter((w) => w.x === level.width - 1)

      expect(topBorder.length).toBeGreaterThan(0)
      expect(bottomBorder.length).toBeGreaterThan(0)
      expect(leftBorder.length).toBeGreaterThan(0)
      expect(rightBorder.length).toBeGreaterThan(0)
    })
  })

  describe('Difficulty Levels', () => {
    it('should have consistent difficulty progression', () => {
      const easyLevels = getLevelsByDifficulty('easy')
      const normalLevels = getLevelsByDifficulty('normal')
      const hardLevels = getLevelsByDifficulty('hard')

      // Easy levels should require fewer mirrors
      const avgEasyMirrors =
        easyLevels.reduce((sum, l) => sum + l.maxMirrors, 0) / easyLevels.length
      const avgNormalMirrors =
        normalLevels.reduce((sum, l) => sum + l.maxMirrors, 0) / normalLevels.length
      const avgHardMirrors = hardLevels.reduce((sum, l) => sum + l.maxMirrors, 0) / hardLevels.length

      expect(avgEasyMirrors).toBeLessThanOrEqual(avgNormalMirrors)
      expect(avgNormalMirrors).toBeLessThanOrEqual(avgHardMirrors)
    })

    it('should have valid difficulty values', () => {
      const levels = getAllLevels()
      const validDifficulties = ['easy', 'normal', 'hard', 'expert']
      levels.forEach((level) => {
        expect(validDifficulties).toContain(level.difficulty)
      })
    })
  })

  describe('Level Specifications', () => {
    it('should have all required level IDs', () => {
      const requiredIds = ['tutorial-1', 'reflection-1', 'maze-1', 'double-path', 'mirror-complex', 'expert-challenge']
      requiredIds.forEach((id) => {
        expect(getLevelData(id)).toBeDefined()
      })
    })

    it('tutorial-1 should be beginner friendly', () => {
      const level = getLevelData('tutorial-1')
      expect(level.maxMirrors).toBeLessThanOrEqual(1)
      expect(level.difficulty).toBe('easy')
    })

    it('should progress from easy to hard', () => {
      const levels = Object.keys(LEVEL_DATABASE).map((id) => getLevelData(id))
      let currentDifficulty = 0
      const difficultyOrder = { easy: 0, normal: 1, hard: 2, expert: 3 }

      // Check general trend
      let transitionCount = 0
      for (let i = 1; i < levels.length; i++) {
        const prevDiff = difficultyOrder[levels[i - 1].difficulty]
        const currDiff = difficultyOrder[levels[i].difficulty]
        if (currDiff > prevDiff) transitionCount++
      }

      // Should have at least one difficulty transition
      expect(transitionCount).toBeGreaterThan(0)
    })
  })
})
