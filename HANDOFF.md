# Bushido: developer handoff (branch `dev`)

This branch holds the **sources and tools** of the game. Branch `main` holds only the published site
(`index.html`, `art/`, `og.png`, manifest…) served at https://galscher.github.io/bushido/.
The same build is also published as a Claude artifact: https://claude.ai/code/artifact/3ed19115-7be2-4c06-911b-ecdb12d0aec7

## Setup (paths are hard-coded, keep them)
```
git clone -b dev https://github.com/galscher/bushido /home/claude/bushido
git clone -b main https://github.com/galscher/bushido /home/claude/bushido-web
```
Python 3 with Pillow, numpy, scipy and Playwright (Chromium is preinstalled in Claude cloud sessions).

## How the game is built
- `he.html` / `en.html` are the two language versions of the core game. Between the markers
  `/* ================= 物語 The Saga` and `if(false)window.__t={get CAMOV()` they contain the injected addons.
- Each `*_addon.js` (and `saga_*.js`, `art_data.js`) is one feature; they share one scope and wrap core functions by
  reassigning them (`{const o=fn;fn=function(){...o.apply(this,arguments)...}}`). Only addons may call `TX(he,en)`.
- `python3 -I tools/reinject.py` re-injects the addon list (order matters, see the file) into both languages.
- `python3 -I build.py` wraps both into `game.html` (the launcher with `DOCS.he` / `DOCS.en`).
- `python3 -I mktest.py` makes `game_test.html` with the `if(false)window.__…` test hooks turned on (never publish it).

## Illustrated characters (the art pipeline)
- Sheets come from an image generator as a **2x2 green-screen sprite sheet**: top-left idle stance, top-right weapon raised,
  bottom-left attack lunge, bottom-right face close-up. Every character must **face right**.
- `python3 -I art/mksheet.py SHEET.png ID [--flip idle,blk,por] [--mirror all] [--sc 1.0]`
  keys out the green (flood fill from the edges, so green creatures survive), drops ground shadows, splits the cells,
  normalises heights, saves `art/ID_{idle,blk,atk,por}.webp` and updates `art/manifest.json`.
  `--flip` mirrors single panels that face left; check `art/_ID_preview.png` (magenta backdrop) and delete it after.
  A Nx4 sheet (one character per row) works too: `ID1,ID2,ID3`.
- Manual fixes are fine: e.g. kitsune's `blk` points to its idle image (the generator drew a sword), its portrait was cut
  from its own head; `oni_red` has only a portrait (the body is still drawn by code until a clean sheet arrives).
- `python3 -I art/mkdata.py` writes `art_data.js` from the manifest. Then reinject, build.
- `art_addon.js` draws the art: pose groups idle / wind(→blk) / strike(→atk) / block(→blk) / hit / down, sharp on top of
  the pixel world, kept inside the frame, plus the HUD faces, the hub card, the VS cut-ins and the title duel.
- Which character is which: heroes by `HEROES[i].id` (`musashi` is done; kojiro, tomoe, benkei, masamune, tadakatsu,
  yoshitsune, yukimura are still drawn by code). Ladder foes by `LADDER_ART` in `art_addon.js`, in ladder order:
  ronin ✔, kappa ✔, ronin2 ✔, tengu ✔, yukionna ✔, jorogumo ✔, kitsune ✔, oni_red (portrait only), guard, kenshin,
  shingen, nobunaga, raijin, fujin, oni_blue, shuten.
- `artmap_addon.js` (after itemsx) puts art we already have on more faces: saga heroes with their own art (by `sgid`),
  Tamamo's shadow → kitsune, Ōtakemaru → oni_red, castle guards → guard, market toughs and bounty hunters → ronin/ronin2,
  the sea Ushi-oni in the sea battle (mirrored, legs under the waves). The great oni get `_sc` 1.08–1.14 (only where the
  art has none) so they stand a head above a man. Art figures are 190px×scale; drawn figures are the same body height.
