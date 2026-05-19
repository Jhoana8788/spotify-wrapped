"use client";

import type { DwhStatus } from "@/types/etl";

type Props = { tables: DwhStatus[] };

const STAGES = [
  { key: "extract", label: "Extract", emoji: "📥", desc: "Spotify API", gradient: "from-cyan-500/30 to-cyan-500/5", border: "border-cyan-500/30" },
  { key: "transform", label: "Transform", emoji: "🧹", desc: "Limpieza y normalización", gradient: "from-orange-500/30 to-orange-500/5", border: "border-orange-500/30" },
  { key: "load", label: "Load", emoji: "📦", desc: "Neon Database", gradient: "from-violet-500/30 to-violet-500/5", border: "border-violet-500/30" },
  { key: "analytics", label: "Analytics", emoji: "✅", desc: "Dashboards", gradient: "from-emerald-500/30 to-emerald-500/5", border: "border-emerald-500/30" },
];

export default function EtlPipelineFlow({ tables }: Props) {
  const totalRows = tables.reduce((s, t) => s + (t.row_count || 0), 0);

  return (
    <div className="card">
      <h3 className="card-title"><span>⚙️</span> Flujo ETL en tiempo real</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STAGES.map((s, i) => (
          <div key={s.key} className="relative">
            <div className={`bg-gradient-to-br ${s.gradient} border ${s.border} rounded-xl p-4 text-center`}>
              <div className="text-3xl mb-2">{s.emoji}</div>
              <p className="font-semibold text-sm">{s.label}</p>
              <p className="text-xs text-textMuted mt-1">{s.desc}</p>
              <p className="text-xs text-text mt-2 font-medium tabular-nums">
                {totalRows > 0 ? `${totalRows.toLocaleString()} regs` : "—"}
              </p>
            </div>
            {i < STAGES.length - 1 && (
              <div className="hidden md:flex absolute top-1/2 -right-2.5 -translate-y-1/2 text-accent text-2xl z-10 w-5 h-5 items-center justify-center">›</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}