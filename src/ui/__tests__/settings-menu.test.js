/**
 * @fileoverview Tests for SettingsMenu component
 * @module ui/__tests__/settings-menu.test.js
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { SettingsMenu } from '../settings-menu.js'
import { COLORS } from '../../utils/constants.js'

describe('SettingsMenu', () => {
  let settings
  let renderer
  let uiRoot

  beforeEach(() => {
    renderer = {
      clear: vi.fn(),
      drawRect: vi.fn(),
      drawText: vi.fn(),
    }

    uiRoot = document.createElement('div')
    uiRoot.id = 'ui-root'
    document.body.appendChild(uiRoot)

    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    }
    global.localStorage = localStorageMock

    settings = new SettingsMenu(renderer, uiRoot)
  })

  afterEach(() => {
    if (settings) {
      settings.destroy()
    }
    if (uiRoot && uiRoot.parentNode) {
      uiRoot.parentNode.removeChild(uiRoot)
    }
  })

  describe('Constructor', () => {
    it('should create settings menu with valid inputs', () => {
      expect(settings).toBeDefined()
      expect(settings.isVisible).toBe(false)
      expect(settings.settings).toBeDefined()
    })

    it('should throw error on null renderer', () => {
      expect(() => {
        new SettingsMenu(null, uiRoot)
      }).toThrow('Invalid renderer')
    })

    it('should throw error on null UI root', () => {
      expect(() => {
        new SettingsMenu(renderer, null)
      }).toThrow('Invalid UI root')
    })

    it('should initialize with default settings', () => {
      expect(settings.settings.soundEnabled).toBe(true)
      expect(settings.settings.volume).toBe(75)
      expect(settings.settings.fpsLimit).toBe(60)
      expect(settings.settings.graphicsQuality).toBe('high')
      expect(settings.settings.defaultDifficulty).toBe('normal')
    })
  })

  describe('Settings Display', () => {
    it('should show settings menu', () => {
      settings.show()

      expect(settings.isVisible).toBe(true)
      expect(settings.settingsElement).toBeDefined()
      expect(uiRoot.querySelector('#settings-menu')).toBeDefined()
    })

    it('should hide settings menu', () => {
      settings.show()
      expect(settings.isVisible).toBe(true)

      settings.hide()
      expect(settings.isVisible).toBe(false)
      expect(settings.settingsElement).toBeNull()
    })

    it('should create menu sections', () => {
      settings.show()

      const content = uiRoot.querySelector('#settings-content')
      expect(content).toBeDefined()
      expect(content.children.length).toBeGreaterThan(0)
    })

    it('should display all setting sections', () => {
      settings.show()

      const text = uiRoot.textContent
      expect(text).toContain('Audio Settings')
      expect(text).toContain('Graphics Settings')
      expect(text).toContain('Difficulty Settings')
      expect(text).toContain('Controls')
    })
  })

  describe('Settings Management', () => {
    it('should get setting value', () => {
      expect(settings.getSetting('volume')).toBe(75)
      expect(settings.getSetting('fpsLimit')).toBe(60)
    })

    it('should set setting value', () => {
      settings.setSetting('volume', 50)
      expect(settings.getSetting('volume')).toBe(50)

      settings.setSetting('fpsLimit', 120)
      expect(settings.getSetting('fpsLimit')).toBe(120)
    })

    it('should not set invalid setting key', () => {
      const initial = settings.getSetting('volume')
      settings.setSetting('invalidKey', 999)

      expect(settings.getSetting('volume')).toBe(initial)
    })

    it('should toggle sound enabled', () => {
      settings.show()
      const initial = settings.getSetting('soundEnabled')

      settings.setSetting('soundEnabled', !initial)
      expect(settings.getSetting('soundEnabled')).toBe(!initial)
    })
  })

  describe('Audio Settings', () => {
    beforeEach(() => {
      settings.show()
    })

    it('should have sound toggle', () => {
      const toggle = uiRoot.querySelector('#sound-toggle')
      expect(toggle).toBeDefined()
      expect(toggle.type).toBe('checkbox')
    })

    it('should have volume slider', () => {
      const slider = uiRoot.querySelector('#volume-slider')
      expect(slider).toBeDefined()
      expect(slider.type).toBe('range')
      expect(slider.min).toBe('0')
      expect(slider.max).toBe('100')
    })

    it('should update volume when slider changes', () => {
      const slider = uiRoot.querySelector('#volume-slider')
      slider.value = 50
      slider.dispatchEvent(new Event('input'))

      expect(settings.getSetting('volume')).toBe(50)
    })

    it('should update sound setting when toggle changes', () => {
      const toggle = uiRoot.querySelector('#sound-toggle')
      toggle.checked = false
      toggle.dispatchEvent(new Event('change'))

      expect(settings.getSetting('soundEnabled')).toBe(false)
    })
  })

  describe('Graphics Settings', () => {
    beforeEach(() => {
      settings.show()
    })

    it('should have FPS limit slider', () => {
      const slider = uiRoot.querySelector('#fps-slider')
      expect(slider).toBeDefined()
      expect(slider.min).toBe('30')
      expect(slider.max).toBe('144')
    })

    it('should have graphics quality select', () => {
      const select = uiRoot.querySelector('#quality-select')
      expect(select).toBeDefined()
      expect(select.options.length).toBe(3)
    })

    it('should change FPS limit via slider', () => {
      const slider = uiRoot.querySelector('#fps-slider')
      slider.value = 100
      slider.dispatchEvent(new Event('input'))

      expect(settings.getSetting('fpsLimit')).toBe(100)
    })

    it('should change graphics quality via select', () => {
      const select = uiRoot.querySelector('#quality-select')
      select.value = 'low'
      select.dispatchEvent(new Event('change'))

      expect(settings.getSetting('graphicsQuality')).toBe('low')
    })
  })

  describe('Difficulty Settings', () => {
    beforeEach(() => {
      settings.show()
    })

    it('should have difficulty select', () => {
      const select = uiRoot.querySelector('#difficulty-select')
      expect(select).toBeDefined()
      expect(select.options.length).toBe(4)
    })

    it('should change default difficulty', () => {
      const select = uiRoot.querySelector('#difficulty-select')
      select.value = 'hard'
      select.dispatchEvent(new Event('change'))

      expect(settings.getSetting('defaultDifficulty')).toBe('hard')
    })

    it('should have all difficulty options', () => {
      const select = uiRoot.querySelector('#difficulty-select')
      const options = Array.from(select.options).map((o) => o.value)

      expect(options).toContain('easy')
      expect(options).toContain('normal')
      expect(options).toContain('hard')
      expect(options).toContain('expert')
    })
  })

  describe('Storage', () => {
    it('should load settings from storage', () => {
      const storedSettings = {
        soundEnabled: false,
        volume: 80,
        fpsLimit: 120,
      }
      global.localStorage.getItem.mockReturnValue(JSON.stringify(storedSettings))

      const newSettings = new SettingsMenu(renderer, uiRoot)
      newSettings.loadSettings()

      expect(newSettings.getSetting('soundEnabled')).toBe(false)
      expect(newSettings.getSetting('volume')).toBe(80)
      expect(newSettings.getSetting('fpsLimit')).toBe(120)

      newSettings.destroy()
    })

    it('should save settings to storage', () => {
      settings.settings.volume = 60
      settings.saveSettings()

      expect(global.localStorage.setItem).toHaveBeenCalledWith(
        'lightcaves_settings',
        expect.any(String)
      )
    })

    it('should handle storage errors gracefully', () => {
      global.localStorage.getItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      expect(() => {
        settings.loadSettings()
      }).not.toThrow()
    })
  })

  describe('Reset Settings', () => {
    beforeEach(() => {
      settings.show()
      global.confirm = vi.fn().mockReturnValue(true)
    })

    it('should reset all settings to defaults', () => {
      settings.settings.volume = 20
      settings.settings.fpsLimit = 30
      settings.settings.graphicsQuality = 'low'

      settings.resetSettings()

      expect(settings.getSetting('volume')).toBe(75)
      expect(settings.getSetting('fpsLimit')).toBe(60)
      expect(settings.getSetting('graphicsQuality')).toBe('high')
    })

    it('should ask for confirmation before reset', () => {
      settings.resetSettings()
      expect(global.confirm).toHaveBeenCalled()
    })

    it('should not reset if confirmation is cancelled', () => {
      global.confirm.mockReturnValue(false)
      settings.settings.volume = 20

      settings.resetSettings()

      expect(settings.getSetting('volume')).toBe(20)
    })
  })

  describe('Keyboard Navigation', () => {
    beforeEach(() => {
      settings.show()
    })

    it('should close menu with Escape key', () => {
      expect(settings.isVisible).toBe(true)

      const event = new KeyboardEvent('keydown', { key: 'Escape' })
      document.dispatchEvent(event)

      expect(settings.isVisible).toBe(false)
    })

    it('should ignore other keys', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
      document.dispatchEvent(event)

      expect(settings.isVisible).toBe(true)
    })
  })

  describe('Lifecycle', () => {
    it('should destroy settings properly', () => {
      settings.show()
      expect(settings.isVisible).toBe(true)

      settings.destroy()
      expect(settings.isVisible).toBe(false)
      expect(settings.settingsElement).toBeNull()
    })

    it('should remove event listeners on destroy', () => {
      settings.show()
      settings.destroy()

      const event = new KeyboardEvent('keydown', { key: 'Escape' })
      document.dispatchEvent(event)

      // Should not throw and isVisible should remain false
      expect(settings.isVisible).toBe(false)
    })

    it('should not show twice', () => {
      settings.show()
      const firstElement = settings.settingsElement

      settings.show()
      expect(settings.settingsElement).toBe(firstElement)
    })
  })

  describe('UI State Management', () => {
    it('should update UI when settings change', () => {
      settings.show()

      settings.setSetting('volume', 40)
      const slider = uiRoot.querySelector('#volume-slider')

      expect(slider.value).toBe('40')
    })

    it('should reflect all settings in UI', () => {
      settings.show()

      const soundToggle = uiRoot.querySelector('#sound-toggle')
      const volumeSlider = uiRoot.querySelector('#volume-slider')
      const fpsSlider = uiRoot.querySelector('#fps-slider')
      const qualitySelect = uiRoot.querySelector('#quality-select')

      expect(soundToggle.checked).toBe(settings.getSetting('soundEnabled'))
      expect(volumeSlider.value).toBe(String(settings.getSetting('volume')))
      expect(fpsSlider.value).toBe(String(settings.getSetting('fpsLimit')))
      expect(qualitySelect.value).toBe(settings.getSetting('graphicsQuality'))
    })
  })

  describe('Controls Display', () => {
    it('should show keyboard controls', () => {
      settings.show()

      const text = uiRoot.textContent
      expect(text).toContain('Arrow Keys')
      expect(text).toContain('Enter')
      expect(text).toContain('Esc')
    })

    it('should show game controls', () => {
      settings.show()

      const text = uiRoot.textContent
      expect(text).toContain('Click')
      expect(text).toContain('Menu Navigation')
      expect(text).toContain('Game Controls')
    })
  })
})
