/**
 * @fileoverview localStorage wrapper for persistent data storage
 * @module utils/storage
 */

const STORAGE_KEY = 'lightcaves_save'
const LANGUAGE_KEY = 'lightcaves_language'
const DEFAULT_LANGUAGE = 'cs'

/**
 * StorageManager - handles localStorage operations with error handling
 * @class StorageManager
 */
export class StorageManager {
  /**
   * Check if localStorage is available
   * @returns {boolean}
   */
  static isAvailable() {
    try {
      const test = '__test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch (error) {
      console.warn('[Storage] localStorage not available:', error.message)
      return false
    }
  }

  /**
   * Save progress
   * @param {Object} progressData - Player progress data
   * @returns {boolean} True if saved successfully
   */
  static saveProgress(progressData) {
    if (!StorageManager.isAvailable()) {
      console.warn('[Storage] Cannot save progress - localStorage unavailable')
      return false
    }

    try {
      const data = {
        version: '1.0',
        ...progressData,
        timestamp: Date.now()
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      console.log('[Storage] Progress saved', data)
      return true
    } catch (error) {
      console.error('[Storage] Failed to save progress:', error.message)
      return false
    }
  }

  /**
   * Load progress
   * @returns {Object|null} Saved progress or null if not found/invalid
   */
  static loadProgress() {
    if (!StorageManager.isAvailable()) {
      console.warn('[Storage] Cannot load progress - localStorage unavailable')
      return null
    }

    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (!data) {
        console.log('[Storage] No progress found')
        return null
      }

      const parsed = JSON.parse(data)
      console.log('[Storage] Progress loaded', parsed)
      return parsed
    } catch (error) {
      console.error('[Storage] Failed to load progress:', error.message)
      return null
    }
  }

  /**
   * Clear all progress
   * @returns {boolean} True if cleared successfully
   */
  static clearProgress() {
    if (!StorageManager.isAvailable()) {
      console.warn('[Storage] Cannot clear progress - localStorage unavailable')
      return false
    }

    try {
      localStorage.removeItem(STORAGE_KEY)
      console.log('[Storage] Progress cleared')
      return true
    } catch (error) {
      console.error('[Storage] Failed to clear progress:', error.message)
      return false
    }
  }

  /**
   * Set language preference
   * @param {string} language - Language code (e.g., 'cs', 'en')
   * @returns {boolean} True if saved successfully
   */
  static setLanguage(language) {
    if (!StorageManager.isAvailable()) {
      console.warn('[Storage] Cannot save language - localStorage unavailable')
      return false
    }

    try {
      localStorage.setItem(LANGUAGE_KEY, language)
      console.log('[Storage] Language set to:', language)
      return true
    } catch (error) {
      console.error('[Storage] Failed to save language:', error.message)
      return false
    }
  }

  /**
   * Get language preference
   * @returns {string} Language code or default
   */
  static getLanguage() {
    if (!StorageManager.isAvailable()) {
      return DEFAULT_LANGUAGE
    }

    try {
      const language = localStorage.getItem(LANGUAGE_KEY)
      return language || DEFAULT_LANGUAGE
    } catch (error) {
      console.error('[Storage] Failed to get language:', error.message)
      return DEFAULT_LANGUAGE
    }
  }
}
