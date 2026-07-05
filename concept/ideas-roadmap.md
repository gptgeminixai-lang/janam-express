# Janam Express — Build Roadmap (researched 2026-07-05)

Multi-agent research sweep: 8 dimensions × research → adversarial feasibility verify → synthesis.
70 ideas survived the fact-check (of ~74), 7 ruled out. Every data source below was web-verified for **free / no-key / India-covering / legally-reusable**. Constraints held throughout: India-first, respectful (never prediction/fear-selling), no monetization, fast on Jio 4G, static hosting.

## ⭐ Top pick
**The real `/reading` page — live gochara + current antardasha + Sade Sati.** The site already *ships* a `reading.astro` "Coming soon" stub promising exactly this. Feed `rashiChart()` today's date for live sidereal transits vs natal Moon (gochara), extend `mahadasha()` to the running antardasha by the proportional rule, and compute Sade Sati (Saturn in 12th/1st/2nd from natal Moon) as sign-arithmetic. Pure compute — no key, server, or new data. Converts a promised-empty page users already see into real value. (L effort, high impact.)

---

## 🟢 Quick wins — S effort, mostly ready now
| Idea | What | Source | Impact |
|---|---|---|---|
| **og:image + social meta** | Head has og:title/description but **no og:image** → pasted permalinks unfurl as bare text on WhatsApp/Telegram. Add one branded 1200×630 PNG (seed from the ticket canvas) + twitter:card + og:url + theme-color + apple-touch-icon. | static | high |
| **One-tap WhatsApp share** | `buildCaption()` already emits the `?d=&c=` permalink; add a green "Send on WhatsApp" anchor → `api.whatsapp.com/send?text=`. India's dominant share surface. | pure client | high |
| **Skip-the-animation + continue last journey** | "Skip →" resolves `departAnim()` early; auto-skip on `saveData`/2g. Persist inputs to localStorage; on param-less return, offer "Continue your journey to {city}, {date}?" | pure client | high |
| **Data-source attribution + /credits** | Open-Meteo free tier is **CC-BY 4.0 and requires** visible "Weather data by Open-Meteo.com"; Wikimedia/Wikidata are CC-BY-SA. Weather/history/twins currently show with **no credit** — a real licence gap. | in-repo | medium |
| **Which ritu India was breathing** | `rashiChart()` already returns sidereal `sunLon` → `floor(sunLon/60)` picks the drik ritu; `Seasons()` adds "X days after the solstice". Activates the shipped-but-dead `ritu.json`. | compute + ritu.json | medium |
| **Your life, counted** | Days/weeks alive, Purnimas witnessed (iterate `SearchMoonPhase` 180), countdown to next round-number day. Light early interstitial that builds dwell. Drop the numerology-age hook (every age reduces to 1–9). | pure compute | high |
| **Birthstone & rudraksha** | `nakshatras.json` already has a `lord` per star → 9-row planet→gem→mukhi lookup. Gems as CSS gradients, rudraksha inline SVG. Framed as heritage correspondence, **not** medical/remedial. | nakshatras.json + own table | medium |
| **Your beej mantra** | Join nakshatra lord → its navagraha `beej` (already in panchang.json) + presiding deity; text-only Devanagari+IAST "sound of your star" card. | panchang.json + nakshatras.json | medium |
| **Scratch-to-reveal** | Canvas destination-out over data the app already makes (headline / twin / milestone). `preventDefault` on touchmove; instant reveal under reduced-motion. | pure canvas | medium |

