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

## Test, publish, deploy
1. `./runall.sh` then wait ~10 minutes; every `r_cr_*`, `r_soak_*` log must end in `ERRORS 0`, `r_t2_*` in the exit
   button text, `r_t10` in `after daily exit …`. (`t15` is obsolete.) A one-off timeout in `t2` under load: rerun it alone.
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
