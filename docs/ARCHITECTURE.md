# Comprehensive System Architecture & UML / Database Specifications

**Happiest Health Digital Twin Challenge 2026**  
**Team**: Neuron  
**Lead**: Pratham Amritkar  

This document provides the exhaustive architectural, behavioral (UML dynamic), structural (UML static), and data (ER / Database) specifications for the **3D-First In-Silico Patient Digital Twin for Type 2 Diabetes Management**.

---

## Table of Contents
1. [Enterprise Healthcare Ecosystem Architecture](#1-enterprise-healthcare-ecosystem-architecture)
2. [Component & Layered Architecture](#2-component--layered-architecture)
3. [Deployment & Infrastructure Topology](#3-deployment--infrastructure-topology)
4. [UML Class Diagram: Domain Model & Contracts](#4-uml-class-diagram-domain-model--contracts)
5. [UML Sequence Diagram 1: Dual-Stream Ingestion & 2h Spike Prediction](#5-uml-sequence-diagram-1-dual-stream-ingestion--2h-spike-prediction)
6. [UML Sequence Diagram 2: In-Silico Intervention Simulation Workflow](#6-uml-sequence-diagram-2-in-silico-intervention-simulation-workflow)
7. [UML Sequence Diagram 3: Polymorphic Presentation Layer Transformation](#7-uml-sequence-diagram-3-polymorphic-presentation-layer-transformation)
8. [UML State Machine Diagram 1: Patient Glycemic Lifecycle](#8-uml-state-machine-diagram-1-patient-glycemic-lifecycle)
9. [UML State Machine Diagram 2: Multi-Gate Safety Patrol Engine](#9-uml-state-machine-diagram-2-multi-gate-safety-patrol-engine)
10. [UML Activity Diagram: Clinical Triage & Intervention Decision Flow](#10-uml-activity-diagram-clinical-triage--intervention-decision-flow)
11. [Database Entity-Relationship (ER) Diagram](#11-database-entity-relationship-er-diagram)
12. [Biophysical Multi-Compartment Metabolic Flux Architecture](#12-biophysical-multi-compartment-metabolic-flux-architecture)

---

## 1. Enterprise Healthcare Ecosystem Architecture

```mermaid
flowchart TD
    subgraph DataSources ["DPDP & HIPAA Compliant Data Producers"]
        Synthea["Synthea Synthetic EHR Engine<br/>(Demographics, HbA1c, Conditions, Meds)"]
        WearableIoT["Medical Wearables & IoT Gateway<br/>(Dexcom G7 ISF CGM, PPG HRV, Accelerometer)"]
    end

    subgraph SecurityBoundary ["DPDP 2023 / HIPAA Secure Boundary"]
        Anonymizer["De-Identification & Pseudonymization Unit"]
        AuditLog["Immutable Cryptographic Access Log"]
    end

    Synthea --> Anonymizer
    WearableIoT --> Anonymizer
    Anonymizer --> AuditLog

    subgraph DigitalTwinCore ["Digital Twin In-Silico Computation Engine"]
        IngestionSvc["Dual-Stream Ingestion Gateway (FastAPI)"]
        FeatureEngine["24-D Time-Series Feature Pipeline (Velocity, AUC, Circadian)"]
        MLInference["XGBoost + 10-Fold Bagging Ensemble"]
        SafetyPatrol["4-Gate Patrol Audit Engine (Confidence ≥ 0.70)"]
        SimulatorEngine["Pharmacokinetic & Counterfactual Simulator"]
    end

    Anonymizer --> IngestionSvc
    IngestionSvc --> FeatureEngine
    FeatureEngine --> MLInference
    MLInference --> SafetyPatrol
    FeatureEngine --> SimulatorEngine

    subgraph StateEngine ["Unified Reactive State Engine"]
        Context["DigitalTwinContext (Single Source of Truth)"]
    end

    SafetyPatrol --> Context
    SimulatorEngine --> Context

    subgraph PresentationLayer ["Polymorphic Presentation Layer (Next.js 14)"]
        Switch["TwinViewSwitch Controller (Key 'V')"]
        View3D["3D Spatial Holographic Twin (Three.js WebGL)"]
        ViewDash["Clinical Telemetry Dashboard (Recharts / Tables)"]
    end

    Context --> Switch
    Switch -->|3D Spatial Mode| View3D
    Switch -->|Analytical Mode| ViewDash

    subgraph Clinician ["End-User Interaction"]
        MD["Endocrinologist / Diabetologist / Patient"]
    end

    View3D <--> MD
    ViewDash <--> MD
```

---

## 2. Component & Layered Architecture

```mermaid
flowchart TD
    subgraph L1_Presentation ["Layer 1: Presentation & Visualization Layer"]
        Canvas3D["Twin3DCanvas.tsx (Three.js WebGL Mesh, Raycasting, Dynamic Aura)"]
        HUD["Spatial Telemetry HUD & Organ Inspector Drawer"]
        CGMComp["CGMChart.tsx (24h Area Chart, Target Bands 80-180 mg/dL)"]
        TableComp["PatientTable.tsx (Cohort Registry, Search, Risk Badging)"]
        PatrolComp["PatrolChecks.tsx (Model Audit & Human Review Verification)"]
        SimComp["SimulatePage.tsx (What-If Sliders & Forward 4h Forecast)"]
        Switcher["TwinViewSwitch.tsx (Segmented Pill, Spring Animation)"]
    end

    subgraph L2_State ["Layer 2: Reactive State & Domain Context"]
        Store["DigitalTwinContext.tsx (Patient State, Telemetry Buffers, Active Loci, View Mode)"]
        APIClient["lib/api.ts (Resilient HTTP Client with Exponential Backoff & Offline Fallback)"]
        MockEngine["lib/mockData.ts (Deterministic Clinical Synthesizer)"]
    end

    L1_Presentation <--> Store
    Store <--> APIClient
    APIClient -.->|Offline Fallback| MockEngine

    subgraph L3_Service ["Layer 3: Backend Services & API Gateway"]
        FastAPIApp["backend/main.py (FastAPI Application)"]
        PatientSvc["services/patients.py (EHR Ingestion & Window Slicing)"]
        PredictSvc["services/predictor.py (Real-time Feature Transformation)"]
    end

    APIClient <--> FastAPIApp
    FastAPIApp --> PatientSvc
    FastAPIApp --> PredictSvc

    subgraph L4_Algorithmic ["Layer 4: In-Silico Predictive & Simulation Core"]
        XGBModel["XGBoost Binary Spike Classifier (120-min Horizon)"]
        BaggingMeta["10-Estimator Bootstrap Aggregator (Calibrated Probability)"]
        SafetyEngine["Patrol Audit Engine (Gate Checking: Confidence, Hazard, Drift)"]
        ODESimulator["Metabolic Glucose-Insulin Flux Simulator"]
    end

    PredictSvc --> XGBModel
    XGBModel --> BaggingMeta
    BaggingMeta --> SafetyEngine
    FastAPIApp --> ODESimulator

    subgraph L5_Data ["Layer 5: Persistence & Synthetic Storage"]
        EHRStore[("patients.json (Synthetic EHR Records)")]
        CGMStore[("cgm_series.json (7-Day 5-min Sensor Telemetry)")]
    end

    PatientSvc --> EHRStore
    PatientSvc --> CGMStore
```

---

## 3. Deployment & Infrastructure Topology

```mermaid
flowchart LR
    subgraph ClientDevice ["Client Tier (Browser / Clinical Workstation)"]
        Browser["Next.js Web Client<br/>• React 18 SPA Engine<br/>• WebGL Three.js Canvas<br/>• LocalStorage View Prefs"]
    end

    subgraph EdgeTier ["Edge / CDN Tier"]
        VercelEdge["Next.js SSR & Static Edge Server<br/>• Route Handler Proxy<br/>• Compression & Caching"]
    end

    Browser <-->|HTTPS / TLS 1.3| VercelEdge

    subgraph ComputeCluster ["Compute Tier (Docker / Kubernetes Pods)"]
        BackendAPI["FastAPI Container (Uvicorn Worker)<br/>• Port 8000<br/>• Stateless REST Engine"]
        MLEngine["Python ML Runtime<br/>• XGBoost 2.0+<br/>• Scikit-learn Pipeline"]
    end

    VercelEdge <-->|Internal REST / JSON| BackendAPI
    BackendAPI <--> MLEngine

    subgraph StorageTier ["Data Persistence Tier"]
        TimescaleDB[("Time-Series Telemetry Store<br/>(Partitioned by Patient & 5-min Epoch)")]
        EHRDatabase[("EHR Relational Database<br/>(Demographics, Conditions, Meds)")]
    end

    BackendAPI <--> TimescaleDB
    BackendAPI <--> EHRDatabase
```

---

## 4. UML Class Diagram: Domain Model & Contracts

```mermaid
classDiagram
    class Patient {
        +string id
        +string name
        +int age
        +string sex
        +float bmi
        +float hba1c
        +float fasting_glucose
        +string[] medications
        +string[] conditions
        +float risk_score
        +RiskLevel risk_label
        +string last_seen
        +getMetabolicReserve() float
    }

    class CGMReading {
        +string patient_id
        +string timestamp
        +float glucose_mgdl
        +float hrv_ms
        +int steps
        +string sleep_stage
        +isExcursion() bool
        +isHypo() bool
    }

    class OrganStatus {
        +OrganId id
        +string name
        +string system
        +HealthStatus status
        +string value
        +string metric
        +string description
        +float[] position3D
        +string color
        +calculateLoad() float
    }

    class PredictionResult {
        +string patient_id
        +float spike_probability
        +PredictionLabel prediction
        +ConfidenceLabel confidence
        +bool requires_review
        +RiskLevel risk_level
        +string message
        +isActionable() bool
    }

    class SimulateRequest {
        +string patient_id
        +float meal_carbs_g
        +float exercise_minutes
        +float medication_dose_factor
    }

    class SimulateResult {
        +string patient_id
        +float baseline_probability
        +float adjusted_probability
        +float delta
        +ForecastPoint[] forecast_points
        +string intervention_summary
    }

    class ForecastPoint {
        +string time
        +float glucose_mgdl
        +bool is_forecast
    }

    class DigitalTwinContext {
        +ViewMode viewMode
        +string activePatientId
        +Patient activePatient
        +CGMReading[] readings
        +PredictionResult prediction
        +OrganStatus[] organStatuses
        +OrganStatus activeOrgan
        +CameraPreset cameraPreset
        +setViewMode(ViewMode mode)
        +toggleViewMode()
        +setActivePatient(string id)
        +setActiveOrgan(OrganStatus organ)
        +setCameraPreset(CameraPreset preset)
        +refreshData()
    }

    class PatrolEngine {
        +float confidence_gate
        +auditSpikeRisk(PredictionResult pred) bool
        +auditConfidence(PredictionResult pred) bool
        +auditTelemetryFreshness(CGMReading[] readings) bool
        +evaluateReviewGate(PredictionResult pred) bool
    }

    DigitalTwinContext "1" o-- "1" Patient : holds
    DigitalTwinContext "1" o-- "*" CGMReading : buffers
    DigitalTwinContext "1" o-- "1" PredictionResult : observes
    DigitalTwinContext "1" o-- "*" OrganStatus : spatializes
    SimulateResult "1" *-- "*" ForecastPoint : contains
    PatrolEngine ..> PredictionResult : audits
    PatrolEngine ..> CGMReading : inspects
```

---

## 5. UML Sequence Diagram 1: Dual-Stream Ingestion & 2h Spike Prediction

```mermaid
sequenceDiagram
    autonumber
    actor Patient as Diabetic Patient (Wearable Dexcom G7)
    participant Gateway as IoT & Wearables Gateway
    participant FastAPI as Backend API (/patients/{id}/predict)
    participant Pipeline as 24-D Feature Pipeline
    participant Ensemble as XGBoost + Bagging Model
    participant Patrol as 4-Gate Patrol Engine
    participant Store as DigitalTwinContext (State Store)
    participant UI as 3D Spatial Twin & HUD
    actor MD as Attending Endocrinologist

    Patient->>Gateway: Transmit 5-min ISF glucose + PPG HRV + Steps
    Gateway->>FastAPI: POST /telemetry (ingest reading)
    FastAPI->>Pipeline: Extract 60-min window (12 lags, dG/dt, AUC_60, HRV)
    Pipeline->>Ensemble: Ingest 24-D feature vector
    Ensemble->>Ensemble: Predict P(Spike_120m >= 180 mg/dL) + continuous curve
    Ensemble-->>Patrol: Return raw probability (e.g. 0.84) & confidence
    Patrol->>Patrol: Gate 1: Glucose > 180? (YES)<br/>Gate 2: Confidence >= 0.70? (YES)<br/>Gate 3: Requires Review? (YES)<br/>Gate 4: Assign CRITICAL
    Patrol-->>FastAPI: Return audited PredictionResult
    FastAPI-->>Store: Push state update via reactive hook
    Store->>UI: Update state: currentGlucose=215, spike_prob=84%
    UI->>UI: Shift 3D body aura to ROSE (#FB7185)<br/>Pulse Pancreatic locus halo<br/>Render HUD spike countdown: ~95 min
    UI->>MD: Display Visual Triage Alert & Audio Notification
    MD->>UI: Inspect 3D Pancreas locus & verify pre-prandial insulin dose
```

---

## 6. UML Sequence Diagram 2: In-Silico Intervention Simulation Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Clinician as Endocrinologist / Clinician
    participant SimPage as Simulate Page (/patients/{id}/simulate)
    participant Context as DigitalTwinContext
    participant Backend as FastAPI (/patients/{id}/simulate)
    participant ODE as In-Silico Pharmacokinetic Engine
    participant Recharts as Dynamic 4-Hour Forecast Chart

    Clinician->>SimPage: Open In-Silico Intervention Simulator
    SimPage->>Context: Retrieve active patient baseline (PT-0001: 84% spike risk)
    Clinician->>SimPage: Adjust Meal Carbs: 45g (-30g reduction)
    Clinician->>SimPage: Adjust Exercise: 35 min post-meal walk
    Clinician->>SimPage: Adjust Medication: 1.25x basal insulin factor
    Clinician->>SimPage: Click "Run In-Silico Simulation"
    SimPage->>Backend: POST /simulate {carbs: 45, exercise: 35, dose: 1.25}
    Backend->>ODE: Calculate carbohydrate flux delta (-0.12)<br/>Calculate GLUT4 muscle uptake delta (-0.18)<br/>Calculate insulin sensitivity factor (-0.08)
    ODE->>ODE: Recompute forward 4-hour trajectory curve (48 x 5-min intervals)
    ODE-->>Backend: Return adjusted_prob: 38%, delta: -46%
    Backend-->>SimPage: Return SimulateResult JSON
    SimPage->>Recharts: Render Baseline curve (red dashed) vs Adjusted curve (cyan solid)
    SimPage->>Clinician: Display Outcome: "Spike risk reduced from 84% to 38% (-46% delta)"
    Clinician->>SimPage: Save clinical prescription & send twin recommendation
```

---

## 7. UML Sequence Diagram 3: Polymorphic Presentation Layer Transformation

```mermaid
sequenceDiagram
    autonumber
    actor Clinician as Clinician / User
    participant Header as TwinViewSwitch Component
    participant Context as DigitalTwinContext (Single Source of Truth)
    participant Motion as Framer Motion AnimatePresence
    participant View3D as 3D Spatial Twin View (Three.js)
    participant ViewDash as Clinical Telemetry Dashboard View

    Note over Context: Initial State: viewMode = "3d-twin"
    Clinician->>Header: Press Hotkey 'V' or click "Clinical Dashboard" pill
    Header->>Context: toggleViewMode() -> setViewMode("dashboard")
    Context->>Context: Persist preference to localStorage ("dt_view_mode")
    Context->>Motion: Trigger exit animation on 3D View (opacity 1 -> 0, y -12px)
    Motion->>View3D: Unmount / pause WebGL render loop (preserve GPU memory)
    Motion->>ViewDash: Mount Dashboard with enter animation (opacity 0 -> 1, y 0px)
    ViewDash->>Context: Consume existing patient, readings & prediction (Zero re-fetch!)
    ViewDash->>Clinician: Render KPI Row, PatientTable, 24h CGM Chart & Alerts Feed
    Note over ViewDash: Clinician conducts cohort population triage...
    Clinician->>Header: Press 'V' to return to 3D Spatial Twin
    Header->>Context: toggleViewMode() -> setViewMode("3d-twin")
    Context->>Motion: Animate transition back to 3D View
    Motion->>View3D: Re-initialize WebGL canvas & resume Three.js requestAnimationFrame
    View3D->>Clinician: Render 3D Body Hologram with synchronized patient aura
```

---

## 8. UML State Machine Diagram 1: Patient Glycemic Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Normoglycemia : Fasting Glucose (80-130 mg/dL)

    Normoglycemia --> PrePrandialRising : Meal Ingestion (+30-60g Carbs)
    PrePrandialRising --> ImpendingSpikeWarning : dG/dt > 2.0 mg/dL/min & Forecast > 180 mg/dL
    
    state ImpendingSpikeWarning {
        [*] --> InSilicoPrediction
        InSilicoPrediction --> PatrolGateAudit : 120-min Horizon
        PatrolGateAudit --> AuraAmberAlert : Moderate Risk (50-70%)
        PatrolGateAudit --> AuraRoseCritical : High/Critical (>70%)
    }

    ImpendingSpikeWarning --> AcutePostPrandialSpike : No Intervention (Glucose > 180-250 mg/dL)
    ImpendingSpikeWarning --> RemissionRecovery : In-Silico Action (Walking / Pre-Bolus Insulin)

    AcutePostPrandialSpike --> ProlongedHyperglycemia : Severe Beta-cell Exhaustion
    AcutePostPrandialSpike --> EndogenousClearance : Insulin Action & GLUT4 Uptake

    EndogenousClearance --> Normoglycemia : Stabilized Target Band (80-180 mg/dL)
    EndogenousClearance --> NocturnalHypoglycemiaAlert : Excessive Insulin Stacking (Glucose < 70 mg/dL)

    NocturnalHypoglycemiaAlert --> AuraVioletCritical : Neuroglycopenic Hazard (< 55 mg/dL)
    AuraVioletCritical --> Normoglycemia : Fast-Acting Carbs / Glucagon Counter-regulation
```

---

## 9. UML State Machine Diagram 2: Multi-Gate Safety Patrol Engine

```mermaid
stateDiagram-v2
    [*] --> TelemetryIngested : Raw Sensor Ingestion

    TelemetryIngested --> Gate1_Completeness : Check Missing Packets
    Gate1_Completeness --> RejectPacket : > 30% Missing (Flag Sensor Dropout)
    Gate1_Completeness --> Gate2_HazardDetection : Complete 60-min Trace

    Gate2_HazardDetection --> NormalGlycemicState : Forecast Glucose ≤ 180 mg/dL
    Gate2_HazardDetection --> Gate3_ConfidenceAudit : Forecast Glucose > 180 mg/dL (Hazard Detected)

    Gate3_ConfidenceAudit --> FlagLowConfidenceReview : Ensemble Confidence < 0.70
    Gate3_ConfidenceAudit --> Gate4_DriftCheck : Ensemble Confidence ≥ 0.70

    Gate4_DriftCheck --> FlagPhysiologicalAnomaly : HRV or Sensor Anomaly
    Gate4_DriftCheck --> ClearedSpikePrediction : Normal Telemetry Drift

    state ClearedSpikePrediction {
        [*] --> RiskStratification
        RiskStratification --> LOW : Score < 0.25
        RiskStratification --> MODERATE : Score 0.25 - 0.50
        RiskStratification --> HIGH : Score 0.50 - 0.75
        RiskStratification --> CRITICAL : Score ≥ 0.75
    }

    ClearedSpikePrediction --> DispatchHUDAlert : Update 3D Canvas Aura & Patient Feed
    FlagLowConfidenceReview --> HumanInTheLoopQueue : Set requires_review = true
    FlagPhysiologicalAnomaly --> HumanInTheLoopQueue : Prompt Sensor Recalibration
```

---

## 10. UML Activity Diagram: Clinical Triage & Intervention Decision Flow

```mermaid
flowchart TD
    Start([Start: Continuous Patient Monitoring]) --> Ingest[Ingest Dual Stream: EHR + 5-min CGM]
    Ingest --> Window[Compute Sliding Window Features: Velocity, AUC60, HRV]
    Window --> Inference[Execute XGBoost + Bagging Ensemble]
    
    Inference --> Decision1{Spike Probability >= 0.55?}
    
    Decision1 -- No --> Stable[Classify as NORMAL: Glucose within target 80-180 mg/dL]
    Stable --> UpdateAuraGreen[Set 3D Aura: Cyan/Emerald Normal]
    UpdateAuraGreen --> Sleep[Wait 5 Minutes for Next Telemetry Packet]
    Sleep --> Ingest

    Decision1 -- Yes --> Audit{Ensemble Confidence >= 0.70?}
    
    Audit -- No --> FlagReview[Set requires_review = TRUE: Request Clinician Oversight]
    FlagReview --> AlertClinician[Display Amber Advisory on Dashboard]
    AlertClinician --> Triage

    Audit -- Yes --> ClassifySpike[Classify as SPIKE: 120-min Horizon Alert]
    ClassifySpike --> CheckSeverity{Risk Score >= 0.75?}
    
    CheckSeverity -- Yes --> CriticalAura[Shift 3D Aura: Pulsing Rose Critical Alert]
    CheckSeverity -- No --> HighAura[Shift 3D Aura: Amber Elevated Risk]
    
    CriticalAura --> Triage[Clinician Triage: Open Digital Twin]
    HighAura --> Triage
    
    Triage --> ViewChoice{Select View Mode}
    ViewChoice -- 3D Twin --> InspectOrgan[Inspect 3D Anatomical Loci: Pancreas / Liver / ISF Sensor]
    ViewChoice -- Dashboard --> InspectCharts[Inspect 24h CGM Area Chart & Medication History]
    
    InspectOrgan --> SimAction[Launch In-Silico What-If Simulator]
    InspectCharts --> SimAction
    
    SimAction --> Sliders[Adjust Counterfactual Carbs, Exercise, or Med Dose]
    Sliders --> Recompute[Compute 4-Hour Forward Trajectory Delta]
    Recompute --> AcceptPlan{Is Projected Risk Acceptable?}
    
    AcceptPlan -- No --> Sliders
    AcceptPlan -- Yes --> Prescribe[Push Proactive Guidance: Hydration / Walking / Titration]
    Prescribe --> End([Cycle Complete: Next Telemetry Epoch])
```

---

## 11. Database Entity-Relationship (ER) Diagram

The persistence layer is architected for hybrid clinical data modeling: relational schemas for static medical records alongside hyper-table partitioned time-series schemas for high-frequency wearable streams.

```mermaid
erDiagram
    PATIENTS ||--o{ CGM_READINGS : "generates"
    PATIENTS ||--o{ BIOMETRIC_STREAMS : "records"
    PATIENTS ||--o{ CONDITIONS : "diagnosed_with"
    PATIENTS ||--o{ MEDICATION_REGIMENS : "prescribed"
    PATIENTS ||--o{ PREDICTION_AUDITS : "evaluated_for"
    PATIENTS ||--o{ SIMULATION_RUNS : "simulated_in"
    WEARABLE_DEVICES ||--o{ CGM_READINGS : "transmits"

    PATIENTS {
        string patient_id PK "e.g., PT-0001"
        string full_name "Patient Name"
        int age "Age in years"
        string sex "M / F / Other"
        float bmi "Body Mass Index"
        float baseline_hba1c "Glycated Hemoglobin (%)"
        float baseline_fasting_glucose "Fasting blood sugar (mg/dL)"
        float risk_score "Continuous risk (0.0 to 1.0)"
        string risk_label "LOW | MODERATE | HIGH | CRITICAL"
        timestamp last_seen "Last clinical encounter"
        timestamp created_at "Record creation"
    }

    CONDITIONS {
        uuid condition_id PK
        string patient_id FK "References PATIENTS"
        string icd10_code "e.g., E11.9 (Type 2 Diabetes)"
        string condition_name "Clinical diagnosis"
        date diagnosis_date "Date of onset"
        string severity "MILD | MODERATE | SEVERE"
    }

    MEDICATION_REGIMENS {
        uuid regimen_id PK
        string patient_id FK "References PATIENTS"
        string drug_name "e.g., Metformin, Insulin Glargine"
        string dosage "e.g., 1000mg, 20U"
        string route "ORAL | SUBCUTANEOUS"
        string frequency "QD | BID | TID | PRN"
        boolean is_active "Active prescription status"
    }

    WEARABLE_DEVICES {
        string device_id PK "Hardware UUID / Serial"
        string patient_id FK "References PATIENTS"
        string device_type "CGM_SENSOR | SMARTWATCH | ACCELEROMETER"
        string manufacturer "Dexcom | Abbott | Apple | Garmin"
        float isf_diffusion_lag_min "Interstitial delay (typ. 5.2 min)"
        timestamp calibration_time "Last sensor calibration"
        float battery_pct "Battery status"
    }

    CGM_READINGS {
        uuid reading_id PK
        string patient_id FK "References PATIENTS"
        string device_id FK "References WEARABLE_DEVICES"
        timestamp recorded_at "5-min time-series timestamp"
        float glucose_mgdl "Subcutaneous ISF glucose value"
        float rate_of_change "Velocity dG/dt (mg/dL/min)"
        float sensor_trend_arrow "Trend direction: DOUBLE_UP to DOUBLE_DOWN"
        boolean is_calibrated "Calibration validity"
    }

    BIOMETRIC_STREAMS {
        uuid stream_id PK
        string patient_id FK "References PATIENTS"
        timestamp recorded_at "Timestamp epoch"
        float hrv_rmssd_ms "Heart rate variability (ms)"
        int step_count "5-min interval steps"
        string sleep_stage "WAKE | N1 | N2 | N3 | REM"
        float skin_temp_celsius "Peripheral skin temperature"
    }

    PREDICTION_AUDITS {
        uuid audit_id PK
        string patient_id FK "References PATIENTS"
        timestamp predicted_at "Model inference timestamp"
        float spike_probability "Ensemble probability P(Spike)"
        string prediction_label "SPIKE | NORMAL"
        string confidence_level "HIGH | MEDIUM | LOW"
        boolean requires_review "Safety patrol review gate"
        string risk_level "Assigned risk tier"
        json feature_vector_json "Captured 24-D feature inputs"
        json shap_attributions_json "SHAP local explainability weights"
    }

    SIMULATION_RUNS {
        uuid simulation_id PK
        string patient_id FK "References PATIENTS"
        timestamp executed_at "Simulation timestamp"
        float input_meal_carbs_g "Simulated carbohydrate intake"
        float input_exercise_min "Simulated physical activity"
        float input_med_factor "Medication dosage multiplier"
        float baseline_prob "Pre-simulation spike probability"
        float adjusted_prob "Post-simulation spike probability"
        float delta_prob "Net change in spike probability"
        json forecast_curve_json "48-point 4h forward trajectory"
    }
```

---

## 12. Biophysical Multi-Compartment Metabolic Flux Architecture

The digital twin's predictive simulator is grounded in mathematical physiology, modeling mass balance equations across six interconnected biological compartments:

```mermaid
flowchart TD
    subgraph Gut ["1. Gastrointestinal Compartment"]
        Meal["Carbohydrate Intake: D_meal(t) [grams]"]
        Stomach["Gastric Emptying: Q_sto(t)"]
        Intestine["Intestinal Absorption: Ra(t) [mg/min]"]
        Meal --> Stomach --> Intestine
    end

    subgraph Liver ["2. Hepatic Metabolic Bed"]
        HGP["Hepatic Glucose Production (EGP)"]
        Glycogen["Glycogenolysis & Gluconeogenesis"]
        InsulinInhibition["Insulin-Mediated EGP Suppression"]
        Glycogen --> HGP
        InsulinInhibition -.->|Suppression| HGP
    end

    Intestine -->|Portal Vein Absorption| Plasma
    HGP -->|Endogenous Release| Plasma

    subgraph Circulation ["3. Systemic Blood / Plasma Compartment"]
        Plasma["Plasma Glucose Concentration: G_p(t) [mg/dL]<br/>dG_p/dt = (Ra + EGP - E_renal - U_id - U_ii) / V_g"]
        Renal["Renal Excretion: E_renal(t) (if G_p > 180 mg/dL)"]
        Plasma --> Renal
    end

    subgraph Pancreas ["4. Endocrine Pancreatic Islets"]
        BetaCells["Beta-Cell First & Second Phase Secretion"]
        InsulinPlasma["Plasma Insulin Concentration: I(t)<br/>dI/dt = -m·I(t) + S(t)"]
        Plasma -.->|Glucose Stimulated| BetaCells
        BetaCells --> InsulinPlasma
    end

    InsulinPlasma --> InsulinInhibition

    subgraph Periphery ["5. Peripheral Tissue & Skeletal Muscle"]
        GLUT4["Insulin-Independent GLUT4 (Exercise Contraction): U_id(t)"]
        InsulinDependent["Insulin-Dependent Glucose Disposal: U_ii(t)"]
        Plasma --> GLUT4
        Plasma --> InsulinDependent
        InsulinPlasma -.->|Promotes| InsulinDependent
    end

    subgraph ISF ["6. Subcutaneous Interstitial Fluid (Sensor Compartment)"]
        ISFFluid["Interstitial Glucose: G_isf(t)<br/>dG_isf/dt = (1/τ) · (G_p(t) - G_isf(t))"]
        CGMSensor["Wearable CGM Micro-Filament Sensor<br/>Measured Signal: S_cgm(t) with τ ≈ 5.2 min latency"]
        Plasma -->|Passive Capillary Diffusion| ISFFluid
        ISFFluid --> CGMSensor
    end
```

### Mathematical Formulation
1. **Interstitial Fluid Sensor Lag Differential Equation**:
   $$\frac{dG_{\text{isf}}(t)}{dt} = \frac{1}{\tau_{\text{diff}}} \left( G_{\text{plasma}}(t) - G_{\text{isf}}(t) \right)$$
   Where $\tau_{\text{diff}} \approx 5.2\text{ minutes}$ is the physiological diffusion time constant between arterial capillaries and subcutaneous interstitial fluid.

2. **Systemic Plasma Glucose Mass Balance**:
   $$\frac{dG_{\text{plasma}}(t)}{dt} = \frac{R_a(t) + \text{EGP}(t) - U_{\text{muscle}}(t) - E_{\text{renal}}(t)}{V_d}$$
   Where:
   - $R_a(t)$: Gut carbohydrate absorption rate.
   - $\text{EGP}(t)$: Endogenous hepatic glucose production.
   - $U_{\text{muscle}}(t)$: Combined insulin-dependent and contractile (exercise) GLUT4 uptake.
   - $E_{\text{renal}}(t)$: Glycosuria threshold excretion above $180\text{ mg/dL}$.
   - $V_d$: Glucose distribution volume ($\sim 260\text{ mL/kg}$).

3. **Predictive Ensemble Spike Formulation**:
   $$P(\text{Spike}_{120\text{m}}) = \frac{1}{M} \sum_{m=1}^{M} \sigma \left( f_m(\mathbf{x}_t) \right)$$
   Where $M = 10$ bagged XGBoost estimators, $\sigma$ is the sigmoid link function, and $\mathbf{x}_t \in \mathbb{R}^{24}$ is the multidimensional feature vector combining historical CGM lags, glycemic velocity, autonomic HRV, activity cadence, and static EHR biomarkers.

---

*Authored by Team Neuron for the Happiest Health Digital Twin Challenge 2026.*
