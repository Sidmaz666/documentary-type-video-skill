#!/usr/bin/env python3
"""
Detailed camera analysis using dense optical flow (Farneback) on all 976 frames.
Tracks the paper rule grid movement to recover per-frame camera transform.
"""
import cv2
import numpy as np
import json
from pathlib import Path

FRAMES_DIR = Path("D:/YOUTUBE/ExTest/frames/ref_dense")
OUT_FILE = Path("D:/YOUTUBE/ExTest/studio/projects/001-the-bravest-snack-in-history/camera_rail_dense.json")

def analyze_optical_flow():
    frames = sorted(FRAMES_DIR.glob("ref_*.png"))
    print(f"Found {len(frames)} frames")
    
    # Read first frame
    prev = cv2.imread(str(frames[0]))
    prev_gray = cv2.cvtColor(prev, cv2.COLOR_BGR2GRAY)
    h, w = prev_gray.shape
    
    rail = []
    # Initialize with identity at frame 0
    rail.append({"frame": 0, "t": 0.0, "tx": 0.0, "ty": 0.0, "scale": 1.0, "rotation": 0.0})
    
    for i in range(1, len(frames)):
        curr = cv2.imread(str(frames[i]))
        curr_gray = cv2.cvtColor(curr, cv2.COLOR_BGR2GRAY)
        
        # Farneback dense optical flow
        flow = cv2.calcOpticalFlowFarneback(prev_gray, curr_gray, None, 
                                            pyr_scale=0.5, levels=3, winsize=21,
                                            iterations=3, poly_n=5, poly_sigma=1.2, flags=0)
        
        # Analyze flow field to estimate similarity transform
        # Sample grid points
        step = 40
        pts1 = []
        pts2 = []
        for y in range(0, h, step):
            for x in range(0, w, step):
                fx, fy = flow[y, x]
                # Only use reliable flow (magnitude > 0.1 and < 50)
                mag = np.sqrt(fx*fx + fy*fy)
                if 0.1 < mag < 50:
                    pts1.append([x, y])
                    pts2.append([x + fx, y + fy])
        
        if len(pts1) > 20:
            pts1 = np.float32(pts1).reshape(-1, 1, 2)
            pts2 = np.float32(pts2).reshape(-1, 1, 2)
            # Estimate affine transform (includes similarity + shear)
            M, _ = cv2.estimateAffinePartial2D(pts1, pts2, method=cv2.RANSAC, ransacReprojThreshold=3.0)
            if M is not None:
                tx, ty = M[0, 2], M[1, 2]
                a, b = M[0, 0], M[0, 1]
                c, d = M[1, 0], M[1, 1]
                scale = np.sqrt(a*a + b*b)
                rotation = np.arctan2(b, a)
                rail.append({
                    "frame": i,
                    "t": i / 30.0,
                    "tx": float(tx),
                    "ty": float(ty),
                    "scale": float(scale),
                    "rotation": float(rotation)
                })
            else:
                rail.append({"frame": i, "t": i / 30.0, "tx": 0, "ty": 0, "scale": 1, "rotation": 0})
        else:
            rail.append({"frame": i, "t": i / 30.0, "tx": 0, "ty": 0, "scale": 1, "rotation": 0})
        
        prev_gray = curr_gray
        if i % 50 == 0:
            print(f"  processed {i}/{len(frames)}")
    
    with open(OUT_FILE, "w") as f:
        json.dump(rail, f, indent=2)
    print(f"Saved dense camera rail to {OUT_FILE}")

if __name__ == "__main__":
    analyze_optical_flow()