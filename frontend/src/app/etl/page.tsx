"use client";

import { useCallback, useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import KpiCard from "@/components/ui/KpiCard";
import DonutChart from "@/components/ui/DonutChart";
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
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const allRuns = runs || [];
  const totalRows = (tables || []).reduce((s, t) => s + (t.row_count || 0), 0);
  const lastRun = allRuns.slice().sort(
    (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
  )[0];
  const lastDur = lastRun?.duration_ms;
  const successCount = allRuns.filter((r) => r.status === "ok").length;
  const errorCount = allRuns.filter((r) => r.status === "error").length;
  const recentRuns = allRuns.slice(0, 10).reverse(); // antiguos → recientes

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

      {/* Pipeline flow ahora muestra números reales */}
      <EtlPipelineFlow tables={tables || []} runs={allRuns} />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Última ejecución" value={lastRun ? new Date(lastRun.started_at).toLocaleTimeString() : "—"} emoji="🕐" variant="cyan" hint={lastRun ? new Date(lastRun.started_at).toLocaleDateString() : ""} />
        <KpiCard label="Duración" value={typeof lastDur === "number" ? `${(lastDur / 1000).toFixed(1)}s` : "—"} emoji="⏱️" variant="orange" />
        <KpiCard label="Registros en DWH" value={totalRows.toLocaleString()} emoji="📊" variant="violet" />
        <KpiCard label="Ejecuciones exitosas" value={`${successCount}/${allRuns.length}`} emoji="✅" variant="green" />
      </div>

      <SyncButton onComplete={fetchStatus} />

      {/* CHARTS: barras de duración + donut de éxito */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card lg:col-span-2">
          <h3 className="card-title"><span>📊</span> Duración — últimas 10 ejecuciones</h3>
          {recentRuns.length === 0 ? (
            <p className="text-textMuted text-sm">Sin ejecuciones registradas todavía.</p>
          ) : (
            <>
              <div className="flex items-end gap-2 h-40">
                {recentRuns.map((r, i) => {
                  const dur = r.duration_ms || 0;
                  const max = Math.max(...recentRuns.map(x => x.duration_ms || 0)) || 1;
                  const h = Math.max(6, (dur / max) * 100);
                  const isOk = r.status === "ok";
                  return (
                    <div key={`${r.run_id}-${i}`} className="flex-1 flex flex-col items-center gap-1 group">
                      <div className="text-[10px] text-textMuted tabular-nums opacity-0 group-hover:opacity-100 transition">
                        {(dur / 1000).toFixed(1)}s
                      </div>
                      <div className="w-full bg-panelAlt rounded-t flex items-end h-full">
                        <div
                          className={`w-full rounded-t ${isOk ? "bg-gradient-to-t from-emerald-500 to-accent" : "bg-gradient-to-t from-rose-600 to-rose-400"}`}
                          style={{ height: `${h}%` }}
                          title={`${new Date(r.started_at).toLocaleString()} — ${(dur / 1000).toFixed(1)}s — ${r.status}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-textMuted mt-2 text-center">
                ← antiguas · recientes →
              </p>
            </>
          )}
        </div>

        <div className="card">
          <h3 className="card-title"><span>🍩</span> Tasa de éxito</h3>
          {allRuns.length === 0 ? (
            <p className="text-textMuted text-sm">Sin datos.</p>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <DonutChart
                size={150}
                thickness={22}
                slices={[
                  { label: "Éxito", value: successCount, color: "#1DB954" },
                  { label: "Error", value: errorCount, color: "#f43f5e" },
                ]}
                center={{
                  label: "éxito",
                  value: `${Math.round((successCount / allRuns.length) * 100)}%`,
                }}
              />
              <div className="space-y-1 text-sm w-full">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-accent" /> Éxito
                  </span>
                  <span className="text-textMuted tabular-nums">{successCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Error
                  </span>
                  <span className="text-textMuted tabular-nums">{errorCount}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <DwhStatusTable tables={tables} loading={loading} error={error} />
      <RunHistory runs={runs} loading={loading} error={error} />
    </div>
  );
}

export default function EtlPage() {
  return <ProtectedRoute><EtlContent /></ProtectedRoute>;
}