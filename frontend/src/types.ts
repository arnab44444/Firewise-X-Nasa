export interface Experiment {
  id: number;
  test_id: string;
  pi: string;
  date: string;
  gmt: number;
  sample_number: string;
  fuel_material_raw: string;
  material_category: string;
  thickness_mm: number;
  width_cm: number;
  flow_geometry: string;
  flow_restrictor: number;
  fan_display: string;
  air_display: string;
  airflow_velocity_cm_s: number;
  radiometer_gain: string;
  calibrated_initial_o2_vol_pct: number;
  calibrated_final_o2_vol_pct: number;
  o2_delta_vol_pct: number;
  initial_co_ppm: number;
  final_co_ppm: number;
  co_delta_ppm: number;
  outcome: string;
  outcome_confidence: number;
  outcome_description: string;
  spread_rate_cm_s: number;
  burn_duration_s: number;
  observations: string;
  has_video: boolean;
  main_video: string | null;
  main_video_path: string | null;
  still_sequence: string | null;
  video_size_mb: number;
}

export interface SystemStatus {
  platform: string;
  status: string;
  scientific_foundation: string;
  facility: string;
  models: {
    model_1_flame_cv: string;
    model_2_combustion_predictor: string;
    model_3_temporal_analyzer: string;
    model_4_multimodal_fusion: string;
    model_5_explainable_ai: string;
  };
  dataset_statistics: {
    total_nasa_experiments: number;
    video_enabled_tests: number;
    precomputed_video_analyses: number;
    principal_investigators: string[];
    materials_tested: string[];
  };
  model_performance: {
    total_training_samples: number;
    cv_classification_accuracy: number;
    cv_burn_duration_r2: number;
    cv_spread_rate_r2: number;
    feature_count: number;
    classes: string[];
  };
}

export interface VideoInfo {
  test_id: string;
  pi: string;
  material: string;
  material_category: string;
  filename: string;
  size_mb: number;
  initial_o2: number;
  airflow_cm_s: number;
  pre_analyzed: boolean;
  video_url: string;
}

export interface FlameTimelinePoint {
  frame: number;
  time_s: number;
  flame_detected: boolean;
  flame_area_cm2: number;
  flame_area_px: number;
  centroid_x: number;
  centroid_y: number;
  bbox: [number, number, number, number];
  aspect_ratio: number;
  spread_velocity_cm_s: number;
  growth_rate_da_dt: number;
}

export interface FlameAnalysisResult {
  test_id?: string;
  material?: string;
  oxygen_pct?: number;
  airflow_cm_s?: number;
  video_metadata: {
    total_frames: number;
    fps: number;
    resolution: string;
    duration_s: number;
    samples_analyzed: number;
  };
  summary: {
    max_flame_area_cm2: number;
    avg_flame_area_cm2: number;
    peak_area_timestamp_s: number;
    extinction_detected: boolean;
    extinction_time_s: number | null;
    flame_stability: string;
  };
  anomalies: Array<{
    type: string;
    severity: string;
    time_s?: number;
    description: string;
  }>;
  timeline: FlameTimelinePoint[];
}

export interface ScenarioInputData {
  material: string;
  thickness_mm: number;
  airflow_velocity_cm_s: number;
  oxygen_vol_pct: number;
  width_cm: number;
  flow_restrictor: number;
}

export interface PredictionResult {
  inputs: ScenarioInputData & { flow_geometry: string };
  prediction: {
    outcome_code: string;
    outcome_label: string;
    confidence: number;
    outcome_probabilities: Record<string, number>;
    predicted_duration_s: number;
    predicted_spread_rate_cm_s: number;
    predicted_spread_rate_uncertainty: number;
    predicted_co_delta_ppm: number;
    predicted_co_uncertainty: number;
    scientific_rationale: string;
  };
  explainability: {
    top_influencing_variables: Array<{
      feature: string;
      importance: number;
    }>;
    closest_nasa_experiments: Array<{
      test_id: string;
      pi: string;
      material: string;
      actual_o2: number;
      actual_airflow: number;
      actual_outcome: string;
      actual_duration_s: number;
      observations: string;
      similarity_score: number;
    }>;
    scientific_limitations: string;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  grounding_sources?: string[];
  timestamp: string;
  confidence?: number;
}

export interface SensorAnalysisResult {
  telemetry: {
    o2_pct: number;
    co_ppm: number;
    co2_pct: number;
    airflow_cm_s: number;
    radiometer_mv: number;
  };
  hazard_severity: 'NORMAL' | 'CAUTION' | 'WARNING' | 'CRITICAL';
  fire_event_probability: number;
  assessment_confidence: number;
  detected_deviations: string[];
  action_recommendations: string[];
  disclaimer: string;
}
