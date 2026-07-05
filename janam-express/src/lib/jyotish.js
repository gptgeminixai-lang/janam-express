/* Pure-computation Jyotish helpers — all birth-time-free, from the Moon's position + DOB + name. */
import dashas from '../data/dashas.json';
import numData from '../data/numerology.json';
import weekdays from '../data/weekday.json';
import ritus from '../data/ritu.json';

const YEAR_MS = 365.2425 * 86400000;

/* Vimshottari Mahadasha — the 120-year planetary life-cycle. Birth lord + sequence key
   only off the Moon's nakshatra (no birth time); the start-of-period drifts by weeks
   without the hour, so we place the user to the year, honestly. */
export function mahadasha(moonNakshatra, dob, today = new Date()) {
  const { order, years, note } = dashas;
  const startIdx = moonNakshatra.index % 9;
  const birthLord = order[startIdx];
  const balance = (1 - moonNakshatra.fraction) * years[birthLord];
  const periods = [{ lord: birthLord, start: 0, end: balance }];
  let idx = startIdx, cursor = balance;
  while (cursor < 108) {
    idx = (idx + 1) % 9;
    const l = order[idx];
    periods.push({ lord: l, start: cursor, end: cursor + years[l] });
    cursor += years[l];
  }
  const age = (today - dob) / YEAR_MS;
  const current = periods.find(p => age >= p.start && age < p.end) || periods[periods.length - 1];
  return {
    birthLord, birthNote: note[birthLord], balance, periods, age, current,
    currentNote: note[current.lord], currentYears: years[current.lord],
    intoBirth: years[birthLord] - balance, // years already elapsed of the birth period at birth
  };
}

/* Vimshottari ladder — the running Mahadasha → Antardasha → Pratyantardasha with real
   dates. Sub-period length = parent × (lord's years / 120). Birth-time sharpens the
   dates; without the hour they still drift by weeks, so we say so. */
export function dashaLadder(moonNakshatra, dob, today = new Date()) {
  const { order, years, note } = dashas;
  const md = mahadasha(moonNakshatra, dob, today);
  const toDate = yrs => new Date(dob.getTime() + yrs * YEAR_MS);
  const subPeriods = (lord, startYrs, lenYrs) => {
    const list = [];
    let cur = startYrs, idx = order.indexOf(lord);
    for (let i = 0; i < 9; i++) {
      const l = order[(idx + i) % 9];
      const len = lenYrs * years[l] / 120;
      list.push({ lord: l, startYrs: cur, endYrs: cur + len, start: toDate(cur), end: toDate(cur + len), note: note[l] });
      cur += len;
    }
    return list;
  };
  const maha = md.current;                       // {lord,start,end} in years
  const mahaLen = years[maha.lord];
  const mahaFullStart = maha.end - mahaLen;       // notional full start (negative for the birth period)
  const antars = subPeriods(maha.lord, mahaFullStart, mahaLen);
  const currentAntar = antars.find(a => md.age >= a.startYrs && md.age < a.endYrs) || antars[antars.length - 1];
  const pratys = subPeriods(currentAntar.lord, currentAntar.startYrs, currentAntar.endYrs - currentAntar.startYrs);
  const currentPraty = pratys.find(p => md.age >= p.startYrs && md.age < p.endYrs) || pratys[pratys.length - 1];
  return {
    age: md.age,
    maha: { lord: maha.lord, start: toDate(mahaFullStart), end: toDate(maha.end), note: note[maha.lord] },
    antars, currentAntar,
    pratys, currentPraty,
  };
}

/* Ank Jyotish — Moolank (birth day), Bhagyank (full DOB), Naamank (Chaldean name value). */
export function numerology(y, m, d, name) {
  const reduce = n => { n = Math.abs(n); while (n > 9) n = String(n).split('').reduce((a, c) => a + +c, 0); return n; };
  const moolank = reduce(d);
  const bhagyank = reduce([...String(d), ...String(m), ...String(y)].reduce((a, c) => a + +c, 0));
  let naamank = null;
  if (name) {
    const sum = name.toUpperCase().split('').reduce((a, ch) => a + (numData.chaldean[ch] || 0), 0);
    if (sum > 0) naamank = reduce(sum);
  }
  const info = n => n ? { n, planet: numData.planet[n], trait: numData.trait[n], lucky: numData.lucky[n] } : null;
  return { moolank: info(moolank), bhagyank: info(bhagyank), naamank: info(naamank) };
}

export const weekdayOf = dob => weekdays[dob.getDay()];

/* Ritu (season) + Ayana (the sun's northward/southward march) from the sidereal Sun sign. */
export function rituAyana(sunRashi) {
  const ritu = ritus[Math.floor(sunRashi / 2)];
  const uttarayana = sunRashi >= 9 || sunRashi <= 2; // sun in Makara..Mithuna
  return {
    ritu,
    ayana: uttarayana ? 'Uttarayana' : 'Dakshinayana',
    ayanaEn: uttarayana ? 'the sun climbing north toward the light' : 'the sun descending south into the dark half',
  };
}
