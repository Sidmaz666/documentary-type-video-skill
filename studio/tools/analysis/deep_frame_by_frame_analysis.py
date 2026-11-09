#!/usr/bin/env python3
"""
DEEP frame-by-frame analysis of reference video.
Extract EVERY detail: exact positions, sizes, timings, animations, text, elements.
"""
import cv2
import numpy as np
import json
from pathlib import Path

FRAMES_DIR = Path("D:/YOUTUBE/ExTest/frames/ref_dense")
OUT_FILE = Path("D:/YOUTUBE/ExTest/studio/projects/001-the-bravest-snack-in-history/deep_analysis.json")

def analyze_frame_detailed(frame_idx):
    """Extract ALL visual details from a single frame."""
    fpath = FRAMES_DIR / f"ref_{frame_idx:04d}.png"
    img = cv2.imread(str(fpath))
    if img is None:
        return None
    
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    h, w = gray.shape
    
    # 1. RED elements (circles, lines, underlines, arrows, highlights)
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    red_mask1 = cv2.inRange(hsv, np.array([0, 50, 50]), np.array([10, 255, 255]))
    red_mask2 = cv2.inRange(hsv, np.array([170, 50, 50]), np.array([180, 255, 255]))
    red_mask = cv2.bitwise_or(red_mask1, red_mask2)
    red_contours, _ = cv2.findContours(red_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    red_elements = []
    for c in red_contours:
        area = cv2.contourArea(c)
        if area > 10:
            M = cv2.moments(c)
            if M['m00'] > 0:
                cx = M['m10'] / M['m00']
                cy = M['m01'] / M['m00']
                x, y, rw, rh = cv2.boundingRect(c)
                red_elements.append({
                    "cx": float(cx), "cy": float(cy),
                    "x": int(x), "y": int(y), "w": int(rw), "h": int(rh),
                    "area": float(area)
                })
    
    # 2. DARK INK elements (hand-drawn strokes, text, silhouettes)
    _, dark_thresh = cv2.threshold(gray, 100, 255, cv2.THRESH_BINARY_INV)
    dark_contours, _ = cv2.findContours(dark_thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    dark_elements = []
    for c in dark_contours:
        area = cv2.contourArea(c)
        if area > 200:
            M = cv2.moments(c)
            if M['m00'] > 0:
                cx = M['m10'] / M['m00']
                cy = M['m01'] / M['m00']
                x, y, rw, rh = cv2.boundingRect(c)
                dark_elements.append({
                    "cx": float(cx), "cy": float(cy),
                    "x": int(x), "y": int(y), "w": int(rw), "h": int(rh),
                    "area": float(area)
                })
    
    # 3. PRINT/PHOTO regions (rectangular frames with content)
    # Look for rectangular contours with aspect ratio ~4:3 or 3:4
    _, all_thresh = cv2.threshold(gray, 50, 255, cv2.THRESH_BINARY_INV)
    all_contours, _ = cv2.findContours(all_thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    print_regions = []
    for c in all_contours:
        area = cv2.contourArea(c)
        if area > 5000:
            x, y, rw, rh = cv2.boundingRect(c)
            aspect = rw / rh if rh > 0 else 0
            if 0.5 < aspect < 2.0:  # roughly rectangular
                # Check if it has internal detail (not just a solid block)
                roi = gray[y:y+rh, x:x+rw]
                if roi.size > 0 and np.std(roi) > 15:
                    M = cv2.moments(c)
                    if M['m00'] > 0:
                        cx = M['m10'] / M['m00']
                        cy = M['m01'] / M['m00']
                        print_regions.append({
                            "cx": float(cx), "cy": float(cy),
                            "x": int(x), "y": int(y), "w": int(rw), "h": int(rh),
                            "area": float(area), "aspect": float(aspect)
                        })
    
    # 4. TEXT BANDS (horizontal high-frequency bands)
    h_proj = np.sum(dark_thresh, axis=1)
    text_bands = []
    in_band = False
    start = 0
    for i, val in enumerate(h_proj):
        if val > w * 0.03 and not in_band:
            in_band = True
            start = i
        elif val <= w * 0.03 and in_band:
            in_band = False
            if i - start > 15:
                text_bands.append({
                    "y_start": start, "y_end": i, 
                    "center": (start + i) / 2,
                    "height": i - start
                })
    if in_band and h - start > 15:
        text_bands.append({
            "y_start": start, "y_end": h, 
            "center": (start + h) / 2,
            "height": h - start
        })
    
    # 5. HORIZONTAL LINES (paper rules)
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
                h_lines.append(float((y1 + y2) / 2))
    
    # 6. GOLD/YELLOW elements (highlights, accents)
    gold_mask = cv2.inRange(hsv, np.array([15, 50, 100]), np.array([35, 255, 255]))
    gold_contours, _ = cv2.findContours(gold_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    gold_elements = []
    for c in gold_contours:
        area = cv2.contourArea(c)
        if area > 50:
            M = cv2.moments(c)
            if M['m00'] > 0:
                cx = M['m10'] / M['m00']
                cy = M['m01'] / M['m00']
                gold_elements.append({
                    "cx": float(cx), "cy": float(cy), "area": float(area)
                })
    
    return {
        "frame": frame_idx,
        "t": frame_idx / 30.0,
        "red_elements": red_elements,
        "dark_elements": dark_elements[:30],  # limit
        "print_regions": print_regions[:10],
        "text_bands": text_bands,
        "h_lines": h_lines,
        "gold_elements": gold_elements
    }

def main():
    # Analyze EVERY frame at beat times + transitions
    # Key frames: every frame from 0-30 (hook), around beats, and every 5 frames elsewhere
    key_frames = set()
    
    # Every frame for first 2 seconds (hook setup)
    for i in range(0, 60):
        key_frames.add(i)
    
    # Every 2 frames around beats
    beat_frames = [14, 169, 352, 500, 656, 790]
    for bf in beat_frames:
        for i in range(bf - 30, bf + 30):
            if 0 <= i < 976:
                key_frames.add(i)
    
    # Every 5 frames for rest
    for i in range(0, 976, 5):
        key_frames.add(i)
    
    key_frames = sorted(key_frames)
    print(f"Analyzing {len(key_frames)} key frames...")
    
    all_analysis = []
    for frame_idx in key_frames:
        feat = analyze_frame_detailed(frame_idx)
        if feat:
            all_analysis.append(feat)
        if len(all_analysis) % 50 == 0:
            print(f"  processed {len(all_analysis)}/{len(key_frames)}")
    
    with open(OUT_FILE, "w") as f:
        json.dump(all_analysis, f, indent=2)
    print(f"Saved deep analysis for {len(all_analysis)} frames to {OUT_FILE}")

if __name__ == "__main__":
    main()