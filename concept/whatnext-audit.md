# Janam Express — What To Update Next

*Product + eng roadmap, grounded in the 4-angle audit and verified against the live code (`src/lib/lookup.js`, `main.js`, `share.js`, `kundli.js`, `jyotish.js`).*

---

## 1. HEADLINE

**Fix the landing bundle first: it ships 89KB gzip of JavaScript when the target is ≤25KB — and ~68KB gzip of that is data the user does not need until after they submit the form.**

The measured main chunk (`dist/_astro/index.astro…CegojKyt.js`, 257KB raw / **89KB gz**) is bloated for one reason, and the code confirms it: `lookup.js` statically imports 11 JSON files at module top-level (lines 1–11), and `main.js` pulls in four more (`panchang`, `nakshatras`, `rashis`, `grahas` on lines 7/11/12/13) plus `jyotish.js` (which imports 4 more). Every one of those is a **synchronous parse on the landing screen**, before the booking form is even interactive — on the exact ₹8,000 Android / Jio 4G device the project targets. Only `cities.json` (6.4KB gz, needed for the autocomplete) and `static.json`/`prices` genuinely need to be eager.

This blows the stated "≤25KB JS on landing / interactive <1s" target by **3.5×**, and it is the highest-leverage fix because it costs **zero UX**: `startJourney()` calls `render()` then `depart(y)`, and `depart()` runs a **2100ms + 650ms = ~2.75s** departure-board animation (verified, main.js:87/99) before `arrive()` reveals anything. An `await loadData()` slotted into that window is fully hidden behind an animation the user is already watching. ~68KB gz over even 1.5 Mbps Jio is <1s — it finishes before the flap-board stops spinning. It also reuses the `await import()` pattern the codebase **already uses correctly** for `astronomy-engine` and `mhah-panchang`.

---

## 2. TOP 10 (ranked by impact × feasibility, not by category)

| # | Update | Tag | Impact | Effort | The one-line how |
|---|--------|-----|--------|--------|------------------|
| 1 | **Dynamic-import the post-submit JSON** | `[FIX]` | **−68KB gz landing** (89→~20KB gz) — hits the ≤25KB target | Medium | Convert `lookup.js`/`jyotish.js` to `let DATA=null; async loadData(){…Promise.all([import('../data/regional.json'),…])}`; make `render`/`startJourney` async and `await loadData()` inside the existing 2.75s `depart()` window. Vite auto-splits each `import()` into its own lazy chunk. |
| 2 | **Cloudflare Worker for per-link OG unfurl** | `[NEW]` | Turns the *only* share surface from a dead identical preview into a personalised card in every WhatsApp/Twitter unfurl — the India virality unlock | Medium | workers.dev Worker: `/t?d=&c=&n=` emits real `<meta og:image/og:title>` then redirects to Pages; `/og.png` renders the ticket via workers-og (Satori, no Puppeteer), KV-cached to dodge the 10ms free-CPU cap. Point `buildCaption()` (share.js:10) at the Worker instead of `location.origin`. |
| 3 | **Split `regional.json` per birth-state** | `[IMPROVE]` | −18KB gz more per journey (loads ~2KB, not 20.5KB for all 28 states) + smaller parse | Medium | After #1, build-split into `public/data/regional/<state>.json`; in `lookup.js` fetch only `${base}data/regional/${city.state}.json` once the city is known. Pages gzips it on the fly. |
| 4 | **aria-live on async beats + fix loading reveals** | `[FIX]` | Highest-severity a11y gap: blind users hear "Reading the skies…" that *never resolves aloud* across 6+ beats | Easy | Add `aria-live="polite"` + `aria-busy` toggling to `#wxcard`, `#historylist`, `#famousgrid`, `#tvscreen`, `#astrorows`, `#dasharibbon`; announce "Arrived in {year}" (the `#board` overlay is permanently `aria-hidden`). |
| 5 | **Raise sub-4.5:1 caption/source text to AA** | `[FIX]` | Every provenance/citation line (the trust text) is unreadable in daylight on a phone: measured 3.33–3.90:1, fails WCAG AA | Trivial | One find/replace band in `global.css`: `.src`/`.history-src`/`.famous-src`/`.astro-note`/`.kundli-note` from `rgba(244,232,206,.4/.45)` → `.6` (6.08:1). Body/marigold already pass (15.3/9.0:1) — don't touch. |
| 6 | **Real `/reading` page: gochara / Sade Sati** | `[NEW]` | Converts the one dead placeholder page into the highest-retention feature; only thing that changes daily → return visits | Medium | Reuse `rashiChart(todayY,todayM,todayD)` (verified: takes any date, no birth time) vs natal Moon → houses-from-Moon, Sade Sati flag, Jupiter gochar, + nested antardasha loop in `jyotish.js:mahadasha()`. Zero new deps/data. Heritage framing, never prediction. |
| 7 | **Surface city population then-vs-now** | `[IMPROVE]` | Dead data already shipped: `cities.json` carries `pop1951/71/91/2011` (Mumbai 2967→18395k). A 6× lifetime multiplier is a visceral time-machine beat | Trivial | On the homeland beat, pick census year nearest DOB vs 2011, interpolate, render a 4-point sparkline. ~0 added bytes — it's in the 31KB `cities.json` already downloaded. |
| 8 | **Error/empty/offline states for the 4 live APIs** | `[FIX]` | On flaky Jio 4G (an explicit target), history/twins/posters hang on loading text *forever* — no `.catch` on those promises | Easy | Add `.catch` → friendly retry line to `renderHistory`/`renderFamous`/`postersOf`; check `navigator.onLine` up front. (Weather + chart/dasha already have fallbacks — leave them.) |
| 9 | **Chart-enrichment badges (dignity/combustion/retro/Gajakesari)** | `[IMPROVE]` | "My Jupiter is exalted", "I have Gajakesari yoga" are shareable identity hooks; makes the kundli read like a *real* chart | Medium | Pure functions of longitudes `rashiChart()` already returns: 7-row exalt/debil table, `|grahaLon−sunLon|` combustion orbs, one date−1 engine call for retrograde, kendra-from-Moon for Gajakesari. <3KB to the *lazy* kundli bundle, not landing. |
| 10 | **Astro `getStaticPaths` per-date SEO pages** | `[NEW]` | The organic-discovery channel the SPA has zero of; copies takemeback.to's proven `/DD-Month` model onto JSON already shipped | Medium | `src/pages/on/[slug].astro`, 366 day-of-year pages (not 22k DOBs) built from `films/cricket/milestones.json` → real crawlable `<h1>`/body + calendar footer, each CTA-ing into the pre-filled booking flow. Builds in seconds. |

