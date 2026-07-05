/* Live data — every call is optional garnish: the page must render fully without network. */

const get = async (url, opts = {}, timeoutMs = 20000) => {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...opts, signal: ctrl.signal });
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
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

/* Wikimedia On This Day — notable world events on the birth date, across history.
   No key, CORS *. Returns a curated spread with thumbnails where available. */
export async function historyOn(m, d) {
  try {
    const u = `https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/events/${String(m).padStart(2, '0')}/${String(d).padStart(2, '0')}`;
    const j = await get(u);
    let events = (j.events || []).map(e => ({
      year: e.year,
      text: e.text,
      thumb: e.pages?.[0]?.thumbnail?.source || null,
      link: e.pages?.[0]?.content_urls?.desktop?.page || null,
    })).sort((a, b) => a.year - b.year);
    // prefer events that carry a thumbnail (more notable), keep chronological, cap at 6
    const withThumb = events.filter(e => e.thumb);
    const chosen = (withThumb.length >= 4 ? withThumb : events);
    // even spread across the timeline so it isn't all one century
    const out = [];
    const step = Math.max(1, Math.floor(chosen.length / 6));
    for (let i = 0; i < chosen.length && out.length < 6; i += step) out.push(chosen[i]);
    return out.length ? out : null;
  } catch { return null; }
}

/* Notable moments in INDIAN history on this MM/DD. The events feed alone is far too
   sparse for India (avg ~1/date, many dates empty), so we merge four authoritative
   On-This-Day feeds — events, selected, births and deaths — and keyword-filter to
   India. All no-key, CORS *. (Wikidata SPARQL for India events is 30-60s cold.) */
const INDIA_RX = /Indi(a|an)|Delhi|Mumbai|Bombay|Bengal|Kashmir|Gandhi|Mughal|Hindu|Sikh|Punjab|Madras|Calcutta|Kolkata|Chennai|Maratha|Rajput|Nehru|Ambedkar|Assam|Gujarat|Kerala|Tamil|Telugu|Hyderabad|Mysore|Odisha|Bihar|Rajasthan|Sikkim|\bGoa\b|ISRO|Ganges|Ganga|Himalaya|Sepoy|Partition|Bharat|Bollywood|Vedic|Maurya|Chola|Pandya|Pallava|Vijayanagara|Bangalore|Bengaluru|Pune|Poona|Lucknow|Kanpur|Jaipur|Nagpur|Patna|Bhopal|Indore|Ahmedabad|Varanasi|Amritsar|Rupee|Lok Sabha|Rajya Sabha|Ashoka|Tagore|\bBose\b|Patel|Shastri|Vajpayee|Indira|Rajiv|Nagaland|Manipur|Mizoram|Tripura|Meghalaya|Arunachal|Jharkhand|Chhattisgarh|Uttarakhand|Uttar Pradesh|Madhya Pradesh|Andhra|Karnataka|Maharashtra|Rashtrapati|Jawaharlal|Vivekananda|Aurobindo|Bhagat Singh|Netaji/;
// strip out clear non-India false positives ("American Indians", Indiana, West Indies, etc.)
const NOT_INDIA_RX = /American Indian|Native American|Red Indian|Indian reservation|Indian Territory|Indiana\b|Indianapolis|West Indies|Indian Wells/i;
const isIndia = t => !!t && INDIA_RX.test(t) && !NOT_INDIA_RX.test(t);
// turn a births/deaths feed item ("Mahatma Gandhi, Indian freedom fighter (died 1948)")
// into a timeline line ("Birth of Mahatma Gandhi — Indian freedom fighter")
const bioLine = (b, verb) => {
  const name = b.pages?.[0]?.titles?.normalized || b.pages?.[0]?.normalizedtitle || (b.text || '').split(',')[0];
  let desc = b.text || '';
  if (desc.startsWith(name)) desc = desc.slice(name.length);
  desc = desc.replace(/^[,\s]+/, '').replace(/\s*\((born|died)\s+\d+\)\s*$/i, '').replace(/[,;:\s]+$/, '').trim();
  return `${verb} ${name}${desc ? ' — ' + desc : ''}`;
};
export async function historyIndia(m, d) {
  const mm = String(m).padStart(2, '0'), dd = String(d).padStart(2, '0');
  const grab = async f => {
    try { const j = await get(`https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/${f}/${mm}/${dd}`); return j[f] || []; }
    catch { return []; }
  };
  try {
    const [events, selected, births, deaths] = await Promise.all(['events', 'selected', 'births', 'deaths'].map(grab));
    const seen = new Set(), pool = [];
    const add = (year, text, thumb, prio, filterText) => {
      if (year == null || !isIndia(filterText || text)) return;
      const key = year + '|' + text.slice(0, 42).toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      pool.push({ year: +year, text, thumb: thumb || null, prio });
    };
    for (const e of selected) add(e.year, e.text, e.pages?.[0]?.thumbnail?.source, 0);
    for (const e of events) add(e.year, e.text, e.pages?.[0]?.thumbnail?.source, 0);
    for (const b of births) add(b.year, bioLine(b, 'Birth of'), b.pages?.[0]?.thumbnail?.source, 1, b.text);
    for (const b of deaths) add(b.year, bioLine(b, 'Death of'), b.pages?.[0]?.thumbnail?.source, 1, b.text);
    if (!pool.length) return null;
    // real happenings first, thumbnailed first — then display the chosen set chronologically
    pool.sort((a, b) => a.prio - b.prio || (b.thumb ? 1 : 0) - (a.thumb ? 1 : 0) || a.year - b.year);
    return pool.slice(0, 7).sort((a, b) => a.year - b.year).map(({ year, text, thumb }) => ({ year, text, thumb }));
  } catch { return null; }
}

