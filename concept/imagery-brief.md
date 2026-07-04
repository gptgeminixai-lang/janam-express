The codebase facts check out exactly as the research states: the money beat is `section#rupee` → `.note` div (index.astro lines 71-75), the pure-CSS purple note is `global.css` lines 105-111 with the `::after` "RESERVE BANK OF INDIA" text, and the count-up reads `#cpival` `dataset.target` (main.js line 123/304, fired by the IntersectionObserver at line 319). One nuance worth flagging in the brief: the `.note` has `overflow:hidden` and `position:relative` already, so an absolutely-positioned image layer drops in cleanly. Now I have what I need to write the brief.

# Janam Express — Real Era-Imagery Brief
**Prepared for the founder · 2026-07-04 · Decision: SHIP, starting with the note beat**

---

## TL;DR
Yes — you can legally show the real Indian banknote of someone's birth year. India has **no** currency-reproduction rule (unlike the ECB/UK/Canada); the only law is anti-counterfeiting, which a labelled web image of an old note does not touch. Use Wikimedia Commons images (GODL-India / PD), self-host them optimized, layer one note behind the existing count-up, and keep the CSS purple rectangle as a zero-regression fallback. Then add PM/President portraits and film posters. That's the whole play.

---

## 1. THE CURRENCY VERDICT

**GO — legal to display a real Indian banknote on an informational page, with three simple conditions.**

**The RBI reproduction rule, stated plainly: there isn't one.** Unlike the European Central Bank, Bank of England, and Bank of Canada — which publish explicit "reproductions must be <75% or >150% of real size, one-sided, marked SPECIMEN" rules — **India has no statute and no RBI circular governing the mere reproduction or display of a currency-note image.** RBI's own currency FAQ (updated 15 Apr 2025) covers exchange, soiled notes and counterfeit *detection* — not image reproduction. Legal commentary confirms it: *"there are no laws / guidelines specifically dealing with the reproduction of currency"* in India.

**The only real law is anti-counterfeiting** — IPC §§489A–489E (re-enacted almost verbatim as §§178–181 of the Bharatiya Nyaya Sanhita, 2023). The operative section, **489E**, punishes making documents *"so nearly resembling as to be **calculated to deceive**"* real currency. The test is **intent/capacity to deceive.** A clearly-labelled, non-1:1, one-sided web photo of an old (usually demonetised) note is plainly not calculated to deceive and creates no passable fake — it is outside 489E.

**Are Wikimedia Commons images usable? Yes.** Commons' official currency policy states verbatim: *"The Indian government holds the copyright of the images of most denominations of Indian currency… but reproduction is permitted. Please use {{GODL-India}}."* GODL-India (Government Open Data Licence – India) permits reuse **including commercial**, with attribution. Pre-1965 designs are additionally public domain by age (India = 60 years from publication for government/anonymous works). This covers central-government works — currency qualifies.

**The three conditions (bake them into the design so it can never read as real tender):**
1. **One side only** — show the obverse; never a printable double-sided asset.
2. **Off real size** — your `.note` box is already a stylized 620px web card, not note-proportioned. Keep it that way. Never render at exact real-world dimensions.
3. **Attribution** — each image gets its Wikimedia author + `{{GODL-India}}`/`{{PD-India}}` credit in the source caption or a footer credits block.

A faint diagonal "SPECIMEN" watermark is **not legally required** but is cheap insurance and reads as intentional/historical framing — recommended, not mandatory.

