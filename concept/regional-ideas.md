# Regional & extra-module ideas (research, July 2026)

## State formation twist data: bundled in regional.json (36 rows)

## Your address had no PIN code [trivial]
PIN codes were introduced nationwide on 15-Aug-1972 (by Shriram Bhikaji Velankar, Posts & Telegraphs). One hard-coded date, no API — if DOB < 1972-08-15, show the twist; if born 1972, 'PIN codes are your age-mate'. Source: India Post history page / Wikipedia 'Postal Index Number'.

**Wow:** Letters to your family were addressed by mohalla and landmark — India hadn't invented the PIN code yet.

## Festival lights around your birthday [medium]
Diwali/Holi/Dussehra/Raksha Bandhan/Eid dates for every year 1950–2010. drikpanchang.com publishes 1000-year tables per festival (verified live: /sitemaps/year/diwali/diwali-puja-calendar.html); scrape once into a static JSON (~60 rows x 6 festivals), pick the festival nearest the DOB, tint by region (Pongal for TN, Onam for Kerala, Durga Puja for Bengal, Bihu for Assam).

**Wow:** You were born two days before Diwali 1974 — the diyas were already out on every sill.

## A famous face from your city [easy]
Wikidata SPARQL at query.wikidata.org: P19 (place of birth) = city, P569 (date of birth), order by sitelink count for fame. Precompute top 5 per supported city into JSON, then show who was already alive ('Lata was 21 across town') or born after the user. Photos via Wikimedia Commons P18.

**Wow:** Sachin Tendulkar was a 4-year-old in Bandra East when you arrived in Bombay.

## What gold and petrol cost that year [easy]
RBI 'Handbook of Statistics on Indian Economy' has annual gold price per 10g back to the 1950s; petrol/postcard/cinema-ticket prices from published archival tables (indiastat, newspapers' anniversary features). One static 60-row table.

**Wow:** Gold was Rs 111 for 10 grams the year you were born; a postcard cost 6 paise.

## Did the monsoon greet you? [easy]
IMD's normal monsoon onset/withdrawal dates per city (2020 revised normals PDF: internal.imd.gov.in/press_release/20200515_pr_804.pdf; Kerala 1-Jun, Mumbai 11-Jun, Kolkata 11-Jun, Delhi 27-Jun). Static per-city onset date; if DOB within ±10 days, show the rain line; else show season (loo of May, October heat).

**Wow:** Born 9 June in Mumbai — the monsoon normally breaks over the city that very week.

## When TV reached your city [easy]
Doordarshan kendra launch dates are well documented (Delhi 15-Sep-1959, Bombay 2-Oct-1972, Calcutta 9-Aug-1975, Madras 15-Aug-1975; nationwide colour 25-Apr-1982; Wikipedia 'Doordarshan' + kendra pages). Static table of ~30 kendras; compute years-until-TV from DOB. Pair with AIR/Vividh Bharati (launched 3-Oct-1957) for the radio-era line.

**Wow:** Television wouldn't reach your city for another 11 years — the radio was the family hearth.

## The blockbuster of your birth year [easy]
Wikipedia has 'List of Bollywood films of <year>' plus Tamil/Telugu/Bengali/Malayalam/Kannada equivalents with top grossers for every year since 1950. Precompute one film per year per language region, matched to the birth state's language.

**Wow:** Sholay was in its 40th week at Minerva when you were born.

## Your city's morning newspaper [easy]
Static table mapping state/city to its dominant daily with founding year: Anandabazar Patrika (1922, Kolkata), The Hindu (1878, Madras), Malayala Manorama (1888), Eenadu (1974!), Dainik Bhaskar (1958), Dainik Jagran (1942). Source: Wikipedia 'List of newspapers in India by circulation' + individual pages. Twist when the paper is younger than the user.

**Wow:** Your birth announcement would've run in Eenadu — except Eenadu itself wasn't born until 1974.

## How many around you could read [easy]
Census of India decadal literacy rates by state, 1951–2011 (censusindia.gov.in tables, mirrored on Wikipedia 'Literacy in India'). Interpolate to birth year; optional World Bank API (SE.ADT.LITR.ZS) for the national line.

**Wow:** The year you were born in Bihar, only 1 person in 5 could read this sentence.

## India's sporting mood that month [trivial]
Curated static timeline ~40 rows: hockey golds 1948/52/56/64/80, Milkha's 0.1s heartbreak 6-Sep-1960, Wadekar's 1971 wins, 25-Jun-1983 World Cup, PT Usha 8-Aug-1984, Prakash Padukone 1980. Show the nearest moment before/after DOB, biased to the user's region (Usha for Kerala, hockey for Punjab).

**Wow:** Ten days after you were born, Kapil's Devils lifted the World Cup at Lord's.

## The trunk-call years [easy]
Era-based telephony capsule: manual trunk calls and 'lightning calls' pre-1960s, first STD line Lucknow–Kanpur 1960, STD codes spreading through the 70s–80s, PCO/STD booth boom post-1986 (Sam Pitroda, C-DOT). Show the city's STD code (static DoT list) and what booking a call to grandma involved in the birth year.

**Wow:** Announcing your birth to relatives meant booking a trunk call and waiting three hours.

## Your school-era time capsule [medium]
Curated by birth-decade + region: what class 1 looked like when user turned 6 — NCERT-era textbooks, slate vs notebook, DD shows airing then (Malgudi Days 1987, He-Man, Shaktimaan 1997), school radio broadcasts. Pure editorial JSON keyed to DOB+6 years; no API.

**Wow:** When you started school, Malgudi Days had just begun airing on Sunday mornings.

## Thali of your birthplace [easy]
Curated per-city/region capsule of 3 signature dishes with one vintage detail (e.g. Mysore Pak invented in the Mysore palace kitchen; Chennai's filter coffee ritual). Static content, ~50 cities; not date-aware but anchors the regional layer emotionally.

**Wow:** You were born in the city that gave the world Mysore Pak.

## Was your name in fashion? [hard]
India has no SSA-style name registry; nearest sources are research datasets (Harvard Dataverse Indian-names corpora, voter-roll derived name-by-birth-cohort studies) — sparse and legally murky. Could fall back to curated 'names of the decade' lists from matrimonial/naming articles. High charm, weakest data of the lot; rank last until a clean dataset is found.

**Wow:** Sanjay ruled the 1970s nursery register — blame Bollywood.
