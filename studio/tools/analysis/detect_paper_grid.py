#!/usr/bin/env python3
"""
Analyze reference frames at beat times to detect paper rule lines and estimate camera Y position.
The paper has horizontal rules every 118px in world coordinates.
"""
import cv2
import numpy as np
from pathlib import Path

FRAMES_DIR = Path("D:/YOUTUBE/ExTest/frames/ref_dense")

# Beat frames
beat_frames = {
    'hook': 14,
    'idea': 169,
    'milk': 352,
    'timeline': 500,
    'genes': 656,
    'toast': 790,
}

def detect_horizontal_lines(img):
    """Detect horizontal lines using Hough transform."""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    # Enhance horizontal lines
    edges = cv2.Canny(gray, 30, 100, apertureSize=3)
    lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=100, 
                           minLineLength=200, maxLineGap=20)
    if lines is None:
        return []
    horizontal = []
    for line in lines:
        x1, y1, x2, y2 = line[0] if len(line.shape) == 2 else line
        angle = np.abs(np.arctan2(y2 - y1, x2 - x1))
        if angle < 0.1 or angle > np.pi - 0.1:  # nearly horizontal
            horizontal.append((y1 + y2) / 2)
    return horizontal

for name, frame_idx in beat_frames.items():
    fpath = FRAMES_DIR / f"ref_{frame_idx:04d}.png"
    img = cv2.imread(str(fpath))
    lines = detect_horizontal_lines(img)
    if lines:
        lines = sorted(lines)
        print(f"{name} (frame {frame_idx}): {len(lines)} horizontal lines detected")
        print(f"  Y positions (top 5): {lines[:5]}")
        print(f"  Y positions (bottom 5): {lines[-5:]}")
        # Spacing
        if len(lines) > 1:
            spacings = np.diff(lines)
            print(f"  Avg spacing: {np.mean(spacings):.1f}px")
    else:
        print(f"{name} (frame {frame_idx}): No horizontal lines detected")

# Also check a few frames in between for camera Y movement
print("\n--- Camera Y movement analysis ---")
for frame_idx in [14, 44, 74, 104, 134, 164, 194, 224, 254, 284, 314, 344, 374, 404, 434, 464, 494, 524, 554, 584, 614, 644, 674, 704, 734, 764, 794, 824, 854, 884, 914, 944, 974]:
    fpath = FRAMES_DIR / f"ref_{frame_idx:04d}.png"
    img = cv2.imread(str(fpath))
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    # Sample a horizontal strip in the middle to detect paper texture movement
    h, w = gray.shape
    strip = gray[h//2, :]
    # Find periodic pattern (paper rules every 118px in world, but scaled)
    # Use FFT to find dominant frequency
    f = np.fft.fft(strip.astype(float) - np.mean(strip))
    mag = np.abs(f[:len(f)//2])
    # Find peaks
    peaks = np.where(mag > np.percentile(mag, 99))[0]
    if len(peaks) > 0:
        freq = peaks[0]
        period = len(strip) / freq if freq > 0 else 0
        print(f"Frame {frame_idx:4d}: dominant period={period:.1f}px")
    else:
        print(f"Frame {frame_idx:4d}: no clear periodicity")