/* Rashi (D1) chart — sidereal planetary positions by sign, computed from the birth
   date (midday IST, since we don't collect birth time). Presented as a garnish, not
   a prediction. astronomy-engine is dynamic-imported so it only loads on this beat. */

export const RASHIS = [
  'Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya',
  'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena',
];
// 27 nakshatras in order — indices join src/data/nakshatras.json
export const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha',
  'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha', 'Shatabhisha', 'Purva Bhadrapada',
  'Uttara Bhadrapada', 'Revati',
];
export const RASHIS_EN = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];
// display order matches the graha list below
const GRAHAS = [
  ['Su', 'Sun'], ['Mo', 'Moon'], ['Ma', 'Mars'], ['Me', 'Mercury'],
  ['Ju', 'Jupiter'], ['Ve', 'Venus'], ['Sa', 'Saturn'],
];
export const GRAHA_NAMES = {
  Su: 'Surya (Sun)', Mo: 'Chandra (Moon)', Ma: 'Mangal (Mars)', Me: 'Budh (Mercury)',
  Ju: 'Guru (Jupiter)', Ve: 'Shukra (Venus)', Sa: 'Shani (Saturn)',
  Ra: 'Rahu (N. node)', Ke: 'Ketu (S. node)',
};

let AE = null;
async function engine() {
  if (!AE) AE = await import('astronomy-engine');
  return AE;
}

// Lahiri ayanamsa (Govt of India standard), ~23.85° at J2000 + ~50.29"/yr precession.
function ayanamsa(date) {
  const y = date.getUTCFullYear() + date.getUTCMonth() / 12;
  return 23.853 + (y - 2000) * 0.0139625;
}
const norm = a => ((a % 360) + 360) % 360;

function meanNode(A, date) {
  const T = A.MakeTime(date).tt / 36525; // Julian centuries (TT) from J2000
  return norm(125.0445479 - 1934.1362891 * T + 0.0020754 * T * T);
}

export async function rashiChart(y, m, d) {
  const A = await engine();
  const date = new Date(Date.UTC(y, m - 1, d, 6, 30)); // ~12:00 IST
  const ayan = ayanamsa(date);
  const sid = tropLon => norm(tropLon - ayan);

  const placements = [];
  const tropOf = (abbr, body) => {
    if (body === 'Sun') return A.SunPosition(date).elon;
    if (body === 'Moon') return A.EclipticGeoMoon(date).lon;
    return A.Ecliptic(A.GeoVector(A.Body[body], date, true)).elon;
  };
  let moonLon = 0, sunLon = 0;
  for (const [abbr, body] of GRAHAS) {
    const lon = sid(tropOf(abbr, body));
    if (abbr === 'Mo') moonLon = lon;
    if (abbr === 'Su') sunLon = lon;
    placements.push({ graha: abbr, rashi: Math.floor(lon / 30) });
  }
  const rahu = sid(meanNode(A, date));
  placements.push({ graha: 'Ra', rashi: Math.floor(rahu / 30) });
  placements.push({ graha: 'Ke', rashi: Math.floor(norm(rahu + 180) / 30) });

  // group grahas by sign
  const signs = Array.from({ length: 12 }, () => []);
  for (const p of placements) signs[p.rashi].push(p.graha);

  const moonRashi = placements.find(p => p.graha === 'Mo').rashi;
  const sunRashi = placements.find(p => p.graha === 'Su').rashi;
  // janma nakshatra from the Moon's sidereal longitude (13°20' each; 4 padas of 3°20')
  const nakSize = 360 / 27;
  const nIndex = Math.min(26, Math.floor(moonLon / nakSize));
  const pada = Math.floor((moonLon % nakSize) / (nakSize / 4)) + 1;
  const fraction = (moonLon % nakSize) / nakSize; // how far through the nakshatra (for dasha balance)
  const moonNakshatra = { index: nIndex, name: NAKSHATRAS[nIndex], pada, fraction };
  // Yoga (sum of sidereal longitudes / 13°20') and Karana (half-tithi) — two more panchang limbs
  const yogaIndex = Math.floor(norm(moonLon + sunLon) / nakSize) % 27;
  const elong = norm(moonLon - sunLon);
  const tithiNum = Math.floor(elong / 12); // 0..29 (0-14 Shukla, 15-29 Krishna)
  const kHalf = Math.floor(elong / 6); // 0..59
  const MOV = ['Bawa', 'Balava', 'Kaulava', 'Taitila', 'Garija', 'Vanija', 'Vishti'];
  const karanaName = kHalf === 0 ? 'Kimstughna'
    : kHalf >= 57 ? ['Shakuni', 'Chatushpada', 'Naga'][kHalf - 57]
    : MOV[(kHalf - 1) % 7];
  return { signs, moonRashi, sunRashi, moonNakshatra, moonLon, sunLon, placements, yogaIndex, karanaName, tithiNum, ayanamsa: ayan };
}

