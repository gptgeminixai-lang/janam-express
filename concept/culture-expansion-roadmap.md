I have everything I need. The existing schemas confirm: `nakshatras.json` already carries deity/symbol/animal/tree/lord/gana (so the full-attribute card and naam-akshar just extend it), `rashis.json` already carries lord/element/quality (so lucky-attributes append cleanly), and `kundli.js` already exposes `moonLon`, `moonNakshatra.index`, `moonNakshatra.pada`, `moonRashi`, and per-graha sign placements — exactly the inputs the whole Jyotish cluster keys off. Writing the roadmap now.

# Janam Express — Culture & Astrology Expansion Roadmap

*Product-lead decision doc. Everything below respects the standing rule: rich, respectful cultural garnish — never hard prediction, never marriage-anxiety or dosha-shaming. We collect DOB (1950–2010) + city + name only. No birth time, so no lagna/houses — but as this roadmap shows, that costs us almost nothing.*

The strategic headline: **`kundli.js` already computes everything the flagship features need.** It exposes `moonLon` (exact sidereal Moon longitude), `moonNakshatra.index`, `moonNakshatra.pada`, `moonRashi`, `sunRashi`, and per-graha sign placements. The single biggest unlock — Vimshottari Mahadasha — keys *only* off `moonLon` within its nakshatra and needs **zero birth time**. Most of the rest is static lookup tables or one-line arithmetic on data already in hand.

---

## 1. TOP 12 — highest-impact additions, best first

Ranked by (uniquely-Indian wow × feasibility × clean, license-safe data). "BT?" = needs birth time. "Ready?" = data-ready today.

| # | Feature | Effort | BT? | Ready? |
|---|---------|--------|-----|--------|
| **1** | **Vimshottari Mahadasha — the planetary era you were born into** | | | |

**1. Vimshottari Mahadasha** — the flagship. Turn the coming-soon "weekly reading" page into a real 120-year life-ribbon.
- *Wow:* "You arrived in the middle of your Jupiter Mahadasha — a 16-year chapter of the sky. Today the wheel has turned to Saturn."
- *Compute:* `fraction = (moonLon mod 13.3333)/13.3333`; nakshatra lord (Ketu-Venus-Sun-Moon-Mars-Rahu-Jupiter-Saturn-Mercury, repeating across 27 stars) = birth dasha lord; balance = `(1−fraction) × lordYears`; roll forward through the fixed 120-yr sequence (Ke7-Ve20-Su6-Mo10-Ma7-Ra18-Ju16-Sa19-Me17) to today's age. Pure arithmetic on existing `moonLon`. Source: en.wikipedia.org/wiki/Dasha_(astrology).
- *Effort:* Easy · **BT? No** (sequence is birth-time-free; only start-date-to-the-day needs the hour — caption honestly) · Ready? **Yes**

**2. Naam-Akshar — the syllable the stars picked for your name.** Uniquely Indian, culturally warm, and we *already compute the pada*.
- *Wow:* "The sky filed you under Ashwini, first quarter — by tradition your name should have begun with 'Chu'. Did it?"
- *Compute:* 108-cell (27×4) swar table keyed by `[moonNakshatra.index][pada−1]`. Source: drikpanchang.com/swar-siddhanta. Present as a *reveal* ("children of Rohini pada 2 are named starting with Vaa…"), **never** as validation of the typed name (romanized matching is unreliable).
- *Effort:* Trivial · **BT? No** · Ready? **Yes** (pada already in `moonNakshatra`)

**3. Ank Jyotish — Moolank + Bhagyank (+ Naamank).** Visually rhymes with our existing navagraha theme (same 9 planets).
- *Wow:* "Your birth day makes you a Moolank 9 — Mars's champion — walking a Bhagyank 6 path of Venus."
- *Compute:* Moolank = digit-sum of day→1-9; Bhagyank = digit-sum of full DOB→1-9; Naamank = Chaldean letter-values of the typed name→1-9. Planet map: 1 Sun, 2 Moon, 3 Jupiter, 4 Rahu, 5 Mercury, 6 Venus, 7 Ketu, 8 Saturn, 9 Mars. Bundle one 9-row trait table + a 9×9 friendship matrix. Sources: jcchaudhry.com (Chaldean chart), caesarcipher.org, daanyam.com.
- *Effort:* Trivial · **BT? No** (date + name only) · Ready? **Yes**

