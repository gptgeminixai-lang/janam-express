/* Live data — every call is optional garnish: the page must render fully without network. */

const get = async (url, opts) => {
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
};

/* Open-Meteo ERA5 archive — real weather at the birth coordinates, back to 1940. No key. */
export async function weatherOn(lat, lon, iso) {
  try {
    const u = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}` +
      `&start_date=${iso}&end_date=${iso}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Asia%2FKolkata`;
    const j = await get(u);
    const d = j.daily;
    if (!d || d.temperature_2m_max?.[0] == null) return null;
    return { tmax: d.temperature_2m_max[0], tmin: d.temperature_2m_min[0], rain: d.precipitation_sum?.[0] ?? 0 };
  } catch { return null; }
}

/* Wikimedia On This Day — world events for the date. No key, CORS *. */
export async function onThisDay(m, d, birthYear) {
  try {
    const u = `https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/events/${String(m).padStart(2, '0')}/${String(d).padStart(2, '0')}`;
    const j = await get(u);
    const events = (j.events || [])
      .filter(e => e.year <= birthYear && e.year > birthYear - 60)
      .sort((a, b) => b.year - a.year)
      .slice(0, 2)
      .map(e => `${e.year} — ${e.text}`);
    return events.length ? events : null;
  } catch { return null; }
}

/* TMDB posters of the birth week — optional; needs PUBLIC_TMDB_KEY in .env. */
export async function postersOf(iso) {
  const key = import.meta.env.PUBLIC_TMDB_KEY;
  if (!key) return null;
  try {
    const d = new Date(iso);
    const shift = (days) => {
      const x = new Date(d); x.setDate(x.getDate() + days);
      return x.toISOString().slice(0, 10);
    };
    const u = `https://api.themoviedb.org/3/discover/movie?api_key=${key}&region=IN` +
      `&primary_release_date.gte=${shift(-10)}&primary_release_date.lte=${shift(10)}` +
      `&with_original_language=hi|ta|te|ml|kn|bn|mr|pa&sort_by=popularity.desc`;
    const j = await get(u);
    return (j.results || [])
      .filter(r => r.poster_path)
      .slice(0, 6)
      .map(r => ({ title: r.title, img: `https://image.tmdb.org/t/p/w185${r.poster_path}` }));
  } catch { return null; }
}
