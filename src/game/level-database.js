/**
 * @fileoverview Level database with predefined puzzle levels
 * @module game/level-database
 */

import { DIRECTIONS, CELL_TYPES } from '../utils/constants.js'

/**
 * Level database with all available puzzle levels
 */
export const LEVEL_DATABASE = {
  'tutorial-1': {
    id: 'tutorial-1',
    name: 'Tutorial: The Basics',
    description: 'Learn how to place a single mirror to reach the target',
    difficulty: 'easy',
    maxMirrors: 1,
    width: 20,
    height: 15,
    lamp: { x: 2, y: 7, direction: DIRECTIONS.E },
    target: { x: 17, y: 7, direction: DIRECTIONS.W },
    walls: [
      // Border
      ...[...Array(20)].map((_, i) => ({ x: i, y: 0 })),
      ...[...Array(20)].map((_, i) => ({ x: i, y: 14 })),
      ...[...Array(15)].map((_, i) => ({ x: 0, y: i })),
      ...[...Array(15)].map((_, i) => ({ x: 19, y: i }))
    ],
    hints: 'Place one / mirror to redirect the light to the target'
  },

  'reflection-1': {
    id: 'reflection-1',
    name: 'Simple Reflection',
    description: 'One mirror is not enough - use two mirrors',
    difficulty: 'easy',
    maxMirrors: 2,
    width: 20,
    height: 15,
    lamp: { x: 2, y: 7, direction: DIRECTIONS.E },
    target: { x: 2, y: 12, direction: DIRECTIONS.N },
    walls: [
      // Border
      ...[...Array(20)].map((_, i) => ({ x: i, y: 0 })),
      ...[...Array(20)].map((_, i) => ({ x: i, y: 14 })),
      ...[...Array(15)].map((_, i) => ({ x: 0, y: i })),
      ...[...Array(15)].map((_, i) => ({ x: 19, y: i }))
    ],
    hints: 'Place mirrors to redirect light down and then left'
  },

  'maze-1': {
    id: 'maze-1',
    name: 'Light Maze',
    description: 'Navigate the light through the maze',
    difficulty: 'normal',
    maxMirrors: 4,
    width: 20,
    height: 15,
    lamp: { x: 2, y: 2, direction: DIRECTIONS.E },
    target: { x: 17, y: 12, direction: DIRECTIONS.W },
    walls: [
      // Border
      ...[...Array(20)].map((_, i) => ({ x: i, y: 0 })),
      ...[...Array(20)].map((_, i) => ({ x: i, y: 14 })),
      ...[...Array(15)].map((_, i) => ({ x: 0, y: i })),
      ...[...Array(15)].map((_, i) => ({ x: 19, y: i })),
      // Internal walls creating maze structure
      ...Array.from({ length: 6 }, (_, i) => ({ x: 5, y: 3 + i })),
      ...Array.from({ length: 5 }, (_, i) => ({ x: 10, y: 2 + i })),
      ...Array.from({ length: 4 }, (_, i) => ({ x: 15, y: 4 + i }))
    ],
    hints: 'Use mirrors to navigate around the obstacles'
  },

  'double-path': {
    id: 'double-path',
    name: 'Double Path',
    description: 'Split the light into multiple paths',
    difficulty: 'normal',
    maxMirrors: 5,
    width: 20,
    height: 15,
    lamp: { x: 10, y: 7, direction: DIRECTIONS.N },
    target: { x: 5, y: 3, direction: DIRECTIONS.S },
    walls: [
      // Border
      ...[...Array(20)].map((_, i) => ({ x: i, y: 0 })),
      ...[...Array(20)].map((_, i) => ({ x: i, y: 14 })),
      ...[...Array(15)].map((_, i) => ({ x: 0, y: i })),
      ...[...Array(15)].map((_, i) => ({ x: 19, y: i })),
      // Obstacle in the middle
      ...Array.from({ length: 3 }, (_, i) => ({ x: 10, y: 3 + i }))
    ],
    hints: 'Can you create a path around the central obstacle?'
  },

  'mirror-complex': {
    id: 'mirror-complex',
    name: 'Mirror Complex',
    description: 'A complex puzzle requiring strategic mirror placement',
    difficulty: 'hard',
    maxMirrors: 5,
    width: 20,
    height: 15,
    lamp: { x: 2, y: 2, direction: DIRECTIONS.E },
    target: { x: 17, y: 2, direction: DIRECTIONS.W },
    walls: [
      // Border
      ...[...Array(20)].map((_, i) => ({ x: i, y: 0 })),
      ...[...Array(20)].map((_, i) => ({ x: i, y: 14 })),
      ...[...Array(15)].map((_, i) => ({ x: 0, y: i })),
      ...[...Array(15)].map((_, i) => ({ x: 19, y: i })),
      // Complex internal structure
      ...Array.from({ length: 5 }, (_, i) => ({ x: 5 + i, y: 5 })),
      ...Array.from({ length: 5 }, (_, i) => ({ x: 12, y: 3 + i })),
      ...Array.from({ length: 4 }, (_, i) => ({ x: 8 + i, y: 10 }))
    ],
    hints: 'Think several moves ahead to solve this puzzle'
  },

  'expert-challenge': {
    id: 'expert-challenge',
    name: 'Expert Challenge',
    description: 'The ultimate test of mirror mastery',
    difficulty: 'hard',
    maxMirrors: 6,
    width: 20,
    height: 15,
    lamp: { x: 2, y: 7, direction: DIRECTIONS.E },
    target: { x: 17, y: 10, direction: DIRECTIONS.W },
    walls: [
      // Border
      ...[...Array(20)].map((_, i) => ({ x: i, y: 0 })),
      ...[...Array(20)].map((_, i) => ({ x: i, y: 14 })),
      ...[...Array(15)].map((_, i) => ({ x: 0, y: i })),
      ...[...Array(15)].map((_, i) => ({ x: 19, y: i })),
      // Challenging maze
      ...Array.from({ length: 7 }, (_, i) => ({ x: 5, y: 2 + i })),
      ...Array.from({ length: 6 }, (_, i) => ({ x: 10, y: 4 + i })),
      ...Array.from({ length: 5 }, (_, i) => ({ x: 15, y: 2 + i }))
    ],
    hints: 'This requires creative thinking and multiple reflections'
  }
}

/**
 * Get level by ID
 * @param {string} levelId - Level ID
 * @returns {Object|null} Level data or null if not found
 */
export function getLevelData(levelId) {
  return LEVEL_DATABASE[levelId] || null
}

/**
 * Get all levels
 * @returns {Array} Array of all levels
 */
export function getAllLevels() {
  return Object.values(LEVEL_DATABASE)
}

/**
 * Get levels by difficulty
 * @param {string} difficulty - Difficulty level
 * @returns {Array} Levels with given difficulty
 */
export function getLevelsByDifficulty(difficulty) {
  return Object.values(LEVEL_DATABASE).filter((level) => level.difficulty === difficulty)
}

/**
 * Check if level is unlocked
 * @param {string} levelId - Level ID
 * @param {Array} completedLevels - Array of completed level IDs
 * @returns {boolean} Whether level is unlocked
 */
export function isLevelUnlocked(levelId, completedLevels = []) {
  const allLevels = Object.keys(LEVEL_DATABASE)
  const levelIndex = allLevels.indexOf(levelId)

  // First level is always unlocked
  if (levelIndex === 0) return true

  // Unlock if previous level is completed
  const previousLevelId = allLevels[levelIndex - 1]
  return completedLevels.includes(previousLevelId)
}
