#!/usr/bin/env python3
"""
Comprehensive frame-by-frame analysis of reference video.
Extracts camera transform, zone content positions, and visual features per frame.
"""
import cv2
import numpy as np
import json
from pathlib import Path

FRAMES_DIR = Path("D:/YOUTUBE/ExTest/frames/ref_dense")
OUT_FILE = Path("D:/YOUTUBE/ExTest/studio/projects/001-the-bravest-snack-in-history/frame_analysis.json")

def extract_frame_features(frame_idx):
    """Extract detailed features from a single frame."""
    fpath = FRAMES_DIR / f"ref_{frame_idx:04d}.png"
    img = cv2.imread(str(fpath))
    if img is None:
        return None
    
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    h, w = gray.shape
    
    # 1. Detect horizontal lines (paper rules)
    edges = cv2.Canny(gray, 30, 100, apertureSize=3)
    lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=80, 
                           minLineLength=w//3, maxLineGap=10)
    h_lines = []
    if lines is not None:
        for line in lines:
            coords = line[0] if len(line.shape) == 2 else line
            x1, y1, x2, y2 = coords
            angle = np.abs(np.arctan2(y2 - y1, x2 - x1))
            if angle < 0.05 or angle > np.pi - 0.05:
                h_lines.append((y1 + y2) / 2)
    
    # 2. Find content centroids (dark regions)
    _, thresh = cv2.threshold(gray, 80, 255, cv2.THRESH_BINARY_INV)
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    centroids = []
    for c in contours:
        area = cv2.contourArea(c)
        if area > 500:  # filter noise
            M = cv2.moments(c)
            if M['m00'] > 0:
                cx = M['m10'] / M['m00']
                cy = M['m01'] / M['m00']
                centroids.append({"x": float(cx), "y": float(cy), "area": float(area)})
    
    # 3. Detect red elements (circles, lines, underlines) - use HSV
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    red_mask1 = cv2.inRange(hsv, np.array([0, 50, 50]), np.array([10, 255, 255]))
    red_mask2 = cv2.inRange(hsv, np.array([170, 50, 50]), np.array([180, 255, 255]))
    red_mask = cv2.bitwise_or(red_mask1, red_mask2)
    red_contours, _ = cv2.findContours(red_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    red_centroids = []
    for c in red_contours:
        area = cv2.contourArea(c)
        if area > 20:
            M = cv2.moments(c)
            if M['m00'] > 0:
                cx = M['m10'] / M['m00']
                cy = M['m01'] / M['m00']
                red_centroids.append({"x": float(cx), "y": float(cy), "area": float(area)})
    
    # 4. Text regions (high contrast horizontal bands)
    # Look for horizontal bands of high frequency content
    h_proj = np.sum(thresh, axis=1)
    text_bands = []
    in_band = False
    start = 0
    for i, val in enumerate(h_proj):
        if val > w * 0.1 and not in_band:
            in_band = True
            start = i
        elif val <= w * 0.1 and in_band:
            in_band = False
            if i - start > 10:
                text_bands.append({"y_start": start, "y_end": i, "center": (start + i) / 2})
    if in_band and h - start > 10:
        text_bands.append({"y_start": start, "y_end": h, "center": (start + h) / 2})
    
    # 5. Overall brightness/contrast stats
    mean_brightness = np.mean(gray)
    std_brightness = np.std(gray)
    
    return {
        "frame": frame_idx,
        "t": frame_idx / 30.0,
        "h_lines": h_lines[:20],  # limit
        "centroids": centroids[:20],
        "red_centroids": red_centroids[:20],
        "text_bands": text_bands,
        "brightness": float(mean_brightness),
        "contrast": float(std_brightness)
    }

def main():
    # Analyze every 2nd frame for speed (488 frames)
    all_features = []
    for frame_idx in range(0, 976, 2):
        feat = extract_frame_features(frame_idx)
        if feat:
            all_features.append(feat)
        if frame_idx % 100 == 0:
            print(f"  processed {frame_idx}/976")
    
    with open(OUT_FILE, "w") as f:
        json.dump(all_features, f, indent=2)
    print(f"Saved analysis for {len(all_features)} frames to {OUT_FILE}")

if __name__ == "__main__":
    main()