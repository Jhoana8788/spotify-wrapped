"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { EtlStepLog, EtlRunStatus } from "@/types/etl";

type Props = { onComplete?: () => void; };

function extractSteps(payload: unknown): EtlStepLog[] {
  if (Array.isArray(payload)) return payload as EtlStepLog[];
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.steps)) return obj.steps as EtlStepLog[];
    if (Array.isArray(obj.logs)) return obj.logs as EtlStepLog[];
  }
  return [];
}

function badgeFor(s: EtlRunStatus) {
  const cls = s === "ok" ? "badge-success" : s === "error" ? "badge-error" : "badge-pending";
  const emoji = s === "ok" ? "✅" : s === "error" ? "❌" : "⏳";
  return { cls: `badge ${cls}`, emoji };
}

export default function SyncButton({ onComplete }: Props) {
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState<EtlStepLog[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    setRunning(true); setSteps([]); setError(null);
    try {
      const payload = await api.post<unknown>("/v1/etl/run");
      setSteps(extractSteps(payload));
      onComplete?.();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Error ejecutando el ETL");
    } finally { setRunning(false); }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h3 className="card-title !mb-0"><span>🚀</span> Sync manual</h3>
        <button onClick={handleRun} disabled={running} className="btn btn-primary">
          {running ? "⏳ Ejecutando…" : "▶ Sync Now"}
        </button>
      </div>
      {error && (
        <div className="p-3 mb-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2">
          <span>❌</span> {error}
        </div>
      )}
      {steps.length === 0 && !running && !error && (
        <p className="text-textMuted text-sm">Aún no se ha lanzado ninguna ejecución en esta sesión.</p>
      )}
      {(running || steps.length > 0) && (
        <ol className="space-y-2 font-mono text-xs">
          {steps.map((s, idx) => {
            const b = badgeFor(s.status);
            return (
              <li key={`${s.step}-${idx}`} className="flex items-start gap-3 p-3 rounded-lg bg-panelAlt border border-border">
                <span className="text-textMuted w-6 text-right tabular-nums">{String(idx + 1).padStart(2, "0")}</span>
                <span className={b.cls}>{b.emoji} {s.status}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-text font-semibold">{s.step}</p>
                  {s.message && <p className="text-textMuted break-words mt-0.5">{s.message}</p>}
                  {typeof s.rows === "number" && <p className="text-textMuted mt-0.5">{s.rows.toLocaleString()} filas</p>}
                </div>
                {s.ts && <span className="text-textMuted whitespace-nowrap">{new Date(s.ts).toLocaleTimeString()}</span>}
              </li>
            );
          })}
          {running && (
            <li className="flex items-center gap-3 p-3 rounded-lg bg-panelAlt text-textMuted">
              <span className="animate-pulse text-accent">●</span> Ejecutando pipeline…
            </li>
          )}
        </ol>
      )}
    </div>
  );
}