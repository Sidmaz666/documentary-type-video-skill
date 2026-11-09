#!/usr/bin/env python3
"""
Accumulate per-frame transforms to get absolute camera position.
Also analyze key frames for scene transitions.
"""
import json
import numpy as np

with open("D:/YOUTUBE/ExTest/studio/projects/001-the-bravest-snack-in-history/camera_rail_dense.json") as f:
    rail = json.load(f)

# Accumulate transforms
# Each frame's transform is relative to previous frame
# We need to compose them
abs_positions = []
cum_tx = 0.0
cum_ty = 0.0
cum_scale = 1.0
cum_rot = 0.0

for i, frame in enumerate(rail):
    if i == 0:
        abs_positions.append({
            "frame": frame["frame"],
            "t": frame["t"],
            "x": 0.0,
            "y": 0.0,
            "scale": 1.0,
            "rotation": 0.0
        })
        continue
    
    # The transform is from prev to curr in screen space
    # Screen translation (tx, ty) corresponds to world translation
    # But we need to account for rotation and scale
    
    # Simpler: assume the transform represents camera movement in world coords
    # The tx, ty are the camera's movement in screen pixels
    # Convert to world: divide by scale, rotate by -rotation
    
    tx = frame["tx"]
    ty = frame["ty"]
    scale = frame["scale"]
    rot = frame["rotation"]
    
    # Convert screen-space translation to world-space
    # Camera moves opposite to screen content
    wx = -tx / cum_scale
    wy = -ty / cum_scale
    
    # Rotate by -cum_rot
    cos_r = np.cos(-cum_rot)
    sin_r = np.sin(-cum_rot)
    wx_r = wx * cos_r - wy * sin_r
    wy_r = wx * sin_r + wy * cos_r
    
    cum_tx += wx_r
    cum_ty += wy_r
    cum_scale *= scale
    cum_rot += rot
    
    abs_positions.append({
        "frame": frame["frame"],
        "t": frame["t"],
        "x": float(cum_tx),
        "y": float(cum_ty),
        "scale": float(cum_scale),
        "rotation": float(cum_rot)
    })

# Print key frames
print("Key frames (every 30 frames = 1 second):")
for p in abs_positions:
    if p["frame"] % 30 == 0:
        print(f"  t={p['t']:.2f}s: world_pos=({p['x']:.1f}, {p['y']:.1f}), scale={p['scale']:.4f}, rot={p['rotation']:.4f}rad")

# Save
with open("D:/YOUTUBE/ExTest/studio/projects/001-the-bravest-snack-in-history/camera_rail_absolute.json", "w") as f:
    json.dump(abs_positions, f, indent=2)

print("\nSaved absolute camera rail")