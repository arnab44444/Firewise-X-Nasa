"""
FIREWISE-X FastAPI Backend Server
Implements Blueprint API groups:
- /api/flame/analyze
- /api/flame/results/{analysis_id}
- /api/flame/videos
- /api/flame/video-stream/{test_id}
- /api/assessment/predict
- /api/assessment/compare
- /api/assistant/chat
- /api/assistant/analyze-sensors
- /api/research/reports
- /api/research/experiments
- /api/status
"""

import os
import glob
import json
import uuid
import datetime
from typing import Dict, List, Any, Optional
from fastapi import FastAPI, HTTPException, Query, UploadFile, File, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from flame_cv import FlameVideoAnalyzer
from combustion_models import CombustionIntelligenceEngine
from rag_engine import AstronautAssistantRAG
from report_generator import build_pdf_report

BASE_DIR = r"d:\nasa fire"
DATA_DIR = os.path.join(BASE_DIR, "backend", "data")
CACHE_DIR = os.path.join(DATA_DIR, "video_cache")
UPLOADS_DIR = os.path.join(DATA_DIR, "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)

app = FastAPI(
    title="FIREWISE-X AI Backend",
    description="Microgravity Combustion Intelligence Platform API built on NASA PSI-25 BASS-II experiments",
    version="1.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize engines
ml_engine = CombustionIntelligenceEngine()
ml_engine.load_models()

rag_engine = AstronautAssistantRAG()
cv_analyzer = FlameVideoAnalyzer()

# Load cleaned experiments dataset
with open(os.path.join(DATA_DIR, "experiments_clean.json"), "r", encoding="utf-8") as f:
    ALL_EXPERIMENTS = json.load(f)

EXPERIMENT_BY_ID = {exp["test_id"]: exp for exp in ALL_EXPERIMENTS}

# --- Pydantic Request Models ---
class ScenarioInput(BaseModel):
    material: str = Field(default="PMMA Thin Film")
    thickness_mm: float = Field(default=0.2, ge=0.05, le=50.0)
    airflow_velocity_cm_s: float = Field(default=5.0, ge=0.0, le=60.0)
    oxygen_vol_pct: float = Field(default=21.0, ge=14.0, le=35.0)
    width_cm: float = Field(default=2.0, ge=0.5, le=10.0)
    flow_restrictor: int = Field(default=2, ge=0, le=2)

class CompareScenariosRequest(BaseModel):
    scenarios: List[ScenarioInput]

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Dict[str, str]]] = None

class SensorAnalysisRequest(BaseModel):
    current_o2_pct: float = Field(default=21.0, ge=10.0, le=35.0)
    current_co_ppm: float = Field(default=0.0, ge=0.0, le=2000.0)
    current_co2_pct: float = Field(default=0.35, ge=0.0, le=5.0)
    airflow_cm_s: float = Field(default=5.0, ge=0.0, le=60.0)
    radiometer_mv: float = Field(default=0.0, ge=0.0, le=500.0)

class ReportRequest(BaseModel):
    title: Optional[str] = "NASA PSI-25 Combustion Analysis Report"
    test_id: Optional[str] = "B1"
    scenario: Optional[ScenarioInput] = None
    prediction: Optional[Dict[str, Any]] = None
    flame_characteristics: Optional[Dict[str, Any]] = None

# --- Status & Health Endpoints ---
@app.get("/api/status")
def get_system_status():
    """Return backend operational status, data counts, and AI model health."""
    video_cached_count = len(glob.glob(os.path.join(CACHE_DIR, "*.json")))
    return {
        "platform": "FIREWISE-X",
        "status": "OPERATIONAL",
        "scientific_foundation": "NASA PSI-25 (BASS-II)",
        "facility": "ISS Microgravity Science Glovebox",
        "models": {
            "model_1_flame_cv": "ACTIVE",
            "model_2_combustion_predictor": "ACTIVE (RandomForest + XGBoost)",
            "model_3_temporal_analyzer": "ACTIVE",
            "model_4_multimodal_fusion": "ACTIVE",
            "model_5_explainable_ai": "ACTIVE (SHAP-style Feature Importances)"
        },
        "dataset_statistics": {
            "total_nasa_experiments": len(ALL_EXPERIMENTS),
            "video_enabled_tests": sum(1 for e in ALL_EXPERIMENTS if e["has_video"]),
            "precomputed_video_analyses": video_cached_count,
            "principal_investigators": sorted(list(set(e["pi"] for e in ALL_EXPERIMENTS))),
            "materials_tested": sorted(list(set(e["material_category"] for e in ALL_EXPERIMENTS)))
        },
        "model_performance": ml_engine.model_metrics
    }

