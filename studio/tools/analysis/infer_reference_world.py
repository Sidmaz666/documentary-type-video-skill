#!/usr/bin/env python3
"""
Properly solve for camera parameters at each beat using all reference constraints.
Use least squares to find best cam_x, cam_y, zoom for each beat.
"""
import numpy as np

W, H = 3840, 1646
SCREEN_CX, SCREEN_CY = W/2, H/2

SCENES = {
    'hook': 0.45,
    'idea': 5.649,
    'milk': 11.725,
    'timeline': 16.673,
    'genes': 21.872,
    'toast': 26.341,
}

# Reference screen positions for key elements at each beat
REFERENCE = {
    'hook': {
        'text': (1540, 872.5),
        'aurochs': (1540, 1120),
    },
    'idea': {
        'circle': (2060, 703),
        'text': (1920, 719.5),
        'calf': (1920, 1100),
    },
    'milk': {
        'red_line': (127, 1039),
        'milk_text': (1920, 933),
    },
    'timeline': {
        'text': (1015, 618.5),
        'goat': (1015, 1120),
        'cow': (1331, 1120),
    },
    'genes': {
        'ellipse': (584, 1095.5),
        'text1': (960, 405),
        'text2': (1920, 684),
        'map': (1920, 1075.5),
        'note': (584, 1095),
    },
    'toast': {
        'underline': (2287, 821),
        'text1': (2164, 775),
        'text2': (1068, 503.5),
        'milk_pour': (1068, 1227),
    }
}

# World positions of these elements
WORLD = {
    'hook': {
        'text': (1400, 905),
        'aurochs': (1520, 1330),
    },
    'idea': {
        'circle': (4150, 1230),  # circle around calf print
        'text': (4620, 1520),
        'calf': (4150, 1230),
    },
    'milk': {
        'red_line': (7300, 870),
        'milk_text': (7300, 870),
    },
    'timeline': {
        'text': (10150, 1660),
        'goat': (10150, 1180),
        'cow': (11500, 1180),
    },
    'genes': {
        'ellipse': (10150, 1660),  # This is actually timeline's ellipse... genes has helix, note card, spread map
        'text1': (14050, 560),
        'text2': (14050, 730),
        'map': (15150, 1250),
        'note': (13950, 1150),
    },
    'toast': {
        'underline': (17350, 950),
        'text1': (17350, 620),
        'text2': (17350, 800),
        'milk_pour': (16950, 1300),
    }
}

SCREEN_CX, SCREEN_CY = 1920, 823

def solve_camera_least_squares(ref_dict, world_dict):
    """Solve for cam_x, cam_y, zoom using least squares on multiple constraints."""
    # For each element: sx = (wx - cam_x) * zoom + SCREEN_CX
    # sy = (wy - cam_y) * zoom + SCREEN_CY
    # Rearrange: wx * zoom - cam_x * zoom = sx - SCREEN_CX
    #            wy * zoom - cam_y * zoom = sy - SCREEN_CY
    # Unknowns: [cam_x, cam_y, zoom]
    
    A = []
    b = []
    
    for name in ref_dict:
        if name not in world_dict:
            continue
        sx, sy = ref_dict[name]
        wx, wy = world_dict[name]
        
        # x equation: wx * zoom - cam_x * zoom = sx - SCREEN_CX
        # Unknowns: [cam_x, cam_y, zoom]
        # cam_x * (-zoom) + 0 * cam_y + wx * zoom = sx - SCREEN_CX
        # This is nonlinear in zoom. Let's use a different approach.
        
        # sx = (wx - cam_x) * zoom + SCREEN_CX
        # sy = (wy - cam_y) * zoom + SCREEN_CY
        # This is nonlinear. Let's use iterative optimization or assume zoom and solve linear.
        pass
    
    # Alternative: For each pair of points, we can solve for zoom
    names = list(ref_dict.keys())
    if len(names) < 2:
        return None
    
    best_zoom = None
    best_cam = None
    best_error = float('inf')
    
    # Try all pairs to estimate zoom
    for i in range(len(names)):
        for j in range(i+1, len(names)):
            n1, n2 = names[i], names[j]
            sx1, sy1 = ref_dict[n1]
            sx2, sy2 = ref_dict[n2]
            wx1, wy1 = world_dict[n1]
            wx2, wy2 = world_dict[n2]
            
            dx_w = wx1 - wx2
            dy_w = wy1 - wy2
            dx_s = sx1 - sx2
            dy_s = sy1 - sy2
            
            zoom_candidates = []
            if abs(dx_w) > 1:
                zoom_candidates.append(dx_s / dx_w)
            if abs(dy_w) > 1:
                zoom_candidates.append(dy_s / dy_w)
            
            for zoom in zoom_candidates:
                if zoom <= 0 or zoom > 10:
                    continue
                # Solve for cam_x, cam_y using this zoom
                cam_x_vals = []
                cam_y_vals = []
                for name in ref_dict:
                    sx, sy = ref_dict[name]
                    wx, wy = world_dict[name]
                    cam_x = wx - (sx - 1920) / zoom
                    cam_y = wy - (sy - 823) / zoom
                    cam_x_vals.append(cam_x)
                    cam_y_vals.append(cam_y)
                
                cam_x = np.mean(cam_x_vals)
                cam_y = np.mean(cam_y_vals)
                
                # Compute error
                error = 0
                for name in ref_dict:
                    sx, sy = ref_dict[name]
                    wx, wy = world_dict[name]
                    pred_sx = (wx - cam_x) * zoom + 1920
                    pred_sy = (wy - cam_y) * zoom + 823
                    error += (pred_sx - sx)**2 + (pred_sy - sy)**2
                
                if error < best_error:
                    best_error = error
                    best_zoom = zoom
                    best_cam = (cam_x, cam_y)
    
    if best_cam is not None:
        return {"cam_x": best_cam[0], "cam_y": best_cam[1], "zoom": best_zoom, "error": best_error}
    return None

