I have everything I need. The app computes `moonRashi`, `sunRashi`, per-sign graha placements, and the matchbox already surfaces nakshatra/tithi/paksha/masa. Now I'll write the decisive brief.

Note: the code uses `Vrischika` (one 's') — a small spelling inconsistency vs the research's `Vrishchika`, worth flagging.

---

# Janam Express — Birth-Star Enrichment & "Your Astrology" Beat

**Decision brief · Product lead** · Scope: garnish, not fortune-telling. Everything below runs off data the app *already computes* (janma nakshatra, moonRashi/sunRashi, tithi/paksha/masa, 9-graha sign chart) plus static lookup tables. **Zero new astronomy.**

---

## 1. THE BIRTH-STAR ENRICHMENT

Beat 10 (the "Sky Brand" matchbox, `#mbgrid`) currently shows four bare labels: nakshatra, tithi, paksha, masa. We already produce the nakshatra name — that's the only key we need. Bundle **one static 27-row table** keyed by nakshatra name and the card goes from a label to a *totem*.

**Fields per nakshatra** (all standard, cross-checked across AnytimeAstro / AstroSage / ProKerala):

| Field | What it adds |
|---|---|
| Deity (devata) | The god the star answers to — the emotional hook |
| Symbol | The star's emblem (horse's head, throne, teardrop…) |
| Animal / yoni | Its living totem |
| Tree (vriksha) | Powers the "plant your tree" hook (§2) |
| Ruling planet (lord) | Ties the kundli grid to a human sentence |
| Gana | Deva / Manushya / Rakshasa temperament badge |
| Traits | One curated heritage-framed sentence |

### Sample rows (flavour check — full 27 ready to bundle)

| # | Nakshatra | Deity | Symbol | Animal (yoni) | Tree | Lord | Gana | Trait line |
|---|---|---|---|---|---|---|---|---|
| 1 | **Ashwini** (अश्विनी) | Ashwini Kumaras (twin horse-physicians of the gods) | Horse's head | Horse | Strychnine / Kuchla | Ketu | Deva | Quick, pioneering healers — youthful initiators who love speed and fresh starts. |
| 4 | **Rohini** (रोहिणी) | Brahma / Prajapati (the creator) | Ox-cart / chariot | Serpent | Java plum / Jamun | Moon | Manushya | Charming, sensual, magnetic — beauty-loving and creative by nature. |
| 8 | **Pushya** (पुष्य) | Brihaspati (guru of the gods) | Cow's udder / lotus | Goat | Sacred fig / Peepal | Saturn | Deva | The most auspicious nourisher — caring, spiritual, steady providers. |
| 9 | **Ashlesha** (आश्लेषा) | The Nagas (divine serpents) | Coiled serpent | Cat | Nagakesar / Champa | Mercury | Rakshasa | Hypnotic, shrewd, penetrating — intuitive minds with serpentine wisdom. |
| 19 | **Mula** (मूल) | Nirriti (goddess of dissolution) | Tied bunch of roots | Dog | Bael / Blackwood | Ketu | Rakshasa | Fearless truth-diggers who tear down surfaces to reach the core. |

The full **27-row table is authored and ready to bundle** as one JSON file keyed by the names the app already emits.

**One data-hygiene flag before we ship:** `kundli.js` spells the rashi `Vrischika` (one *s*); the research and standard transliteration use `Vrishchika`. Pick one spelling for the whole codebase so the rashi table joins cleanly.

---

## 2. THE "YOUR ASTROLOGY" BEAT

Add **one new beat between the matchbox (10) and the kundli (11)** — call it **Beat 10½ · "The star the sky filed you under."** It's the connective tissue that turns two cryptic cards into a single readable portrait. Built entirely from `nakshatra + moonRashi + tithi/paksha + graha placements` + the three static tables (27 nakshatras, 12 rashis, 9 grahas).

### Card A — Birth-Star Totem (the hero)
A matchbox/stamp-style hero under the star's big name. A 5–6 chip attribute grid: **Deity · Symbol · Animal · Tree · Ruling planet · Gana badge.**

> **Copy style:** *"The sky filed you under **Rohini**. Its deity is **Brahma the creator**, its symbol an **ox-cart**, its totem the **serpent** — and its living tree is the **Jamun**."*

### Card B — The Personality Mirror
The one curated trait sentence, in *descriptive heritage voice* — never a "you will":

> *"People born under Rohini are traditionally described as charming, sensual and magnetic — beauty-loving and creative by nature."*