## 🟡 Medium bets — M effort, clear payoff
| Idea | What | Source | Impact |
|---|---|---|---|
| **The Moon exactly as it hung over your city** | `Illumination('Moon')` → exact %lit + phase angle; SVG terminator ellipse with latitude-correct horn tilt. Flagship single-fact beat. Verified working for 1950s dates. | pure compute | high |
| **/born-on/[mm-dd] SEO pages (366 at build)** | `getStaticPaths()` emits 366 static pages with real per-date OG tags (crawlers run no JS). Bake Wikimedia On-This-Day + Wikidata India births **once at build** → committed JSON. CTA deep-links `?d=`. | build-baked | high |
| **Festivals & the season you arrived in** | mhah-panchang resolves masa/paksha/tithi 1950–2010 → derive lunar festivals (Diwali=Kartika Amavasya…), solar via ingress, nearest to DOB. Needs a festival→meaning table + static Eid table (Eid drifts ±1–2d). | mhah-panchang + own table | high |
| **Real PM/President faces on the newspaper** | Finite set (~15 PMs, ~14 Presidents). Build-time Wikidata P18 → Commons thumb + per-file licence → static JSON. Keep PD-India/GODL/CC-only + initials fallback. | build-time Wikidata P18 | high |
| **Full Hindi UI toggle** | Extract UI strings to keyed en/hi table + persistent EN\|हि toggle; ~6–8 KB gz lazy-loaded. Real cost is hand-authoring fluent Hindi, not code. | in-repo t() layer | high |
| **Guess-the-price mini-quiz** | Gate before the money beat: pick, then reveal with the existing count-up + "off by 4×". Only quiz items with a real value near that year (petrol/gold/usd denser than cinema/chai). | prices.json | high |
| **GI-tagged craft/food of your district** | Static district→GI-product JSON from the Wikipedia "Geographical indications in India" table (~603 products). NB: P6248 is **not** a GI property — the table is the spine. Extends the knownfor pattern. | Wikipedia GI table (build) | high |
| **India-in-space (ISRO) by your birthday** | Curated static timeline Aryabhata 1975→2010; show most-recent launch before DOB + running count + next as teaser; pre-1975 → Thumba-1963 fallback. | Wikipedia ISRO lists (build) | high |
| **Bharat Ratna + Padma honour roll of your year** | Static {year:[recipients]} verified vs Wikipedia + MHA PDF. **Award isn't annual** — make "nearest prior / most recent" primary with explicit "none conferred in YYYY". Portraits P18 only where PD/CC. | Wikipedia lists + verified QIDs | high |
| **Your life in headlines** | One India headline per year DOB→today, ends "today". Real work = curating 2011–2025 rows (milestones.json stops at 2010). | milestones.json (extend) | high |
| **Vertical 9:16 story card** | Second canvas beside `drawTicket()` at 1080×1920 with city/date + stats + totem + QR. WhatsApp Status & IG Stories are 9:16. | share.js | high |
| **Period-correct map of India for your year** | ~6 era buckets (pre-1956 → 2000 states); inline hand-picked Commons SVG basemaps, highlight the city, caption the twist. Work is licence-vetting per file. | Commons SVG admin maps (build) | high |
| **A freedom-fighter born in your district** | Build-time Wikidata (occupation Q30242234, P19→district). Only ~201/619 resolve to district → most cities hit state fallback (anticipated). | Wikidata (build) | high |
| **Nearest famous temple/shrine to your city** | Build-time Wikidata P625 (3,432 Hindu temples; 4,417 incl. other faiths), nearest per city by haversine, ranked by notability. Respects plurality. | Wikidata P625 (build) | medium |
| **Blur-up LQIP + a11y pass** | Remote thumbs lack width/height (CLS on 4g) → aspect wrapper + blur box. A11y: aria-live on #chartmoon/#deitystory/#dasharibbon, skip-link, radiogroup scope-btns. | in-repo | medium/high |
| **Installable PWA + offline replay** | `@vite-pwa/astro` precaches shell + data, SWR-caches the 3 APIs. **Gotcha:** GitHub Pages base path `/janam-express/` is a known vite-plugin-pwa pain point — budget for it. | @vite-pwa/astro | high |

