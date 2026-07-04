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
