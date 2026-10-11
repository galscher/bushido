"""Turn an AI-generated green-screen sprite sheet (2x2: idle, overhead, slash, portrait) into game sprites.
usage: python3 mksheet.py SHEET.png ID [--mirror] [--sc 1.0]
The background is removed by flood fill from the sheet edges (so a green creature keeps its colours), ground shadows
are dropped, the cells are split on the empty gutters, the sprites are normalised to the idle height and saved as WebP,
and art/manifest.json is updated."""
import sys, json, os, argparse
import numpy as np
from PIL import Image, ImageFilter, ImageOps
from scipy import ndimage as ndi

HERE = os.path.dirname(os.path.abspath(__file__))


TIGHT = False


def key_mask(a):
    h, w, _ = a.shape
    edge = np.concatenate([a[:6].reshape(-1, 3), a[-6:].reshape(-1, 3), a[:, :6].reshape(-1, 3), a[:, -6:].reshape(-1, 3)])
    bg = np.median(edge, axis=0)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    d = np.sqrt(((a - bg) ** 2).sum(-1))
    bglike = (d < 34) if TIGHT else ((d < 48) | ((g > r + 45) & (g > b + 45) & (g > 110)))
    shadow = (g >= 30) & (g > r + 12) & (g > b + 12) & (g < bg[1] + 12) & (d < (75 if TIGHT else 125))
    if TIGHT:
        # green character on a green backdrop: the dark line art is the wall the backdrop may not cross
        lum = r * .3 + g * .59 + b * .11
        wall = ndi.binary_dilation(lum < 95, iterations=3)
        lab, n = ndi.label((bglike | shadow) & ~wall)
        border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
        bgm = np.isin(lab, list(border))
        grow = ndi.binary_dilation(bgm, iterations=4) & (bglike | shadow)
        bgm = bgm | grow
        fg = ~bgm
        fl, fn = ndi.label(fg)
        if fn:
            sizes = ndi.sum(fg, fl, range(1, fn + 1))
            keep = np.zeros(fn + 1, bool)
            keep[1:] = sizes > 250
            fg = keep[fl]
        return ndi.binary_fill_holes(fg), bg
    lab, n = ndi.label(bglike | shadow)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    fg = ~np.isin(lab, list(border))
    fl, fn = ndi.label(fg)
    if fn:
        sizes = ndi.sum(fg, fl, range(1, fn + 1))
        keep = np.zeros(fn + 1, bool)
        keep[1:] = sizes > 250
        fg = keep[fl]
    # enclosed gaps (between an arm and the body, between hair strands) that are the flat backdrop colour are background too
    strict = np.zeros_like(fg) if TIGHT else ((((d < 30) | ((d < 60) & (g > np.maximum(r, b) + 40))) if TIGHT else ((d < 30) | ((d < 60) & (g > np.maximum(r, b) + 40)) | ((g > r + 45) & (g > b + 45) & (g > 110)))) & fg)
    hl, hn = ndi.label(strict)
    if hn:
        hs = ndi.sum(strict, hl, range(1, hn + 1))
        drop = np.zeros(hn + 1, bool)
        drop[1:] = hs > 4
        fg = fg & ~drop[hl]
    return fg, bg


def split(occ, lo, hi):
    best = cur = 0
    bs = st = lo
    for i in range(lo, hi):
        if occ[i] < 0.001:
            if cur == 0:
                st = i
            cur += 1
            if cur > best:
                best, bs = cur, st
        else:
            cur = 0
    return bs + best // 2 if best else (lo + hi) // 2


