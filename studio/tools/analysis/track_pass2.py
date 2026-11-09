"""Pass 2: multi-candidate patch tracker with relaxed MSE gate."""
import json
import numpy as np
from PIL import Image

CACHE = {}
def arr(f):
    if f not in CACHE:
        CACHE[f] = np.asarray(Image.open(f'frames/ref_dense/ref_{f:04d}.png').convert('L')).astype(np.float32)
    return CACHE[f]

def best_of(b, patch, cy, cx, H, W, half, search, step):
    best = (1e12, -1, -1)
    for dy in range(-search, search + 1, step):
        yy = cy + dy
        if yy - half < 0 or yy + half >= H: continue
        row = b[yy - half:yy + half]
        for dx in range(-search, search + 1, step):
            xx = cx + dx
            if xx - half < 0 or xx + half >= W: continue
            e = np.mean((row[:, xx - half:xx + half] - patch) ** 2)
            if e < best[0]:
                best = (e, xx, yy)
    return best

TASKS = [
    ('hook', 40, 150, [(1700, 700), (1500, 800), (1900, 900)]),
    ('idea', 190, 330, [(2300, 700), (2100, 500), (2500, 1000)]),
    ('milk', 380, 480, [(1800, 700), (1600, 500), (2000, 900)]),
    ('timeline', 520, 645, [(900, 600), (1200, 500), (2800, 400)]),
    ('genes', 700, 778, [(2300, 700), (2500, 600), (2000, 900)]),
    ('toast', 800, 940, [(2600, 500), (2200, 400), (2800, 900)]),
]
out = []
for (scene, fA, fB, cands) in TASKS:
    a, b = arr(fA), arr(fB)
    H, W = b.shape
    cands_best = []
    for (cx, cy) in cands:
        patch = a[cy - 60:cy + 60, cx - 60:cx + 60]
        if patch.std() < 5:
            continue
        e, xx, yy = best_of(b, patch, cy, cx, H, W, 60, 1200, 2)
        cands_best.append((e, cx, cy, xx, yy))
    if cands_best:
        e, cx, cy, xx, yy = min(cands_best)
        print(scene, f'patch ({cx},{cy}) -> ({xx},{yy}) delta=({xx-cx},{yy-cy}) err={e:.1f}')
        out.append({'scene': scene, 'ok': e < 3000, 'err': float(e), 'delta': [xx - cx, yy - cy]})
    else:
        out.append({'scene': scene, 'error': 'no candidates'})
        print(scene, 'ALL FAILED')
json.dump(out, open('studio/tools/analysis/track_results.json', 'w'), indent=1)