---

## 3. QUICK WINS (trivial/easy — shippable this week)

1. **Contrast band-fix** `[FIX]` — one CSS find/replace, `.4/.45 → .6` on all caption/source/note tokens. Fixes AA across every provenance line. *(#5)*
2. **`.catch` on the three hanging API beats** `[FIX]` — history/twins/posters stick on loading text forever if the fetch rejects. A few try/catch additions. *(#8)*
3. **City population then-vs-now** `[IMPROVE]` — the `pop1951–2011` fields are already in `cities.json`; pure render + a sparkline. *(#7)*
4. **1080×1920 story/wallpaper export** `[IMPROVE]` — parameterise `drawTicket()`'s hardcoded `W=1080,H=1350` (share.js:15); reuses 100% of the canvas code + the already-correct `navigator.canShare({files})` path (share.js:109). A 9:16 image is the native WhatsApp-Status / Insta-Story canvas with the permalink baked in.
5. **Self-host Ravi Varma deity WebPs** `[NEW]` — `ravivarma.json` already maps 14 deities → Commons files (licenses pre-vetted PD). One `scripts/fetch-deities.mjs` (Special:FilePath → WebP → `public/deities/`), commit once. Lazy per gods beat; landing bundle untouched.

*(Also genuinely small: `aria-pressed` on the India/World scope toggles and 44px min touch targets on `.scope-btn`/`.knob`.)*

---

## 4. BIG BETS (higher-effort; would meaningfully change the product)

### A. The virality stack — OG unfurl + story mode + gift flow
The app is content-rich with **effectively zero growth engine**. Its only share surface is the canvas PNG + a `?d=&c=&n=` permalink that, because this is static Pages with fixed OG tags (`index.astro:24-25`) and WhatsApp's crawler runs no JS, **unfurls identically for every user** — killing the loop that matters most in India.
- **OG Worker** (#2) is the keystone: a free workers.dev Worker finally makes each shared link preview the sender's own ticket.
- **Spotify-Wrapped story mode** `[NEW]` — CSS `scroll-snap-type: y mandatory` over ~8 full-viewport 9:16 cards distilled from the punchiest beats (telegram twist, ₹100 then-vs-now, the film, birthday twin, nakshatra deity, ticket CTA). Reuses the `J` object; snap runs on the compositor so it stays smooth on low-end Android. Screen-recording a story to WhatsApp Status is the dominant Indian sharing behaviour — needs *no* server infra.
- **"Gift a ticket / make one for someone"** `[NEW]` — same `startJourney()` path, second-person copy, `n=` = recipient's name → a "Made this for you" link. The journey is fully deterministic from `?d=&c=&n=`, so it reaches people who'd never have found the site.

**Tradeoff:** the PNG-render route needs KV caching (Satori ~100–300ms vs the 10ms free-CPU cap; ~$5/mo only if per-person volume is high). The `/t` HTML+meta route alone runs <10ms free and can point `og:image` at a generic-per-decade card to launch, upgrading later. This is the one place the "static, no server" constraint bends — but it's a standalone Worker, **not a hosting migration**, so the Pages app is untouched.

### B. The `/reading` page + kundli depth (the retention engine)
The decisive content finding: `rashiChart()` already computes full sidereal graha longitudes **for any date with zero birth time**, so an entire live-astrology surface is pure arithmetic on data the code already produces.
- **`/reading`** (#6): gochara/Sade Sati over natal Moon + antardasha sub-periods — the single most-Googled thing in Indian astrology and uniquely computable here without birth time. It's the *only* thing on the site that changes daily → the only reason to return.
- **Chart badges** (#9) + **Navamsa (D9) mini-chart** `[IMPROVE]` — D9 is `floor(lon/3.333°)` on longitudes already in hand. All of it lands on the **lazy kundli bundle**, never the 89KB landing bundle.

**Tradeoff:** must stay rigorously framed as heritage ("the tradition reads this as…"), never prediction. The existing `jyotish.js` honesty note about placing users "to the year, not the hour" extends cleanly to transits.

### C. SEO permalink pages + PWA (discovery + repeat-visit speed)
- **366 per-date pages** (#10) — the organic-search channel the SPA entirely lacks.
- **`@vite-pwa/astro` service worker** `[NEW]` — compatible with this Astro ^5.2 build; precache the ~20KB landing bundle + CSS + split data chunks; runtime-cache (CacheFirst, *not* precache) the ~135KB banknote WebPs and 43KB astronomy-engine. Repeat/permalink visits drop from ~868KB cold to a near-instant cache hit; works offline after first visit.

**Tradeoff:** the PWA only pays off *after* #1 splits the bundle — no point precaching an 89KB monolith. Sequence it last.

---

## 5. PERFORMANCE PLAN — get landing JS back under target

Target **≤25KB gz**. Current **89KB gz**. Compression is a dead end — GitHub Pages already gzips on-the-fly and does **not** serve Brotli (confirmed, community discussion #21655), so 89KB *is* the wire size. Every win comes from **splitting / deferring / trimming**, not re-compressing.

| Step | Action | Landing JS after | Δ |
|------|--------|------------------|---|
| 0 | *Baseline (measured)* | **89KB gz** | — |
| 1 | **Dynamic-import the 15 post-submit JSON files** via `loadData()`, awaited inside the 2.75s `depart()` animation. Keep only `cities.json` (6.4KB) + `static.json`/`prices` eager. | **~20KB gz** | **−68KB** |
| 2 | **Split `regional.json` per-state** (`public/data/regional/<state>.json`, fetched after city is known) — removes the largest deferrable chunk (20.5→~2KB) + shrinks the parse. | ~20KB landing *(trims deferred payload)* | −18KB *deferred* |
| 3 | **Verify no TBT jank**: throttled 4G + 4× CPU profile — landing parse is now just `cities`+`static` (~40KB raw, was ~262KB), `loadData()` completes inside the 2.75s window. Prefetch astronomy-engine once the user scrolls past early beats so the kundli beat doesn't stall. | ~20KB gz, near-zero TBT | −40KB raw sync-parse off critical path |
| 4 | **`@vite-pwa/astro` service worker** — precache the ~20KB bundle + split chunks; CacheFirst the WebPs + astronomy-engine. | ~0 network on repeat/permalink | 868KB → cache hit |

**Do NOT do:** re-lazy `mhah-panchang` (9KB) or `astronomy-engine` (43KB) — both are *already* correctly `await import()`-ed into separate chunks that load only on their beats. Don't add compression plugins or `.gz`/`.br` sidecars — Pages won't serve them.

**Net:** Step 1 alone lands the target. Steps 2–4 are compounding refinements: smaller parse, offline, instant repeat visits.

---

## 6. WHAT I'D DO NEXT (tight sequence)

1. **Ship the bundle split (Perf Step 1).** Convert `lookup.js` + `jyotish.js` to an async `loadData()`; make `render()`/`startJourney()` async and `await` inside `depart()`. The headline fix — 89→~20KB gz, hits target, zero UX cost, proven pattern. Verify on throttled 4G + 4× CPU.
2. **Batch the trivial trust + robustness fixes** while in the CSS/JS: contrast band (`.4→.6`), `aria-live` on the six async beats, `.catch` on the three hanging API beats. Three small diffs, one afternoon.
3. **Stand up the OG Worker + point `buildCaption()` at it.** The growth unlock — launch with the cheap `/t` meta route (generic-per-decade card), then add KV-cached per-person PNGs. Pair with the 1080×1920 export so there's a shareable asset the day the unfurl works.
4. **Build the real `/reading` page** on the now-split lazy bundle. Reuses `rashiChart()` verbatim, zero new deps, and is the only feature giving people a reason to return tomorrow.

*Then:* per-state `regional.json` split, the 366 SEO pages, and the PWA — discovery and repeat-visit layers, in that order.

---

Full markdown saved at: `C:\Users\akash\AppData\Local\Temp\claude\C--Users-akash-Desktop-q\688a4157-2497-48a9-8e30-235f57256cd1\scratchpad\roadmap.md`

Note: the audit's file references resolve to the real tree at `C:\Users\akash\Desktop\q\janam-express\src\lib\` (not the nested `janam-express/janam-express/` path in the git status). I verified the load-bearing claims directly: the static JSON imports in `lookup.js` (lines 1–11), `main.js` (7/11/12/13) and `jyotish.js` (2–5); the `render()`-then-`depart()` 2.75s hidden window (main.js:77-99); `rashiChart(y,m,d)` taking any date with no birth time (kundli.js:49); and the hardcoded `location.origin` caption (share.js:10) and `1080×1350` ticket (share.js:15).