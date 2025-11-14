/**
 * @fileoverview Tests for MainMenu component
 * @module ui/__tests__/main-menu.test.js
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { MainMenu } from '../main-menu.js'
import { COLORS } from '../../utils/constants.js'

describe('MainMenu', () => {
  let menu
  let renderer
  let uiRoot

  beforeEach(() => {
    // Mock renderer
    renderer = {
      clear: vi.fn(),
      drawRect: vi.fn(),
      drawText: vi.fn(),
    }

    // Create mock UI root
    uiRoot = document.createElement('div')
    uiRoot.id = 'ui-root'
    document.body.appendChild(uiRoot)

    menu = new MainMenu(renderer, uiRoot)
  })

  afterEach(() => {
    if (menu) {
      menu.destroy()
    }
    if (uiRoot && uiRoot.parentNode) {
      uiRoot.parentNode.removeChild(uiRoot)
    }
  })

  describe('Constructor', () => {
    it('should create menu with valid inputs', () => {
      expect(menu).toBeDefined()
      expect(menu.isVisible).toBe(false)
      expect(menu.selectedButtonIndex).toBe(0)
    })

    it('should throw error on null renderer', () => {
      expect(() => {
        new MainMenu(null, uiRoot)
      }).toThrow('Invalid renderer')
    })

    it('should throw error on null UI root', () => {
      expect(() => {
        new MainMenu(renderer, null)
      }).toThrow('Invalid UI root')
    })

    it('should initialize with 4 buttons', () => {
      expect(menu.buttons).toHaveLength(4)
      expect(menu.buttons[0].id).toBe('start')
      expect(menu.buttons[1].id).toBe('settings')
      expect(menu.buttons[2].id).toBe('about')
      expect(menu.buttons[3].id).toBe('quit')
    })

    it('should initialize with empty callbacks', () => {
      expect(menu.callbacks.start).toBeNull()
      expect(menu.callbacks.settings).toBeNull()
      expect(menu.callbacks.about).toBeNull()
      expect(menu.callbacks.quit).toBeNull()
    })
  })

  describe('Menu Display', () => {
    it('should show menu', () => {
      menu.showMenu()

      expect(menu.isVisible).toBe(true)
      expect(menu.menuElement).toBeDefined()
      expect(uiRoot.querySelector('#main-menu')).toBeDefined()
    })

    it('should hide menu', () => {
      menu.showMenu()
      expect(menu.isVisible).toBe(true)

      menu.hideMenu()
      expect(menu.isVisible).toBe(false)
      expect(menu.menuElement).toBeNull()
    })

    it('should not show menu twice', () => {
      menu.showMenu()
      const firstElement = menu.menuElement

      menu.showMenu()
      expect(menu.menuElement).toBe(firstElement)
    })

    it('should create menu element with correct structure', () => {
      menu.showMenu()

      expect(uiRoot.querySelector('#main-menu')).toBeDefined()
      expect(uiRoot.querySelector('#menu-buttons')).toBeDefined()
      expect(uiRoot.querySelectorAll('button')).toHaveLength(4)
    })

    it('should display title and version', () => {
      menu.showMenu()

      const menuElement = uiRoot.querySelector('#main-menu')
      const text = menuElement.textContent

      expect(text).toContain('LightCaves')
      expect(text).toContain('v0.1.0')
    })
  })

  describe('Button Selection', () => {
    beforeEach(() => {
      menu.showMenu()
    })

    it('should select button by index', () => {
      menu.selectButton(1)
      expect(menu.selectedButtonIndex).toBe(1)

      menu.selectButton(3)
      expect(menu.selectedButtonIndex).toBe(3)
    })

    it('should update button styles on selection', () => {
      const buttons = menu.menuElement.querySelectorAll('button')

      menu.selectButton(0)
      // Check that first button is highlighted and second is not
      expect(buttons[0].style.fontWeight).toBe('bold')
      expect(buttons[1].style.fontWeight).not.toBe('bold')

      menu.selectButton(2)
      // Check that third button is highlighted and first is not
      expect(buttons[2].style.fontWeight).toBe('bold')
      expect(buttons[0].style.fontWeight).not.toBe('bold')
    })

    it('should not select invalid index', () => {
      const initial = menu.selectedButtonIndex
      menu.selectButton(-1)
      expect(menu.selectedButtonIndex).toBe(initial)

      menu.selectButton(10)
      expect(menu.selectedButtonIndex).toBe(initial)
    })

    it('should start with first button selected', () => {
      expect(menu.selectedButtonIndex).toBe(0)
      const buttons = menu.menuElement.querySelectorAll('button')
      expect(buttons[0].style.fontWeight).toBe('bold')
    })
  })

  describe('Keyboard Navigation', () => {
    beforeEach(() => {
      menu.showMenu()
    })

    it('should handle ArrowDown key', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
      document.dispatchEvent(event)

      expect(menu.selectedButtonIndex).toBe(1)
    })

    it('should handle ArrowUp key', () => {
      menu.selectButton(2)
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' })
      document.dispatchEvent(event)

      expect(menu.selectedButtonIndex).toBe(1)
    })

    it('should wrap around when going up from first button', () => {
      menu.selectButton(0)
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' })
      document.dispatchEvent(event)

      expect(menu.selectedButtonIndex).toBe(3)
    })

    it('should wrap around when going down from last button', () => {
      menu.selectButton(3)
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
      document.dispatchEvent(event)

      expect(menu.selectedButtonIndex).toBe(0)
    })

    it('should handle Tab key', () => {
      const event = new KeyboardEvent('keydown', { key: 'Tab' })
      document.dispatchEvent(event)

      expect(menu.selectedButtonIndex).toBe(1)
    })

    it('should handle Enter key to click selected button', () => {
      const callback = vi.fn()
      menu.on('start', callback)

      const event = new KeyboardEvent('keydown', { key: 'Enter' })
      document.dispatchEvent(event)

      expect(callback).toHaveBeenCalled()
    })

    it('should handle Escape key to close menu', () => {
      menu.showMenu()
      expect(menu.isVisible).toBe(true)

      const event = new KeyboardEvent('keydown', { key: 'Escape' })
      document.dispatchEvent(event)

      expect(menu.isVisible).toBe(false)
    })

    it('should prevent default on keyboard events', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
      const preventSpy = vi.spyOn(event, 'preventDefault')
      document.dispatchEvent(event)

      expect(preventSpy).toHaveBeenCalled()
    })
  })

  describe('Button Clicks', () => {
    beforeEach(() => {
      menu.showMenu()
    })

    it('should trigger start callback on Start button click', () => {
      const callback = vi.fn()
      menu.on('start', callback)

      const startBtn = menu.menuElement.querySelector('#menu-btn-start')
      startBtn.click()

      expect(callback).toHaveBeenCalled()
    })

    it('should trigger settings callback on Settings button click', () => {
      const callback = vi.fn()
      menu.on('settings', callback)

      const settingsBtn = menu.menuElement.querySelector('#menu-btn-settings')
      settingsBtn.click()

      expect(callback).toHaveBeenCalled()
    })

    it('should trigger about callback on About button click', () => {
      const callback = vi.fn()
      menu.on('about', callback)

      const aboutBtn = menu.menuElement.querySelector('#menu-btn-about')
      aboutBtn.click()

      expect(callback).toHaveBeenCalled()
    })

    it('should trigger quit callback on Quit button click', () => {
      const callback = vi.fn()
      menu.on('quit', callback)

      const quitBtn = menu.menuElement.querySelector('#menu-btn-quit')
      quitBtn.click()

      expect(callback).toHaveBeenCalled()
    })

    it('should not trigger callback if not registered', () => {
      // Menu has no callbacks registered, just verify no errors
      const startBtn = menu.menuElement.querySelector('#menu-btn-start')
      expect(() => {
        startBtn.click()
      }).not.toThrow()
    })
  })

  describe('Event Callbacks', () => {
    it('should register start callback with on()', () => {
      const callback = vi.fn()
      menu.on('start', callback)

      expect(menu.callbacks.start).toBe(callback)
    })

    it('should remove callback with off()', () => {
      const callback = vi.fn()
      menu.on('start', callback)
      expect(menu.callbacks.start).toBe(callback)

      menu.off('start')
      expect(menu.callbacks.start).toBeNull()
    })

    it('should trigger menuClosed callback when hiding', () => {
      const callback = vi.fn()
      menu.on('menuClosed', callback)

      menu.showMenu()
      menu.hideMenu()

      expect(callback).toHaveBeenCalled()
    })

    it('should handle invalid event type in on()', () => {
      const callback = vi.fn()
      menu.on('invalid', callback)

      // Should not add invalid callbacks
      expect(menu.callbacks.invalid).toBeUndefined()
    })
  })

  describe('Button Position Detection', () => {
    beforeEach(() => {
      menu.showMenu()
    })

    it('should have getButtonAtPoint method', () => {
      expect(typeof menu.getButtonAtPoint).toBe('function')
    })

    it('should detect button when given valid rect mock', () => {
      const startBtn = menu.menuElement.querySelector('#menu-btn-start')

      // Mock getBoundingClientRect to return valid values
      const mockRect = {
        left: 100,
        right: 300,
        top: 200,
        bottom: 250,
      }

      vi.spyOn(startBtn, 'getBoundingClientRect').mockReturnValue(mockRect)

      const result = menu.getButtonAtPoint(150, 220)
      expect(result).toBeDefined()
      expect(result.id).toBe('start')
    })

    it('should return null when point is outside all buttons', () => {
      // Mock all buttons to return rects outside the test point
      const buttons = menu.menuElement.querySelectorAll('button')
      buttons.forEach((btn) => {
        const mockRect = {
          left: 100,
          right: 200,
          top: 100,
          bottom: 150,
        }
        vi.spyOn(btn, 'getBoundingClientRect').mockReturnValue(mockRect)
      })

      // Test point far away
      const result = menu.getButtonAtPoint(500, 500)
      expect(result).toBeNull()
    })

    it('should correctly identify button boundaries', () => {
      const startBtn = menu.menuElement.querySelector('#menu-btn-start')
      const mockRect = {
        left: 100,
        right: 300,
        top: 200,
        bottom: 250,
      }

      vi.spyOn(startBtn, 'getBoundingClientRect').mockReturnValue(mockRect)

      // Just inside left boundary
      expect(menu.getButtonAtPoint(100, 225)).toBeDefined()
      // Just inside right boundary
      expect(menu.getButtonAtPoint(300, 225)).toBeDefined()
      // Just outside left boundary
      expect(menu.getButtonAtPoint(99, 225)).toBeNull()
    })
  })

  describe('Lifecycle', () => {
    it('should destroy menu properly', () => {
      menu.showMenu()
      expect(menu.isVisible).toBe(true)

      menu.destroy()
      expect(menu.isVisible).toBe(false)
      expect(menu.menuElement).toBeNull()
    })

    it('should remove event listeners on destroy', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
      menu.showMenu()
      menu.destroy()

      // After destroy, keyboard events should not navigate menu
      const initialIndex = menu.selectedButtonIndex
      document.dispatchEvent(event)

      expect(menu.selectedButtonIndex).toBe(initialIndex)
    })
  })
})
