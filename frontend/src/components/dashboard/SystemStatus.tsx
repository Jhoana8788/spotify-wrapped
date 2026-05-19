"use client";

import type { DwhStatus } from "@/types/etl";

type Props = { etlTables: DwhStatus[] };

export default function SystemStatus({ etlTables }: Props) {
  const hasData = etlTables.length > 0;

  const services = [
    { name: "Spotify API", emoji: "🎧", status: "Conectado", up: true },
    { name: "Neon Database", emoji: "🗄️", status: hasData ? "Online" : "Esperando", up: hasData },
    { name: "ETL Pipeline", emoji: "⚙️", status: hasData ? "Activo" : "Idle", up: hasData },
    { name: "Backend API", emoji: "🔧", status: "Operativo", up: true },
  ];

  return (
    <div className="card">
      <h3 className="card-title"><span>🟢</span> Estado del sistema</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {services.map((s) => (
          <div key={s.name} className="bg-panelAlt rounded-lg p-3 flex items-center gap-3 border border-border">
            <div className="text-2xl shrink-0">{s.emoji}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{s.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${s.up ? "bg-accent animate-pulse" : "bg-textDim"}`} />
                <p className="text-xs text-textMuted">{s.status}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}