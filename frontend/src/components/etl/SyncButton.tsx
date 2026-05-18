"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { EtlStepLog, EtlRunStatus } from "@/types/etl";

type Props = {
  /** Callback opcional para refrescar el estado del DWH al terminar. */
  onComplete?: () => void;
};

/**
 * El backend devuelve los pasos del ETL. Aceptamos varias formas:
 *   - Array<EtlStepLog>
 *   - { steps: EtlStepLog[] }
 *   - { logs:  EtlStepLog[] }
 */
function extractSteps(payload: unknown): EtlStepLog[] {
  if (Array.isArray(payload)) return payload as EtlStepLog[];
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.steps)) return obj.steps as EtlStepLog[];
    if (Array.isArray(obj.logs)) return obj.logs as EtlStepLog[];
  }
  return [];
}

function stepBadge(status: EtlRunStatus) {
  const cls =
    status === "ok"
      ? "badge-success"
      : status === "error"
        ? "badge-error"
        : "badge-pending";
  return `badge ${cls}`;
}

export default function SyncButton({ onComplete }: Props) {
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState<EtlStepLog[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    setRunning(true);
    setSteps([]);
    setError(null);
    try {
      const payload = await api.post<unknown>("/v1/etl/run");
      setSteps(extractSteps(payload));
      onComplete?.();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Error ejecutando el ETL");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="card-title !mb-0">Sync manual</h3>
        <button
          onClick={handleRun}
          disabled={running}
          className="btn btn-primary"
        >
          {running ? "Ejecutando…" : "Sync Now"}
        </button>
      </div>

      {error && <p className="text-red-400 mb-3">{error}</p>}

      {steps.length === 0 && !running && !error && (
        <p className="text-textMuted text-sm">
          Aún no se ha lanzado ninguna ejecución en esta sesión.
        </p>
      )}

      {(running || steps.length > 0) && (
        <ol className="space-y-2 font-mono text-xs">
          {steps.map((s, idx) => (
            <li
              key={`${s.step}-${idx}`}
              className="flex items-start gap-3 p-2 rounded bg-panelAlt"
            >
              <span className="text-textMuted w-6 text-right">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <span className={stepBadge(s.status)}>{s.status}</span>
              <div className="flex-1 min-w-0">
                <p className="text-text font-semibold">{s.step}</p>
                {s.message && (
                  <p className="text-textMuted break-words">{s.message}</p>
                )}
                {typeof s.rows === "number" && (
                  <p className="text-textMuted">
                    {s.rows.toLocaleString()} filas
                  </p>
                )}
              </div>
              {s.ts && (
                <span className="text-textMuted whitespace-nowrap">
                  {new Date(s.ts).toLocaleTimeString()}
                </span>
              )}
            </li>
          ))}
          {running && (
            <li className="flex items-center gap-3 p-2 rounded bg-panelAlt text-textMuted">
              <span className="animate-pulse">●</span> Ejecutando pipeline…
            </li>
          )}
        </ol>
      )}
    </div>
  );
}