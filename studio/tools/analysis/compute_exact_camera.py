#!/usr/bin/env python3
"""
Compute exact camera keys from reference frame analysis.
For each beat, we know where key elements appear on screen.
We can solve for camera (x, y, zoom) that puts those elements at those screen positions.
"""
import json

W, H = 3840, 1646
SCREEN_CX, SCREEN_CY = W/2, H/2

# From reference analysis - key element screen positions at beat times
# Format: {scene: {element_name: (screen_x, screen_y, world_x, world_y)}}
REFERENCE_ELEMENTS = {
    'hook': {
        # Text band center (from "10,000 YEARS AGO" and "THE WILD COW")
        'text_band_center': (1540, 872.5),
        # Aurochs print center (estimated from dark elements)
        'aurochs_print': (1540, 1120),
    },
    'idea': {
        # Red circle around calf print - huge circle bbox=(1038,72,2044,1262) -> center=(2060, 703)
        'red_circle': (2060, 703),
        # Text band (typed question) center
        'text_band_center': (1920, 719.5),
        # Calf print center
        'calf_print': (1920, 1100),
    },
    'milk': {
        # Red vertical line at left
        'red_line': (127, 1039),
        # "MILK." text center (estimated)
        'milk_text': (1920, 933),
    },
    'timeline': {
        # Text band center
        'text_band_center': (1015, 618.5),
        # Goat print center
        'goat_print': (1015, 1120),
        # Cow print center
        'cow_print': (1331, 1120),
    },
    'genes': {
        # Red ellipse around "9000 BC" - bbox=(292,969,584,253) -> center=(584, 1095.5)
        'red_ellipse': (584, 1095.5),
        # "WE EVOLVED FOR IT." text band 1 center
        'text_band1': (960, 405),  # world x=14050 -> screen x?
        # "LACTASE PERSISTENCE" text band 2 center
        'text_band2': (1920, 684),
        # Spread map center
        'spread_map': (1920, 1075.5),
        # Note card center
        'note_card': (584, 1095),
    },
    'toast': {
        # Red underline - small element at (2287, 821)
        'red_underline': (2287, 821),
        # "THE BRAVEST SNACK" text center
        'text1': (2164, 775),
        # "IN HISTORY." text center
        'text2': (1068, 503.5),
        # Milk pour print center
        'milk_pour': (1068, 1227),
    }
}

# Known world positions of these elements (from world.mjs)
WORLD_POSITIONS = {
    'hook': {
        'text_band_center': (1400, 905),  # "10,000 YEARS AGO" at 800, "YEARS AGO" at 1010, "THE WILD COW" at 1760 -> avg ~1158? Let's use 905 for main text
        'aurochs_print': (1520, 1330),
    },
    'idea': {
        'red_circle': (1520, 1330),  # circle around aurochs? No, this is idea zone. Circle around calf print at (4150, 1230)
        'text_band_center': (4620, 1520),  # typed text at y=1450 and 1590
        'calf_print': (4150, 1230),
    },
    'milk': {
        'red_line': (7300, 870),  # "MILK." text at (7300, 870)
        'milk_text': (7300, 870),
    },
    'timeline': {
        'text_band_center': (10150, 1660),  # "9000 BC" at (10150, 1660)
        'goat_print': (10150, 1180),
        'cow_print': (11500, 1180),
    },
    'genes': {
        'red_ellipse': (10150, 1660),  # ellipse around "9000 BC" at (10150, 1660) - wait that's timeline
        # Actually genes has: note card at (13950, 1150), helix at (13760, 1120), spread map at (15150, 1250)
        # "WE EVOLVED FOR IT." at (14050, 560), "LACTASE PERSISTENCE" at (14050, 730)
        'text_band1': (14050, 560),
        'text_band2': (14050, 730),
        'note_card': (13950, 1150),
        'spread_map': (15150, 1250),
    },
    'toast': {
        'red_underline': (17350, 950),  # underline from (17020,950) to (17680,950)
        'text1': (17350, 620),  # "THE BRAVEST SNACK"
        'text2': (17350, 800),  # "IN HISTORY."
        'milk_pour': (16950, 1300),
    }
}

# For each beat, we have reference screen positions and world positions
# We need to solve for camera (cam_x, cam_y, zoom) such that:
# sx = (wx - cam_x) * zoom + SCREEN_CX
# sy = (wy - cam_y) * zoom + SCREEN_CY

# For each scene, we have multiple constraints. Let's solve for cam_x, cam_y, zoom.

