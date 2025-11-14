/**
 * @fileoverview Unit tests for storage module
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { StorageManager } from '../storage.js'

describe('StorageManager', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('isAvailable()', () => {
    it('should return true if localStorage is available', () => {
      expect(StorageManager.isAvailable()).toBe(true)
    })
  })

  describe('saveProgress()', () => {
    it('should save progress data to localStorage', () => {
      const progressData = {
        completedLevels: [1, 2, 3],
        currentLevel: 4
      }

      const result = StorageManager.saveProgress(progressData)
      expect(result).toBe(true)

      const saved = localStorage.getItem('lightcaves_save')
      expect(saved).not.toBeNull()

      const parsed = JSON.parse(saved)
      expect(parsed.completedLevels).toEqual([1, 2, 3])
      expect(parsed.currentLevel).toBe(4)
      expect(parsed.version).toBe('1.0')
      expect(parsed.timestamp).toBeDefined()
    })

    it('should return false if save fails', () => {
      const progressData = { completedLevels: [1, 2] }

      // Mock isAvailable to return false
      const original = StorageManager.isAvailable
      StorageManager.isAvailable = () => false

      const result = StorageManager.saveProgress(progressData)
      expect(result).toBe(false)

      // Restore original method
      StorageManager.isAvailable = original
    })
  })

  describe('loadProgress()', () => {
    it('should load progress data from localStorage', () => {
      const progressData = {
        completedLevels: [1, 2],
        currentLevel: 3
      }

      StorageManager.saveProgress(progressData)
      const loaded = StorageManager.loadProgress()

      expect(loaded).not.toBeNull()
      expect(loaded.completedLevels).toEqual([1, 2])
      expect(loaded.currentLevel).toBe(3)
      expect(loaded.version).toBe('1.0')
    })

    it('should return null if no progress is saved', () => {
      const loaded = StorageManager.loadProgress()
      expect(loaded).toBeNull()
    })
  })

  describe('clearProgress()', () => {
    it('should clear progress from localStorage', () => {
      const progressData = { completedLevels: [1], currentLevel: 2 }

      StorageManager.saveProgress(progressData)
      expect(StorageManager.loadProgress()).not.toBeNull()

      const result = StorageManager.clearProgress()
      expect(result).toBe(true)
      expect(StorageManager.loadProgress()).toBeNull()
    })
  })

  describe('Language preferences', () => {
    it('should save and get language preference', () => {
      StorageManager.setLanguage('en')
      const lang = StorageManager.getLanguage()
      expect(lang).toBe('en')
    })

    it('should return default language if not set', () => {
      const lang = StorageManager.getLanguage()
      expect(lang).toBe('cs')
    })
  })

  describe('Integration', () => {
    it('should handle multiple saves and loads', () => {
      const data1 = { completedLevels: [1], currentLevel: 2 }
      StorageManager.saveProgress(data1)

      const loaded1 = StorageManager.loadProgress()
      expect(loaded1.completedLevels).toEqual([1])

      const data2 = { completedLevels: [1, 2, 3], currentLevel: 4 }
      StorageManager.saveProgress(data2)

      const loaded2 = StorageManager.loadProgress()
      expect(loaded2.completedLevels).toEqual([1, 2, 3])
      expect(loaded2.currentLevel).toBe(4)
    })
  })
})
