"use client";

import { useDigitalTwin } from "@/context/DigitalTwinContext";
import DashboardSummaryRow from "@/components/twin/DashboardSummaryRow";
import PatientTable from "@/components/twin/PatientTable";
import AlertsPanel from "@/components/twin/AlertsPanel";
import Twin3DView from "@/components/twin/Twin3DView";
import { AnimatePresence, motion } from "framer-motion";

export default function DashboardPage() {
  const { viewMode } = useDigitalTwin();

  const is3D = viewMode === "3d-twin";

  return (
    <div className="space-y-4 animate-fadeUp">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="page-eyebrow">
            {is3D
              ? "Physiological Modeling System"
              : "Clinical Decision Support System"}
          </p>
          <h1 className="mt-1 text-2xl lg:text-3xl font-extrabold tracking-tight text-text truncate">
            {is3D ? "3D Digital Twin" : "Clinical Dashboard"}
          </h1>
          <p className="mt-1 text-xs font-medium text-text/50 truncate">
            {is3D
              ? "Interactive multi-compartment metabolic visualization and continuous interstitial glucose telemetry."
              : "Dual-stream EHR and wearable telemetry for 120-minute blood glucose spike prediction."}
          </p>
        </div>

        <div className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-line border-b-2 bg-surface px-3.5 py-2 text-xs font-mono text-muted shadow-xs">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald animate-pulseGreen" />
          <span className="font-bold text-text">XGBoost Ensemble</span>
          <span className="text-emerald font-extrabold tracking-wider">LIVE</span>
        </div>
      </div>


      {/* Presentation Layer Transformation (Morphs between 3D Spatial Twin and Analytical Dashboard) */}
      <AnimatePresence mode="wait">
        {is3D ? (
          <motion.div
            key="3d-twin-view"
            initial={{ opacity: 0, y: 12, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.99 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <Twin3DView />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard-view"
            initial={{ opacity: 0, y: 12, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.99 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="space-y-5"
          >
            <DashboardSummaryRow />

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <PatientTable />
              </div>
              <div>
                <AlertsPanel />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
