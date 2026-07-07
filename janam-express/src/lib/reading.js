/* The /reading page — a factual Vedic birth chart + a full traditional reading,
   readable in the user's regional language. Astronomy (Lagna, houses, dashas,
   transits) is computed and labelled "Computed fact"; interpretation is documented
   Jyotish tradition, labelled as such. All display strings come from an active
   dictionary `t` (English source of truth in reading.en.json + a lazy-loaded
   per-language override deep-merged over it), so nothing here is a prediction,
   guarantee, or medical/financial claim. */
import citiesData from '../data/cities.json';
import en from '../data/reading.en.json';
import { fullChart, rashiChart, transits, navamsaSign, dasamsaSign, RASHIS_EN, SIGN_LORD } from './kundli.js';
import { dashaLadder } from './jyotish.js';

const CITIES = citiesData.cities;
const $ = id => document.getElementById(id);

/* ---------- i18n: active dictionary, lazy loader, deep-merge fallback ---------- */
const AUTHORED = ['en', 'hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml']; // languages with an override file
const NATIVE_NAME = { en: 'English', hi: 'हिन्दी', ta: 'தமிழ்', te: 'తెలుగు', bn: 'বাংলা', mr: 'मराठी', gu: 'ગુજરાતી', kn: 'ಕನ್ನಡ', ml: 'മലയാളം', or: 'ଓଡ଼ିଆ', pa: 'ਪੰਜਾਬੀ', as: 'অসমীয়া' };
const LS_KEY = 'janam-lang';
let t = en;          // active dictionary
let lang = 'en';
const dictCache = new Map([['en', en]]);
const isObj = v => v && typeof v === 'object' && !Array.isArray(v);
function deepMerge(base, over) {
  const out = Array.isArray(base) ? base.slice() : { ...base };
  for (const k in over) {
    if (isObj(base[k]) && isObj(over[k])) out[k] = deepMerge(base[k], over[k]);
    else if (over[k] !== undefined && over[k] !== null && over[k] !== '') out[k] = over[k];
  }
  return out;
}
async function loadLang(code) {
  if (code === 'en') return en;
  if (dictCache.has(code)) return dictCache.get(code);
  try {
    const mod = await import(`../data/reading.${code}.json`);
    const merged = deepMerge(en, mod.default);
    dictCache.set(code, merged);
    return merged;
  } catch { return null; } // missing/partial file — caller falls back to English
}
const format = (tpl, vars) => (tpl || '').replace(/\{(\w+)\}/g, (_, k) => (vars && k in vars && vars[k] != null) ? vars[k] : '');
const b = v => `<b>${v}</b>`;

/* ---------- small accessors off the active dict ---------- */
const rashi = s => t.names.rashi[s];
const rashiEn = s => (t.names.rashiEn && t.names.rashiEn[s]) || RASHIS_EN[s];
const graha = ab => t.names.graha[ab];
const dashaLord = full => (t.names.grahaDasha && t.names.grahaDasha[full]) || full;
const ord = h => t.ord[h - 1];
const GRAHA_ORDER = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra', 'Ke'];
const DASHA_ABBR = { Sun: 'Su', Moon: 'Mo', Mars: 'Ma', Mercury: 'Me', Jupiter: 'Ju', Venus: 'Ve', Saturn: 'Sa', Rahu: 'Ra', Ketu: 'Ke' };
const dashaTheme = full => (t.planet[DASHA_ABBR[full]] || {}).dashaTheme || '';
const pad = n => String(n).padStart(2, '0');
const fmtDeg = d => { const D = Math.floor(d), M = Math.floor((d - D) * 60); return `${D}°${pad(M)}′`; };
const mDate = dt => `${t.monShort[dt.getMonth()]} ${dt.getFullYear()}`;
const houseFrom = (sign, ref) => ((sign - ref + 12) % 12) + 1;
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const SI_CELL = [[0, 1], [0, 2], [0, 3], [1, 3], [2, 3], [3, 3], [3, 2], [3, 1], [3, 0], [2, 0], [1, 0], [0, 0]];

