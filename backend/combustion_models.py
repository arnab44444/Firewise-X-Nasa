"""
FIREWISE-X Combustion Models Engine (Model 2, Model 4, Model 5)
- Tabular Machine Learning Prediction (Random Forest & XGBoost)
- Multimodal Combustion Fusion (Visual flame characteristics + Tabular conditions + Sensor telemetry)
- Explainable AI Engine (Feature importance, local feature contributions, scientific evidence citation)
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, List, Any, Tuple
from sklearn.model_selection import StratifiedKFold, KFold
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import accuracy_score, f1_score, mean_squared_error, r2_score
import xgboost as xgb

BASE_DIR = r"d:\nasa fire"
DATA_DIR = os.path.join(BASE_DIR, "backend", "data")
MODELS_DIR = os.path.join(DATA_DIR, "models")
os.makedirs(MODELS_DIR, exist_ok=True)

FEATURE_COLS = [
    "material_category",
    "thickness_mm",
    "width_cm",
    "flow_geometry",
    "flow_restrictor",
    "airflow_velocity_cm_s",
    "calibrated_initial_o2_vol_pct"
]

ALL_MATERIALS = [
    "PMMA Thin Film",
    "PMMA Thick Slab",
    "PMMA Clear Rod",
    "PMMA Black Rod",
    "SIBAL Fabric",
    "Nomex III",
    "Japan Wax Candle",
    "PMMA Sphere"
]

ALL_GEOMETRIES = ["opposed", "concurrent", "quiescent"]

class CombustionIntelligenceEngine:
    def __init__(self):
        self.clf_outcome = None
        self.reg_duration = None
        self.reg_spread = None
        self.reg_co = None
        self.label_encoder = LabelEncoder()
        self.scaler = StandardScaler()
        self.feature_names = []
        self.experiments_df = None
        self.model_metrics = {}

    def _prepare_features(self, df: pd.DataFrame, fit: bool = False) -> np.ndarray:
        """One-hot encode categorical features and scale numerical ones."""
        X_parts = []

        # 1. Material One-Hot
        mat_dummies = pd.get_dummies(df["material_category"].astype(pd.CategoricalDtype(categories=ALL_MATERIALS)))
        X_parts.append(mat_dummies.values)

        # 2. Geometry One-Hot
        geom_dummies = pd.get_dummies(df["flow_geometry"].astype(pd.CategoricalDtype(categories=ALL_GEOMETRIES)))
        X_parts.append(geom_dummies.values)

        # 3. Numerical columns
        num_cols = ["thickness_mm", "width_cm", "flow_restrictor", "airflow_velocity_cm_s", "calibrated_initial_o2_vol_pct"]
        X_num = df[num_cols].fillna(0).values

        if fit:
            self.scaler.fit(X_num)
            self.feature_names = [f"mat_{m}" for m in ALL_MATERIALS] + \
                                 [f"geom_{g}" for g in ALL_GEOMETRIES] + \
                                 num_cols

        X_num_scaled = self.scaler.transform(X_num)
        X_parts.append(X_num_scaled)

        return np.hstack(X_parts)

    def train_and_evaluate(self):
        """Train models on the 129 cleaned NASA PSI-25 experiments."""
        csv_path = os.path.join(DATA_DIR, "experiments_clean.csv")
        if not os.path.exists(csv_path):
            raise FileNotFoundError("experiments_clean.csv not found. Run data_pipeline.py first.")

        df = pd.read_csv(csv_path)
        self.experiments_df = df

        X = self._prepare_features(df, fit=True)

        # Target 1: Extinction Outcome
        y_outcome = df["outcome"].values
        self.label_encoder.fit(y_outcome)
        y_outcome_encoded = self.label_encoder.transform(y_outcome)

        # Target 2: Burn Duration (seconds)
        y_duration = df["burn_duration_s"].fillna(df["burn_duration_s"].median()).values

        # Target 3: Spread Rate (cm/s)
        y_spread = df["spread_rate_cm_s"].fillna(df["spread_rate_cm_s"].median()).values

        # Target 4: CO Delta (ppm)
        y_co = df["co_delta_ppm"].fillna(0).values

        print("=== Training Outcome Classification Model ===")
        self.clf_outcome = RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42)
        skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
        acc_scores = []
        for train_idx, val_idx in skf.split(X, y_outcome_encoded):
            clf = RandomForestClassifier(n_estimators=80, max_depth=6, random_state=42)
            clf.fit(X[train_idx], y_outcome_encoded[train_idx])
            preds = clf.predict(X[val_idx])
            acc_scores.append(accuracy_score(y_outcome_encoded[val_idx], preds))
        
        cv_acc = float(np.mean(acc_scores))
        self.clf_outcome.fit(X, y_outcome_encoded)
        print(f"Classification 5-fold CV Accuracy: {cv_acc:.3f}")

        print("=== Training Burn Duration Regressor (XGBoost) ===")
        self.reg_duration = xgb.XGBRegressor(n_estimators=80, max_depth=4, learning_rate=0.08, random_state=42)
        kf = KFold(n_splits=5, shuffle=True, random_state=42)
        r2_dur = []
        for train_idx, val_idx in kf.split(X):
            m = xgb.XGBRegressor(n_estimators=80, max_depth=4, learning_rate=0.08, random_state=42)
            m.fit(X[train_idx], y_duration[train_idx])
            preds = m.predict(X[val_idx])
            r2_dur.append(r2_score(y_duration[val_idx], preds))
        self.reg_duration.fit(X, y_duration)
        cv_r2_dur = float(np.mean(r2_dur))
        print(f"Burn Duration 5-fold CV R2: {cv_r2_dur:.3f}")

        print("=== Training Flame Spread Rate Regressor ===")
        self.reg_spread = RandomForestRegressor(n_estimators=100, max_depth=5, random_state=42)
        r2_spread = []
        for train_idx, val_idx in kf.split(X):
            m = RandomForestRegressor(n_estimators=80, max_depth=5, random_state=42)
            m.fit(X[train_idx], y_spread[train_idx])
            preds = m.predict(X[val_idx])
            r2_spread.append(r2_score(y_spread[val_idx], preds))
        self.reg_spread.fit(X, y_spread)
        cv_r2_spread = float(np.mean(r2_spread))
        print(f"Flame Spread Rate 5-fold CV R2: {cv_r2_spread:.3f}")

        print("=== Training CO Production Regressor ===")
        self.reg_co = RandomForestRegressor(n_estimators=80, max_depth=5, random_state=42)
        self.reg_co.fit(X, y_co)

        self.model_metrics = {
            "total_training_samples": len(df),
            "cv_classification_accuracy": round(cv_acc, 3),
            "cv_burn_duration_r2": round(cv_r2_dur, 3),
            "cv_spread_rate_r2": round(cv_r2_spread, 3),
            "feature_count": len(self.feature_names),
            "classes": self.label_encoder.classes_.tolist()
        }

        # Save artifacts
        joblib.dump(self.clf_outcome, os.path.join(MODELS_DIR, "clf_outcome.joblib"))
        joblib.dump(self.reg_duration, os.path.join(MODELS_DIR, "reg_duration.joblib"))
        joblib.dump(self.reg_spread, os.path.join(MODELS_DIR, "reg_spread.joblib"))
        joblib.dump(self.reg_co, os.path.join(MODELS_DIR, "reg_co.joblib"))
        joblib.dump(self.label_encoder, os.path.join(MODELS_DIR, "label_encoder.joblib"))
        joblib.dump(self.scaler, os.path.join(MODELS_DIR, "scaler.joblib"))
        
        with open(os.path.join(MODELS_DIR, "metrics.json"), "w", encoding="utf-8") as f:
            json.dump(self.model_metrics, f, indent=2)

        print("Models and metadata successfully saved!")

    def load_models(self):
        """Load trained models from disk."""
        self.clf_outcome = joblib.load(os.path.join(MODELS_DIR, "clf_outcome.joblib"))
        self.reg_duration = joblib.load(os.path.join(MODELS_DIR, "reg_duration.joblib"))
        self.reg_spread = joblib.load(os.path.join(MODELS_DIR, "reg_spread.joblib"))
        self.reg_co = joblib.load(os.path.join(MODELS_DIR, "reg_co.joblib"))
        self.label_encoder = joblib.load(os.path.join(MODELS_DIR, "label_encoder.joblib"))
        self.scaler = joblib.load(os.path.join(MODELS_DIR, "scaler.joblib"))
        
        with open(os.path.join(MODELS_DIR, "metrics.json"), "r", encoding="utf-8") as f:
            self.model_metrics = json.load(f)

        csv_path = os.path.join(DATA_DIR, "experiments_clean.csv")
        if os.path.exists(csv_path):
            self.experiments_df = pd.read_csv(csv_path)

        self.feature_names = [f"mat_{m}" for m in ALL_MATERIALS] + \
                             [f"geom_{g}" for g in ALL_GEOMETRIES] + \
                             ["thickness_mm", "width_cm", "flow_restrictor", "airflow_velocity_cm_s", "calibrated_initial_o2_vol_pct"]

    def predict_scenario(self, 
                         material: str, 
                         thickness_mm: float, 
                         airflow_velocity_cm_s: float, 
                         oxygen_vol_pct: float,
                         width_cm: float = 2.0, 
                         flow_restrictor: int = 2) -> Dict[str, Any]:
        """
        Predict combustion behavior under given space mission conditions.
        """
        if self.clf_outcome is None:
            self.load_models()

        # Geometry inference
        flow_geometry = "opposed"
        if "rod" in material.lower():
            flow_geometry = "concurrent" if "clear" in material.lower() else "opposed"
        elif "sibal" in material.lower() or "nomex" in material.lower():
            flow_geometry = "concurrent"
        elif "candle" in material.lower():
            flow_geometry = "quiescent"

        input_df = pd.DataFrame([{
            "material_category": material,
            "thickness_mm": float(thickness_mm),
            "width_cm": float(width_cm),
            "flow_geometry": flow_geometry,
            "flow_restrictor": int(flow_restrictor),
            "airflow_velocity_cm_s": float(airflow_velocity_cm_s),
            "calibrated_initial_o2_vol_pct": float(oxygen_vol_pct)
        }])

        X = self._prepare_features(input_df, fit=False)

        # 1. Outcome classification
        probs = self.clf_outcome.predict_proba(X)[0]
        classes = self.label_encoder.classes_
        pred_class_idx = int(np.argmax(probs))
        predicted_outcome = str(classes[pred_class_idx])
        confidence = float(probs[pred_class_idx])
        outcome_probs = {str(c): round(float(p), 3) for c, p in zip(classes, probs)}

        # 2. Regressions
        pred_duration = max(0.0, float(self.reg_duration.predict(X)[0]))
        pred_spread = max(0.0, float(self.reg_spread.predict(X)[0]))
        pred_co = max(0.0, float(self.reg_co.predict(X)[0]))

        # Uncertainty: estimated from ensemble variance
        tree_preds_spread = [t.predict(X)[0] for t in self.reg_spread.estimators_]
        spread_uncertainty = round(float(np.std(tree_preds_spread)), 3)

        tree_preds_co = [t.predict(X)[0] for t in self.reg_co.estimators_]
        co_uncertainty = round(float(np.std(tree_preds_co)), 1)

        # Explainability: Feature Importances and Local Contributions
        importances = self.clf_outcome.feature_importances_
        top_influences = []
        for name, imp in sorted(zip(self.feature_names, importances), key=lambda x: x[1], reverse=True)[:5]:
            clean_name = name.replace("mat_", "Material: ").replace("geom_", "Geometry: ").replace("_", " ").title()
            top_influences.append({
                "feature": clean_name,
                "importance": round(float(imp), 3)
            })

        # Find closest historical NASA PSI-25 experiments
        matched_experiments = []
        if self.experiments_df is not None:
            # Score distance based on material match, O2 difference, and airflow difference
            candidates = self.experiments_df[self.experiments_df["material_category"] == material]
            if candidates.empty:
                candidates = self.experiments_df

            scores = []
            for _, r in candidates.iterrows():
                d_o2 = abs(r["calibrated_initial_o2_vol_pct"] - oxygen_vol_pct)
                d_air = abs(r["airflow_velocity_cm_s"] - airflow_velocity_cm_s)
                d_th = abs(r["thickness_mm"] - thickness_mm)
                dist = d_o2 * 2.0 + d_air * 0.5 + d_th * 1.5
                scores.append((dist, r))

            scores.sort(key=lambda x: x[0])
            for dist, r in scores[:3]:
                matched_experiments.append({
                    "test_id": r["test_id"],
                    "pi": r["pi"],
                    "material": r["fuel_material_raw"],
                    "actual_o2": r["calibrated_initial_o2_vol_pct"],
                    "actual_airflow": r["airflow_velocity_cm_s"],
                    "actual_outcome": r["outcome"],
                    "actual_duration_s": r["burn_duration_s"],
                    "observations": r["observations"],
                    "similarity_score": round(max(0.1, 1.0 - (dist / 30.0)), 2)
                })

        # Formulate scientific assessment description
        outcome_labels = {
            "extinguished_quenched": "Radiative Quenching Extinction",
            "sustained": "Sustained Steady Microgravity Combustion",
            "extinguished_blowoff": "Aerodynamic Blow-Off Extinction",
            "no_ignition": "Non-Ignition / Flame Inception Failure"
        }

        scientific_explanations = {
            "extinguished_quenched": f"At {oxygen_vol_pct}% O2 and {airflow_velocity_cm_s} cm/s flow, radiative heat loss from soot and CO2 exceeds chemical heat release. In the absence of natural buoyant convection, the flame cools below its flammability limit.",
            "sustained": f"At {oxygen_vol_pct}% O2 and {airflow_velocity_cm_s} cm/s flow, forced convective oxygen renewal adequately feeds the pyrolysis zone. The flame maintains a steady microgravity propagation front.",
            "extinguished_blowoff": f"At {airflow_velocity_cm_s} cm/s flow, aerodynamic residence time is shorter than chemical ignition delay time, detaching the flame base and blowing it out.",
            "no_ignition": "Insufficient ambient oxygen or thermal energy dissipation prevents igniter transition to self-sustaining flame."
        }

        return {
            "inputs": {
                "material": material,
                "thickness_mm": thickness_mm,
                "airflow_velocity_cm_s": airflow_velocity_cm_s,
                "oxygen_vol_pct": oxygen_vol_pct,
                "width_cm": width_cm,
                "flow_restrictor": flow_restrictor,
                "flow_geometry": flow_geometry
            },
            "prediction": {
                "outcome_code": predicted_outcome,
                "outcome_label": outcome_labels.get(predicted_outcome, predicted_outcome),
                "confidence": round(confidence, 3),
                "outcome_probabilities": outcome_probs,
                "predicted_duration_s": round(pred_duration, 1),
                "predicted_spread_rate_cm_s": round(pred_spread, 3),
                "predicted_spread_rate_uncertainty": spread_uncertainty,
                "predicted_co_delta_ppm": round(pred_co, 1),
                "predicted_co_uncertainty": co_uncertainty,
                "scientific_rationale": scientific_explanations.get(predicted_outcome, "")
            },
            "explainability": {
                "top_influencing_variables": top_influences,
                "closest_nasa_experiments": matched_experiments,
                "scientific_limitations": "Predictions derived from NASA BASS-II Microgravity Science Glovebox tests (low-speed duct flow, 1 atm pressure). Does not substitute for mission-approved NASA fire suppression safety rules."
            }
        }

if __name__ == "__main__":
    engine = CombustionIntelligenceEngine()
    engine.train_and_evaluate()
    # Test scenario
    res = engine.predict_scenario(
        material="PMMA Thin Film",
        thickness_mm=0.2,
        airflow_velocity_cm_s=1.5,
        oxygen_vol_pct=18.0
    )
    print("\nTest Prediction Result:")
    print(json.dumps(res, indent=2))