## 🔭 Big bets — L effort / infra, high ceiling
| Idea | What | Source | Note |
|---|---|---|---|
| **Per-journey dynamic OG image (Cloudflare Worker)** | Free workers.dev + `workers-og` (Satori) renders a 1200×630 PNG at `/og?d=&c=` with the user's real city/₹ figure + an HTML shell so WhatsApp's crawler sees it. | **needs worker** | Do the static og:image first — most of the win, zero infra. Keep Satori text Latin (Devanagari bug). |
| **The night sky over your city (capstone)** | One polar-azimuthal SVG dome at midnight IST: ~40 bright stars (PD RA/Dec table) + real Moon + 5 planets; Agastya/Canopus highlighted (real latitude payoff). | pure compute | Depends on the moon + dusk-planet beats shipping first. |
| **Planets visible after sunset** | `SearchRiseSet('Sun','set')` then loop 5 bright planets via Equator+Horizon; keep alt>3°, rank by magnitude, place by azimuth. "Shukra was the evening star." | pure compute | Lowest-effort of the astronomy set; live-tested. |
| **The nearest eclipse — and if your city saw it** | `NextLunarEclipse` + `SearchLocalSolarEclipse(observer)` gives per-city altitude → "the Sun was 22° up, visible from your town". | pure compute | NB: **no reverse search** exists — search forward from ~200d before birth. |
| **Your name in every Indian script** | Type once → blooms in 10–12 Indic scripts, screenshottable. | sanscript.js (MIT) | **Licence fix:** Aksharamukha is AGPL — use `indic-transliteration/sanscript.js`. Fonts must be subset + lazy-loaded. |
| **Bhasha switch — journey in your mother tongue** | Reuse the Hindi t() layer, default to the birth state's language via `regional.json` stateLang. | in-repo | Bottleneck is non-machine-translated copy in 7–8 scripts; do after Hindi. |
| **"Your city, back then" — a real period photo** | One genuine pre-~1965 B&W photo per city (India's 60-yr rule → only pre-1965 reliably free). Build-time Commons query, PD-India/PD-old only. | Commons (build) | Coverage is thin (metros only); degrade gracefully. Never scrape press/agency photos. |

## 🔴 Not on the timetable — ruled out (with why)
- **Sensex snapshot** — Sensex only starts 1 Jan 1986, so it excludes the older half of 1950–2010 by construction; no free no-key live endpoint (Yahoo CSV deprecated). Partial-audience for real M effort.
- **Biggest film of your year** — India has **no official box-office tracking**; only inflated single-source estimates. Overlaps the existing CRT "film of the year". Must carry an "estimates" caveat.
- **Cost-of-living basket (milk/tea/scooter per year)** — no single clean six-decade source; you'd interpolate heavily and mark most values "approx". The money beat + price quiz already deliver the payoff.
- **Pretty permalink path `/j/mumbai-1990`** — a true pretty *path* needs the worker; on static Pages you only get a hash/query. The current `?d=&c=` already works. Low value.
- **Folk-art image layer (Warli/Madhubani photos)** — most modern folk-art works on Commons are **still in copyright**; licence-vetting is a trap. Ship the *text* override; images text-only fallback.
- **Nakshatra deity-art expansion to "nearly every nakshatra"** — Ravi Varma painted popular Puranic deities, **not** the obscure Vedic nakshatra guardians (Aryaman, Bhaga, Pushan, Aditi…). Achievable coverage is well below the promise. Add only a handful more verified PD paintings.
- **GODL-India leader photo filmstrip** — 144k files but each needs provenance + GODL/CC + attribution vetting. Lower signal than the finite PM/President P18 set.

---
### Verified gotchas worth remembering
- Share loop is **silently broken** today (no og:image) — the single highest-leverage fix.
- Open-Meteo attribution is **mandatory** (CC-BY 4.0), currently missing.
- `ritu.json` is shipped but **dead** — trivial to activate.
- astronomy-engine has **no reverse eclipse search**; Aksharamukha is **AGPL**; several pitched Wikidata QIDs were **stale/wrong** (Bharat Ratna, freedom-fighter, GI) — always verify QIDs at build.
