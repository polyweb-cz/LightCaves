# Story: Core Gameplay Mechanics Integration

## User Story

**As a** hráč
**I want to** umístit zrcadla a vidět, jak světlo cestuje
**So that** mohu hru hrát a řešit míchání

## Popis

Propojit fyziku hry s herním loopmem:
- Klik/Enter umístí zrcadlo na mřížku
- Undo/Redo funkčnost
- Výpočet cesty světla po umístění zrcadla
- Detekce vítězství (cíl osvětlen)
- Trigger GameOverScreen na vítězství
- Update HUD se statistikou
- Zobrazit osvětlené buňky na mřížce

## Features

- [ ] Click/Enter umístí zrcadlo (/ nebo \\)
- [ ] Undo/Redo systém
- [ ] Kalkula cesty světla na každou změnu
- [ ] Detekce osvětlení cíle
- [ ] Trigger victory screen
- [ ] Update HUD stats (čas, tahy)
- [ ] Zobrazit paprsku/osvětlené buňky
- [ ] Keyboard + Mouse vstup
- [ ] Unit testy: 20+ testů

## Acceptance Criteria

- [ ] GameState class updated for gameplay
- [ ] Mirror placement working
- [ ] Undo/Redo functional
- [ ] Light path calculated
- [ ] Victory detection working
- [ ] GameOverScreen triggered
- [ ] HUD updated
- [ ] Full keyboard + mouse control
- [ ] npm test projde

## Odhad

- 1 den (gameplay + testy + integrace)
