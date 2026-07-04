# JANAM EXPRESS — Synthesis Blueprint
*An India-first birthday time machine: DOB + place of birth in, a cinematic, shareable "day you were born" page out.*

---

## 1. THE BIG IDEA

**The concept:** Every incumbent "what happened on my birthday" site (takemeback.to, playback.fm, mybirthday.ninja) is Billboard-and-Hollywood-centric; every Indian birth-details product (AstroSage: 73M+ downloads, ~80% kundli share; ProKerala) is pure astrology. Nobody has ever shipped the obvious hybrid: a **secular, astrology-garnished, pincode-aware Indian time machine**. The user types their DOB and birthplace — a behaviour kundli culture already trained ~25M Indians/year to perform — and instead of a horoscope, they board a train back to their day zero: the ₹100 note their parents held (worth ₹5,169 today if born in 1970), the film posters outside their local cinema that week (TMDB), the Binaca Geetmala #1 blaring from every radio, whether India was mid-Test-match that very day (Cricsheet), the actual rainfall over their exact town that morning (Open-Meteo, back to 1940), their janma nakshatra, the PM in office, and — the plot twist — whether their birth certificate names a city that no longer officially exists ("You were born in BOMBAY"). It ends not with a stat dump but with a souvenir: a pink Edmondson-style railway ticket stamped with their date, station and Time-Traveller number, engineered for the WhatsApp share sheet. **Retro layer visual (Sivakasi matchbox, DD-era CRT, railway ticket), usability layer 2026 — the Poolsuite principle, in Hindi and English.**

**Name candidates:**
1. **Janam Express** (जन्म एक्सप्रेस) — the train metaphor is the UI; the share artifact is literally a ticket.
2. **Us Din** (उस दिन, "That Day") — short, bilingual, perfect for the meme caption format ("Us Din, gold was ₹184.").
3. **20 Paise** — named after the price of a chai in 1972; instantly communicates the whole product to anyone over 35.

---

## 2. DATA MODULES

Ranked by **wow-factor × feasibility**. Effort: trivial (<1 day) / easy (1–3 days) / medium (~1 week) / hard.

