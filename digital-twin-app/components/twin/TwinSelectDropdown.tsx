"use client";

import React, { useState, useRef, useEffect } from "react";
import { useDigitalTwin } from "@/context/DigitalTwinContext";
import RiskBadge from "@/components/ui/RiskBadge";
import { ChevronDown, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function TwinSelectDropdown() {
  const { patients, activePatientId, setActivePatientId, patient } = useDigitalTwin();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const currentIndex = patients.findIndex(p => p.id === activePatientId);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (patients.length === 0) return;
    const prevIdx = (currentIndex - 1 + patients.length) % patients.length;
    setActivePatientId(patients[prevIdx].id);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (patients.length === 0) return;
    const nextIdx = (currentIndex + 1) % patients.length;
    setActivePatientId(patients[nextIdx].id);
  };

  return (
    <div className="flex items-center gap-2" ref={dropdownRef}>
      {/* Dropdown Container */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className="flex items-center gap-2.5 rounded-xl border border-line border-b-2 bg-card px-3.5 py-2 text-xs font-bold text-text hover:border-cyan/50 shadow-xs tactile-press transition-all min-w-[220px] sm:min-w-[260px] justify-between cursor-pointer"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                patient?.risk_label === "CRITICAL"
                  ? "bg-rose animate-pulse"
                  : patient?.risk_label === "HIGH"
                  ? "bg-amber"
                  : "bg-cyan"
              }`}
            />
            <span className="truncate text-text font-extrabold">{patient?.name ?? "Select Patient Twin"}</span>
            <span className="font-mono text-[10px] text-muted shrink-0">({patient?.id})</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {patient && <RiskBadge level={patient.risk_label} size="sm" />}
            <ChevronDown
              className={`h-4 w-4 text-muted transition-transform duration-150 ${
                isOpen ? "rotate-180 text-cyan" : ""
              }`}
            />
          </div>
        </button>

        {/* Dropdown Menu Popover */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 top-full mt-1.5 z-50 w-full min-w-[280px] rounded-2xl border border-line border-b-2 bg-card/95 backdrop-blur-md p-1.5 shadow-xl space-y-1"
              role="listbox"
            >
              <div className="px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wider text-muted/70 border-b border-line/40 flex items-center justify-between">
                <span>Select Cohort Digital Twin</span>
                <span>{patients.length} patients</span>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-1 pr-0.5">
                {patients.map(p => {
                  const isSelected = p.id === activePatientId;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        setActivePatientId(p.id);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-xs transition tactile-press ${
                        isSelected
                          ? "bg-cyan/15 text-cyan border border-cyan/40 border-b-2 border-b-cyan-600 shadow-xs font-extrabold"
                          : "text-text/80 hover:bg-surface hover:text-text border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`h-2 w-2 rounded-full shrink-0 ${
                            p.risk_label === "CRITICAL"
                              ? "bg-rose"
                              : p.risk_label === "HIGH"
                              ? "bg-amber"
                              : "bg-cyan"
                          }`}
                        />
                        <div className="min-w-0">
                          <p className="font-bold truncate text-xs">{p.name}</p>
                          <p className="text-[10px] font-mono text-muted truncate">
                            {p.id} · {p.age}y {p.sex} · HbA1c {p.hba1c}%
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <RiskBadge level={p.risk_label} size="sm" />
                        {isSelected && <Check className="h-4 w-4 text-cyan" strokeWidth={2.5} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Previous / Next Twin Stepper Controls */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={handlePrev}
          title="Previous patient twin"
          aria-label="Previous patient twin"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-line border-b-2 bg-surface text-text/70 hover:border-cyan/40 hover:text-cyan tactile-press transition-all shadow-xs"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleNext}
          title="Next patient twin"
          aria-label="Next patient twin"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-line border-b-2 bg-surface text-text/70 hover:border-cyan/40 hover:text-cyan tactile-press transition-all shadow-xs"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
