#!/usr/bin/env python3
# trace.py — image → simplified polylines JSON for the rotoscope/stencil workflow.
# Turns a reference image (photo prop, film frame, plate) into handStroke-ready
# point lists: Canny edges → findContours → approxPolyDP simplification.
# Output JSON: { source, width, height, imageSize:{w,h}, params, polylines:[[ [x,y],... ]] }
#
# Usage:
#   python studio/tools/rotoscope/trace.py <input.png> --out trace.json \
#       [--canny 60 180] [--simplify 0.006] [--min-pts 12] [--blur 3]
#
# The JSON is consumed engine-side by studio/engine/trace.mjs (loadTrace/drawTrace).
import argparse, json, math, sys
import cv2
import numpy as np


def main():
    ap = argparse.ArgumentParser(description='Trace bitmap → simplified polylines JSON')
    ap.add_argument('input', help='input image (png/jpg)')
    ap.add_argument('--out', required=True, help='output JSON path')
    ap.add_argument('--canny', nargs=2, type=float, default=[60.0, 180.0], metavar=('LOW', 'HIGH'))
    ap.add_argument('--simplify', type=float, default=0.006, help='approxPolyDP epsilon as fraction of perimeter')
    ap.add_argument('--min-pts', type=int, default=12, help='drop polylines shorter than this')
    ap.add_argument('--blur', type=int, default=3, help='gaussian kernel (odd int; 0/1 = off)')
    ap.add_argument('--scale', type=float, default=1.0, help='downscale factor before tracing (coords are rescaled back)')
    args = ap.parse_args()

    img = cv2.imread(args.input, cv2.IMREAD_GRAYSCALE)
    if img is None:
        sys.exit(f'error: cannot read {args.input}')
    orig_h, orig_w = img.shape
    scale = args.scale if 0 < args.scale <= 1 else 1.0
    if scale != 1.0:
        img = cv2.resize(img, (max(1, int(orig_w * scale)), max(1, int(orig_h * scale))), interpolation=cv2.INTER_AREA)

    blur = args.blur if args.blur and args.blur % 2 == 1 else 0
    if blur >= 3:
        img = cv2.GaussianBlur(img, (blur, blur), 0)

    edges = cv2.Canny(img, args.canny[0], args.canny[1])
    contours, _ = cv2.findContours(edges, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)

    polylines = []
    inv = 1.0 / scale if scale != 1.0 else 1.0
    for c in contours:
        if len(c) < args.min_pts:
            continue
        peri = cv2.arcLength(c, closed=True)
        eps = args.simplify * peri
        approx = cv2.approxPolyDP(c, eps, closed=False)
        if len(approx) < 2:
            continue
        pts = [[round(float(p[0][0]) * inv, 1), round(float(p[0][1]) * inv, 1)] for p in approx]
        polylines.append(pts)

    # longest lines first — stable draw order for staggered reveals
    polylines.sort(key=lambda p: sum(math.dist(p[i], p[i + 1]) for i in range(len(p) - 1)), reverse=True)

    out = {
        'source': args.input,
        'width': orig_w,
        'height': orig_h,
        'params': {'canny': args.canny, 'simplify': args.simplify, 'minPts': args.min_pts, 'blur': blur, 'scale': scale},
        'polylines': polylines,
    }
    with open(args.out, 'w', encoding='utf-8') as f:
        json.dump(out, f)
    total = sum(len(p) for p in polylines)
    print(f'wrote {args.out}: {len(polylines)} polylines, {total} points, from {orig_w}x{orig_h}')


if __name__ == '__main__':
    main()
