/* Regression guard for the sidereal chart engine (run: npm test).
   Anchors: a published chart (Narendra Modi, 17 Sep 1950, 11:00 IST, Vadnagar —
   Vrishchika Lagna & Moon) plus a spot-check that was hand-validated against an
   independent astronomy-engine horizon scan (0.0000° agreement) on 2026-07-05. */
import { fullChart } from '../src/lib/kundli.js';

const SIGNS = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'];
let failed = 0;
const check = (label, got, want) => {
  const ok = got === want;
  if (!ok) failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}: got ${got}, want ${want}`);
};

// Modi — published Vrishchika (Scorpio) Lagna and Moon
const modi = await fullChart(1950, 9, 17, 11, 0, 23.79, 72.64);
check('Modi Lagna sign', SIGNS[modi.lagna.sign], 'Vrishchika');
check('Modi Moon sign', SIGNS[modi.moonRashi], 'Vrishchika');

// Hand-validated spot check (Mumbai 1990-06-15 14:30 IST): Kanya Lagna ~26°,
// Saturn retrograde in own sign Makara, Sun in the 10th whole-sign house.
const c = await fullChart(1990, 6, 15, 14, 30, 19.08, 72.88);
check('1990 Mumbai Lagna sign', SIGNS[c.lagna.sign], 'Kanya');
check('1990 Mumbai Lagna degree', Math.round(c.lagna.degInSign), 26);
const sat = c.grahas.find(g => g.graha === 'Sa');
check('Saturn retrograde', sat.retro, true);
check('Saturn dignity', sat.dignity, 'own');
check('Saturn sign', SIGNS[sat.sign], 'Makara');
check('Sun house (whole-sign)', c.grahas.find(g => g.graha === 'Su').house, 10);

console.log(failed ? `\n${failed} CHECK(S) FAILED` : '\nALL CHECKS PASSED');
process.exit(failed ? 1 : 0);
