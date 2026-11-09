#!/usr/bin/env python3
"""
Analyze reference frames around IDEA and GENES beats to understand animation timing.
"""
import cv2
import numpy as np
import json
from pathlib import Path

FRAMES_DIR = Path("D:/YOUTUBE/ExTest/frames/ref_dense")

def analyze_frame_range(start_frame, end_frame, step=1):
    """Analyze a range of frames for animation progression."""
    results = []
    for frame_idx in range(start_frame, end_frame + 1, step):
        fpath = FRAMES_DIR / f"ref_{frame_idx:04d}.png"
        img = cv2.imread(str(fpath))
        if img is None:
            continue
        
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        
        # Red elements
        red_mask1 = cv2.inRange(hsv, np.array([0, 50, 50]), np.array([10, 255, 255]))
        red_mask2 = cv2.inRange(hsv, np.array([170, 50, 50]), np.array([180, 255, 255]))
        red_mask = cv2.bitwise_or(red_mask1, red_mask2)
        red_contours, _ = cv2.findContours(red_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        red_elements = []
        for c in red_contours:
            area = cv2.contourArea(c)
            if area > 100:
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
        
        # Text bands
        _, dark_thresh = cv2.threshold(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY), 100, 255, cv2.THRESH_BINARY_INV)
        h_proj = np.sum(dark_thresh, axis=1)
        w = dark_thresh.shape[1]
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
                    text_bands.append({"y_start": start, "y_end": i, "center": (start + i) / 2, "height": i - start})
        if in_band and h - start > 15:
            text_bands.append({"y_start": start, "y_end": h, "center": (start + h) / 2, "height": h - start})
        
        # Print regions
        _, all_thresh = cv2.threshold(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY), 50, 255, cv2.THRESH_BINARY_INV)
        all_contours, _ = cv2.findContours(all_thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        print_regions = []
        for c in all_contours:
            area = cv2.contourArea(c)
            if area > 5000:
                x, y, rw, rh = cv2.boundingRect(c)
                aspect = rw / rh if rh > 0 else 0
                if 0.5 < aspect < 2.0:
                    roi = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)[y:y+rh, x:x+rw]
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
        
        results.append({
            "frame": frame_idx,
            "t": frame_idx / 30.0,
            "red": red_elements,
            "text_bands": text_bands,
            "prints": print_regions
        })
    return results

def main():
    # IDEA scene: frames 169-348 (5.63s-11.60s)
    print("Analyzing IDEA scene progression...")
    idea_frames = analyze_frame_range(169, 348, 3)
    
    # GENES scene: frames 656-789 (21.87s-26.30s)
    print("Analyzing GENES scene progression...")
    genes_frames = analyze_frame_range(656, 789, 3)
    
    with open("D:/YOUTUBE/ExTest/studio/projects/001-the-bravest-snack-in-history/animation_analysis.json", "w") as f:
        json.dump({"idea": idea_frames, "genes": genes_frames}, f, indent=2)
    
    print("Done!")

if __name__ == "__main__":
    main()