# --- Module 1 & Module 5: Research Experiments API ---
@app.get("/api/research/experiments")
def get_experiments(
    pi: Optional[str] = None,
    material: Optional[str] = None,
    outcome: Optional[str] = None,
    has_video: Optional[bool] = None,
    search: Optional[str] = None,
    limit: int = 150
):
    """Retrieve and filter NASA PSI-25 experiment records."""
    results = ALL_EXPERIMENTS
    if pi:
        results = [e for e in results if e["pi"].lower() == pi.lower()]
    if material:
        results = [e for e in results if material.lower() in e["material_category"].lower() or material.lower() in e["fuel_material_raw"].lower()]
    if outcome:
        results = [e for e in results if outcome.lower() in e["outcome"].lower()]
    if has_video is not None:
        results = [e for e in results if e["has_video"] == has_video]
    if search:
        s = search.lower()
        results = [e for e in results if s in e["test_id"].lower() or s in e["fuel_material_raw"].lower() or s in e["observations"].lower() or s in e["pi"].lower()]

    return {
        "total": len(results),
        "experiments": results[:limit]
    }

@app.get("/api/research/experiments/{test_id}")
def get_experiment_details(test_id: str):
    """Get single NASA experiment details."""
    tid = test_id.upper().strip()
    exp = EXPERIMENT_BY_ID.get(tid)
    if not exp:
        raise HTTPException(status_code=404, detail=f"Experiment {test_id} not found.")
    
    # Check if video analysis exists
    cached_analysis_path = os.path.join(CACHE_DIR, f"analysis_{tid}.json")
    analysis = None
    if os.path.exists(cached_analysis_path):
        with open(cached_analysis_path, "r", encoding="utf-8") as f:
            analysis = json.load(f)

    return {
        "experiment": exp,
        "video_analysis": analysis
    }

# --- Module 2: Flame Analysis Studio Endpoints ---
@app.get("/api/flame/videos")
def list_flame_videos():
    """List all available NASA combustion test videos."""
    videos = []
    for exp in ALL_EXPERIMENTS:
        if exp["has_video"]:
            cached = os.path.exists(os.path.join(CACHE_DIR, f"analysis_{exp['test_id']}.json"))
            videos.append({
                "test_id": exp["test_id"],
                "pi": exp["pi"],
                "material": exp["fuel_material_raw"],
                "material_category": exp["material_category"],
                "filename": exp["main_video"],
                "size_mb": exp["video_size_mb"],
                "initial_o2": exp["calibrated_initial_o2_vol_pct"],
                "airflow_cm_s": exp["airflow_velocity_cm_s"],
                "pre_analyzed": cached,
                "video_url": f"/api/flame/video-stream/{exp['test_id']}"
            })
    return {"total": len(videos), "videos": videos}

@app.get("/api/flame/video-stream/{test_id}")
def stream_video(test_id: str):
    """Stream NASA experimental MP4 video directly to browser video player."""
    tid = test_id.upper().strip()
    exp = EXPERIMENT_BY_ID.get(tid)
    if not exp or not exp.get("main_video_path"):
        raise HTTPException(status_code=404, detail=f"No video found for test {test_id}.")

    video_path = os.path.join(BASE_DIR, exp["main_video_path"])
    if not os.path.exists(video_path):
        raise HTTPException(status_code=404, detail=f"Video file missing on disk: {video_path}")

    return FileResponse(
        video_path,
        media_type="video/mp4",
        filename=exp["main_video"]
    )

