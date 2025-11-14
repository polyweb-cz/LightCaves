/**
 * @fileoverview Global constants, enums, and lookup tables
 * @module utils/constants
 */

// Directions (N=North, S=South, E=East, W=West)
export const DIRECTIONS = Object.freeze({
  N: 'N',
  S: 'S',
  E: 'E',
  W: 'W'
})

// ASCII Symbols
export const SYMBOLS = Object.freeze({
  WALL: '█',
  EMPTY: ' ',
  MIRROR_SLASH: '/',
  MIRROR_BACKSLASH: '\\',
  LAMP_N: '▲',
  LAMP_E: '►',
  LAMP_S: '▼',
  LAMP_W: '◄',
  TARGET_N: '△',
  TARGET_E: '▷',
  TARGET_S: '▽',
  TARGET_W: '◁'
})

// Colors
export const COLORS = Object.freeze({
  BG: '#000000',
  FG: '#FFFFFF',
  TEXT: '#FFFFFF',
  ACCENT: '#00FF00',
  BEAM: '#FFFF00',
  BEAM_DIM: '#808080'
})

// Reflection lookup table
// Key: mirrorType + direction
// Value: new direction after reflection
export const REFLECTION_TABLE = Object.freeze({
  '/': Object.freeze({
    [DIRECTIONS.N]: DIRECTIONS.E,
    [DIRECTIONS.S]: DIRECTIONS.W,
    [DIRECTIONS.E]: DIRECTIONS.N,
    [DIRECTIONS.W]: DIRECTIONS.S
  }),
  '\\': Object.freeze({
    [DIRECTIONS.N]: DIRECTIONS.W,
    [DIRECTIONS.S]: DIRECTIONS.E,
    [DIRECTIONS.E]: DIRECTIONS.S,
    [DIRECTIONS.W]: DIRECTIONS.N
  })
})

// Cell types
export const CELL_TYPES = Object.freeze({
  WALL: 'wall',
  EMPTY: 'empty',
  LAMP: 'lamp',
  TARGET: 'target',
  MIRROR: 'mirror'
})

// Grid configuration
export const GRID_CONFIG = Object.freeze({
  CELL_WIDTH_PX: 16,
  CELL_HEIGHT_PX: 20,
  FONT_FAMILY: "'Courier New', Courier, monospace",
  FONT_SIZE_PX: 16,
  MIN_WIDTH: 6,
  MAX_WIDTH: 30,
  MIN_HEIGHT: 4,
  MAX_HEIGHT: 16
})

// Game config
export const GAME_CONFIG = Object.freeze({
  MAX_BEAM_LENGTH: 100,
  DEVELOPMENT_MODE: true
})
