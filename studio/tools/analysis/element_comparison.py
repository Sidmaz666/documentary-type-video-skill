#!/usr/bin/env python3
"""
Detailed element-by-element comparison between reference and our render.
"""
import cv2
import numpy as np

def analyze_image(img, label=""):
    """Extract all elements from an image."""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    h, w = gray.shape
    
    # Red elements
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
                red_elements.append({"cx": cx, "cy": cy, "x": x, "y": y, "w": rw, "h": rh, "area": area})
    
    # Dark elements
    _, dark_thresh = cv2.threshold(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY), 100, 255, cv2.THRESH_BINARY_INV)
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
                dark_elements.append({"cx": cx, "cy": cy, "x": x, "y": y, "w": rw, "h": rh, "area": area})
    
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
                        print_regions.append({"cx": cx, "cy": cy, "x": x, "y": y, "w": rw, "h": rh, "area": area, "aspect": aspect})
    
    # Text bands
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, dark_thresh = cv2.threshold(gray, 100, 255, cv2.THRESH_BINARY_INV)
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
                text_bands.append({"y_start": start, "y_end": i, "center": (start + i) / 2, "height": i - start})
    if in_band and h - start > 15:
        text_bands.append({"y_start": start, "y_end": h, "center": (start + h) / 2, "height": h - start})
    
    # Gold elements
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
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
                gold_elements.append({"cx": cx, "cy": cy, "area": area})
    
    return {
        "red": red_elements,
        "dark": dark_elements,
        "prints": print_regions,
        "text_bands": text_bands,
        "gold": gold_elements
    }

def compare(ref_data, our_data, label):
    print(f"\n=== {label} ===")
    print(f"  Red: ref={len(ref_data['red'])}, our={len(our_data['red'])}")
    print(f"  Dark: ref={len(ref_data['dark'])}, our={len(our_data['dark'])}")
    print(f"  Prints: ref={len(ref_data['prints'])}, our={len(our_data['prints'])}")
    print(f"  Text bands: ref={len(ref_data['text_bands'])}, our={len(our_data['text_bands'])}")
    print(f"  Gold: ref={len(ref_data['gold'])}, our={len(our_data['gold'])}")
    
    # Detailed comparison
    if ref_data['red'] and our_data['red']:
        print("  Red element comparison:")
        for i, (r, o) in enumerate(zip(ref_data['red'][:3], our_data['red'][:3])):
            print(f"  Ref red {i}: ({r['cx']:.1f},{r['cy']:.1f}) area={r['area']:.0f} bbox=({r['x']},{r['y']},{r['w']},{r['h']})")
            print(f"  Our red {i}: ({o['cx']:.1f},{o['cy']:.1f}) area={o['area']:.0f} bbox=({o['x']},{o['y']},{o['w']},{o['h']})")
            dx = o['cx'] - r['cx']
            dy = o['cy'] - r['cy']
            print(f"    Offset: ({dx:.1f}, {dy:.1f})")
    
    if ref_data['prints'] and our_data['prints']:
        print("  Print region comparison:")
        for i, (r, o) in enumerate(zip(ref_data['prints'][:3], our_data['prints'][:3])):
            print(f"  Ref print {i}: ({r['cx']:.1f},{r['cy']:.1f}) bbox=({r['x']},{r['y']},{r['w']},{r['h']}) aspect={r.get('aspect',0):.2f}")
            print(f"  Our print {i}: ({o['cx']:.1f},{o['cy']:.1f}) bbox=({o['x']},{o['y']},{o['w']},{o['h']}) aspect={o.get('aspect',0):.2f}")
            dx = o['cx'] - r['cx']
            dy = o['cy'] - r['cy']
            print(f"    Offset: ({dx:.1f}, {dy:.1f})")
    
    if ref_data['text_bands'] and our_data['text_bands']:
        print("  Text band comparison:")
        for i, (r, o) in enumerate(zip(ref_data['text_bands'][:3], our_data['text_bands'][:3])):
            print(f"  Ref text {i}: y=[{r['y_start']}:{r['y_end']}] center={r['center']:.1f} h={r['height']}")
            print(f"  Our text {i}: y=[{o['y_start']}:{o['y_end']}] center={o['center']:.1f} h={o['height']}")
            dy = o['center'] - r['center']
            print(f"    Center offset: {dy:.1f}")