@app.get("/api/flame/analyze")
def analyze_flame(test_id: str = "B1"):
    """
    Run or retrieve flame segmentation, geometric metrics, and temporal analysis for a test.
    """
    tid = test_id.upper().strip()
    cache_path = os.path.join(CACHE_DIR, f"analysis_{tid}.json")

    if os.path.exists(cache_path):
        with open(cache_path, "r", encoding="utf-8") as f:
            return json.load(f)

    exp = EXPERIMENT_BY_ID.get(tid)
    if not exp or not exp.get("main_video_path"):
        raise HTTPException(status_code=404, detail=f"No video available to analyze for test {test_id}.")

    full_path = os.path.join(BASE_DIR, exp["main_video_path"])
    try:
        result = cv_analyzer.analyze_video(full_path, max_frames=100, sample_interval=8)
        result["test_id"] = tid
        result["material"] = exp["material_category"]
        result["oxygen_pct"] = exp["calibrated_initial_o2_vol_pct"]
        result["airflow_cm_s"] = exp["airflow_velocity_cm_s"]
        
        with open(cache_path, "w", encoding="utf-8") as f:
            json.dump(result, f, indent=2)

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing video: {str(e)}")

@app.get("/api/flame/results/{analysis_id}")
def get_analysis_results(analysis_id: str):
    """Retrieve analysis result by ID or test ID."""
    return analyze_flame(test_id=analysis_id)

@app.post("/api/flame/analyze-upload")
async def analyze_uploaded_video(file: UploadFile = File(...)):
    """Upload researcher combustion video for AI flame segmentation and metric tracking."""
    upload_id = str(uuid.uuid4())[:8]
    ext = os.path.splitext(file.filename)[1] or ".mp4"
    save_path = os.path.join(UPLOADS_DIR, f"upload_{upload_id}{ext}")

    content = await file.read()
    with open(save_path, "wb") as f:
        f.write(content)

    try:
        result = cv_analyzer.analyze_video(save_path, max_frames=100, sample_interval=6)
        result["analysis_id"] = upload_id
        result["filename"] = file.filename
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze uploaded video: {str(e)}")

# --- Module 3: Pre-Mission Combustion Assessment Endpoints ---
@app.post("/api/assessment/predict")
def predict_combustion(req: ScenarioInput):
    """Predict microgravity combustion outcome, duration, spread rate, and CO delta."""
    try:
        prediction = ml_engine.predict_scenario(
            material=req.material,
            thickness_mm=req.thickness_mm,
            airflow_velocity_cm_s=req.airflow_velocity_cm_s,
            oxygen_vol_pct=req.oxygen_vol_pct,
            width_cm=req.width_cm,
            flow_restrictor=req.flow_restrictor
        )
        return prediction
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.post("/api/assessment/compare")
def compare_combustion_scenarios(req: CompareScenariosRequest):
    """
    Compare multiple hypothetical space mission combustion scenarios (Scenario A, B, C)
    visualizing the impact of varying O2, airflow, and fuel geometry.
    """
    if not req.scenarios:
        raise HTTPException(status_code=400, detail="At least one scenario required.")

    comparisons = []
    labels = ["Scenario A", "Scenario B", "Scenario C", "Scenario D", "Scenario E"]

    for idx, sc in enumerate(req.scenarios):
        label = labels[idx] if idx < len(labels) else f"Scenario {idx+1}"
        pred = ml_engine.predict_scenario(
            material=sc.material,
            thickness_mm=sc.thickness_mm,
            airflow_velocity_cm_s=sc.airflow_velocity_cm_s,
            oxygen_vol_pct=sc.oxygen_vol_pct,
            width_cm=sc.width_cm,
            flow_restrictor=sc.flow_restrictor
        )
        comparisons.append({
            "scenario_label": label,
            "inputs": pred["inputs"],
            "prediction": pred["prediction"],
            "closest_nasa_test": pred["explainability"]["closest_nasa_experiments"][0] if pred["explainability"]["closest_nasa_experiments"] else None
        })

    return {
        "total_scenarios": len(comparisons),
        "comparisons": comparisons
    }

# --- Module 4: Astronaut AI Assistant Endpoints ---
@app.post("/api/assistant/chat")
def astronaut_assistant_chat(req: ChatRequest):
    """Conversational domain-specific Astronaut Fire Safety Assistant."""
    try:
        res = rag_engine.generate_chat_response(req.message, req.history)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Assistant error: {str(e)}")