const findCity = q => {
  q = (q || '').trim().toLowerCase();
  if (!q) return null;
  return CITIES.find(c => `${c.name}, ${c.state}`.toLowerCase() === q)
    || CITIES.find(c => c.name.toLowerCase() === q)
    || CITIES.find(c => c.oldName && c.oldName.toLowerCase() === q)
    || CITIES.find(c => c.name.toLowerCase().startsWith(q)) || null;
};

/* ---------- language: English by default; an explicit choice is remembered ---------- */
function savedLang() {
  let s = null;
  try { s = localStorage.getItem(LS_KEY); } catch {}
  return (s && AUTHORED.includes(s)) ? s : 'en';
}

/* ---------- prefill (a full link with time auto-casts the chart) ---------- */
const params = new URLSearchParams(location.search);
if (params.get('d')) $('rd-date').value = params.get('d');
if (params.get('c')) $('rd-place').value = params.get('c');
if (params.get('n') && params.get('n') !== 'Traveller') $('rd-name').value = params.get('n');
const tParam = params.get('t');
if (tParam === 'na') { $('rd-unknown').checked = true; $('rd-time').disabled = true; }
else if (tParam && /^\d{2}:\d{2}$/.test(tParam)) $('rd-time').value = tParam;
$('rd-citylist').innerHTML = CITIES.map(c => `<option value="${c.name}, ${c.state}"></option>`).join('');
// language dropdown = authored languages, shown in their own script
$('rd-lang').innerHTML = AUTHORED.map(code => `<option value="${code}">${NATIVE_NAME[code] || code}</option>`).join('');

/* ---------- UI-string hydration (server-rendered Astro strings -> active dict) ---------- */
function applyUi() {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t.ui[key] != null) {
      if (el.hasAttribute('data-i18n-attr')) el.setAttribute(el.getAttribute('data-i18n-attr'), t.ui[key]);
      else el.textContent = t.ui[key];
    }
  });
  $('rd-lang').value = lang;
}

/* ---------- live Ascendant preview ---------- */
let previewTimer = null;
const schedulePreview = () => { clearTimeout(previewTimer); previewTimer = setTimeout(runPreview, 250); };
async function runPreview() {
  const el = $('rd-livelagna');
  const city = findCity($('rd-place').value);
  const dv = $('rd-date').value, tv = $('rd-time').value;
  if ($('rd-unknown').checked) { el.innerHTML = `<span class="rd-dim">${t.ui.previewUnknown}</span>`; return; }
  if (!city || !dv || !tv) { el.innerHTML = `<span class="rd-dim">${t.ui.previewEnter}</span>`; return; }
  const [y, m, d] = dv.split('-').map(Number);
  const [hh, mm] = tv.split(':').map(Number);
  try {
    const c = await fullChart(y, m, d, hh, mm, city.lat, city.lon);
    el.innerHTML = format(t.tpl.previewAsc, { rashi: b(rashi(c.lagna.sign)), rashiEn: rashiEn(c.lagna.sign), deg: fmtDeg(c.lagna.degInSign) });
  } catch { el.innerHTML = '<span class="rd-dim">—</span>'; }
}

