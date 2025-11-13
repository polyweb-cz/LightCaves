# Game Module

Core game engine and physics logic.

## Files

- **game.js** - Game orchestrator, state management, main loop
- **physics.js** - Physics engine (beam propagation, reflections)
- **renderer.js** - Canvas rendering and visualization
- **level-parser.js** - TXT level parser

## Responsibilities

- Manage game state (current level, mirrors, beam path)
- Calculate physics (beam propagation through maps)
- Render game to Canvas
- Load and parse levels

## Key Concepts

- Game state is immutable during each frame
- Physics calculations are deterministic
- Renderer is decoupled from physics (data → view)

## References

- See Architecture document Section 3-8 for detailed design
- Epic 2: Core Physics Engine
- Epic 3: Basic Rendering System
