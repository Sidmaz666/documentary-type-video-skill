#!/usr/bin/env python3
"""
Analyze canonical frames to extract camera rail by detecting 118px paper rule grid.
Outputs camera_rail.json with per-frame similarity transform.
"""
import cv2
import numpy as np
import json
import os
from pathlib import Path

FRAMES_DIR = Path("D:/YOUTUBE/ExTest/frames/canon_dense")
OUT_FILE = Path("D:/YOUTUBE/ExTest/studio/projects/001-the-bravest-snack-in-history/camera_rail.json")
RULE_SPACING = 118  # pixels

def detect_grid_fft(img_gray):
    """Detect grid spacing and orientation via FFT."""
    h, w = img_gray.shape
    # Take central region to avoid edges
    roi = img_gray[h//4:3*h//4, w//4:3*w//4]
    f = np.fft.fft2(roi)
    fshift = np.fft.fftshift(f)
    mag = np.log(np.abs(fshift) + 1)
    # Find peaks corresponding to 118px spacing
    # Frequency = 1/118 cycles per pixel
    return mag

def estimate_transform(prev_img, curr_img):
    """Estimate similarity transform between two frames using ORB features."""
    orb = cv2.ORB_create(5000)
    kp1, des1 = orb.detectAndCompute(prev_img, None)
    kp2, des2 = orb.detectAndCompute(curr_img, None)
    if des1 is None or des2 is None or len(des1) < 10 or len(des2) < 10:
        return None
    bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
    matches = bf.match(des1, des2)
    matches = sorted(matches, key=lambda x: x.distance)
    if len(matches) < 20:
        return None
    pts1 = np.float32([kp1[m.queryIdx].pt for m in matches[:50]]).reshape(-1,1,2)
    pts2 = np.float32([kp2[m.trainIdx].pt for m in matches[:50]]).reshape(-1,1,2)
    # Estimate similarity (translation + rotation + scale)
    M, _ = cv2.estimateAffinePartial2D(pts1, pts2, method=cv2.RANSAC)
    if M is None:
        return None
    # Decompose M = [s*R | t]
    tx, ty = M[0,2], M[1,2]
    a, b = M[0,0], M[0,1]
    c, d = M[1,0], M[1,1]
    scale = np.sqrt(a*a + b*b)
    rotation = np.arctan2(b, a)
    return {"tx": float(tx), "ty": float(ty), "scale": float(scale), "rotation": float(rotation)}

def main():
    frames = sorted(FRAMES_DIR.glob("frame_*.png"))
    print(f"Found {len(frames)} frames")
    rail = []
    prev_gray = None
    for i, fpath in enumerate(frames):
        img = cv2.imread(str(fpath))
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        t = i * 0.5  # 2 fps sampling
        entry = {"t": t, "frame": fpath.name}
        if prev_gray is not None:
            transform = estimate_transform(prev_gray, gray)
            if transform:
                entry.update(transform)
        rail.append(entry)
        prev_gray = gray
        if i % 10 == 0:
            print(f"  processed {i}/{len(frames)}")
    with open(OUT_FILE, "w") as f:
        json.dump(rail, f, indent=2)
    print(f"Saved camera rail to {OUT_FILE}")

if __name__ == "__main__":
    main()