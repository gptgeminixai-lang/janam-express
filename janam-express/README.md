# Janam Express 🎟️

**The day you were born, in India — as a train journey.**

Enter a date of birth (1950–2010) and a place of birth anywhere in India, and ride back to your day zero: what ₹100 was worth, what was playing in the cinemas, what Team India was doing, the morning's newspaper, the weather over your hometown, the star the sky filed you under — ending with a souvenir Edmondson railway ticket built for the WhatsApp share sheet.

## Run it

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # static site in dist/
```

## Optional: film posters (TMDB)

Create a `.env` file (copy `.env.example`) and add a free TMDB API key to show the actual movie posters of the birth week:

```
PUBLIC_TMDB_KEY=your_key_here
```

Without a key the film channel still works from the bundled year-by-year data — the poster wall is just hidden. Note TMDB's free tier is **non-commercial**; get their commercial licence before monetising.

## How data works

- **Bundled, offline-first** (`src/data/*.json`): CPI multipliers (World Bank), gold/petrol/USD/salaries (RBI Handbook, PPAC, Pay Commissions), #1 film + song per year (Wikipedia, Binaca Geetmala), cricket moments, India milestones, PM/President date ranges, city gazetteer with renames and coordinates.
- **Live, optional garnish** (graceful when offline): Open-Meteo archive (real weather at the birth coordinates, back to 1940, no key), Wikimedia On This Day (world events, no key), TMDB posters (key required).
- **Computed in the browser**: sunrise/sunset/moon (SunCalc), janma nakshatra/tithi (mhah-panchang), day-of-week, ticket number.

Sparse series are log-interpolated between anchor years. Dashed price chips mark hedged "people remember paying…" numbers vs official series.

## Shareable links

Every journey is a permalink: `/?d=1990-06-15&c=Mumbai&n=Asha` — open it and the journey replays. The ticket can be shared via the Web Share API (WhatsApp on mobile) or downloaded as a PNG.

## Project shape

```
src/
  pages/index.astro    the single-page experience (booking → 8 beats → ticket)
  styles/global.css    railway-enamel / matchbox / Edmondson design system
  lib/main.js          orchestration: form, journey render, reveals
  lib/lookup.js        data access + interpolation
  lib/astronomy.js     SunCalc + panchang wrappers
  lib/api.js           Open-Meteo, Wikimedia On This Day, TMDB
  lib/share.js         canvas ticket PNG + Web Share + caption
  data/*.json          the time-machine datasets
```

Full product blueprint and research: see [`../concept/BLUEPRINT.md`](../concept/BLUEPRINT.md).

## Data credits

RBI Handbook of Statistics · World Bank · Wikipedia/Wikidata (CC BY-SA) · Cricsheet (ODC-BY) · Open-Meteo (CC BY 4.0) · Census of India · TMDB (attribution required).
