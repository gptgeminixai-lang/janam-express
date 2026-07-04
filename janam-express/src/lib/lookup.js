import prices from '../data/prices.json';
import filmsData from '../data/films.json';
import cricketData from '../data/cricket.json';
import milestonesData from '../data/milestones.json';
import citiesData from '../data/cities.json';
import staticData from '../data/static.json';
import regional from '../data/regional.json';
import statesymbols from '../data/statesymbols.json';
import stateculture from '../data/stateculture.json';
import knownfor from '../data/knownfor.json';

export const CITIES = citiesData.cities;
export const PMS = staticData.pms;
export const PRESIDENTS = staticData.presidents;
export const FIRSTS = staticData.firsts;

const byYear = rows => {
  const m = new Map();
  for (const r of rows) m.set(r.year, r);
  return m;
};
const FILMS = byYear(filmsData.films);
const SONGS = byYear(filmsData.songs);
const CRICKET = byYear(cricketData.moments);
const MILESTONES = byYear(milestonesData.milestones);

/* log-linear interpolation over sparse {year,value} rows */
export function series(rows, year) {
  const t = [...rows].sort((a, b) => a.year - b.year);
  if (year <= t[0].year) return t[0].value;
  const last = t[t.length - 1];
  if (year >= last.year) return last.value;
  for (let i = 0; i < t.length - 1; i++) {
    const a = t[i], b = t[i + 1];
    if (year >= a.year && year <= b.year) {
      const f = (year - a.year) / (b.year - a.year);
      return Math.exp(Math.log(a.value) + f * (Math.log(b.value) - Math.log(a.value)));
    }
  }
  return last.value;
}
export function stepSeries(rows, year) {
  let v = rows[0].value;
  for (const r of [...rows].sort((a, b) => a.year - b.year)) if (year >= r.year) v = r.value;
  return v;
}
const stepPairs = (pairs, iso) => {
  let v = pairs[0][1];
  for (const [from, val] of pairs) if (iso >= from) v = val;
  return v;
};

export const econ = year => ({
  mult: series(prices.cpiMultiplier, year),
  gold: series(prices.gold, year),
  petrol: series(prices.petrol, year),
  usd: series(prices.usd, year),
  cinema: prices.cinema ? series(prices.cinema, year) : null,
  chai: prices.chai ? series(prices.chai, year) : null,
  salary: stepSeries(prices.salary, year),
  extras: (prices.extras || []).filter(e => Math.abs(e.year - year) <= 6),
});

export function nearestYear(map, year, maxDist = 2, allowFuture = 1) {
  for (let d = 0; d <= maxDist; d++) {
    if (map.has(year - d)) return map.get(year - d);
    if (d <= allowFuture && map.has(year + d)) return map.get(year + d);
  }
  return null;
}
export const filmOf = y => nearestYear(FILMS, y);
export const songOf = y => nearestYear(SONGS, y);
export const cricketOf = y => nearestYear(CRICKET, y, 4);
export const milestoneOf = y => nearestYear(MILESTONES, y, 3, 0);

export const pmOn = iso => stepPairs(PMS, iso);
export const presidentOn = iso => stepPairs(PRESIDENTS, iso);

export const population = year => ({
  popM: series(staticData.popM.map(([y, v]) => ({ year: y, value: v })), year),
  cbr: series(staticData.cbr.map(([y, v]) => ({ year: y, value: v })), year),
});

export function findCity(query) {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  return (
    CITIES.find(c => `${c.name}, ${c.state}`.toLowerCase() === q) ||
    CITIES.find(c => c.name.toLowerCase() === q) ||
    CITIES.find(c => c.oldName && c.oldName.toLowerCase() === q) ||
    CITIES.find(c => c.name.toLowerCase().startsWith(q)) ||
    null
  );
}

export function tvEra(y) {
  if (y < 1959) return 'Television did not exist in India yet — the radio was the family hearth, and Binaca Geetmala ran on Radio Ceylon every Wednesday at 8.';
  if (y < 1982) return 'One channel, black & white: Doordarshan. The whole street watched the same thing, together.';
  if (y < 1984) return 'Colour TV had just arrived — bought for the 1982 Delhi Asiad.';
  if (y < 1987) return "The Hum Log era: India's very first soap opera had the country hooked.";
  if (y < 1989) return 'Ramayan Sundays: at 9:30 AM the streets of India simply emptied.';
  if (y < 1991) return "Mahabharat on Sunday mornings — 'main samay hoon' — one TV, forty neighbours.";
  if (y < 1993) return 'The Gulf War played live on CNN, Star TV beamed in from satellite — the cable boom began.';
  if (y < 1997) return 'You belong to the first cable generation: Zee TV was brand new.';
  if (y < 2000) return 'Shaktimaan, Cartoon Network after school, one remote-control war per household.';
  if (y < 2005) return "Amitabh asked 'lock kiya jaye?' on KBC, and the saas-bahu era ruled 9 PM.";
  return 'Reality shows, DTH dishes on every roof — the last era before the smartphone ate television.';
}

