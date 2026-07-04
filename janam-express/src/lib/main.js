import {
  CITIES, FIRSTS, econ, filmOf, songOf, cricketOf, milestoneOf,
  pmOn, presidentOn, population, findCity, tvEra, fmtIN, MONTHS,
  greetingOf, regionalCinemaOf, stateStoryOf,
} from './lookup.js';
import { skyOn, panchangOn } from './astronomy.js';
import { weatherOn, onThisDay, postersOf } from './api.js';
import { buildCaption, shareTicket, downloadTicket } from './share.js';

const $ = id => document.getElementById(id);
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const YEAR_MIN = 1950, YEAR_MAX = 2010;
let J = null; // current journey

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
  const dob = new Date(y, m - 1, d);
  const weekday = dob.toLocaleDateString('en-IN', { weekday: 'long' });
  const wasOldName = !!(city.oldName && iso < (city.renamedOn || '9999'));
  const bornCity = wasOldName ? city.oldName : city.name;
  const sky = skyOn(y, m, d, city.lat, city.lon);
  const e = econ(y);

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
  weatherOn(city.lat, city.lon, iso).then(w => {
    if (!w || !$('tgweather')) return;
    const line = w.rain >= 1
      ? `IT RAINED ${Math.round(w.rain)} MM THAT DAY${'*'}`
      : `HIGH OF ${Math.round(w.tmax)} DEGREES THAT DAY${'*'}`;
    $('tgweather').innerHTML = line.replace('*', '') + stop;
  });

  /* beat 2 · rupee */
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
      false],
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
  $('worldp').hidden = true;
  onThisDay(m, d, y).then(events => {
    if (!events) return;
    $('worldline').textContent = events.join(' · ');
    $('worldp').hidden = false;
  });

  /* beat 6 · not yet */
  $('nylist').innerHTML = FIRSTS.filter(f => f[0] > iso).slice(0, 5).map(f => {
    const wait = Math.max(1, Math.round((new Date(f[0]) - dob) / 31557600000));
    return `<div class="ny-item reveal"><div class="wait">${wait} yrs</div>` +
      `<div class="what">${f[1]}<i>${f[2]} · ${f[0].slice(0, 4)}</i></div></div>`;
  }).join('');

  /* beat 7 · stars */
  $('mbtitle').textContent = 'The Sky Brand';
  $('mbsub').textContent = `${sky.moonName}, ${sky.moonIllum}% lit · sunrise ${sky.sunrise} · sunset ${sky.sunset}`;
  $('mbgrid').innerHTML = '<div><b>Nakshatra</b>computing…</div>';
  panchangOn(y, m, d, city.lat, city.lon).then(p => {
    if (!p || !p.nakshatra) {
      $('mbgrid').innerHTML =
        `<div><b>Sunrise</b>${sky.sunrise} IST</div><div><b>Sunset</b>${sky.sunset} IST</div>` +
        `<div><b>Moon</b>${sky.moonName}</div><div><b>Lit</b>${sky.moonIllum}%</div>`;
      return;
    }
    $('mbtitle').textContent = p.nakshatra;
    $('mbsub').textContent = 'Your janma nakshatra — the star the sky filed you under';
    $('mbgrid').innerHTML =
      `<div><b>Tithi</b>${p.tithi || '—'}</div><div><b>Paksha</b>${p.paksha || '—'}</div>` +
      `<div><b>Masa</b>${p.masa || '—'}</div><div><b>Moon</b>${sky.moonName}, ${sky.moonIllum}%</div>`;
  });

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

  /* reset reveal + counter state for repeat journeys */
  document.querySelectorAll('#journey .beat').forEach(b => {
    b.classList.remove('in');
    delete b.dataset.counted;
  });
}

function showChannel() {
  const [tag, title, body, posters] = J.channels[J.ch];
  $('chtag').textContent = tag;
  $('chtitle').textContent = title;
  $('chbody').textContent = body;
  $('posterwall').hidden = !(posters && $('posterwall').innerHTML);
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
