# Premium /reading page — plan (researched 2026-07-05)

Deep multi-agent research (6 fronts → adversarial source-verify → synthesis; 13 agents). Every API price/license/capability fact-checked.

## The core decision: compute in-house, sell honestly
**Hybrid, ~95% in-house compute + one tiny serverless function only for payment.**

- The **factual astrology** (Lagna/ascendant, houses, planet degrees, retrograde, combustion, dignity, D9/D10 divisional charts, Vimshottari dasha→antar→pratyantar, gochara/Sade Sati) is all computed **client-side on `astronomy-engine`** (already our MIT dependency). Every number traces to real NASA-JPL-grade ephemeris or a documented Parashari rule.
- **Why not a paid astrology API for the core:** every provider (Prokerala, AstrologyAPI, DivineAPI, FreeAstrologyAPI) needs a server-side secret, and their "daily/weekly/monthly horoscope" feeds are **generic Sun/Moon-sign filler** — using them would violate both "no false things" and "must change with birth time." Their genuine birth-time endpoints just re-derive what we compute for free.
- **Why not Swiss Ephemeris / VedAstro self-host:** AGPL over a *monetized* service would force us to open-source the whole product (or buy the CHF 750 license). astronomy-engine's arc-minute accuracy is well inside Jyotish tolerance.
- **Margin:** zero per-reading compute cost → ~98% gross margin on the premium tier.