**4. Raja Ravi Varma deity portrait on the Astrology beat.** The most reproduced devotional images in Indian history, cleanly public domain.
- *Wow:* "The goddess who watches over your star — Lakshmi, painted 1896."
- *Data:* Map computed nakshatra-deity / rashi-lord → curated Ravi Varma filename. Commons *Category:Depiction of Hindu Gods and Goddesses by Raja Ravi Varma* (49 files; Lakshmi 18, Saraswati 14). PD-old-100 (Varma d.1906) — **no attribution**. Build-time fetch via `Special:FilePath`, downscale to ~600–800px WebP, self-host in `/public`.
- *Effort:* Easy · **BT? No** · Ready? **Yes**

**5. Planetary dignity — which grahas sit exalted, debilitated, at home.** Instant richness on the chart we already draw.
- *Wow:* "Your Saturn stands exalted in Libra — the taskmaster at the top of its game the day you were born."
- *Compute:* Static exaltation/own-sign table vs the sign indices `rashiChart()` already returns. Exalt: Sun♈ Moon♉ Mars♑ Mercury♍ Jupiter♋ Venus♓ Saturn♎ (debilitation = 7th sign opposite). Source: steer.coach/exaltation-debilitation.
- *Effort:* Trivial · **BT? No** (sign, not house) · Ready? **Yes**

**6. Moon-based yogas — Gajakesari, Sunapha/Anapha/Dhurdhura, Kemadruma, Chandra-Mangal.** A genuine "named combination in *your* chart" payoff, house-free by definition.
- *Wow:* "Jupiter sat four signs from your Moon — the Gajakesari yoga, the old blessing of the elephant and the lion."
- *Compute:* Sign-distance counting from `moonRashi` over existing `placements[]`. Gajakesari = Jupiter in kendra (1/4/7/10) from Moon; Sunapha/Anapha = benefic in 2nd/12th from Moon (exclude Sun/Rahu/Ketu); Kemadruma = neither occupied; Chandra-Mangal = Moon+Mars same sign. Source: thevedichoroscope.com, astroparasar.com.
- *Effort:* Easy · **BT? No** · Ready? **Yes**

**7. Nakshatra full-attribute card — Gana, Yoni, Nadi, deity, shakti.** Deepens the totem beat we already ship. *(Our `nakshatras.json` already has deity/symbol/animal/tree/lord/gana — this fills in Yoni/Nadi/Varna/shakti.)*
- *Wow:* "Your star's animal is the tiger, its temperament Rakshasa, its power the strength to break and rebuild."
- *Data:* Complete the 27-row attribute set. **Present as lore, NOT as Ashtakoot compatibility** — that road leads to dosha-shaming. Source: astronidan.com/nakshatras, vedaz.io.
- *Effort:* Easy once bundled · **BT? No** · Ready? **No** (needs one consolidated 27-row sourcing pass)

**8. Combustion & retrograde — the real sky-state of your planets that day.** Astronomically true, not superstition.
- *Wow:* "The day you were born, Mercury was walking backwards and Venus was lost in the Sun's glare."
- *Compute:* Combust = planet within orb of Sun (Moon 12°, Mars 17°, Mercury 14°, Jupiter 11°, Venus 10°, Saturn 15°) — subtraction on existing longitudes. Retrograde = finite-difference of geocentric longitude via astronomy-engine (already a dependency), 2 extra calls/planet. Sources: astroananta.com, blog.pocketpandit.com.
- *Effort:* Easy · **BT? No** (day-level) · Ready? **Yes**

