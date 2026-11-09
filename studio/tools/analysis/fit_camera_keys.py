#!/usr/bin/env python3
"""
Fit Catmull-Rom camera keys to canonical rail data.
Uses the world coordinate system: the camera looks at world (x,y) with zoom.
From camera.mjs: screen_center = (W/2, H/2) -> world (cam.x, cam.y)
A world point (wx, wy) maps to screen: sx = (wx - cam.x) * zoom + W/2

The canonical rail gives us frame-to-frame screen transforms.
We can estimate the camera world position by tracking a fixed world point.

But simpler: the camera keys in timings.mjs are at known zone X centers.
Let's fit a smooth Catmull-Rom through the zone centers at their scene times.
"""
import json
import numpy as np

# Zone X centers from world.mjs
ZONE_X = {
    'hook': 1400,
    'idea': 4500,
    'milk': 7700,
    'timeline': 10900,
    'genes': 14400,
    'toast': 17300,
}

# Scene times from timings.mjs
SCENES = {
    'hook': 0.45,
    'idea': 5.649,
    'milk': 11.725,
    'timeline': 16.673,
    'genes': 21.872,
    'toast': 26.341,
}

# Current camera keys
current_keys = [
    {"t": 0.0,   "x": 1150,  "y": 1150, "zoom": 0.96},
    {"t": 3.3,   "x": 1520,  "y": 1130, "zoom": 1.02},
    {"t": 5.65,  "x": 4320,  "y": 1100, "zoom": 1.0},
    {"t": 9.9,   "x": 4620,  "y": 1060, "zoom": 1.05},
    {"t": 11.35, "x": 4680,  "y": 1060, "zoom": 1.05},
    {"t": 12.35, "x": 7560,  "y": 1100, "zoom": 0.98},
    {"t": 15.2,  "x": 7950,  "y": 1080, "zoom": 1.0},
    {"t": 16.68, "x": 10820, "y": 1120, "zoom": 1.0},
    {"t": 19.8,  "x": 11100, "y": 1120, "zoom": 1.0},
    {"t": 21.87, "x": 14060, "y": 1090, "zoom": 1.0},
    {"t": 24.9,  "x": 14180, "y": 1090, "zoom": 1.0},
    {"t": 26.34, "x": 17260, "y": 1100, "zoom": 1.0},
    {"t": 31.35, "x": 17390, "y": 1120, "zoom": 1.04},
    {"t": 32.54, "x": 14500, "y": 1220, "zoom": 0.5},
]

# The zone centers should be where the camera x is when the scene is active
# Let's adjust the keys so that at each scene time, cam.x ≈ zone_x
# We'll do a simple optimization: move the keys at scene times to zone centers

def catmull_rom(p0, p1, p2, p3, u):
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
    u = (t - a['t']) / (b['t'] - a['t'])
    p0 = k[max(0, i - 1)]
    p3 = k[min(len(k) - 1, i + 2)]
    return {
        'x': catmull_rom(p0['x'], a['x'], b['x'], p3['x'], u),
        'y': catmull_rom(p0['y'], a['y'], b['y'], p3['y'], u),
        'zoom': catmull_rom(p0['zoom'], a['zoom'], b['zoom'], p3['zoom'], u),
    }

# Check current alignment
print("Current camera at scene times:")
for name, t in SCENES.items():
    c = evaluate_rail(current_keys, t)
    target_x = ZONE_X[name]
    print(f"  {name}: t={t:.3f}, cam.x={c['x']:.0f}, target={target_x}, diff={c['x']-target_x:.0f}")

# The zone centers are roughly matched. Let's optimize the keys at scene boundaries.
# We'll create new keys that force cam.x = zone_x at scene times.

# Build new key list: for each scene, add a key at scene time with x=zone_x
# Also keep the transition keys between scenes
new_keys = []
scene_names = ['hook', 'idea', 'milk', 'timeline', 'genes', 'toast']

# Start key
new_keys.append({"t": 0.0, "x": ZONE_X['hook'], "y": 1150, "zoom": 0.96})

# Drift key before idea
new_keys.append({"t": SCENES['hook'] + 0.2, "x": ZONE_X['hook'] + 200, "y": 1130, "zoom": 1.02})

# Idea scene
new_keys.append({"t": SCENES['idea'], "x": ZONE_X['idea'], "y": 1100, "zoom": 1.0})
# Hold
new_keys.append({"t": SCENES['idea'] + 4.0, "x": ZONE_X['idea'] + 300, "y": 1060, "zoom": 1.05})

# Milk scene
new_keys.append({"t": SCENES['milk'], "x": ZONE_X['milk'], "y": 1100, "zoom": 0.98})
new_keys.append({"t": SCENES['milk'] + 3.0, "x": ZONE_X['milk'] + 400, "y": 1080, "zoom": 1.0})

# Timeline scene
new_keys.append({"t": SCENES['timeline'], "x": ZONE_X['timeline'], "y": 1120, "zoom": 1.0})
new_keys.append({"t": SCENES['timeline'] + 3.0, "x": ZONE_X['timeline'] + 300, "y": 1120, "zoom": 1.0})

# Genes scene
new_keys.append({"t": SCENES['genes'], "x": ZONE_X['genes'], "y": 1090, "zoom": 1.0})
new_keys.append({"t": SCENES['genes'] + 3.0, "x": ZONE_X['genes'] + 120, "y": 1090, "zoom": 1.0})

# Toast scene
new_keys.append({"t": SCENES['toast'], "x": ZONE_X['toast'], "y": 1100, "zoom": 1.0})
new_keys.append({"t": SCENES['toast'] + 5.0, "x": ZONE_X['toast'] + 130, "y": 1120, "zoom": 1.04})

# Tail pull-back
new_keys.append({"t": 32.54, "x": 14500, "y": 1220, "zoom": 0.5})

print("\nProposed new keys:")
for k in new_keys:
    print(f"  {{ t: {k['t']:.2f}, x: {k['x']:.0f}, y: {k['y']:.0f}, zoom: {k['zoom']:.2f} }},")

# Verify
print("\nVerification with new keys:")
for name, t in SCENES.items():
    c = evaluate_rail(new_keys, t)
    target_x = ZONE_X[name]
    print(f"  {name}: t={t:.3f}, cam.x={c['x']:.0f}, target={target_x}, diff={c['x']-target_x:.0f}")

# Write updated timings.mjs
with open("D:/YOUTUBE/ExTest/studio/projects/001-the-bravest-snack-in-history/timings.mjs", "r") as f:
    content = f.read()

# Replace cameraKeys array
import re
keys_str = "cameraKeys: [\n"
for k in new_keys:
    keys_str += f"    {{ t: {k['t']:.2f},   x: {k['x']:.0f},  y: {k['y']:.0f}, zoom: {k['zoom']:.2f} }},\n"
keys_str += "  ],"

# Find and replace
pattern = r'cameraKeys:\s*\[[\s\S]*?\]'
content = re.sub(pattern, keys_str, content)

with open("D:/YOUTUBE/ExTest/studio/projects/001-the-bravest-snack-in-history/timings.mjs", "w") as f:
    f.write(content)

print("\nUpdated timings.mjs")