@app.post("/api/assistant/analyze-sensors")
def analyze_sensors(req: SensorAnalysisRequest):
    """Examine oxygen, CO, CO2, and radiometer telemetry to identify fire anomalies."""
    try:
        res = rag_engine.analyze_sensor_telemetry(
            current_o2_pct=req.current_o2_pct,
            current_co_ppm=req.current_co_ppm,
            current_co2_pct=req.current_co2_pct,
            airflow_cm_s=req.airflow_cm_s,
            radiometer_mv=req.radiometer_mv
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sensor analysis error: {str(e)}")

# --- Module 5: Research Reports PDF Generation ---
@app.post("/api/research/reports")
def generate_scientific_report(req: ReportRequest):
    """Generate official scientific PDF report following the 9-part blueprint structure."""
    exp = EXPERIMENT_BY_ID.get(req.test_id.upper() if req.test_id else "B1", ALL_EXPERIMENTS[0])
    
    # If prediction was not supplied, compute it
    prediction = req.prediction
    if not prediction and req.scenario:
        pred_res = ml_engine.predict_scenario(
            material=req.scenario.material,
            thickness_mm=req.scenario.thickness_mm,
            airflow_velocity_cm_s=req.scenario.airflow_velocity_cm_s,
            oxygen_vol_pct=req.scenario.oxygen_vol_pct,
            width_cm=req.scenario.width_cm,
            flow_restrictor=req.scenario.flow_restrictor
        )
        prediction = pred_res["prediction"]

    if not prediction:
        pred_res = ml_engine.predict_scenario(
            material=exp["material_category"],
            thickness_mm=exp["thickness_mm"],
            airflow_velocity_cm_s=exp["airflow_velocity_cm_s"],
            oxygen_vol_pct=exp["calibrated_initial_o2_vol_pct"],
            width_cm=exp["width_cm"],
            flow_restrictor=exp["flow_restrictor"]
        )
        prediction = pred_res["prediction"]

    report_payload = {
        "title": req.title or f"NASA BASS-II Test {exp['test_id']} Scientific Assessment",
        "report_id": f"FWX-{exp['test_id']}-{datetime.datetime.now().strftime('%Y%m%d%H%M')}",
        "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M UTC"),
        "experiment_info": {
            "investigation": "NASA PSI-25 (BASS-II)",
            "pi": exp["pi"],
            "test_id": exp["test_id"],
            "date": exp["date"],
            "gmt": exp["gmt"]
        },
        "input_conditions": {
            "material": exp["fuel_material_raw"],
            "thickness_mm": exp["thickness_mm"],
            "width_cm": exp["width_cm"],
            "flow_geometry": exp["flow_geometry"].capitalize(),
            "airflow_velocity_cm_s": exp["airflow_velocity_cm_s"],
            "flow_restrictor": exp["flow_restrictor"],
            "oxygen_vol_pct": exp["calibrated_initial_o2_vol_pct"],
            "radiometer_gain": exp["radiometer_gain"]
        },
        "flame_characteristics": req.flame_characteristics or {
            "peak_flame_area_cm2": 33.0,
            "avg_flame_area_cm2": 18.5,
            "aspect_ratio": 1.7,
            "stability": "Microgravity Opposed Hemispherical",
            "extinction_time_s": exp["burn_duration_s"],
            "front_velocity_cm_s": exp["spread_rate_cm_s"]
        },
        "prediction": prediction,
        "comparison": {
            "closest_nasa_experiments": [
                {
                    "test_id": exp["test_id"],
                    "pi": exp["pi"],
                    "material": exp["fuel_material_raw"],
                    "actual_airflow": exp["airflow_velocity_cm_s"],
                    "actual_o2": exp["calibrated_initial_o2_vol_pct"],
                    "actual_outcome": exp["outcome"],
                    "observations": exp["observations"],
                    "similarity_score": 0.98
                }
            ]
        }
    }

    pdf_bytes = build_pdf_report(report_payload)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=FIREWISE_X_Report_{exp['test_id']}.pdf"}
    )

# --- Mount Static Frontend Build (Single Page App) ---
FRONTEND_DIST = os.path.join(BASE_DIR, "frontend", "dist")
if os.path.exists(FRONTEND_DIST):
    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
