/**
 * @fileoverview Unit tests for EntityRenderer class
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { EntityRenderer } from '../entity-renderer.js'
import { DIRECTIONS } from '../../utils/constants.js'
import { Level } from '../../game/level.js'
import { CELL_TYPES } from '../../utils/constants.js'

describe('EntityRenderer', () => {
  let mockRenderer
  let mockGridRenderer
  let entityRenderer
  let testLevel

  beforeEach(() => {
    // Mock renderer
    mockRenderer = {
      drawText: vi.fn(),
      drawCircle: vi.fn(),
      drawCircleOutline: vi.fn(),
      drawRect: vi.fn(),
      ctx: { globalAlpha: 1.0 }
    }

    // Mock grid renderer
    mockGridRenderer = {
      cellWidth: 16,
      cellHeight: 20
    }

    entityRenderer = new EntityRenderer(mockRenderer, mockGridRenderer)

    // Create test level
    const mapData = {
      width: 6,
      height: 4,
      grid: [
        [CELL_TYPES.WALL, CELL_TYPES.WALL, CELL_TYPES.WALL, CELL_TYPES.WALL, CELL_TYPES.WALL, CELL_TYPES.WALL],
        [CELL_TYPES.WALL, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.WALL],
        [CELL_TYPES.WALL, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.WALL],
        [CELL_TYPES.WALL, CELL_TYPES.WALL, CELL_TYPES.WALL, CELL_TYPES.WALL, CELL_TYPES.WALL, CELL_TYPES.WALL]
      ],
      lamp: { x: 1, y: 1, direction: DIRECTIONS.E },
      target: { x: 4, y: 1, direction: DIRECTIONS.W },
      metadata: { name: 'Test Level', difficulty: 'easy', maxMirrors: 1 }
    }

    testLevel = new Level(mapData)
  })

  describe('Constructor', () => {
    it('should create entity renderer with valid inputs', () => {
      expect(entityRenderer.renderer).toBe(mockRenderer)
      expect(entityRenderer.gridRenderer).toBe(mockGridRenderer)
    })

    it('should throw error on null renderer', () => {
      expect(() => new EntityRenderer(null, mockGridRenderer)).toThrow('Invalid renderer')
    })

    it('should throw error on null gridRenderer', () => {
      expect(() => new EntityRenderer(mockRenderer, null)).toThrow('Invalid gridRenderer')
    })
  })

  describe('Lamp Rendering', () => {
    it('should draw lamp', () => {
      entityRenderer.drawLamp(1, 1, DIRECTIONS.E)

      expect(mockRenderer.drawCircle).toHaveBeenCalled()
      expect(mockRenderer.drawText).toHaveBeenCalled()
    })

    it('should draw lamp in all directions', () => {
      const directions = [DIRECTIONS.N, DIRECTIONS.S, DIRECTIONS.E, DIRECTIONS.W]

      directions.forEach(dir => {
        mockRenderer.drawCircle.mockClear()
        mockRenderer.drawText.mockClear()

        entityRenderer.drawLamp(2, 2, dir)

        expect(mockRenderer.drawCircle).toHaveBeenCalled()
        expect(mockRenderer.drawText).toHaveBeenCalled()
      })
    })

    it('should draw all lamps in level', () => {
      entityRenderer.drawAllLamps(testLevel)

      expect(mockRenderer.drawCircle).toHaveBeenCalled()
      expect(mockRenderer.drawText).toHaveBeenCalled()
    })
  })

  describe('Target Rendering', () => {
    it('should draw target', () => {
      entityRenderer.drawTarget(4, 1, DIRECTIONS.W)

      expect(mockRenderer.drawCircleOutline).toHaveBeenCalled()
      expect(mockRenderer.drawText).toHaveBeenCalled()
    })

    it('should draw target in all directions', () => {
      const directions = [DIRECTIONS.N, DIRECTIONS.S, DIRECTIONS.E, DIRECTIONS.W]

      directions.forEach(dir => {
        mockRenderer.drawCircleOutline.mockClear()
        mockRenderer.drawText.mockClear()

        entityRenderer.drawTarget(3, 3, dir)

        expect(mockRenderer.drawCircleOutline).toHaveBeenCalled()
        expect(mockRenderer.drawText).toHaveBeenCalled()
      })
    })

    it('should draw all targets in level', () => {
      entityRenderer.drawAllTargets(testLevel)

      expect(mockRenderer.drawCircleOutline).toHaveBeenCalled()
      expect(mockRenderer.drawText).toHaveBeenCalled()
    })
  })

  describe('Mirror Rendering', () => {
    it('should draw slash mirror', () => {
      entityRenderer.drawMirror(2, 2, '/')

      expect(mockRenderer.drawText).toHaveBeenCalled()
    })

    it('should draw backslash mirror', () => {
      entityRenderer.drawMirror(2, 2, '\\')

      expect(mockRenderer.drawText).toHaveBeenCalled()
    })

    it('should draw all mirrors', () => {
      const mirrors = {
        '2,2': { type: '/', x: 2, y: 2 },
        '3,3': { type: '\\', x: 3, y: 3 }
      }

      entityRenderer.drawAllMirrors(mirrors)

      expect(mockRenderer.drawText).toHaveBeenCalled()
    })

    it('should handle empty mirrors', () => {
      entityRenderer.drawAllMirrors({})

      expect(mockRenderer.drawText).not.toHaveBeenCalled()
    })
  })

  describe('Illuminated Cells', () => {
    it('should draw illuminated cell', () => {
      entityRenderer.drawIlluminatedCell(2, 2)

      expect(mockRenderer.drawRect).toHaveBeenCalled()
    })

    it('should draw all illuminated cells', () => {
      const illuminated = new Set(['1,1', '2,1', '3,1'])

      entityRenderer.drawAllIlluminatedCells(illuminated)

      expect(mockRenderer.drawRect).toHaveBeenCalledTimes(3)
    })

    it('should handle empty illuminated set', () => {
      const illuminated = new Set()

      entityRenderer.drawAllIlluminatedCells(illuminated)

      expect(mockRenderer.drawRect).not.toHaveBeenCalled()
    })
  })

  describe('Directional Symbols', () => {
    it('should get lamp symbol for all directions', () => {
      const directions = [DIRECTIONS.N, DIRECTIONS.S, DIRECTIONS.E, DIRECTIONS.W]

      directions.forEach(dir => {
        const symbol = entityRenderer.getDirectionalSymbol('LAMP', dir)
        expect(symbol).toBeDefined()
        expect(symbol).not.toBe('?')
      })
    })

    it('should get target symbol for all directions', () => {
      const directions = [DIRECTIONS.N, DIRECTIONS.S, DIRECTIONS.E, DIRECTIONS.W]

      directions.forEach(dir => {
        const symbol = entityRenderer.getDirectionalSymbol('TARGET', dir)
        expect(symbol).toBeDefined()
        expect(symbol).not.toBe('?')
      })
    })

    it('should return ? for invalid symbol', () => {
      const symbol = entityRenderer.getDirectionalSymbol('INVALID', 'INVALID')
      expect(symbol).toBe('?')
    })
  })

  describe('Complete Level Rendering', () => {
    it('should draw level entities', () => {
      const mirrors = {
        '2,2': { type: '/', x: 2, y: 2 }
      }

      entityRenderer.drawLevelEntities(testLevel, mirrors)

      expect(mockRenderer.drawText).toHaveBeenCalled()
    })

    it('should draw level with illuminated cells', () => {
      const mirrors = {}
      const illuminated = new Set(['1,1', '2,1'])

      entityRenderer.drawLevelEntities(testLevel, mirrors, illuminated)

      expect(mockRenderer.drawRect).toHaveBeenCalled()
      expect(mockRenderer.drawText).toHaveBeenCalled()
    })

    it('should handle level without mirrors', () => {
      entityRenderer.drawLevelEntities(testLevel, {})

      expect(mockRenderer.drawText).toHaveBeenCalled()
    })
  })

  describe('Multiple Entities', () => {
    it('should draw lamp and target', () => {
      mockRenderer.drawCircle.mockClear()
      mockRenderer.drawCircleOutline.mockClear()

      entityRenderer.drawAllLamps(testLevel)
      entityRenderer.drawAllTargets(testLevel)

      expect(mockRenderer.drawCircle).toHaveBeenCalled()
      expect(mockRenderer.drawCircleOutline).toHaveBeenCalled()
    })

    it('should draw all entity types together', () => {
      const mirrors = {
        '2,2': { type: '/', x: 2, y: 2 },
        '3,3': { type: '\\', x: 3, y: 3 }
      }

      entityRenderer.drawAllLamps(testLevel)
      entityRenderer.drawAllTargets(testLevel)
      entityRenderer.drawAllMirrors(mirrors)

      expect(mockRenderer.drawText).toHaveBeenCalled()
      expect(mockRenderer.drawCircle).toHaveBeenCalled()
      expect(mockRenderer.drawCircleOutline).toHaveBeenCalled()
    })
  })
})