/* ---------- cast ---------- */
let last = null; // {kind, chart, meta, ladder, trans} — cached so a language switch re-renders without recomputing
async function cast(e) {
  if (e) e.preventDefault();
  const city = findCity($('rd-place').value);
  const dv = $('rd-date').value;
  const timeUnknown = $('rd-unknown').checked;
  const tv = $('rd-time').value;
  const out = $('rd-result');

  if (!dv) return flash(t.ui.errDate);
  if (!city) return flash(t.ui.errPlace);
  const [y, m, d] = dv.split('-').map(Number);
  if (y < 1950 || y > 2010) return flash(t.ui.errRange);
  if (!timeUnknown && !tv) return flash(t.ui.errTime);

  out.innerHTML = `<p class="rd-casting">${t.ui.casting}</p>`;
  out.hidden = false;
  try {
    if (timeUnknown) {
      const chart = await rashiChart(y, m, d);
      const ladder = dashaLadder(chart.moonNakshatra, new Date(y, m - 1, d), new Date());
      last = { kind: 'notime', chart, meta: { y, m, d, city }, ladder };
    } else {
      const [hh, mm] = tv.split(':').map(Number);
      const chart = await fullChart(y, m, d, hh, mm, city.lat, city.lon);
      const ladder = dashaLadder(chart.moonNakshatra, new Date(y, m - 1, d), new Date());
      const trans = await transits(new Date());
      last = { kind: 'full', chart, meta: { y, m, d, hh, mm, city }, ladder, trans };
    }
    // shareable permalink that reproduces this exact chart (date + place + time)
    const nm = $('rd-name').value.trim();
    history.replaceState(null, '', `?d=${dv}&c=${encodeURIComponent(city.name)}${nm ? `&n=${encodeURIComponent(nm)}` : ''}&t=${timeUnknown ? 'na' : tv}`);
    renderLast();
    out.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (err) {
    out.innerHTML = `<p class="rd-casting">${t.ui.errSnag}</p>`;
  }
}
function flash(msg) { const f = $('rd-formmsg'); f.textContent = msg; f.hidden = false; setTimeout(() => { f.hidden = true; }, 5000); }
function renderLast() {
  if (!last) return;
  if (last.kind === 'full') renderFull(last.chart, last.meta, last.ladder, last.trans);
  else renderNoTime(last.chart, last.meta, last.ladder);
}

/* ---------- section builders ---------- */
const factSection = (title, body) => `<section class="rd-sec"><div class="rd-sechead"><span class="rd-badge fact">${t.ui.badgeFact}</span><h2>${title}</h2></div>${body}</section>`;
const tradSection = (title, body) => `<section class="rd-sec"><div class="rd-sechead"><span class="rd-badge trad">${t.ui.badgeTrad}</span><h2>${title}</h2></div>${body}</section>`;
const factCard = (title, body) => `<div class="rd-fact"><span class="rd-badge fact">${t.ui.badgeFact}</span><h3>${title}</h3>${body}</div>`;

function panchangLine(chart) {
  return format(t.tpl.panchang, {
    paksha: chart.tithiNum < 15 ? t.paksha.shukla : t.paksha.krishna,
    tithi: t.tithi[chart.tithiNum % 15] || '', yoga: chart.yogaIndex + 1, karana: chart.karanaName,
  });
}
function birthLine(meta) {
  const timed = 'hh' in meta;
  return format(timed ? t.tpl.birthLineTime : t.tpl.birthLineNoTime,
    { day: meta.d, month: t.months[meta.m - 1], year: meta.y, time: timed ? `${pad(meta.hh)}:${pad(meta.mm)}` : '', city: meta.city.name, state: meta.city.state });
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
      return `<span class="rd-pl${cls}">${graha(g.graha)}${flags ? `<sup>${flags}</sup>` : ''}</span>`;
    }).join('');
    return `<div class="rd-cell${asc ? ' asc' : ''}" style="grid-row:${row + 1};grid-column:${col + 1}">
      <span class="rd-cellsign">${rashi(s)}</span>${house ? `<span class="rd-cellhouse">${house}</span>` : ''}
      ${asc ? `<span class="rd-ascmark">${t.ui.lagnaMark}</span>` : ''}<div class="rd-cellpl">${planets}</div></div>`;
  }).join('');
  return `<div class="rd-chartwrap"><div class="rd-si">${cells}<div class="rd-sicenter">${title}<small>${subtitle}</small></div></div></div>`;
}