print("=== Optimal camera at each beat ===")
for scene in ['hook', 'idea', 'milk', 'timeline', 'genes', 'toast']:
    if scene in REFERENCE and scene in WORLD:
        ref = REFERENCE[scene]
        world = WORLD[scene]
        sol = solve_camera_least_squares(ref, world)
        if sol:
            print(f"{scene}: cam=({sol['cam_x']:.1f}, {sol['cam_y']:.1f}) zoom={sol['zoom']:.4f} error={sol['error']:.1f}")
            
            # Verify
            print(f"  Predictions:")
            for name in ref:
                sx, sy = ref[name]
                wx, wy = world[name]
                pred_sx = (wx - sol['cam_x']) * sol['zoom'] + 1920
                pred_sy = (wy - sol['cam_y']) * sol['zoom'] + 823
                print(f"  {name}: ref=({sx:.1f},{sy:.1f}) pred=({pred_sx:.1f},{pred_sy:.1f}) err=({pred_sx-sx:.1f},{pred_sy-sy:.1f})")
        else:
            print(f"{scene}: No solution")

print("\n=== Now create smooth camera keys from these beat positions ===")
# We need to create a smooth Catmull-Rom spline through these beat positions
# Plus add some intermediate keys for smooth motion

# Beat positions from optimization
BEAT_CAMS = {
    'hook':   {'t': 0.45,  'x': 1780, 'y': 1045, 'zoom': 1.0},  # from earlier manual calc
    'idea':   {'t': 5.649, 'x': 4367, 'y': 1200, 'zoom': 1.0},
    'milk':   {'t': 11.725, 'x': 7601, 'y': 990, 'zoom': 1.0},
    'timeline': {'t': 16.673, 'x': 11803, 'y': 1323, 'zoom': 1.0},
    'genes':  {'t': 21.872, 'x': 13985, 'y': 1398, 'zoom': 1.0},
    'toast':  {'t': 26.341, 'x': 17602, 'y': 1115, 'zoom': 1.0},
}

# These are the same as our current keys! The issue is that the WORLD positions
# in our WORLD dict don't match the actual world positions used in the reference.
# The reference was created with DIFFERENT world coordinates.

# The real issue: Our world.mjs uses DIFFERENT world coordinates than the original v5.
# The original v5 world.mjs (lost in sandbox wipe) had different positions.

# We need to either:
# 1. Update world.mjs to match the reference world coordinates, OR
# 2. Update camera keys to compensate for our world coordinates

# Option 1 is better: Update world.mjs to use the world coordinates that the reference used.
# We can infer the reference world coordinates from the camera and screen positions.

print("\n=== Inferring reference world coordinates ===")
# For each scene, we know the camera at beat time (from our current keys)
# and the reference screen positions. We can infer the world positions.

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

SCENES = {'hook': 0.45, 'idea': 5.649, 'milk': 11.725, 'timeline': 16.673, 'genes': 21.872, 'toast': 26.341}

print("\n=== Inferring reference world coordinates from camera + reference screen ===")
for scene in ['hook', 'idea', 'milk', 'timeline', 'genes', 'toast']:
    t = SCENES[scene]
    cam = evaluate_rail(camera_keys, t)
    zoom = cam['zoom']
    print(f"\n{scene} (cam=({cam['x']:.1f},{cam['y']:.1f}) zoom={zoom:.3f}):")
    
    if scene in REFERENCE:
        for elem_name, (sx, sy) in REFERENCE[scene].items():
            # sx = (wx - cam_x) * zoom + SCREEN_CX
            # wx = (sx - SCREEN_CX) / zoom + cam_x
            wx = (sx - 1920) / zoom + cam['x']
            wy = (sy - 823) / zoom + cam['y']
            print(f"  {elem_name}: screen=({sx},{sy}) -> inferred world=({wx:.1f},{wy:.1f})")