/* ============================================================================
   Full birth-time chart for the /reading page. Unlike rashiChart (midday, sign-
   only), this takes the exact hh:mm + the birthplace lat/lon and computes the
   Lagna (ascendant), whole-sign houses, planet degrees, retrograde, combustion
   and dignity. Everything here is factual astronomy or a documented Parashari
   rule — no prediction. IST is a constant UTC+5:30 for the 1950-2010 cohort.
   ========================================================================== */
const DEG = Math.PI / 180, RAD = 180 / Math.PI;

// mean obliquity of the ecliptic (degrees) — Meeus leading terms, arc-second grade
function obliquity(A, date) {
  const T = A.MakeTime(date).tt / 36525;
  return 23.439291 - 0.0130042 * T - 1.64e-7 * T * T + 5.04e-7 * T * T * T;
}

// Sidereal ascendant longitude (deg). RAMC = local apparent sidereal time;
// Asc = atan2(cos RAMC, -(sin RAMC cos e + tan phi sin e)); then minus ayanamsa.
export function siderealAscendant(A, date, latDeg, lonDeg, ayan) {
  const ramc = norm(A.SiderealTime(date) * 15 + lonDeg); // GAST(h)->deg + east-lon
  const e = obliquity(A, date) * DEG, r = ramc * DEG, phi = latDeg * DEG;
  const asc = Math.atan2(Math.cos(r), -(Math.sin(r) * Math.cos(e) + Math.tan(phi) * Math.sin(e))) * RAD;
  return norm(norm(asc) - ayan);
}

// Parashari dignity of a graha in a sign (0=Mesha..11=Meena)
function dignityOf(abbr, sign) {
  const EX = { Su: 0, Mo: 1, Ma: 9, Me: 5, Ju: 3, Ve: 11, Sa: 6 };
  const DEB = { Su: 6, Mo: 7, Ma: 3, Me: 11, Ju: 9, Ve: 5, Sa: 0 };
  const OWN = { Su: [4], Mo: [3], Ma: [0, 7], Me: [2, 5], Ju: [8, 11], Ve: [1, 6], Sa: [9, 10] };
  if (EX[abbr] === sign) return 'exalted';
  if (DEB[abbr] === sign) return 'debilitated';
  if (OWN[abbr] && OWN[abbr].includes(sign)) return 'own';
  return null;
}

// ruling planet (dispositor) of each sign 0=Mesha..11=Meena — for Lagna lord, 10th lord etc.
export const SIGN_LORD = ['Ma', 'Ve', 'Me', 'Mo', 'Su', 'Me', 'Ve', 'Ma', 'Ju', 'Sa', 'Sa', 'Ju'];

// D9 Navamsa sign — the whole zodiac split into 108 parts of 3°20'; sign = part mod 12.
export const navamsaSign = L => Math.floor(L / (10 / 3)) % 12;
// D10 Dasamsa sign — 10 parts of 3° per sign; odd signs start from self, even from the 9th.
export const dasamsaSign = L => {
  const sign = Math.floor(L / 30), part = Math.floor((L % 30) / 3);
  return (((sign % 2 === 0) ? sign : sign + 8) + part) % 12;
};