- **Audit:** `python3 -I tools/artaudit.py PAGE.html OUT.json` draws every arena fighter (ladder, hunts, cities, foreign,
  saga, heroes, bounty, market), prints who has art and the height, and writes `OUT_lineup.png` (green label = art).
  The page is written beside `art/` (relative art paths) and Chromium runs with file access, or the art won't load.
- **Next sheets: see `art/BRIEF_characters.md`** (every character described on its own; the owner rejects recolours as originality). Old summary: (2x2 green screen, facing right, same style as the ladder art):
  - saga generals: kiyomasa (Katō, tall eboshi helmet, spear), naomasa / naotaka (Ii red armour), yamagata (red, Takeda),
    baba, kansuke (one-eyed strategist), kakizaki, shibata, mitsuhide / hidemitsu (Akechi, blue), otani (white hood,
    leper general), ukon (Takayama), yoshimoto (Imagawa, court robe, blackened teeth), ranmaru (young page), shinsuke,
    kajiwara, akaho (red rider), raider (bandit chief), gonta (gravedigger), junkai (banner monk), gokei (pagoda monk),
    noshadow (monk), goemon (Ishikawa, thief), foxman (fox mask), kasha (fire cat yokai).
  - province commanders (azuchi, iga, mikawa, mino, omi, shima, wakasa): two or three generic sheets would cover them
    (a daimyō lord, a field commander, an archer commander), mapped in `artmap_addon.js` the way guards are.
  - foreign: Ming general / commander (bunei, imjin, sacheon: one Ming sheet), a Portuguese captain (koan).
  - hunts: raiju (thunder beast), umibozu (black sea monk).
  - sea battle (`seaMon`): isonade (hook-finned shark), umibozu, bakekujira (ghost whale skeleton) — one wide sheet each.
  - advisers (`CAST`, 37 portraits in `drawCast`): only the `por` cell is needed for these.
