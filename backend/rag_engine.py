"""
FIREWISE-X Grounded Astronaut Assistant RAG Engine
Implements Requirement 2:
- Small set of cited facts directly from BASS-II data
- Exact NASA paper page citations (NASA/TM-20210011385)
- Stated reference run comparison (e.g. comparing user readings against B1 or M5)
- Strict refusal logic for off-topic/unsupported questions with NO confidence badge
"""

import os
import re
import json
import pandas as pd
from typing import Dict, List, Any, Optional, Tuple

BASE_DIR = r"d:\nasa fire"
DATA_DIR = os.path.join(BASE_DIR, "backend", "data")

# Verified, cited flight facts from NASA/TM-20210011385
CITED_FACTS = [
    {
        "id": "fact_b1",
        "keywords": ["b1", "test b1", "bhattacharjee b1"],
        "fact": (
            "NASA BASS-II Test B1 (PI: Bhattacharjee): 100-µm PMMA thin film (2 cm wide) in 22.2% O₂ at 5.0 cm/s opposed airflow. "
            "Ambient O₂ stayed flat at 22.2%. Ignited very quickly; when flow was stopped after spreading halfway, the flame extinguished "
            "very quickly with a blue leading edge. ΔCO produced was 6 ppm."
        ),
        "source": "NASA/TM-20210011385, Page 104, Table A.1"
    },
    {
        "id": "fact_m5",
        "keywords": ["m5", "test m5", "miller m5", "thick pmma"],
        "fact": (
            "NASA BASS-II Test M5 (PI: Miller): 1-mm thick PMMA slab (2 cm wide, opposed flow). "
            "Initial cabin O₂ was 22.2%, but dropped sharply to 19.0% as the thick solid burned. "
            "CO production went over range (>500 ppm, saturating the CSA-CP sensor), demonstrating substantial incomplete combustion products from thick PMMA."
        ),
        "source": "NASA/TM-20210011385, Page 108, Table A.4"
    },
    {
        "id": "fact_f1",
        "keywords": ["f1", "test f1", "ferkul f1", "nomex"],
        "fact": (
            "NASA BASS-II Test F1 (PI: Ferkul): Nomex III fabric sample in 22.2% O₂ and 9.5 cm/s concurrent flow. "
            "The material ignited momentarily while the electric hot-wire igniter was energized, but did not spread at all and completely "
            "self-extinguished as soon as the igniter was turned off. ΔCO was 2 ppm."
        ),
        "source": "NASA/TM-20210011385, Page 105, Table A.2"
    },
    {
        "id": "fact_t4",
        "keywords": ["t4", "test t4", "tien t4", "sibal", "quench"],
        "fact": (
            "NASA BASS-II Test T4 (PI: T'ien): 2.2-cm wide SIBAL fabric (75/25 cotton/fiberglass) in 18.7% O₂ concurrent flow. "
            "Ignited at 10 cm/s flow speed, then flow was incrementally reduced to 2.2 cm/s. The flame shrunk into a blue circular shape "
            "and quenched at 2.2 cm/s due to radiative heat loss exceeding heat release."
        ),
        "source": "NASA/TM-20210011385, Page 96 & Page 112, Table 7.1"
    },
    {
        "id": "fact_p1",
        "keywords": ["p1", "test p1", "fernandez-pello", "black rod"],
        "fact": (
            "NASA BASS-II Test P1 (PI: Fernandez-Pello): 6.35-mm black PMMA rod in 17.7% O₂ opposed flow. "
            "After ignition, flow speed was slowly decreased from 5 cm/s to extinction at potentiometer 0.315 (finite low flow). "
            "CO increased by 13 ppm (1 ppm to 14 ppm)."
        ),
        "source": "NASA/TM-20210011385, Page 106, Table A.3"
    },
    {
        "id": "fact_o1",
        "keywords": ["o1", "test o1", "olson", "clear rod"],
        "fact": (
            "NASA BASS-II Test O1 (PI: Olson): 6.35-mm clear PMMA rod in 22.2% O₂ concurrent flow. "
            "Flow velocity tested at 20, 10, 5, 2, and 1 cm/s. Total burn duration recorded was 201.6 seconds."
        ),
        "source": "NASA/TM-20210011385, Page 110, Table A.5"
    },
    {
        "id": "fact_b18",
        "keywords": ["b18", "test b18", "blowoff", "blow-off"],
        "fact": (
            "NASA BASS-II Test B18 (PI: Bhattacharjee): 1-cm wide, 200-µm thick PMMA film in 17.4% O₂ opposed flow. "
            "Tested at high duct flow velocity (10 cm/s). The flame experienced aerodynamic blow-off extinction at a fan potentiometer of 7.0."
        ),
        "source": "NASA/TM-20210011385, Page 104, Table A.1"
    },
    {
        "id": "fact_b12",
        "keywords": ["b12", "test b12"],
        "fact": (
            "NASA BASS-II Test B12 (PI: Bhattacharjee): 300-µm PMMA film (2 cm wide) in 22.2% O₂ at 2.0 cm/s opposed flow. "
            "Observation: flame was mostly blue with soot forming only on the bottom side; burned steadily for 59.7 seconds."
        ),
        "source": "NASA/TM-20210011385, Page 104, Table A.1"
    },
    {
        "id": "fact_radiative_extinction",
        "keywords": ["radiative extinction", "low flow", "quench limit", "why extinguish", "spherical flame", "buoyancy"],
        "fact": (
            "Physical Principle of Low-Speed Radiative Extinction in Microgravity: Without buoyant natural convection pulling fresh air in, "
            "flames become transport-limited. When ventilation speed drops below a critical threshold (~1-3 cm/s), fuel pyrolysis and heat "
            "generation drop, while radiant heat loss from accumulated soot particles continues unabated. Radiant heat loss exceeds reaction "
            "heat release, causing the flame to cool and extinguish."
        ),
        "source": "NASA/TM-20210011385, Section 2.2, Pages 19–28"
    }
]

