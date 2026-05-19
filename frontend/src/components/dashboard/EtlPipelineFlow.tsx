"use client";

import type { DwhStatus, EtlRun } from "@/types/etl";

type Props = {
  tables?: DwhStatus[];
  runs?: EtlRun[];
};

export default function EtlPipelineFlow({ tables = [], runs = [] }: Props) {
  // La última ejecución (la más reciente)
  const lastRun = runs.slice().sort(
    (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
  )[0];

  const isOk = lastRun?.status === "ok";

  // Conteos por tabla desde DwhStatus
  const rowsByTable = new Map<string, number>();
  tables.forEach(t => rowsByTable.set(t.table, t.row_count || 0));

  const stages = [
    {
      key: "extract", label: "Extract", emoji: "📥", desc: "Spotify API",
      gradient: "from-cyan-500/30 to-cyan-500/5", border: "border-cyan-500/30",
      count: lastRun?.rows_processed ?? 0,
      countLabel: "filas leídas",
    },
    {
      key: "transform", label: "Transform", emoji: "🧹", desc: "Limpieza",
      gradient: "from-orange-500/30 to-orange-500/5", border: "border-orange-500/30",
      count: lastRun?.rows_processed ?? 0,
      countLabel: "normalizadas",
    },
    {
      key: "load", label: "Load", emoji: "📦", desc: "Neon DB",
      gradient: "from-violet-500/30 to-violet-500/5", border: "border-violet-500/30",
      count: (rowsByTable.get("dim_artists") || 0) + (rowsByTable.get("dim_tracks") || 0),
      countLabel: "en DWH",
    },
    {
      key: "analytics", label: "Analytics", emoji: "✅", desc: "Dashboards",
      gradient: "from-emerald-500/30 to-emerald-500/5", border: "border-emerald-500/30",
      count: rowsByTable.get("fact_listening_history") || 0,
      countLabel: "reproducciones",
    },
  ];

  return (
    <div className="card">
      <h3 className="card-title flex items-center justify-between">
        <span className="flex items-center gap-2"><span>⚙️</span> Flujo ETL en tiempo real</span>
        {lastRun && (
          <span className={`badge ${isOk ? "badge-success" : "badge-error"}`}>
            {isOk ? "✅" : "❌"} última: {(lastRun.duration_ms ?? 0) / 1000}s
          </span>
        )}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stages.map((s, i) => (
          <div key={s.key} className="relative">
            <div
              className={`bg-gradient-to-br ${s.gradient} border ${s.border} rounded-xl p-4 text-center ${isOk ? "animate-pulse-glow" : ""}`}
              style={{ animationDelay: `${i * 0.3}s` }}
            >
              <div className="text-3xl mb-2">{s.emoji}</div>
              <p className="font-semibold text-sm">{s.label}</p>
              <p className="text-xs text-textMuted mt-1">{s.desc}</p>
              <p className="text-xl font-bold mt-2 text-text tabular-nums">
                {s.count.toLocaleString()}
              </p>
              <p className="text-[10px] text-textMuted">{s.countLabel}</p>
            </div>
            {i < stages.length - 1 && (
              <div className="hidden md:flex absolute top-1/2 -right-2.5 -translate-y-1/2 text-accent text-2xl z-10 w-5 h-5 items-center justify-center">›</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}