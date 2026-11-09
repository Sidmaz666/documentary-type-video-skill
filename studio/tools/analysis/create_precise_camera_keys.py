#!/usr/bin/env python3
"""
Create precise camera keys from dense camera analysis.
Convert screen-space relative transforms to absolute world camera positions.
"""
import json
import numpy as np

with open("D:/YOUTUBE/ExTest/studio/projects/001-the-bravest-snack-in-history/camera_rail_dense.json") as f:
    dense = json.load(f)

# The dense rail gives per-frame screen-space transforms (tx, ty, scale, rotation)
# These are relative to previous frame. We need to accumulate to get absolute camera position.

# Screen center in reference video
W, H = 3840, 1646

# Accumulate transforms
# The camera in our engine: world point (wx, wy) maps to screen: sx = (wx - cam.x) * zoom + W/2
# A screen translation (tx, ty) means the content moved by (tx, ty) on screen
# This corresponds to camera moving opposite: cam moves by (-tx/zoom, -ty/zoom) in world coords
# But we need to account for rotation

abs_camera = []
cum_tx = 0.0
cum_ty = 0.0
cum_scale = 1.0
cum_rot = 0.0

for i, frame in enumerate(dense):
    if i == 0:
        abs_camera.append({
            "frame": frame["frame"],
            "t": frame["t"],
            "x": 0.0,
            "y": 0.0,
            "zoom": 1.0,
            "rotation": 0.0
        })
        continue
    
    tx = frame["tx"]
    ty = frame["ty"]
    scale = frame["scale"]
    rot = frame["rotation"]
    
    # Convert screen-space translation to world-space camera movement
    # Screen content moves by (tx, ty) -> camera moves opposite
    # In world coords: dx = -tx / cum_scale, dy = -ty / cum_scale
    # Then rotate by -cum_rot
    dx = -tx / cum_scale
    dy = -ty / cum_scale
    cos_r = np.cos(-cum_rot)
    sin_r = np.sin(-cum_rot)
    wx = dx * cos_r - dy * sin_r
    wy = dx * sin_r + dy * cos_r
    
    cum_tx += wx
    cum_ty += wy
    cum_scale *= scale
    cum_rot += rot
    
    abs_camera.append({
        "frame": frame["frame"],
        "t": frame["t"],
        "x": float(cum_tx),
        "y": float(cum_ty),
        "zoom": float(cum_scale),
        "rotation": float(cum_rot)
    })

# Now we have absolute camera position in world coords (relative to frame 0)
# We need to find the actual world origin. The zone centers give us clues.
# At each beat, the camera should be centered on the zone's world X.

# Zone world centers from world.mjs
ZONE_CENTERS = {
    'hook': 1400,
    'idea': 4500,
    'milk': 7700,
    'timeline': 10900,
    'genes': 14400,
    'toast': 17300,
}

BEAT_TIMES = {
    'hook': 0.45,
    'idea': 5.649,
    'milk': 11.725,
    'timeline': 16.673,
    'genes': 21.872,
    'toast': 26.341,
}

# Find camera X at beat times
for name, t in BEAT_TIMES.items():
    # Find closest frame
    idx = int(t * 30)
    if idx < len(abs_camera):
        cam = abs_camera[idx]
        print(f"{name}: t={t:.3f}, cam_x={cam['x']:.1f}, target={ZONE_CENTERS[name]}, diff={cam['x']-ZONE_CENTERS[name]:.1f}")

# The camera X in our coordinate system is relative to frame 0.
# Frame 0 camera is at (0,0) in this relative system.
# We need to find the offset so that at hook time, camera is at hook zone X.
# Let's compute the offset needed.

hook_idx = int(0.45 * 30)
hook_cam = abs_camera[hook_idx]
offset_x = ZONE_CENTERS['hook'] - hook_cam['x']
print(f"\nRequired X offset: {offset_x:.1f}")

# Apply offset to all camera positions
for cam in abs_camera:
    cam['x'] += offset_x

# Verify at all beats
print("\nAfter offset:")
for name, t in BEAT_TIMES.items():
    idx = int(t * 30)
    if idx < len(abs_camera):
        cam = abs_camera[idx]
        print(f"{name}: t={t:.3f}, cam_x={cam['x']:.1f}, target={ZONE_CENTERS[name]}, diff={cam['x']-ZONE_CENTERS[name]:.1f}")

# Also check Y and zoom at beats
print("\nY and Zoom at beats:")
for name, t in BEAT_TIMES.items():
    idx = int(t * 30)
    if idx < len(abs_camera):
        cam = abs_camera[idx]
        print(f"{name}: t={t:.3f}, cam_y={cam['y']:.1f}, zoom={cam['zoom']:.4f}, rot={cam['rotation']:.4f}")

# Now create camera keys at regular intervals (every 0.5s = 15 frames)
# for smooth Catmull-Rom interpolation
keys = []
for cam in abs_camera:
    if cam['frame'] % 15 == 0:  # every 0.5s
        keys.append({
            "t": round(cam['t'], 3),
            "x": round(cam['x']),
            "y": round(cam['y']),
            "zoom": round(cam['zoom'], 3)
        })

# Also ensure we have keys at exact beat times
for name, t in BEAT_TIMES.items():
    idx = int(t * 30)
    if idx < len(abs_camera):
        cam = abs_camera[idx]
        keys.append({
            "t": round(cam['t'], 3),
            "x": round(cam['x']),
            "y": round(cam['y']),
            "zoom": round(cam['zoom'], 3)
        })

# Sort and deduplicate
keys.sort(key=lambda k: k['t'])
deduped = []
for k in keys:
    if not deduped or abs(k['t'] - deduped[-1]['t']) > 0.01:
        deduped.append(k)

print(f"\nTotal camera keys: {len(deduped)}")
for k in deduped[:30]:
    print(f"  {{ t: {k['t']:.2f},   x: {k['x']},  y: {k['y']}, zoom: {k['zoom']:.2f} }},")
if len(deduped) > 30:
    print(f"  ... and {len(deduped)-30} more keys")

# Save for use in timings.mjs
with open("D:/YOUTUBE/ExTest/studio/projects/001-the-bravest-snack-in-history/precise_camera_keys.json", "w") as f:
    json.dump(deduped, f, indent=2)

print("\nSaved precise_camera_keys.json")