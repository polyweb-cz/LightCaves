# Data Module

Game data, levels, and localization strings.

## Files

- **levels.js** - Level definitions (generated from TXT files)
- **strings.json** - i18n translations (Czech/English)

## Responsibilities

- Provide level data to game
- Supply localized strings to UI
- Language switching

## Key Concepts

- Levels are loaded from TXT format (see Epic 5)
- Strings are externalized for easy translation
- levels.js is auto-generated during build

## References

- Epic 5: Level System
- Epic 6: Persistence & Settings