## The birth-time unlock (why hh:mm is the whole game)
Today `kundli.js` computes a Moon-sign chart at midday. Adding **hours + minutes + the birth city's lat/lon** unlocks the *real* chart:
- **Lagna (ascendant)** via the canonical `LST → RAMC → atan2(obliquity, latitude) − Lahiri ayanamsa`. It moves ~1 sign per 2 hours (~1° per 4 min).
- **Whole-sign houses** → the entire house-based reading (career = 10th house, etc.).
- **D9 Navamsa & D10 Dasamsa** divisional charts (integer/modulo maps of exact degrees).
- **Time-sharpened dashas** (to the day instead of the year).
- Timezone is a constant **IST (UTC+5:30)** for 1950–2010 (India's only DST, 1942–45, is out of range).

## The page — free preview vs premium
Two-tier labelling enforced **in code**: `computed-fact` (checkable) vs `tradition-interpretation` (prefixed "In Jyotish tradition, this is read as…" + a citeable rule token). Never blended.

| Section | Shows | Tier | Type |
|---|---|---|---|
| Birth-chart header (Lagna, Moon+nakshatra+pada, Sun, tithi/yoga/karana) | The factual snapshot | **Free** | fact |
| D1 Rashi chart (9 grahas by house, retrograde/combust/dignity) | North-Indian diamond chart | **Free** | fact |
| Kundli summary / personality (Lagna + lord + Moon + Sun) | Temperament & life-frame prose | **Free** | tradition |
| **Career** (10th house + 10th lord + D10 + Amatyakaraka) | Suited fields — never a guaranteed job | Premium | tradition |
| **Vimshottari dasha ladder** (Maha→Antar→Pratyantar + dates) | The period you're running + its themes | Premium | fact |
| **Marriage/relationships** (7th + D9 + Venus + Mangal Dosha *with cancellations*) | Partner themes; Manglik shown calmly with the rule | Premium | tradition |
| **Weekly gochara** (transits over natal Moon + Lagna) | This week's real transits + traditional reading | Premium | tradition |
| **Monthly gochara + Sade Sati / Jupiter–Saturn** | Month-ahead framing from real transits | Premium | tradition |
| **Doshas** (Mangal, Kaal Sarp, Sade Sati) *with cancellations* | Stated calmly, rule shown, mitigations noted | Premium | tradition |
| **Lucky colour + do's & don'ts + auspicious weekday** | Keyed to the *computed Lagna lord* (so it changes with time) | Premium | tradition |
| **Remedies** (mantra / gem / weekday) | Optional tradition — never fear-gated, never a "cure" | Premium | tradition |
| **D9 & D10 charts** (full) | With a "sensitive to your exact minute" badge on the D9/D10 *ascendant* | Premium | fact |
| *Optional later:* polished multi-language prose | AstrologyAPI ascendant/house reports via proxy | Premium | tradition |

## Honesty + legal (this is the differentiator, not just compliance)
- **Two-tier fact/tradition labelling** is simultaneously the ethics answer, the Consumer Protection Act 2019 substantiation defence, and a product differentiator no competitor offers.
- **Banned-claim deny-list** hard-blocked in the generation layer: (1) guaranteed outcomes, (2) medical/cure claims, (3) financial advice, (4) legal advice, (5) fear-based remedy upsell. Never market as "scientific/proven."
- **Disclaimer format** must follow CCPA Misleading-Ads Guidelines 2022: same-language, same-font, **inline with each interpretive block** (a buried grey footer doesn't cure an over-promise). Four clauses: guidance/reflection purpose · not a substitute for a licensed professional · no guaranteed outcomes · decisions are the user's own. (CCPA fines up to ₹10 lakh / ₹50 lakh repeat.)
- **DPDP Act 2023 + Rules 2025:** name-linked DOB/time/place are personal data. **Compute client-side, store nothing** server-side unless the user opts into a saved account — "we don't retain your birth data" collapses most obligations and is a marketable trust signal. **Gate the paid tier behind an 18+ affirmation** (DPDP child = under 18; child-data penalties reach ₹200 crore).
- Astrology itself is lawful (exempt from the Maharashtra/Karnataka anti-superstition acts); exposure is only in *how* claims are worded.

## Birth-time UX
- Prefer an unambiguous **24-hour hh:mm**; if AM/PM, default UNSET and echo back ("19:00 = 7:00 PM").
- **Live Ascendant preview** that redraws the rising sign as they type — turns the #1 silent error (AM/PM inversion → Lagna off by ~6 signs) into something visually self-correcting, and is a "wow, it really changes with my minute" premium moment.
- **Unknown-time fallback (honest):** deliver the Chandra-Lagna / sunrise path — Moon sign, nakshatra, dasha ladder (to the year), numerology, Chandra gochara — all genuinely time-robust — with a visible "Ascendant, houses, D9/D10 need your birth time" note. Never fabricate a noon Lagna as fact. "Add your birth time to unlock the full chart" = the premium hook.
- **Boundary-Moon self-check:** compute the Moon at 00:00 and 23:59 IST for the DOB; if it changes sign/nakshatra that day, warn instead of asserting (also fixes a latent bug in the current free site).
- Per-block **confidence badges**: D1/Moon = solid; D9/D10 ascendant = "sensitive to your minute"; dasha dates = "±N weeks."

## Getting paid (one-time report at launch)
- **Razorpay** — the realistic India-first rail (Stripe India is invite-only and blocks individuals). Individual/sole-prop KYC, native UPI, ~2% + 18% GST, HMAC-signed webhooks. You are merchant-of-record (file GST yourself).
- **One Cloudflare Worker** (free 100k req/day; $5/mo commercial floor): (1) holds the Razorpay secret + creates the Order, (2) HMAC-verifies the webhook with KV idempotency, (3) mints a short-lived signed **JWT** that unlocks the premium payload — **no user accounts/DB needed**; the token *is* proof-of-purchase. Also email the report link (JWT in localStorage is lost if cleared).
- **Premium interpretation text is authored in-house** (rule-keyed JSON from our existing data), not fetched.
- **MoR alternative:** **Dodo Payments** (India-founded merchant-of-record that keeps UPI and remits GST for you, ~4% + ₹4) if you'd rather not file GST. Gumroad = zero-engineering MVP to test willingness-to-pay but can't generate a per-birth-time report.
- **Subscription** only after one-time demand is proven (needs RBI e-mandate / UPI AutoPay, 24h pre-debit notice, easy cancel).

## My added ideas (beyond the ask)
1. **Live Ascendant preview** (self-correcting AM/PM + premium wow).
2. **Confidence badges** per block — selling honesty as a feature.
3. **Boundary-Moon self-check** — fixes a latent factual bug even on the free site.
4. **"Why does it say this?" tooltips** — every interpretation carries a citeable rule token (e.g. "BPHS: 10th-lord in 9th"). Makes the honesty promise enforceable in code + a trust differentiator.
5. **The paywall = the birth-time line.** Free tier is the honest Moon/dasha/numerology reading; premium is literally everything birth time unlocks (Lagna, houses, career, D9/D10). The business model aligns perfectly with the honesty line.
6. **One-time emailed PDF/permalink report** for launch — sidesteps RBI e-mandate entirely; the JWT permalink *is* the deliverable.
7. **Free correctness harness** — cross-check our Lagna/houses against `circular-natal-horoscope-js` for known charts (dev-only, not shipped).
8. **Multi-language-ready from day one** — key interpretation JSON on rule tokens, so HI/TA/TE slot in later.
9. **Remedies as calm, optional, "never required, never a cure"** — turns the industry's most legally-exposed feature into a visible trust signal.

## Phased build order
- **Phase 0 — Birth-time input + Lagna engine** (M): hh:mm input + city coords + IST + live Ascendant preview; extend kundli.js to keep degrees.
- **Phase 1 — Ship the FREE honest chart** (M): D1 + Lagna + houses + retrograde/combust/dignity + Moon/Sun/nakshatra + unknown-time fallback + fact/tradition labels. No paywall.
- **Phase 2 — Premium factual layer** (L): D9/D10, full dasha recursion, gochara weekly/monthly, Sade Sati, dosha checks.
- **Phase 3 — Authored interpretation JSON** (L): career, personality, marriage, lucky, remedies — each with a rule token + inline disclaimers + deny-list.
- **Phase 4 — Paywall** (M): Cloudflare Worker + Razorpay + JWT unlock + DPDP consent + 18+ gate + disclaimers.
- **Phase 5 — Subscription + polish** (L, only if demand proven).

## Open decisions (my recommendations)
1. **One-time vs subscription at launch** → **one-time** (far less engineering, no RBI e-mandate).
2. **Razorpay (self-GST) vs Dodo MoR** → start **Razorpay** if comfortable filing GST; Dodo if not.
3. **House system** → **whole-sign only** (North-Indian default, robust, in-house).
4. **Interpretation text** → **author in-house** for launch (free, traceable, multi-language-ready).
5. **Store data or not** → **store nothing** (email the permalink).
6. **Price** → modest **₹199–299** one-time to test conversion; keep under ₹15,000 for future OTP-free e-mandate.

### Verified source notes
- astronomy-engine v2.1.19 = MIT, browser-safe, NASA-JPL-validated ✓ · Prokerala free 5,000 credits/mo but forecasts are generic ✓ · AstrologyAPI ascendant/house reports ARE birth-time-driven (~₹1,000/10k credits) ✓ · Swiss Ephemeris AGPL-or-CHF750 ✓ · Stripe India invite-only/blocks individuals ✓ · UPI still ~2% platform fee even at "zero MDR" ✓.