# Stated reference flight runs for user telemetry comparison
REFERENCE_RUNS = {
    "B1": {
        "test_id": "B1",
        "pi": "Bhattacharjee",
        "material": "100-µm PMMA thin film",
        "initial_o2": 22.2,
        "final_o2": 22.2,
        "co_initial": 0,
        "co_final": 6,
        "co_delta": 6,
        "flow": 5.0,
        "source": "NASA/TM-20210011385, Page 104"
    },
    "M5": {
        "test_id": "M5",
        "pi": "Miller",
        "material": "1-mm PMMA thick slab",
        "initial_o2": 22.2,
        "final_o2": 19.0,
        "co_initial": 0,
        "co_final": 500,
        "co_delta": 500,
        "flow": 8.0,
        "source": "NASA/TM-20210011385, Page 108"
    },
    "T4": {
        "test_id": "T4",
        "pi": "T'ien",
        "material": "SIBAL fabric",
        "initial_o2": 18.7,
        "final_o2": 18.5,
        "co_initial": 0,
        "co_final": 15,
        "co_delta": 15,
        "flow": 2.2,
        "source": "NASA/TM-20210011385, Page 96"
    }
}

class GroundedAstronautAssistant:
    def __init__(self):
        self.facts = CITED_FACTS
        self.experiments_df = None
        self._load_experiments()

    def _load_experiments(self):
        csv_path = os.path.join(DATA_DIR, "experiments_clean.csv")
        if os.path.exists(csv_path):
            self.experiments_df = pd.read_csv(csv_path)

    def compare_against_reference_run(self, 
                                      user_o2: float, 
                                      user_co: float, 
                                      reference_run_id: str = "B1") -> Dict[str, Any]:
        """
        Compare user's custom sensor readings against a stated BASS-II reference run.
        """
        ref_id = reference_run_id.upper().strip()
        ref = REFERENCE_RUNS.get(ref_id, REFERENCE_RUNS["B1"])

        o2_diff = round(user_o2 - ref["final_o2"], 2)
        co_diff = round(user_co - ref["co_final"], 1)

        findings = []
        if abs(o2_diff) > 1.0:
            direction = "lower" if o2_diff < 0 else "higher"
            findings.append(f"O₂ concentration ({user_o2:.1f}%) is {abs(o2_diff):.1f}% {direction} than reference run {ref['test_id']} ({ref['final_o2']}%).")
        else:
            findings.append(f"O₂ concentration ({user_o2:.1f}%) is close to reference run {ref['test_id']} ({ref['final_o2']}%).")

        if co_diff > 10.0:
            findings.append(f"Carbon Monoxide ({user_co:.1f} ppm) exceeds reference run {ref['test_id']} ({ref['co_final']} ppm) by {co_diff:.1f} ppm.")
        elif co_diff < -10.0:
            findings.append(f"Carbon Monoxide ({user_co:.1f} ppm) is {abs(co_diff):.1f} ppm lower than reference run {ref['test_id']} ({ref['co_final']} ppm).")
        else:
            findings.append(f"Carbon Monoxide ({user_co:.1f} ppm) is comparable to reference run {ref['test_id']} ({ref['co_final']} ppm).")

        return {
            "reference_run": {
                "test_id": ref["test_id"],
                "pi": ref["pi"],
                "material": ref["material"],
                "baseline_o2": ref["final_o2"],
                "baseline_co_ppm": ref["co_final"],
                "source": ref["source"]
            },
            "user_telemetry": {
                "o2_pct": user_o2,
                "co_ppm": user_co
            },
            "comparison_findings": findings
        }

    def answer_question(self, query: str) -> Dict[str, Any]:
        """
        Ground responses in cited facts. If off-topic or unsupported, explicitly refuse.
        """
        q = query.lower().strip()

        # 1. Check for specific test inquiries in 129 flight experiments
        m_test = re.search(r"\btest\s*([bfpomt]\d+[a-z]?)\b", q)
        if not m_test:
            m_test = re.search(r"\b([bfpmt]\d{1,2}[a-z]?)\b", q)
        if m_test and self.experiments_df is not None:
            tid = m_test.group(1).upper()
            if tid in self.experiments_df["test_id"].values:
                row = self.experiments_df[self.experiments_df["test_id"] == tid].iloc[0]
                ans = (
                    f"**NASA Flight Experiment #{row['test_id']} ({row['pi']}):**\n\n"
                    f"- **Fuel Material:** {row['fuel_material_raw']} ({row['material_category']})\n"
                    f"- **Dimensions:** Thickness {row['thickness_mm']} mm, Width {row['width_cm']} cm\n"
                    f"- **Measured Conditions:** Initial O₂ {row['calibrated_initial_o2_vol_pct']}%, Final O₂ {row['calibrated_final_o2_vol_pct']}%, Airflow {row['airflow_velocity_cm_s']} cm/s\n"
                    f"- **Measured Sensors:** ΔO₂ = {row['o2_delta_vol_pct']}%, ΔCO = {row['co_delta_ppm']} ppm, Duration = {row['burn_duration_s']}s\n"
                    f"- **Documented Outcome:** {row['outcome']}\n"
                    f"- **Flight Observations:** \"{row['observations']}\"\n\n"
                    f"**Source Document:** NASA/TM-20210011385, Appendix A (BASS-II Test Matrix)"
                )
                return {
                    "response": ans,
                    "source_page": "NASA/TM-20210011385, Appendix A",
                    "refused": False
                }

        # 2. Check for matching cited facts
        best_fact = None
        best_score = 0
        for fact in self.facts:
            score = sum(1 for kw in fact["keywords"] if kw in q)
            if score > best_score:
                best_score = score
                best_fact = fact

        if best_fact and best_score >= 1:
            ans = f"{best_fact['fact']}\n\n**Source Document:** {best_fact['source']}"
            return {
                "response": ans,
                "source_page": best_fact["source"],
                "refused": False
            }

        # 3. Check for telemetry / comparison queries
        co_m = re.search(r"(\d+(?:\.\d+)?)\s*(?:ppm|co\b)", q)
        o2_m = re.search(r"(\d+(?:\.\d+)?)\s*%", q)
        if ("sensor" in q or "compare" in q or "reading" in q) and (co_m or o2_m):
            u_co = float(co_m.group(1)) if co_m else 0.0
            u_o2 = float(o2_m.group(1)) if o2_m else 21.0
            ref_id = "M5" if "m5" in q else "B1"
            comp = self.compare_against_reference_run(u_o2, u_co, ref_id)
            ans = (
                f"**Telemetry Comparison Against Stated Reference Run #{comp['reference_run']['test_id']} ({comp['reference_run']['pi']}):**\n\n"
                f"- Stated Reference Baseline: {comp['reference_run']['material']}, {comp['reference_run']['baseline_o2']}% O₂, {comp['reference_run']['baseline_co_ppm']} ppm CO\n"
                f"- User Telemetry: {u_o2}% O₂, {u_co} ppm CO\n\n"
                f"**Findings:**\n" +
                "\n".join(f"- {f}" for f in comp['comparison_findings']) +
                f"\n\n**Source Reference:** {comp['reference_run']['source']}"
            )
            return {
                "response": ans,
                "source_page": comp["reference_run"]["source"],
                "refused": False
            }

        # 4. Strict Refusal for off-topic / unsupported questions (Requirement 2)
        return {
            "response": (
                "I don't have data on that. I only answer questions directly grounded in the "
                "129 NASA PSI-25 (BASS-II) flight combustion experiments."
            ),
            "source_page": None,
            "refused": True
        }

if __name__ == "__main__":
    ast = GroundedAstronautAssistant()
    print("--- Test Fact Query (B1) ---")
    r1 = ast.answer_question("Tell me about test B1 O2 readings")
    print(r1["response"])
    print("\n--- Test Comparison Query ---")
    r2 = ast.answer_question("Compare my readings O2 19.5% and CO 45 ppm with test B1")
    print(r2["response"])
    print("\n--- Test Off-Topic Refusal ---")
    r3 = ast.answer_question("How do I bake bread in space?")
    print(r3["response"])
    print("Refused?", r3["refused"])
