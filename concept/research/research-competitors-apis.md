SUMMARY:
The "what happened on my birthday" category is crowded but entirely Western-centric. The incumbents split into three types: (a) simple stat pages (dayofbirth.co.uk — day of week, seconds alive, star sign; 24 years old, 5M+ visitors, dated design, no history content), (b) rich time-machine pages (takemeback.to, mybirthday.ninja — #1 Billboard song, Time Person of the Year, moon phase, world population, zodiac + Chinese zodiac, famous births/deaths, birthday infographics/posters), and (c) single-hook viral tools (playback.fm's "#1 song on your birthday" which repeatedly goes viral on TikTok; whathappenedinmybirthyear.com's animated year-countdown built from CC-licensed Wikipedia text). Not one of them does India: no Bollywood #1, no cricket, no monsoon, no panchang/nakshatra, no rupee/gold price, no PM/President of India, no pincode-level localisation. Meanwhile Indian sites that DO personalise by birth date+time+place (AstroSage: 73M+ app downloads, ~80% kundli market share, 9 languages; ProKerala: free kundli, nakshatra finder, 100-year panchang) prove the "enter your birth details" behaviour is deeply ingrained in India — but they are 100% astrology with zero history/pop-culture/economics content. The gap is a secular-but-astrology-garnished, India-localised birthday time machine, and it is wide open.

On the data side, the whole product can be built free and mostly key-less. Core: Wikipedia REST "on this day" feed (en.wikipedia.org/api/rest_v1/feed/onthisday/{events|births|deaths|all}/{MM}/{DD}, no key, CC BY-SA), Wikidata SPARQL (query.wikidata.org, CC0 — filter births by P19 place-of-birth in India for India-born celebrities sharing the date), Open-Meteo archive (archive-api.open-meteo.com/v1/archive, ERA5 back to 1940, no key, CC BY 4.0 — actual weather in their birth city on their birth day), World Bank v2 (api.worldbank.org/v2, no key — India's population/GDP/CPI in birth year), Frankfurter (api.frankfurter.dev, ECB rates incl. INR back to Jan 1999, no key), api.postalpincode.in (free pincode→district/state lookup for the place-of-birth input), Cricsheet (cricsheet.org ball-by-ball JSON, ODC-BY, commercial OK), TMDB (free key, non-commercial, discover-by-release-date incl. Hindi/regional cinema), NASA APOD (space photo taken on their birthday, back to 1995), numbersapi.com date facts, and open-source Swiss-Ephemeris panchang libraries (drik-panchanga on GitHub) to compute tithi/nakshatra locally with no astrology-API cost. Riskier: data.gov.in needs a free API key (GODL-India licence allows commercial reuse with attribution), RBI DBIE (data.rbi.org.in/DBIE) is CSV/Excel download-only (no JSON API — pre-bake gold price and USD/INR tables), and Billboard-equivalents for India (Binaca Geetmala 1953–1993 toppers) exist only on fan sites/Internet Archive, so compile a static internal dataset rather than scraping at runtime. Legally: Wikipedia/Wikidata/Open-Meteo/Cricsheet/GODL data are all redistributable with attribution (Wikipedia is CC BY-SA share-alike — keep those blocks attributed and consider share-alike implications for that text); scraping ESPNcricinfo, Billboard, or astrology competitors is the only real legal risk and is avoidable.

ITEMS:
## dayofbirth.co.uk — the aging incumbent (competitor)
Live since ~2002 ('24 years', 5M+ visitors claimed). Shows: day of week you were born, age in seconds/days, star sign, famous shared birthdays, birth-year facts, a printable 'gift certificate', and a 'how long until my birthday' countdown. Dropdown date form (1900–2026), Facebook/Twitter/Pinterest share buttons. Ugly/missing: no historical events, no music/movies, no weather, no location input at all, dated 2000s design, zero India content.
SOURCE: https://www.dayofbirth.co.uk/
WOW: Proves the query has 20+ years of durable search demand, and that even a minimal page gets millions of visits — a modern, India-localised version starts miles ahead.

## takemeback.to — the closest 'full time machine' competitor
Enter day/month/year and get: historical events, celebrities born/died that day, #1 songs by day/year/country, #1 movie and book of the year, Time Person of the Year, key world leaders, moon phase for the date, Western zodiac + Chinese animal sign, and 'how old would someone born then be'. Publishes an editorial-standards page (takemeback.to/about-our-data) claiming human verification. Missing: everything is US/UK-centric (Billboard, Time magazine, Hollywood), no weather, no local place input, no India charts/leaders/cricket.
SOURCE: https://takemeback.to/ and https://takemeback.to/about-our-data
WOW: Its 'world leaders + #1 song + moon phase' bundle is the template to clone — swapping in PM of India, Binaca Geetmala/Bollywood #1 and monsoon weather makes it feel uncannily personal to an Indian user.

## onthisday.com / Britannica / History.com — reference-style, not personalised
onthisday.com offers events, famous births/deaths, music history, a 'My Birthday' section, and browsing by zodiac sign/year/day. Britannica and History.com have equivalent daily pages. Engaging: authority and depth. Ugly/missing: encyclopedia layout, ad-heavy, no single shareable 'your page', no year-specific personal stats, no India localisation (Indian events appear only when globally notable).
SOURCE: https://www.onthisday.com/ , https://www.britannica.com/on-this-day
WOW: Shows the ceiling of un-personalised content — your differentiator is the personalised, place-aware page these giants structurally can't ship.

## bornglorious.com — the only one with an India mode (partial gap already validated)
Daily lists of hundreds of celebrity birthdays/death anniversaries sourced from Freebase/Wikipedia-linked data, sortable by profession, nationality and birthplace — and it has a dedicated India section (bornglorious.com/india/birthday/). Clicking a name shows a bio snippet + Wikipedia link. Ugly/missing: pure list UI, no date-of-birth personalisation, no events/music/weather, looks like a database dump, no sharing hook.
SOURCE: https://www.bornglorious.com/india/birthday/?pd=today
WOW: Its India section's existence proves Indian demand for 'who shares my birthday'; Wikidata SPARQL lets you rebuild this filtered to India-born people — even to the user's home state — in one query.

## mybirthday.ninja — the shareability/gamification benchmark
Claims 89,170 famous birthdays and 18,526 events. Shows: #1 Billboard song at birth, world population in birth year, birth flower, birthstone, zodiac + numerology 'life path', birthday compatibility scores, days-until-next-birthday, and generates a shareable birthday infographic/poster with 16 collectible ninja designs that rotate daily (launched on Product Hunt as 'create and send birthday infographics in under a minute'). Missing: all US data, no location input, no India anything.
SOURCE: https://mybirthday.ninja/ and https://www.producthunt.com/products/mybirthday-ninja
WOW: The collectible auto-generated infographic is the single best sharing mechanic in the category — an Indian version (poster with your nakshatra, Bollywood #1, and the Test match India was playing) is built-in WhatsApp forward material.

## playback.fm/birthday — the viral one-trick proof
'#1 song on your birthday' from Billboard Hot 100 archives, plus UK and country-music variants and a 'pop culture #1' page. Repeatedly goes viral on TikTok (e.g. the '#1 song on your 12th birthday = your quarantine song' meme) and got Refinery29/EDM.com coverage. Why it works: one instant, emotionally charged answer + embedded audio + a meme-able caption format. Missing: nothing for India — there is no Indian-charts equivalent anywhere.
SOURCE: https://playback.fm/birthday-song
WOW: 'The Hindi film song ruling India the week you were born' does not exist on the internet as a product — first mover gets the TikTok/Reels meme cycle for the Indian market.

## whathappenedinmybirthyear.com — design-led virality (2011-era)
By Philipp Lenssen. Enter only a birth year; the page theatrically counts backwards year by year with fading animation, then narrates your year (news, pop culture) as a story. Built from Creative-Commons Wikipedia text, and the site itself is CC-licensed. Covered by Neatorama etc.; still ~16k monthly visitors a decade+ later. Missing: year-only (no day/place), text-only, dated, no India.
SOURCE: https://whathappenedinmybirthyear.com/
WOW: Proof that presentation alone (the animated 'time travel' reveal) made commodity Wikipedia data go viral — your page should open with a travel-back animation, not a form result.

## EverythingZoomer 'birthday machine' — effectively dead/unfindable (competitor churn)
The Canadian boomer-media site everythingzoomer.com (1.2M visits/month) no longer surfaces a birthday-machine tool; direct fetch of /birthday-machine/ returns 403 and searches find nothing. Category lesson: media-site widgets rot; standalone tools (playback.fm, takemeback.to) survive.
SOURCE: https://everythingzoomer.com/
WOW: One less competitor — and evidence the product should be a standalone destination, not a widget buried in a content site.

## India gap analysis: literally zero India-specific birthday time machines
Across all incumbents: #1 songs = Billboard/UK charts only; movies = Hollywood; leaders = US presidents/Time magazine; no cricket, no monsoon/weather-in-your-city, no rupee/gold prices, no panchang/tithi/nakshatra, no Indian languages, no pincode-level place input. The only India-flavoured products are pure-astrology (ProKerala/AstroSage) or bare celebrity lists (bornglorious/india, FilmiBeat Bollywood birthdays). Nobody combines secular history + Indian pop culture + local weather + light astrology in one personalised page.
SOURCE: https://takemeback.to/ vs https://www.prokerala.com/astrology/
WOW: The core pitch: ~25M Indians are born per year and every incumbent ignores what their birthday actually felt like in India.

## ProKerala — what Indian users expect from a birth-details form
Free tools: janm kundli by date+time+place, nakshatra/birth-star finder, North & South Indian chart styles, divisional (varga) charts, Tamil jathagam, Malayalam jathakam, and daily panchang for any date in the past 100 years, plus Tamil/Telugu/Malayalam/Hindu calendars 1900–2026. It also sells a commercial Astrology API (api.prokerala.com, freemium). Gets right: multi-language, place-of-birth autocomplete, instant free result before any upsell. Gets wrong (for your purposes): 100% astrology, no history/culture, cluttered with ads.
SOURCE: https://www.prokerala.com/astrology/
WOW: Validates that Indian users will happily type date+time+PLACE of birth — the exact input your time machine needs — because kundli culture already trained them to.

## AstroSage — scale proof for birth-date personalisation in India
AstroSage Kundli app: 73M+ downloads (first Indian astrology app past 70M), ~1.2–1.5M daily users, 11–12M monthly users, claimed ~80% market share of kundli generation, 4.4★ from 853k reviews, available in 9 Indian languages. Everything free at the entry level (kundli, matching, panchang), monetised via astrologer consultations and reports. Takeaway for a non-astrology product: include a tasteful 'your nakshatra & tithi' card (computable offline with open-source ephemeris code) as garnish, not the main course, and ship in Hindi + English minimum.
SOURCE: https://www.astrosage.com/kundli/ and https://www.astrosage.com/magazine/astrosage-kundli-app-crosses-70-million-downloads.asp
WOW: The astrology pull is quantified: tens of millions of Indians already generate a page from their birth details — you're redirecting an existing habit, not creating one.

## API: Wikipedia 'On This Day' feed — the free backbone
GET https://en.wikipedia.org/api/rest_v1/feed/onthisday/{type}/{MM}/{DD} where type ∈ all|events|births|deaths|holidays|selected. No API key (just send a descriptive User-Agent); verified live: returns JSON with text, year, and pages[] (title, extract, thumbnail, originalimage, coordinates, wikibase_item, content_urls). Alternative hosts: api.wikimedia.org/feed/v1/wikipedia/en/onthisday/... (portal version wants a bearer token) and the community byabbe.se/on-this-day API. Content licence: CC BY-SA — redistribution fine with attribution/share-alike.
SOURCE: https://en.wikipedia.org/api/rest_v1/feed/onthisday/all/06/15
WOW: One free call returns events + famous births + images for any birthday, including thumbnails you can drop straight into the share card.

## API: Wikidata SPARQL — India-born celebrity twins & 'born same day in your state'
Endpoint https://query.wikidata.org/sparql (GET/POST, no key, CC0 data — no attribution legally required). Query pattern: ?person wdt:P31 wd:Q5; wdt:P569 ?dob; wdt:P19 ?pob . ?pob wdt:P131*/wdt:P17 wd:Q668 — i.e., humans with date of birth P569 and place of birth P19 located in India (Q668); P625 gives birthplace coordinates for distance-to-user calculations. Also usable for 'Indian films released that year', 'chief minister of your state that day', etc. Practical note: rate-limited, queries can time out — pre-compute nightly dumps per date rather than querying live.
SOURCE: https://query.wikidata.org/
WOW: 'A future cricketer/CM/actor was born 40 km from you that same week' — a hyper-local hook no incumbent can do, from CC0 data.

## API: Open-Meteo Historical Weather — the actual weather at their birth, in their city
GET https://archive-api.open-meteo.com/v1/archive?latitude=..&longitude=..&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&daily=temperature_2m_max,precipitation_sum,... — ERA5 reanalysis back to 1940 at 0.25° (ERA5-Land 0.1° from 1950), gap-free for any Indian village. No API key for non-commercial use (10k calls/day soft limit; paid tier for commercial), data licensed CC BY 4.0. Pair with their free geocoding: https://geocoding-api.open-meteo.com/v1/search?name=Indore.
SOURCE: https://open-meteo.com/en/docs/historical-weather-api
WOW: 'It rained 43 mm in Patna the day you were born — the monsoon arrived early that year' is the single most 'how do they know that' moment on the page, and it's free.

## API: World Bank Indicators v2 — India in your birth year, no key
Base: https://api.worldbank.org/v2/country/IND/indicator/{CODE}?date=1993&format=json — no authentication at all, ~16,000 indicators. Key codes: SP.POP.TOTL (India's population your birth year), NY.GDP.PCAP.CD (GDP per capita), FP.CPI.TOTL (CPI for 'what ₹100 then is worth now'), SP.DYN.LE00.IN (life expectancy at your birth vs now), IT.CEL.SETS (mobile subscriptions = 0 for pre-1995 babies — great nostalgia stat).
SOURCE: https://api.worldbank.org/v2/country/IND/indicator/SP.POP.TOTL?format=json
WOW: 'When you were born, life expectancy in India was 58; you were expected to see 2051' — stats that reframe a whole life, from a URL with no signup.

## API: Frankfurter — rupee time machine (post-1999)
Base https://api.frankfurter.dev/v1/ (api.frankfurter.app also works). ECB reference rates for 33 currencies incl. INR, daily since 4 Jan 1999; no key, no hard quota. e.g. /v1/1999-01-04?base=USD&symbols=INR. Open source (github.com/lineofflight/frankfurter). For pre-1999 births use RBI/DBIE annual-average USD-INR tables (compile a static table 1947→1998: ₹4.76 in 1947, ₹7.5 in 1966, ₹17.9 in 1991...).
SOURCE: https://frankfurter.dev/
WOW: 'A dollar cost ₹36 the day you were born' + gold price lands hard with Indian parents' generation, who remember prices viscerally.

## Dataset: Cricsheet — what India's cricket team was doing that day
https://cricsheet.org/downloads/ — 22,000+ matches as ball-by-ball JSON: Tests (from 2002ish), ODIs, T20Is, IPL (complete from 2008), women's cricket. Licence ODC-BY (attribution, commercial use allowed). No API — download the ZIPs and index matches by date + teams locally. For births before ~2002, fall back to Wikipedia/Wikidata for 'India tour of X' series context rather than scraping ESPNcricinfo Statsguru (ToS risk).
SOURCE: https://cricsheet.org/downloads/
WOW: 'India beat Pakistan by 6 wickets the day you were born; Sachin scored 78*' — the most Indian delight moment possible, legally redistributable.

## API: TMDB — Bollywood & regional films around their birth date
https://api.themoviedb.org/3/discover/movie?with_origin_country=IN&with_original_language=hi&primary_release_date.gte=...&primary_release_date.lte=...&region=IN — filter by release window, language (hi/ta/te/ml/bn/kn), sort by popularity. Free API key via account settings; free tier is explicitly non-commercial and requires attribution ('This product uses the TMDB API but is not endorsed or certified by TMDB' + logo); commercial licence needs contacting TMDB. Coverage of older Hindi cinema is decent but posters for pre-1980 films are patchy — supplement with Wikipedia film-by-year lists (CC BY-SA).
SOURCE: https://developer.themoviedb.org/reference/discover-movie
WOW: Poster wall of 'films in Indian theatres the week you were born' — instant visual nostalgia, with images served free from TMDB's CDN.

## Dataset gap: Indian #1 songs — build a static Binaca Geetmala table
No API exists for Indian music charts. Binaca Geetmala (Radio Ceylon/Vividh Bharati) annual toppers 1953–1993 are documented at hindigeetmala.net/geetmala/binaca_geetmala_topper.php, keepalivebollywood.com/binacageetmala/, sunilslists.com, and an Internet Archive audio/list item covering 1953–2000. Post-1994: use Filmfare Award for Best Film/Music of the year (Wikipedia, CC BY-SA) or top-grossing Hindi film per year. Compile once into your own JSON (facts/chart positions themselves aren't copyrightable; don't copy the sites' prose).
SOURCE: https://www.hindigeetmala.net/geetmala/binaca_geetmala_topper.php
WOW: You'd own the only machine-readable 'India's song of the year you were born' dataset — the playback.fm moment nobody in India has shipped.

## API: data.gov.in (OGD) — free key, GODL licence, commercial OK
Register (Gmail login works) at https://www.data.gov.in/, grab API key from My Account; REST endpoints like https://api.data.gov.in/resource/{resource-id}?api-key=KEY&format=json. Useful datasets: IMD district rainfall, all-India pincode directory, crop prices, census tables. Licence: GODL-India (Gazette-notified 13 Feb 2017) — explicitly permits adaptation and commercial derivative works with an attribution statement incl. source URL. Caveats: dataset quality/format is inconsistent; python client `datagovindia` (PyPI) helps discovery.
SOURCE: https://www.data.gov.in/apis and https://www.data.gov.in/Godl
WOW: Official Indian government data, legally usable in a commercial product — e.g. 'your district got 1,120 mm of rain your birth year'.

## API: api.postalpincode.in — the place-of-birth input, solved free
GET https://api.postalpincode.in/pincode/{PINCODE} and https://api.postalpincode.in/postoffice/{NAME} — returns post office name, district, state, division as JSON; no key; ~1000 req/hour/IP rate limit (429 beyond). Backed by the govt All-India Pincode Directory (also on data.gov.in under GODL, so you can self-host the CSV and drop the dependency). Combine with Open-Meteo geocoding for lat/lon.
SOURCE: https://api.postalpincode.in/pincode/110001
WOW: Typing a 6-digit pincode and seeing your exact taluk named on the page makes the whole product feel 'made for India' in the first 5 seconds.

## API/data: RBI DBIE — gold, exchange rates, inflation (download, not API)
https://data.rbi.org.in/DBIE/ (new portal; old dbie.rbi.org.in) — RBI's Database on Indian Economy: long time series across 7 sectors incl. historical USD/INR reference rates, gold prices, bank deposit rates, WPI/CPI. No JSON API — Excel/CSV/PDF downloads only ('RBIDATA' mobile app exists). Terms allow research/re-use 'with courtesy to Database on Indian Economy, RBI'. Strategy: download once, bake annual gold-price (₹/10g since 1950s via Handbook of Statistics) and USD/INR tables into your app as static JSON.
SOURCE: https://data.rbi.org.in/DBIE/
WOW: 'Gold was ₹1,800/10g when you were born; the gold your grandmother bought for you is up 40x' — the most-screenshotted card for Indian audiences.

## APIs: numbersapi, NASA APOD, sunrise-sunset, moon phase — cheap delight garnish
numbersapi.com — GET http://numbersapi.com/{M}/{D}/date or /{year}/year, plain text or ?json, no key (HTTP-only; proxy it). NASA APOD: https://api.nasa.gov/planetary/apod?date=YYYY-MM-DD&api_key=DEMO_KEY (free key, photos back to June 1995) — 'the universe photographed on your birthday'. Sunrise/sunset for birth city & date: https://api.sunrise-sunset.org/json?lat=..&lng=..&date=YYYY-MM-DD (no key) or sunrisesunset.io which now also returns moon phase/illumination. Moon phase alt: Farmsense free API, or compute locally (trivial algorithm).
SOURCE: http://numbersapi.com/ and https://api.nasa.gov/
WOW: Small cards ('sun rose at 6:04 am over Jaipur as you arrived'; NASA's photo of that day) that cost one GET each and fill the page with variety.

## Open-source panchang: astrology garnish without an astrology API bill
Compute tithi, nakshatra, yoga, karana, vaara, rashi locally using Swiss Ephemeris-based open code: github.com/webresh/drik-panchanga (Python, computes values AND end-times), karthikraman/panchangam (festivals too), PyJHora (PyPI, full Vedic suite), bidyashish/panchang (TypeScript/JS for a Node backend). Swiss Ephemeris licence: AGPL or paid commercial licence from Astrodienst — architecturally isolate it as a microservice or use the Moshier-ephemeris variant to sidestep AGPL. Avoids ProKerala/VedicRishi paid astrology APIs entirely.
SOURCE: https://github.com/webresh/drik-panchanga
WOW: 'You were born on Ashtami tithi under Rohini nakshatra — same as Lord Krishna' rendered instantly, offline, at zero marginal cost.

## Shareability playbook: what actually goes viral in this category
Patterns observed: (1) single emotionally-charged fact beats data dump — playback.fm's one song sustains TikTok cycles; (2) auto-generated image cards drive sharing — mybirthday.ninja's collectible infographic posters were its Product Hunt hook; (3) theatrical reveal creates screen-recordable moments — whathappenedinmybirthyear's year-countdown animation; (4) identity/comparison framing ('your quarantine song', compatibility scores) makes people tag friends. For India specifically, optimise the share artifact for WhatsApp (1080×1080 or 1200×630 card with 3–4 punchy facts + nakshatra + song), add Hindi/Hinglish caption presets, and give each date a permalink (takemeback.to's per-date/per-year URLs are also its SEO engine).
SOURCE: https://playback.fm/birthday-song and https://www.producthunt.com/products/mybirthday-ninja
WOW: A WhatsApp-first share card is the Indian growth loop none of the Western sites optimised for — birthdays are the highest-frequency WhatsApp-forward occasion in India.

## Legal matrix: what you can redistribute vs what to avoid
SAFE with attribution: Wikipedia/Wikimedia feed text+images (CC BY-SA — share-alike applies to that text, keep it in clearly attributed blocks), Wikidata (CC0, no strings), Open-Meteo (CC BY 4.0, but API itself non-commercial free tier — budget for their cheap commercial tier), Cricsheet (ODC-BY, commercial fine), GODL-India govt datasets (commercial fine, formal attribution string required incl. URL), World Bank (CC BY 4.0), Frankfurter/ECB rates (free reuse), NASA (public domain). CONDITIONAL: TMDB (free key is non-commercial; get commercial licence before monetising; mandatory logo+notice), Swiss Ephemeris (AGPL/paid). AVOID scraping: ESPNcricinfo, Billboard, Spotify charts, IMDb, astrology competitors' text, and news archives (Times of India front pages — link, don't copy). Facts and dates themselves aren't copyrightable in India (no database right; Eastern Book Co. v. Modak sets a low-but-real originality bar), so hand-compiled fact tables (Binaca toppers, PM/CM lists, gold prices) are safe if you write your own prose.
SOURCE: https://www.data.gov.in/Godl and https://en.wikipedia.org/wiki/Template:GODL-India
WOW: Nearly the entire dream feature set is buildable with zero licensing spend at launch — the only pre-revenue paperwork is a TMDB commercial licence and an ephemeris licence decision.