export const fmtIN = n => Math.round(n).toLocaleString('en-IN');
export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/* Hindu-calendar year coordinates. The Vikram/Shaka new year falls on Chaitra
   Shukla Pratipada (~late March); we approximate the switch at Mar 22, so the
   value is a garnish, not an ephemeris. */
export function hinduYears(y, m, d) {
  const afterNewYear = m > 3 || (m === 3 && d >= 22);
  return {
    vikram: y + (afterNewYear ? 57 : 56),
    shaka: y - (afterNewYear ? 78 : 79),
  };
}

/* inflate a rupee amount from a birth year to today's money using the CPI multiplier */
export function inflate(amount, mult) {
  return amount * mult;
}

/* ---------- homeland / regional culture ---------- */
const normState = s => (s || '').replace(/\s*\(.*\)$/, '').replace(/\s+/g, ' ').trim();
export const stateSymbolsOf = state => statesymbols[normState(state)] || null;
export const stateCultureOf = state => stateculture.states[normState(state)] || null;
export const knownForOf = city => knownfor[city] || null;

/* the user's birth year in the calendar their region actually keeps */
export function regionalEra(state, year) {
  const c = stateCultureOf(state);
  if (!c) return null;
  const era = c.calendarEra || '', ny = c.newYear || '';
  const samv = () => stateculture.samvatsara[(((year - 1987) % 60) + 60) % 60];
  if (/Kollam/i.test(era)) return { label: 'Kollam Era', value: `${year - 825} ME` };
  if (/Bengali|Bangabda/i.test(era)) return { label: 'Bengali San', value: `${year - 593} BS` };
  if (/Vikram/i.test(era)) return { label: 'Vikram Samvat', value: `${year + 57} VS` };
  if (/Ugadi|Puthandu|Gudi|samvatsara|60-year|Tamil|Telugu/i.test(ny + era)) return { label: 'Samvatsara year', value: samv() };
  if (/Shaka|Saka/i.test(era)) return { label: 'Shaka Samvat', value: `${year - 78} Shaka` };
  return { label: 'Vikram Samvat', value: `${year + 57} VS` };
}

/* ---------- regional layer ---------- */
const langByCode = new Map(regional.languages.map(l => [l.code, l]));
const stateLangMap = new Map(regional.stateLang.map(s => [s.state, s]));

export function greetingOf(state) {
  const sl = stateLangMap.get(state);
  return langByCode.get(sl ? sl.lang : 'hi') || langByCode.get('hi');
}

/* which regional film industry (with per-year data) does this state watch? */
const CINEMA_LANGS = {
  ta: ['Tamil', 'Kollywood'], te: ['Telugu', 'Tollywood'], ml: ['Malayalam', 'Mollywood'],
  kn: ['Kannada', 'Sandalwood'], bn: ['Bengali', 'Tollygunge'],
};
const ERA_LANGS = { mr: 'marathi', pa: 'punjabi', gu: 'gujarati', or: 'odia', as: 'assamese' };

export function regionalCinemaOf(state, year) {
  const sl = stateLangMap.get(state);
  if (!sl) return null;
  for (const code of [sl.lang, sl.lang2]) {
    if (code && CINEMA_LANGS[code]) {
      const rows = regional.cinema[code] || [];
      const m = byYear(rows.map ? rows : []);
      const film = nearestYear(m, year, 4);
      if (film) return { kind: 'film', industry: CINEMA_LANGS[code][0], nickname: CINEMA_LANGS[code][1], ...film };
    }
    if (code && ERA_LANGS[code]) {
      const decade = Math.floor(year / 10) * 10;
      const era = regional.eras.find(e => e.language === ERA_LANGS[code] && Math.abs(e.decade - decade) <= 10);
      if (era) return { kind: 'era', industry: code, ...era };
    }
  }
  return null;
}

/* "your state didn't exist yet" twist */
export function stateStoryOf(state, iso) {
  const sf = regional.stateFormation.find(s => s.state === state);
  if (!sf || !sf.formed) return null;
  const birthYear = +iso.slice(0, 4);
  if (iso < sf.formed) {
    const formedOn = new Date(sf.formed).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    if (sf.oldName) {
      return `${state} did not exist yet — you were born in ${sf.oldName}. The state as you know it arrived on ${formedOn}.`;
    }
    const from = (sf.from || '').replace(/^carved (out of|from) /i, 'part of ');
    return `${state} did not exist yet — your birthplace was still ${from || 'on a different map of India'}. The state arrived on ${formedOn}.`;
  }
  if (sf.oldName && sf.renamedOn && iso < sf.renamedOn) {
    return `Your state was still called ${sf.oldName} — it became ${state} only in ${sf.renamedOn.slice(0, 4)}.`;
  }
  const age = birthYear - +sf.formed.slice(0, 4);
  if (age >= 0 && age <= 25) {
    return `${state} itself was only ${age === 0 ? 'months' : age + ' years'} old when you arrived.`;
  }
  return null;
}
