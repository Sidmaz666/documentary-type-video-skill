#!/usr/bin/env python3
"""
Debug why elements are not appearing. Check camera position and zone alpha at each beat.
"""
import cv2
import numpy as np
import json

# Load the dense camera analysis
with open("D:/YOUTUBE/ExTest/studio/projects/001-the-bravest-snack-in-history/camera_rail_dense.json") as f:
    dense = json.load(f)

# Load timings to get scene times
import json
with open("D:/YOUTUBE/ExTest/studio/projects/001-the-bravest-snack-in-history/assets/timings.json") as f:
    anchors = json.load(f)

scenes = {}
for s in anchors['timings']:
    scenes[s['scene']] = s['start']

print("Scene times:", scenes)

# Zone alpha function from world.mjs
ZONES = ['hook', 'idea', 'milk', 'timeline', 'genes', 'toast']

def smoothstep(edge0, edge1, x):
    t = max(0, min(1, (x - edge0) / (edge1 - edge0))) if edge1 > edge0 else 0
    return t * t * (3 - 2 * t)

def zoneAlpha(i, t):
    last = i == len(ZONES) - 1
    enter = -1 if i == 0 else scenes[ZONES[i]] - 0.5
    exit_t = float('inf') if last else scenes[ZONES[i + 1]] + 0.35
    fadeIn = smoothstep(enter, enter + 0.6, t)
    fadeOut = 1 if last else 1 - smoothstep(exit_t, exit_t + 0.9, t)
    a = max(0, min(1, fadeIn * fadeOut))
    return a

# Check zone alpha at beat frames
beat_frames = [14, 169, 352, 500, 656, 790]
beat_names = ['hook', 'idea', 'milk', 'timeline', 'genes', 'toast']

print("Zone alpha at beat frames:")
for name, frame in zip(beat_names, beat_frames):
    t = frame / 30.0
    for i, z in enumerate(ZONES):
        a = zoneAlpha(i, t)
        if a > 0:
            print(f"  t={t:.3f}: zone {z} alpha={a:.3f}")

# Also check camera position at these frames from dense analysis
print("\nCamera position at beat frames (from dense analysis):")
for name, frame in zip(beat_names, beat_frames):
    if frame < len(dense):
        cam = dense[frame]
        # Accumulate to get absolute
        print(f"  {name} (frame {frame}, t={frame/30:.3f}): tx={cam.get('tx',0):.2f}, ty={cam.get('ty',0):.2f}, scale={cam.get('scale',1):.4f}, rot={cam.get('rotation',0):.6f}")

# Now let's also check the exact camera position from our timings.mjs
# by evaluating the rail at these times
print("\n--- Evaluating our camera rail at beat times ---")
# We need to use the camera.mjs logic. Let me implement it in Python.

def catmullRom(p0, p1, p2, p3, u):
    u2 = u * u
    u3 = u2 * u
    return 0.5 * ((2 * p1) + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u2 + (-p0 + 3 * p1 - 3 * p2 + p3) * u3)

def evaluate_rail(keys, t):
    k = sorted(keys, key=lambda x: x['t'])
    if t <= k[0]['t']: return k[0]
    if t >= k[-1]['t']: return k[-1]
    i = 0
    while i < len(k) - 2 and t >= k[i + 1]['t']:
        i += 1
    a, b = k[i], k[i + 1]
    u = (t - a['t']) / (b['t'] - a['t']) if b['t'] != a['t'] else 0
    p0 = k[max(0, i - 1)]
    p3 = k[min(len(k) - 1, i + 2)]
    return {
        'x': catmullRom(p0['x'], a['x'], b['x'], p3['x'], u),
        'y': catmullRom(p0['y'], a['y'], b['y'], p3['y'], u),
        'zoom': catmullRom(p0['zoom'], a['zoom'], b['zoom'], p3['zoom'], u)
    }

# Current camera keys from timings.mjs
camera_keys = [
    {"t": 0.00,   "x": 1700,  "y": 1150, "zoom": 0.96},
    {"t": 0.45,   "x": 1780,  "y": 1045, "zoom": 1.00},
    {"t": 1.50,   "x": 2200,  "y": 1100, "zoom": 1.02},
    {"t": 3.50,   "x": 3200,  "y": 1140, "zoom": 1.00},
    {"t": 5.65,   "x": 4367,  "y": 1200, "zoom": 1.00},
    {"t": 7.50,   "x": 5200,  "y": 1120, "zoom": 1.00},
    {"t": 9.50,   "x": 6200,  "y": 1080, "zoom": 1.00},
    {"t": 11.72,  "x": 7601,  "y": 990,  "zoom": 1.00},
    {"t": 13.50,  "x": 8800,  "y": 1050, "zoom": 1.00},
    {"t": 15.50,  "x": 10000, "y": 1150, "zoom": 1.00},
    {"t": 16.67,  "x": 11803, "y": 1323, "zoom": 1.00},
    {"t": 18.50,  "x": 12500, "y": 1250, "zoom": 1.00},
    {"t": 20.50,  "x": 13500, "y": 1200, "zoom": 1.00},
    {"t": 21.87,  "x": 13985, "y": 1398, "zoom": 1.00},
    {"t": 23.50,  "x": 15000, "y": 1300, "zoom": 1.00},
    {"t": 25.00,  "x": 16200, "y": 1150, "zoom": 1.00},
    {"t": 26.34,  "x": 17602, "y": 1115, "zoom": 1.00},
    {"t": 29.00,  "x": 18200, "y": 1100, "zoom": 1.02},
    {"t": 31.35,  "x": 18300, "y": 1120, "zoom": 1.04},
    {"t": 32.54,  "x": 14500, "y": 1250, "zoom": 0.50},
]

print("\nOur camera at beat times:")
for name, frame in zip(beat_names, beat_frames):
    t = frame / 30.0
    cam = evaluate_rail(camera_keys, t)
    print(f"  {name} (t={t:.3f}): cam=({cam['x']:.1f}, {cam['y']:.1f}) zoom={cam['zoom']:.3f}")

# Zone centers
ZONE_CENTERS = {
    'hook': (1400, 1100),
    'idea': (4500, 1100),
    'milk': (7700, 1100),
    'timeline': (10900, 1100),
    'genes': (14400, 1100),
    'toast': (17300, 1100),
}

print("\nExpected zone centers vs camera position:")
for name in beat_names:
    t = scenes[name]
    cam = evaluate_rail(camera_keys, t)
    zone = ZONE_CENTERS[name]
    print(f"  {name}: zone=({zone[0]}, {zone[1]}), cam=({cam['x']:.1f}, {cam['y']:.1f}), diff=({cam['x']-zone[0]:.1f}, {cam['y']-zone[1]:.1f})")

# Screen mapping: sx = (wx - cam.x) * zoom + W/2
W, H = 3840, 1646
print("\nWhere zone centers would appear on screen:")
for name in beat_names:
    t = scenes[name]
    cam = evaluate_rail(camera_keys, t)
    zone = ZONE_CENTERS[name]
    sx = (zone[0] - cam['x']) * cam['zoom'] + W/2
    sy = (zone[1] - cam['y']) * cam['zoom'] + H/2
    print(f"  {name}: screen=({sx:.1f}, {sy:.1f})")