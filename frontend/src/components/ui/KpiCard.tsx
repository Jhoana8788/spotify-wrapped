"use client";

import type { ReactNode } from "react";

type Variant = "green" | "pink" | "violet" | "orange" | "cyan";

const VARIANT_BG: Record<Variant, string> = {
  green: "bg-kpi-green",
  pink: "bg-kpi-pink",
  violet: "bg-kpi-violet",
  orange: "bg-kpi-orange",
  cyan: "bg-kpi-cyan",
};

type Props = {
  label: string;
  value: ReactNode;
  emoji: string;
  variant?: Variant;
  trend?: { value: string; positive?: boolean };
  hint?: string;
};

export default function KpiCard({ label, value, emoji, variant = "green", trend, hint }: Props) {
  return (
    <div className="card card-hover relative overflow-hidden">
      <div className="flex items-start justify-between mb-3">
        <div className="stat-label">{label}</div>
        <div className={`w-10 h-10 rounded-xl ${VARIANT_BG[variant]} flex items-center justify-center text-xl shadow-lg shrink-0`}>
          {emoji}
        </div>
      </div>
      <div className="stat-value">{value}</div>
      {trend && (
        <div className={trend.positive !== false ? "trend-up mt-2" : "trend-down mt-2"}>
          <span>{trend.positive !== false ? "▲" : "▼"}</span>
          <span>{trend.value}</span>
        </div>
      )}
      {hint && !trend && <p className="text-xs text-textMuted mt-2">{hint}</p>}
    </div>
  );
}