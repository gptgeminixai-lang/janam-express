# Janam Express — Expansion Roadmap

*Prioritized against your constraints: fast on Jio 4G, free/no-auth data, precompute over live APIs, static-first. Everything below is either pure-client or build-time precompute unless flagged "needs Worker."*

---

## 1. TOP 10 — highest impact, best first

Ranked by (wow × feasibility), biased toward cheap + delightful + uniquely Indian.

1. **Your Address Had No PIN Code Yet** — binary date-twist: born before 15-Aug-1972 → "India had no PIN codes; your city's 400001 didn't exist until you were N." Same for STD dialing (first Lucknow–Kanpur 26-Nov-1960).
   - *Wow:* "When you were born, your house had no PIN code — it wouldn't exist for another 9 years."
   - *Source:* pure date arithmetic vs two fixed Wikipedia dates + static 145-city PIN prefix map. Zero data risk.
   - **Effort: trivial**

2. **Gift-a-Ticket (make a card FOR someone)** — second entry mode: punch in a parent/friend's DOB + city + message, generate THEIR telegram + ticket, output a permalink they open. This is the core viral loop — every birthday on Indian WhatsApp becomes a reason to send one.
   - *Wow:* "Banaya kisi aur ke liye? Unhe unka Janam Express ticket bhejo — WhatsApp par."
   - *Source:* generative/computed, reuses existing `?dob=&city=&for=&msg=` permalink scheme. Zero backend.
   - **Effort: easy**

3. **Born-in-Your-City Hall of Fame** — 3–5 famous people born IN the picked city, ranked by fame and by birth-year proximity ("Sachin was born in your Mumbai just 4 years before you").
   - *Wow:* "Sachin Tendulkar took his first breath in your Mumbai, just four years before you."
   - *Source:* Wikidata SPARQL (`query.wikidata.org/sparql`), `P31 wd:Q5; P19/P131* wd:CITYQID; wikibase:sitelinks`. Precompute one query per 145 cities at build; cached forever. Use `P131*` rollup so suburb/hospital births roll up to the city.
   - **Effort: easy**

4. **Festival Proximity Almanac** — nearest major festival and exact day-distance: "You arrived 3 days before Diwali 1975" / "on the morning of Holi." Region-aware (Pongal/Onam/Bihu per picked state).
   - *Wow:* "You were born just 3 days before Diwali — the diyas were already lit."
   - *Source:* precompute Gregorian festival dates 1950–2010 at build; **derive Hindu festivals via the mhah-panchang lib already in your stack** (clean fallback, avoids scraping drikpanchang). Eid needs a separate Hijri–Gregorian table.
   - **Effort: medium**

5. **Real film posters + trailer/song links** — attach the actual movie poster + a tappable YouTube song/trailer to the #1 Hindi film and each regional film. Turns the CRT TV from text into a real poster wall.
   - *Wow:* "Here's the poster that was outside your local cinema — tap to hear its biggest song."
   - *Source:* TMDB API (free Developer key, email-verify only). `/movie/{id}/images` + `/movie/{id}/videos` → `youtube.com/watch?v={key}`. Films-per-year is a fixed finite list — **resolve once at build, self-host poster JPEGs** so runtime needs no API. Check TMDB attribution requirement.
   - **Effort: medium**

6. **Cricket match on your exact DATE** — replace the year's iconic moment with the actual India match on/nearest the birthday: teams, venue, result, "India were 240/4 at tea on the day you were born."
   - *Wow:* "On the afternoon you were born, Tendulkar was on 84 not out at the Wankhede."
   - *Source:* Cricsheet `india_json.zip` (~1,323 matches, ODC-BY, commercial OK). `info.dates` is `["YYYY-MM-DD"]` — build a date→match index at build time. Coverage strong post-2001; needs graceful "nearest match that season" fallback for 1950–2000.
   - **Effort: medium**

7. **Janma Kundli-Lite card (no birth time needed)** — from DOB + city lat/long: rashi (moon sign), sidereal sun sign, birth nakshatra + pada + lord. Rendered as an almanac card, framed as "your sky at that moment," never prediction.
   - *Wow:* "On 14 Nov 1972 the Moon sat in Ashwini — you're an Ashwini soul, ruled by Ketu."
   - *Source:* mhah-panchang (MPL-2.0, already shipped) returns Nakshatra/Raasi/Tithi directly; cross-check with astronomy-engine (MIT, 116KB). **Avoid Swiss Ephemeris (AGPL/commercial) — never ship it client-side.** Use Lahiri ayanamsa (govt-of-India standard) consistently.
   - **Effort: easy**

