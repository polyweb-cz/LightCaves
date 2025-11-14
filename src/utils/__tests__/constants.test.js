/**
 * @fileoverview Unit tests for constants module
 * Test reflection table, directions, and symbols
 */

import { describe, it, expect } from 'vitest'
import {
  DIRECTIONS,
  SYMBOLS,
  COLORS,
  REFLECTION_TABLE,
  CELL_TYPES,
  GRID_CONFIG
} from '../constants.js'

describe('Constants Module', () => {
  describe('DIRECTIONS Enum', () => {
    it('should have all four directions', () => {
      expect(DIRECTIONS.N).toBe('N')
      expect(DIRECTIONS.S).toBe('S')
      expect(DIRECTIONS.E).toBe('E')
      expect(DIRECTIONS.W).toBe('W')
    })

    it('should have exactly 4 directions', () => {
      const directionCount = Object.keys(DIRECTIONS).length
      expect(directionCount).toBe(4)
    })
  })

  describe('SYMBOLS Enum', () => {
    it('should have all game symbols', () => {
      expect(SYMBOLS.WALL).toBe('█')
      expect(SYMBOLS.EMPTY).toBe(' ')
      expect(SYMBOLS.MIRROR_SLASH).toBe('/')
      expect(SYMBOLS.MIRROR_BACKSLASH).toBe('\\')
    })

    it('should have lamp symbols', () => {
      expect(SYMBOLS.LAMP_N).toBe('▲')
      expect(SYMBOLS.LAMP_E).toBe('►')
      expect(SYMBOLS.LAMP_S).toBe('▼')
      expect(SYMBOLS.LAMP_W).toBe('◄')
    })

    it('should have target symbols', () => {
      expect(SYMBOLS.TARGET_N).toBe('△')
      expect(SYMBOLS.TARGET_E).toBe('▷')
      expect(SYMBOLS.TARGET_S).toBe('▽')
      expect(SYMBOLS.TARGET_W).toBe('◁')
    })
  })

  describe('REFLECTION_TABLE - Forward Slash (/)', () => {
    it('should reflect North beam to East', () => {
      const result = REFLECTION_TABLE['/'][DIRECTIONS.N]
      expect(result).toBe(DIRECTIONS.E)
    })

    it('should reflect South beam to West', () => {
      const result = REFLECTION_TABLE['/'][DIRECTIONS.S]
      expect(result).toBe(DIRECTIONS.W)
    })

    it('should reflect East beam to North', () => {
      const result = REFLECTION_TABLE['/'][DIRECTIONS.E]
      expect(result).toBe(DIRECTIONS.N)
    })

    it('should reflect West beam to South', () => {
      const result = REFLECTION_TABLE['/'][DIRECTIONS.W]
      expect(result).toBe(DIRECTIONS.S)
    })
  })

  describe('REFLECTION_TABLE - Backslash (\\)', () => {
    it('should reflect North beam to West', () => {
      const result = REFLECTION_TABLE['\\'][DIRECTIONS.N]
      expect(result).toBe(DIRECTIONS.W)
    })

    it('should reflect South beam to East', () => {
      const result = REFLECTION_TABLE['\\'][DIRECTIONS.S]
      expect(result).toBe(DIRECTIONS.E)
    })

    it('should reflect East beam to South', () => {
      const result = REFLECTION_TABLE['\\'][DIRECTIONS.E]
      expect(result).toBe(DIRECTIONS.S)
    })

    it('should reflect West beam to North', () => {
      const result = REFLECTION_TABLE['\\'][DIRECTIONS.W]
      expect(result).toBe(DIRECTIONS.N)
    })
  })

  describe('REFLECTION_TABLE - Completeness', () => {
    it('should have entries for both mirror types', () => {
      expect(REFLECTION_TABLE['/']).toBeDefined()
      expect(REFLECTION_TABLE['\\']).toBeDefined()
    })

    it('should have all 4 directions for forward slash', () => {
      const slashReflections = REFLECTION_TABLE['/']
      expect(Object.keys(slashReflections).length).toBe(4)
    })

    it('should have all 4 directions for backslash', () => {
      const backslashReflections = REFLECTION_TABLE['\\']
      expect(Object.keys(backslashReflections).length).toBe(4)
    })

    it('should be frozen (immutable)', () => {
      expect(() => {
        REFLECTION_TABLE['/'][DIRECTIONS.N] = DIRECTIONS.S
      }).toThrow()
    })
  })

  describe('COLORS', () => {
    it('should have valid hex color values', () => {
      expect(COLORS.BG).toBe('#000000')
      expect(COLORS.FG).toBe('#FFFFFF')
      expect(COLORS.ACCENT).toBe('#00FF00')
      expect(COLORS.BEAM).toBe('#FFFF00')
    })
  })

  describe('GRID_CONFIG', () => {
    it('should have positive cell dimensions', () => {
      expect(GRID_CONFIG.CELL_WIDTH_PX).toBeGreaterThan(0)
      expect(GRID_CONFIG.CELL_HEIGHT_PX).toBeGreaterThan(0)
    })

    it('should have valid min/max grid sizes', () => {
      expect(GRID_CONFIG.MIN_WIDTH).toBeGreaterThan(0)
      expect(GRID_CONFIG.MAX_WIDTH).toBeGreaterThan(GRID_CONFIG.MIN_WIDTH)
      expect(GRID_CONFIG.MIN_HEIGHT).toBeGreaterThan(0)
      expect(GRID_CONFIG.MAX_HEIGHT).toBeGreaterThan(GRID_CONFIG.MIN_HEIGHT)
    })
  })

  describe('CELL_TYPES', () => {
    it('should have all cell type values', () => {
      expect(CELL_TYPES.WALL).toBe('wall')
      expect(CELL_TYPES.EMPTY).toBe('empty')
      expect(CELL_TYPES.LAMP).toBe('lamp')
      expect(CELL_TYPES.TARGET).toBe('target')
      expect(CELL_TYPES.MIRROR).toBe('mirror')
    })
  })
})