**Verdict: SHIP.** Sources: [Commons:Currency](https://commons.wikimedia.org/wiki/Commons:Currency) · [Commons:Copyright rules/India](https://commons.wikimedia.org/wiki/Commons:Copyright_rules_by_territory/India) · [IPC 489A–489E](https://www.indiacode.nic.in/show-data?actid=AC_CEN_5_23_00037_186045_1523266765688&sectionId=46272&sectionno=489A) · [Law Matters — Copyright & Currency](https://copyright.lawmatters.in/2011/10/notes-on-copyright-and-currency.html) · [RBI Currency FAQ 2025](https://www.rbi.org.in/commonman/Upload/English/FAQs/PDFs/INDIANCURRENCY15042025.pdf)

---

## 2. THE NOTE BEAT

**What it replaces:** the pure-CSS purple `.note` rectangle in `section#rupee`. Confirmed in code: `index.astro` lines 71–75 (the `.note` div), `global.css` lines 105–111 (purple gradient + `::after` "RESERVE BANK OF INDIA" text; `.note` already has `position:relative; overflow:hidden`), count-up at `main.js` line 304 driven by the IntersectionObserver at line 319.

### The ~5–6 ₹100 note-series that cover 1950–2010
Map birth **year** → note **series** (series change every 1–2 decades, so this is per-era, not per-year), and self-host **one obverse image per series**:

| # | Birth years | Series shown | What it looks like | Commons source |
|---|---|---|---|---|
| 1 | **1950–1964** | Pre-1965 Lion-Capital ₹100 (Ashoka pillar; anna→decimal era) | Plain, single-dominant-colour, Ashoka Lion Capital watermark, Hindi+English numerals. **PD by age.** | [Category:100 Indian rupee banknotes](https://commons.wikimedia.org/wiki/Category:Banknotes_of_India) |
| 2 | **1965–1968** | 1960s Lion-Capital ₹100 (colour-coded) | Same family, standardised per-denomination colours | [File: 100 Rupees old series (Gov. S. Venkitaramanan)](https://commons.wikimedia.org/wiki/File:100_Rupees_old_series_banknote_of_India,_signed_by_RBI_governor_S._Venkitaramanan.jpg) |
| 3 | **1969–1979** | Gandhi Centenary / early "science & culture" ₹100 | **Seated Gandhi + Sevagram Ashram** — Gandhi's FIRST appearance on Indian currency (1969) | [Category:Banknotes of India](https://commons.wikimedia.org/wiki/Category:Banknotes_of_India) |
| 4 | **1980–1995** | Lion-Capital ₹100, "Hirakud Dam / Gandhi statue" reverse | Multicolour blue; the classic note an 80s-born Indian remembers | [Category:Banknotes of India](https://commons.wikimedia.org/wiki/Category:Banknotes_of_India) |
| 5 | **1996–2004** | Mahatma Gandhi Series ₹100 (launched 1996) | Standing Gandhi portrait (1946 photo) obverse; **Kangchenjunga** reverse; blue-green-purple | [File:Banknote of india.png](https://commons.wikimedia.org/wiki/File:Banknote_of_india.png) |
| 6 | **2005–2010** | MG-Series ₹100 (2005 added security features) | Same look, windowed thread / micro-lettering / intaglio | [Category:Banknotes of India](https://commons.wikimedia.org/wiki/Category:Banknotes_of_India) |

> Note on ₹500 as a bonus beat: Gandhi's *portrait* returned on the reintroduced **₹500 in Oct 1987**, the design bridge to the 1996 series. Optional Easter egg for 1987+ birthdays; not required for the core ₹100 beat.

**Direct hotlink pattern for sourcing** (use to grab the file, then download & self-host — do NOT ship the hotlink): `https://commons.wikimedia.org/wiki/Special:FilePath/<URL-encoded-filename>` — this 301-redirects to `upload.wikimedia.org` and serves the raw bytes. Cross-check exact design→year mapping (dates, signatures, colours) on the reference catalogue [en.numista.com/catalogue/india-1.html](https://en.numista.com/catalogue/india-1.html) — but source the *displayed* asset from Commons, not Numista (Numista images aren't freely licensed).

### How the count-up survives (do NOT touch main.js)
`.note` already has `position:relative; overflow:hidden`, so:
- Render the chosen `<Image>` **inside** the `.note` div as `position:absolute; inset:0; object-fit:cover; opacity:~.9; z-index:0`.
- Lift `.val` (`#cpival`) and `.lbl` to `z-index:1`, with a subtle scrim (`rgba` gradient) so the animated numerals stay legible on the note art.
- The count-up is untouched: `main.js` still sets `#cpival` `dataset.target` (line 123) and animates ₹100 → ₹X (`countUp()`, line 304) over the image. The IntersectionObserver on `#rupee` (line 319) still fires it. **Zero JS changes.**

### The CSS fallback (zero regression)
Keep the current pure-CSS purple `.note` **exactly as-is** as the base layer; the `<Image>` sits on top. If an image is missing for a year, fails to decode, or the user has `Save-Data`/`prefers-reduced-data` set → **don't render the `<Image>`** and the CSS note shows through unchanged. Wrap the image so an uncovered year is a no-op. The demoted question of "which years have no image" never breaks the page.

---

## 3. IMAGE CATALOGUE (ranked — best first)

Legal backdrop for the whole table: **India PD cutoff in 2026 ≈ 1965** (60 yrs from publication for govt/anonymous/photographic works). Currency & coins are the clean exception because they're released under GODL-India regardless of age.

| Rank | Category | What it shows | Source + URL | License | Hotlink | Effort | Wow |
|---|---|---|---|---|---|---|---|
| **1** | **Currency notes** | Real ₹ note of the birth-year era; replaces the fake purple rectangle | [Commons: Banknotes of India](https://commons.wikimedia.org/wiki/Category:Banknotes_of_India) | **GODL-India / PD** (clean) | Y (but self-host) | Easy | The exact thing the founder asked for — the real note fades in on the money beat |
| **2** | **Coins (demonetised paise)** | Naya paisa (57–64), aluminium paise (70s–80s), holed/scalloped coins | [Commons: Coins of the Republic of India](https://commons.wikimedia.org/wiki/Category:Coins_of_the_Republic_of_India) · [20 Paise 1969](https://commons.wikimedia.org/wiki/Special:FilePath/20_Paise_coin,_India,_1969.jpg) | GODL/CC/PD (verify per file) | Y (self-host) | Easy | "The coins your grandparents jingled" — pairs with the note |
| **3** | **PM & President portraits** | Real face of the PM/President in office on the birth **date** (you already show the names) | Wikidata **P18** per QID → Commons (e.g. Indira Gandhi [Q1149](https://www.wikidata.org/wiki/Q1149)) | CC-BY / CC-BY-SA / PD (P18 must be free) | Y (self-host) | Easy | You already have the names — a real face for near-zero extra work |
| **4** | **Film posters** | The hit film of the birth year (you already fetch TMDB titles 1950–2010) | TMDB CDN `https://image.tmdb.org/t/p/w342/<poster_path>.jpg` | **Grey** — TMDB non-commercial; studios own the poster; mandatory disclaimer | Y (CORS-open) | Medium | High wow, precise per-year — but fan-use grey, not clean |
| **5** | **Cars / scooters** | Ambassador, Premier Padmini, Maruti 800, Bajaj Chetak | [Ambassador](https://commons.wikimedia.org/wiki/Category:Hindustan_Ambassador) · [Padmini](https://commons.wikimedia.org/wiki/Category:Premier_Padmini) · [Chetak](https://commons.wikimedia.org/wiki/Category:Bajaj_Chetak) | CC-BY / CC-BY-SA (verify) | Y (self-host) | Medium | "The Amby taxi / dad's Chetak" — decade-level, not birth-year |
| **6** | **City vintage photos** | B&W skyline of the birth state's city in the birth decade | [Mumbai 1960s](https://commons.wikimedia.org/wiki/Category:Mumbai_in_the_1960s) · [1950s](https://commons.wikimedia.org/wiki/Category:Mumbai_in_the_1950s) | PD-India / CC (verify) | Y (self-host) | Medium | "This is what your city looked like" — thin outside metros/post-1970 |
| **7** | **Doordarshan logo** | The DD "eye" — one channel of the 60s–80s | [File:Doordarshan Logo (1).png](https://commons.wikimedia.org/wiki/File:Doordarshan_Logo_(1).png) | CC-BY-4.0 upload; **trademark** of Prasar Bharati | Y | Easy | Nice culture touch — era-level, trademark caveat |
| **8** | **Postage stamps** | Commemorative of the birth **year** (dense per-year cats) | [Stamps of India by year](https://commons.wikimedia.org/wiki/Category:Stamps_of_India_by_year) | **RESTRICTED** — India Post 60-yr copyright; clean **only ≤1965** | N (except pre-'65) | Hard | Perfect per-year *if* legal — copyright wall over 1965–2010 kills most users |
| **9** | **Cricket 1983 WC** | Kapil Dev's Lord's win — 1983 Easter egg | Iconic shots are [Getty/AFP (paid)](https://www.gettyimages.in/photos/cricket-world-cup-1983); only scattered CC player portraits free | **RESTRICTED** | N | Hard | Huge wow for 1983 — but the actual photo is paywalled; do as text/emoji |
| **10** | **Matchbox / Sivakasi art** | Mid-century label art | No clean free source (Tasveer Ghar / private collections, all rights reserved) | **UNSAFE** | N | Hard | Aesthetically richest — but legally blocked; skip |
| **11** | **Old ads / packaging** | Campa, Gold Spot, Rasna, "Hamara Bajaj" | No clean free source; corporate copyright + trademark | **UNSAFE** | N | Hard | Recreate the *vibe* in your own CSS/type (as you do the note) — don't use the real ads |
| **12** | **Newspaper mastheads / front pages** | The headline "the day you were born" | Mastheads = live trademarks; front pages paywalled/archive | **RESTRICTED** | N | Hard | Great concept — serve with your existing text headline data, not scans |

---

## 4. HOW TO SHIP IT (Jio-4G-fast)

**Approach: SELF-HOST, optimized, via Astro `astro:assets` `<Image>` / `<Picture>`.** Do not hotlink Wikimedia in production.

- **Why self-host:** the money beat needs only ~5–6 images total — there's no "long tail" to justify a hybrid. Self-hosting is the only path that reliably stays fast on Jio 4G *and* sidesteps CORS, third-party downtime, hotlink rate-limiting, link rot, and IP leakage to Wikimedia. A hotlinked Wikimedia file is the full-res original (often 1–8 MB scans), no WebP/AVIF, no responsive srcset, plus an extra DNS+TLS+302 hop — wrong for mobile.
- **Pipeline:** drop originals in `src/assets/notes/`. Astro's default image service (**sharp**, build-time) re-encodes to **WebP/AVIF**, strips EXIF, emits content-hashed filenames served from your own `/janam-express/` base. `<Image>` auto-adds `width`/`height` (kills CLS during the count-up), `loading="lazy"`, `decoding="async"`. Do **not** put notes in `public/` — that ships them un-optimized.
- **Render:** `<Image src={note} width={620} widths={[320,480,620,1040]} sizes="(max-width:640px) 94vw, 620px" alt="₹100 note, <series> era" loading="lazy" decoding="async" />` so a 375px phone downloads a ~320–480px variant, not the 1040px one.
- **Performance budget:** ≤ **40–60 KB** for the largest (620–1040px) WebP variant; **15–25 KB** for 375px phones; AVIF where it wins (~30–40% smaller) with WebP fallback via `<Picture>`. Only one note is shown per visit and it's **below the fold**, lazy-loaded — so added critical-path weight ≈ **a single ~20–40 KB image**, non-blocking to first paint. Whole upgrade adds well under ~50 KB per journey.
- **CSP / GitHub Pages reality:** there is **no CSP anywhere in the repo today** (grep confirms — no `Content-Security-Policy`, no `img-src`, no headers in `astro.config.mjs`). The "fetch() CSP that blocks our APIs" belief is a misattribution — it's browser CORS on cross-origin `fetch()`/XHR, which **`<img>` is not subject to**. GitHub Pages **cannot set response headers at all**, so a real CSP header isn't even an option; only a partial `<meta http-equiv>` tag is. For self-hosted images this is **entirely moot** — everything is same-origin. Recommendation: stay CSP-free-by-default. If you ever harden later, `img-src 'self' data:` + `connect-src <your API hosts>` covers it; `img-src` (images) and `connect-src` (fetch) are separate directives and never interfere.

**Verify before merge:** run the built site in preview, confirm one note renders behind the count-up on the money beat, numerals stay legible, and the CSS fallback shows when the image is suppressed (`Save-Data`).

---

## 5. WHAT I'D DO FIRST

Tight sequence, licensing-safe picks up front:

1. **Note beat (currency)** — the exact request, cleanest license (GODL-India/PD), highest authenticity payoff. Curate 6 obverse images (table in §2), self-host, layer behind the count-up, keep the CSS fallback, add attribution + optional SPECIMEN watermark. **Ship this alone as v1.**
2. **PM / President portraits** — near-zero marginal effort (you already show the names per date), clean CC/PD via Wikidata P18. Adds a real national face to the personal date. **Fast follow.**
3. **Coins** — GODL/CC/PD, pairs naturally on the same money beat ("the note *and* the coins"). Easy, high nostalgia.
4. **Film posters** — high per-year wow and you already have the TMDB pipeline, **but** it's fan-use grey: gate it behind a decision to accept non-commercial TMDB terms + the mandatory disclaimer *"This product uses the TMDB API but is not endorsed or certified by TMDB."* Ship only if comfortable with grey licensing.
5. **Defer / skip:** stamps (clean only ≤1965 — offer only to 1950–65 birthdays if at all), cricket 1983 (do as text/emoji, iconic photo is paywalled), and **skip entirely** matchbox art, old ads, newspaper mastheads (all copyright-unsafe — recreate their *vibe* in CSS instead, the way the current note already does).

**One-line recommendation to the founder:** approve the note beat now — it's legal, clean, ~40 KB, and answers the exact request; portraits and coins are the obvious next two; treat posters as an optional grey-licence add and leave the copyright-unsafe categories out.

---

**Relevant files (absolute paths):**
- Money beat markup: `C:\Users\akash\Desktop\q\janam-express\src\pages\index.astro` (lines 68–89; `.note` div 71–75)
- Note styling: `C:\Users\akash\Desktop\q\janam-express\src\styles\global.css` (lines 103–119; `.note` 105–111)
- Count-up logic (do not touch): `C:\Users\akash\Desktop\q\janam-express\src\lib\main.js` (`countUp()` line 304, target line 123, IntersectionObserver line 319)
- New assets go in: `C:\Users\akash\Desktop\q\janam-express\src\assets\notes\` (create; not `public/`)