**9. The 16 Samskaras — your rites-of-passage timeline.** Warm, specific, non-predictive; renders real Gregorian dates off the DOB.
- *Wow:* "At 11 days old, tradition says, your family gathered for your namakarana — the day the world first spoke your name aloud."
- *Compute:* Fixed offsets table (namakarana day 11–12, annaprashana ~6 mo, chudakarana ~1–3 yr, vidyarambha ~age 5 often on Vasant Panchami, upanayana ~age 8) + date arithmetic. Source: en.wikipedia.org/wiki/Samskara_(rite_of_passage), vedicfeed.com.
- *Effort:* Easy · **BT? No** · Ready? **Yes**

**10. Ratna, Rudraksha & Beej Mantra of your Moon-lord.** Cultural tokens, strictly heritage-framed ("tradition would hand a child of your Moon a pearl"), never a must-buy remedy.
- *Wow:* "Your planet's seed-sound: Om graam greem graum sah gurave namah — Jupiter's own beej mantra."
- *Data:* Moon-sign lord / nakshatra lord → gemstone (Sun=Ruby, Moon=Pearl, Mars=Red Coral, Mercury=Emerald, Jupiter=Yellow Sapphire, Venus=Diamond, Saturn=Blue Sapphire, Rahu=Hessonite, Ketu=Cat's Eye) + rudraksha mukhi + one of 9 beej mantras. Describe in text — **no product images** (licensing). Sources: drikpanchang gemstone calculator, vedapathshala.com (mantras).
- *Effort:* Trivial · **BT? No** · Ready? **Yes**

**11. Nakshatra Pada → Navamsa (D9) sign — the finer stamp inside your birth star.** A second, deeper coordinate at zero data cost.
- *Wow:* "Zoom nine times into your birth star and the sky files you under Meena — the navamsa of the dreamers."
- *Compute:* `nav_index = floor(moonLon / 3.3333) mod 12` with element-start mapping. Source: steer.coach/navamsa-d9-chart.
- *Effort:* Easy · **BT? No** (Moon's navamsa) · Ready? **Yes**

**12. 27 nakshatra symbol glyphs as hand-drawn SVG.** Self-authored = our copyright, zero license risk, tiny payload, themeable, fast on cheap Android.
- *Wow:* "Your birth-star's ancient sign — the horse, the cart, the coral — drawn just for you."
- *Data:* Symbol list is uncopyrightable tradition (Ashwini=horse's head, Rohini=cart, Chitra=pearl, Swati=coral/sprout…). No clean free raster set exists — so we draw ~27 flat single-color SVGs (~1–2 KB, `currentColor`-themed).
- *Effort:* Medium (27 drawings, once) · **BT? No** · Ready? **Yes** (once drawn)

---

## 2. THE BIG UNLOCKS

Three features are genuinely category-defining — the kind of thing no birthday site has, and all three are computable *without birth time*.

### 🟢 Vimshottari Mahadasha — the one true flagship
This is the feature that converts the dead "coming-soon reading" page into a real product. It's the exact table professional Jyotish software opens with, it's a gorgeous horizontal life-ribbon (born-into period → current lit period → running-now planet), and — the killer fact — **its sequence is 100% birth-time-free**, keying only off the Moon's position within its nakshatra, which we already compute. Nothing else in the roadmap has this ratio of authenticity-to-effort. Ship it and the site graduates from "cute snapshot" to "the sky's timeline of your whole life."

### 🟢 Naam-Akshar — the syllable your name "should" have started with
The single most *novel and on-brand* idea. It weds the two things we already collect — the Moon-nakshatra+pada and the typed name — into a warm, uncommon reveal ("by the old panchang, a child of your star would be named starting with 'Vaa'"). It needs zero new pipeline (the pada is already in hand), it's uniquely Indian (no Western analog), and it produces a personal "did your parents agree with the sky?" beat that people will screenshot. Frame it as a reveal, never as a verdict on the entered name.

### 🟢 Raja Ravi Varma deity imagery
The visual leap. Right now the astrology beats are text on CSS; a warm, luminous 1896 oil of *the deity that rules the user's own star* transforms the emotional register. It's the cleanest imagery win in Indian culture: PD-old-100 (no attribution), the most reproduced devotional images in the country, and it maps almost 1:1 onto data we already derive (nakshatra deity, rashi lord). Self-host ~20–30 curated JPEGs and every astrology card gains a painting.

*(Honorable mention: **Ank Jyotish** — trivial, robustly birth-time-free, and it visually rhymes with the navagraha theme we already use, so it reads as "of course this belongs here.")*

---

## 3. NEW SECTIONS PROPOSED

Group the ideas into four concrete new beats plus imagery upgrades to existing ones.

### Beat A — "Your Dasha" (new page: replaces the coming-soon "reading")
The flagship timeline page.
- **Fields:** birth mahadasha lord + one-line gloss · dasha balance (spent% / remaining years of birth period) · full 120-yr ribbon with current period lit · running-now planet + its gloss.
- **Bundle:** `dashas.json` — 9 rows: planet → period-years → 1-line character line. (Nakshatra→lord order is derivable, no table needed.) *All else is arithmetic on `moonLon`.*

### Beat B — "Your Numbers" (new card cluster on the astrology page)
- **Fields:** Moolank (day) + planet + trait + lucky day/colour/gem · Bhagyank (full DOB) + "same road" note when they match · Naamank (Chaldean) + friend/neutral/enemy badge vs Moolank · Naam-Akshar prescribed syllable.
- **Bundle:** `numerology.json` = { 9-row planet/trait/lucky table; Chaldean letter map (1=AIJQY, 2=BKR, 3=CGLS, 4=DMT, 5=EHNX, 6=UVW, 7=OZ, 8=FP); 9×9 friendship matrix } · `naam-akshar.json` = 108-cell (27×4) swar table.

### Beat C — "Your Chart, Deeper" (enrich the existing rashi-kundli beat)
Adds badges/lines onto the grid we already render.
- **Fields:** dignity badge per graha (exalted / debilitated / own / neutral) · yogas present (Gajakesari, Sunapha/Anapha/Dhurdhura, Kemadruma, Chandra-Mangal) with one-line glosses · Moon's navamsa sign · combust flags · retrograde flags.
- **Bundle:** `dignity.json` (7 planets × exalt/debil/own signs; ~7 rows) + `combustion-orbs.json` (6 rows). *Yogas, navamsa, retrograde = pure computation.*

### Beat D — "Your Star & Tokens" (enrich the nakshatra-matchbox / totem beat)
- **Fields:** full nakshatra attributes (Gana ✓existing, Yoni, Nadi, Varna, deity ✓existing, shakti) · Moon-lord gemstone + rudraksha mukhi + beej mantra · the 27 SVG symbol glyph.
- **Bundle:** extend `nakshatras.json` with `yoni / nadi / varna / shakti` (fills 27 rows already present) · `planet-tokens.json` = 9 rows (planet → gem, rudraksha, beej mantra) · 27 inline SVG glyphs.
- **Guardrail:** present Gana/Yoni/Nadi as descriptive lore only — **never** as an Ashtakoot compatibility score.

### Beat E — "Your Rites & Festivals" (new warm card, pairs with the ticket)
- **Fields:** 16-samskara timeline as real dates off DOB · vidyarambha ~age 5 (note Vasant Panchami) · "your life counted in Diwalis" (year − birthYear) · Hindu-age note (janma-tithi drifts; surface the birth tithi we already compute).
- **Bundle:** `samskaras.json` = ~16 rows (rite → day/month/year offset → 1-line meaning). *Diwali count + tithi already computable.*

### Cross-cutting — Imagery on existing beats
- Ravi Varma deity portrait behind Beat C/D (keyed on nakshatra deity / rashi lord).
- Navagraha deity card for the ruling planet.
- Self-authored rangoli/kolam SVG as beat-dividers + the souvenir-ticket border.

### 🚫 Deliberately NOT building
**Manglik / Kuja Dosha** and **Nadi/Gana/Bhakoot compatibility scores.** Both are computable from the Moon chart without birth time — and both sit squarely in the marriage-anxiety / superstition-exploitation territory the positioning forbids. **Recommendation: skip entirely.** Flagged here only so the team chooses deliberately rather than stumbling in.

---

## 4. IMAGERY PLAN

Everything build-time-fetched and self-hosted (fast on cheap Android, immune to upstream deletion). Attribution required for CC-BY/CC-BY-SA, **not** for PD/CC0.

### Primary — Raja Ravi Varma deity oleographs (PD, no attribution)
- **Where:** behind the Astrology and Nakshatra beats — show the deity ruling the user's janma nakshatra or Moon-sign lord.
- **Source:** Commons *Category:Depiction of Hindu Gods and Goddesses by Raja Ravi Varma* (49 files) → subcats *Lakshmi* (18), *Saraswati* (14), plus Vishnu/Shiva/Krishna/Durga/Kali/Ganesha/Surya/Shani/Ganga. Verified files: `Raja_Ravi_Varma,_Goddess_Lakshmi,_1896.jpg`, `Goddess_Saraswati_by_Raja_Ravi_Varma,_1896.jpg`.
- **License:** PD-old-100 (d.1906) / PD-Art — **no attribution.** Fetch via `commons.wikimedia.org/wiki/Special:FilePath/<file>?width=600` (301s to a resizable `upload.wikimedia.org` thumb). Curate ~20–30 → WebP → `/public`.

### Secondary — Navagraha planetary deities
- **Where:** ruling-planet card (Surya on his seven-horse chariot, Chandra on his deer-chariot, Shani…).
- **Source:** Commons *Category:Navagraha* (PD temple reliefs incl. Worcester 550–575 AD; Ravi Varma Surya/Chandra oleographs). **Mixed license** — record author+license per file; some modern photos are CC-BY-SA 4.0 (credit needed).

### Tertiary / fallback — museum open-access (CC0, no attribution)
- **Cleveland Museum API** (no key): `openaccess-api.clevelandart.org/api/artworks?q=Madhubani&cc0=1` → Mithila/Kalighat folk works. **Caveat:** regional coverage uneven (strong Mithila/Bengal/South, thin elsewhere) — curate, don't auto-pull.
- **Met API** (no key): `collectionapi.metmuseum.org/public/collection/v1/search?q=Vishnu&hasImages=true` → `isPublicDomain` objects with direct `images.metmuseum.org` URLs.
- **Wellcome Collection** (CC0/PD): 19th-c. Indian deity/zodiac chromolithographs as a fallback well (e.g. Sarasvati V0045121).
- **Where:** decorative folk-painting texture on regional-cinema / newspaper / telegram beats, mapped by state.

### Self-authored SVG/CSS — zero license risk (preferred for structure)
- **27 nakshatra symbol glyphs** — flat single-color SVG, `currentColor`-themeable, ~1–2 KB each.
- **Rangoli / kolam motifs** — beat-dividers + ticket border; mirror/rotate one quadrant path; optionally regional (pulli kolam TN, jhoti Odisha, mandana Rajasthan). Use Commons *Category:Kolam/Rangoli* photos as *reference only*, not as assets.
- **Navagraha glyphs** — draw our own to match the theme.

> **Rule of thumb:** raster = deities (Ravi Varma PD first, museum CC0 second). Vector = everything structural (symbols, dividers, borders). This keeps the bundle tiny and the license surface clean.

---

## 5. DATA & TECH

### Tables to bundle (all static JSON, all client-safe)
| File | Rows | Notes |
|------|------|-------|
| `dashas.json` | 9 | planet → period-yrs + character line |
| `numerology.json` | 9 + maps | trait/lucky table + Chaldean map + 9×9 friendship matrix |
| `naam-akshar.json` | 108 | 27×4 swar syllables (drikpanchang) |
| `dignity.json` | 7 | exalt/debil/own signs per planet |
| `combustion-orbs.json` | 6 | orb degrees per planet |
| `planet-tokens.json` | 9 | gem + rudraksha + beej mantra |
| `samskaras.json` | ~16 | rite → offset → meaning |
| `nakshatras.json` (extend) | 27 | add `yoni / nadi / varna / shakti` |
| `rashis.json` (extend) | 12 | add lucky number/colour/day/gem |
| 27 SVG glyphs | 27 | inline vector |
| ~20–30 Ravi Varma WebP | — | build-time fetched, self-hosted |

### Pure computation (no new table, no API)
Vimshottari sequence & balance · Moolank/Bhagyank/Naamank · yogas · dignity match · navamsa · combustion · Diwali count · samskara dates · Hindu-age drift. **All from `moonLon`, `moonNakshatra`, `moonRashi`, `placements[]`, DOB, and name — already in hand.**

### Needs a live API? — **No.**
Nothing here requires a runtime API. `astronomy-engine` (already a dependency) covers retrograde detection via finite-difference — 2 extra geocentric-longitude calls per planet, on the beat that already loads it. Ravi Varma / museum images are **build-time only**, then self-hosted. The static-site + cheap-Android constraint is fully preserved.

### The birth-time question — settled
**Every Top-12 feature is birth-time-free.** The Jyotish cluster works because these are all Moon-relative or sign-level constructs (dasha keys off Moon-in-nakshatra; yogas count signs from the Moon; dignity/navamsa are sign-level). The *only* honest caveat is the Mahadasha *start date*, which can drift by weeks without the birth hour — so caption it plainly: *"to the day it needs your birth hour; we place you to the year."* That honesty is itself on-brand.

---

## 6. WHAT I'D BUILD FIRST

A tight sequence — each step ships something standalone and de-risks the next.

**Step 1 — Vimshottari Mahadasha (the flagship).** Bundle `dashas.json` (9 rows), compute sequence + balance from existing `moonLon`, build the life-ribbon, and retire the coming-soon page. Highest impact, self-contained, no new dependency. *This is the "why we shipped" feature.*

**Step 2 — "Your Numbers" beat.** Bundle `numerology.json` + `naam-akshar.json` (108 cells) and ship Moolank + Bhagyank + Naamank + Naam-Akshar together. Trivial arithmetic, uniquely Indian, and Naam-Akshar is the screenshot moment. Big payoff for small effort while momentum is high.

**Step 3 — Ravi Varma deity imagery on the astrology beats.** Write the nakshatra-deity/rashi-lord → filename map, build-time fetch ~20–30 PD JPEGs → WebP → `/public`, drop them behind Beats C/D. This is the visual transformation and it makes Steps 1–2 *look* like a premium product.

**Step 4 — "Your Chart, Deeper" enrichments.** Add dignity badges, Moon-yogas, navamsa, and combust/retrograde flags onto the kundli grid. Bundle `dignity.json` + `combustion-orbs.json`; the rest is computation. This thickens the beat we already have into something a Jyotish enthusiast recognizes as real.

*(Then, as a fast-follow: extend `nakshatras.json` with the Yoni/Nadi/shakti attributes, draw the 27 SVG glyphs, and add the samskara timeline + "life in Diwalis" card. All low-effort thickening once the four core steps land.)*

---

**Files referenced (absolute paths):**
- `C:\Users\akash\Desktop\q\janam-express\src\lib\kundli.js` — exposes `moonLon`, `moonNakshatra.{index,pada}`, `moonRashi`, `sunRashi`, `placements[]` (the compute backbone for the whole Jyotish cluster)
- `C:\Users\akash\Desktop\q\janam-express\src\data\nakshatras.json` — 27 rows, already carries deity/symbol/animal/tree/lord/gana (extend with yoni/nadi/varna/shakti)
- `C:\Users\akash\Desktop\q\janam-express\src\data\rashis.json` — 12 rows, already carries lord/element/quality (extend with lucky number/colour/day/gem)
- `C:\Users\akash\Desktop\q\janam-express\src\data\grahas.json` — 9-planet significations (reuse vocabulary for dasha/numerology planet lines)
- New tables to add under `C:\Users\akash\Desktop\q\janam-express\src\data\`: `dashas.json`, `numerology.json`, `naam-akshar.json`, `dignity.json`, `combustion-orbs.json`, `planet-tokens.json`, `samskaras.json`