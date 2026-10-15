"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Patient, CGMReading, PredictionResult, twinApi } from "@/lib/api";
import { OrganStatus, getMockOrganStatuses } from "@/lib/mockData";

export type ViewMode = "3d-twin" | "dashboard";
export type CameraPreset = "body" | "pancreas" | "sensor" | "liver" | "heart";

interface DigitalTwinContextValue {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
  activePatientId: string;
  setActivePatientId: (id: string) => void;
  patient: Patient | null;
  patients: Patient[];
  readings: CGMReading[];
  prediction: PredictionResult | null;
  organStatuses: OrganStatus[];
  activeOrgan: OrganStatus | null;
  setActiveOrgan: (organ: OrganStatus | null) => void;
  cameraPreset: CameraPreset;
  setCameraPreset: (preset: CameraPreset) => void;
  loading: boolean;
  refreshData: () => Promise<void>;
}

const DigitalTwinContext = createContext<DigitalTwinContextValue | null>(null);

export function DigitalTwinProvider({ children }: { children: React.ReactNode }) {
  const [viewMode, setViewModeState] = useState<ViewMode>("3d-twin");
  const [activePatientId, setActivePatientId] = useState<string>("PT-0001");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [readings, setReadings] = useState<CGMReading[]>([]);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [organStatuses, setOrganStatuses] = useState<OrganStatus[]>([]);
  const [activeOrgan, setActiveOrgan] = useState<OrganStatus | null>(null);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>("body");
  const [loading, setLoading] = useState<boolean>(true);

  // Read stored view mode preference from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("dt_view_mode") as ViewMode | null;
      if (stored === "3d-twin" || stored === "dashboard") {
        setViewModeState(stored);
      }
    } catch {
      // ignore in SSR / storage disabled
    }
  }, []);

  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode);
    try {
      localStorage.setItem("dt_view_mode", mode);
    } catch {
      // ignore
    }
  }, []);

  const toggleViewMode = useCallback(() => {
    setViewModeState(prev => {
      const next = prev === "3d-twin" ? "dashboard" : "3d-twin";
      try {
        localStorage.setItem("dt_view_mode", next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // Global keyboard shortcut: 'V' toggles view mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "v" || e.key === "V") {
        toggleViewMode();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleViewMode]);

  // Initial load of patient directory
  const loadPatients = useCallback(async () => {
    try {
      const data = await twinApi.patients();
      setPatients(data);
    } catch (e) {
      console.error("Failed to load patients", e);
    }
  }, []);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  // Load telemetry & twin model for active patient
  const loadPatientData = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const [p, cgm, pred] = await Promise.all([
        twinApi.patient(id),
        twinApi.cgm(id, 24),
        twinApi.predict(id),
      ]);
      setPatient(p);
      setReadings(cgm);
      setPrediction(pred);
      const organs = getMockOrganStatuses(id);
      setOrganStatuses(organs);
      setActiveOrgan(organs[0]); // default to pancreas
    } catch (err) {
      console.error("Error loading patient twin data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activePatientId) {
      loadPatientData(activePatientId);
    }
  }, [activePatientId, loadPatientData]);

  const refreshData = useCallback(async () => {
    if (activePatientId) {
      await loadPatientData(activePatientId);
    }
  }, [activePatientId, loadPatientData]);

  return (
    <DigitalTwinContext.Provider
      value={{
        viewMode,
        setViewMode,
        toggleViewMode,
        activePatientId,
        setActivePatientId,
        patient,
        patients,
        readings,
        prediction,
        organStatuses,
        activeOrgan,
        setActiveOrgan,
        cameraPreset,
        setCameraPreset,
        loading,
        refreshData,
      }}
    >
      {children}
    </DigitalTwinContext.Provider>
  );
}

export function useDigitalTwin() {
  const ctx = useContext(DigitalTwinContext);
  if (!ctx) {
    throw new Error("useDigitalTwin must be used within a DigitalTwinProvider");
  }
  return ctx;
}
