"""
FIREWISE-X Computer Vision & Temporal Flame Engine (Model 1 & Model 3)
Analyzes microgravity combustion videos:
- Flame segmentation (color space thresholding & morphological processing)
- Flame geometry metrics (area, perimeter, centroid, bounding box, aspect ratio)
- Temporal flame front tracking & velocity calculation
- Extinction detection & temporal anomaly identification (oscillations, puffing, quench)
"""

import os
import cv2
import numpy as np
import json
from typing import Dict, List, Any, Optional

class FlameVideoAnalyzer:
    def __init__(self, calibration_scale_px_per_cm: float = 30.0):
        """
        Scale: BASS-II duct width is approx 7.6 cm (~230 px), giving ~30 px/cm.
        """
        self.scale = calibration_scale_px_per_cm

    def segment_frame(self, frame: np.ndarray) -> Dict[str, Any]:
        """
        Segment flame in a single video frame.
        Microgravity flames in BASS-II have luminous yellow/orange soot zones 
        or dim blue chemiluminescent leading edges against a dark chamber background.
        """
        h, w = frame.shape[:2]
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)

        # Multi-channel thresholding:
        # High value in gray OR saturated flame color in HSV
        _, thresh_gray = cv2.threshold(gray, 38, 255, cv2.THRESH_BINARY)
        
        # Color mask for yellow/orange/white core
        lower_flame = np.array([5, 60, 60])
        upper_flame = np.array([35, 255, 255])
        mask_color = cv2.inRange(hsv, lower_flame, upper_flame)

        # Blue chemiluminescence mask
        lower_blue = np.array([90, 50, 40])
        upper_blue = np.array([135, 255, 255])
        mask_blue = cv2.inRange(hsv, lower_blue, upper_blue)

        # Combined mask
        combined = cv2.bitwise_or(thresh_gray, mask_color)
        combined = cv2.bitwise_or(combined, mask_blue)

        # Morphological noise removal
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
        cleaned = cv2.morphologyEx(combined, cv2.MORPH_OPEN, kernel, iterations=1)
        cleaned = cv2.morphologyEx(cleaned, cv2.MORPH_CLOSE, kernel, iterations=2)

        # MASK OUT BURNED-IN VIDEO OVERLAY TEXT (Requirement 5)
        # NASA BASS-II videos have burned-in green/white text in top 65px and bottom 55px
        cleaned[0:65, :] = 0
        cleaned[425:, :] = 0

        contours, _ = cv2.findContours(cleaned, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        valid_contours = [c for c in contours if cv2.contourArea(c) > 25]

        if not valid_contours:
            return {
                "detected": False,
                "area_px": 0.0,
                "area_cm2": 0.0,
                "perimeter_px": 0.0,
                "centroid": (w / 2.0, h / 2.0),
                "bbox": (0, 0, 0, 0),
                "aspect_ratio": 0.0,
                "front_x_px": 0.0,
                "mask": cleaned
            }

        # Main flame contour (largest)
        largest_c = max(valid_contours, key=cv2.contourArea)
        total_area = sum(cv2.contourArea(c) for c in valid_contours)
        perimeter = cv2.arcLength(largest_c, True)
        bx, by, bw, bh = cv2.boundingRect(largest_c)

        M = cv2.moments(largest_c)
        if M["m00"] != 0:
            cx = float(M["m10"] / M["m00"])
            cy = float(M["m01"] / M["m00"])
        else:
            cx, cy = float(bx + bw / 2), float(by + bh / 2)

        # Front x: leading edge of flame along flow axis
        front_x = float(bx + bw)

        return {
            "detected": True,
            "area_px": float(total_area),
            "area_cm2": round(float(total_area) / (self.scale ** 2), 3),
            "perimeter_px": round(float(perimeter), 1),
            "centroid": (round(cx, 1), round(cy, 1)),
            "bbox": (int(bx), int(by), int(bw), int(bh)),
            "aspect_ratio": round(float(bw) / max(1.0, float(bh)), 2),
            "front_x_px": front_x,
            "mask": cleaned
        }

    def analyze_video(self, video_path: str, max_frames: int = 150, sample_interval: int = 5) -> Dict[str, Any]:
        """
        Analyze combustion video and extract time series features.
        """
        if not os.path.exists(video_path):
            raise FileNotFoundError(f"Video not found: {video_path}")

        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError(f"Could not open video file: {video_path}")

        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS) or 29.97
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        duration_s = total_frames / fps if fps > 0 else 0

        # Adjust sample interval to cap maximum frames for fast response
        step = max(sample_interval, total_frames // max_frames if total_frames > max_frames else 1)

        timeline = []
        frame_idx = 0
        flame_present_count = 0
        max_area_cm2 = 0.0
        peak_timestamp = 0.0
        extinction_time = None

        prev_front_x = None
        prev_t = None

        while cap.isOpened() and frame_idx < total_frames:
            cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
            ret, frame = cap.read()
            if not ret:
                break

            t_sec = round(frame_idx / fps, 2)
            metrics = self.segment_frame(frame)

            # Instantaneous spread rate
            spread_velocity = 0.0
            if metrics["detected"]:
                flame_present_count += 1
                if metrics["area_cm2"] > max_area_cm2:
                    max_area_cm2 = metrics["area_cm2"]
                    peak_timestamp = t_sec

                if prev_front_x is not None and prev_t is not None and t_sec > prev_t:
                    dt = t_sec - prev_t
                    dx_cm = (metrics["front_x_px"] - prev_front_x) / self.scale
                    spread_velocity = round(dx_cm / dt, 3)

                prev_front_x = metrics["front_x_px"]
                prev_t = t_sec
            else:
                if flame_present_count > 5 and extinction_time is None:
                    extinction_time = t_sec

            # Growth rate dA/dt
            da_dt = 0.0
            if timeline:
                prev_point = timeline[-1]
                dt = t_sec - prev_point["time_s"]
                if dt > 0:
                    da_dt = round((metrics["area_cm2"] - prev_point["flame_area_cm2"]) / dt, 3)

            timeline.append({
                "frame": frame_idx,
                "time_s": t_sec,
                "flame_detected": metrics["detected"],
                "flame_area_cm2": metrics["area_cm2"],
                "flame_area_px": metrics["area_px"],
                "centroid_x": metrics["centroid"][0],
                "centroid_y": metrics["centroid"][1],
                "bbox": metrics["bbox"],
                "aspect_ratio": metrics["aspect_ratio"],
                "spread_velocity_cm_s": spread_velocity,
                "growth_rate_da_dt": da_dt
            })

            frame_idx += step

        cap.release()

        # Compute summary metrics
        areas = [p["flame_area_cm2"] for p in timeline if p["flame_detected"]]
        avg_area_cm2 = round(float(np.mean(areas)), 3) if areas else 0.0

        # Oscillation / Anomaly detection:
        # Check standard deviation of growth rate or FFT on flame area
        anomalies = []
        if len(areas) > 10:
            diffs = np.diff(areas)
            sign_changes = np.count_nonzero(np.diff(np.signbit(diffs)))
            oscillation_ratio = sign_changes / len(diffs)
            if oscillation_ratio > 0.45:
                anomalies.append({
                    "type": "oscillatory_instability",
                    "severity": "medium",
                    "description": "Observed rapid oscillatory area fluctuations characteristic of near-limit microgravity radiative flame instabilities."
                })

        if extinction_time:
            anomalies.append({
                "type": "flame_extinction",
                "severity": "high",
                "time_s": extinction_time,
                "description": f"Visible flame extinction detected at t = {extinction_time:.1f}s."
            })

        return {
            "video_metadata": {
                "total_frames": total_frames,
                "fps": round(fps, 2),
                "resolution": f"{width}x{height}",
                "duration_s": round(duration_s, 2),
                "samples_analyzed": len(timeline)
            },
            "summary": {
                "max_flame_area_cm2": round(max_area_cm2, 3),
                "avg_flame_area_cm2": avg_area_cm2,
                "peak_area_timestamp_s": peak_timestamp,
                "extinction_detected": extinction_time is not None,
                "extinction_time_s": extinction_time,
                "flame_stability": "Oscillating" if any(a["type"] == "oscillatory_instability" for a in anomalies) else "Stable"
            },
            "anomalies": anomalies,
            "timeline": timeline
        }

def precompute_sample_video_analyses():
    """Pre-analyze key NASA videos so Flame Analysis Studio has instant rich data."""
    base_dir = r"d:\nasa fire"
    experiments_json = os.path.join(base_dir, "backend", "data", "experiments_clean.json")
    cache_dir = os.path.join(base_dir, "backend", "data", "video_cache")
    os.makedirs(cache_dir, exist_ok=True)

    if not os.path.exists(experiments_json):
        print("experiments_clean.json not found, run data_pipeline first.")
        return

    with open(experiments_json, "r", encoding="utf-8") as f:
        experiments = json.load(f)

    analyzer = FlameVideoAnalyzer()
    
    # Pick top tests with video from different PIs
    tests_to_analyze = ["B1", "B10", "B12", "B13", "B15", "B18", "T1", "T2", "F1", "M1", "P1", "O1"]
    
    for exp in experiments:
        tid = exp["test_id"]
        if tid in tests_to_analyze and exp.get("main_video_path"):
            full_path = os.path.join(base_dir, exp["main_video_path"])
            cache_file = os.path.join(cache_dir, f"analysis_{tid}.json")
            
            if os.path.exists(full_path) and not os.path.exists(cache_file):
                print(f"Pre-analyzing video for test {tid} ({exp['main_video']})...")
                try:
                    result = analyzer.analyze_video(full_path, max_frames=100, sample_interval=8)
                    result["test_id"] = tid
                    result["material"] = exp["material_category"]
                    result["oxygen_pct"] = exp["calibrated_initial_o2_vol_pct"]
                    result["airflow_cm_s"] = exp["airflow_velocity_cm_s"]
                    
                    with open(cache_file, "w", encoding="utf-8") as out_f:
                        json.dump(result, out_f, indent=2)
                    print(f"Cached analysis for {tid}: {result['summary']['max_flame_area_cm2']} cm2 peak area.")
                except Exception as e:
                    print(f"Error analyzing {tid}: {e}")

if __name__ == "__main__":
    precompute_sample_video_analyses()
