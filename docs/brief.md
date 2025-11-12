# LightCaves - Brief

**Verze:** 1.0
**Datum:** 2025-11-12

---

## Co to je

LightCaves je minimalistická puzzle hra: osvětluješ temný labyrint pomocí zrcadel a světelných paprsků. **Vidíš jen to, co osvětlíš.**

- ASCII grafika (záměrně minimalistická)
- Levely v TXT souborech (vytvoř si vlastní v textovém editoru)
- Offline (žádný internet)
- Multijazyčná
- Cesta: Web prototyp → Steam

---

## Proč to děláme

Chybí čisté logické hry, které fungují offline, nemají reklamy, a respektují hráče. LightCaves kombinuje:

1. **Světlo = informace** - Mapa skrytá, odhaluje se postupně
2. **Text-based levely** - Vytvoř level v notepadech
3. **Offline-first** - Tvá hra, tvoje data, tvoje zařízení

---

## MVP Scope

### CO JE v MVP

| Kategorie | Features |
|-----------|----------|
| **Mechaniky** | Světelná fyzika, zrcadla `/` a `\`, fog-of-war, 50% průhlednost, detekce výhry |
| **Ovládání** | Paleta zrcadel, klik = polož/odeber, Undo/Redo, Reset |
| **UI** | Menu levelů, statistiky (pohyby/čas), obrazovka vítězství, nastavení (jazyk, font, barvy), klávesové zkratky |
| **Obsah** | 20 levelů (5 tutorial, 15 gameplay), TXT formát, metadata |
| **Tech** | Offline (Service Worker), localStorage, 5 jazyků, 60 FPS |
| **Přístupnost** | Klávesnice, screen reader, nastavitelný font, high contrast |

### CO NENÍ v MVP

**Odloženo:** RGB paprsky, polopropustné zdi, 3+ světelné zdroje, pohyblivá zrcadla, editor UI, zvuky, Steam integrace

**Záměrně NE:** 3D, procedural generování, multiplayer, mobilní app, mikrotransakce, tracking

---

## Obsah - 20 levelů

**Tutorial (1-5):** Učí základní mechaniky postupně
**Easy (6-10):** 8-12x12, 1 zdroj, 1-2 targety, 1-3 zrcadla
**Medium (11-18):** 12-20x15, 1-2 zdroje, 2-3 targety, 3-6 zrcadel
**Hard (19-20):** 15-25x20, 1-3 zdroje, 3-5 targetů, 6-12 zrcadel

---

## Timeline

**Měsíc 1:** Core engine (fyzika, zrcadla, UI)
**Měsíc 2:** Level systém + 10 tutorial/easy levelů + lokalizace
**Měsíc 3:** 10 medium/hard levelů + polish + přístupnost
**Měsíc 4:** Testování (20+ lidí) + bugfixy + balance

**Web launch:** 4-5 měsíců (itch.io, vlastní web)
**Steam:** 6-9 měsíců

---

## Top 3 rizika

1. **Core mechanika není zábavná**
   Mitigation: Rychlý prototyp (2-3 týdny) + playtesting (10+ lidí) → Go/No-go decision

2. **ASCII estetika odpuzuje hráče**
   Mitigation: Rámovat jako design choice, polish prezentaci. Contingency: Pixel art tileset

3. **Nedostatek kvalitních levelů**
   Mitigation: 30% času na level design, playtestery, studium konkurence. Contingency: Delay launch

---

## Reflexní tabulka (KRITICKÉ!)

| Příchozí směr | Zrcadlo `/` | Zrcadlo `\` |
|---------------|-------------|-------------|
| Z leva (►)    | Dolů (▼)    | Nahoru (▲)  |
| Z prava (◄)   | Nahoru (▲)  | Dolů (▼)    |
| Shora (▼)     | Vpravo (►)  | Vlevo (◄)   |
| Zdola (▲)     | Vlevo (◄)   | Vpravo (►)  |

**Symboly:**
- **Zdi:** █
- **Prázdno:** . (místo pro zrcadla)
- **Zrcadla:** / a \
- **Světelné zdroje:** ▲►▼◄
- **Targety:** △▷▽◁ (musí být trefeny ze správného směru!)

---

**Next step:** Prototyp za 2-3 týdny → Go/No-go decision
