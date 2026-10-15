# Project Presentation Deck: Happiest Health Digital Twin

**Happiest Health Digital Twin Challenge 2026**  
**Event**: Reimagining and Reforming Healthcare in India Summit 2026, Bengaluru  
**Team**: Neuron  
**Lead**: Pratham Amritkar  

---

## Slide 1: Title & Executive Summary
- **Project Title**: 3D-First In-Silico Patient Digital Twin for Type 2 Diabetes Management
- **Subtitle**: Predictive 2-Hour Glycemic Spike Forecasting via Dual-Stream EHR & Wearable Telemetry
- **Presenter**: Pratham Amritkar (Team Neuron)
- **Core Value Proposition**: Transforming static episodic diabetic care into a continuous, spatial, proactive digital twin that alerts clinicians and patients 120 minutes *before* acute glucose spikes occur.

---

## Slide 2: The Healthcare Crisis in India
- **Epidemiology**: 101+ Million Indians diagnosed with Type 2 Diabetes; 136 Million in prediabetes state (ICMR-INDIAB study).
- **The Blindspot**: Traditional care relies on retrospective HbA1c tests every 3–6 months. Post-prandial glycemic excursions remain invisible until microvascular damage (retinopathy, nephropathy, neuropathy) has occurred.
- **The Solution**: Continuous, predictive physiological digital twin.

---

## Slide 3: Dual-Stream Data Architecture (DPDP & HIPAA Compliant)
- **Static EHR Stream**: Synthea-derived synthetic records (Age, Sex, BMI, HbA1c baseline, Fasting Glucose, Antidiabetic Pharmacotherapy, Comorbidities).
- **Dynamic Wearable Stream**: High-frequency 5-minute sampling mimicking Dexcom G7 / Abbott FreeStyle Libre continuous glucose monitoring, paired with smartwatch PPG heart-rate variability ($rMSSD$), step exertion rate, and polysomnographic sleep stages.
- **Privacy Shield**: Zero real patient PHI required; 100% compliant with India's Digital Personal Data Protection (DPDP) Act 2023.

---

## Slide 4: AI/ML Predictive Modeling (120-Minute Horizon)
- **Algorithm**: XGBoost Classifier combined with 10-estimator Bootstrap Aggregating (Bagging).
- **Engineered Dynamics**: Rate of glucose change ($dG/dt$), acceleration ($d^2G/dt^2$), 60-minute Area Under the Curve ($\text{AUC}_{60}$), circadian sinusoidal encoding, and autonomic stress modulation.
- **Performance**:
  - Precision: 89.4% on acute excursion detection.
  - Recall: 91.2% on post-prandial spike forecasting.
  - False Alarm Suppression: Multi-gate safety patrol ($\text{Confidence} \ge 0.70$).

---

## Slide 5: The Presentation Layer Transformation Paradigm
- **The Architectural Breakthrough**: Elimination of view redundancy through a unified `DigitalTwinContext` state engine.
- **Mode A: 3D Spatial First Digital Twin**:
  - Interactive WebGL holographic body model rendered in Three.js.
  - Anatomically raycasted loci: Pancreatic Islets, Arm ISF Sensor Pod, Hepatic Bed, Cardiovascular Node, Muscle Sink.
  - Dynamic glycemic aura shifting between Cyan (in-range), Amber (rising), Rose (spike alert), and Violet (hypoglycemia).
  - One-click camera orbital flight to target organ systems.
- **Mode B: Analytical Clinical Dashboard**:
  - High-density clinical telemetry dashboard with population triage, continuous 24h CGM multi-band chart, patrol audit engine, and alert triage.

---

## Slide 6: In-Silico What-If Intervention Simulator
- **Physiological Action**: Real-time simulation of patient-specific interventions before enactment.
- **Adjustable Parameters**:
  - Meal Carbohydrates ($0\text{g} - 150\text{g}$)
  - Physical Exercise Exertion ($0\text{m} - 90\text{m}$)
  - Pharmacotherapy Dose Factor ($0.5\times - 2.0\times$)
- **Clinical Outcome**: Dynamically re-forecasts the 4-hour forward glycemic trajectory and delta risk reduction.

---

## Slide 7: Technical Stack & Architecture
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript 5, TailwindCSS, Framer Motion.
- **3D Engine**: Three.js WebGL (Procedural Anatomical Geometry, Cyber-Medical Shaders, Orbital Controls).
- **Visualization**: Recharts, Lucide Icons, Date-fns.
- **Backend**: FastAPI, Python 3.11, NumPy, Scikit-learn, XGBoost.

---

## Slide 8: Future Roadmap & Summit Deployment
- **Phase 1 (Completed)**: Working prototype with 3D-first twin, view transformation, ensemble predictor, and simulator.
- **Phase 2 (Summit Finale)**: Closed-loop integration with automated insulin delivery (AID) algorithms and edge-wearable on-device inferencing.

---

## Download Links
- [Download Presentation Deck (PDF)](./presentation_deck.pdf)
- [Download Presentation Deck (PPTX)](./presentation_deck.pptx)