Plus a **gana badge**: Deva (divine/gentle) · Manushya (human/balanced) · Rakshasa (fierce/intense) — with a one-line gloss. Deliberately no koota/compatibility scoring.

### Card C — "Why you're you" — the three coordinates
This is the authenticity beat. Three short rows that read the layers the app already has:

- **Moon sign (janma rashi):** *"Your Moon sat in **Vrishabha** — in India this, not your Sun sign, is 'your sign'. It's the seat of the mind and emotions: steady, sensual, loyal."* (element + lord from the 12-row rashi table.)
- **Ruling planet of your star:** *"Your star answers to **the Moon** — the mind, moods and inner tide."* (9-graha `governs` line, giving the chart's `Su/Mo/Ma…` abbreviations real meaning.)
- **The Moon's calendar (tithi/paksha):** *"You arrived on a **waxing (Shukla)** tithi — the brightening half, leaning outward, building, optimistic."*

### Card D — 🌳 Plant Your Birth-Star Tree (the differentiator)
The single most delightful, screenshot-worthy, un-fakeable hook — a **genuine Vedic custom** (family plants the newborn's nakshatra tree and tends it like the child) revived through *nakshatra vanam* projects. No time-machine competitor has this, and it's impossible to read as fortune-telling.

> *"For centuries, a family planted the newborn's birth-star tree and tended it like the child, so the tree's health mirrored the child's. Your star's tree is the **Jamun (Java plum)**. Plant one this birthday."*

Optional soft link to a nakshatra-vanam / tree-donation initiative (5 Gen Green Foundation, Vedic Vanas). Great fodder for the share-ticket.

### (Optional, trivial) Card E — Lucky-elements chip row
Colour / number / gemstone / auspicious name-syllable, labelled *"Traditionally considered auspicious for this star."* Populate only fields we can source reliably. Playful and shareable; ship later.

---

## 3. WHAT EACH LAYER SAYS (so our copy is authentic)

Jyotish is **Moon-centred**, not Sun-centred like Western astrology — it reads several coordinates of the birth moment *together*, not one headline sign. Our copy should say this out loud; it's a genuine point of difference and it's authentic.

- **Janma rashi (Moon sign)** = the *heart* of the chart: inner self, emotions, instinct, the mind (*manas*). In India, this is "your sign." → **the emotional core.**
- **Janma nakshatra (birth-star)** = the fine grain that sharpens the Moon sign into a finer portrait — its own deity, planet, animal, tree, symbol, gana. It's also the anchor of the dasha timeline. → **the finest personality layer.**
- **Tithi + paksha** = how bright the Moon was — the *fullness and flavour* of mind/mood. Waxing (Shukla) leans outward/building/optimistic; waning (Krishna) leans inward/releasing/reflective. → **the mood.**
- **Vara (weekday)** = its ruling graha as a background tone (optional; we can derive it from the date). → **the daily tone.**
- **Lagna (ascendant)** = the outward self and life-structure — **we deliberately don't claim this**, because it needs exact birth time we don't collect. Our existing kundli note already says so; keep that honesty. → **the one layer we honestly can't read.**

**Read together:** Moon sign = emotional core, nakshatra = fine grain, tithi/paksha = mood — *a composite portrait, not one label.* That framing is both accurate and the exact line our copy should take.

---

## 4. TONE & RESPECT (do / don't)

**Voice:** keep the warm almanac/time-machine voice ("*the star the sky filed you under*"), **not** a guru/prediction voice. Descriptive, present/past tense, about temperament and symbolism.

**DO**
- Frame everything as heritage: *"traditionally associated with…," "in classical Jyotish your star is linked to…," "people born under this star are often described as…"*
- Lean into concrete, verifiable, cross-checkable facts — deity/symbol/animal/planet names are standard across sources.
- Lead with the **tree-planting custom** — genuine, wholesome, eco-positive, impossible to read as superstition-exploitation.
- Add one honest footer disclaimer: *"A cultural garnish drawn from classical Jyotish tradition — for delight and heritage, not prediction."*
- Respect both the devout and the sceptical — descriptive framing works for both.

**DON'T**
- Never promise outcomes (marriage, career, wealth, health, "lucky year ahead").
- Never claim accuracy ("100% correct," "your true destiny").
- Never sell or imply remedies/poojas/gemstones that "fix" doshas or ward off bad luck.
- Don't present doshas, manglik status, or compatibility **scores** as verdicts about a real person.
- Don't dramatise "malefic" planets (Saturn, Rahu, Ketu) as threats — describe, don't menace.

**India-specific sensitivities (the real reason for the guardrails):** Practising astrology is *legal* in India (courts treat it as a permissible occupation), so a **descriptive, disclaimered heritage feature is safe.** The risk lives entirely in *prediction/remedy claims and paid upsell*: under the **ASCI Code** (truthful/substantiable claims, clear disclaimers, no "100% guarantee") and the **Consumer Protection Act 2019 / CCPA**, definitive promises can be treated as misleading advertising with penalties up to **₹10 lakh (first offence) / ₹50 lakh (repeat)**; MIB advisories also bar content promoting superstition/blind belief. **Keep the section free, descriptive, and disclaimered → Janam Express stays completely clear of all of it.**

---

## 5. WHAT I'D BUILD (recommendation)

**Ship two things, one bundle, this cycle:**

### (a) Enrich the existing matchbox card — *now*
Join the **27-row nakshatra table** onto the nakshatra the app already computes. Add to `#mbgrid`: **Deity · Symbol · Animal · Tree · Ruling planet · Gana badge**, plus the trait sentence below it.
**Effort: easy (~½ day).** One JSON file + a small render loop in the existing matchbox. No astronomy, no new dependency.

### (b) Add one "Your Astrology" beat (Beat 10½) — *now*
A new `<section class="beat">` with four cards, all from existing data + the three tables:
1. **Totem hero** — deity / symbol / animal / tree / planet / gana chips.
2. **Personality mirror** — trait sentence + gana badge.
3. **Why you're you** — three rows: Moon sign (rashi table: element + lord), ruling planet (graha `governs` line), tithi/paksha mood.
4. **🌳 Plant your birth-star tree** — the custom + "your star's tree is {tree}," optional nakshatra-vanam link.
Footer disclaimer under the beat.
**Effort: medium (~1.5–2 days)** including copy authoring for 27 trait lines + 3 lookup tables (12 rashi, 9 graha, 27 nakshatra). Layout reuses the existing matchbox/kundli CSS idiom.

### Bundle needed (all static, author-once)
- `nakshatras.json` — 27 rows (deity, symbol, animal, tree, lord, gana, trait). **Ready.**
- `rashis.json` — 12 rows (english, lord, element, quality, trait). **Ready.**
- `grahas.json` — 9 rows (`governs` line). **Ready.**

### Explicitly deferred (v2)
- Lucky-elements chip row (colour/number/gem/syllable) — trivial-to-medium, ship once sourced.
- Vara/weekday tone line — trivial, nice-to-have.
- **Never:** dosha/manglik verdicts, compatibility scores, remedies, any paid upsell.

**Net:** ~2–2.5 dev-days for a richer star card + a genuinely delightful, legally-safe, culturally-authentic astrology beat whose standout is a tree-planting call-to-action **no competitor has**.

---

### Sources carried from research
- **Attribute table (deity/planet/symbol/yoni):** AnytimeAstro — *List of 27 Nakshatras and Their Lords*
- **Nakshatra→tree mapping:** Clickastro — *Find Your Nakshatra Trees*
- **Tree-planting custom / initiatives:** Vedic Vanas — *Nakshatra Vana*; 5 Gen Green Foundation — *Nakshatra Vanam*; Grow Billion Trees — *27 Nakshatra Trees*
- **Competitor layout reference:** AstroSage — *Nakshatra hub*; ProKerala — *Nakshatra / Krittika page structure*
- **Legal / advertising line:** ASCI Code; Storyboard18 (*CPA/CCPA ₹10–50 lakh penalties*); MIB superstition advisory; IJLLR (*astrology as a legally permissible profession*)

**Relevant files** (all absolute):
- `C:\Users\akash\Desktop\q\janam-express\src\pages\index.astro` — Beat 10 matchbox (`#mbgrid`), Beat 11 kundli (`#kundlilegend`); insert the new beat between them.
- `C:\Users\akash\Desktop\q\janam-express\src\lib\kundli.js` — emits `moonRashi`, `sunRashi`, per-sign grahas, `GRAHA_NAMES`; note the `Vrischika`/`Vrishchika` spelling to reconcile.
- `C:\Users\akash\Desktop\q\janam-express\src\lib\lookup.js` — where the three new static tables + join helpers should live (mirrors the existing `regional.json` lookup pattern).