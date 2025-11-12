# LightCaves - PRD

**Verze:** 1.0
**Datum:** 2025-11-12

---

## Přehled

LightCaves je minimalistická puzzle hra: hráč osvětluje temné labyrinty pomocí zrcadel a světelných paprsků. Mapa je zpočátku skrytá - vidíš jen to, co osvětlíš. Kombinuje logiku (kam dát zrcadlo?) se spatial reasoningem (co je za tou zdí?).

**Cíl MVP:** Hratelný web prototyp s 20 levely do 4 měsíců.

---

## Herní mechaniky

### Světlo

**Šíření:**
- Světlo jde rovně (↑↓←→) dokud nenarazí na překážku
- Hlavní paprsek = 100% viditelnost
- Vedlejší řádky/sloupce = 50% průhlednost (vidíš terén, ale ztmavený)
- Už odhalené zůstává vidět (persistentní znalost)

**Zastavení:**
- Stěny (█), targety (△▷▽◁), nebo zrcadla zastaví paprsek
- Zrcadla odráží světlo o 90°

### Zrcadla - Reflexní tabulka (KRITICKÉ!)

| Příchozí směr | Zrcadlo `/` | Zrcadlo `\` |
|---------------|-------------|-------------|
| Z leva (►)    | Dolů (▼)    | Nahoru (▲)  |
| Z prava (◄)   | Nahoru (▲)  | Dolů (▼)    |
| Shora (▼)     | Vpravo (►)  | Vlevo (◄)   |
| Zdola (▲)     | Vlevo (◄)   | Vpravo (►)  |

**Pravidla:**
- Lze umístit jen na prázdné buňky (.)
- Unlimited inventory v MVP
- Klik = polož, klik na zrcadlo = odeber
- Pravý klik = změň orientace (/ ↔ \)

### Fog-of-War

**Počáteční stav:** Vše je tmavé kromě světelných zdrojů (▲►▼◄)

**Odhalování:**
- Přímý paprsek → plně viditelné
- 50% průhlednost → částečně viditelné (ztmavené)
- Jednou odhalené → zůstane vidět

### Cíle (Targety)

**Typy:**
- △ = Musí být trefeno zespodu (světlo jde nahoru)
- ▷ = Musí být trefeno zleva (světlo jde doprava)
- ▽ = Musí být trefeno shora (světlo jde dolů)
- ◁ = Musí být trefeno zprava (světlo jde doleva)

**Výhra:** Všechny targety osvětlené SOUČASNĚ ze správných směrů → Level complete!

---

## UI

### Layout

```
┌─────────────────────────────────────────┐
│ [Paleta: / \] [Undo] [Redo] [Reset]   │
│ Pohyby: 12  Čas: 3:45                  │
├─────────────────────────────────────────┤
│                                         │
│            ██████████                  │
│            █►......█                  │
│            █........█                  │
│            █......△.█                  │
│            ██████████                  │
│                                         │
└─────────────────────────────────────────┘
```

**Komponenty:**
- Mřížka: ASCII, monospace font, škálovatelná
- Paleta: Klik vybere zrcadlo (/ nebo \)
- Stats: Pohyby + čas (real-time)
- Victory screen: Stats + "Další level" / "Zopakuj" / "Menu"

### Menu levelů

- Seznam všech levelů
- Indikátory: Zamčené (šedé), Odemčené, Dokončené (checkmark)
- Metadata: Název, obtížnost, best stats

---

## MVP Features

- Světelná fyzika (šíření, odrazy, 50% průhlednost)
- Zrcadla `/` a `\` s reflexní tabulkou
- Fog-of-war (persistentní discovery)
- Detekce výhry (všechny targety)
- UI: Paleta, umístění, statistiky, victory screen
- Undo/Redo (min. 10 kroků)
- Reset levelu
- Menu výběru levelů
- 20 levelů (5 tutorial + 15 gameplay)
- TXT formát levelů
- localStorage (uložení postupu)
- Offline (Service Worker)
- 5 jazyků: EN, CS, ES, DE, FR
- Klávesové zkratky
- Screen reader support (ARIA)

---

## Tech Stack

**Frontend:**
- JavaScript (vanilla nebo TypeScript)
- HTML5 Canvas nebo DOM-based ASCII
- Vite (bundling)
- localStorage (save data)
- Service Worker (offline)

**Backend:**
- Žádný! Statické soubory only

**Hosting:**
- GitHub Pages / Netlify / Vercel (free tier)

**Performance:**
- 60 FPS na 5-year-old hardware
- Level load < 100ms
- Initial load < 2s

---

## 5 klíčových User Stories

### 1. Zobrazit mapu
**Jako hráč chci vidět mřížku levelu, abych plánoval strategie.**
- Grid vycentrovaný, ASCII znaky
- Viditelné: světelné zdroje + osvětlené oblasti
- Neviditelné: tmavé buňky (fog-of-war)

### 2. Umístit zrcadlo
**Jako hráč chci umístit zrcadlo, abych nasměroval světlo.**
- Vyberu typ z palety (/ nebo \)
- Klik na prázdnou buňku → umístí zrcadlo
- Světlo se okamžitě šíří a odhaluje nové oblasti

### 3. Rotovat zrcadlo
**Jako hráč chci změnit orientaci zrcadla, abych experimentoval.**
- Pravý klik přepíná / ↔ \
- Nebo kliknu na umístěné zrcadlo = odeber, pak umístím jiný typ

### 4. Detekce cíle
**Jako hráč chci vědět, kdy jsem vyhrál, abych viděl progress.**
- Systém detekuje: všechny targety osvětlené + správný směr
- Victory screen s stats (zrcadla, pohyby, čas)
- Tlačítka: Další level / Zopakuj / Menu

### 5. Uložit progress
**Jako hráč chci pokračovat později, abych neztratil postup.**
- localStorage ukládá: odemčené levely, dokončené levely, best stats
- Auto-save po každém dokončení
- Funguje offline

---

## Formát levelu (TXT)

```
# Tutorial 1: First Light
LEVEL_NAME=Tutorial 1
AUTHOR=BMAD Team
DIFFICULTY=Easy
SIZE=10x10

██████████
█►......█
█........█
█........█
█......△.█
██████████
```

**Symboly:**
- `█` = Zeď (solid)
- `.` = Prázdný prostor (lze umístit zrcadlo)
- `/` `\` = Pre-placed zrcadla (optional)
- `▲►▼◄` = Světelné zdroje (směrové)
- `△▷▽◁` = Targety (směrové)

**Metadata:**
- LEVEL_NAME (povinné)
- AUTHOR (povinné)
- DIFFICULTY: Easy/Medium/Hard (povinné)
- SIZE: ŠxV (povinné)
- HINT: Text nápovědy (optional)

---

**Konec PRD** - Zbytek vyřešíme během vývoje.
