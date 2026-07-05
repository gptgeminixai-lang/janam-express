/* The /reading page — a factual Vedic birth chart from date + TIME + place, plus a
   full traditional reading. Astronomy (Lagna, houses, degrees, dashas, transits) is
   computed and labelled "Computed fact"; interpretation (career, lucky, remedies,
   forecast) is documented Jyotish tradition, labelled as such and never blended.
   Nothing here is a prediction, guarantee, or medical/financial/legal claim. */
import citiesData from '../data/cities.json';
import nakData from '../data/nakshatras.json';
import R from '../data/reading.json';
import { fullChart, rashiChart, transits, navamsaSign, dasamsaSign, RASHIS, RASHIS_EN, NAKSHATRAS, SIGN_LORD } from './kundli.js';
import { dashaLadder } from './jyotish.js';

const CITIES = citiesData.cities;
const NAK = nakData;
const $ = id => document.getElementById(id);

const findCity = q => {
  q = (q || '').trim().toLowerCase();
  if (!q) return null;
  return CITIES.find(c => `${c.name}, ${c.state}`.toLowerCase() === q)
    || CITIES.find(c => c.name.toLowerCase() === q)
    || CITIES.find(c => c.oldName && c.oldName.toLowerCase() === q)
    || CITIES.find(c => c.name.toLowerCase().startsWith(q)) || null;
};

const GRAHA_FULL = { Su: 'Sūrya', Mo: 'Chandra', Ma: 'Maṅgala', Me: 'Budha', Ju: 'Guru', Ve: 'Śukra', Sa: 'Śani', Ra: 'Rāhu', Ke: 'Ketu' };
const GRAHA_ORDER = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra', 'Ke'];
const fmtDeg = d => { const D = Math.floor(d), M = Math.floor((d - D) * 60); return `${D}°${String(M).padStart(2, '0')}′`; };
const DIGN_LABEL = { exalted: 'exalted', debilitated: 'debilitated', own: 'own sign' };
const ORD = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const PAKSHA_TITHI = ['Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima/Amavasya'];
const SI_CELL = [[0, 1], [0, 2], [0, 3], [1, 3], [2, 3], [3, 3], [3, 2], [3, 1], [3, 0], [2, 0], [1, 0], [0, 0]];
const houseFrom = (sign, ref) => ((sign - ref + 12) % 12) + 1;
const mDate = dt => `${MON[dt.getMonth()]} ${dt.getFullYear()}`;
// dashas.json uses full English lord names; map to the abbreviations reading.json/GRAHA_FULL key on
const DASHA_ABBR = { Sun: 'Su', Moon: 'Mo', Mars: 'Ma', Mercury: 'Me', Jupiter: 'Ju', Venus: 'Ve', Saturn: 'Sa', Rahu: 'Ra', Ketu: 'Ke' };
const dashaTheme = lord => (R.planet[DASHA_ABBR[lord]] || {}).dashaTheme || '';

/* ---------- prefill from the journey permalink ---------- */
const params = new URLSearchParams(location.search);
if (params.get('d')) $('rd-date').value = params.get('d');
if (params.get('c')) $('rd-place').value = params.get('c');
if (params.get('n') && params.get('n') !== 'Traveller') $('rd-name').value = params.get('n');
$('rd-citylist').innerHTML = CITIES.map(c => `<option value="${c.name}, ${c.state}"></option>`).join('');

/* ---------- live Ascendant preview ---------- */
let previewTimer = null;
const schedulePreview = () => { clearTimeout(previewTimer); previewTimer = setTimeout(runPreview, 250); };
async function runPreview() {
  const el = $('rd-livelagna');
  const city = findCity($('rd-place').value);
  const dv = $('rd-date').value, tv = $('rd-time').value;
  if ($('rd-unknown').checked) { el.innerHTML = '<span class="rd-dim">Birth time unknown — the ascendant needs a time.</span>'; return; }
  if (!city || !dv || !tv) { el.innerHTML = '<span class="rd-dim">Enter date, place and time to see your rising sign.</span>'; return; }
  const [y, m, d] = dv.split('-').map(Number);
  const [hh, mm] = tv.split(':').map(Number);
  try {
    const c = await fullChart(y, m, d, hh, mm, city.lat, city.lon);
    el.innerHTML = `Ascendant (Lagna): <b>${RASHIS[c.lagna.sign]}</b> · ${RASHIS_EN[c.lagna.sign]} ${fmtDeg(c.lagna.degInSign)}`;
  } catch { el.innerHTML = '<span class="rd-dim">—</span>'; }
}

