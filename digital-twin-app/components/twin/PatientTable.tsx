"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, RefreshCw, Search } from "lucide-react";
import Card, { CardHeader } from "@/components/ui/Card";
import RiskBadge from "@/components/ui/RiskBadge";
import { twinApi, type Patient } from "@/lib/api";
import { RISK_COLORS } from "@/lib/constants";

export default function PatientTable() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading,  setLoading ] = useState(true);
  const [error,    setError   ] = useState<string | null>(null);
  const [search,   setSearch  ] = useState("");

  const load = useCallback(() => {
    setLoading(true); setError(null);
    twinApi.patients()
      .then(p => { setPatients(p); setLoading(false); window.dispatchEvent(new Event("dt:connection-success")); })
      .catch(e => {
        window.dispatchEvent(new Event("dt:connection-error"));
        setError(e instanceof Error ? e.message : "Failed to load patients");
        setLoading(false);
      });
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase()) ||
    p.risk_label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card className="flex flex-col">
      <CardHeader
        title="Patient Registry"
        caption={`${patients.length} synthetic patient twins · EHR and wearable dual-stream ingestion`}
        right={
          <button
            onClick={load}
            disabled={loading}
            title="Refresh Cohort"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-line border-b-2 bg-surface text-text hover:border-cyan/40 hover:text-cyan transition-all tactile-press shadow-xs"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        }
      />

      <div className="px-5 py-3.5 border-b-2 border-line bg-surface/30">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 h-4 w-4 text-text/40 pointer-events-none" />
          <input
            id="patient-search"
            type="search"
            placeholder="Search patient twins by name, ID (e.g. PT-0001), or risk tier…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-line border-b-2 bg-card pl-10 pr-4 py-2 text-sm placeholder:text-text/40 focus:border-cyan/50 focus:outline-none transition shadow-xs"
          />
        </div>
      </div>

      {error && (
        <div className="px-5 py-4 text-sm text-rose font-medium border-b border-line">
          {error} — <button onClick={load} className="underline font-bold">retry</button>
        </div>
      )}

      {/* Table header */}
      {!error && (
        <div className="sticky top-0 z-10 grid grid-cols-[1fr_auto_auto_auto_auto] gap-x-4 border-b-2 border-line bg-surface px-5 py-3">
          {["Patient Twin", "Clinical Risk", "HbA1c", "BMI", ""].map(h => (
            <span key={h} className="table-header">{h}</span>
          ))}
        </div>
      )}

      <div className="table-scroll-area table-max-8 flex-1">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-line/30 animate-pulse">
              <div className="shimmer-bg h-9 w-9 rounded-xl" />
              <div className="flex-1 space-y-1.5">
                <div className="shimmer-bg h-3.5 w-32 rounded" />
                <div className="shimmer-bg h-2.5 w-20 rounded" />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <p className="px-5 py-10 text-sm text-muted text-center font-medium">No patients match your search filter.</p>
        ) : (
          filtered.map(p => {
            const color = RISK_COLORS[p.risk_label]?.hex ?? "#22d3ee";
            return (
              <Link
                key={p.id}
                href={`/patients/${p.id}`}
                className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-x-4 items-center px-5 border-b border-line/40 hover:bg-cyan/5 transition-colors duration-150 group cursor-pointer"
                style={{ minHeight: "var(--table-row-h)" }}
              >
                <div className="min-w-0 py-3">
                  <p className="text-sm font-bold text-text truncate group-hover:text-cyan transition-colors">{p.name}</p>
                  <p className="text-[11px] text-muted font-mono">{p.id} · {p.age}y {p.sex} · last seen {p.last_seen}</p>
                </div>
                <RiskBadge level={p.risk_label} size="sm" />
                <span className="text-sm font-mono font-extrabold" style={{ color }}>{p.hba1c}%</span>
                <span className="text-sm font-mono text-muted font-semibold">{p.bmi}</span>
                <ChevronRight className="h-4 w-4 text-muted group-hover:text-cyan group-hover:translate-x-0.5 transition-transform" />
              </Link>
            );
          })
        )}
      </div>
    </Card>
  );
}
