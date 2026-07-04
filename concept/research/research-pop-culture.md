SUMMARY:
All four data pillars for an Indian "birth-date time machine" are buildable from free sources. Movies: TMDB's /3/discover/movie endpoint (free API key with attribution; v3 api_key query param or v4 Bearer header) supports region=IN + primary_release_date.gte/lte + with_original_language=hi (or ta/te/ml/kn/bn for regional cinema) + sort_by=popularity.desc, giving "films released the week you were born." For the canonical "biggest film of your birth year," Wikipedia's per-year pages (en.wikipedia.org/wiki/List_of_Hindi_films_of_YYYY) each open with a ranked highest-grossing table — scrapable once into a static lookup covering the 1940s-present. IMDb non-commercial TSV dumps (datasets.imdbws.com) are a bulk fallback. Music: the Binaca/Cibaca Geetmala annual countdown (Radio Ceylon then Vividh Bharati) has published year-end #1 lists for 1953-1993 (hindigeetmala.net has all toppers on one page; Indpaedia has full annual lists); post-1993 use Filmfare playback-award winners and best-selling soundtrack data from Wikipedia film pages.

Cricket: Cricsheet.org gives free, openly licensed JSON of every international match with exact dates — india_json.zip is just 1,323 match files, each containing date, teams, venue, result and player-of-match, perfect to index into a "what was Team India doing on your birthday" lookup; ESPNcricinfo Statsguru URLs (team=6 for India, spanmin1/spanmax1 date params) cover pre-Cricsheet history and deep-linking. TV/radio nostalgia needs no API — a hand-built per-era table works: Hum Log 1984 (first DD serial), Buniyaad 1986, Ramayan Jan 1987 (streets emptied on Sunday mornings), Mahabharat 1988, Gulf-War CNN + Star TV late 1991, Zee TV 1 Oct 1992 (first private Hindi satellite channel), KBC July 2000, saas-bahu era 2000s. Sample years verified: 1985 = Ram Teri Ganga Maili / "Sun Sahiba Sun" (Binaca #1) / India win B&H World Championship, Shastri's Audi; 1990 = Dil / Aashiqui-era, Binaca #1 "Gori Hai Kalaaiyan" / 17-yr-old Tendulkar's maiden Test ton at Old Trafford (14 Aug); 1995 = DDLJ / "Tujhe Dekha To" / India win Asia Cup in Sharjah (14 Apr); 2000 = Kaho Naa... Pyaar Hai (Mohabbatein top worldwide) / KNPH soundtrack ~9M units / Ganguly's 117 in ICC KnockOut final (15 Oct).

ITEMS:
## TMDB Discover API — films released the week/year of birth in India
Endpoint: GET https://api.themoviedb.org/3/discover/movie?region=IN&primary_release_date.gte=1990-06-01&primary_release_date.lte=1990-06-30&with_original_language=hi&sort_by=popularity.desc. Auth: free API key (register at TMDB account settings); pass as ?api_key=KEY (v3) or 'Authorization: Bearer <v4 token>' header. Free for non-commercial use with attribution to TMDB. sort_by supports popularity.desc, revenue.desc, vote_average.desc. with_original_language takes hi/ta/te/ml/kn/bn/mr/pa for regional cinema — pipe (|) = OR, comma = AND. region=IN makes date filters use the Indian release date. Also /movie/{id} for posters (image base https://image.tmdb.org/t/p/w500/...).
SOURCE: https://developer.themoviedb.org/reference/discover-movie
WOW: User enters 15 June 1990 and instantly sees the actual movie posters that were hanging outside their local cinema the week they were born.

## Wikipedia 'List of Hindi films of YYYY' pages — canonical #1 film per birth year
URL pattern: https://en.wikipedia.org/wiki/List_of_Hindi_films_of_1990 (exists for every year, ~1940s-present). Each page opens with a ranked 'highest-grossing' table (rank, title, cast, genre). Verified: 1985 #1 = Ram Teri Ganga Maili (Rajiv Kapoor, Mandakini), #2 Mard (Amitabh Bachchan); 1990 #1 = Dil (Aamir Khan, Madhuri Dixit). Parallel pages exist per language (List_of_Tamil_films_of_1990 etc.) for regional birth places. Scrape once via Wikipedia REST API (en.wikipedia.org/api/rest_v1/page/html/{title}) into a static JSON lookup — no runtime dependency. Note: 'List of highest-grossing Hindi films' page has a by-year table only from 2000 onward (2000 = Mohabbatein worldwide), so per-year pages are the pre-2000 source. Box Office India (boxofficeindia.com/years.php?year=1995) has nett-gross figures as backup.
SOURCE: https://en.wikipedia.org/wiki/List_of_Hindi_films_of_1990
WOW: One-time scrape yields a 70-year lookup: 'The year you were born, all of India was queuing for ___.'

## IMDb non-commercial datasets — bulk fallback for any Indian film + ratings
Free daily-refreshed gzipped TSVs at https://datasets.imdbws.com/ — title.basics.tsv.gz (year, genres), title.akas.tsv.gz (has region=IN rows, so filterable to Indian releases), title.ratings.tsv.gz (vote counts to rank the era's biggest titles), name.basics.tsv.gz. Personal/non-commercial license. No API needed — load into SQLite/DuckDB at build time.
SOURCE: https://developer.imdb.com/non-commercial-datasets/
WOW: Lets you rank 'most-loved Indian film of your birth year' by actual IMDb vote counts even for obscure regional years.

## Binaca/Cibaca Geetmala annual lists — the #1 Hindi song of birth years 1953-1993
The legendary Ameen Sayani radio countdown (Radio Ceylon 1952-88, Vividh Bharati 1989-94) published annual year-end lists 1954-1993 (data exists from 1953). Full topper list on one page: https://www.hindigeetmala.net/geetmala/binaca_geetmala_topper.php (pages 1-5). Verified toppers: 1985 'Sun Sahiba Sun' (Ram Teri Ganga Maili, Lata Mangeshkar); 1987 'Chitthi Aayi Hai' (Naam); 1988 'Papa Kehte Hain' (QSQT); 1989 'My Name Is Lakhan' (Ram Lakhan); 1990 'Gori Hai Kalaaiyan' (Aaj Ka Arjun); 1991 'Dekha Hai Pehli Baar' (Saajan); 1992 'Maine Pyar Tumhi Se Kiya Hai' (Phool Aur Kaante). Full 32-song annual lists per year at indpaedia.com (e.g. indpaedia.com/ind/index.php/Binaca_Geet_Mala_1985:_annual_list) and keepalivebollywood.com/binacageetmala/year/1985. Post-1993: use Filmfare Best Playback winners + Wikipedia soundtrack sales (e.g. KNPH 2000 sold ~8.5-10M units).
SOURCE: https://www.hindigeetmala.net/geetmala/binaca_geetmala_topper.php
WOW: 'The song your parents heard everywhere the year you were born' — sourced from the exact radio countdown those parents actually listened to.

## Cricsheet.org — free JSON of every India international match with exact dates
Openly licensed downloads at https://cricsheet.org/downloads/ — key file: https://cricsheet.org/downloads/india_json.zip (1,323 India matches; india_male_json.zip = 1,009). Also tests_json.zip (908), odis_json.zip (3,146), t20s_json.zip (5,524), all_json.zip (~22,000). Each match JSON has info.dates ['YYYY-MM-DD', ...], teams, venue, city, outcome (winner/margin), player_of_match, toss, and full ball-by-ball. JSON spec: https://cricsheet.org/format/json/. Coverage is strongest 2000s-onward (built from ESPNcricinfo scorecards); index dates into a per-day lookup so any birthday shows 'India was playing Pakistan at Sharjah that day — and won by 4 wickets.'
SOURCE: https://cricsheet.org/downloads/
WOW: Exact-day hit: if India played on the user's actual birth date, you can name the opponent, ground, result and man of the match.

## ESPNcricinfo Statsguru — deep links for pre-2000 dates and 'India in your birth year'
India's team id is 6. Date-range query pattern: https://stats.espncricinfo.com/ci/engine/stats/index.html?class=2;team=6;spanmin1=01+Jan+1990;spanmax1=31+Dec+1990;spanval1=span;template=results;type=team;view=results (class=1 Tests, 2 ODIs, 3 T20I; dates formatted 'DD+Mon+YYYY'). Match-list view: view=results gives every match with date, opponent, ground, result. Team page: stats.espncricinfo.com/ci/engine/team/6.html. HTML tables are scrapable (build-time only — no official API; scraping wrappers exist e.g. github.com/puppetmaster12/cricguru and the R 'cricketdata' package which pulls both Statsguru and Cricsheet).
SOURCE: https://stats.espncricinfo.com/ci/engine/stats/index.html
WOW: Covers birthdays back to the 1930s where Cricsheet thins out, and gives users a clickable 'see the full scorecard' link.

## Doordarshan/TV era lookup table — concrete anchors per year
1959 DD experimental start; 1982 color TV + Asian Games broadcast; 1984 Hum Log (first Hindi serial); 1986 Buniyaad; 25 Jan 1987 Ramayan starts (streets emptied Sunday 9:30am, ~80-100M viewers); 1988-90 Mahabharat; late-80s Fauji (Shah Rukh's debut), Malgudi Days, Nukkad, Wagle Ki Duniya, Mungerilal Ke Haseen Sapne; 1991 Gulf War on CNN triggers cable boom + Star TV launches Dec 1991 (Star Plus, MTV, Prime Sports, BBC); 1 Oct 1992 Zee TV = first private Hindi satellite channel; 1993 Byomkesh Bakshi, Shanti (first daily soap); 1995 Cartoon Network/regional cable explosion; 1997 Shaktimaan; 3 Jul 2000 Kaun Banega Crorepati with Amitabh; Jul 2000 Kyunki Saas Bhi Kabhi Bahu Thi starts saas-bahu era. Sources: Wikipedia 'Television in India', 'List of programs broadcast by DD National', quint.com classic-DD listicles. This is a ~40-row hand-curated JSON, no API needed.
SOURCE: https://en.wikipedia.org/wiki/Television_in_India
WOW: Born 1988? 'Every Sunday morning your whole neighbourhood gathered around one TV for Mahabharat.' Born 1993? 'You're the first cable-TV generation — Zee TV was one year old.'

## Sample year 1985 — verified trio
Film: Ram Teri Ganga Maili (#1 grosser of 1985, Raj Kapoor's last directorial; Mard with Amitabh was #2). Song: 'Sun Sahiba Sun' — Lata Mangeshkar, Binaca Geetmala annual #1 of 1985, from the same film. Cricket: India won the Benson & Hedges World Championship of Cricket, beating Pakistan by 8 wickets in the MCG final on 10 March 1985; unbeaten all tournament; Ravi Shastri named Champion of Champions and drove his Audi 100 prize around the MCG with the whole team on the car.
SOURCE: https://en.wikipedia.org/wiki/1985_World_Championship_of_Cricket_final
WOW: Film and #1 song of the year come from the same movie, plus the iconic Shastri-Audi image every 80s cricket fan remembers.

## Sample year 1990 — verified trio
Film: Dil (Aamir Khan, Madhuri Dixit) — #1 grosser of 1990 (~Rs 10 crore nett); Aashiqui the same year was the decade-defining music blockbuster. Song: Binaca annual #1 'Gori Hai Kalaaiyan' (Aaj Ka Arjun, Lata Mangeshkar + Shabbir Kumar); Aashiqui's 'Dheere Dheere Se' / 'Nazar Ke Saamne' are the nostalgic alternates. Cricket: 14 August 1990 — 17-year-old Sachin Tendulkar scored his maiden Test century (119*) at Old Trafford, saving the Test against England and winning Player of the Match.
SOURCE: https://www.espncricinfo.com/series/india-tour-of-england-1990-62275/england-vs-india-2nd-test-63535/full-scorecard</parameter>
WOW: 'Sachin scored his first-ever international hundred 3 days after you were born' is exactly the kind of line this site is for.

## Sample year 1995 — verified trio
Film: Dilwale Dulhania Le Jayenge (released 20 Oct 1995, Diwali) — highest grosser of 1995 and still running at Mumbai's Maratha Mandir 25+ years later. Song: 'Tujhe Dekha To Ye Jaana Sanam' (DDLJ, Lata Mangeshkar & Kumar Sanu, music Jatin-Lalit) — Binaca had ended in 1993, so use the Filmfare-sweeping DDLJ soundtrack. Cricket: 14 April 1995 — India won their 4th Asia Cup, beating Sri Lanka by 8 wickets in the Sharjah final (Azharuddin 90*, Sidhu 84*); earlier, on 9 April 1995, Tendulkar hit 112* vs SL becoming the youngest to 3,000 ODI runs.
SOURCE: https://www.cricketcountry.com/news/on-this-day-in-1995-india-won-fourth-asia-cup-title-977922
WOW: Born late-1995 users get 'DDLJ opened in theatres that Diwali — and it has never stopped playing.'

## Sample year 2000 — verified trio
Film: Kaho Naa... Pyaar Hai (released 14 Jan 2000) — highest domestic grosser of 2000, launched Hrithik Roshan overnight, won 92 awards (Guinness-recognised); Mohabbatein was the top worldwide grosser per Wikipedia's by-year table. Song: KNPH title track / 'Ek Pal Ka Jeena' — soundtrack sold ~8.5-10 million units, biggest album of 2000. Cricket: 15 October 2000 — ICC KnockOut Trophy final in Nairobi: captain Sourav Ganguly hit 117 (after 141* in the semi vs South Africa) but NZ chased 265 with 2 balls left; also Jan 2000 India (with Yuvraj, Kaif) won the U19 World Cup. Bonus 2000 anchors: KBC premiered 3 July 2000, and Hrithik-mania is itself a nostalgia hook.
SOURCE: https://en.wikipedia.org/wiki/Kaho_Naa..._Pyaar_Hai
WOW: 'You were born 3 weeks after India discovered Hrithik Roshan' — instantly relatable to the 2000-born cohort now in their mid-20s.

## Implementation shape — static lookup + one live API
Recommended architecture: (a) build-time scrape of Wikipedia per-year film pages + Geetmala toppers + hand-curated TV-era table + Cricsheet india_json.zip indexed by date into one static JSON (~200KB) keyed by year and by exact date; (b) single runtime call to TMDB discover (region=IN, ±7 days around DOB) for poster imagery. Everything is free: TMDB (attribution required), Cricsheet (open license), Wikipedia (CC BY-SA), IMDb TSVs (non-commercial). Only paid/greyzone piece to avoid: no official ESPNcricinfo API — use it for links, Cricsheet for data.
SOURCE: https://cricsheet.org/format/json/
WOW: The whole 'time machine' works offline-first from one prebuilt JSON, so the reveal page renders instantly.


