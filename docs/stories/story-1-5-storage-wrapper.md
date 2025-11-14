# Story 1.5: Storage Wrapper

## User Story

**As a** vývojář
**I want to** mít localStorage wrapper pro ukládání dat
**So that** mohu snadno uložit a načíst hráčův progres

## Popis

Implementovat `StorageManager` třídu v `src/utils/storage.js` s metodami pro:
- Kontrolu dostupnosti localStorage
- Uložení progressu (completedLevels, currentLevel)
- Načtení progressu
- Smazání progressu
- Obsluha chyb

## Acceptance Criteria

- [ ] StorageManager.isAvailable() kontroluje localStorage dostupnost
- [ ] StorageManager.saveProgress(data) ukládá do localStorage
- [ ] StorageManager.loadProgress() načítá uložená data
- [ ] StorageManager.clearProgress() maže vše
- [ ] Chyby jsou logované (ne thrown)
- [ ] Unit testy pro storage (min 5 testů)
- [ ] `npm test` projde bez chyb
- [ ] Build funguje (`npm run build`)

## Technical Details

### Data struktura
```javascript
{
  version: '1.0',
  completedLevels: [1, 2, 3],
  currentLevel: 4,
  timestamp: Date.now()
}
```

### Metody

- `isAvailable()` → boolean
- `saveProgress(progressData)` → void
- `loadProgress()` → object | null
- `clearProgress()` → void
- `setLanguage(lang)` → void
- `getLanguage()` → string

## Odhad

- 0.5 dne (implementace + testy)