8. **Spotify-Wrapped swipeable story mode** — repackage existing modules (telegram, rupee count-up, #1 film/song, cricket, panchang) as full-screen vertical auto-advancing cards, sequenced by drama, ending on a "Share your Wrapped" card. Massively boosts dwell time + screenshot rate.
   - *Wow:* "Aapka Janam Wrapped — swipe karo, 1962 se aaj tak."
   - *Source:* pure client (CSS scroll-snap + a few KB JS). All data already precomputed.
   - **Effort: medium**

9. **Share-to-WhatsApp ticket IMAGE (Web Share API L2)** — upgrade share from text/link to sharing the rendered ticket PNG file directly into WhatsApp's native sheet with prefilled caption + permalink. Image spreads AND carries the clickable link.
   - *Wow:* "Ticket seedha WhatsApp pe bhejo — photo bhi, link bhi."
   - *Source:* `navigator.share({files})` + `navigator.canShare({files})`, Chrome Android since v75. Must fire on user tap. Fallback to download+link. Use `html-to-image` (better fonts/perf than html2canvas). Pure client.
   - **Effort: easy**

10. **Was it a record? Heatwave/coldwave verdict** — upgrade "real weather that day" with a climatological percentile: "44°C — hotter than 96% of that date in your city's recorded history."
    - *Wow:* "That day hit 44°C — hotter than 96% of that date in your city's recorded history."
    - *Source:* Open-Meteo ERA5 (1940+, already in stack). Precompute per-calendar-day percentiles per 145 cities at build; runtime is a lookup. Frame as "in the climate record," not official IMD record (ERA5 is grid-interpolated).
    - **Effort: medium**

---

## 2. QUICK WINS — could ship this week

All trivial/easy, mostly pure-client or one-file precompute.

- **PIN Code twist** (Top-10 #1) — pure date arithmetic vs 15-Aug-1972 / 26-Nov-1960. *Trivial.*
- **Vikram Samvat + Shaka + Samvatsara stamp** — Gregorian → Hindu-calendar coordinates as an ornate date stamp on the telegram. mhah-panchang gives masa/ritu; Samvat = arithmetic offset; Samvatsara = 60-name list + modulo anchored to a verified year (2024-25 = Krodhi). *Watch: +57/+56 switch keys off computed masa, not a Jan/Mar cutoff; pick amanta month-naming.* *Trivial.*
- **Gift-a-Ticket** (Top-10 #2) — the single highest-leverage growth mechanic, and it's just URL params. *Easy.*
- **Compare two people / generation gap** — split-screen diff of two DOBs: "petrol ₹X vs ₹Y", "gold cost 47× less when Papa was born", shared nakshatra. Reuses CPI/petrol/gold/panchang; encode both DOBs in URL. *Wow: "Aap aur Papa — 30 saal, aur petrol 22 guna mehenga."* *Medium (borderline easy).*
- **"What would YOUR ₹500 be worth?"** — free-text amount inflated birth-year→2026, anchored to existing chai/petrol/gold prices. Pure client arithmetic on the CPI table you already have. *Wow: "Your grandfather's ₹500 salary in 1970 is ₹78,000 today."* *Trivial.*

*Also one-tap trivial if you want a sixth:* **Chinese zodiac + Western sun-sign strip** — pure arithmetic, `(year−4) mod 12`, no data source (handle late-Jan/Feb births with a small CNY table).

---

## 3. BIG BETS — higher-effort features that could define the product

1. **Programmatic per-date SEO pages** — pre-render one static page per calendar date (~366) and per date+year permalink at build (`/on/14-august-1990`), each carrying newspaper + rupee + #1 film/song + a "find your city" CTA. This is the **takemeback.to playbook** (`/events/date/[year]`, `/year/[year]`) and it's how time-machine sites earn organic traffic. Add `@astrojs/sitemap` with `lastmod`, ping IndexNow for instant crawl.
   - *Why it defines the product:* free, compounding, evergreen traffic — Google already gets asked "what happened on 14 August 1990?" Reuses datasets you've built.
   - *Risk:* thin templated pages get flagged — keep content real/grounded; split into topic sitemaps with strong internal linking. **Effort: medium.**

2. **Dynamic OG / link-unfurl = the friend's actual ticket** — when a permalink is shared, the WhatsApp/IG/Twitter preview thumbnail IS that person's pink railway ticket (name, year, city). Every share becomes an ad.
   - *The one serverless piece worth adding.* Verified constraint: WhatsApp's crawler does **not** run JS, so `og:image` must be a real static image URL in per-permalink HTML (JPG/PNG, <300KB, 1200×630). ~8,800 date×city combos is too many to pre-render every PNG — the clean answer is **one tiny Cloudflare Worker** (`workers-og`/`@vercel/og`, free 100k req/day) generating the card on-demand + edge cache.
   - **Effort: hard** (but the biggest single multiplier).

3. **Real pincode input + autocomplete** — replace/augment the 145-city picker with a 6-digit PIN box → Post Office name, district, state, lat/long. Captures rural users, feels eerily personal ("Janam at 411030, Parvati, Pune").
   - *Source:* **data.gov.in All-India Pincode Directory CSV** (GODL, free, offline-bundleable — the ONLY commercially-safe source). Ship a **compact prefix-indexed JSON, not raw 155k rows**, to stay Jio-fast; snap village weather to nearest ERA5 grid/existing city. **AVOID `aniket-thapa` GitHub API — it's CC BY-NC, non-commercial only.** Live fallback: `api.postalpincode.in`. **Effort: medium.**

4. **Extend the range to 2011–2025** (do this) + **down to ~1940** (do carefully) — post-2010 is trivially data-rich (captures Gen-Z buying gifts for younger siblings); every module is *better* there. Pre-1950 is thinner but emotionally huge (frame explicitly as "British India").
   - *2011–2025:* all existing sources cover it better; only "India didn't have yet" needs post-2010 firsts (UPI 2016, Jio 2016, 5G 2022, Chandrayaan-3 2023). **Effort: easy.**
   - *~1940–1949:* ERA5 weather works to 1940; Bollywood grossers reliable from 1940; USD-INR 1947 = ₹3.31; use Viceroy instead of PM. Sell sparseness as period atmosphere, never fabricate. Below ~1935 not recommended. **Effort: medium.**

---

## 4. DATA & TECH NOTES

**Free/no-auth sources & licensing caveats**
- **Wikidata SPARQL** — `query.wikidata.org/sparql`, free, JSON. Powers Born-in-Your-City (P19/P131*) and City's Oldest Newspaper (P31 Q11032 + P571). Can rate-limit — **precompute at build with retries**, never at runtime.
- **TMDB** — `api.themoviedb.org/3`, free Developer key (email verify). Posters + YouTube keys. **Self-host poster JPEGs at build** (CSP/perf); honor attribution.
- **Cricsheet** — `cricsheet.org/downloads/india_json.zip`, ODC-BY (commercial OK, attribution). `info.dates` array → date index. Dense post-2001.
- **Open-Meteo ERA5** — already in stack, free, 1940–present. Powers weather percentile + monsoon-onset derivation.
- **data.gov.in Pincode CSV** — GODL, free, ~155k rows, bundle a trimmed indexed JSON. **Not** the CC BY-NC aniket-thapa API.
- **byabbe.se On-This-Day** — `byabbe.se/on-this-day/{m}/{d}/events.json`, free/no-auth, for the honest date-specific headline layer. Frame as "what happened," **not** a ToI front-page reproduction (no free ToI archive exists — it's paywalled/library-only).
- **Astrology libs** — mhah-panchang (MPL-2.0, shipped) + astronomy-engine (MIT, 116KB, zero data files). **Hard licensing landmine: never ship Swiss Ephemeris / swisseph-wasm (GPL) / @fusionstrings/swisseph-wasi (AGPL) to a static client.** astronomy-engine is sub-arc-minute for Sun/Moon — ample for a garnish.
- **Counter** — Abacus (`abacus.jasoncameron.dev`, free, no-auth). **CountAPI (countapi.xyz) is DEAD — do not use.**
- **Analytics** — Cloudflare Web Analytics (free, cookie-free, only when proxied through CF) or Umami Cloud (100k events/mo free).

**Static vs serverless**
- **Pure static / build-time precompute (default for everything):** all Top-10 except dynamic OG. Wikidata/TMDB/Cricsheet/ERA5 all resolve once at build into static JSON.
- **The ONE serverless piece worth adding:** the Cloudflare Worker for **dynamic OG unfurl** — because ~8,800 date×city PNGs can't all be pre-rendered and crawlers don't run JS. Free tier (100k req/day) covers it; edge-cache each generated card.
- **Hosting migration:** GitHub Pages caps at 100 GB/mo bandwidth + 1 GB site — viral WhatsApp traffic will hit that. **Move to Cloudflare Pages** (unlimited bandwidth, 20k files/deploy, 500 builds/mo, free) before programmatic pages + traffic scale. The 20k-file cap means full-static date×city (millions) won't fit — that combo must use Workers on-demand, not pre-render.

**Deprioritize / avoid**
- **Baby-name-of-the-decade** — no reliable free Indian dataset (Forebears scrape-restricted, Kaggle needs auth, no SSA equivalent). Ship only as a clearly-labeled curated "popular names of the era" card, or skip.
- **Per-date × per-city full static pre-render** — combinatorial explosion (145 × 22k = 3.2M pages). Gate to popular cities + Worker on-demand rendering.

---

## 5. MONETIZATION — realistic for India

1. **Personalised-poster print-on-demand** — sell an A3 "birthday time-machine" poster (their day's newspaper + prices + film/song) + a printed replica of the pink ticket as a fridge magnet/postcard. **Zero inventory:** Qikink or Printrove (no signup/monthly fee, pay-per-order, ships 29,000+ pincodes). *Validate with a waitlist before building fulfillment — POD margins are thin and 300dpi print layout is real design work.*
2. **Razorpay micro-unlock (₹29–₹49)** — small unlock for a hi-res watermark-free poster or a full "life almanac," collected via Razorpay Payment Button (no backend, UPI-first). **2% + GST, no setup/monthly/minimum fee.** Keep the core experience free; needs a secure delivery mechanism so the paid asset can't be shared free.
3. **Sponsored decade / brand placement** — subtle "This decade brought to you by [brand]" on high-traffic year pages (an FMCG that launched in the 80s sponsoring 1980s pages; a bank sponsoring the rupee module). Native, no ad-tech bloat, stays Jio-fast. **Requires traffic proof first** — build SEO pages + analytics, then pitch.

*Sequencing: prove reach (SEO + analytics) → validate poster demand (waitlist) → add Razorpay unlock → sell sponsorships.*

---

## 6. WHAT I'D DO NEXT — 3-step sequence

**Step 1 — Ship the viral + delight bundle this week (all trivial/easy, pure-client):**
Gift-a-Ticket + Share-to-WhatsApp image + PIN Code twist + Vikram Samvat stamp + Compare-two-people. This turns every existing user into a distributor and adds four uniquely-Indian delight beats with zero new infrastructure.

**Step 2 — Add the eerily-personal precompute layer (build-time, no new hosting):**
Born-in-Your-City Hall of Fame (Wikidata) + Festival Proximity (mhah-panchang) + Real film posters (TMDB) + Cricket-on-your-exact-date (Cricsheet) + Kundli-Lite card + weather percentile. These are what make people screenshot and say "how does it *know* that?" Extend the range to 2011–2025 in the same pass (easy, widens the audience immediately).

**Step 3 — Build the growth engine (the one infra investment):**
Migrate to Cloudflare Pages → ship programmatic per-date SEO permalink pages → stand up the single Cloudflare Worker for dynamic OG unfurl so every shared link previews as the friend's actual ticket. This is the compounding-traffic + viral-multiplier combo; do it once the content depth from Steps 1–2 makes each shared/ranked page worth landing on. Wrap the modules in Wrapped-style story mode here to maximize dwell time on the incoming SEO traffic.

*Rationale: Steps 1–2 are zero-infra and immediately raise shares + wow; Step 3 is the only place you take on a Worker + host migration, and only after there's depth worth distributing.*