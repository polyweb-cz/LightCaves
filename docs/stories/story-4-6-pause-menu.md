# Story 4.6: Pause Menu

## User Story

**As a** hráč
**I want to** pozastavit hru a vrátit se do menu nebo do nastavení
**So that** mohu se podívat na nastavení nebo si vzít pauzu během hry

## Popis

Vytvořit pause menu:
- Zobrazit se Escape klíčem během hry
- Tlačítka: Obnovit (Resume), Nastavení, Menu
- Pozastavit gameplay (žádné updaty)
- Vrátit se do hry nebo na menu
- Klávesová navigace (šipky, Enter, Escape)

## Acceptance Criteria

- [ ] Třída PauseMenu
- [ ] show() - zobrazí menu s Resume, Settings, Menu tlačítky
- [ ] hide() - skryje menu
- [ ] Escape klíč pozastavuje hru
- [ ] Resume vrací do hry
- [ ] Settings otevře nastavení
- [ ] Menu vrací do hlavního menu
- [ ] Klávesová navigace (šipky, Enter)
- [ ] Unit testy: 15 testů
- [ ] npm test projde

## Odhad

- 0.5 dne (pause UI + testy + integrace)

## Acceptance Status

- [ ] Implemented
- [ ] Tested (15+ tests)
- [ ] Integrated into main.js
- [ ] Committed to git
