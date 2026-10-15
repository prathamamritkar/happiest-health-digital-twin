"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FlaskConical, Pill, Stethoscope } from "lucide-react";
import Card, { CardHeader } from "@/components/ui/Card";
import CGMChart from "@/components/twin/CGMChart";
import BiometricRow from "@/components/twin/BiometricRow";
import PatrolChecks from "@/components/twin/PatrolChecks";
import RiskBadge from "@/components/ui/RiskBadge";
import Twin3DView from "@/components/twin/Twin3DView";
import { useDigitalTwin } from "@/context/DigitalTwinContext";
import { twinApi, type Patient, type CGMReading, type PredictionResult } from "@/lib/api";
import { AnimatePresence, motion } from "framer-motion";

export default function PatientDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { viewMode, setActivePatientId } = useDigitalTwin();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [readings, setReadings] = useState<CGMReading[]>([]);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(true);

  // Synchronize global context active patient
  useEffect(() => {
    if (id) {
      setActivePatientId(id);
    }
  }, [id, setActivePatientId]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, cgm, pred] = await Promise.all([
        twinApi.patient(id),
        twinApi.cgm(id, 24).catch(() => []),
        twinApi.predict(id).catch(() => null),
      ]);
      setPatient(p);
      setReadings(cgm);
      setPrediction(pred);
    } catch {
      /* offline handled by twinApi */
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading)
    return <div className="py-20 text-center text-sm text-muted animate-pulse">Loading patient twin state…</div>;
  if (!patient)
    return <div className="py-20 text-center text-sm text-rose">Patient digital twin record not found.</div>;

  const is3D = viewMode === "3d-twin";

  return (
    <div className="space-y-5 animate-fadeUp">
      {/* Patient Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Link
            href="/"
            className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line border-b-2 bg-surface text-text/70 hover:border-cyan/40 hover:text-cyan tactile-press transition-all shadow-xs"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <p className="page-eyebrow">
              {is3D ? "3D Digital Twin Profile" : "Clinical Twin Profile"} · {patient.id}
            </p>
            <h1 className="mt-1 text-2xl lg:text-3xl font-extrabold tracking-tight text-text">
              {patient.name}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted font-medium">
                {patient.age}y · {patient.sex} · BMI {patient.bmi} kg/m²
              </span>
              <RiskBadge level={patient.risk_label} />
              {prediction && <RiskBadge level={prediction.risk_level} />}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href={`/patients/${id}/simulate`}
            className="btn-tactile-primary inline-flex shrink-0 items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold tactile-press"
          >
            <FlaskConical className="h-4 w-4" />
            Run Simulation
          </Link>
        </div>
      </div>

      {/* Presentation Layer View Transition */}
      <AnimatePresence mode="wait">
        {is3D ? (
          <motion.div
            key="patient-3d-view"
            initial={{ opacity: 0, y: 12, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.99 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <Twin3DView />
          </motion.div>
        ) : (
          <motion.div
            key="patient-clinical-view"
            initial={{ opacity: 0, y: 12, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.99 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="space-y-5"
          >
            {/* EHR Summary */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Card className="p-4 sm:col-span-2">
                <div className="flex items-center gap-2 mb-3">
                  <Stethoscope className="h-4 w-4 text-cyan" />
                  <span className="ui-label text-text/60">EHR Summary</span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    {
                      label: "HbA1c",
                      value: `${patient.hba1c}%`,
                      color: patient.hba1c > 8 ? "text-rose" : patient.hba1c > 7 ? "text-amber" : "text-emerald",
                    },
                    {
                      label: "Fasting Glucose",
                      value: `${patient.fasting_glucose} mg/dL`,
                      color: patient.fasting_glucose > 180 ? "text-rose" : "text-text",
                    },
                    {
                      label: "BMI",
                      value: `${patient.bmi}`,
                      color: patient.bmi > 30 ? "text-amber" : "text-text",
                    },
                    {
                      label: "Last Seen",
                      value: patient.last_seen,
                      color: "text-text",
                    },
                  ].map(f => (
                    <div key={f.label}>
                      <p className="ui-label text-text/50">{f.label}</p>
                      <p className={`mt-1 font-mono text-lg font-extrabold ${f.color}`}>{f.value}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Pill className="h-4 w-4 text-violet" />
                  <span className="ui-label text-text/60">Medications</span>
                </div>
                <ul className="space-y-1">
                  {patient.medications.map(med => (
                    <li key={med} className="flex items-center gap-2 text-xs font-medium text-text/80">
                      <span className="h-1.5 w-1.5 rounded-full bg-violet shrink-0" />
                      {med}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            {/* Biometric row */}
            <BiometricRow readings={readings} />

            {/* CGM Chart */}
            <Card>
              <CardHeader
                title="24h Continuous Glucose Monitor"
                caption="5-min intervals · target range 80–180 mg/dL"
              />
              <div className="p-4 sm:p-6">
                <CGMChart readings={readings} />
              </div>
            </Card>

            {/* Patrol checks */}
            <PatrolChecks prediction={prediction} loading={!prediction && loading} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
