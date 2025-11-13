# LightCaves

A minimalist logic puzzle game inspired by paper games with mirrors and light beams.

## Quick Start

```bash
# Install dependencies
npm install

# Development (hot reload on :5173)
npm run dev

# Production build
npm run build

# Preview build
npm run preview
```

## Project Structure

```
src/
  game/           - Core game engine (physics, rendering, state)
  ui/             - User interface (menus, modals, HUD)
  data/           - Game data (levels, translations)
  utils/          - Utilities (constants, storage, input)
styles.css        - Global CSS
main.js           - Entry point

docs/
  brief.md        - Project overview
  prd.md          - Product requirements
  architektura.md - Technical architecture
  epics/          - 6 Epics for MVP
  stories/        - Individual story specifications

public/           - Static assets
dist/             - Production build (generated)
```

## Development

- **Node.js 16+** and **npm 7+** required
- All code is vanilla JavaScript (no frameworks)
- CSS custom properties for theming
- Monospace font (Courier New) for ASCII aesthetic

## Architecture

See `docs/architektura.md` for detailed technical design.

### Key Modules

- **Game** - Orchestrator, state management
- **PhysicsEngine** - Beam propagation, reflections
- **Renderer** - Canvas rendering
- **UIManager** - Menu and HUD
- **StorageManager** - Persistence
- **Constants** - Reflection table, symbols, colors

## MVP Roadmap

- **Epic 1:** Project Setup ✅
- **Epic 2:** Core Physics Engine
- **Epic 3:** Basic Rendering System
- **Epic 4:** UI & Navigation
- **Epic 5:** Level System
- **Epic 6:** Persistence & Settings

See `docs/epics/` for detailed epic descriptions.

## Status

🚀 In Development - MVP Phase 1 (Vite Setup)
