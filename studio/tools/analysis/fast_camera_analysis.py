#!/usr/bin/env python3
"""
Fast camera analysis using ORB feature matching on key frames (every 5th frame).
"""
import cv2
import numpy as np
import json
from pathlib import Path

FRAMES_DIR = Path("D:/YOUTUBE/ExTest/frames/ref_dense")
OUT_FILE = Path("D:/YOUTUBE/ExTest/studio/projects/001-the-bravest-snack-in-history/camera_rail_dense.json")

def analyze_features():
    frames = sorted(FRAMES_DIR.glob("ref_*.png"))
    print(f"Found {len(frames)} frames")
    
    # Sample every 3rd frame for speed
    sample_indices = list(range(0, len(frames), 3))
    if sample_indices[-1] != len(frames) - 1:
        sample_indices.append(len(frames) - 1)
    
    rail = []
    prev_img = None
    prev_kp = None
    prev_des = None
    
    orb = cv2.ORB_create(5000)
    bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
    
    for idx, frame_idx in enumerate(sample_indices):
        fpath = frames[frame_idx]
        img = cv2.imread(str(fpath))
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        t = frame_idx / 30.0
        
        kp, des = orb.detectAndCompute(gray, None)
        
        entry = {"frame": frame_idx, "t": t}
        
        if prev_img is not None and des is not None and prev_des is not None and len(des) > 20 and len(prev_des) > 20:
            matches = bf.match(prev_des, des)
            matches = sorted(matches, key=lambda x: x.distance)
            good = matches[:200]
            
            if len(good) >= 30:
                pts1 = np.float32([prev_kp[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
                pts2 = np.float32([kp[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
                M, _ = cv2.estimateAffinePartial2D(pts1, pts2, method=cv2.RANSAC, ransacReprojThreshold=3.0)
                if M is not None:
                    tx, ty = M[0, 2], M[1, 2]
                    a, b = M[0, 0], M[0, 1]
                    c, d = M[1, 0], M[1, 1]
                    scale = np.sqrt(a*a + b*b)
                    rotation = np.arctan2(b, a)
                    entry.update({
                        "tx": float(tx),
                        "ty": float(ty),
                        "scale": float(scale),
                        "rotation": float(rotation)
                    })
                else:
                    entry.update({"tx": 0, "ty": 0, "scale": 1, "rotation": 0})
            else:
                entry.update({"tx": 0, "ty": 0, "scale": 1, "rotation": 0})
        else:
            entry.update({"tx": 0, "ty": 0, "scale": 1, "rotation": 0})
        
        rail.append(entry)
        prev_img = img
        prev_kp = kp
        prev_des = des
        
        if idx % 20 == 0:
            print(f"  processed {idx}/{len(sample_indices)}")
    
    # Interpolate to all frames
    full_rail = []
    for i in range(len(frames)):
        t = i / 30.0
        # Find surrounding samples
        before = [r for r in rail if r['t'] <= t]
        after = [r for r in rail if r['t'] >= t]
        if before and after:
            b = before[-1]
            a = after[0]
            if a['t'] == b['t']:
                interp = b
            else:
                u = (t - b['t']) / (a['t'] - b['t'])
                interp = {
                    "frame": i,
                    "t": t,
                    "tx": b['tx'] + u * (a['tx'] - b['tx']),
                    "ty": b['ty'] + u * (a['ty'] - b['ty']),
                    "scale": b['scale'] + u * (a['scale'] - b['scale']),
                    "rotation": b['rotation'] + u * (a['rotation'] - b['rotation'])
                }
        else:
            interp = {"frame": i, "t": t, "tx": 0, "ty": 0, "scale": 1, "rotation": 0}
        full_rail.append(interp)
    
    with open(OUT_FILE, "w") as f:
        json.dump(full_rail, f, indent=2)
    print(f"Saved dense camera rail to {OUT_FILE}")

if __name__ == "__main__":
    analyze_features()