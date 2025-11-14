# Story 4.4: Game HUD Integration

## User Story

**As a** hráč
**I want to** vidět HUD během hraní s všemi aktuálními informacemi
**So that** mám přehled o svém pokroku

## Popis

Integrovat HUD systém do herního okna:
- Zobrazení HUD prvků rendererem
- Aktualizace statistik v reálném čase
- Přechod HUD prvků při změnách
- Dostupné akce přes HUD (Undo, Redo, Reset, Menu)

## Acceptance Criteria

- [ ] Třída GameHUD
- [ ] updateStats(stats) - aktualizuje zobrazované hodnoty
- [ ] drawHUD() - renderuje všechny prvky
- [ ] onButtonClick(buttonType) - event handler
- [ ] Unit testy: 12 testů
- [ ] npm test projde

## Odhad

- 0.5 dne