- **The variant studio (絵師, in `artmap_addon.js`)**: every arena face that had no illustration now gets one, made in the
  browser from our own art: `AMV` names a base body that fits the person and a house colour; `amRecolor` repaints armour
  and cloth (skin and gold lacing kept, dark lacquer tinted, a beast's fur darkened), once per pose, cached as an image.
  Province lords take the body of their helmet type (`AMV_HELM`) in their `armorCol`. The audit now reads 92/92 illustrated.
  When the art chat draws a real sheet for one of them, give it the same id without the `v_` prefix in `AMAP_SG`/
  `AMAP_HUNT` (a real illustration always wins over a variant). Sea battle: Umibōzu and Bakekujira use variants too.
- Camp tiles that were flat drawings (sea, castle town, treasury, sumo, trade, tech, court, apothecary, workshop,
  province) are repainted as 16-bit scenes in `SCN` (`amsea`…`amvil`), animated by the normal scene loop. The 武者 tile
  shows your warrior; the wanted poster shows your illustrated face in ink.
- Free sprite packs were checked: the samurai packs online are 64×64 pixel art at another scale and palette, the LPC set
  is CC-BY-SA/GPL (attribution, share-alike) and top-down; opengameart/itch are not reachable from here. Don't mix them in.

## The battlefield (戦場, `senjo_addon.js`): real time, in the manner of WARNO
- Army wars are fought in real time on a 10×8 map (field, siege, sea, board). The core `startWar` still sets the war up
  (doctrines, fleet, kami wind, mercenaries, walls, logistics, `WAR.my/foe.max`); the addon takes over at the first
  `refreshWar` (`WAR.sj=1`), and hands the result back through `warEnd` (`WAR.my.cur`, `WAR.foe.cur`, `WAR.kills`).
- 布陣 deployment: army power → points (`sjBudget`); unit cards with costs and limits (`SJ_COST`, `sjMkCards`); what is not
  deployed stays in reserve and can be called mid-battle (arrives at the HQ after 6 s). Formation (陣形, `SJ_FORM`, the eight
  classic ones) and one stratagem (計略, `SJ_KEI`: night raid, fire attack, ambush, false report) are chosen here.
- Troops (`SJU`, `SJB`, `SJ_RT`), **no firearms anywhere**: ashigaru pikes, archers, stone throwers, cavalry, horse archers,
  samurai, warrior monks, shinobi (stealth scouts), 母衣衆 command riders, 掛矢 gate breakers, 荷駄 supply train; ships
  atakebune / sekibune / kobaya / flagship; gates and yagura.
- Fog of war (`sjVision`), stress and morale (動揺 suppressed, 敗走 routing, the commander's aura rallies), limited arrows
  refilled at the supply train or the HQ, flag zones taken only by command riders or the commander (at sea, any ship),
  first to 120 points wins; also the commander's fall or a broken army. Siege: break a gate, take the keep; the defender
  wins on time.
- Everything the realm built counts (`sjMods`): arms, armour, retainers, stables, horses, spies, walls, rice, research,
  morale, training, the hero's stats, night, weather, doctrines, luck; the player sees the list in the deploy screen.
- Commanders (`SJCO`) fill a meter from damage dealt and taken; a power lasts 20 s and steadies every unit.
- Auto mode (`S.autoFight`) runs the battle in fast simulation (a few seconds). A battle left halfway counts as a
  disorderly retreat (`S.sjPend`). The board rival plays by `emp.wr` in his live row (clamped on read).
- The art chat's `itemsx_addon.js` wraps `sjDrawUnit` and `twMan` for the illustrated soldiers and ships: keep those names.
- Tests: `t24.py he|en` (deploy, touch orders, pause, power, stratagem, all four battle types, auto, retreat),
  `sim24.py N [field|siege|sea|rank]` (AI against AI balance).

## Bloodlust (血気, `kekki_addon.js`): in the duel only
- Hits fill the warrior's cup (pain fills the other's a little); misses, guard and rest cool it. When full, the 血気 button
  under the bushido strike lets loose 修羅 for 3 blows: +35% damage, but no guard, rest, taunt or retreat, and +15% damage
  taken. The foe uses it too (`aiChoose`), and the autopilot lets it loose. Test: `t25.py he|en`.
- The real-time duel (v62, another chat) reaches it through the bridge on the last line of `kekki_addon.js`:
  `KKX={go:kkGo,b:kkB,cool:kkCool,T:KK_TURNS}`. Keep that line; in real time 修羅 lasts three strikes.

## The leaderboard: a weekly season (場所, `season_addon.js`)
- The owner found the career score ("永 never resets") discouraging: a new journey showed the old points and the top was
  out of reach. The bank underneath is untouched, but what is shown and ranked changed:
  - the 🏆 pill on top = this journey only (`runNow()`, the first 15 fields of the record), with your place in the season;
  - 🎌 Season (the default tab) = points earned this week in any journey (`bushido-season`: bank + top − base per journey,
    so a loss and a recovery never count twice and a restored code counts only what it gains from there). It resets on
    Sunday (`SN_EP`), with last week's podium, dan ranks 足軽→将軍 (`SN_LG`), "N more points to pass X", and the rows around
    you when you are below the top 15;
  - This journey = the current journey of every player; 🏯 Hall of fame = each player's best single journey (`rb/rbc`,
    or the journey inside an older row's best snapshot).
- Rows carry `ss, sp` (season), `lss, lsp` (last season), `rb, rbc` (best journey). A season row is believed only if it is a
  whole number within 4× the player's real best + 60000. The streaming board (`liveOnRows`) keeps working; the place and
  the "passed you" news follow the season. Test: `t26.py he|en [page]` (in `runall.sh`).

## Faces and pictures that were still drawn by code (`artmap_addon.js`)
- The court and market portraits (`drawCast`) of people who have art: Nobunaga, Yukimura, Gonbei → guard, Kumagoro →
  ronin2, Ryūzan → ronin (the same faces they have in the arena), over their own scene, at 3× resolution.
- The duel picker and the daily-challenge foe (`x50h<i>` / `x50f<idx>` keys) use the warrior/ladder portraits, preloaded.
- The smithy: every blade grade, armour and horse card gets its picture in a lacquer frame coloured by grade; cards are
  matched by name, so the shop's own filtering and order don't matter. The foal of your stable is the pony, brighter.

## No firearms (house rule)
- The owner wants no guns or cannons anywhere in the game. `tools/nogun.py` rewrites every story line and text that had
  them (Tanegashima becomes the foreign steel 南蛮鉄, Nagashino the palisade of archers and long pikes, the ōzutsu tech the
  seirō siege towers, the sea-monster cannons heavy stones). Run it after merging other work, and never add new ones.
- `tools/merge_live.py LIVE OUT` puts this chat's addons (kekki, senjo, artmap, season) and the no-firearms texts onto a
  live version without touching anything else in it. It prints `WARNING ... differs` when another chat changed one of
  these blocks on the live page: copy the live block into the local file first, then merge (never erase their change).

## Illustrated items (`items_addon.js`, `itemsx_addon.js`)
- Item pictures are `art/i_<key>.webp`, listed in `art/items.json` → `ITEM_DATA` (by `art/mkdata.py`). A 2x2 sheet of four
  different items is cut by `python3 -I art/mkgroup.py SHEET a,b,c,d [--tight]` (top-left, top-right, bottom-left, bottom-right).
- Where each one shows: `b_*` companion beasts, `h_*` horses (by tier), `w_*` / `a_*` / `k_*` forged gear in the armory
  (`k_jingasa` for common helmets, `w_jumonji` for fine spears, katana + `w_wakizashi` together for paired swords),
  `s_*` ships by type on the battlefield (`s_nanban` is the Portuguese carrack at Fukuda Bay and leads nanban trade
  voyages), `u_*` soldiers on the battlefield and in the war scenes (pikes, archers, teppō, cavalry; the commander with
  his banner bearer and drummer in the close-up), `u_ninja` over the shadow-war (ninja clans) page.
- Still drawn by code (no picture yet): samurai, warrior monks, ōzutsu, bow-wielding heroes' weapon.

## Test, publish, deploy
1. `./runall.sh` then wait ~10 minutes; every `r_cr_*`, `r_soak_*` log must end in `ERRORS 0`, `r_t2_*` in the exit
   button text, `r_t10` in `after daily exit …`. `r_t24_*` (the battlefield), `r_t25_*` (bloodlust in the duel) and `r_t26_*` (the season board) must end in `ERRORS 0`. (`t15` is obsolete.) A one-off timeout in `t2` under load: rerun it alone.
2. Anti-cheat: `t21.py` (tampered save writes nothing to the board), `t22.py` (no planted handles, forged restore is
   flagged), `t23.py` (forged daily records refused). No `?dbg`, `window.__` handles or kill switches in `game.html`.
3. Publish the artifact (read it first and merge if someone else published a newer version), passing every new
   `art/*.webp` in `files`.
4. Site: `cd site && python3 -I mksite.py && cp out/index.html /home/claude/bushido-web/index.html`, copy new
   `art/*.webp` into `/home/claude/bushido-web/art/`, commit and push `main`.
5. Commit and push your source changes to `dev` (pull first: another chat works on the same branch).

## House rules
- Reply to the owner only in Hebrew. Everything in the game fits Sengoku Japan (no modern institutions in-world).
- Never show the owner's real name or email anywhere; the public credit is "Bushido Dojo".
- Never write test data to real player rows; tests use the mock database.
- No player may become overpowered; gold sinks and costs stay meaningful; no free-money loops.
- Never overwrite another chat's published version; always build on the latest live one.
