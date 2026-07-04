import prices from '../data/prices.json';
import filmsData from '../data/films.json';
import cricketData from '../data/cricket.json';
import milestonesData from '../data/milestones.json';
import citiesData from '../data/cities.json';
import staticData from '../data/static.json';

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
