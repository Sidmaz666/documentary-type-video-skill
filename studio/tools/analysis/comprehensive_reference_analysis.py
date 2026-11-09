#!/usr/bin/env python3
"""
Comprehensive frame-by-frame analysis of the reference video.
Creates detailed JSON with exact layout, positioning, timing, and animation details.
"""
import cv2
import numpy as np
import json
from pathlib import Path

FRAMES_DIR = Path("D:/YOUTUBE/ExTest/frames/ref_dense")
OUT_FILE = Path("D:/YOUTUBE/ExTest/studio/projects/001-the-bravest-snack-in-history/reference_analysis.json")

# Scene definitions with exact frame ranges
SCENES = {
    'hook': {'start_frame': 0, 'end_frame': 165, 'beat_frame': 14},      # 0.00-5.50s, beat at 14
    'idea': {'start_frame': 169, 'end_frame': 348, 'beat_frame': 169},   # 5.63-11.60s, beat at 169
    'milk': {'start_frame': 352, 'end_frame': 499, 'beat_frame': 352},   # 11.73-16.63s, beat at 352
    'timeline': {'start_frame': 500, 'end_frame': 655, 'beat_frame': 500}, # 16.67-21.83s, beat at 500
    'genes': {'start_frame': 656, 'end_frame': 789, 'beat_frame': 656},   # 21.87-26.30s, beat at 656
    'toast': {'start_frame': 790, 'end_frame': 975, 'beat_frame': 790},   # 26.33-32.50s, beat at 790
}

W, H = 3840, 1646
SCREEN_CX, SCREEN_CY = W/2, H/2

def analyze_frame_detailed(frame_idx):
    """Extract ALL visual details from a single frame."""
    fpath = FRAMES_DIR / f"ref_{frame_idx:04d}.png"
    img = cv2.imread(str(fpath))
    if img is None:
        return None
    
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    h, w = gray.shape
    
    # 1. RED elements (circles, lines, underlines, arrows, highlights)
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
                # Classify red element type
                elem_type = "unknown"
                if area > 100000:
                    elem_type = "circle_or_large_shape"
                elif rw > rh * 3:
                    elem_type = "horizontal_line"
                elif rh > rw * 3:
                    elem_type = "vertical_line"
                elif 0.8 < rw/rh < 1.2 and area > 1000:
                    elem_type = "circle"
                elif rw > 50 and rh < 20:
                    elem_type = "underline"
                red_elements.append({
                    "type": elem_type,
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
    _, all_thresh = cv2.threshold(gray, 50, 255, cv2.THRESH_BINARY_INV)
    all_contours, _ = cv2.findContours(all_thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    print_regions = []
    for c in all_contours:
        area = cv2.contourArea(c)
        if area > 5000:
            x, y, rw, rh = cv2.boundingRect(c)
            aspect = rw / rh if rh > 0 else 0
            if 0.5 < aspect < 2.0:
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
    
    # 6. GOLD/YELLOW elements
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
    
    # 7. BRIGHTNESS/CONTRAST stats
    mean_brightness = np.mean(gray)
    std_brightness = np.std(gray)
    
    return {
        "frame": frame_idx,
        "t": frame_idx / 30.0,
        "red_elements": red_elements,
        "dark_elements": dark_elements[:30],
        "print_regions": print_regions[:10],
        "text_bands": text_bands,
        "h_lines": h_lines,
        "gold_elements": gold_elements,
        "brightness": float(mean_brightness),
        "contrast": float(std_brightness)
    }

def analyze_scene(scene_name, scene_info):
    """Analyze all frames in a scene."""
    print(f"Analyzing {scene_name} (frames {scene_info['start_frame']}-{scene_info['end_frame']})...")
    
    scene_data = {
        "name": scene_name,
        "start_frame": scene_info['start_frame'],
        "end_frame": scene_info['end_frame'],
        "beat_frame": scene_info['beat_frame'],
        "frames": []
    }
    
    # Analyze every 2nd frame in scene, plus beat frame
    frames_to_analyze = set(range(scene_info['start_frame'], scene_info['end_frame'] + 1, 2))
    frames_to_analyze.add(scene_info['beat_frame'])
    
    for frame_idx in sorted(frames_to_analyze):
        if frame_idx < 976:
            feat = analyze_frame_detailed(frame_idx)
            if feat:
                scene_data["frames"].append(feat)
    
    return scene_data

def main():
    all_scenes = []
    for scene_name, scene_info in SCENES.items():
        scene_data = analyze_scene(scene_name, scene_info)
        all_scenes.append(scene_data)
        print(f"  {scene_name}: {len(scene_data['frames'])} frames analyzed")
    
    # Also analyze beat frames in detail
    beat_analysis = {}
    for scene_name, scene_info in SCENES.items():
        bf = scene_info['beat_frame']
        feat = analyze_frame_detailed(bf)
        if feat:
            beat_analysis[scene_name] = feat
    
    output = {
        "video_info": {
            "width": W,
            "height": H,
            "fps": 30,
            "total_frames": 976,
            "duration": 32.533
        },
        "scenes": all_scenes,
        "beat_analysis": beat_analysis
    }
    
    with open(OUT_FILE, "w") as f:
        json.dump(output, f, indent=2)
    print(f"\nSaved comprehensive analysis to {OUT_FILE}")

if __name__ == "__main__":
    main()