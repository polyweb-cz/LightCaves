/**
 * @fileoverview Unit tests for BeamRenderer class
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { BeamRenderer } from '../beam-renderer.js'
import { DIRECTIONS } from '../../utils/constants.js'

describe('BeamRenderer', () => {
  let mockRenderer
  let mockGridRenderer
  let beamRenderer

  beforeEach(() => {
    // Mock renderer
    mockRenderer = {
      drawLine: vi.fn(),
      drawCircle: vi.fn(),
      drawCircleOutline: vi.fn(),
      drawTriangle: vi.fn(),
      setLineWidth: vi.fn(),
      ctx: { globalAlpha: 1.0 }
    }

    // Mock grid renderer
    mockGridRenderer = {
      cellWidth: 16,
      cellHeight: 20
    }

    beamRenderer = new BeamRenderer(mockRenderer, mockGridRenderer)
  })

  describe('Constructor', () => {
    it('should create beam renderer with valid inputs', () => {
      expect(beamRenderer.renderer).toBe(mockRenderer)
      expect(beamRenderer.gridRenderer).toBe(mockGridRenderer)
    })

    it('should throw error on null renderer', () => {
      expect(() => new BeamRenderer(null, mockGridRenderer)).toThrow('Invalid renderer')
    })

    it('should throw error on null gridRenderer', () => {
      expect(() => new BeamRenderer(mockRenderer, null)).toThrow('Invalid gridRenderer')
    })
  })

  describe('Basic Beam Drawing', () => {
    it('should draw beam path', () => {
      const beamPath = [
        { x: 1, y: 1, direction: DIRECTIONS.E },
        { x: 2, y: 1, direction: DIRECTIONS.E },
        { x: 3, y: 1, direction: DIRECTIONS.E }
      ]

      beamRenderer.drawBeam(beamPath)

      expect(mockRenderer.drawLine).toHaveBeenCalled()
      expect(mockRenderer.setLineWidth).toHaveBeenCalled()
    })

    it('should handle empty beam path', () => {
      beamRenderer.drawBeam([])

      expect(mockRenderer.drawLine).not.toHaveBeenCalled()
    })

    it('should handle null beam path', () => {
      beamRenderer.drawBeam(null)

      expect(mockRenderer.drawLine).not.toHaveBeenCalled()
    })

    it('should handle single cell path', () => {
      const beamPath = [{ x: 1, y: 1, direction: DIRECTIONS.E }]

      beamRenderer.drawBeam(beamPath)

      expect(mockRenderer.setLineWidth).toHaveBeenCalled()
    })
  })

  describe('Beam with Mirrors', () => {
    it('should highlight mirror cells', () => {
      const beamPath = [
        { x: 1, y: 1, direction: DIRECTIONS.E },
        { x: 2, y: 1, direction: DIRECTIONS.E },
        { x: 3, y: 1, direction: DIRECTIONS.N }
      ]

      const mirrors = {
        '3,1': { type: '/', x: 3, y: 1 }
      }

      beamRenderer.drawBeam(beamPath, mirrors)

      // Should draw reflection marker for mirror cell
      expect(mockRenderer.drawCircle).toHaveBeenCalled()
      expect(mockRenderer.drawCircleOutline).toHaveBeenCalled()
    })

    it('should draw reflection markers', () => {
      beamRenderer.drawReflectionMarker(100, 100)

      expect(mockRenderer.drawCircle).toHaveBeenCalled()
      expect(mockRenderer.drawCircleOutline).toHaveBeenCalled()
    })
  })

  describe('Beam Gradient', () => {
    it('should draw beam with gradient effect', () => {
      const beamPath = [
        { x: 1, y: 1, direction: DIRECTIONS.E },
        { x: 2, y: 1, direction: DIRECTIONS.E },
        { x: 3, y: 1, direction: DIRECTIONS.E }
      ]

      beamRenderer.drawBeamGradient(beamPath)

      expect(mockRenderer.drawLine).toHaveBeenCalled()
      expect(mockRenderer.setLineWidth).toHaveBeenCalled()
    })

    it('should apply varying opacity', () => {
      const beamPath = [
        { x: 1, y: 1, direction: DIRECTIONS.E },
        { x: 2, y: 1, direction: DIRECTIONS.E },
        { x: 3, y: 1, direction: DIRECTIONS.E }
      ]

      beamRenderer.drawBeamGradient(beamPath)

      // globalAlpha should be modified
      expect(mockRenderer.ctx.globalAlpha).toBe(1.0) // Reset after
    })
  })

  describe('Endpoint Drawing', () => {
    it('should draw endpoint indicator', () => {
      beamRenderer.drawEndpoint(5, 5, false)

      expect(mockRenderer.drawCircle).toHaveBeenCalled()
      expect(mockRenderer.drawCircleOutline).toHaveBeenCalled()
    })

    it('should use different color for complete endpoint', () => {
      beamRenderer.drawEndpoint(5, 5, true)

      expect(mockRenderer.drawCircle).toHaveBeenCalled()
    })
  })

  describe('Direction Arrows', () => {
    it('should draw north arrow', () => {
      beamRenderer.drawDirectionArrow(5, 5, DIRECTIONS.N)

      expect(mockRenderer.drawTriangle).toHaveBeenCalled()
    })

    it('should draw south arrow', () => {
      beamRenderer.drawDirectionArrow(5, 5, DIRECTIONS.S)

      expect(mockRenderer.drawTriangle).toHaveBeenCalled()
    })

    it('should draw east arrow', () => {
      beamRenderer.drawDirectionArrow(5, 5, DIRECTIONS.E)

      expect(mockRenderer.drawTriangle).toHaveBeenCalled()
    })

    it('should draw west arrow', () => {
      beamRenderer.drawDirectionArrow(5, 5, DIRECTIONS.W)

      expect(mockRenderer.drawTriangle).toHaveBeenCalled()
    })

    it('should handle invalid direction', () => {
      beamRenderer.drawDirectionArrow(5, 5, 'INVALID')

      expect(mockRenderer.drawTriangle).not.toHaveBeenCalled()
    })
  })

  describe('Beam with Effects', () => {
    it('should draw beam with all effects', () => {
      const beamPath = [
        { x: 1, y: 1, direction: DIRECTIONS.E },
        { x: 2, y: 1, direction: DIRECTIONS.E },
        { x: 3, y: 1, direction: DIRECTIONS.N }
      ]

      const options = {
        showGradient: true,
        showArrows: true,
        showEndpoint: true,
        endpointComplete: true
      }

      beamRenderer.drawBeamWithEffects(beamPath, options)

      expect(mockRenderer.drawLine).toHaveBeenCalled()
      expect(mockRenderer.drawTriangle).toHaveBeenCalled() // Arrows
      expect(mockRenderer.drawCircle).toHaveBeenCalled() // Endpoint
    })

    it('should draw beam without optional effects', () => {
      const beamPath = [
        { x: 1, y: 1, direction: DIRECTIONS.E },
        { x: 2, y: 1, direction: DIRECTIONS.E }
      ]

      const options = {
        showGradient: false,
        showArrows: false,
        showEndpoint: false
      }

      beamRenderer.drawBeamWithEffects(beamPath, options)

      expect(mockRenderer.drawLine).toHaveBeenCalled()
    })

    it('should handle empty options', () => {
      const beamPath = [
        { x: 1, y: 1, direction: DIRECTIONS.E },
        { x: 2, y: 1, direction: DIRECTIONS.E }
      ]

      beamRenderer.drawBeamWithEffects(beamPath, {})

      expect(mockRenderer.drawLine).toHaveBeenCalled()
    })
  })

  describe('Long Beam Paths', () => {
    it('should handle long beam paths efficiently', () => {
      const beamPath = []
      for (let i = 0; i < 50; i++) {
        beamPath.push({ x: i, y: 1, direction: DIRECTIONS.E })
      }

      const start = performance.now()
      beamRenderer.drawBeam(beamPath)
      const elapsed = performance.now() - start

      expect(elapsed).toBeLessThan(50) // Should be fast
      expect(mockRenderer.drawLine.mock.calls.length).toBe(49) // 50 cells = 49 lines
    })
  })

  describe('Edge Cases', () => {
    it('should handle beam with mirrors at every cell', () => {
      const beamPath = [
        { x: 1, y: 1, direction: DIRECTIONS.E },
        { x: 2, y: 1, direction: DIRECTIONS.N },
        { x: 2, y: 0, direction: DIRECTIONS.W }
      ]

      const mirrors = {
        '1,1': { type: '/', x: 1, y: 1 },
        '2,1': { type: '\\', x: 2, y: 1 },
        '2,0': { type: '/', x: 2, y: 0 }
      }

      beamRenderer.drawBeam(beamPath, mirrors)

      // Should draw multiple lines for the path
      expect(mockRenderer.drawLine.mock.calls.length).toBeGreaterThan(0)
      // Should draw at least some circles (mirror markers)
      expect(mockRenderer.drawCircle.mock.calls.length).toBeGreaterThanOrEqual(1)
    })

    it('should handle beam at canvas edge', () => {
      const beamPath = [
        { x: 0, y: 0, direction: DIRECTIONS.E },
        { x: 1, y: 0, direction: DIRECTIONS.E }
      ]

      beamRenderer.drawBeam(beamPath)

      expect(mockRenderer.drawLine).toHaveBeenCalled()
    })
  })
})
