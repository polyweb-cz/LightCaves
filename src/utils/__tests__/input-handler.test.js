/**
 * @fileoverview Unit tests for InputHandler class
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { InputHandler } from '../input-handler.js'

describe('InputHandler', () => {
  let canvas
  let inputHandler

  beforeEach(() => {
    // Create mock canvas
    canvas = document.createElement('canvas')
    canvas.width = 640
    canvas.height = 480
    inputHandler = new InputHandler(canvas)
  })

  describe('Constructor', () => {
    it('should create input handler with valid canvas', () => {
      expect(inputHandler.canvas).toBe(canvas)
      expect(inputHandler.pressedKeys).toEqual(new Set())
    })

    it('should throw error on null canvas', () => {
      expect(() => new InputHandler(null)).toThrow('Invalid canvas element')
    })

    it('should initialize event callbacks map', () => {
      expect(inputHandler.eventCallbacks).toBeDefined()
      expect(inputHandler.eventCallbacks.size).toBe(0)
    })
  })

  describe('Coordinate Conversion', () => {
    it('should convert pixels to grid coordinates', () => {
      const { gridX, gridY } = inputHandler.pixelsToGrid(16, 20)
      expect(gridX).toBe(1)
      expect(gridY).toBe(1)
    })

    it('should convert zero pixels to 0,0', () => {
      const { gridX, gridY } = inputHandler.pixelsToGrid(0, 0)
      expect(gridX).toBe(0)
      expect(gridY).toBe(0)
    })

    it('should convert grid to pixel coordinates', () => {
      const { pixelX, pixelY } = inputHandler.gridToPixels(1, 1)
      expect(pixelX).toBe(16)
      expect(pixelY).toBe(20)
    })

    it('should round down for fractional pixels', () => {
      const { gridX, gridY } = inputHandler.pixelsToGrid(25, 30)
      expect(gridX).toBe(1)
      expect(gridY).toBe(1)
    })
  })

  describe('Keyboard Input', () => {
    it('should detect key press via internal state', () => {
      // Manually simulate key press as would happen from handleKeyDown
      inputHandler.pressedKeys.add('KeyA')

      expect(inputHandler.isKeyPressed('KeyA')).toBe(true)
    })

    it('should detect key release via internal state', () => {
      inputHandler.pressedKeys.add('KeyA')
      expect(inputHandler.isKeyPressed('KeyA')).toBe(true)

      inputHandler.pressedKeys.delete('KeyA')
      expect(inputHandler.isKeyPressed('KeyA')).toBe(false)
    })

    it('should track multiple pressed keys', () => {
      inputHandler.pressedKeys.add('KeyA')
      inputHandler.pressedKeys.add('KeyB')

      expect(inputHandler.isKeyPressed('KeyA')).toBe(true)
      expect(inputHandler.isKeyPressed('KeyB')).toBe(true)
    })

    it('should get all pressed keys', () => {
      inputHandler.pressedKeys.add('KeyA')
      inputHandler.pressedKeys.add('KeyB')

      const pressed = inputHandler.getPressedKeys()
      expect(pressed).toContain('KeyA')
      expect(pressed).toContain('KeyB')
    })

    it('should clear pressed keys', () => {
      inputHandler.pressedKeys.add('KeyA')
      inputHandler.pressedKeys.add('KeyB')

      inputHandler.clearPressedKeys()
      expect(inputHandler.getPressedKeys().length).toBe(0)
    })
  })

  describe('Mouse Input', () => {
    it('should handle mouse click coordinate calculation', () => {
      // Directly test the coordinate conversion used in mouse click
      const { gridX, gridY } = inputHandler.pixelsToGrid(32, 40)
      expect(gridX).toBe(2)
      expect(gridY).toBe(2)
    })

    it('should update last mouse position', () => {
      // Manually simulate mouse move (since jsdom doesn't support offsetX properly)
      inputHandler.lastMousePos = inputHandler.pixelsToGrid(48, 60)

      const pos = inputHandler.getLastMousePos()
      expect(pos.gridX).toBe(3)
      expect(pos.gridY).toBe(3)
    })

    it('should trigger mouse click callback when manually invoked', () => {
      const callback = vi.fn()
      inputHandler.on('mouseClick', callback)

      // Manually trigger the callback as would happen from event handler
      inputHandler.triggerCallback('mouseClick', { gridX: 1, gridY: 1 })

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          gridX: 1,
          gridY: 1
        })
      )
    })

    it('should track last mouse position correctly', () => {
      inputHandler.lastMousePos = { x: 5, y: 7 }

      const pos = inputHandler.getLastMousePos()
      expect(pos.x).toBe(5)
      expect(pos.y).toBe(7)
    })
  })

  describe('Event Callbacks', () => {
    it('should register and trigger callback', () => {
      const callback = vi.fn()
      inputHandler.on('mouseClick', callback)

      inputHandler.triggerCallback('mouseClick', { gridX: 0, gridY: 0 })

      expect(callback).toHaveBeenCalled()
    })

    it('should register multiple callbacks for same event', () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()

      inputHandler.on('mouseClick', callback1)
      inputHandler.on('mouseClick', callback2)

      inputHandler.triggerCallback('mouseClick', { gridX: 0, gridY: 0 })

      expect(callback1).toHaveBeenCalled()
      expect(callback2).toHaveBeenCalled()
    })

    it('should remove callback', () => {
      const callback = vi.fn()
      inputHandler.on('mouseClick', callback)
      inputHandler.off('mouseClick', callback)

      inputHandler.triggerCallback('mouseClick', { gridX: 0, gridY: 0 })

      expect(callback).not.toHaveBeenCalled()
    })

    it('should handle callback errors gracefully', () => {
      const badCallback = vi.fn(() => {
        throw new Error('Test error')
      })
      const goodCallback = vi.fn()

      inputHandler.on('mouseClick', badCallback)
      inputHandler.on('mouseClick', goodCallback)

      inputHandler.triggerCallback('mouseClick', { gridX: 0, gridY: 0 })

      // Good callback should still execute even if first one fails
      expect(goodCallback).toHaveBeenCalled()
    })
  })

  describe('Key Binding', () => {
    it('should bind key to action', () => {
      const action = vi.fn()
      inputHandler.bindKey('KeyA', action)

      const event = new KeyboardEvent('keydown', { code: 'KeyA' })
      document.dispatchEvent(event)

      expect(action).toHaveBeenCalled()
    })

    it('should not trigger action for unbound key', () => {
      const action = vi.fn()
      inputHandler.bindKey('KeyA', action)

      const event = new KeyboardEvent('keydown', { code: 'KeyB' })
      document.dispatchEvent(event)

      expect(action).not.toHaveBeenCalled()
    })
  })

  describe('Modifier Keys', () => {
    it('should detect shift key press', () => {
      const event = new KeyboardEvent('keydown', { code: 'ShiftLeft' })
      document.dispatchEvent(event)

      expect(inputHandler.isModifierPressed()).toBe(true)
    })

    it('should detect ctrl key press', () => {
      const event = new KeyboardEvent('keydown', { code: 'ControlLeft' })
      document.dispatchEvent(event)

      expect(inputHandler.isModifierPressed()).toBe(true)
    })

    it('should return false when no modifier pressed', () => {
      expect(inputHandler.isModifierPressed()).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('should handle negative coordinates', () => {
      const { gridX, gridY } = inputHandler.pixelsToGrid(-10, -10)
      expect(typeof gridX).toBe('number')
      expect(typeof gridY).toBe('number')
    })

    it('should handle large coordinates', () => {
      const { gridX, gridY } = inputHandler.pixelsToGrid(1000, 1000)
      expect(gridX).toBeGreaterThan(0)
      expect(gridY).toBeGreaterThan(0)
    })

    it('should handle callback on non-existent event type', () => {
      expect(() => inputHandler.off('nonExistent', () => {})).not.toThrow()
    })

    it('should not duplicate key presses', () => {
      const event1 = new KeyboardEvent('keydown', { code: 'KeyA' })
      const event2 = new KeyboardEvent('keydown', { code: 'KeyA' })

      document.dispatchEvent(event1)
      document.dispatchEvent(event2)

      const pressed = inputHandler.getPressedKeys()
      expect(pressed.filter(k => k === 'KeyA').length).toBe(1)
    })
  })
})
