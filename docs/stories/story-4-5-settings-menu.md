# Story 4.5: Settings Menu

## User Story

**As a** hráč
**I want to** upravit nastavení hry (zvuk, grafika, obtížnost)
**So that** mám hru přizpůsobenou podle svých preferencí

## Popis

Vytvořit nastavení menu:
- Zvuk: Zapnout/vypnout, hlasitost
- Grafika: FPS limit, kvalita
- Obtížnost: Default level difficulty
- Ovládání: Zobrazit klávesy
- Resetovat nastavení
- Uložit a zavřít

## Acceptance Criteria

- [ ] Třída SettingsMenu
- [ ] showSettings() - zobrazí menu
- [ ] hideSettings() - skryje menu
- [ ] saveSetting(key, value) - uloží nastavení
- [ ] getSetting(key) - vrátí nastavení
- [ ] Sliders pro hlasitost a FPS
- [ ] Toggle buttons pro zvuk a grafiku
- [ ] Unit testy: 15 testů
- [ ] npm test projde

## Odhad

- 0.5 dne (settings UI + testy)
