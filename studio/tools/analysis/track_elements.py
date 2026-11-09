"""Fixed-element screen position tracker (camera-delta estimator).
Template-matches a patch of a zone's anchor print between two reference frames
to remove camera drift uncertainty. Output: screen positions + deltas.
"""
import sys, json
import numpy as np
from PIL import Image

def lum_arr(frame):
    im = np.asarray(Image.open(f'frames/ref_dense/ref_{frame:04d}.png').convert('L')).astype(np.float32)
    return im

def patch_match(a, b, cx, cy, half=60, search=1000, step=1):
    """find patch at (cx,cy) in frame a inside frame b; returns (bx, by, err)"""
    ph = a[cy - half:cy + half, cx - half:cx + half]
    if ph.mean() > 240 or ph.std() < 6:
        return None
    H, W = b.shape
    best = (1e12, 0, 0)
    for dy in range(-search, search + 1, step):
        yy = cy + dy
        if yy - half < 0 or yy + half >= H: continue
        row = b[yy - half:yy + half]
        for dx in range(-search, search + 1, step):
            xx = cx + dx
            if xx - half < 0 or xx + half >= W: continue
            seg = row[:, xx - half:xx + half]
            e = np.mean((seg - ph) ** 2)
            if e < best[0]:
                best = (e, xx, yy)
    return best if best[0] < 400 else None  # reject bad matches (MSE>400 too dirty)

# anchor patches: (scene, frame_a, frame_b, cx, cy) — patches on strong-clean print regions
TASKS = [
    ('hook', 40, 150, 1700, 700),
    ('idea', 180, 330, 2400, 400),
    ('milk', 380, 480, 1800, 500),
    ('timeline', 520, 645, 1300, 300),
    ('genes', 670, 778, 2300, 500),
    ('toast', 800, 940, 2100, 800),
]
out = []
for (scene, fA, fB, cx, cy) in TASKS:
    a, b = lum_arr(fA), lum_arr(fB)
    r = patch_match(a, b, cx, cy)
    if r:
        err, bx, by = r
        out.append({'scene': scene, 'a': fA, 'b': fB, 'a_pos': [cx, cy], 'b_pos': [bx, by],
                    'delta': [bx - cx, by - cy], 'err': float(err)})
        print(scene, f'{fA}->{fB} patch ({cx},{cy}) -> ({bx},{by}) delta=({bx-cx},{by-cy}) err={err:.1f}')
    else:
        out.append({'scene': scene, 'a': fA, 'b': fB, 'error': 'no-match'})
        print(scene, 'NO MATCH')
json.dump(out, open('studio/tools/analysis/track_results.json', 'w'), indent=1)