const KARANA_MOV = ['Bawa', 'Balava', 'Kaulava', 'Taitila', 'Garija', 'Vanija', 'Vishti'];
const karanaFor = elong => {
  const kHalf = Math.floor(elong / 6);
  return kHalf === 0 ? 'Kimstughna'
    : kHalf >= 57 ? ['Shakuni', 'Chatushpada', 'Naga'][kHalf - 57]
    : KARANA_MOV[(kHalf - 1) % 7];
};

// Combustion orbs (deg) from the Sun; nodes & Sun excluded.
const COMBUST_ORB = { Mo: 12, Ma: 17, Me: 14, Ju: 11, Ve: 10, Sa: 15 };

export async function fullChart(y, m, d, hh, mm, lat, lon) {
  const A = await engine();
  // true birth instant in UTC (IST = UTC+5:30, constant for 1950-2010)
  const date = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
  date.setUTCMinutes(hh * 60 + mm - 330);
  const later = new Date(date.getTime() + 6 * 3600 * 1000); // +6h, for retrograde sensing
  const ayan = ayanamsa(date);
  const sid = t => norm(t - ayan);

  const tropOf = (body, when) => {
    if (body === 'Sun') return A.SunPosition(when).elon;
    if (body === 'Moon') return A.EclipticGeoMoon(when).lon;
    return A.Ecliptic(A.GeoVector(A.Body[body], when, true)).elon;
  };

  const grahas = [];
  let moonLon = 0, sunLon = 0;
  for (const [abbr, body] of GRAHAS) {
    const lonSid = sid(tropOf(body, date));
    if (abbr === 'Mo') moonLon = lonSid;
    if (abbr === 'Su') sunLon = lonSid;
    let retro = false;
    if (abbr !== 'Su' && abbr !== 'Mo') {
      let dl = sid(tropOf(body, later)) - lonSid;
      if (dl > 180) dl -= 360; else if (dl < -180) dl += 360;
      retro = dl < 0;
    }
    grahas.push({ graha: abbr, lon: lonSid, sign: Math.floor(lonSid / 30), degInSign: lonSid % 30, retro });
  }
  const rahu = sid(meanNode(A, date));
  grahas.push({ graha: 'Ra', lon: rahu, sign: Math.floor(rahu / 30), degInSign: rahu % 30, retro: true });
  const ketu = norm(rahu + 180);
  grahas.push({ graha: 'Ke', lon: ketu, sign: Math.floor(ketu / 30), degInSign: ketu % 30, retro: true });

  for (const g of grahas) {
    if (COMBUST_ORB[g.graha]) {
      let sep = Math.abs(g.lon - sunLon);
      if (sep > 180) sep = 360 - sep;
      g.combust = sep < COMBUST_ORB[g.graha];
    } else g.combust = false;
    g.dignity = dignityOf(g.graha, g.sign);
  }

  const ascLon = siderealAscendant(A, date, lat, lon, ayan);
  const lagnaSign = Math.floor(ascLon / 30);
  for (const g of grahas) {
    g.house = ((g.sign - lagnaSign + 12) % 12) + 1; // whole-sign house from Lagna
    g.navamsa = navamsaSign(g.lon); // D9 sign
    g.dasamsa = dasamsaSign(g.lon); // D10 sign
  }
  const G = ab => grahas.find(g => g.graha === ab);
  const moonSign = Math.floor(moonLon / 30);

  // Jaimini chara karakas by degree-within-sign (7-planet scheme): Atma & Amatya
  const byDeg = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa'].map(ab => ({ ab, deg: G(ab).degInSign })).sort((a, b) => b.deg - a.deg);
  const atmakaraka = byDeg[0].ab, amatyakaraka = byDeg[1].ab;

  // Mangal (Kuja) Dosha — Mars in 1/2/4/7/8/12 from Lagna, Moon or Venus, with documented softenings
  const marsSign = G('Ma').sign;
  const hFrom = from => ((marsSign - from + 12) % 12) + 1;
  const BAD = new Set([1, 2, 4, 7, 8, 12]);
  const mRefs = { 'the Lagna': hFrom(lagnaSign), 'the Moon': hFrom(moonSign), 'Venus': hFrom(G('Ve').sign) };
  const mFrom = Object.entries(mRefs).filter(([, h]) => BAD.has(h)).map(([k, h]) => `${k} (${h}${['st', 'nd', 'rd'][h - 1] || (h === 1 ? 'st' : h === 2 ? 'nd' : h === 3 ? 'rd' : 'th')} house)`);
  const mCancels = [];
  const marsDig = dignityOf('Ma', marsSign);
  if (marsDig === 'own' || marsDig === 'exalted') mCancels.push(`Mars is in its ${marsDig} sign, which tradition holds strongly softens the dosha`);
  if (G('Ju').sign === marsSign) mCancels.push('Mars is joined by Jupiter, a classical cancellation');
  if (G('Mo').sign === marsSign) mCancels.push('Mars is joined by the Moon, which tradition counts as easing');
  const mangal = { present: mFrom.length > 0, from: mFrom, cancels: mCancels };

  // Kaal Sarp — all seven grahas hemmed on one side of the Rahu–Ketu axis
  const rahuLon = G('Ra').lon, ketuLon = G('Ke').lon;
  const arc = (a, x) => norm(x - a);
  const span = arc(rahuLon, ketuLon);
  const seven = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa'];
  const allRK = seven.every(ab => arc(rahuLon, G(ab).lon) < span);
  const allKR = seven.every(ab => arc(ketuLon, G(ab).lon) < arc(ketuLon, rahuLon));
  const kaalSarp = { present: allRK || allKR };

  const nakSize = 360 / 27;
  const nIndex = Math.min(26, Math.floor(moonLon / nakSize));
  const pada = Math.floor((moonLon % nakSize) / (nakSize / 4)) + 1;
  const fraction = (moonLon % nakSize) / nakSize;
  const elong = norm(moonLon - sunLon);

  return {
    timeKnown: true,
    instant: date.toISOString(),
    ayanamsa: ayan,
    lagna: { lon: ascLon, sign: lagnaSign, degInSign: ascLon % 30, lord: SIGN_LORD[lagnaSign] },
    grahas,
    moonLon, sunLon,
    moonRashi: moonSign,
    sunRashi: Math.floor(sunLon / 30),
    moonNakshatra: { index: nIndex, name: NAKSHATRAS[nIndex], pada, fraction },
    yogaIndex: Math.floor(norm(moonLon + sunLon) / nakSize) % 27,
    tithiNum: Math.floor(elong / 12),
    karanaName: karanaFor(elong),
    tenthLord: SIGN_LORD[(lagnaSign + 9) % 12],
    atmakaraka, amatyakaraka,
    doshas: { mangal, kaalSarp },
  };
}

/* Current sidereal transit positions of the nine grahas at `when` (default now).
   The /reading page derives gochara (house from natal Moon & Lagna) and Sade Sati. */
export async function transits(when = new Date()) {
  const A = await engine();
  const ayan = ayanamsa(when);
  const sid = t => norm(t - ayan);
  const out = [];
  for (const [abbr, body] of GRAHAS) {
    const lon = sid(body === 'Sun' ? A.SunPosition(when).elon
      : body === 'Moon' ? A.EclipticGeoMoon(when).lon
      : A.Ecliptic(A.GeoVector(A.Body[body], when, true)).elon);
    out.push({ graha: abbr, lon, sign: Math.floor(lon / 30) });
  }
  const rahu = sid(meanNode(A, when));
  out.push({ graha: 'Ra', lon: rahu, sign: Math.floor(rahu / 30) });
  out.push({ graha: 'Ke', lon: norm(rahu + 180), sign: Math.floor(norm(rahu + 180) / 30) });
  return out;
}
