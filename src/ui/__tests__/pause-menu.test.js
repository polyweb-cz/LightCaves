/**
 * @fileoverview Tests for PauseMenu component
 * @module ui/__tests__/pause-menu.test.js
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { PauseMenu } from '../pause-menu.js'

describe('PauseMenu', () => {
  let pauseMenu
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

    pauseMenu = new PauseMenu(renderer, uiRoot)
  })

  afterEach(() => {
    if (pauseMenu) {
      pauseMenu.destroy()
    }
    if (uiRoot && uiRoot.parentNode) {
      uiRoot.parentNode.removeChild(uiRoot)
    }
  })

  describe('Constructor', () => {
    it('should create pause menu with valid inputs', () => {
      expect(pauseMenu).toBeDefined()
      expect(pauseMenu.isVisible).toBe(false)
    })

    it('should throw error on null renderer', () => {
      expect(() => {
        new PauseMenu(null, uiRoot)
      }).toThrow('Invalid renderer')
    })

    it('should throw error on null UI root', () => {
      expect(() => {
        new PauseMenu(renderer, null)
      }).toThrow('Invalid UI root')
    })
  })

  describe('Menu Display', () => {
    it('should show pause menu', () => {
      pauseMenu.show()

      expect(pauseMenu.isVisible).toBe(true)
      expect(pauseMenu.pauseElement).toBeDefined()
      expect(uiRoot.querySelector('#pause-menu')).toBeDefined()
    })

    it('should hide pause menu', () => {
      pauseMenu.show()
      expect(pauseMenu.isVisible).toBe(true)

      pauseMenu.hide()
      expect(pauseMenu.isVisible).toBe(false)
      expect(pauseMenu.pauseElement).toBeNull()
    })

    it('should not show twice', () => {
      pauseMenu.show()
      const firstElement = pauseMenu.pauseElement

      pauseMenu.show()
      expect(pauseMenu.pauseElement).toBe(firstElement)
    })

    it('should display pause header', () => {
      pauseMenu.show()

      const text = uiRoot.textContent
      expect(text).toContain('PAUSED')
    })
  })

  describe('Menu Buttons', () => {
    beforeEach(() => {
      pauseMenu.show()
    })

    it('should have resume button', () => {
      const button = uiRoot.querySelector('#pause-resume')
      expect(button).toBeDefined()
      expect(button.textContent).toBe('Resume Game')
    })

    it('should have settings button', () => {
      const button = uiRoot.querySelector('#pause-settings')
      expect(button).toBeDefined()
      expect(button.textContent).toBe('Settings')
    })

    it('should have menu button', () => {
      const button = uiRoot.querySelector('#pause-menu-btn')
      expect(button).toBeDefined()
      expect(button.textContent).toBe('Main Menu')
    })

    it('should create all three buttons', () => {
      const container = uiRoot.querySelector('#pause-buttons')
      expect(container.children.length).toBe(3)
    })
  })

  describe('Event System', () => {
    it('should register resume callback', () => {
      const callback = vi.fn()
      pauseMenu.on('resume', callback)
      pauseMenu.show()

      const button = uiRoot.querySelector('#pause-resume')
      button.click()

      expect(callback).toHaveBeenCalled()
    })

    it('should register settings callback', () => {
      const callback = vi.fn()
      pauseMenu.on('settings', callback)
      pauseMenu.show()

      const button = uiRoot.querySelector('#pause-settings')
      button.click()

      expect(callback).toHaveBeenCalled()
    })

    it('should register menu callback', () => {
      const callback = vi.fn()
      pauseMenu.on('menu', callback)
      pauseMenu.show()

      const button = uiRoot.querySelector('#pause-menu-btn')
      button.click()

      expect(callback).toHaveBeenCalled()
    })

    it('should support multiple callbacks for same event', () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()
      pauseMenu.on('resume', callback1)
      pauseMenu.on('resume', callback2)
      pauseMenu.show()

      const button = uiRoot.querySelector('#pause-resume')
      button.click()

      expect(callback1).toHaveBeenCalled()
      expect(callback2).toHaveBeenCalled()
    })
  })

  describe('Keyboard Navigation', () => {
    beforeEach(() => {
      pauseMenu.show()
    })

    it('should move selection down with ArrowDown', () => {
      expect(pauseMenu.selectedIndex).toBe(0)

      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
      document.dispatchEvent(event)

      expect(pauseMenu.selectedIndex).toBe(1)
    })

    it('should move selection up with ArrowUp', () => {
      pauseMenu.selectedIndex = 2

      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' })
      document.dispatchEvent(event)

      expect(pauseMenu.selectedIndex).toBe(1)
    })

    it('should not go above first button', () => {
      pauseMenu.selectedIndex = 0

      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' })
      document.dispatchEvent(event)

      expect(pauseMenu.selectedIndex).toBe(0)
    })

    it('should not go below last button', () => {
      pauseMenu.selectedIndex = 2

      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
      document.dispatchEvent(event)

      expect(pauseMenu.selectedIndex).toBe(2)
    })

    it('should activate selected button with Enter', () => {
      const callback = vi.fn()
      pauseMenu.on('resume', callback)

      const event = new KeyboardEvent('keydown', { key: 'Enter' })
      document.dispatchEvent(event)

      expect(callback).toHaveBeenCalled()
    })

    it('should close menu with Escape key', () => {
      const callback = vi.fn()
      pauseMenu.on('resume', callback)

      const event = new KeyboardEvent('keydown', { key: 'Escape' })
      document.dispatchEvent(event)

      expect(callback).toHaveBeenCalled()
    })

    it('should ignore other keys', () => {
      pauseMenu.selectedIndex = 0
      const event = new KeyboardEvent('keydown', { key: 'q' })
      document.dispatchEvent(event)

      expect(pauseMenu.selectedIndex).toBe(0)
    })
  })

  describe('Button Selection Styling', () => {
    beforeEach(() => {
      pauseMenu.show()
    })

    it('should highlight first button by default', () => {
      const button = uiRoot.querySelector('#pause-resume')
      expect(button.style.background).toContain('rgba(0, 255, 255, 0.3)')
    })

    it('should update styling on arrow navigation', () => {
      const button0 = uiRoot.querySelector('#pause-resume')
      const button1 = uiRoot.querySelector('#pause-settings')

      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
      document.dispatchEvent(event)

      expect(button1.style.background).toContain('rgba(0, 255, 255, 0.3)')
    })

    it('should update styling on mouse hover', () => {
      const button = uiRoot.querySelector('#pause-settings')
      const event = new MouseEvent('mouseenter')
      button.dispatchEvent(event)

      expect(pauseMenu.selectedIndex).toBe(1)
    })
  })

  describe('Lifecycle', () => {
    it('should destroy pause menu properly', () => {
      pauseMenu.show()
      expect(pauseMenu.isVisible).toBe(true)

      pauseMenu.destroy()
      expect(pauseMenu.isVisible).toBe(false)
      expect(pauseMenu.pauseElement).toBeNull()
    })

    it('should remove event listeners on destroy', () => {
      pauseMenu.show()
      pauseMenu.destroy()

      const event = new KeyboardEvent('keydown', { key: 'Escape' })
      document.dispatchEvent(event)

      expect(pauseMenu.isVisible).toBe(false)
    })

    it('should be reshowable after hide', () => {
      pauseMenu.show()
      pauseMenu.hide()

      pauseMenu.show()
      expect(pauseMenu.isVisible).toBe(true)
      expect(uiRoot.querySelector('#pause-menu')).toBeDefined()
    })
  })

  describe('Visual Appearance', () => {
    beforeEach(() => {
      pauseMenu.show()
    })

    it('should have fixed positioning', () => {
      const element = uiRoot.querySelector('#pause-menu')
      expect(element.style.position).toBe('fixed')
    })

    it('should be centered on screen', () => {
      const element = uiRoot.querySelector('#pause-menu')
      expect(element.style.transform).toContain('translate(-50%, -50%)')
    })

    it('should have appropriate z-index', () => {
      const element = uiRoot.querySelector('#pause-menu')
      const zIndex = parseInt(element.style.zIndex)
      expect(zIndex).toBeGreaterThan(1000)
    })

    it('should show keyboard tips', () => {
      const text = uiRoot.textContent
      expect(text).toContain('Navigate')
      expect(text).toContain('Select')
      expect(text).toContain('Resume')
    })
  })

  describe('Integration', () => {
    it('should handle rapid show/hide cycles', () => {
      pauseMenu.show()
      pauseMenu.hide()
      pauseMenu.show()
      pauseMenu.hide()

      expect(pauseMenu.isVisible).toBe(false)
    })

    it('should reset selected index when showing', () => {
      pauseMenu.show()
      pauseMenu.selectedIndex = 2
      pauseMenu.hide()

      pauseMenu.show()
      expect(pauseMenu.selectedIndex).toBe(0)

      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
      document.dispatchEvent(event)

      expect(pauseMenu.selectedIndex).toBe(1)
    })
  })
})