| # | Module | What it shows | Source (exact) | Effort | Wow caption |
|---|--------|---------------|----------------|--------|-------------|
| 1 | **Rupee Time Machine** | ₹100 in birth year → today's value (1960: 96x, 1970: 52x, 1980: 24x, 1990: 10x, 2000: 4.5x, 2010: 2.4x) | World Bank API `FP.CPI.TOTL` for IND (no key) → static JSON of ~70 CPI values, 1958–2025; cross-checked vs in2013dollars.com | **Trivial** | "The ₹100 note your parents held the day you were born is worth ₹5,169 today." |
| 2 | **Born-in-a-city-that-no-longer-exists** | Rename plot twist: Bombay→Mumbai 5-Nov-1995, Madras→Chennai 17-Aug-1996, Calcutta→Kolkata 1-Jan-2001, Bangalore→Bengaluru 1-Nov-2014, Gurgaon→Gurugram Apr-2016, Allahabad→Prayagraj Oct-2018 (+~25 more) | Wikipedia "Renaming of cities in India" → static ~30-row JSON | **Trivial** | "Your birth certificate says BOMBAY — the city called Mumbai didn't exist on paper yet." |
| 3 | **Gold on your birth day** | 24k/10g by year: 1964 ₹63.25, 1970 ₹184, 1980 ₹1,330, 1990 ₹3,200, 2000 ₹4,400, 2010 ₹18,500, 2025 ₹1L+ | RBI Handbook of Statistics (data.rbi.org.in, Excel) + BankBazaar 1964–2025 table → static JSON | **Trivial** | "Your grandmother's wedding bangles: ₹184/10g then. 650x that now." |
| 4 | **Cricket on your exact date** | Opponent, venue, result, player-of-match if India played that day; year highlight otherwise (1983 Lord's, 1985 B&H + Shastri's Audi, Sachin's maiden ton 14-Aug-1990, 1995 Sharjah Asia Cup, Ganguly's 117 on 15-Oct-2000, 2007 T20 WC) | cricsheet.org/downloads/india_json.zip (1,323 matches, ODC-BY, commercial OK) indexed by date; Statsguru deep links (`team=6;spanmin1=...`) for pre-2000 context | **Easy** | "Sachin scored his first-ever international hundred 3 days after you were born." |
| 5 | **Birthday twins (Indian)** | Famous Indians sharing your MM/DD, ranked by fame, with photos | Wikidata SPARQL (P31=Q5, P27=Q668, P569 month/day, rank by `wikibase:sitelinks`, photos via P18 → `commons.wikimedia.org/wiki/Special:FilePath/{file}?width=300`) — precompute all 366 dates | **Easy** | "You share July 4 with an acting PM of India, the Tata chairman, and the composer of Naatu Naatu." |
| 6 | **The week's movie posters** | Actual film posters in Indian theatres ±7 days of DOB, incl. regional (hi/ta/te/ml/kn/bn) | TMDB `/3/discover/movie?region=IN&primary_release_date.gte/lte&with_original_language=hi&sort_by=popularity.desc` (free key, attribution) | **Easy** | "These posters were hanging outside your local cinema the week you were born." |
| 7 | **Film + song of your year** | #1 grosser (1985 Ram Teri Ganga Maili, 1990 Dil, 1995 DDLJ, 2000 KNPH) + Binaca Geetmala annual #1 (1953–1993, e.g. 1985 "Sun Sahiba Sun", 1990 "Gori Hai Kalaaiyan"); Filmfare playback winners post-1993 | One-time scrape: `en.wikipedia.org/wiki/List_of_Hindi_films_of_YYYY` + hindigeetmala.net/geetmala/binaca_geetmala_topper.php → static JSON. **You'd own the only machine-readable Indian "song of your birth year" dataset.** | **Easy** | "The song your parents heard everywhere the year you were born." |
| 8 | **Weather at your birthplace, that day** | Real max/min temp + rainfall for exact coordinates, back to 1940 | `archive-api.open-meteo.com/v1/archive?latitude=..&longitude=..&start_date={DOB}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum` (no key, ERA5) | **Trivial** | "It rained 34 mm in Chennai the day you were born." |
| 9 | **Who ran India** | PM + President on the date, with derived stats and rare catches (Vajpayee's 13-day govt 16-May–1-Jun-1996; Emergency births 25-Jun-1975–21-Mar-1977; Kalam era 2002–07) | Hardcoded lists from Wikipedia (complete date ranges in research) | **Trivial** | "Indira Gandhi had been PM for exactly 3,412 days when you arrived." |
| 10 | **Nostalgia price card** | Petrol ₹0.90/L (1970), chai 20 paise (1972), movie ticket ₹2–2.50 (70s), Maruti 800 ₹47,500 (Dec 1983), govt salary ₹185/mo (1973), Bombay–Delhi flight ₹1,500 = 3 months' clerk salary (1980), postcard still 50 paise | Static tables: PPAC Excel (petrol, 2002+), Pay Commission records, hedged anecdotes flagged as "people remember paying…" | **Easy** | "A chai cost 20 PAISE — a coin that no longer exists." |
| 11 | **Panchang / birth star** | Tithi, nakshatra, paksha, rashi — computed offline | `mhah-panchang` npm (client-side, zero API cost); validate once against ProKerala | **Easy** | "Born on Ashtami tithi under Rohini nakshatra — same as Lord Krishna." |
| 12 | **Sunrise & moon** | Sunrise/sunset time + moon phase at birth coordinates | SunCalc JS (client-side, BSD-2, deterministic) | **Trivial** | "The sun rose at 6:04 AM over Patna as you arrived, under an 83%-lit gibbous moon." |
| 13 | **75,000 birthday siblings** | Births/day in birth year (1985: 772.6M pop × 35.42/1000 CBR ≈ 75k/day) + life expectancy then (~55.8 in 1985) | World Bank `SP.POP.TOTL`, `SP.DYN.CBRT.IN`, `SP.DYN.LE00.IN` (one cached range call `?date=1950:2026`) | **Trivial** | "~75,000 Indians were born with you that day. You were expected to live to 2041 — you'll beat it." |
| 14 | **What India didn't have yet** | National firsts vs DOB: first mobile call 31-Jul-1995 (Jyoti Basu→Sukh Ram, ₹8.40/min), VSNL internet 15-Aug-1995, first KFC Jun-1995 Bangalore, McDonald's 13-Oct-1996, Zee TV 1-Oct-1992, colour TV 1982 | Hardcoded ~40-row table | **Trivial** | "No one in India had a mobile phone or the internet the day you were born." |
| 15 | **Your TV era** | Hum Log 1984, Ramayan 25-Jan-1987 (streets emptied), Mahabharat 1988, Shaktimaan 1997, KBC 3-Jul-2000, saas-bahu era | Hand-curated JSON from Wikipedia "Television in India" | **Trivial** | "Every Sunday morning your whole neighbourhood gathered around one TV for Mahabharat." |
| 16 | **Faux front page** | Auto-composed retro "Front Page of {date}": On This Day events + India milestone table + that Friday's releases | Wikimedia Feed `api.wikimedia.org/feed/v1/wikipedia/en/onthisday/{type}/{MM}/{DD}` (CORS *, no key) + hardcoded 1950–2010 milestone table (liberalisation 24-Jul-1991, Pokhran-II 11-May-1998, Delhi Metro 24-Dec-2002, Chandrayaan-1 22-Oct-2008…) | **Medium** | "The newspaper your father bought that morning, reconstructed." |
| 17 | **Your city grew up with you** | Census population then vs now (Bangalore 1.66M in 1971 → ~14M) + city milestones (HITEC City Nov-1998, Namma Metro 20-Oct-2011, Delhi T3 3-Jul-2010) | citypopulation.de / censusindia.gov.in → static JSON, top 500 towns; hand-curated milestones for top 15 metros | **Medium** | "The Bengaluru you were born into had fewer people than today's Jaipur." |
| 18 | **USD/INR that day** | ₹4.76 (1950–66), ₹7.50 (post-Jun-1966), ₹16.65 (1989–90), ₹43.33 (1999–00) | Static RBI-derived table pre-1999; `api.frankfurter.dev/v1/{date}?base=USD&symbols=INR` (no key) for 1999+ | **Trivial** | "The day you were born, one dollar cost ₹7.50." |
| 19 | **NASA photo of your day** | APOD image (births after Jun-1995 only) | `api.nasa.gov/planetary/apod?date=YYYY-MM-DD` (free key) | **Trivial** | "What the universe looked like on your birthday, per NASA." |

---

## 3. THE EXPERIENCE

Structure follows the proven arc (Spotify Wrapped + Atlantic Life Timeline + Pudding scrollytelling): **cold open → departure → 6–8 alternating story beats → superlative → artifact.** One fact per screen, 9:16-safe, every card screenshot-ready.

**Screen 0 — The Booking Window (landing).** Full-screen, zero chrome. A hand-painted railway reservation counter (Bombay Duck Designs vernacular: enamel signboard type, matchbox-label border). One field set styled as a reservation slip: date dials + a place field that accepts a **6-digit pincode or city name** (api.postalpincode.in / Open-Meteo geocoding autocomplete). CTA button: a rubber stamp — *"BOOK TICKET TO {YEAR}"*.

**Screen 1 — Departure.** The stamp thunks; screen becomes a station platform; years flick past on a split-flap board (2026… 2019… 2008… 1995…) with the countdown-reveal theatrics that made whathappenedinmybirthyear.com viral. CSS scroll-driven animation (`animation-timeline: scroll()`), no JS on the main thread. Train sound optional, off by default.

**Screen 2 — Arrival card.** "You arrived on a **Tuesday**, {date}. The sun rose over {city} at **6:04 AM** under a waxing gibbous moon. It rained **34 mm** that day." (SunCalc + Open-Meteo). If applicable, the rename twist detonates here: the city name types out as "MUMBAI", then strikes through and re-stamps as **"BOMBAY"** in vintage letterpress. *Presentation: telegram form.*

**Screen 3 — The ₹100 note.** A pinned, scroll-scrubbed old ₹100 note; as the user scrolls, a **count-up number** climbs from ₹100 to ₹5,169 while a ribbon of anchor prices ticks past: *petrol 90 paise · chai 20 paise · cinema ₹2.50 · gold ₹184/10g*. GSAP ScrollTrigger pin; count-up via `steps()`. *Presentation: currency note as canvas.*

**Screen 4 — The CRT.** A Doordarshan-era TV frame (pure CSS: `repeating-linear-gradient` scanlines, feTurbulence grain, RGB text-shadow) "warms up" and channel-surfs: the week's **movie posters** (TMDB wall), the year's **#1 film**, the **Binaca Geetmala #1** with a play affordance, and the TV-era card ("Zee TV was one year old"). The channel knob is the scroll. *Presentation: MyRetroTVs-style frame device.*

**Screen 5 — The scoreboard.** Cricket beat on a stadium scoreboard with flip digits: exact-day match if Cricsheet has one ("India beat Pakistan at Sharjah that day"), else the year's iconic moment with a "see full scorecard" Statsguru deep link. *Presentation: manual scoreboard flip.*

**Screen 6 — The front page.** The auto-composed faux-vintage newspaper: masthead "{City} Herald", the date, PM's photo, 3 On-This-Day headlines, one India milestone ("PM announces liberalisation", 24-Jul-1991), price of the paper in the corner (25 paise). Tone rule from The Atlantic: **balance dark with light — end this beat on delight.** *Presentation: newspaper unfolding on scroll.*

**Screen 7 — Birthday twins + the crowd.** Wikidata photo strip of famous Indians born the same day, then the communal beat: "**~75,000 Indians** were born with you that day. You are **Time Traveller #48,217** to visit this date" (Bear 71 / Pudding pattern). *Presentation: passport-photo booth strip.*

**Screen 8 — The stars (garnish, not main course).** Nakshatra + tithi card in matchbox-label art style: "Rohini nakshatra, Shukla Paksha." Deliberately last-but-one — AstroSage's 73M downloads prove the pull; our restraint is the positioning.

**Screen 9 — The Ticket.** The page prints a **pink Edmondson railway ticket** (pink = Sleeper class, authentic color code): station = birthplace, date, train "JANAM EXPRESS", traveller number, three punchiest personal stats on the reverse. One-tap **Share to WhatsApp** (Web Share API with a 1080×1920 PNG file) + "Book a ticket for someone you love" re-entry loop.

---

## 4. SIGNATURE MOMENTS

1. **The Bombay Stamp.** The strikethrough-and-restamp of the city name ("Born in BOMBAY, 1993 — Mumbai didn't exist on paper yet"). Universally applicable to Mumbai/Chennai/Kolkata/Bengaluru/Gurugram births before the rename dates; the single strongest shareable line, per the research.
2. **The ₹100 count-up.** A physical old note morphing its value to ₹5,169 (or ₹9,625 for 1960 births) in front of the user. Percentile-style framing on the card: "Prices have risen 52x in your lifetime."
3. **The exact-day cricket hit.** When Cricsheet returns a match on the literal birth date, the card leads with it: "India was playing Pakistan at Sharjah the day you were born — and won by 4 wickets." Rare enough to feel like fate, common enough to happen often.
4. **The 20-paise chai.** A sub-rupee price rendered as an actual paise coin the user can flip — shocking because the coin itself no longer circulates. Caption preset in Hinglish: "Jab main paida hua, chai 20 paise ki thi."
5. **The Ticket itself.** People share objects, not stats. The Edmondson ticket is a downloadable, collectible artifact (mybirthday.ninja's rotating-collectible mechanic, Indianised) — and every shared link's `og:image` **is** the friend's ticket, so the WhatsApp unfurl recruits the next user.

---

## 5. TECH STACK + DATA PIPELINE

**Stack:** **Astro** (18KB JS vs ~180KB Next.js equivalent; Lighthouse 95+ on slow-4G vs ~75) with islands for the interactive bits. **CSS scroll-driven animations** (`animation-timeline: scroll()/view()`, compositor-thread, Chrome 115+/Safari 26, IntersectionObserver fallback for Firefox) for reveals/parallax; **GSAP ScrollTrigger** (23KB gzip) only for the 3 pinned/scrubbed sequences (note, CRT, ticket). CSS-only CRT/grain (scanlines + feTurbulence) — **no WebGL**; gate any extra flourish behind `navigator.connection.effectiveType` + `prefers-reduced-motion`. Share cards via **Satori/@vercel/og** (1200×630 for link unfurls at `/born/{yyyy-mm-dd}/{place}`; 1080×1920 story PNG via canvas + `navigator.share({files})` — bundle a Devanagari font). SunCalc + mhah-panchang run **in the browser**.

**Pipeline principle (from the research): pre-compute everything; only two live API calls per page view** (Open-Meteo weather; TMDB posters). Everything else ships as static JSON totalling ~1–2 MB, most of it lazy-loaded:

| Data | Mode | Source |
|---|---|---|
| CPI table 1958–2025 (~70 values) | **Static JSON, build-time** | `api.worldbank.org/v2/country/IND/indicator/FP.CPI.TOTL?format=json&date=1950:2026&per_page=100` |
| Gold, silver, USD/INR, petrol, LPG, salaries, postcard | **Static JSON, hand-compiled once** | RBI Handbook (data.rbi.org.in), PPAC Excel, Pay Commission, BankBazaar |
| #1 films per year + language | **Static, one-time scrape** | `en.wikipedia.org/wiki/List_of_Hindi_films_of_{YYYY}` via REST API |
| Binaca toppers 1953–93 + Filmfare 1994+ | **Static, hand-compiled** | hindigeetmala.net + Wikipedia |
| Birthday twins, all 366 dates | **Static, nightly-refreshable** | Wikidata SPARQL (custom User-Agent; ≤5 parallel) |
| Cricket match-by-date index | **Static, build-time** | cricsheet.org/downloads/india_json.zip |
| PM/President, renames, TV eras, national firsts, 1950–2010 milestones | **Hardcoded JSON** | Wikipedia (verified tables in research) |
| Pincode→lat/long directory | **Static, bundled/indexed** | data.gov.in All India Pincode Directory CSV (GODL) |
| City populations + metro milestones | **Static JSON** | citypopulation.de / censusindia.gov.in / Wikipedia city timelines |

**Live API table:**

| API | URL | Auth | Notes |
|---|---|---|---|
| Open-Meteo Archive | `archive-api.open-meteo.com/v1/archive` | None | ERA5 to 1940; CC BY 4.0; free tier non-commercial (~10k/day) — budget cheap commercial tier at monetisation; cache by pincode+date |
| Open-Meteo Geocoding | `geocoding-api.open-meteo.com/v1/search?name=..&country_code=IN` | None | Autocomplete fallback to bundled GeoNames IN.zip |
| TMDB Discover | `api.themoviedb.org/3/discover/movie?region=IN&...` | Free key (v3 param / v4 Bearer) | Non-commercial tier; attribution + logo mandatory |
| Wikimedia On This Day | `api.wikimedia.org/feed/v1/wikipedia/en/onthisday/{type}/{MM}/{DD}` | None (CORS `*`) | ~500 req/hr/IP anon; cacheable; CC BY-SA — keep attributed |
| api.postalpincode.in | `api.postalpincode.in/pincode/{PIN}` | None | ~1000/hr/IP, community-run — bundled CSV is the real source of truth |
| Frankfurter | `api.frankfurter.dev/v1/{date}?base=USD&symbols=INR` | None | 1999+ only; static RBI table before |
| World Bank | `api.worldbank.org/v2/country/IND/indicator/{code}` | None | Follow the 302 redirect (`curl -L`); fetch at build time only |
| NASA APOD | `api.nasa.gov/planetary/apod?date=..` | Free key | Post-Jun-1995 dates only |

---

## 6. PHASED ROADMAP

**MVP — 2 weeks (DOB-first, English, WhatsApp-ready).**
- Modules 1, 3, 5, 7, 9, 10, 13, 14, 18 (all static-data), + module 4 (Cricsheet index) + module 6 (TMDB, the one live call).
- Screens 0–5 + 7 + 9; departure animation; the Edmondson ticket + Satori OG images + Web Share API.
- Place input = city autocomplete only (Open-Meteo geocoding); weather deferred.
- Permalink structure `/born/1993-06-14/lucknow` from day one (takemeback.to's SEO engine).
- Success metric: WhatsApp share rate per completed reveal.

**V2 — the place layer + polish (weeks 3–6).**
- Pincode input (bundled directory), Open-Meteo birth-day weather, SunCalc sunrise/moon, mhah-panchang nakshatra card, city-rename twist, faux front page, TV-era CRT screen.
- Hindi + Hinglish caption presets; Devanagari font in share cards.
- Time-Traveller counter + "N people born your day have visited" (one tiny KV store — the only backend state).

**V3 — depth, regional, and the moat (months 2–4).**
- Regional cinema per birthplace (TMDB `with_original_language=ta/te/ml/kn/bn` + Wikipedia per-language film lists); city population + metro/mall/airport milestones for top 15 metros; Atlantic-style derived beats ("at your life's exact halfway point, X happened").
- Collectible ticket variants (rotating daily designs, mybirthday.ninja mechanic); "gift a ticket" flow for birthdays of others — the highest-frequency WhatsApp occasion in India.
- Monetisation prep: TMDB commercial licence, Open-Meteo paid tier, printed-ticket merch, brand "sponsored decades."

---

## 7. RISKS & GAPS

**Data gaps (known, plan around them):**
- **Pre-1958 CPI**: World Bank series starts 1958; use Labour Bureau CPI-IW (base 1946) linking factors or cap the engine at 1958 with graceful copy.
- **No official series** for movie tickets pre-2008, milk pre-2000, thali/chai/Bata/bicycles/train fares — present only in a visually distinct "people remember paying…" register. Never mix hedged anecdotes into the RBI-anchored cards; that separation is the fact-check firewall.
- **Real newspaper scans are a dead end** (ProQuest ToI 1838–2012 is institution-paywalled; Google News Archive stops 2009, thin on India). The faux front page is the product answer — and looks better than a blurry PDF. Link out to TOI's free text archive (`timesofindia.indiatimes.com/archive.cms`) for 2001+ births.
- **Cricsheet thins pre-2000** — fall back to the curated year-highlight table + Statsguru deep links (link, don't scrape: ToS risk).
- **Binaca ends 1993** — Filmfare playback winners + soundtrack sales (KNPH ~8.5–10M units) bridge 1994+.
- **Hindi On This Day doesn't exist** (Wikimedia hi endpoint 404s) and the en feed is not India-filtered (1 Indian in 50 births on a test date) — the Wikidata SPARQL precompute is the India layer, not the feed.

**Legal notes:**
- TMDB free tier is **explicitly non-commercial** — get the commercial licence before any monetisation; attribution + logo required from day one.
- Wikipedia text is **CC BY-SA (share-alike)** — keep it in attributed blocks; Wikidata is CC0; Cricsheet ODC-BY and GODL-India both allow commercial use with attribution strings.
- Panchang: use **mhah-panchang / Moshier-variant** to sidestep Swiss Ephemeris AGPL entirely.
- Never scrape ESPNcricinfo, Billboard, IMDb pages, or competitors' prose. Facts and dates aren't copyrightable in India (Eastern Book Co. v. Modak sets the bar) — hand-compiled tables with original prose are safe.

**Performance (the India constraint):**
- Budget: interactive in <1s on a ₹8,000 Android on Jio 4G. Astro static-first, ≤25KB JS on the landing screen, GSAP loaded only past Screen 2, CSS scroll timelines over JS everywhere possible, no WebGL, no canvas image-sequence scrubbing (the Apple technique is explicitly too heavy here), lazy-load per-beat JSON, `prefers-reduced-motion` honored.
- api.postalpincode.in is community-run with no SLA — the bundled data.gov.in CSV must be the primary path, the API a nicety.
- Wikidata WDQS limits (60s timeout, 5 parallel/IP) forbid live queries — the 366-date precompute is mandatory, not an optimisation.

**Product risks:**
- **Tone**: birth years contain Bhopal, Babri, 26/11. Adopt The Atlantic's rule — alternate heavy with light, never end a beat dark, and keep tragedy in the front-page module where a newspaper register makes it appropriate.
- **Astrology positioning**: nakshatra as garnish converts the AstroSage habit without becoming an astrology site; making it more prominent risks both brand and app-store/ads classification.
- **Virality dependency**: the loop is WhatsApp-first (unfurl = friend's ticket). If Web Share API file-sharing fails on a device, always fall back to a long-press-saveable image — the share must never dead-end.
