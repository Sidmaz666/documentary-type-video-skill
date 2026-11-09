#!/usr/bin/env python3
"""
Analyze reference frames at beat times to determine exact camera framing.
Measure where zone content centers are in screen coordinates.
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

# Beat frames (frame indices)
BEAT_FRAMES = {
    'hook': 14,
    'idea': 169,
    'milk': 352,
    'timeline': 500,
    'genes': 656,
    'toast': 790,
}

W, H = 3840, 1646

def find_content_center(img, zone_name):
    """Find the center of main content in a frame using adaptive thresholding."""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Try different thresholds to find content
    best_center = None
    best_area = 0
    
    for thresh_val in [60, 80, 100, 120]:
        _, thresh = cv2.threshold(gray, thresh_val, 255, cv2.THRESH_BINARY_INV)
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        for c in contours:
            area = cv2.contourArea(c)
            if area > 1000:
                M = cv2.moments(c)
                if M['m00'] > 0:
                    cx = M['m10'] / M['m00']
                    cy = M['m01'] / M['m00']
                    if area > best_area:
                        best_area = area
                        best_center = (cx, cy)
    
    # Also try edge-based detection
    edges = cv2.Canny(gray, 50, 150)
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    for c in contours:
        area = cv2.contourArea(c)
        if area > 5000:
            M = cv2.moments(c)
            if M['m00'] > 0:
                cx = M['m10'] / M['m00']
                cy = M['m01'] / M['m00']
                if area > best_area:
                    best_area = area
                    best_center = (cx, cy)
    
    return best_center

print("=== Content centers at beat frames ===")
for name, frame_idx in BEAT_FRAMES.items():
    fpath = FRAMES_DIR / f"ref_{frame_idx:04d}.png"
    img = cv2.imread(str(fpath))
    center = find_content_center(img, name)
    if center:
        dx = center[0] - W/2
        dy = center[1] - H/2
        print(f"{name} (frame {frame_idx}): screen center=({center[0]:.1f}, {center[1]:.1f}), offset=({dx:.1f}, {dy:.1f})")
    else:
        print(f"{name} (frame {frame_idx}): NO CENTER FOUND")

# Now let's also check the red elements (circles, lines, underlines) at each beat
print("\n=== Red element positions at beat frames ===")
for name, frame_idx in BEAT_FRAMES.items():
    fpath = FRAMES_DIR / f"ref_{frame_idx:04d}.png"
    img = cv2.imread(str(fpath))
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    red_mask1 = cv2.inRange(hsv, np.array([0, 50, 50]), np.array([10, 255, 255]))
    red_mask2 = cv2.inRange(hsv, np.array([170, 50, 50]), np.array([180, 255, 255]))
    red_mask = cv2.bitwise_or(red_mask1, red_mask2)
    red_contours, _ = cv2.findContours(red_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    red_centers = []
    for c in red_contours:
        area = cv2.contourArea(c)
        if area > 30:
            M = cv2.moments(c)
            if M['m00'] > 0:
                cx = M['m10'] / M['m00']
                cy = M['m01'] / M['m00']
                red_centers.append((cx, cy, area))
    if red_centers:
        print(f"{name}: {len(red_centers)} red elements")
        for cx, cy, area in sorted(red_centers, key=lambda x: -x[2])[:5]:
            print(f"  ({cx:.1f}, {cy:.1f}) area={area:.0f}")

# Check text regions (horizontal bands with high frequency)
print("\n=== Text band positions ===")
for name, frame_idx in BEAT_FRAMES.items():
    fpath = FRAMES_DIR / f"ref_{frame_idx:04d}.png"
    img = cv2.imread(str(fpath))
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 100, 255, cv2.THRESH_BINARY_INV)
    h_proj = np.sum(thresh, axis=1)
    in_band = False
    start = 0
    bands = []
    for i, val in enumerate(h_proj):
        if val > W * 0.05 and not in_band:
            in_band = True
            start = i
        elif val <= W * 0.05 and in_band:
            in_band = False
            if i - start > 15:
                bands.append((start, i, (start + i) / 2))
    if in_band and H - start > 15:
        bands.append((start, H, (start + H) / 2))
    print(f"{name}: {len(bands)} text bands")
    for s, e, c in bands:
        print(f"  y=[{s}:{e}] center={c:.1f}")