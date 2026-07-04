import {
  CITIES, FIRSTS, econ, filmOf, songOf, cricketOf, milestoneOf,
  pmOn, presidentOn, population, findCity, tvEra, fmtIN, MONTHS,
  greetingOf, regionalCinemaOf, stateStoryOf, hinduYears, inflate,
  stateSymbolsOf, stateCultureOf, regionalEra, knownForOf, sportOf,
} from './lookup.js';
import panchang from '../data/panchang.json';
import { skyOn, panchangOn } from './astronomy.js';
import { weatherOn, historyOn, historyIndia, famousBirthdays, famousBirthdaysGlobal, postersOf } from './api.js';
import { rashiChart, RASHIS, GRAHA_NAMES } from './kundli.js';
import nakInfo from '../data/nakshatras.json';
import rashiInfo from '../data/rashis.json';
import grahaGoverns from '../data/grahas.json';
import { mahadasha, numerology, weekdayOf } from './jyotish.js';
import { buildCaption, shareTicket, downloadTicket } from './share.js';

const GRAHA_EMOJI = { Sun: '☀️', Moon: '🌙', Mars: '♂', Mercury: '☿', Jupiter: '♃', Venus: '♀', Saturn: '♄', Rahu: '☊', Ketu: '☋' };

const LORD_ABBR = { Sun: 'Su', Moon: 'Mo', Mars: 'Ma', Mercury: 'Me', Jupiter: 'Ju', Venus: 'Ve', Saturn: 'Sa', Rahu: 'Ra', Ketu: 'Ke' };
const GANA_GLOSS = { Deva: 'divine, gentle nature', Manushya: 'human, balanced nature', Rakshasa: 'fierce, intense nature' };
const lowerFirst = s => s ? s[0].toLowerCase() + s.slice(1) : s;
const ordinal = n => ['first', 'second', 'third', 'fourth'][n - 1] || `${n}th`;
const cleanDeity = d => (d || '').split(/[/(]/)[0].trim(); // "Brahma / Prajapati (creator)" -> "Brahma"
const SYM_EMOJI = { animal: '🐾', bird: '🦜', flower: '🌸', tree: '🌳' };

const $ = id => document.getElementById(id);
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const YEAR_MIN = 1950, YEAR_MAX = 2010;
let J = null; // current journey
let RENDER = 0; // token: async beats ignore results from a superseded journey
let famousScope = 'india', historyScope = 'india'; // India / World toggles (persist across journeys)

// build-time map of birth-era → optimized banknote image URL
let NOTE_MAP = {};
try { NOTE_MAP = JSON.parse(document.getElementById('notemap').textContent || '{}'); } catch { /* fallback CSS note */ }

/* ---------- form setup ---------- */
const dd = $('dd'), mm = $('mm'), yy = $('yy'), cityInput = $('city');
for (let i = 1; i <= 31; i++) dd.add(new Option(String(i).padStart(2, '0'), i));
MONTHS.forEach((m, i) => mm.add(new Option(m, i + 1)));
for (let y = YEAR_MAX; y >= YEAR_MIN; y--) yy.add(new Option(y, y));
dd.value = 15; mm.value = 6; yy.value = 1990;
const datalist = $('citylist');
for (const c of CITIES) datalist.append(new Option(`${c.name}, ${c.state}`));

$('slipform').addEventListener('submit', e => {
  e.preventDefault();
  const city = findCity(cityInput.value);
  if (!city) {
    $('cityhint').textContent = 'Station not found — pick a city from the list';
    $('cityhint').style.color = 'var(--stamp)';
    cityInput.focus();
    return;
  }
  const y = +yy.value, m = +mm.value;
  const d = Math.min(+dd.value, new Date(y, m, 0).getDate());
  startJourney(y, m, d, city, $('pname').value.trim() || 'Traveller');
});

/* permalink: ?d=1990-06-15&c=Mumbai&n=Asha */
const params = new URLSearchParams(location.search);
if (params.get('d')) {
  const [py, pm, pd] = params.get('d').split('-').map(Number);
  const pcity = findCity(params.get('c') || '');
  if (py >= YEAR_MIN && py <= YEAR_MAX && pm >= 1 && pm <= 12 && pd >= 1 && pd <= 31 && pcity) {
    yy.value = py; mm.value = pm; dd.value = pd;
    cityInput.value = `${pcity.name}, ${pcity.state}`;
    if (params.get('n')) $('pname').value = params.get('n');
    startJourney(py, pm, pd, pcity, params.get('n') || 'Traveller');
  }
}

function startJourney(y, m, d, city, name) {
  J = { y, m, d, city, name };
  J.iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  history.replaceState(null, '', `?d=${J.iso}&c=${encodeURIComponent(city.name)}${name !== 'Traveller' ? `&n=${encodeURIComponent(name)}` : ''}`);
  render();
  depart(y);
}

/* ---------- departure board ---------- */
function depart(year) {
  if (reduceMotion) { arrive(); return; }
  const board = $('board'), flap = $('flapyear');
  board.classList.add('show');
  let cur = 0;
  const start = performance.now(), dur = 2100;
  function tick(now) {
    const f = Math.min(1, (now - start) / dur);
    const eased = 1 - Math.pow(1 - f, 3);
    const showY = Math.round(2026 - (2026 - year) * eased);
    if (showY !== cur) {
      cur = showY;
      flap.innerHTML = String(showY).split('').map(ch => `<span>${ch}</span>`).join('');
    }
    $('boardline').textContent = f < 1
      ? `DEPARTING · PLATFORM 9 · DESTINATION ${year}`
      : `ARRIVED · ${year} · MIND THE GAP IN TIME`;
    if (f < 1) requestAnimationFrame(tick); else setTimeout(arrive, 650);
  }
  requestAnimationFrame(tick);
}
function arrive() {
  $('board').classList.remove('show');
  $('journey').style.display = 'block';
  $('arrival').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
}

/* ---------- render ---------- */
function render() {
  const { y, m, d, city, name, iso } = J;
  const mine = ++RENDER; // this journey's token
  const fresh = () => mine === RENDER; // false once a newer journey starts
  const dob = new Date(y, m - 1, d);
  const weekday = dob.toLocaleDateString('en-IN', { weekday: 'long' });
  const wasOldName = !!(city.oldName && iso < (city.renamedOn || '9999'));
  const bornCity = wasOldName ? city.oldName : city.name;
  const sky = skyOn(y, m, d, city.lat, city.lon);
  const e = econ(y);
  J.mult = e.mult;
  // shared sky computation — used by the stars, astrology and kundli beats
  const chartP = rashiChart(y, m, d);
  const panchP = panchangOn(y, m, d, city.lat, city.lon);

  /* beat 1 · telegram */
  const greet = greetingOf(city.state);
  const stop = '<span class="stopword"> STOP </span>';
  const cityHtml = wasOldName
    ? `<span class="oldname"><span class="dead">${city.name.toUpperCase()}</span> <span class="stamped">${city.oldName.toUpperCase()}</span></span>`
    : city.name.toUpperCase();
  const greetHtml = greet && greet.code !== 'en'
    ? `${greet.greetingNative} · ${greet.greetingLatin.toUpperCase()}${stop}` : '';
  $('tgtext').innerHTML =
    `${greetHtml}ARRIVED SAFELY ${cityHtml}${stop}${weekday.toUpperCase()} THE ${d} OF ${MONTHS[m - 1].toUpperCase()} ${y}${stop}` +
    `SUN ROSE ${sky.sunrise} IST${stop}${sky.moonName.toUpperCase()} OVERHEAD, ${sky.moonIllum} PC LIT${stop}` +
    `<span id="tgweather"></span>BABY DOING FINE${stop}`;
  $('tgnote').textContent = wasOldName
    ? `Yes, really — your birth certificate says ${city.oldName.toUpperCase()}. The city officially became ${city.name} only on ${new Date(city.renamedOn).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}. You were born in a city whose name no longer exists.`
    : `Only one day in seven of ${y} was a ${weekday}. This one was yours.`;

  /* beat 2 · weather that day (Open-Meteo ERA5, live) */
  $('wxsky').textContent = '⏳';
  $('wxhi').textContent = $('wxlo').textContent = $('wxrain').textContent = '—';
  $('wxline').textContent = 'Reading the skies over your birthplace…';
  weatherOn(city.lat, city.lon, iso).then(w => {
    if (!fresh()) return;
    if (!w) {
      $('wxsky').textContent = '🌤️';
      $('wxline').textContent = `The weather record for ${bornCity} that day is just out of reach right now — but the sun rose all the same.`;
      return;
    }
    const hi = Math.round(w.tmax), lo = Math.round(w.tmin), rain = Math.round(w.rain);
    $('wxhi').textContent = hi + '°'; $('wxlo').textContent = lo + '°'; $('wxrain').textContent = rain + ' mm';
    let sky = '☀️';
    if (rain >= 15) sky = '🌧️'; else if (rain >= 2) sky = '🌦️';
    else if (hi >= 38) sky = '🔥'; else if (hi <= 16) sky = '🌫️'; else if (hi >= 30) sky = '🌤️';
    const rainTxt = rain >= 15 ? `a proper downpour — ${rain} mm fell` : rain >= 2 ? `${rain} mm of rain drifted through` : 'not a drop of rain';
    const heat = hi >= 38 ? 'a scorcher' : hi >= 32 ? 'warm' : hi >= 24 ? 'pleasant' : hi >= 16 ? 'cool' : 'cold';
    $('wxsky').textContent = sky;
    $('wxline').innerHTML = `It was ${heat} in ${bornCity} — <b>${hi}°C</b> by afternoon, down to ${lo}°C overnight, and ${rainTxt}.`;
  });

  /* beat 2 · rupee — real era banknote behind the count-up */
  const noteEra = y <= 1966 ? '1950' : y <= 1995 ? '1967' : '1996';
  const noteCard = $('notecard'), noteArt = $('noteart');
  const noteSrc = NOTE_MAP[noteEra];
  if (noteSrc) {
    noteArt.onerror = () => noteCard.classList.remove('has-art');
    noteArt.src = noteSrc;
    noteCard.classList.add('has-art');
  } else {
    noteArt.removeAttribute('src');
    noteCard.classList.remove('has-art');
  }

  const valToday = 100 * e.mult;
  $('cpival').dataset.target = Math.round(valToday);
  $('cpival').textContent = '₹100';
  $('cpisub').textContent = "of today's money — hold on…";
  $('cpiline').innerHTML =
    `Prices in India have risen roughly <b>${e.mult < 10 ? e.mult.toFixed(1) : Math.round(e.mult)}×</b> in your lifetime. ` +
    `The ₹100 note in your parents' pocket that day did the work of <b>₹${fmtIN(valToday)}</b> today.`;
  const chips = [
    ['Petrol', `₹${e.petrol.toFixed(2)}/litre`, false],
    ['Gold', `₹${fmtIN(e.gold)}/10g`, false],
    ['Govt starting salary', `₹${fmtIN(e.salary)}/month`, false],
    ['One US dollar', `₹${e.usd.toFixed(2)}`, false],
  ];
  if (e.chai) chips.splice(2, 0, ['Chai', `~₹${e.chai.toFixed(2)} a cup`, true]);
  if (e.cinema) chips.splice(3, 0, ['Cinema', `~₹${e.cinema.toFixed(0)} a ticket`, true]);
  for (const x of e.extras) chips.push([x.item, x.price + ` (${x.year})`, !!x.hedged]);
  $('pricechips').innerHTML = chips
    .map(([k, v, hedged]) => `<span class="chip${hedged ? ' hedged' : ''}">${k} <b>${v}</b></span>`)
    .join('');

  /* beat 3 · CRT */
  const film = filmOf(y), song = songOf(y);
  const regional = regionalCinemaOf(city.state, y);
  J.channels = [
    ['CH 1 · DD NATIONAL · FILM OF YOUR YEAR',
      film ? film.film : 'A golden year for the movies',
      film
        ? (film.note || 'All of India was queuing outside single-screen cinemas for this one.') +
          (e.cinema ? ` A stalls ticket cost about ₹${e.cinema.toFixed(0)}.` : '')
        : "Every Friday, your town's single-screen cinema repainted its hand-lettered hoardings.",
      true],
    ['CH 2 · VIVIDH BHARATI · SONG OF YOUR YEAR',
      song ? song.song : 'The Binaca Geetmala countdown',
      song
        ? `${song.film ? 'From ' + song.film + '. ' : ''}${song.source || ''} Playing from every radio, every paan shop, every wedding loudspeaker in ${y}.`
        : "Every Wednesday at 8 PM, Ameen Sayani counted down the year's biggest songs to a listening nation.",
      false,
      song ? `${song.song} ${song.film || ''} song`.trim() : null],
    ['CH 3 · YOUR TELEVISION ERA', y < 1959 ? 'Before television' : 'What India watched', tvEra(y), false],
  ];
  if (regional) {
    const ch = regional.kind === 'film'
      ? [`CH 2 · ${regional.industry.toUpperCase()} CINEMA · YOUR STATE'S SCREEN`,
         regional.film + (regional.year !== y ? ` (${regional.year})` : ''),
         (regional.note || `The talk of every ${regional.industry} household.`) +
         ` In ${city.state}, the single screens belonged to ${regional.nickname} as much as Bollywood.`, false]
      : [`CH 2 · ${regional.language.toUpperCase()} CINEMA · YOUR STATE'S SCREEN`,
         regional.headline, regional.story, false];
    J.channels.splice(1, 0, ch);
    J.channels[2][0] = 'CH 3 · VIVIDH BHARATI · SONG OF YOUR YEAR';
    J.channels[3][0] = 'CH 4 · YOUR TELEVISION ERA';
  }
  J.ch = 0;
  showChannel();
  $('posterwall').hidden = true;
  $('posterwall').innerHTML = '';
  postersOf(iso).then(list => {
    if (!list || !list.length) return;
    $('posterwall').innerHTML = list.map(p => `<img src="${p.img}" alt="${p.title}" loading="lazy">`).join('');
    $('tmdbcredit').hidden = false;
    if (J.ch === 0) $('posterwall').hidden = false;
  });

  /* beat 4 · cricket */
  const ck = cricketOf(y) || {
    year: y,
    headline: y < 1960 ? "India's first Test win era" : "Pataudi's fearless era",
    story: y < 1960
      ? 'India recorded its first ever Test victory in 1952, against England at Madras — the team of Umrigar, Hazare and Mankad was learning to win.'
      : 'Under Tiger Pataudi, India learned to win abroad — the first overseas Test series victory came in New Zealand, 1968.',
  };
  $('ckyear').textContent = ck.year === y ? `THE YEAR ${y}` : `AROUND YOUR YEAR · ${ck.year}`;
  $('ckhead').textContent = ck.headline;
  $('ckstory').textContent = ck.story;
  const sp = sportOf(y);
  if (sp) {
    $('sportyear').textContent = `THE YEAR ${y}`;
    $('sporthead').textContent = sp.sport;
    $('sportmoment').textContent = sp.moment;
    $('sportcard').hidden = false;
  } else {
    $('sportcard').hidden = true;
  }

  /* beat 5 · front page */
  $('mast').textContent = `THE ${bornCity.toUpperCase()} HERALD`;
  $('dl-date').textContent = `${weekday.toUpperCase()}, ${MONTHS[m - 1].toUpperCase()} ${d}, ${y}`;
  const ms = milestoneOf(y);
  $('hl').textContent = ms ? ms.headline : 'INDIA MARCHES ON';
  $('deck').textContent = (ms ? ms.blurb : 'A young republic, growing a million stories a day.') +
    (ms && ms.year !== y ? ` (${ms.year})` : '');
  $('pmline').textContent = `${pmOn(iso)} is Prime Minister of India.`;
  $('presline').textContent = `${presidentOn(iso)} is President.`;
  const pop = population(y);
  const births = pop.popM * 1e6 * pop.cbr / 1000 / 365;
  $('popline').textContent =
    `India's population stands at ${pop.popM.toFixed(0)} million. Roughly ${fmtIN(births)} Indian babies were born this very day — you arrived with a crowd.`;
  const futureCity = (city.milestones || []).filter(f => f.year > y);
  const growth = city.pop2011 && city.pop1971 && y <= 1991
    ? ` A city of ~${fmtIN((city.pop1971 || city.pop1991) * 1000)} then — ${fmtIN(city.pop2011 * 1000)} by 2011.` : '';
  $('cityline').textContent = futureCity.length
    ? `${bornCity} was still waiting for ${futureCity.map(f => `${f.what} (${f.year})`).join(', ')}.${growth}`
    : `${bornCity}, ${city.state} — like all of India, a city about to change beyond recognition.${growth}`;
  const stateStory = stateStoryOf(city.state, iso);
  $('statep').hidden = !stateStory;
  if (stateStory) $('stateline').textContent = stateStory;

  /* beat 6 · on this day in history — scope-aware (India / World) */
  $('historydate').textContent = `${MONTHS[m - 1]} ${d}`;
  renderHistory(historyScope);

  /* beat 9 · famous birthday twins — scope-aware (India / World) */
  renderFamous(famousScope);

  /* beat 11 · birth chart / rashi kundli (astronomy-engine, computed) */
  document.querySelectorAll('#chart .cell').forEach(c => {
    c.innerHTML = `<span class="cell-sign">${RASHIS[+c.dataset.r]}</span><span class="cell-grahas"></span>`;
  });
  $('chartname').textContent = name && name !== 'Traveller' ? name : 'You';
  $('chartmoon').textContent = 'casting the chart…';
  chartP.then(chart => {
    if (!fresh()) return;
    chart.signs.forEach((grahas, r) => {
      const g = document.querySelector(`#chart .cell[data-r="${r}"] .cell-grahas`);
      if (g) g.textContent = grahas.join(' ');
    });
    $('chartmoon').textContent = `Moon in ${RASHIS[chart.moonRashi]}`;
    $('kundlilegend').innerHTML = Object.entries(GRAHA_NAMES)
      .map(([ab, nm]) => `<span><b>${ab}</b> ${nm}</span>`).join('');
  }).catch(() => { $('chartmoon').textContent = 'the sky is clouded over just now'; });

  /* beat 13 · the gods of your birth */
  const wd = weekdayOf(dob);
  $('weekdaygod').textContent = wd.deity;
  $('weekdaysub').textContent = `Born on a ${wd.day} — ${wd.name}, the day of ${wd.graha}. Tradition keeps ${wd.vrat}.`;
  $('deityname').textContent = '…'; $('deitystory').textContent = ''; $('deitytemple').textContent = '';
  $('tithigod').textContent = ''; $('navagraha').textContent = '';
  chartP.then(chart => {
    if (!fresh()) return;
    const nk = nakInfo[chart.moonNakshatra.index];
    $('deityname').textContent = cleanDeity(nk.deity);
    $('deitystory').textContent = nk.deityStory;
    $('deitytemple').innerHTML = `Honoured at the <b style="color:#EFC078">${nk.temple}</b>, ${nk.templeTown}.`;
    const isAma = chart.tithiNum === 29;
    const td = isAma ? { tithi: 'Amavasya', deity: 'the Pitrs (the ancestors)' } : panchang.tithiDeity[chart.tithiNum % 15];
    $('tithigod').textContent = td.deity;
    $('tithigodsub').textContent = `${chart.tithiNum < 15 ? 'Shukla' : 'Krishna'} ${td.tithi || ''}`.trim();
    const nav = panchang.navagraha[nk.lord];
    if (nav) {
      $('navagraha').innerHTML = `Your star answers to <b>${nk.lord}</b>, whose Navagraha temple is <b>${nav.temple}</b> at ${nav.town}.`;
      $('navagrahabeej').textContent = `Its seed-mantra: ${nav.beej}`;
      $('navagraha').closest('.god-card').hidden = false;
    } else {
      $('navagraha').closest('.god-card').hidden = true;
    }
  });

  /* beat 14 · the wheel of your years (mahadasha + numbers + naam-akshar) */
  const nu = numerology(y, m, d, name !== 'Traveller' ? name : '');
  $('numbers').innerHTML = [['Moolank', nu.moolank], ['Bhagyank', nu.bhagyank], nu.naamank ? ['Naamank', nu.naamank] : null]
    .filter(Boolean).map(([label, info]) =>
      `<div class="num-card"><p class="nl">${label}</p><div class="nn">${info.n}</div>` +
      `<p class="np">${info.planet}</p><p class="nt">${info.trait}</p></div>`).join('');
  $('dashalead').textContent = 'reading the wheel…'; $('dasharibbon').innerHTML = ''; $('dashanow').textContent = '';
  $('naamakshar').textContent = '';
  chartP.then(chart => {
    if (!fresh()) return;
    const md = mahadasha(chart.moonNakshatra, dob);
    $('dashalead').innerHTML = `You were born into your <b>${md.birthLord}</b> mahadasha — ${md.birthNote}.`;
    const maxY = Math.max(90, Math.ceil(md.age) + 8);
    $('dasharibbon').innerHTML = md.periods.filter(p => p.start < maxY).map((p, i) => {
      const span = Math.min(p.end, maxY) - p.start;
      const cls = p === md.current ? 'now' : (i === 0 ? 'birth' : '');
      return `<div class="dseg ${cls}" style="flex-grow:${span.toFixed(2)}"><span class="dp">${p.lord}</span><span class="dy">${Math.round(p.start)}–${Math.round(p.end)}</span></div>`;
    }).join('');
    $('dashanow').innerHTML = `Today, at ${Math.floor(md.age)}, the wheel has turned to <b>${md.current.lord}</b> — ${md.currentNote}.`;
    const nk = nakInfo[chart.moonNakshatra.index];
    const syl = (nk.naamAkshar || [])[chart.moonNakshatra.pada - 1];
    if (syl) {
      const named = name && name !== 'Traveller';
      $('naamakshar').innerHTML = `By the old panchang, a child of <b>${nk.name}</b>'s ${ordinal(chart.moonNakshatra.pada)} quarter is named beginning with the sound <b>${syl}</b>` +
        (named ? ` — your parents called you <b>${name}</b>. Did they agree with the sky?` : '. Did your parents agree with the sky?');
    }
  });

  /* beat 15 · your homeland */
  const kf = knownForOf(city.name);
  if (kf) {
    $('hlknown').innerHTML = `<b>${city.name}</b> is known for ${kf}.`;
    $('hlknown').closest('.hl-card').hidden = false;
  } else {
    $('hlknown').closest('.hl-card').hidden = true;
  }
  const cult = stateCultureOf(city.state), sym = stateSymbolsOf(city.state), era = regionalEra(city.state, y);
  if (cult) {
    $('hlnewyear').textContent = cult.newYear;
    $('hlera').innerHTML = `around ${cult.newYearMonth}` + (era ? ` · in your own calendar, ${y} is <b>${era.value}</b>` : '');
    $('hlculture').innerHTML = `The walls of your region wear <b>${cult.artForm}</b>, its dance is <b>${cult.dance}</b>, and its taste is <b>${cult.dish}</b>.`;
    $('homelandbeat').hidden = false;
  } else {
    $('homelandbeat').hidden = true;
  }
  if (sym) {
    $('hlsymbols').innerHTML = [['animal', 'Animal', sym.animal], ['bird', 'Bird', sym.bird], ['flower', 'Flower', sym.flower], ['tree', 'Tree', sym.tree]]
      .map(([k, l, v]) => `<div class="hl-sym"><span class="emo">${SYM_EMOJI[k]}</span><span class="sl">${l}</span><span class="sv">${v}</span></div>`).join('');
    $('hlsymbols').closest('.hl-card').hidden = false;
  } else {
    $('hlsymbols').closest('.hl-card').hidden = true;
  }

  /* beat 6 · not yet */
  $('nylist').innerHTML = FIRSTS.filter(f => f[0] > iso).slice(0, 5).map(f => {
    const wait = Math.max(1, Math.round((new Date(f[0]) - dob) / 31557600000));
    return `<div class="ny-item reveal"><div class="wait">${wait} yrs</div>` +
      `<div class="what">${f[1]}<i>${f[2]} · ${f[0].slice(0, 4)}</i></div></div>`;
  }).join('');

  /* beat 10 · stars matchbox */
  const hy = hinduYears(y, m, d);
  $('mbsamvat').textContent = `Vikram Samvat ${hy.vikram} · Shaka ${hy.shaka}`;
  $('mbtitle').textContent = 'The Sky Brand';
  $('mbsub').textContent = `${sky.moonName}, ${sky.moonIllum}% lit · sunrise ${sky.sunrise} · sunset ${sky.sunset}`;
  $('mbgrid').innerHTML = '<div><b>Nakshatra</b>computing…</div>';
  chartP.then(chart => {
    if (!fresh()) return;
    $('mbtitle').textContent = chart.moonNakshatra.name;
    $('mbsub').textContent = `Janma nakshatra · pada ${chart.moonNakshatra.pada} — the star the sky filed you under`;
  }).catch(() => {});
  Promise.all([chartP, panchP.catch(() => null)]).then(([chart, p]) => {
    if (!fresh()) return;
    const g = k => (p && p[k]) ? p[k] : '—';
    const yoga = (panchang.yoga[chart.yogaIndex] || {}).name || '—';
    $('mbgrid').innerHTML =
      `<div><b>Tithi</b>${g('tithi')}</div><div><b>Yoga</b>${yoga}</div>` +
      `<div><b>Karana</b>${chart.karanaName}</div><div><b>Paksha</b>${g('paksha')}</div>` +
      `<div><b>Masa</b>${g('masa')}</div><div><b>Moon</b>${sky.moonName}, ${sky.moonIllum}%</div>`;
  }).catch(() => {});

  /* beat 11 · your astrology — nakshatra totem + heritage reading */
  $('astrostar').textContent = '…';
  $('astrodeva').textContent = '';
  $('astrochips').innerHTML = '';
  $('astrotrait').textContent = 'Reading the star you were born under…';
  $('astrogana').textContent = '';
  $('astrogana').className = 'gana-badge';
  $('astrorows').innerHTML = '';
  Promise.all([chartP, panchP.catch(() => null)]).then(([chart, p]) => {
    if (!fresh()) return;
    const nk = nakInfo[chart.moonNakshatra.index];
    const rz = rashiInfo[chart.moonRashi];
    const cleanTree = nk.tree.replace(/\s*\(.*\)/, '');
    $('astrostar').innerHTML = `${nk.name} <span class="astro-dev">${nk.devanagari || ''}</span>`;
    $('astrodeva').innerHTML = `Ruled by <b>${nk.lord}</b> · presiding deity <b>${nk.deity}</b>`;
    $('astrochips').innerHTML = [['Symbol', nk.symbol], ['Animal', nk.animal], ['Tree', cleanTree]]
      .map(([k, v]) => `<span class="achip"><b>${k}</b>${v}</span>`).join('');
    $('astrotrait').textContent = `People born under ${nk.name} are traditionally described as ${lowerFirst(nk.traits)}`;
    $('astrogana').innerHTML = `${nk.gana} — ${GANA_GLOSS[nk.gana] || ''}`;
    $('astrogana').className = 'gana-badge gana-' + nk.gana.toLowerCase();
    const lordGov = grahaGoverns[LORD_ABBR[nk.lord]] || '';
    const rows = [
      ['Moon sign', `Your Moon sat in <b>${rz.sanskrit} (${rz.english})</b> — in India this, not your Sun sign, is "your sign": the seat of the mind and emotions. ${rz.traits}`],
      ['Ruling planet', `Your star answers to <b>${nk.lord}</b>${lordGov ? ' — ' + lowerFirst(lordGov) : ''}.`],
    ];
    if (p && p.paksha) {
      const waxing = /shukla/i.test(p.paksha);
      rows.push(['Moon’s phase', `You arrived on a <b>${p.paksha}</b> (${waxing ? 'waxing' : 'waning'}) tithi — the ${waxing ? 'brightening half, leaning outward, building and optimistic' : 'waning half, leaning inward, releasing and reflective'}.`]);
    }
    $('astrorows').innerHTML = rows.map(([k, v]) => `<div class="arow"><b>${k}</b><span>${v}</span></div>`).join('');
  }).catch(() => { $('astrotrait').textContent = 'The sky is clouded over just now.'; });

  /* beat 8 · ticket */
  $('tktroute').textContent = `${bornCity} → ${d} ${MONTHS[m - 1].slice(0, 3).toUpperCase()} ${y}`;
  $('tktname').textContent = name.toUpperCase();
  let h = 0; const s = iso + city.name + name;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  const ttNo = 'TT-' + String(h % 9e4 + 1e4);
  $('tktno').textContent = ttNo;
  $('tktdate').textContent = iso;
  const berth = `S-${dob.getDay() + 1} · COACH ${String(y).slice(2)}`;
  $('tktberth').textContent = berth;
  $('tktstation').textContent = city.stationCode
    ? `${city.stationCode} · ${city.station}` : `${bornCity.toUpperCase()} STN`;
  $('tktzone').textContent = city.railZone ? `${city.railZone} RAILWAY` : 'ALL INDIA';
  $('tktwish').innerHTML = greet && greet.bornNative
    ? `${greet.bornNative}<i>${greet.bornLatin} · ${greet.name}</i>` : '';

  J.shareData = {
    iso, city: city.name, bornCity, name, ttNo, berth,
    station: city.stationCode || '', zone: city.railZone || '',
    dateLong: `${d} ${MONTHS[m - 1]} ${y}`,
    dateShort: `${d} ${MONTHS[m - 1].slice(0, 3)} ${y}`,
    valToday: fmtIN(valToday),
    petrol: e.petrol.toFixed(2),
    gold: fmtIN(e.gold),
    film: film ? film.film : null,
    wasOldName, oldName: city.oldName || '',
  };

  /* reset interactive + reveal state for repeat journeys */
  $('amountin').value = '';
  $('amountout').textContent = '₹—';
  $('amountnote').textContent = 'that year is worth this today';
  document.querySelectorAll('#journey .beat').forEach(b => {
    b.classList.remove('in');
    delete b.dataset.counted;
  });
}

function showChannel() {
  const [tag, title, body, posters, listen] = J.channels[J.ch];
  $('chtag').textContent = tag;
  $('chtitle').textContent = title;
  $('chbody').textContent = body;
  $('posterwall').hidden = !(posters && $('posterwall').innerHTML);
  if (listen) {
    const q = encodeURIComponent(listen);
    $('ytlink').href = `https://www.youtube.com/results?search_query=${q}`;
    $('splink').href = `https://open.spotify.com/search/${q}`;
    $('tvlisten').hidden = false;
  } else {
    $('tvlisten').hidden = true;
  }
}
$('chknob').addEventListener('click', () => {
  J.ch = (J.ch + 1) % J.channels.length;
  showChannel();
});

/* ---------- count-up + reveals ---------- */
function countUp() {
  const el = $('cpival'), target = +el.dataset.target || 100;
  if (reduceMotion) {
    el.textContent = '₹' + fmtIN(target);
    $('cpisub').textContent = "of today's money";
    return;
  }
  const start = performance.now(), dur = 1700;
  function f(now) {
    const p = Math.min(1, (now - start) / dur), ease = 1 - Math.pow(1 - p, 4);
    el.textContent = '₹' + fmtIN(100 + (target - 100) * ease);
    if (p < 1) requestAnimationFrame(f);
    else $('cpisub').textContent = "of today's money";
  }
  requestAnimationFrame(f);
}
const io = new IntersectionObserver(entries => entries.forEach(en => {
  if (!en.isIntersecting) return;
  en.target.classList.add('in');
  if (en.target.id === 'rupee' && !en.target.dataset.counted) {
    en.target.dataset.counted = '1';
    countUp();
  }
}), { threshold: 0.25 });
document.querySelectorAll('.beat').forEach(b => io.observe(b));

/* ---------- India / World scope for the history + famous beats ---------- */
function setScopeActive(id, scope) {
  document.querySelectorAll('#' + id + ' .scope-btn').forEach(b => b.classList.toggle('active', b.dataset.scope === scope));
}
function renderHistory(scope) {
  historyScope = scope;
  setScopeActive('historyscope', scope);
  const { m, d } = J, mine = RENDER;
  $('historylist').innerHTML = '<li class="tl-loading">Leafing through the calendar…</li>';
  (scope === 'india' ? historyIndia : historyOn)(m, d).then(events => {
    if (mine !== RENDER || historyScope !== scope) return;
    if ((!events || !events.length) && scope === 'india') {
      renderHistory('global'); // no India events for this date — show the world instead
      return;
    }
    if (!events || !events.length) {
      $('historylist').innerHTML = '<li class="tl-loading">History is catching its breath — try again in a moment.</li>';
      return;
    }
    $('historylist').innerHTML = events.map(e =>
      `<li><span class="yr">${e.year}</span><span class="ev">` +
      `${e.thumb ? `<img src="${e.thumb}" alt="" loading="lazy">` : ''}<span>${e.text}</span></span></li>`
    ).join('');
  });
}
function renderFamous(scope) {
  famousScope = scope;
  setScopeActive('famousscope', scope);
  const { m, d } = J, mine = RENDER;
  $('famousintro').innerHTML = scope === 'india'
    ? `Famous Indians born on <b>${MONTHS[m - 1]} ${d}</b> —`
    : `Famous people the world over, born on <b>${MONTHS[m - 1]} ${d}</b> —`;
  $('famousgrid').innerHTML = '<p class="famous-loading">Searching the record for your birthday twins…</p>';
  (scope === 'india' ? famousBirthdays : famousBirthdaysGlobal)(m, d).then(list => {
    if (mine !== RENDER || famousScope !== scope) return;
    if (!list || !list.length) {
      $('famousgrid').innerHTML = '<p class="famous-none">No famous namesakes on record for today — that makes your birthday rare.</p>';
      return;
    }
    $('famousgrid').innerHTML = list.map(p => {
      const pic = p.img
        ? `<img class="pic" src="${p.img}" alt="${p.name}" loading="lazy">`
        : `<div class="pic ph">${p.name[0]}</div>`;
      return `<div class="famous-card">${pic}<span class="nm">${p.name}</span>` +
        `${p.occ ? `<span class="oc">${p.occ}</span>` : ''}<span class="yr">b. ${p.year}</span></div>`;
    }).join('');
    $('famousgrid').querySelectorAll('img.pic').forEach(img => {
      img.onerror = () => { const ph = document.createElement('div'); ph.className = 'pic ph'; ph.textContent = (img.alt || '★')[0]; img.replaceWith(ph); };
    });
  });
}
document.querySelectorAll('#famousscope .scope-btn').forEach(b => b.addEventListener('click', () => { if (J) renderFamous(b.dataset.scope); }));
document.querySelectorAll('#historyscope .scope-btn').forEach(b => b.addEventListener('click', () => { if (J) renderHistory(b.dataset.scope); }));

/* ---------- ticket buttons ---------- */
$('sharebtn').addEventListener('click', async () => {
  try {
    const ok = await shareTicket(J.shareData);
    if (!ok) { await downloadTicket(J.shareData); flash('sharebtn', 'Saved image — share it on WhatsApp'); }
  } catch { /* user cancelled */ }
});
$('downloadbtn').addEventListener('click', () => downloadTicket(J.shareData));
$('copybtn').addEventListener('click', async () => {
  const caption = buildCaption(J.shareData);
  try { await navigator.clipboard.writeText(caption); flash('copybtn', 'Copied ✓ paste it in WhatsApp'); }
  catch { prompt('Copy your caption:', caption); }
});
$('againbtn').addEventListener('click', () => {
  $('journey').style.display = 'none';
  history.replaceState(null, '', location.pathname);
  scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  $('pname').focus();
});
function flash(id, msg) {
  const el = $(id), old = el.textContent;
  el.textContent = msg;
  setTimeout(() => { el.textContent = old; }, 2600);
}

/* ---------- your-own-amount calculator ---------- */
function updateAmount() {
  const raw = +$('amountin').value;
  const out = $('amountout'), note = $('amountnote');
  if (!J || !J.mult || !raw || raw < 1) { out.textContent = '₹—'; note.textContent = 'that year is worth this today'; return; }
  out.textContent = '₹' + fmtIN(inflate(raw, J.mult));
  note.textContent = `₹${fmtIN(raw)} in ${J.y} is worth this today`;
}
$('amountform').addEventListener('submit', e => { e.preventDefault(); updateAmount(); });
$('amountin').addEventListener('input', updateAmount);
