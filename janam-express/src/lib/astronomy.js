import SunCalc from 'suncalc';

const IST_OFFSET_MIN = 330; // UTC+5:30 — all Indian birthplaces

function toIST(date) {
  return new Date(date.getTime() + (IST_OFFSET_MIN + date.getTimezoneOffset()) * 60000);
}
const hhmm = d => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

export function skyOn(y, m, d, lat, lon) {
  const noon = new Date(Date.UTC(y, m - 1, d, 6, 30)); // ~noon IST
  const times = SunCalc.getTimes(noon, lat, lon);
  const moon = SunCalc.getMoonIllumination(noon);
  const phase = moon.phase;
  let phaseName = 'waning crescent';
  if (phase < 0.03 || phase > 0.97) phaseName = 'new moon';
  else if (phase < 0.22) phaseName = 'waxing crescent';
  else if (phase < 0.28) phaseName = 'first-quarter moon';
  else if (phase < 0.47) phaseName = 'waxing gibbous';
  else if (phase < 0.53) phaseName = 'full moon';
  else if (phase < 0.72) phaseName = 'waning gibbous';
  else if (phase < 0.78) phaseName = 'last-quarter moon';
  return {
    sunrise: hhmm(toIST(times.sunrise)),
    sunset: hhmm(toIST(times.sunset)),
    moonName: phaseName,
    moonIllum: Math.round(moon.fraction * 100),
  };
}

/* Panchang via mhah-panchang — field names vary between versions, so probe defensively. */
let panchangEngine = null;
async function engine() {
  if (panchangEngine) return panchangEngine;
  const mod = await import('mhah-panchang');
  const Ctor = mod.MhahPanchang || mod.default?.MhahPanchang || mod.default;
  panchangEngine = new Ctor();
  return panchangEngine;
}
const label = o => {
  if (!o) return null;
  if (typeof o === 'string') return o;
  return o.name_en_IN || o.name_en_UK || o.name || o.en || null;
};

export async function panchangOn(y, m, d, lat, lon) {
  try {
    const p = await engine();
    const date = new Date(Date.UTC(y, m - 1, d, 0, 30)); // ~6 AM IST, near sunrise
    const cal = p.calendar(date, lat, lon);
    const cal2 = typeof p.calculate === 'function' ? p.calculate(date) : {};
    return {
      tithi: label(cal.Tithi) || label(cal2.Tithi),
      nakshatra: label(cal.Nakshatra) || label(cal2.Nakshatra),
      paksha: label(cal.Paksha) || label(cal2.Paksha),
      // MoonMasa is the lunar month; cal.Raasi is the SUN's sign (and localised), so we skip it
      masa: label(cal.MoonMasa) || label(cal.Masa) || label(cal2.Masa),
    };
  } catch (err) {
    console.warn('panchang unavailable:', err);
    return null;
  }
}
