/**
 * @fileoverview Tests for HelpScreen component
 * @module ui/__tests__/help-screen.test.js
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { HelpScreen } from '../help-screen.js'

describe('HelpScreen', () => {
  let helpScreen
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

    helpScreen = new HelpScreen(renderer, uiRoot)
  })

  afterEach(() => {
    if (helpScreen) {
      helpScreen.destroy()
    }
    if (uiRoot && uiRoot.parentNode) {
      uiRoot.parentNode.removeChild(uiRoot)
    }
  })

  describe('Constructor', () => {
    it('should create help screen with valid inputs', () => {
      expect(helpScreen).toBeDefined()
      expect(helpScreen.isVisible).toBe(false)
    })

    it('should throw error on null renderer', () => {
      expect(() => {
        new HelpScreen(null, uiRoot)
      }).toThrow('Invalid renderer')
    })

    it('should throw error on null UI root', () => {
      expect(() => {
        new HelpScreen(renderer, null)
      }).toThrow('Invalid UI root')
    })

    it('should have multiple help sections', () => {
      expect(helpScreen.sections).toBeDefined()
      expect(helpScreen.sections.length).toBeGreaterThan(0)
    })
  })

  describe('Display', () => {
    beforeEach(() => {
      helpScreen.show()
    })

    it('should show help screen', () => {
      expect(helpScreen.isVisible).toBe(true)
      expect(helpScreen.helpElement).toBeDefined()
      expect(uiRoot.querySelector('#help-screen')).toBeDefined()
    })

    it('should not show twice', () => {
      const firstElement = helpScreen.helpElement
      helpScreen.show()
      expect(helpScreen.helpElement).toBe(firstElement)
    })

    it('should hide help screen', () => {
      helpScreen.hide()
      expect(helpScreen.isVisible).toBe(false)
      expect(helpScreen.helpElement).toBeNull()
    })

    it('should display section header', () => {
      const header = uiRoot.querySelector('#help-header')
      expect(header).toBeDefined()
      expect(header.textContent.length).toBeGreaterThan(0)
    })

    it('should display section content', () => {
      const content = uiRoot.querySelector('#help-content')
      expect(content).toBeDefined()
      expect(content.children.length).toBeGreaterThan(0)
    })
  })

  describe('Section Navigation', () => {
    beforeEach(() => {
      helpScreen.show()
    })

    it('should start at first section', () => {
      expect(helpScreen.currentSection).toBe(0)
    })

    it('should go to next section', () => {
      helpScreen.nextSection()
      expect(helpScreen.currentSection).toBe(1)
    })

    it('should go to previous section', () => {
      helpScreen.currentSection = 2
      helpScreen.previousSection()
      expect(helpScreen.currentSection).toBe(1)
    })

    it('should not go beyond last section', () => {
      helpScreen.currentSection = helpScreen.sections.length - 1
      helpScreen.nextSection()
      expect(helpScreen.currentSection).toBe(helpScreen.sections.length - 1)
    })

    it('should not go before first section', () => {
      helpScreen.currentSection = 0
      helpScreen.previousSection()
      expect(helpScreen.currentSection).toBe(0)
    })

    it('should display section indicator', () => {
      const indicator = uiRoot.querySelector('#help-section')
      expect(indicator).toBeDefined()
      expect(indicator.textContent).toContain('1 /')
    })

    it('should update indicator on navigation', () => {
      helpScreen.nextSection()
      const indicator = uiRoot.querySelector('#help-section')
      expect(indicator.textContent).toContain('2 /')
    })
  })

  describe('Navigation Buttons', () => {
    beforeEach(() => {
      helpScreen.show()
    })

    it('should have previous button', () => {
      const button = uiRoot.querySelector('#help-prev')
      expect(button).toBeDefined()
      expect(button.textContent).toContain('Previous')
    })

    it('should have next button', () => {
      const button = uiRoot.querySelector('#help-next')
      expect(button).toBeDefined()
      expect(button.textContent).toContain('Next')
    })

    it('should have back button', () => {
      const button = uiRoot.querySelector('#help-back')
      expect(button).toBeDefined()
      expect(button.textContent).toContain('Back')
    })

    it('should disable previous on first section', () => {
      expect(helpScreen.currentSection).toBe(0)
      const button = uiRoot.querySelector('#help-prev')
      expect(button.disabled).toBe(true)
    })

    it('should disable next on last section', () => {
      helpScreen.currentSection = helpScreen.sections.length - 1
      helpScreen.updateDisplay()
      const button = uiRoot.querySelector('#help-next')
      expect(button.disabled).toBe(true)
    })

    it('should navigate with next button click', () => {
      const button = uiRoot.querySelector('#help-next')
      button.click()
      expect(helpScreen.currentSection).toBe(1)
    })

    it('should navigate with previous button click', () => {
      helpScreen.currentSection = 1
      helpScreen.updateDisplay()
      const button = uiRoot.querySelector('#help-prev')
      button.click()
      expect(helpScreen.currentSection).toBe(0)
    })
  })

  describe('Keyboard Navigation', () => {
    beforeEach(() => {
      helpScreen.show()
    })

    it('should go to next section with ArrowRight', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' })
      document.dispatchEvent(event)
      expect(helpScreen.currentSection).toBe(1)
    })

    it('should go to previous section with ArrowLeft', () => {
      helpScreen.currentSection = 1
      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' })
      document.dispatchEvent(event)
      expect(helpScreen.currentSection).toBe(0)
    })

    it('should close with Escape key', () => {
      const callback = vi.fn()
      helpScreen.on('close', callback)

      const event = new KeyboardEvent('keydown', { key: 'Escape' })
      document.dispatchEvent(event)

      expect(callback).toHaveBeenCalled()
    })

    it('should ignore other keys', () => {
      helpScreen.currentSection = 0
      const event = new KeyboardEvent('keydown', { key: 'q' })
      document.dispatchEvent(event)
      expect(helpScreen.currentSection).toBe(0)
    })
  })

  describe('Event System', () => {
    it('should register close callback', () => {
      const callback = vi.fn()
      helpScreen.on('close', callback)
      helpScreen.show()

      const button = uiRoot.querySelector('#help-back')
      button.click()

      expect(callback).toHaveBeenCalled()
    })

    it('should support multiple callbacks', () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()
      helpScreen.on('close', callback1)
      helpScreen.on('close', callback2)
      helpScreen.show()

      const button = uiRoot.querySelector('#help-back')
      button.click()

      expect(callback1).toHaveBeenCalled()
      expect(callback2).toHaveBeenCalled()
    })
  })

  describe('Content Display', () => {
    beforeEach(() => {
      helpScreen.show()
    })

    it('should display first section on show', () => {
      const header = uiRoot.querySelector('#help-header')
      expect(header.textContent).toBe(helpScreen.sections[0].title)
    })

    it('should display section content items', () => {
      const content = uiRoot.querySelector('#help-content')
      const items = content.querySelectorAll('div')
      expect(items.length).toBeGreaterThan(0)
    })

    it('should update header on section change', () => {
      const header = uiRoot.querySelector('#help-header')
      const initialText = header.textContent

      helpScreen.nextSection()
      expect(header.textContent).not.toBe(initialText)
      expect(header.textContent).toBe(helpScreen.sections[1].title)
    })

    it('should update content on section change', () => {
      const content = uiRoot.querySelector('#help-content')
      const initialText = content.textContent

      helpScreen.nextSection()
      expect(content.textContent).not.toBe(initialText)
    })
  })

  describe('Lifecycle', () => {
    it('should destroy properly', () => {
      helpScreen.show()
      expect(helpScreen.isVisible).toBe(true)

      helpScreen.destroy()
      expect(helpScreen.isVisible).toBe(false)
      expect(helpScreen.helpElement).toBeNull()
    })

    it('should remove event listeners on destroy', () => {
      const callback = vi.fn()
      helpScreen.on('close', callback)
      helpScreen.show()
      helpScreen.destroy()

      const event = new KeyboardEvent('keydown', { key: 'Escape' })
      document.dispatchEvent(event)

      expect(callback).not.toHaveBeenCalled()
    })

    it('should be reshowable after hide', () => {
      helpScreen.show()
      helpScreen.hide()

      helpScreen.show()
      expect(helpScreen.isVisible).toBe(true)
      expect(uiRoot.querySelector('#help-screen')).toBeDefined()
    })
  })

  describe('Visual Appearance', () => {
    beforeEach(() => {
      helpScreen.show()
    })

    it('should have fixed positioning', () => {
      const element = uiRoot.querySelector('#help-screen')
      expect(element.style.position).toBe('fixed')
    })

    it('should be centered on screen', () => {
      const element = uiRoot.querySelector('#help-screen')
      expect(element.style.transform).toContain('translate(-50%, -50%)')
    })

    it('should have appropriate z-index', () => {
      const element = uiRoot.querySelector('#help-screen')
      const zIndex = parseInt(element.style.zIndex)
      expect(zIndex).toBeGreaterThan(1000)
    })
  })
})