function planetTable(grahas, withHouse) {
  const rows = GRAHA_ORDER.map(ab => {
    const g = grahas.find(x => x.graha === ab);
    if (!g) return '';
    const deg = ('degInSign' in g) ? fmtDeg(g.degInSign) : '—';
    const house = withHouse && g.house ? ord(g.house) : '—';
    const flags = [];
    if (g.retro) flags.push(t.ui.condRetro);
    if (g.combust) flags.push(t.ui.condCombust);
    if (g.dignity) flags.push(t.dignity[g.dignity]);
    return `<tr><td>${graha(ab)}</td><td>${rashi(g.sign)}</td><td class="num">${deg}</td>${withHouse ? `<td>${house}</td>` : ''}<td class="rd-flags">${flags.join(', ') || '—'}</td></tr>`;
  }).join('');
  return `<div class="rd-tablewrap"><table class="rd-table">
    <thead><tr><th>${t.ui.thGraha}</th><th>${t.ui.thRashi}</th><th>${t.ui.thDegree}</th>${withHouse ? `<th>${t.ui.thHouse}</th>` : ''}<th>${t.ui.thCondition}</th></tr></thead>
    <tbody>${rows}</tbody></table></div>`;
}

function personalitySection(chart) {
  const lord = chart.lagna.lord;
  const lordG = chart.grahas.find(g => g.graha === lord);
  return tradSection(t.ui.secPersonality, `
    <p>${format(t.tpl.persLagna, { rashi: b(rashi(chart.lagna.sign)), trait: t.lagnaTraits[chart.lagna.sign] })}</p>
    <p>${format(t.tpl.persLord, { graha: b(graha(lord)), ord: ord(lordG.house), houseSig: t.house[lordG.house - 1] })}</p>
    <p>${format(t.tpl.persMoonPlain, { nakshatra: b(chart.moonNakshatra.name) })}</p>`);
}

function careerSection(chart) {
  const tenthSign = (chart.lagna.sign + 9) % 12;
  const lord = chart.tenthLord, P = t.planet;
  const inTenth = chart.grahas.filter(g => g.house === 10 && g.graha !== 'Ra' && g.graha !== 'Ke');
  const d10lag = dasamsaSign(chart.lagna.lon);
  let body = `<p>${format(t.tpl.career10th, { rashi: b(rashi(tenthSign)), graha: b(graha(lord)), career: P[lord].career })}</p>`;
  if (inTenth.length) body += `<p>${format(t.tpl.careerInTenth, { planets: inTenth.map(g => graha(g.graha)).join(' & '), keywords: inTenth.map(g => P[g.graha].keyword).join(', ') })}</p>`;
  body += `<p>${format(t.tpl.careerAmk, { graha: b(graha(chart.amatyakaraka)), career: P[chart.amatyakaraka].career })}</p>`;
  body += `<p>${format(t.tpl.careerD10, { rashi: b(rashi(d10lag)), graha: graha(SIGN_LORD[d10lag]) })}</p><p class="rd-sub2">${t.ui.careerCaveat}</p>`;
  return tradSection(t.ui.secCareer, body);
}

function dashaSection(ladder) {
  const row = p => `<div class="rd-dashrow"><span class="rd-dashlord">${dashaLord(p.lord)}</span><span class="rd-dashwin">${mDate(p.start)} – ${mDate(p.end)}</span><span class="rd-dashtheme">${dashaTheme(p.lord)}</span></div>`;
  const lords = [ladder.maha, ladder.currentAntar, ladder.currentPraty].map(p => dashaLord(p.lord)).join(' – ');
  return factSection(t.ui.secDasha, `
    <p class="rd-sub2">${t.ui.dashaIntro}</p>
    <div class="rd-dashwrap">
      <div class="rd-dashhdr"><span>${t.ui.dashaMaha}</span></div>${row(ladder.maha)}
      <div class="rd-dashhdr"><span>${t.ui.dashaAntar}</span></div>${row(ladder.currentAntar)}
      <div class="rd-dashhdr"><span>${t.ui.dashaPraty}</span></div>${row(ladder.currentPraty)}
    </div>
    <p class="rd-dashnow">${format(t.tpl.dashaNow, { lords: b(lords) })}</p>`);
}

