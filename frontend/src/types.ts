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
  timing_synchronization: string;
  models: {
    model_1_flame_cv: string;
    model_2_combustion_lookup: string;
    model_3_temporal_analyzer: string;
    model_4_multimodal_fusion: string;
    model_5_explainable_ai: string;
  };
  dataset_statistics: {
    total_nasa_experiments: number;
    video_enabled_tests: number;
    total_raw_video_files: number;
    unique_test_runs_with_video: number;
    precomputed_video_analyses: number;
    principal_investigators: string[];
    materials_tested: string[];
  };
  model_performance: {
    evaluation_method: string;
    loo_outcome_accuracy: number;
    flame_mask_iou: number;
    notes: string;
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
  width_cm?: number;
  flow_restrictor?: number;
}

export interface LookupMatchRun {
  test_id: string;
  pi: string;
  fuel_material_raw: string;
  material_category: string;
  measured_thickness_mm: number;
  measured_airflow_cm_s: number;
  measured_initial_o2_vol_pct: number;
  measured_final_o2_vol_pct: number;
  measured_o2_delta: number;
  measured_co_delta_ppm: number;
  measured_burn_duration_s: number;
  measured_spread_rate_cm_s: number;
  observed_outcome: string;
  flight_observations: string;
  paper_reference: string;
  parameter_delta: {
    delta_o2: number;
    delta_airflow: number;
    delta_thickness: number;
  };
  has_video: boolean;
}

export interface LookupResponse {
  inputs: ScenarioInputData;
  range_validation: {
    within_tested_envelope: boolean;
    range_warnings: string[];
  };
  lookup_result: {
    primary_match_test_id: string;
    observed_outcome: string;
    outcome_label: string;
    measured_burn_duration_s: number;
    measured_spread_rate_cm_s: number;
    measured_co_delta_ppm: number;
    factual_summary: string;
  };
  matched_historical_runs: LookupMatchRun[];
  scientific_limitations: string;
}

export interface ChatResponse {
  response: string;
  source_page?: string | null;
  refused: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  source_page?: string | null;
  timestamp: string;
  refused?: boolean;
}

export interface EvidenceCardData {
  test_id: string;
  pi: string;
  paper_page: string;
  what_was_observed: string;
  rule_flagged: string;
  conditions: {
    fuel_material: string;
    thickness_mm: number;
    ambient_o2_vol_pct: number;
    airflow_velocity_cm_s: number;
    flow_restrictor: number;
    flow_geometry: string;
  };
  measurements: {
    burn_duration_s: number;
    o2_delta_vol_pct: number;
    co_delta_ppm: number;
    observed_outcome: string;
  };
  what_it_supports: string;
  scientific_limits: string;
  next_step_for_researcher: string;
}

export interface ValidationData {
  flame_segmentation_validation: {
    total_benchmark_frames: number;
    mean_intersection_over_union_iou: number;
    mean_area_error_pct: number;
    burned_in_text_masked: boolean;
    benchmark_frames: Array<{
      frame_id: string;
      test_id: string;
      gt_bbox: number[];
      pred_bbox: number[];
      iou: number;
      error_pct: number;
    }>;
  };
  lookup_engine_validation: {
    total_runs_evaluated: number;
    correct_outcome_matches: number;
    leave_one_out_accuracy: number;
    sample_failure_cases: Array<{
      tested_id: string;
      actual_outcome: string;
      nearest_id: string;
      nearest_outcome: string;
      conditions: string;
    }>;
  };
  documented_failure_case: {
    test_id: string;
    scenario: string;
    what_happened: string;
    lesson_for_researchers: string;
  };
  documented_refusal_case: {
    query: string;
    system_response: string;
    confidence_badge: null;
    refusal_reason: string;
  };
}