/* Famous people worldwide who share the birthday — Wikimedia On This Day births feed. */
export async function famousBirthdaysGlobal(m, d) {
  try {
    const u = `https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/births/${String(m).padStart(2, '0')}/${String(d).padStart(2, '0')}`;
    const j = await get(u);
    const items = (j.births || []).filter(b => b.pages && b.pages[0] && b.pages[0].thumbnail);
    // notability proxy: longer article extract ~ better-known person
    items.sort((a, b) => (b.pages[0].extract?.length || 0) - (a.pages[0].extract?.length || 0));
    return items.slice(0, 12).map(b => {
      const pg = b.pages[0];
      const name = (pg.titles && pg.titles.normalized) || pg.normalizedtitle || b.text.split(',')[0];
      const desc = b.text.replace(name, '').replace(/^[,\s]+/, '');
      return { name, year: String(b.year), occ: desc.replace(/\s+/g, ' ').slice(0, 46), img: pg.thumbnail.source };
    });
  } catch { return null; }
}

/* Famous Indians who share the birthday (same MM/DD). Wikidata SPARQL, CORS *, no key.
   Ranked by fame (sitelinks), with Commons photos. */
export async function famousBirthdays(m, d) {
  const q = `SELECT ?personLabel ?dob ?sitelinks ?img (SAMPLE(?ol) AS ?occ) WHERE {
  { SELECT ?person ?dob ?sitelinks WHERE {
      ?person wdt:P31 wd:Q5; wdt:P27 wd:Q668; wdt:P569 ?dob; wikibase:sitelinks ?sitelinks .
      FILTER(MONTH(?dob)=${m} && DAY(?dob)=${d} && ?sitelinks >= 9)
    } ORDER BY DESC(?sitelinks) LIMIT 10 }
  OPTIONAL { ?person wdt:P18 ?img }
  OPTIONAL { ?person wdt:P106 ?o. ?o rdfs:label ?ol. FILTER(LANG(?ol)="en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} GROUP BY ?personLabel ?dob ?sitelinks ?img ORDER BY DESC(?sitelinks)`;
  try {
    const url = `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(q)}`;
    const j = await get(url, { headers: { Accept: 'application/sparql-results+json' } });
    const out = (j.results?.bindings || []).map(b => ({
      name: b.personLabel?.value,
      year: b.dob?.value?.slice(0, 4),
      occ: b.occ?.value || '',
      img: b.img ? b.img.value.replace(/^http:/, 'https:') + '?width=150' : null,
    })).filter(p => p.name && !/^Q\d+$/.test(p.name));
    return out.length ? out : null;
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