def splits(occ, n):
    """n-1 cut points, each the middle of the widest empty gutter near the expected boundary"""
    L = len(occ)
    cuts = []
    for i in range(1, n):
        c = round(L * i / n)
        cuts.append(split(occ, max(0, c - L // (2 * n)), min(L, c + L // (2 * n))))
    return [0] + cuts + [L]


def save_char(ident, imgs, mirror, sc, man):
    if mirror:
        imgs = {k: ImageOps.mirror(v) for k, v in imgs.items()}
    s = 520 / imgs['idle'].height
    man[ident] = {}
    if sc != 1.0:
        man[ident]['_sc'] = sc
    for k, im in imgs.items():
        if k == 'por':
            f = 640 / max(im.size)
            im = im.resize((max(1, round(im.width * f)), max(1, round(im.height * f))), Image.LANCZOS)
            fn = f'{ident}_por.webp'
            im.save(os.path.join(HERE, fn), 'WEBP', quality=88, method=6, alpha_quality=100)
            man[ident]['por'] = {'src': 'art/' + fn, 'keyed': 1}
            continue
        im = im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)
        A = np.asarray(im)[..., 3] > 128
        h, w = A.shape
        band = A[int(h * .5):int(h * .62)]
        cols = band.sum(0)
        ax = float((cols * np.arange(w)).sum() / max(1, cols.sum())) / w
        fn = f'{ident}_{k}.webp'
        im.save(os.path.join(HERE, fn), 'WEBP', quality=88, method=6, alpha_quality=100)
        man[ident][k] = {'src': 'art/' + fn, 'ax': round(ax, 3), 'w': w, 'h': h, 'hs': round(h / 520, 3)}
        print(ident, k, im.size, 'ax', round(ax, 3), 'hs', round(h / 520, 3))
    prev = Image.new('RGBA', (sum(i.width for i in imgs.values()) + 60, max(i.height for i in imgs.values()) + 20), (200, 60, 200, 255))
    x = 10
    for k in ('idle', 'blk', 'atk', 'por'):
        im = imgs[k]
        prev.alpha_composite(im, (x, 10))
        x += im.width + 10
    prev.convert('RGB').save(os.path.join(HERE, f'_{ident}_preview.png'))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('sheet')
    ap.add_argument('ident', help='one id for a 2x2 sheet, or comma-separated ids, one per row of a Nx4 sheet')
    ap.add_argument('--mirror', default='', help='"all", or comma-separated ids to mirror')
    ap.add_argument('--sc', type=float, default=1.0)
    ap.add_argument('--tight', action='store_true', help='green characters: key only colours close to the backdrop')
    ap.add_argument('--flip', default='', help='comma-separated panels to mirror, e.g. idle,blk,por (after --mirror)')
    o = ap.parse_args()
    ids = o.ident.split(',')
    flips = set(x for x in o.flip.split(',') if x)
    global TIGHT
    TIGHT = o.tight
    mir = set(ids) if o.mirror == 'all' else set(x for x in o.mirror.split(',') if x)
    a = np.asarray(Image.open(o.sheet).convert('RGB')).astype(np.float32)
    H, W, _ = a.shape
    fg, bg = key_mask(a)
    out = a.copy()
    band = fg & ~ndi.binary_erosion(fg, iterations=7)
    mx = np.maximum(out[..., 0], out[..., 2])
    spill = band & (out[..., 1] > mx + 6) & (not TIGHT)
    out[..., 1][spill] = mx[spill] + (out[..., 1][spill] - mx[spill]) * 0.12
    rgba = np.dstack([np.clip(out, 0, 255), fg * 255.0]).astype(np.uint8)
    man_path = os.path.join(HERE, 'manifest.json')
    man = json.load(open(man_path)) if os.path.exists(man_path) else {}
    if len(ids) == 1:
        ys = split(fg.mean(1), int(H * .3), int(H * .7))
        cells = []
        for (y0, y1) in ((0, ys), (ys, H)):
            xs = split(fg[y0:y1].mean(0), int(W * .25), int(W * .75))
            cells += [(0, xs, y0, y1), (xs, W, y0, y1)]
        grid = [dict(zip(('idle', 'blk', 'atk', 'por'), cells))]
    else:
        rows = splits(fg.mean(1), len(ids))
        grid = []
        for r in range(len(ids)):
            y0, y1 = rows[r], rows[r + 1]
            cs = splits(fg[y0:y1].mean(0), 4)
            grid.append({k: (cs[j], cs[j + 1], y0, y1) for j, k in enumerate(('idle', 'blk', 'atk', 'por'))})
    for ident, cells in zip(ids, grid):
        imgs = {}
        for k, (x0, x1, y0, y1) in cells.items():
            im = Image.fromarray(rgba[y0:y1, x0:x1], 'RGBA')
            bb = im.getbbox()
            imgs[k] = im.crop(bb) if bb else im
        imgs = {k: (ImageOps.mirror(v) if k in flips else v) for k, v in imgs.items()}
        save_char(ident, imgs, ident in mir, o.sc, man)
        print(ident, 'cells', cells)
    json.dump(man, open(man_path, 'w'), indent=1)
    print('bg', bg)


if __name__ == '__main__':
    main()
