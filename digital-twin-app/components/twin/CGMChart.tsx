"use client";

import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, Legend, Area, AreaChart,
} from "recharts";
import { format } from "date-fns";
import { CGM_THRESHOLDS } from "@/lib/constants";
import type { CGMReading } from "@/lib/api";

interface Props {
  readings: CGMReading[];
  forecastPoints?: Array<{ time: string; glucose_mgdl: number; is_forecast: boolean }>;
}

function formatTick(ts: string) {
  try { return format(new Date(ts), "HH:mm"); } catch { return ""; }
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value;
  const isForecast = payload[0]?.payload?.is_forecast;
  const color = val > CGM_THRESHOLDS.TARGET_HIGH ? "#fb7185" : val < CGM_THRESHOLDS.TARGET_LOW ? "#fbbf24" : "#34d399";
  return (
    <div className="rounded-xl border border-line bg-card/95 px-3 py-2 text-xs shadow-lg backdrop-blur-sm">
      <p className="font-mono text-text/50">{formatTick(label)}{isForecast ? " (forecast)" : ""}</p>
      <p className="font-bold mt-0.5" style={{ color }}>{val?.toFixed(0)} mg/dL</p>
    </div>
  );
};

export default function CGMChart({ readings, forecastPoints = [] }: Props) {
  if (!readings.length) return (
    <div className="flex h-64 items-center justify-center text-sm text-muted">No CGM data available</div>
  );

  const data = [
    ...readings.map(r => ({ time: r.timestamp, glucose: r.glucose_mgdl, is_forecast: false })),
    ...forecastPoints.map(f => ({ time: f.time, glucose_forecast: f.glucose_mgdl, is_forecast: true })),
  ];

  const thinned = data.filter((_, i) => i % 3 === 0);

  return (
    <div className="w-full" style={{ height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={thinned} margin={{ top: 8, right: 16, bottom: 0, left: -10 }}>
          <defs>
            <linearGradient id="glucoseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#22d3ee" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#fbbf24" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--color-line)/0.3)" vertical={false} />
          <XAxis
            dataKey="time"
            tickFormatter={formatTick}
            tick={{ fontSize: 10, fill: "rgba(var(--color-text)/0.45)" }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[50, 350]}
            tick={{ fontSize: 10, fill: "rgba(var(--color-text)/0.45)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `${v}`}
          />
          <Tooltip content={<CustomTooltip />} />
          {/* Target range band */}
          <ReferenceLine y={CGM_THRESHOLDS.TARGET_HIGH} stroke="#fb7185" strokeDasharray="4 4" strokeWidth={1} label={{ value: "High (180)", fill: "#fb7185", fontSize: 9, position: "insideTopRight" }} />
          <ReferenceLine y={CGM_THRESHOLDS.TARGET_LOW}  stroke="#fbbf24" strokeDasharray="4 4" strokeWidth={1} label={{ value: "Low (80)",   fill: "#fbbf24", fontSize: 9, position: "insideBottomRight" }} />
          <Area
            type="monotone"
            dataKey="glucose"
            stroke="#22d3ee"
            strokeWidth={2}
            fill="url(#glucoseGrad)"
            dot={false}
            activeDot={{ r: 4, fill: "#22d3ee" }}
            name="CGM Reading"
            connectNulls
          />
          {forecastPoints.length > 0 && (
            <Area
              type="monotone"
              dataKey="glucose_forecast"
              stroke="#fbbf24"
              strokeWidth={2}
              strokeDasharray="6 3"
              fill="url(#forecastGrad)"
              dot={false}
              activeDot={{ r: 4, fill: "#fbbf24" }}
              name="2h Forecast"
              connectNulls
            />
          )}
          <Legend
            wrapperStyle={{ fontSize: 10, paddingTop: 8 }}
            formatter={v => <span style={{ color: "rgb(var(--color-text))" }}>{v}</span>}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