function gocharaSection(chart, trans) {
  const moonSign = chart.moonRashi, G = t.gochara;
  const T = ab => trans.find(x => x.graha === ab);
  const juH = houseFrom(T('Ju').sign, moonSign);
  const moH = houseFrom(T('Mo').sign, moonSign);
  return tradSection(t.ui.secGochara, `
    <p>${format(t.tpl.gocharaJupiter, { ord: ord(juH), rashi: b(rashi(T('Ju').sign)), text: G.jupiterGood.includes(juH) ? G.jupiterGoodText : G.jupiterHardText })}</p>
    <p>${format(t.tpl.gocharaMoon, { rashi: b(rashi(T('Mo').sign)), text: G.chandraGood.includes(moH) ? G.chandraGoodText : G.chandraHardText })}</p>
    <p class="rd-sub2">${G.note}</p>`);
}

function doshaSection(chart, trans) {
  const moonSign = chart.moonRashi, S = t.sadeSati;
  const satH = houseFrom(trans.find(x => x.graha === 'Sa').sign, moonSign);
  const sadeText = satH === 12 ? S.rising : satH === 1 ? S.peak : satH === 2 ? S.setting : (satH === 4 || satH === 8) ? S.dhaiya : S.none;
  const mg = chart.doshas.mangal;
  let mgBody = t.mangal.intro + ' ';
  if (mg.present) {
    const refs = mg.fromRefs.map(f => format(t.tpl.mangalRefItem, { ref: t.mangalRef[f.ref], ord: ord(f.house) })).join(', ');
    mgBody += format(t.tpl.mangalPresent, { refs, calm: t.mangal.calm });
    if (mg.cancelKeys.length) mgBody += format(t.tpl.mangalCancels, { cancels: mg.cancelKeys.map(k => t.mangalCancel[k]).join('; ') });
  } else mgBody += t.ui.mangalAbsent;
  const ks = chart.doshas.kaalSarp;
  return tradSection(t.ui.secDoshas, `
    <div class="rd-dosha"><h4>${t.ui.doshaSani}</h4><p>${S.intro} ${sadeText}</p></div>
    <div class="rd-dosha"><h4>${t.ui.doshaMangal}</h4><p>${mgBody}</p></div>
    <div class="rd-dosha"><h4>${t.ui.doshaKaal}</h4><p>${ks.present ? t.kaalSarp.intro : t.kaalSarp.absent}</p></div>`);
}

function luckySection(chart) {
  const lord = chart.lagna.lord, P = t.planet[lord];
  const chips = [[t.ui.luckColour, P.colour], [t.ui.luckGem, P.gem], [t.ui.luckMetal, P.metal], [t.ui.luckDay, P.day], [t.ui.luckNumber, P.number], [t.ui.luckDirection, P.direction]]
    .map(([k, v]) => `<div class="rd-luck"><span>${k}</span><b>${v}</b></div>`).join('');
  return tradSection(t.ui.secLucky, `
    <p>${format(t.tpl.lucky, { graha: b(graha(lord)), keyword: P.keyword })}</p>
    <div class="rd-luckgrid">${chips}</div>
    <p class="rd-dodont"><span class="rd-do">${t.ui.doLabel}</span> ${P.do}. <span class="rd-dont">${t.ui.dontLabel}</span> ${P.dont}.</p>`);
}