def solve_camera(ref_elements, world_elements):
    """Solve for camera parameters given reference screen positions and world positions."""
    # We have multiple constraints: sx = (wx - cam_x) * zoom + SCREEN_CX
    # For two points: 
    # sx1 = (wx1 - cam_x) * zoom + SCREEN_CX
    # sx2 = (wx2 - cam_x) * zoom + SCREEN_CX
    # Subtract: sx1 - sx2 = (wx1 - wx2) * zoom
    # zoom = (sx1 - sx2) / (wx1 - wx2)
    
    keys = list(ref_elements.keys())
    if len(keys) < 2:
        return None
    
    # Use first two elements to solve for zoom and cam_x, cam_y
    k1, k2 = keys[0], keys[1]
    sx1, sy1 = ref_elements[k1]
    sx2, sy2 = ref_elements[k2]
    wx1, wy1 = world_elements[k1]
    wx2, wy2 = world_elements[k2]
    
    dx_w = wx1 - wx2
    dy_w = wy1 - wy2
    dx_s = sx1 - sx2
    dy_s = sy1 - sy2
    
    zoom_x = dx_s / dx_w if abs(dx_w) > 1 else None
    zoom_y = dy_s / dy_w if abs(dy_w) > 1 else None
    
    zoom = zoom_x if zoom_x is not None else zoom_y
    if zoom is None or abs(zoom) < 1e-6:
        return None
    
    # Now solve for cam_x, cam_y using first point
    cam_x = wx1 - (sx1 - SCREEN_CX) / zoom
    cam_y = wy1 - (sy1 - SCREEN_CY) / zoom
    
    return {"cam_x": cam_x, "cam_y": cam_y, "zoom": zoom}

print("=== Camera solutions per beat ===")
for scene in ['hook', 'idea', 'milk', 'timeline', 'genes', 'toast']:
    if scene in REFERENCE_ELEMENTS and scene in WORLD_POSITIONS:
        ref = REFERENCE_ELEMENTS[scene]
        world = WORLD_POSITIONS[scene]
        # Find common keys
        common = set(ref.keys()) & set(world.keys())
        if len(common) >= 2:
            ref_sub = {k: ref[k] for k in common}
            world_sub = {k: world[k] for k in common}
            sol = solve_camera(ref_sub, world_sub)
            if sol:
                print(f"{scene}: cam=({sol['cam_x']:.1f}, {sol['cam_y']:.1f}) zoom={sol['zoom']:.4f}")
            else:
                print(f"{scene}: Could not solve")
        else:
            print(f"{scene}: Not enough common elements ({common})")

# Now let's also compute what the screen positions WOULD be with our current camera keys
print("\n=== Current camera key screen positions ===")
from math import isclose

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

SCENES = {
    'hook': 0.45,
    'idea': 5.649,
    'milk': 11.725,
    'timeline': 16.673,
    'genes': 21.872,
    'toast': 26.341,
}

print("\nCurrent camera at scene times:")
for name, t in SCENES.items():
    cam = evaluate_rail(camera_keys, t)
    print(f"  {name}: cam=({cam['x']:.1f}, {cam['y']:.1f}) zoom={cam['zoom']:.3f}")

# Now compute where key world elements would appear on screen with current camera
print("\nCurrent screen positions of key elements:")
for scene in ['hook', 'idea', 'milk', 'timeline', 'genes', 'toast']:
    t = SCENES[scene]
    cam = evaluate_rail(camera_keys, t)
    zoom = cam['zoom']
    print(f"\n{scene} (cam=({cam['x']:.1f},{cam['y']:.1f}) zoom={zoom:.3f}):")
    if scene in WORLD_POSITIONS:
        for elem_name, (wx, wy) in WORLD_POSITIONS[scene].items():
            sx = (wx - cam['x']) * zoom + SCREEN_CX
            sy = (wy - cam['y']) * zoom + SCREEN_CY
            print(f"  {elem_name}: world=({wx},{wy}) -> screen=({sx:.1f},{sy:.1f})")

# Now let's see what the REFERENCE screen positions are for these elements
print("\n\nReference screen positions (from analysis):")
for scene in ['hook', 'idea', 'milk', 'timeline', 'genes', 'toast']:
    if scene in REFERENCE_ELEMENTS:
        print(f"\n{scene}:")
        for elem_name, (sx, sy) in REFERENCE_ELEMENTS[scene].items():
            print(f"  {elem_name}: screen=({sx:.1f},{sy:.1f})")