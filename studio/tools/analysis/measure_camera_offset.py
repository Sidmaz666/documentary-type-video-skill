#!/usr/bin/env python3
"""
Fine-tune camera keys by analyzing reference frame composition at beat times.
Measure where zone content centers are in the reference frames.
"""
import cv2
import numpy as np
from pathlib import Path

FRAMES_DIR = Path("D:/YOUTUBE/ExTest/frames/ref_dense")

# Zone world centers (from world.mjs)
ZONE_CENTERS = {
    'hook': (1400, 1100),
    'idea': (4500, 1100),
    'milk': (7700, 1100),
    'timeline': (10900, 1100),
    'genes': (14400, 1100),
    'toast': (17300, 1100),
}

# Beat frames
BEAT_FRAMES = {
    'hook': 14,
    'idea': 169,
    'milk': 352,
    'timeline': 500,
    'genes': 656,
    'toast': 790,
}

# Camera viewport: 3840x1646
W, H = 3840, 1646

def find_zone_content_center(img, zone_name):
    """Try to find the center of the main zone content by detecting the largest contour."""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    # Threshold to find dark content (ink)
    _, thresh = cv2.threshold(gray, 100, 255, cv2.THRESH_BINARY_INV)
    # Find contours
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return None
    # Find largest contour by area
    largest = max(contours, key=cv2.contourArea)
    M = cv2.moments(largest)
    if M['m00'] == 0:
        return None
    cx = M['m10'] / M['m00']
    cy = M['m01'] / M['m00']
    return (cx, cy)

for name, frame_idx in BEAT_FRAMES.items():
    fpath = FRAMES_DIR / f"ref_{frame_idx:04d}.png"
    img = cv2.imread(str(fpath))
    center = find_zone_content_center(img, name)
    if center:
        print(f"{name} (frame {frame_idx}): content center = ({center[0]:.1f}, {center[1]:.1f})")
        # Expected: screen center (W/2, H/2) = (1920, 823) should align with zone world center
        # The offset from screen center tells us camera position
        dx = center[0] - W/2
        dy = center[1] - H/2
        print(f"  Offset from screen center: ({dx:.1f}, {dy:.1f})")
    else:
        print(f"{name} (frame {frame_idx}): no content center found")

# Also check a few frames around each beat to see camera drift
print("\n--- Camera drift around beats ---")
for name, frame_idx in BEAT_FRAMES.items():
    for offset in [-15, -10, -5, 0, 5, 10, 15]:
        f = frame_idx + offset
        if 0 <= f < 976:
            fpath = FRAMES_DIR / f"ref_{f:04d}.png"
            img = cv2.imread(str(fpath))
            center = find_zone_content_center(img, name)
            if center:
                dx = center[0] - W/2
                dy = center[1] - H/2
                t = f / 30.0
                print(f"  {name} t={t:.2f}: offset=({dx:.1f}, {dy:.1f})")