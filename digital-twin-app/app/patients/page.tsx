"use client";

import PatientTable from "@/components/twin/PatientTable";

export default function PatientsPage() {
  return (
    <div className="space-y-5 animate-fadeUp">
      <div>
        <p className="page-eyebrow">Cohort Management</p>
        <h1 className="mt-1 text-2xl lg:text-3xl font-extrabold tracking-tight text-text">Patient Registry</h1>
        <p className="mt-1 text-xs font-medium text-text/50">
          50 synthetic patient digital twins with dual-stream EHR baselines and continuous wearable telemetry.
        </p>
      </div>
      <PatientTable />
    </div>
  );
}
