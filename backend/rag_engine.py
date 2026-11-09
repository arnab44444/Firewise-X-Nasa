"""
FIREWISE-X Scientific Knowledge & Astronaut Assistant RAG Engine
Grounds responses in NASA PSI-25 / BASS-II documentation:
- BASS-II Summary Report (NASA/TM-20210011385)
- BASS-II data FAQ and Engineering requirements
- Baseline ISS sensor telemetry limits & fire hazard classification
"""

import os
import re
import json
from typing import Dict, List, Any, Optional

BASE_DIR = r"d:\nasa fire"
DATA_DIR = os.path.join(BASE_DIR, "backend", "data")

# Baseline ISS / Microgravity Science Glovebox (MSG) environmental baselines
ISS_BASELINES = {
    "o2_nominal_pct": 21.0,
    "o2_min_breathable_pct": 19.5,
    "co2_nominal_pct": 0.35,
    "co2_elevated_pct": 0.70,
    "co_nominal_ppm": 0.0,
    "co_caution_ppm": 15.0,
    "co_warning_ppm": 50.0,
    "co_emergency_ppm": 100.0,
    "airflow_nominal_cm_s": 5.0,
}

KNOWLEDGE_DOCS = [
    {
        "id": "microgravity_combustion_physics",
        "title": "Fundamental Microgravity Combustion & Buoyancy Suppression",
        "keywords": ["buoyancy", "microgravity", "gravity", "convection", "spherical", "flame shape", "diffusion", "heat loss"],
        "content": (
            "In terrestrial 1g environments, buoyancy-driven natural convection pulls hot combustion products upward "
            "and entrains fresh cold oxygen into the base of the flame, giving flames their characteristic teardrop shape. "
            "In microgravity (10^-4 to 10^-6 g aboard the ISS), natural buoyant convection is virtually eliminated. "
            "Combustion becomes transport-limited by molecular diffusion and forced ventilation. Flames typically assume a "
            "spherical or hemispherical geometry. Without buoyant removal, soot and heavy combustion products accumulate in "
            "the reaction zone, significantly increasing radiative heat loss."
        ),
        "source": "NASA/TM-20210011385, Section 1.1 & Section 2.2"
    },
    {
        "id": "radiative_extinction_quenching",
        "title": "Radiative Extinction and the Low-Speed Quenching Limit",
        "keywords": ["radiative", "extinction", "quench", "quenching", "low flow", "limit", "cooling", "heat loss"],
        "content": (
            "A counter-intuitive discovery of NASA BASS and BASS-II is the low-speed radiative extinction limit. "
            "In normal gravity, blowing less air lowers flame intensity but rarely quenches a solid fire because natural convection "
            "provides a floor flow (~10-30 cm/s). In microgravity, when forced airflow is decreased below a critical threshold "
            "(typically 1 to 3 cm/s for PMMA films and fabrics), the fuel pyrolysis rate and chemical heat release rate drop drastically. "
            "Simultaneously, radiant heat emission from soot particles cools the flame faster than chemical reactions generate heat. "
            "This causes the flame to shrink into a dim blue hemispherical ring and abruptly extinguish (radiative quenching)."
        ),
        "source": "NASA/TM-20210011385, Section 2.2 & Bhattacharjee et al."
    },
    {
        "id": "blowoff_extinction",
        "title": "Aerodynamic Blow-Off Extinction at High Flow",
        "keywords": ["blowoff", "blow-off", "high flow", "velocity", "detachment", "air display", "strain"],
        "content": (
            "At the opposite extreme, when airflow velocity is increased substantially (e.g. > 30-50 cm/s in BASS-II), "
            "the aerodynamic residence time (t_res = L / U) in the boundary layer becomes shorter than the chemical reaction time "
            "(t_chem). The flow strips heat and intermediate radicals away from the flame anchor faster than the fuel can sustain them, "
            "leading to flame detachment, unstable flickering, and blow-off extinction."
        ),
        "source": "NASA/TM-20210011385, Table 7.1 & Section 7.0"
    },
    {
        "id": "fuel_flammability_rankings",
        "title": "Material Flammability in Microgravity: PMMA, SIBAL, and Nomex",
        "keywords": ["material", "pmma", "sibal", "nomex", "cotton", "thickness", "slab", "film", "rod"],
        "content": (
            "NASA PSI-25 systematically benchmarked different spacecraft materials:\n"
            "1. SIBAL Fabric (75% cotton / 25% fiberglass): Burns readily with vigorous concurrent spread even down to ~17% O2.\n"
            "2. Thin PMMA Film (100-400 um): Thermally thin fuel that ignites rapidly, spreads fast (~1-2 mm/s), and exhibits sensitive radiative extinction.\n"
            "3. Thick PMMA Slabs and Rods (1mm to 12.7mm): Thermally thick fuels requiring sustained conductive heat flux into solid depth. Spread rates are an order of magnitude lower (~0.05-0.3 mm/s).\n"
            "4. Nomex III: Fire-resistant aramid material. In BASS-II tests F1 and F2, Nomex ignited momentarily under electrical igniter contact but completely self-extinguished without flame propagation even in 22% O2."
        ),
        "source": "NASA/TM-20210011385, Section 1.0 & Appendix A"
    },
    {
        "id": "sensor_combustion_products",
        "title": "Compound Specific Analyzer for Combustion Products (CSA-CP)",
        "keywords": ["sensor", "csa-cp", "co", "co2", "oxygen", "ppm", "toxic", "carbon monoxide", "anomaly"],
        "content": (
            "Astronaut safety protocols utilize the CSA-CP sensor for real-time monitoring of ISS cabin atmosphere. "
            "Key combustion markers:\n"
            "- Carbon Monoxide (CO): Normal cabin is < 2 ppm. An elevation to 15-50 ppm indicates smoldering or incomplete combustion. Above 100 ppm is an emergency.\n"
            "- Oxygen (O2): Nominal 21.0% by vol. A steady drop of > 0.5% without nitrogen purge indicates oxygen consumption by a reaction.\n"
            "- Carbon Dioxide (CO2): Monitored by the CDM (Carbon Dioxide Monitor). An upward surge coupled with CO confirms active oxidation."
        ),
        "source": "NASA/TM-20210011385, Section 1.4 & BASS-II data FAQ"
    },
    {
        "id": "emergency_fire_response",
        "title": "Spacecraft Fire Safety Emergency Procedures & Disclaimers",
        "keywords": ["procedure", "emergency", "extinguisher", "mask", "safety", "protocol", "alarm", "suppression"],
        "content": (
            "STANDARD NASA SPACECRAFT SAFETY DIRECTIVE:\n"
            "FIREWISE-X is an AI research decision-support tool, NOT an automated suppression trigger.\n"
            "In any suspected spacecraft fire event:\n"
            "1. Don emergency breathing apparatus (PBAs / Oxygen masks).\n"
            "2. Isolate ventilation in the affected module immediately (starves flame of forced flow).\n"
            "3. Confirm thermal or visual signatures.\n"
            "4. Utilize Portable Fire Extinguishers (Fine Water Mist / CO2) according to Mission Flight Rules."
        ),
        "source": "ISS Flight Rules, Emergency Operations Section 3"
    }
]

