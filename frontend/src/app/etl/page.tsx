"use client";

import { useCallback, useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import KpiCard from "@/components/ui/KpiCard";
import EtlPipelineFlow from "@/components/dashboard/EtlPipelineFlow";
import DwhStatusTable from "@/components/etl/DwhStatusTable";
import RunHistory from "@/components/etl/RunHistory";
import SyncButton from "@/components/etl/SyncButton";
import { api, ApiError } from "@/lib/api";
import type { DwhStatus, EtlRun } from "@/types/etl";

function parse(payload: unknown): { tables: DwhStatus[]; runs: EtlRun[] } {
  if (Array.isArray(payload)) return { tables: [], runs: payload as EtlRun[] };
  if (payload && typeof payload === "object") {
    const o = payload as Record<string, unknown>;
    return {
      tables: (Array.isArray(o.tables) ? o.tables : Array.isArray(o.dwh) ? o.dwh : []) as DwhStatus[],
      runs: (Array.isArray(o.runs) ? o.runs : Array.isArray(o.audit) ? o.audit : []) as EtlRun[],
    };
  }
  return { tables: [], runs: [] };
}

function EtlContent() {
  const [tables, setTables] = useState<DwhStatus[] | null>(null);
  const [runs, setRuns] = useState<EtlRun[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const p = await api.get<unknown>("/v1/etl/status");
      const r = parse(p);
      setTables(r.tables);
      setRuns(r.runs);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Error de red");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const totalRows = (tables || []).reduce((s, t) => s + (t.row_count || 0), 0);
  const lastRun = (runs || []).slice().sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())[0];
  const lastDur = lastRun?.duration_ms;
  const successCount = (runs || []).filter((r) => r.status === "ok").length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="flex items-center gap-2"><span>⚡</span> ETL Monitor</h1>
          <p className="text-textMuted text-sm mt-1">Monitorea el flujo de datos en tiempo real</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-success">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            En tiempo real
          </span>
          <button onClick={fetchStatus} disabled={loading} className="btn btn-secondary !text-xs !py-1.5">
            {loading ? "Actualizando…" : "🔄 Refrescar"}
          </button>
        </div>
      </div>

      <EtlPipelineFlow tables={tables || []} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Última ejecución" value={lastRun ? new Date(lastRun.started_at).toLocaleTimeString() : "—"} emoji="🕐" variant="cyan" hint={lastRun ? new Date(lastRun.started_at).toLocaleDateString() : ""} />
        <KpiCard label="Duración" value={typeof lastDur === "number" ? `${(lastDur / 1000).toFixed(1)}s` : "—"} emoji="⏱️" variant="orange" />
        <KpiCard label="Registros procesados" value={totalRows.toLocaleString()} emoji="📊" variant="violet" hint="en el DWH" />
        <KpiCard label="Ejecuciones exitosas" value={successCount.toLocaleString()} emoji="✅" variant="green" />
      </div>

      <SyncButton onComplete={fetchStatus} />
      <DwhStatusTable tables={tables} loading={loading} error={error} />
      <RunHistory runs={runs} loading={loading} error={error} />
    </div>
  );
}

export default function EtlPage() {
  return <ProtectedRoute><EtlContent /></ProtectedRoute>;
}