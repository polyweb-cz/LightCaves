/**
 * @fileoverview Level definitions
 * @module data/levels
 *
 * NOTE: This file is generated from TXT level files during build
 * Do not edit manually
 */

export const LEVELS = [
  // Tutorial 1-5 (empty, will be populated in Epic 5)
  // Standard 6-20 (empty, will be populated in Epic 5)
]

export const getTotalLevelCount = () => LEVELS.length

export const getLevel = (levelIndex) => {
  if (levelIndex < 0 || levelIndex >= LEVELS.length) {
    console.error('[LevelLoader] Invalid level index:', levelIndex)
    return null
  }
  return LEVELS[levelIndex]
}