class AstronautAssistantRAG:
    def __init__(self):
        self.docs = KNOWLEDGE_DOCS
        self.experiments = []
        self._load_experiments()

    def _load_experiments(self):
        exp_path = os.path.join(DATA_DIR, "experiments_clean.json")
        if os.path.exists(exp_path):
            with open(exp_path, "r", encoding="utf-8") as f:
                self.experiments = json.load(f)

    def retrieve_context(self, query: str, top_k: int = 2) -> List[Dict[str, Any]]:
        """Retrieve most relevant scientific documentation chunks based on keyword overlap."""
        q_tokens = set(re.findall(r"\w+", query.lower()))
        scored_docs = []
        for doc in self.docs:
            score = 0
            for kw in doc["keywords"]:
                if kw in query.lower():
                    score += 3
            doc_tokens = set(re.findall(r"\w+", doc["content"].lower()))
            overlap = len(q_tokens.intersection(doc_tokens))
            score += overlap
            scored_docs.append((score, doc))

        scored_docs.sort(key=lambda x: x[0], reverse=True)
        return [doc for score, doc in scored_docs[:top_k] if score > 0]

    def find_specific_experiment(self, query: str) -> Optional[Dict[str, Any]]:
        """Look for exact test identifier e.g. B1, B12, T2, P1, M1 in query."""
        m = re.search(r"\b([BFPOMT]\d+[a-z]?)\b", query, re.IGNORECASE)
        if m:
            target_id = m.group(1).upper()
            # Prevent false positive for chemical molecules O2, CO2, CO
            if target_id in ["O2", "CO2", "CO"] and "test" not in query.lower():
                return None
            for exp in self.experiments:
                if exp["test_id"] == target_id:
                    return exp
        return None

    def analyze_sensor_telemetry(self, 
                                 current_o2_pct: float, 
                                 current_co_ppm: float, 
                                 current_co2_pct: float = 0.35,
                                 airflow_cm_s: float = 5.0,
                                 radiometer_mv: float = 0.0) -> Dict[str, Any]:
        """
        Analyze live or simulated sensor telemetry to distinguish true combustion 
        from sensor anomalies, drift, or normal atmospheric variations.
        """
        deviations = []
        severity = "NORMAL"
        confidence = 0.95
        fire_probability = 0.05
        recommendations = []

        # 1. CO Assessment (primary sensitive marker)
        co_delta = current_co_ppm - ISS_BASELINES["co_nominal_ppm"]
        if current_co_ppm >= ISS_BASELINES["co_emergency_ppm"]:
            severity = "CRITICAL"
            fire_probability = 0.96
            deviations.append(f"EXTREME DANGER: Cabin CO level is {current_co_ppm:.1f} ppm (critical threshold: 100 ppm).")
            recommendations.append("Immediate crew action: Don emergency oxygen masks (PBA).")
            recommendations.append("Isolate module ventilation and prepare fire extinguisher.")
        elif current_co_ppm >= ISS_BASELINES["co_warning_ppm"]:
            severity = "WARNING"
            fire_probability = 0.85
            deviations.append(f"WARNING: CO elevation to {current_co_ppm:.1f} ppm exceeds safety threshold (50 ppm).")
            recommendations.append("Verify visual / thermal sensors in active experiments.")
            recommendations.append("Inspect MSG glovebox seals and duct ventilation.")
        elif current_co_ppm >= ISS_BASELINES["co_caution_ppm"]:
            severity = "CAUTION"
            fire_probability = 0.45
            deviations.append(f"CAUTION: Measurable CO ({current_co_ppm:.1f} ppm) above nominal background (< 2 ppm).")
            recommendations.append("Cross-check redundant CSA-CP sensors to rule out sensor drift.")

        # 2. O2 Assessment
        if current_o2_pct < 18.0:
            deviations.append(f"O2 Depletion ({current_o2_pct:.1f}%): Hypoxia risk for crew; below microgravity combustion self-sustaining limit.")
            if severity != "CRITICAL":
                severity = "WARNING"
        elif current_o2_pct > 23.5:
            deviations.append(f"O2 Enrichment ({current_o2_pct:.1f}%): Severe hyperoxia hazard; material ignition delay is sharply reduced.")
            severity = "CRITICAL"

        # 3. Radiometer & CO Correlation
        if radiometer_mv > 50.0 and current_co_ppm > 10.0:
            deviations.append(f"Active IR Radiation: Radiometer signal ({radiometer_mv:.1f} mV) corroborates thermal flame heat release.")
            fire_probability = max(fire_probability, 0.92)
        elif radiometer_mv > 50.0 and current_co_ppm <= 2.0:
            deviations.append("Thermal anomaly without CO elevation: Likely electrical heater or illuminator saturation rather than open flame.")
            fire_probability = min(fire_probability, 0.25)

        if not deviations:
            deviations.append("All sensor channels within nominal ISS atmospheric baseline tolerances.")
            recommendations.append("Continue standard orbital environment monitoring.")

        return {
            "telemetry": {
                "o2_pct": current_o2_pct,
                "co_ppm": current_co_ppm,
                "co2_pct": current_co2_pct,
                "airflow_cm_s": airflow_cm_s,
                "radiometer_mv": radiometer_mv
            },
            "hazard_severity": severity,
            "fire_event_probability": round(fire_probability, 2),
            "assessment_confidence": round(confidence, 2),
            "detected_deviations": deviations,
            "action_recommendations": recommendations,
            "disclaimer": "AI sensor assessment advisory only. Certified mission flight rules and crew safety override automated tools."
        }

    def generate_chat_response(self, user_message: str, chat_history: List[Dict[str, str]] = None) -> Dict[str, Any]:
        """
        Generate grounded, domain-specific Astronaut AI Assistant response.
        """
        clean_msg = user_message.strip()
        
        # Check if user query asks about a specific experiment ID
        exp = self.find_specific_experiment(clean_msg)
        if exp:
            vid_status = "Linked video available in Flame Studio." if exp["has_video"] else "No video recorded for this run."
            reply = (
                f"### NASA PSI-25 Experiment Record: **{exp['test_id']}**\n\n"
                f"- **Principal Investigator:** {exp['pi']}\n"
                f"- **Material:** {exp['fuel_material_raw']} ({exp['material_category']})\n"
                f"- **Dimensions:** Thickness {exp['thickness_mm']} mm, Width {exp['width_cm']} cm\n"
                f"- **Flow Conditions:** {exp['airflow_velocity_cm_s']} cm/s ({exp['flow_geometry']} geometry, Restrictor {exp['flow_restrictor']})\n"
                f"- **Atmosphere:** Initial O₂ {exp['calibrated_initial_o2_vol_pct']}%, Final O₂ {exp['calibrated_final_o2_vol_pct']}%\n"
                f"- **Sensors:** ΔCO = {exp['co_delta_ppm']} ppm, Burn Duration = {exp['burn_duration_s']} s\n"
                f"- **Outcome:** **{exp['outcome_description']}**\n\n"
                f"**NASA Flight Observations:**\n> {exp['observations']}\n\n"
                f"*{vid_status}*"
            )
            return {
                "response": reply,
                "grounding_sources": [f"NASA PSI-25 BASS-II Test Matrix & Summary Report (Test {exp['test_id']})"],
                "experiment_id": exp["test_id"],
                "confidence": 0.98
            }

        # Check for sensor-related input
        co_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:ppm|co\b)", clean_msg, re.IGNORECASE)
        o2_match = re.search(r"(\d+(?:\.\d+)?)\s*%", clean_msg)
        if ("sensor" in clean_msg.lower() or "telemetry" in clean_msg.lower() or "reading" in clean_msg.lower()) and (co_match or o2_match):
            co_val = float(co_match.group(1)) if co_match else 0.0
            o2_val = float(o2_match.group(1)) if o2_match else 21.0
            diag = self.analyze_sensor_telemetry(current_o2_pct=o2_val, current_co_ppm=co_val)
            
            reply = (
                f"### Sensor Telemetry Analysis\n\n"
                f"- **Hazard Status:** **{diag['hazard_severity']}** (Fire Probability: {diag['fire_event_probability'] * 100:.0f}%)\n"
                f"- **Evaluated Parameters:** O₂ = {o2_val}%, CO = {co_val} ppm\n\n"
                f"**Detected Anomalies & Implications:**\n" +
                "\n".join([f"- {d}" for d in diag['detected_deviations']]) + "\n\n"
                f"**Safety Protocols:**\n" +
                "\n".join([f"1. {a}" if i==0 else f"2. {a}" for i, a in enumerate(diag['action_recommendations'])]) + "\n\n"
                f"> **Safety Notice:** {diag['disclaimer']}"
            )
            return {
                "response": reply,
                "grounding_sources": ["NASA CSA-CP Sensor Operating Manual", "ISS Emergency Flight Rules Chapter 3"],
                "confidence": diag["assessment_confidence"]
            }

        # Knowledge retrieval
        retrieved = self.retrieve_context(clean_msg)
        if retrieved:
            primary_doc = retrieved[0]
            sources = [doc["source"] for doc in retrieved]
            
            # Synthesize grounded answer
            reply = (
                f"### {primary_doc['title']}\n\n"
                f"{primary_doc['content']}\n\n"
            )
            if len(retrieved) > 1:
                reply += f"**Complementary Scientific Context:**\n{retrieved[1]['content']}\n\n"

            reply += f"*(Grounded in: {', '.join(sources)})*"
            return {
                "response": reply,
                "grounding_sources": sources,
                "confidence": 0.92
            }

        # Fallback comprehensive domain overview
        return {
            "response": (
                "I am the FIREWISE-X Astronaut Fire Safety Assistant, grounded in data from NASA's PSI-25 "
                "BASS-II microgravity combustion flight experiments.\n\n"
                "I can assist you with:\n"
                "1. **Combustion Physics:** Explaining microgravity flame dynamics, lack of buoyant convection, and the low-flow radiative extinction limit.\n"
                "2. **Specific Test Inquiries:** Ask about any BASS-II test (e.g., 'What happened in test B1 or T1?').\n"
                "3. **Sensor Interpretation:** Evaluate simulated or real telemetry (e.g., 'Analyze readings: O2 18.5%, CO 35 ppm').\n"
                "4. **Material Flammability:** Compare space materials (PMMA thin films, thick slabs, rods, SIBAL cotton-fiberglass, and fire-retardant Nomex III).\n\n"
                "What would you like to investigate?"
            ),
            "grounding_sources": ["NASA PSI-25 BASS-II Knowledge Base"],
            "confidence": 0.90
        }

if __name__ == "__main__":
    assistant = AstronautAssistantRAG()
    res1 = assistant.generate_chat_response("What happened in test B12?")
    print("--- Test B12 Query ---")
    print(res1["response"])
    print("\n--- Sensor Anomaly Query ---")
    res2 = assistant.generate_chat_response("Analyze sensor reading: O2 18.2%, CO 65 ppm")
    print(res2["response"])
