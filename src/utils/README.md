# Utils Module

Utility functions, constants, and helpers.

## Files

- **constants.js** - Global constants, reflection table, enums
- **storage.js** - localStorage wrapper for persistence
- **input.js** - Input handling (mouse, keyboard)

## Responsibilities

- Provide shared constants
- Handle local storage (progress, settings)
- Manage user input events
- Convert pixel coordinates to grid coordinates

## Key Concepts

- constants.js is immutable (frozen objects)
- Reflection table is critical for physics engine
- Input is event-driven

## References

- Architecture document Section 6 & 7
- Epic 1: Project Setup
- Epic 6: Persistence & Settings
