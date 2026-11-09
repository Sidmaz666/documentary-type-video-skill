#!/usr/bin/env python3
"""
Create new timings.mjs with camera keys matched to reference frame analysis.
Using measured screen positions at each beat to compute exact camera positions.
"""
import json

# Screen and world constants
W, H = 3840, 1646
SCREEN_CX, SCREEN_CY = W/2, H/2

# Zone world centers and main text world Y positions
ZONES = {
    'hook':     {'wx': 1400,  'wy_text': 905,   'wy_zone': 1100, 't': 0.45},
    'idea':     {'wx': 4500,  'wy_text': 1520,  'wy_zone': 1100, 't': 5.649},
    'milk':     {'wx': 7700,  'wy_text': 1230,  'wy_zone': 1100, 't': 11.725},
    'timeline': {'wx': 10900, 'wy_text': 1660,  'wy_zone': 1120, 't': 16.673},
    'genes':    {'wx': 14400, 'wy_text': 560,   'wy_zone': 1090, 't': 21.872},
    'toast':    {'wx': 17300, 'wy_text': 620,   'wy_zone': 1100, 't': 26.341},
}

# Measured screen positions at each beat (from frame analysis)
MEASURED = {
    'hook':     {'sx': 1539.8, 'sy_text': 872.5, 'sy_zone': 878.0},
    'idea':     {'sx': 2052.6, 'sy_text': 719.5, 'sy_zone': 722.6},
    'milk':     {'sx': 2019.0, 'sy_text': 1230,  'sy_zone': 932.6},
    'timeline': {'sx': 1017.1, 'sy_text': 618.5, 'sy_zone': 619.4},
    'genes':    {'sx': 2334.6, 'sy_text': 405.0, 'sy_zone': 514.8},
    'toast':    {'sx': 1618.0, 'sy_text': 889.5, 'sy_zone': 807.2},
}

# Solve for cam.x, cam.y, zoom at each beat
# sx = (wx - cam.x) * zoom + SCREEN_CX
# sy = (wy - cam.y) * zoom + SCREEN_CY
# Two equations (text and zone), three unknowns. Need to assume something.
# Let's use zone center for camera x,y and text for zoom verification.

print("=== Beat camera parameters (assuming zoom=1.0) ===")
for name in ZONES:
    z = ZONES[name]
    m = MEASURED[name]
    cam_x = z['wx'] - (m['sx'] - SCREEN_CX)
    cam_y = z['wy_zone'] - (m['sy_zone'] - SCREEN_CY)
    print(f"{name}: cam_x={cam_x:.1f}, cam_y={cam_y:.1f}, target=({z['wx']}, {z['wy_zone']})")
    print(f"  screen: sx={m['sx']:.1f} (target wx={z['wx']}), sy_zone={m['sy_zone']:.1f} (target wy={z['wy_zone']})")

print("\n=== Now with zoom solved from text position ===")
for name in ZONES:
    z = ZONES[name]
    m = MEASURED[name]
    # Use text position to solve for zoom and cam
    # sy_text = (wy_text - cam.y) * zoom + SCREEN_CY
    # sy_zone = (wy_zone - cam.y) * zoom + SCREEN_CY
    # Subtract: sy_text - sy_zone = (wy_text - wy_zone) * zoom
    # zoom = (sy_text - sy_zone) / (wy_text - wy_zone)
    dz = z['wy_text'] - z['wy_zone']
    ds = m['sy_text'] - m['sy_zone']
    if abs(dz) > 1:
        zoom = ds / dz
        cam_y = z['wy_zone'] - (m['sy_zone'] - SCREEN_CY) / zoom
        cam_x = z['wx'] - (m['sx'] - SCREEN_CX) / zoom
        print(f"{name}: zoom={zoom:.3f}, cam_x={cam_x:.1f}, cam_y={cam_y:.1f}")
    else:
        print(f"{name}: insufficient dy for zoom calc")

print("\n=== Recommended camera keys for timings.mjs ===")
# Create smooth camera keys that hit these positions at beat times
# Use the zoom=1 positions as base, add intermediate keys for smooth motion

# From the zoom=1 calculations:
beat_cams = {
    'hook':     {'t': 0.45,   'x': 1780, 'y': 1125, 'zoom': 1.0},
    'idea':     {'t': 5.649,  'x': 4367, 'y': 1003, 'zoom': 1.0},
    'milk':     {'t': 11.725, 'x': 7601, 'y': 1090, 'zoom': 1.0},
    'timeline': {'t': 16.673, 'x': 11803, 'y': 1120, 'zoom': 1.0},
    'genes':    {'t': 21.872, 'x': 13985, 'y': 1090, 'zoom': 1.0},
    'toast':    {'t': 26.341, 'x': 17602, 'y': 1100, 'zoom': 1.0},
}

# Add intermediate keys for smooth Catmull-Rom
# Start
keys = [
    {'t': 0.0,    'x': 1700, 'y': 1150, 'zoom': 0.96},  # start wider
    {'t': 0.45,   'x': 1780, 'y': 1125, 'zoom': 1.0},   # hook beat
    {'t': 1.5,    'x': 2200, 'y': 1120, 'zoom': 1.02},  # drift right
    {'t': 3.5,    'x': 3200, 'y': 1100, 'zoom': 1.0},   # approach idea
    {'t': 5.649,  'x': 4367, 'y': 1003, 'zoom': 1.0},   # idea beat (cam higher for text)
    {'t': 7.5,    'x': 5200, 'y': 1040, 'zoom': 1.0},   # hold, drift
    {'t': 9.5,    'x': 6200, 'y': 1060, 'zoom': 1.0},   # approach milk
    {'t': 11.725, 'x': 7601, 'y': 1090, 'zoom': 1.0},   # milk beat
    {'t': 13.5,   'x': 8800, 'y': 1100, 'zoom': 1.0},   # follow cow
    {'t': 15.5,   'x': 10000, 'y': 1110, 'zoom': 1.0},  # approach timeline
    {'t': 16.673, 'x': 11803, 'y': 1120, 'zoom': 1.0},  # timeline beat
    {'t': 18.5,   'x': 12500, 'y': 1110, 'zoom': 1.0},  # hold
    {'t': 20.5,   'x': 13500, 'y': 1100, 'zoom': 1.0},  # approach genes
    {'t': 21.872, 'x': 13985, 'y': 1090, 'zoom': 1.0},  # genes beat
    {'t': 23.5,   'x': 15000, 'y': 1100, 'zoom': 1.0},  # hold
    {'t': 25.0,   'x': 16200, 'y': 1100, 'zoom': 1.0},  # approach toast
    {'t': 26.341, 'x': 17602, 'y': 1100, 'zoom': 1.0},  # toast beat
    {'t': 29.0,   'x': 18200, 'y': 1110, 'zoom': 1.02}, # hold, slight zoom
    {'t': 31.35,  'x': 18300, 'y': 1120, 'zoom': 1.04}, # underline
    {'t': 32.54,  'x': 14500, 'y': 1250, 'zoom': 0.5},  # pull-back
]

print("\n=== Final camera keys for timings.mjs ===")
for k in keys:
    print(f"    {{ t: {k['t']:.2f},   x: {k['x']},  y: {k['y']}, zoom: {k['zoom']:.2f} }},")

# Save
with open("D:/YOUTUBE/ExTest/studio/projects/001-the-bravest-snack-in-history/new_camera_keys.json", "w") as f:
    json.dump(keys, f, indent=2)