function remediesSection(chart, trans) {
  const set = new Map();
  const add = ab => { if (!set.has(ab) && t.planet[ab]) set.set(ab, t.planet[ab]); };
  add(chart.lagna.lord);
  chart.grahas.forEach(g => { if (g.dignity === 'debilitated' || g.combust) add(g.graha); });
  if (chart.doshas.mangal.present) add('Ma');
  const satH = houseFrom(trans.find(x => x.graha === 'Sa').sign, chart.moonRashi);
  if ([12, 1, 2, 4, 8].includes(satH)) add('Sa');
  const cards = [...set.entries()].slice(0, 4).map(([ab, p]) =>
    `<div class="rd-remedy"><h4>${graha(ab)}</h4><p><b>${t.ui.remMantra}</b> ${p.mantra}</p><p>${cap(p.remedy)}.</p></div>`).join('');
  return tradSection(t.ui.secRemedies, `<p>${t.ui.remediesIntro}</p><div class="rd-remgrid">${cards}</div>`);
}

function shareRow() {
  return `<div class="rd-sharerow">
    <p>${t.ui.shareLead}</p>
    <div class="rd-sharebtns">
      <button type="button" class="rd-sharecopy">${t.ui.shareCopy}</button>
      <a class="rd-sharewa" href="https://api.whatsapp.com/send?text=${encodeURIComponent(location.href)}" target="_blank" rel="noopener">${t.ui.shareWa}</a>
    </div></div>`;
}

function vargaCharts(chart) {
  const d9 = southIndianChart(chart.grahas.map(g => ({ graha: g.graha, sign: g.navamsa })), navamsaSign(chart.lagna.lon), t.ui.d9Title, t.ui.d9Sub, false);
  const d10 = southIndianChart(chart.grahas.map(g => ({ graha: g.graha, sign: g.dasamsa })), dasamsaSign(chart.lagna.lon), t.ui.d10Title, t.ui.d10Sub, false);
  return factSection(t.ui.secVargas, `<p class="rd-sub2">${t.ui.vargasIntro}</p><div class="rd-vargas">${d9}${d10}</div>`);
}

/* ---------- renderers ---------- */
function renderFull(chart, meta, ladder, trans) {
  const header = `
    <p class="rd-birthline">${birthLine(meta)}</p>
    <div class="rd-facts">
      ${factCard(t.ui.cardLagna, `<p class="rd-big">${rashi(chart.lagna.sign)} <span>${rashiEn(chart.lagna.sign)}</span></p><p class="rd-sub">${format(t.tpl.cardLagnaSub, { deg: fmtDeg(chart.lagna.degInSign), graha: graha(chart.lagna.lord) })}</p>`)}
      ${factCard(t.ui.cardMoon, `<p class="rd-big">${rashi(chart.moonRashi)} <span>${rashiEn(chart.moonRashi)}</span></p><p class="rd-sub">${format(t.tpl.cardMoonSub, { nakshatra: chart.moonNakshatra.name, pada: chart.moonNakshatra.pada })}</p>`)}
      ${factCard(t.ui.cardSun, `<p class="rd-big">${rashi(chart.sunRashi)} <span>${rashiEn(chart.sunRashi)}</span></p><p class="rd-sub">${panchangLine(chart)}</p>`)}
    </div>`;
  const notice = `<p class="rd-ayan">${format(t.tpl.ayan, { deg: fmtDeg(chart.ayanamsa) })}</p>`;
  $('rd-result').innerHTML = header
    + southIndianChart(chart.grahas, chart.lagna.sign, t.ui.d1Title, t.ui.d1Sub, true)
    + planetTable(chart.grahas, true) + notice
    + personalitySection(chart) + careerSection(chart) + dashaSection(ladder)
    + gocharaSection(chart, trans) + doshaSection(chart, trans)
    + luckySection(chart) + remediesSection(chart, trans) + vargaCharts(chart) + shareRow();
}