/* ---------- cast the chart ---------- */
async function cast(e) {
  if (e) e.preventDefault();
  const city = findCity($('rd-place').value);
  const dv = $('rd-date').value;
  const timeUnknown = $('rd-unknown').checked;
  const tv = $('rd-time').value;
  const out = $('rd-result');

  if (!dv) return flash('Please enter your date of birth.');
  if (!city) return flash('Please pick your birthplace from the list of Indian cities.');
  const [y, m, d] = dv.split('-').map(Number);
  if (y < 1950 || y > 2010) return flash('Janam Express covers births from 1950 to 2010.');
  if (!timeUnknown && !tv) return flash('Enter your birth time, or tick “I don’t know my birth time”.');

  out.innerHTML = '<p class="rd-casting">Casting your chart…</p>';
  out.hidden = false;
  try {
    if (timeUnknown) {
      const chart = await rashiChart(y, m, d);
      const ladder = dashaLadder(chart.moonNakshatra, new Date(y, m - 1, d), new Date());
      renderNoTime(chart, { y, m, d, city }, ladder);
    } else {
      const [hh, mm] = tv.split(':').map(Number);
      const chart = await fullChart(y, m, d, hh, mm, city.lat, city.lon);
      const ladder = dashaLadder(chart.moonNakshatra, new Date(y, m - 1, d), new Date());
      const trans = await transits(new Date());
      renderFull(chart, { y, m, d, hh, mm, city }, ladder, trans);
    }
    out.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (err) {
    out.innerHTML = `<p class="rd-casting">The sky-almanac hit a snag — please try again.</p>`;
  }
}
function flash(msg) { const f = $('rd-formmsg'); f.textContent = msg; f.hidden = false; setTimeout(() => { f.hidden = true; }, 5000); }

/* ---------- shared bits ---------- */
const factSection = (title, body) => `<section class="rd-sec"><div class="rd-sechead"><span class="rd-badge fact">Computed fact</span><h2>${title}</h2></div>${body}</section>`;
const tradSection = (title, body) => `<section class="rd-sec"><div class="rd-sechead"><span class="rd-badge trad">Jyotish tradition</span><h2>${title}</h2></div>${body}</section>`;
const factCard = (title, body) => `<div class="rd-fact"><span class="rd-badge fact">Computed fact</span><h3>${title}</h3>${body}</div>`;
function panchangLine(chart) {
  const paksha = chart.tithiNum < 15 ? 'Shukla' : 'Krishna';
  return `${paksha} Paksha · ${PAKSHA_TITHI[chart.tithiNum % 15] || ''} tithi · Yoga ${chart.yogaIndex + 1} · Karana ${chart.karanaName}`;
}
function birthLine(meta) {
  const t = ('hh' in meta) ? `, ${String(meta.hh).padStart(2, '0')}:${String(meta.mm).padStart(2, '0')}` : ' (time unknown)';
  return `${meta.d} ${MONTHS[meta.m - 1]} ${meta.y}${t} · ${meta.city.name}, ${meta.city.state}`;
}

function southIndianChart(grahas, lagnaSign, title, subtitle, showFlags) {
  const cells = Array.from({ length: 12 }, (_, s) => {
    const here = grahas.filter(g => g.sign === s);
    const [row, col] = SI_CELL[s];
    const house = lagnaSign != null ? houseFrom(s, lagnaSign) : null;
    const asc = s === lagnaSign;
    const planets = here.map(g => {
      const flags = showFlags ? [g.retro ? 'R' : '', g.combust ? 'c' : '', g.dignity === 'exalted' ? '↑' : g.dignity === 'debilitated' ? '↓' : ''].join('') : '';
      const cls = showFlags ? `${g.combust ? ' combust' : ''}${g.dignity === 'exalted' ? ' exalt' : ''}${g.dignity === 'debilitated' ? ' debil' : ''}` : '';
      return `<span class="rd-pl${cls}">${g.graha}${flags ? `<sup>${flags}</sup>` : ''}</span>`;
    }).join('');
    return `<div class="rd-cell${asc ? ' asc' : ''}" style="grid-row:${row + 1};grid-column:${col + 1}">
      <span class="rd-cellsign">${RASHIS[s]}</span>${house ? `<span class="rd-cellhouse">${house}</span>` : ''}
      ${asc ? '<span class="rd-ascmark">Lagna</span>' : ''}<div class="rd-cellpl">${planets}</div></div>`;
  }).join('');
  return `<div class="rd-chartwrap"><div class="rd-si">${cells}<div class="rd-sicenter">${title}<small>${subtitle}</small></div></div></div>`;
}

function planetTable(grahas, withHouse) {
  const rows = GRAHA_ORDER.map(ab => {
    const g = grahas.find(x => x.graha === ab);
    if (!g) return '';
    const deg = ('degInSign' in g) ? fmtDeg(g.degInSign) : '—';
    const house = withHouse && g.house ? ORD[g.house - 1] : '—';
    const flags = [];
    if (g.retro) flags.push('retrograde');
    if (g.combust) flags.push('combust');
    if (g.dignity) flags.push(DIGN_LABEL[g.dignity]);
    return `<tr><td>${GRAHA_FULL[ab]}</td><td>${RASHIS[g.sign]}</td><td class="num">${deg}</td>${withHouse ? `<td>${house}</td>` : ''}<td class="rd-flags">${flags.join(', ') || '—'}</td></tr>`;
  }).join('');
  return `<div class="rd-tablewrap"><table class="rd-table">
    <thead><tr><th>Graha</th><th>Rāśi</th><th>Degree</th>${withHouse ? '<th>House</th>' : ''}<th>Condition</th></tr></thead>
    <tbody>${rows}</tbody></table></div>`;
}

/* ---------- interpretation sections (all Jyotish tradition, labelled) ---------- */
function personalitySection(chart) {
  const lord = chart.lagna.lord;
  const lordG = chart.grahas.find(g => g.graha === lord);
  const nk = NAK[chart.moonNakshatra.index];
  return tradSection('Who you are', `
    <p>Your rising sign (Lagna) is <b>${RASHIS[chart.lagna.sign]}</b> — in the tradition this gives ${R.lagnaTraits[chart.lagna.sign]}</p>
    <p>Its ruler, <b>${GRAHA_FULL[lord]}</b>, sits in your <b>${ORD[lordG.house - 1]} house</b> — the house of ${R.house[lordG.house - 1]} — which is where the tradition sees your life-energy naturally flowing.</p>
    <p>Your Moon rests in <b>${nk.name}</b>${nk.traits ? `, a birth-star of ${nk.traits.toLowerCase()}` : ''}</p>`);
}

function careerSection(chart) {
  const tenthSign = (chart.lagna.sign + 9) % 12;
  const lord = chart.tenthLord, P = R.planet;
  const inTenth = chart.grahas.filter(g => g.house === 10 && g.graha !== 'Ra' && g.graha !== 'Ke');
  const d10lag = dasamsaSign(chart.lagna.lon);
  let body = `<p>Your 10th house — of career and public action — falls in <b>${RASHIS[tenthSign]}</b>, ruled by <b>${GRAHA_FULL[lord]}</b>. The tradition associates ${GRAHA_FULL[lord]} with work in <b>${P[lord].career}</b>.</p>`;
  if (inTenth.length) body += `<p>${inTenth.map(g => GRAHA_FULL[g.graha]).join(' and ')} ${inTenth.length > 1 ? 'occupy' : 'occupies'} your 10th house, drawing your work further toward ${inTenth.map(g => P[g.graha].keyword).join(' and ')}.</p>`;
  body += `<p>Your Amatyakaraka — the “career minister” of the Jaimini system — is <b>${GRAHA_FULL[chart.amatyakaraka]}</b>, pointing toward ${P[chart.amatyakaraka].career}.</p>`;
  body += `<p>In your Daśāṁśa (D10), the divisional chart of career, the ascendant falls in <b>${RASHIS[d10lag]}</b> (ruled by ${GRAHA_FULL[SIGN_LORD[d10lag]]}) — another thread in your professional signature.</p>
    <p class="rd-sub2">These are inclinations the tradition reads, offered to reflect on — not a prediction of any particular job.</p>`;
  return tradSection('Your work & career', body);
}

function dashaSection(ladder) {
  const row = p => `<div class="rd-dashrow"><span class="rd-dashlord">${p.lord}</span><span class="rd-dashwin">${mDate(p.start)} – ${mDate(p.end)}</span><span class="rd-dashtheme">${dashaTheme(p.lord)}</span></div>`;
  return factSection('The planetary period you’re living through', `
    <p class="rd-sub2">Vimshottari daśā — a 120-year cycle. Which lord is running is a fact of your Moon; the <em>theme</em> beside it is what the tradition associates with that lord. Without your exact minute the dates drift a little, so read them as close guides.</p>
    <div class="rd-dashwrap">
      <div class="rd-dashhdr"><span>Mahādaśā</span></div>${row(ladder.maha)}
      <div class="rd-dashhdr"><span>Antardaśā</span></div>${row(ladder.currentAntar)}
      <div class="rd-dashhdr"><span>Pratyantardaśā</span></div>${row(ladder.currentPraty)}
    </div>
    <p class="rd-dashnow">Right now you are running <b>${ladder.maha.lord} – ${ladder.currentAntar.lord} – ${ladder.currentPraty.lord}</b>.</p>`);
}

function gocharaSection(chart, trans) {
  const moonSign = chart.moonRashi, G = R.gochara;
  const T = ab => trans.find(t => t.graha === ab);
  const juH = houseFrom(T('Ju').sign, moonSign);
  const moH = houseFrom(T('Mo').sign, moonSign);
  const juText = G.jupiterGood.includes(juH) ? G.jupiterGoodText : G.jupiterHardText;
  const moText = G.chandraGood.includes(moH) ? G.chandraGoodText : G.chandraHardText;
  return tradSection('The sky right now — this week & the months ahead', `
    <p><b>Guru (Jupiter)</b> is transiting your <b>${ORD[juH - 1]} from the Moon</b> — now in ${RASHIS[T('Ju').sign]}. ${juText}</p>
    <p><b>This week the Moon</b> is passing through ${RASHIS[T('Mo').sign]} — ${moText}. The Moon shifts sign every couple of days, so this is the fast, everyday tide.</p>
    <p class="rd-sub2">${G.note}</p>`);
}

function doshaSection(chart, trans) {
  const moonSign = chart.moonRashi, S = R.sadeSati;
  const satH = houseFrom(trans.find(t => t.graha === 'Sa').sign, moonSign);
  const sadeText = satH === 12 ? S.rising : satH === 1 ? S.peak : satH === 2 ? S.setting : (satH === 4 || satH === 8) ? S.dhaiya : S.none;
  const mg = chart.doshas.mangal;
  let mgBody = R.mangal.intro + ' ';
  if (mg.present) {
    mgBody += `In your chart Mars falls in a Manglik position from ${mg.from.join(', ')}. ${R.mangal.calm}`;
    if (mg.cancels.length) mgBody += ` Softening factors are present: ${mg.cancels.join('; ')}.`;
  } else mgBody += 'In your chart, Mars does not fall in a Manglik house from the Lagna, Moon or Venus — so this dosha is not formed.';
  const ks = chart.doshas.kaalSarp;
  return tradSection('Yogas & doshas, read calmly', `
    <div class="rd-dosha"><h4>Śani &amp; Sade Sati</h4><p>${S.intro} ${sadeText}</p></div>
    <div class="rd-dosha"><h4>Maṅgala (Manglik) Dosha</h4><p>${mgBody}</p></div>
    <div class="rd-dosha"><h4>Kāla Sarpa</h4><p>${ks.present ? R.kaalSarp.intro : R.kaalSarp.absent}</p></div>`);
}

function luckySection(chart) {
  const lord = chart.lagna.lord, P = R.planet[lord];
  const chips = [['Colour', P.colour], ['Gemstone', P.gem], ['Metal', P.metal], ['Day', P.day], ['Number', P.number], ['Direction', P.direction]]
    .map(([k, v]) => `<div class="rd-luck"><span>${k}</span><b>${v}</b></div>`).join('');
  return tradSection('Your lucky signature', `
    <p>These follow your Lagna lord, <b>${GRAHA_FULL[lord]}</b> (${P.keyword}) — the traditional associations that are held to support you.</p>
    <div class="rd-luckgrid">${chips}</div>
    <p class="rd-dodont"><span class="rd-do">Do</span> ${P.do}. <span class="rd-dont">Take care</span> not to ${P.dont}.</p>`);
}

function remediesSection(chart, trans) {
  const set = new Map();
  const add = ab => { if (!set.has(ab) && R.planet[ab]) set.set(ab, R.planet[ab]); };
  add(chart.lagna.lord);
  chart.grahas.forEach(g => { if (g.dignity === 'debilitated' || g.combust) add(g.graha); });
  if (chart.doshas.mangal.present) add('Ma');
  const satH = houseFrom(trans.find(t => t.graha === 'Sa').sign, chart.moonRashi);
  if ([12, 1, 2, 4, 8].includes(satH)) add('Sa');
  const cards = [...set.entries()].slice(0, 4).map(([ab, p]) =>
    `<div class="rd-remedy"><h4>${GRAHA_FULL[ab]}</h4><p><b>Mantra:</b> ${p.mantra}</p><p>${p.remedy.charAt(0).toUpperCase() + p.remedy.slice(1)}.</p></div>`).join('');
  return tradSection('Traditional remedies', `
    <p>Offered as calm, optional heritage practices — never required, never a cure, and never a substitute for real-world care.</p>
    <div class="rd-remgrid">${cards}</div>`);
}

function vargaCharts(chart) {
  const d9 = southIndianChart(chart.grahas.map(g => ({ graha: g.graha, sign: g.navamsa })), navamsaSign(chart.lagna.lon), 'Navāṁśa · D9', 'soul, dharma & marriage', false);
  const d10 = southIndianChart(chart.grahas.map(g => ({ graha: g.graha, sign: g.dasamsa })), dasamsaSign(chart.lagna.lon), 'Daśāṁśa · D10', 'career & action', false);
  return factSection('Your divisional charts', `
    <p class="rd-sub2">The Navāṁśa (D9) and Daśāṁśa (D10) magnify marriage/dharma and career. Planets in these are robust; the D9/D10 <em>ascendant</em> is sensitive to your exact minute of birth.</p>
    <div class="rd-vargas">${d9}${d10}</div>`);
}

/* ---------- renderers ---------- */
function renderFull(chart, meta, ladder, trans) {
  const nk = NAK[chart.moonNakshatra.index];
  const header = `
    <p class="rd-birthline">${birthLine(meta)}</p>
    <div class="rd-facts">
      ${factCard('Lagna (Ascendant)', `<p class="rd-big">${RASHIS[chart.lagna.sign]} <span>${RASHIS_EN[chart.lagna.sign]}</span></p><p class="rd-sub">${fmtDeg(chart.lagna.degInSign)} rising · ruled by ${GRAHA_FULL[chart.lagna.lord]}</p>`)}
      ${factCard('Chandra (Moon)', `<p class="rd-big">${RASHIS[chart.moonRashi]} <span>${RASHIS_EN[chart.moonRashi]}</span></p><p class="rd-sub">${chart.moonNakshatra.name} nakshatra · pada ${chart.moonNakshatra.pada}</p>`)}
      ${factCard('Surya (Sun)', `<p class="rd-big">${RASHIS[chart.sunRashi]} <span>${RASHIS_EN[chart.sunRashi]}</span></p><p class="rd-sub">${panchangLine(chart)}</p>`)}
    </div>`;
  const notice = `<p class="rd-ayan">Sidereal zodiac · Lahiri ayanamsa ${fmtDeg(chart.ayanamsa)} · whole-sign houses · IST (UTC+5:30)</p>`;
  $('rd-result').innerHTML = header
    + southIndianChart(chart.grahas, chart.lagna.sign, 'Rāśi · D1', 'birth chart', true)
    + planetTable(chart.grahas, true) + notice
    + personalitySection(chart)
    + careerSection(chart)
    + dashaSection(ladder)
    + gocharaSection(chart, trans)
    + doshaSection(chart, trans)
    + luckySection(chart)
    + remediesSection(chart, trans)
    + vargaCharts(chart);
}

function renderNoTime(chart, meta, ladder) {
  const nk = NAK[chart.moonNakshatra.index];
  const P = R.planet;
  const grahas = chart.placements.map(p => ({ graha: p.graha, sign: p.rashi }));
  const dashRow = p => `<div class="rd-dashrow"><span class="rd-dashlord">${p.lord}</span><span class="rd-dashwin">${mDate(p.start)} – ${mDate(p.end)}</span><span class="rd-dashtheme">${dashaTheme(p.lord)}</span></div>`;
  $('rd-result').innerHTML = `
    <p class="rd-birthline">${birthLine(meta)}</p>
    <div class="rd-timewarn"><b>Without your birth time we can’t place your Ascendant, houses, career or divisional charts.</b>
      What’s below — your Moon, nakshatra, the day’s planetary signs and your daśā — is genuinely time-robust and shown honestly. Add your birth time above to unlock the full reading.</div>
    <div class="rd-facts">
      ${factCard('Chandra (Moon)', `<p class="rd-big">${RASHIS[chart.moonRashi]} <span>${RASHIS_EN[chart.moonRashi]}</span></p><p class="rd-sub">${chart.moonNakshatra.name} nakshatra · pada ${chart.moonNakshatra.pada}</p>`)}
      ${factCard('Surya (Sun)', `<p class="rd-big">${RASHIS[chart.sunRashi]} <span>${RASHIS_EN[chart.sunRashi]}</span></p><p class="rd-sub">${panchangLine(chart)}</p>`)}
    </div>
    ${southIndianChart(grahas, null, 'Rāśi · D1', 'signs only — no birth time', false)}
    ${planetTable(grahas, false)}
    <p class="rd-ayan">Sidereal · Lahiri ayanamsa ${fmtDeg(chart.ayanamsa)} · positions at local noon (time unknown)</p>
    ${tradSection('Who you are', `<p>Your Moon rests in <b>${nk.name}</b>${nk.traits ? `, a birth-star of ${nk.traits.toLowerCase()}` : ''}</p>`)}
    ${factSection('The planetary period you’re living through', `
      <p class="rd-sub2">Your daśā keys off the Moon, so it works without a birth time (dates to the year).</p>
      <div class="rd-dashwrap"><div class="rd-dashhdr"><span>Mahādaśā</span></div>${dashRow(ladder.maha)}<div class="rd-dashhdr"><span>Antardaśā</span></div>${dashRow(ladder.currentAntar)}</div>
      <p class="rd-dashnow">Running <b>${ladder.maha.lord} – ${ladder.currentAntar.lord}</b>.</p>`)}`;
}

/* ---------- wire up ---------- */
$('rd-form').addEventListener('submit', cast);
['rd-time', 'rd-date', 'rd-place'].forEach(id => $(id).addEventListener('input', schedulePreview));
$('rd-unknown').addEventListener('change', () => { $('rd-time').disabled = $('rd-unknown').checked; schedulePreview(); });
runPreview();