# Reference data from deep analysis
ref_data_dict = {
    'hook': {
        'frame': 14,
        'red': [],
        'dark': [
            {"cx": 1576.2, "cy": 1168.9, "x": 1560, "y": 1161, "w": 33, "h": 15, "area": 227},
            {"cx": 1422.6, "cy": 1166.6, "x": 1397, "y": 1154, "w": 54, "h": 24, "area": 512},
            {"cx": 1270.4, "cy": 1140.0, "x": 1183, "y": 1126, "w": 157, "h": 28, "area": 1430},
            {"cx": 1979.2, "cy": 1123.8, "x": 1953, "y": 1113, "w": 42, "h": 22, "area": 338},
            {"cx": 1627.4, "cy": 1120.4, "x": 1542, "y": 1024, "w": 174, "h": 120, "area": 1805},
        ],
        'prints': [],
        'text_bands': [{"y_start": 567, "y_end": 1178, "center": 872.5, "height": 611}],
        'gold': []
    },
    'idea': {
        'frame': 169,
        'red': [{"cx": 2077.5, "cy": 711.0, "x": 1038, "y": 72, "w": 2044, "h": 1262, "area": 1927002}],
        'dark': [
            {"cx": 2133.1, "cy": 1173.4, "x": 2106, "y": 1161, "w": 53, "h": 24, "area": 602},
            {"cx": 1892.9, "cy": 1170.0, "x": 1853, "y": 1150, "w": 84, "h": 38, "area": 1318},
            {"cx": 2537.1, "cy": 1137.1, "x": 2518, "y": 1128, "w": 40, "h": 20, "area": 365},
            {"cx": 2494.9, "cy": 1130.5, "x": 2479, "y": 1116, "w": 34, "h": 29, "area": 268},
            {"cx": 1653.6, "cy": 1128.8, "x": 1519, "y": 1107, "w": 264, "h": 43, "area": 3846},
        ],
        'prints': [
            {"cx": 385.9, "cy": 514.9, "x": 342, "y": 425, "w": 92, "h": 176, "area": 0, "aspect": 0.52},
            {"cx": 755.9, "cy": 508.2, "x": 712, "y": 419, "w": 92, "h": 175, "area": 0, "aspect": 0.53},
            {"cx": 1517.5, "cy": 456.0, "x": 1431, "y": 398, "w": 169, "h": 136, "area": 0, "aspect": 1.24},
            {"cx": 439.4, "cy": 330.4, "x": 397, "y": 279, "w": 82, "h": 118, "area": 0, "aspect": 0.69},
            {"cx": 1040.9, "cy": 160.5, "x": 938, "y": 0, "w": 206, "h": 338, "area": 0, "aspect": 0.61},
        ],
        'text_bands': [{"y_start": 0, "y_end": 1439, "center": 719.5, "height": 1439}],
        'gold': [{"cx": 0, "cy": 0, "area": 0}]
    },
    'milk': {
        'frame': 352,
        'red': [{"cx": 127.4, "cy": 1039.0, "x": 0, "y": 656, "w": 212, "h": 740, "area": 23313}],
        'dark': [],
        'prints': [],
        'text_bands': [],
        'gold': []
    },
    'timeline': {
        'frame': 500,
        'red': [],
        'dark': [
            {"cx": 2045.6, "cy": 834.4, "x": 1989, "y": 787, "w": 114, "h": 96, "area": 10362},
            {"cx": 1017.1, "cy": 619.4, "x": 795, "y": 344, "w": 445, "h": 564, "area": 195846},
            {"cx": 1331.3, "cy": 619.0, "x": 1272, "y": 341, "w": 119, "h": 557, "area": 58740},
            {"cx": 1502.2, "cy": 649.8, "x": 1424, "y": 338, "w": 237, "h": 557, "area": 71494},
            {"cx": 1809.3, "cy": 609.9, "x": 1681, "y": 329, "w": 297, "h": 560, "area": 120963},
        ],
        'prints': [
            {"cx": 2045.6, "cy": 834.6, "x": 1990, "y": 787, "w": 113, "h": 96, "area": 0, "aspect": 1.18},
            {"cx": 1820.2, "cy": 704.8, "x": 1692, "y": 449, "w": 286, "h": 440, "area": 0, "aspect": 0.65},
        ],
        'text_bands': [{"y_start": 329, "y_end": 908, "center": 618.5, "height": 579}],
        'gold': []
    },
    'genes': {
        'frame': 656,
        'red': [
            {"cx": 589.3, "cy": 1094.2, "x": 292, "y": 969, "w": 584, "h": 253, "area": 111424},
            {"cx": 1455.9, "cy": 794.2, "x": 1156, "y": 780, "w": 580, "h": 46, "area": 4990},
            {"cx": 2622.9, "cy": 525.7, "x": 2620, "y": 520, "w": 9, "h": 13, "area": 22},
            {"cx": 2591.8, "cy": 508.7, "x": 2586, "y": 506, "w": 12, "h": 6, "area": 37},
        ],
        'dark': [
            {"cx": 729.9, "cy": 1088.4, "x": 710, "y": 1054, "w": 45, "h": 69, "area": 2672},
            {"cx": 797.4, "cy": 1088.1, "x": 778, "y": 1053, "w": 48, "h": 71, "area": 1350},
            {"cx": 588.0, "cy": 1088.0, "x": 563, "y": 1053, "w": 51, "h": 71, "area": 2876},
            {"cx": 516.7, "cy": 1088.0, "x": 492, "y": 1053, "w": 51, "h": 71, "area": 2872},
            {"cx": 445.7, "cy": 1088.0, "x": 421, "y": 1053, "w": 51, "h": 71, "area": 2871},
        ],
        'prints': [
            {"cx": 2269.3, "cy": 703.9, "x": 2214, "y": 668, "w": 125, "h": 85, "area": 0, "aspect": 1.47},
        ],
        'text_bands': [
            {"y_start": 313, "y_end": 497, "center": 405.0, "height": 184},
            {"y_start": 498, "y_end": 870, "center": 684.0, "height": 372},
            {"y_start": 931, "y_end": 1220, "center": 1075.5, "height": 289},
        ],
        'gold': [{"cx": 0, "cy": 0, "area": 0}] * 57
    },
    'toast': {
        'frame': 790,
        'red': [
            {"cx": 2287.7, "cy": 821.7, "x": 2282, "y": 816, "w": 12, "h": 12, "area": 86},
            {"cx": 2164.1, "cy": 775.6, "x": 1968, "y": 622, "w": 318, "h": 272, "area": 6060},
            {"cx": 1068.0, "cy": 503.5, "x": 928, "y": 497, "w": 280, "h": 13, "area": 3042},
        ],
        'dark': [
            {"cx": 1068.9, "cy": 1206.9, "x": 873, "y": 1091, "w": 393, "h": 272, "area": 61880},
            {"cx": 1069.5, "cy": 1054.9, "x": 896, "y": 1051, "w": 347, "h": 8, "area": 1996},
            {"cx": 2168.4, "cy": 888.0, "x": 2150, "y": 871, "w": 41, "h": 36, "area": 758},
            {"cx": 1068.1, "cy": 858.0, "x": 884, "y": 854, "w": 370, "h": 9, "area": 2216},
            {"cx": 1921.1, "cy": 657.8, "x": 1894, "y": 632, "w": 57, "h": 51, "area": 1908},
        ],
        'prints': [
            {"cx": 1068.8, "cy": 1227.3, "x": 873, "y": 1095, "w": 393, "h": 268, "area": 0, "aspect": 1.47},
            {"cx": 1068.3, "cy": 702.2, "x": 873, "y": 570, "w": 392, "h": 268, "area": 0, "aspect": 1.46},
        ],
        'text_bands': [{"y_start": 416, "y_end": 1363, "center": 889.5, "height": 947}],
        'gold': [{"cx": 0, "cy": 0, "area": 0}] * 2
    }
}

