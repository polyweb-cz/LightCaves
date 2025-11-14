# Story 4.7: Game Over Screen

## User Story

**As a** hráč
**I want to** vidět obrazovku po dokončení úrovně (vítězství nebo porážka)
**So that** vím, zda jsem úroveň vyřešil nebo mohu zkusit znovu

## Popis

Vytvořit game over screen:
- Zobrazí se když je cíl osvětlen (victory) nebo hráč vzdá (defeat)
- Nastaví hru do paused stavu
- Tlačítka: Znovu (Restart), Další úroveň (Next), Menu
- Zobrazit čas a počet tahů
- Klávesová navigace
- Modal overlay s informacemi

## Acceptance Criteria

- [ ] Třída GameOverScreen
- [ ] showVictory() - zobrazí victory screen
- [ ] showDefeat() - zobrazí defeat screen
- [ ] hide() - skryje screen
- [ ] Restart button - restart aktuální úrovně
- [ ] Next button - postup na další úroveň (pouze victory)
- [ ] Menu button - vrátí do menu
- [ ] Zobrazit čas a počet tahů
- [ ] Klávesová navigace
- [ ] Unit testy: 15 testů
- [ ] npm test projde

## Odhad

- 0.5 dne (game over UI + testy + integrace)

## Acceptance Status

- [ ] Implemented
- [ ] Tested (15+ tests)
- [ ] Integrated into main.js
- [ ] Committed to git
