"""
FIREWISE-X Grounded BASS-II Lookup Engine (Pre-Mission Assessment)
Replaces unverified black-box predictions with a deterministic nearest-neighbor lookup
against the 129 actual NASA BASS-II flight experiments.

Features:
- Real BASS-II measurement extraction
- Tested range validation & extreme input warnings
- Transparent ranking rules (no invented scores)
- Scientific evidence citing NASA/TM-20210011385
- Leave-one-out validation module for defensibility
"""

import os
import json
import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional

BASE_DIR = r"d:\nasa fire"
DATA_DIR = os.path.join(BASE_DIR, "backend", "data")

# Documented physical ranges tested aboard the ISS in BASS-II
TESTED_RANGES = {
    "oxygen_min": 14.0,
    "oxygen_max": 22.5,
    "airflow_min": 0.5,
    "airflow_max": 45.0,
    "thickness_min": 0.1,
    "thickness_max": 12.7
}

class BASS2LookupEngine:
    def __init__(self):
        self.experiments_df = None
        self._load_data()

    def _load_data(self):
        csv_path = os.path.join(DATA_DIR, "experiments_clean.csv")
        if os.path.exists(csv_path):
            self.experiments_df = pd.read_csv(csv_path)

    def check_input_range(self, oxygen_vol_pct: float, airflow_cm_s: float, thickness_mm: float) -> List[str]:
        """Check if inputs fall outside the tested NASA BASS-II envelope."""
        warnings = []
        if oxygen_vol_pct < TESTED_RANGES["oxygen_min"] or oxygen_vol_pct > TESTED_RANGES["oxygen_max"]:
            warnings.append(
                f"Oxygen concentration ({oxygen_vol_pct:.1f}% O₂) is outside tested BASS-II flight range "
                f"({TESTED_RANGES['oxygen_min']:.1f}% – {TESTED_RANGES['oxygen_max']:.1f}%). "
                f"Combustion behavior cannot be verified by existing flight records."
            )
        if airflow_cm_s < TESTED_RANGES["airflow_min"] or airflow_cm_s > TESTED_RANGES["airflow_max"]:
            warnings.append(
                f"Duct airflow velocity ({airflow_cm_s:.1f} cm/s) exceeds tested BASS-II flow range "
                f"({TESTED_RANGES['airflow_min']:.1f} – {TESTED_RANGES['airflow_max']:.1f} cm/s). "
                f"Low-buoyancy aerodynamic limits are unvalidated at this speed."
            )
        if thickness_mm < TESTED_RANGES["thickness_min"] or thickness_mm > TESTED_RANGES["thickness_max"]:
            warnings.append(
                f"Fuel thickness ({thickness_mm:.2f} mm) is outside documented BASS-II sample bounds "
                f"({TESTED_RANGES['thickness_min']:.1f} mm – {TESTED_RANGES['thickness_max']:.1f} mm)."
            )
        return warnings

    def lookup_closest_runs(self, 
                            material: str, 
                            thickness_mm: float, 
                            airflow_velocity_cm_s: float, 
                            oxygen_vol_pct: float,
                            top_k: int = 3) -> Dict[str, Any]:
        """
        Deterministic lookup finding closest real BASS-II flight runs.
        Ranked by simple, transparent rules:
        1. Material match
        2. Absolute parameter deviation (|ΔO2| + |ΔFlow| + |ΔThickness|)
        3. Measurement completeness (has video and sensor recordings)
        """
        if self.experiments_df is None:
            self._load_data()

        df = self.experiments_df.copy()
        
        # Check range validity
        range_warnings = self.check_input_range(oxygen_vol_pct, airflow_velocity_cm_s, thickness_mm)
        is_outside_range = len(range_warnings) > 0

        # Calculate transparent distance metric
        # Normalize: ΔO2 (scale 5%), ΔU (scale 10 cm/s), Δth (scale 2 mm)
        df["material_match"] = df["material_category"].apply(lambda m: 0 if str(m).lower() == material.lower() else 1)
        df["delta_o2"] = (df["calibrated_initial_o2_vol_pct"] - oxygen_vol_pct).abs()
        df["delta_airflow"] = (df["airflow_velocity_cm_s"] - airflow_velocity_cm_s).abs()
        df["delta_thickness"] = (df["thickness_mm"] - thickness_mm).abs()
        
        # Total distance
        df["total_distance"] = (
            df["material_match"] * 10.0 +
            df["delta_o2"] * 1.5 +
            df["delta_airflow"] * 0.4 +
            df["delta_thickness"] * 1.2
        )

        # Sort strictly by: 1) material match, 2) total distance, 3) has_video
        sorted_df = df.sort_values(by=["material_match", "total_distance", "has_video"], ascending=[True, True, False])
        top_matches = sorted_df.head(top_k)

        matched_runs = []
        for _, row in top_matches.iterrows():
            matched_runs.append({
                "test_id": row["test_id"],
                "pi": row["pi"],
                "fuel_material_raw": row["fuel_material_raw"],
                "material_category": row["material_category"],
                "measured_thickness_mm": float(row["thickness_mm"]),
                "measured_airflow_cm_s": float(row["airflow_velocity_cm_s"]),
                "measured_initial_o2_vol_pct": float(row["calibrated_initial_o2_vol_pct"]),
                "measured_final_o2_vol_pct": float(row["calibrated_final_o2_vol_pct"]),
                "measured_o2_delta": float(row["o2_delta_vol_pct"]),
                "measured_co_delta_ppm": float(row["co_delta_ppm"]),
                "measured_burn_duration_s": float(row["burn_duration_s"]),
                "measured_spread_rate_cm_s": float(row["spread_rate_cm_s"]),
                "observed_outcome": row["outcome"],
                "flight_observations": row["observations"],
                "paper_reference": f"NASA/TM-20210011385, Table A.1–A.6",
                "parameter_delta": {
                    "delta_o2": round(float(row["delta_o2"]), 2),
                    "delta_airflow": round(float(row["delta_airflow"]), 2),
                    "delta_thickness": round(float(row["delta_thickness"]), 2)
                },
                "has_video": bool(row["has_video"])
            })

        # Primary matched benchmark run
        primary = matched_runs[0] if matched_runs else None

        # Human-readable outcome label
        outcome_labels = {
            "extinguished_quenched": "Radiative Quenching Extinction (Observed at low flow / low O₂)",
            "sustained": "Sustained Microgravity Propagation (Steady flame front)",
            "extinguished_blowoff": "Aerodynamic Blow-Off Extinction (High flow strain)",
            "no_ignition": "Failure to Achieve Self-Sustained Ignition"
        }

        return {
            "inputs": {
                "material": material,
                "thickness_mm": thickness_mm,
                "airflow_velocity_cm_s": airflow_velocity_cm_s,
                "oxygen_vol_pct": oxygen_vol_pct
            },
            "range_validation": {
                "within_tested_envelope": not is_outside_range,
                "range_warnings": range_warnings
            },
            "lookup_result": {
                "primary_match_test_id": primary["test_id"] if primary else "N/A",
                "observed_outcome": primary["observed_outcome"] if primary else "unknown",
                "outcome_label": outcome_labels.get(primary["observed_outcome"], primary["observed_outcome"]) if primary else "N/A",
                "measured_burn_duration_s": primary["measured_burn_duration_s"] if primary else 0.0,
                "measured_spread_rate_cm_s": primary["measured_spread_rate_cm_s"] if primary else 0.0,
                "measured_co_delta_ppm": primary["measured_co_delta_ppm"] if primary else 0.0,
                "factual_summary": (
                    f"Closest flight run is NASA Test #{primary['test_id']} ({primary['pi']}) with {primary['fuel_material_raw']} "
                    f"under {primary['measured_initial_o2_vol_pct']}% O₂ and {primary['measured_airflow_cm_s']} cm/s airflow. "
                    f"Measured outcome: {primary['observed_outcome']}. Duration: {primary['measured_burn_duration_s']}s."
                ) if primary else "No matching run found."
            },
            "matched_historical_runs": matched_runs,
            "scientific_limitations": (
                "Lookup reflects empirical measurements from the BASS-II 7.6-cm flow duct in the ISS Microgravity "
                "Science Glovebox at 1.0 atm. Extrapolations beyond tested bounds are scientifically unverified."
            )
        }

    def run_leave_one_out_validation(self) -> Dict[str, Any]:
        """
        Leave-One-Run-Out validation: for each test, remove it and query the lookup 
        using its conditions. Check if the nearest match correctly predicts the outcome.
        """
        if self.experiments_df is None:
            self._load_data()

        df = self.experiments_df.copy()
        total = len(df)
        correct = 0
        failures = []

        for idx, row in df.iterrows():
            sub_df = df.drop(index=idx)
            # Find nearest in sub_df
            sub_df = sub_df.copy()
            mat_penalty = (sub_df["material_category"] != row["material_category"]) * 10.0
            d_o2 = (sub_df["calibrated_initial_o2_vol_pct"] - row["calibrated_initial_o2_vol_pct"]).abs()
            d_u = (sub_df["airflow_velocity_cm_s"] - row["airflow_velocity_cm_s"]).abs()
            d_th = (sub_df["thickness_mm"] - row["thickness_mm"]).abs()
            dist = mat_penalty + d_o2 * 1.5 + d_u * 0.4 + d_th * 1.2
            nearest_idx = dist.idxmin()
            nearest_outcome = sub_df.loc[nearest_idx, "outcome"]

            if nearest_outcome == row["outcome"]:
                correct += 1
            else:
                if len(failures) < 5:
                    failures.append({
                        "tested_id": row["test_id"],
                        "actual_outcome": row["outcome"],
                        "nearest_id": sub_df.loc[nearest_idx, "test_id"],
                        "nearest_outcome": nearest_outcome,
                        "conditions": f"{row['material_category']}, {row['calibrated_initial_o2_vol_pct']}% O2, {row['airflow_velocity_cm_s']} cm/s"
                    })

        acc = correct / total if total > 0 else 0
        return {
            "total_runs_evaluated": total,
            "correct_outcome_matches": correct,
            "leave_one_out_accuracy": round(acc, 3),
            "sample_failure_cases": failures
        }

# Global instance
lookup_engine = BASS2LookupEngine()

if __name__ == "__main__":
    res = lookup_engine.lookup_closest_runs(
        material="PMMA Thin Film",
        thickness_mm=0.2,
        airflow_velocity_cm_s=1.5,
        oxygen_vol_pct=18.0
    )
    print("Normal query result:")
    print(json.dumps(res, indent=2))

    print("\nExtreme out-of-range query:")
    res_ext = lookup_engine.lookup_closest_runs(
        material="PMMA Thin Film",
        thickness_mm=0.2,
        airflow_velocity_cm_s=65.0,
        oxygen_vol_pct=35.0
    )
    print("Range warnings:", res_ext["range_validation"]["range_warnings"])

    print("\nRunning Leave-One-Run-Out Check:")
    val = lookup_engine.run_leave_one_out_validation()
    print("LOO Accuracy:", val["leave_one_out_accuracy"])
    print("Sample Failure:", val["sample_failure_cases"][0])