# Load our renders
our_frames = {
    'hook': cv2.imread("D:/YOUTUBE/ExTest/studio/projects/001-the-bravest-snack-in-history/frames/still_0_467.png"),
    'idea': cv2.imread("D:/YOUTUBE/ExTest/studio/projects/001-the-bravest-snack-in-history/frames/still_5_633.png"),
    'milk': cv2.imread("D:/YOUTUBE/ExTest/studio/projects/001-the-bravest-snack-in-history/frames/still_11_733.png"),
    'timeline': cv2.imread("D:/YOUTUBE/ExTest/studio/projects/001-the-bravest-snack-in-history/frames/still_16_667.png"),
    'genes': cv2.imread("D:/YOUTUBE/ExTest/studio/projects/001-the-bravest-snack-in-history/frames/still_21_867.png"),
    'toast': cv2.imread("D:/YOUTUBE/ExTest/studio/projects/001-the-bravest-snack-in-history/frames/still_26_333.png"),
}

def analyze_image_full(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    h, w = gray.shape
    
    # Red elements
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
                red_elements.append({"cx": cx, "cy": cy, "x": x, "y": y, "w": rw, "h": rh, "area": area})
    
    # Dark elements
    _, dark_thresh = cv2.threshold(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY), 100, 255, cv2.THRESH_BINARY_INV)
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
                dark_elements.append({"cx": cx, "cy": cy, "x": x, "y": y, "w": rw, "h": rh, "area": area})
    
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
                        print_regions.append({"cx": cx, "cy": cy, "x": x, "y": y, "w": rw, "h": rh, "area": area, "aspect": aspect})
    
    # Text bands
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, dark_thresh = cv2.threshold(gray, 100, 255, cv2.THRESH_BINARY_INV)
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
                text_bands.append({"y_start": start, "y_end": i, "center": (start + i) / 2, "height": i - start})
    if in_band and h - start > 15:
        text_bands.append({"y_start": start, "y_end": h, "center": (start + h) / 2, "height": h - start})
    
    # Gold elements
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
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
                gold_elements.append({"cx": cx, "cy": cy, "area": area})
    
    return {
        "red": red_elements,
        "dark": dark_elements,
        "prints": print_regions,
        "text_bands": text_bands,
        "gold": gold_elements
    }

for name in ['hook', 'idea', 'milk', 'timeline', 'genes', 'toast']:
    ref = ref_data_dict[name]
    our_img = our_frames[name]
    if our_img is None:
        print(f"{name}: NO IMAGE")
        continue
    our_data = analyze_image_full(our_img)
    
    print(f"\n{'='*60}")
    print(f"{name.upper()} - Frame {ref['frame']}")
    print(f"{'='*60}")
    
    compare(ref, our_data, name)