function renderNoTime(chart, meta, ladder) {
  const grahas = chart.placements.map(p => ({ graha: p.graha, sign: p.rashi }));
  const dashRow = p => `<div class="rd-dashrow"><span class="rd-dashlord">${dashaLord(p.lord)}</span><span class="rd-dashwin">${mDate(p.start)} – ${mDate(p.end)}</span><span class="rd-dashtheme">${dashaTheme(p.lord)}</span></div>`;
  $('rd-result').innerHTML = `
    <p class="rd-birthline">${birthLine(meta)}</p>
    <div class="rd-timewarn">${t.ui.timewarn}</div>
    <div class="rd-facts">
      ${factCard(t.ui.cardMoon, `<p class="rd-big">${rashi(chart.moonRashi)} <span>${rashiEn(chart.moonRashi)}</span></p><p class="rd-sub">${format(t.tpl.cardMoonSub, { nakshatra: chart.moonNakshatra.name, pada: chart.moonNakshatra.pada })}</p>`)}
      ${factCard(t.ui.cardSun, `<p class="rd-big">${rashi(chart.sunRashi)} <span>${rashiEn(chart.sunRashi)}</span></p><p class="rd-sub">${panchangLine(chart)}</p>`)}
    </div>
    ${southIndianChart(grahas, null, t.ui.d1Title, t.ui.d1SubNoTime, false)}
    ${planetTable(grahas, false)}
    <p class="rd-ayan">${format(t.tpl.ayanNoTime, { deg: fmtDeg(chart.ayanamsa) })}</p>
    ${tradSection(t.ui.secPersonality, `<p>${format(t.tpl.persMoonPlain, { nakshatra: b(chart.moonNakshatra.name) })}</p>`)}
    ${factSection(t.ui.secDasha, `
      <p class="rd-sub2">${t.ui.dashaIntroNoTime}</p>
      <div class="rd-dashwrap"><div class="rd-dashhdr"><span>${t.ui.dashaMaha}</span></div>${dashRow(ladder.maha)}<div class="rd-dashhdr"><span>${t.ui.dashaAntar}</span></div>${dashRow(ladder.currentAntar)}</div>
      <p class="rd-dashnow">${format(t.tpl.dashaNowNoTime, { lords: b([ladder.maha, ladder.currentAntar].map(p => dashaLord(p.lord)).join(' – ')) })}</p>`)}
    ${shareRow()}`;
}

/* ---------- language switch + wire up ---------- */
async function switchLang(code) {
  if (!AUTHORED.includes(code)) code = 'en';
  const dict = await loadLang(code);
  t = dict || en; lang = dict ? code : 'en';
  try { localStorage.setItem(LS_KEY, lang); } catch {}
  applyUi();
  runPreview();
  renderLast(); // re-render the already-cast chart in the new language, no recompute
}

$('rd-form').addEventListener('submit', cast);
$('rd-lang').addEventListener('change', e => switchLang(e.target.value));
['rd-time', 'rd-date', 'rd-place'].forEach(id => $(id).addEventListener('input', schedulePreview));
$('rd-unknown').addEventListener('change', () => { $('rd-time').disabled = $('rd-unknown').checked; schedulePreview(); });
// copy-link / WhatsApp in the result (delegated — the result re-renders on language switch)
$('rd-result').addEventListener('click', async e => {
  const btn = e.target.closest('.rd-sharecopy');
  if (!btn) return;
  try { await navigator.clipboard.writeText(location.href); } catch {}
  btn.textContent = t.ui.shareCopied;
  setTimeout(() => { btn.textContent = t.ui.shareCopy; }, 2500);
});
// English by default; restore an explicit earlier choice if one was saved
(async () => {
  const saved = savedLang();
  if (saved !== 'en') { const dict = await loadLang(saved); if (dict) { t = dict; lang = saved; } }
  applyUi();
  runPreview();
  // a complete shared link (date + place + time) casts itself
  if (params.get('d') && params.get('c') && tParam) cast();
})();
