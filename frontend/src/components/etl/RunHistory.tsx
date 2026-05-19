"use client";

import type { EtlRun, EtlRunStatus } from "@/types/etl";

type Props = { runs: EtlRun[] | null; loading: boolean; error: string | null; };

function Badge({ status }: { status: EtlRunStatus }) {
  const cls = status === "ok" ? "badge-success" : status === "error" ? "badge-error" : "badge-pending";
  const emoji = status === "ok" ? "✅" : status === "error" ? "❌" : "⏳";
  return <span className={`badge ${cls}`}>{emoji} {status}</span>;
}

function fmtDate(d?: string | null): string {
  if (!d) return "—";
  const x = new Date(d);
  if (Number.isNaN(x.getTime())) return d;
  return x.toLocaleString();
}

function fmtDur(ms?: number | null): string {
  if (typeof ms !== "number" || ms < 0) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${Math.round(ms / 100) / 10}s`;
}

export default function RunHistory({ runs, loading, error }: Props) {
  const rows = (runs ?? []).slice(0, 20);
  return (
    <div className="card">
      <h3 className="card-title"><span>📜</span> Historial de ejecuciones</h3>
      {loading && <p className="text-textMuted">Cargando…</p>}
      {error && <p className="text-rose-400">{error}</p>}
      {!loading && !error && rows.length === 0 && <p className="text-textMuted">No hay ejecuciones registradas.</p>}
      {!loading && !error && rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr><th>Run</th><th>Paso</th><th>Estado</th><th className="text-right">Filas</th><th>Inicio</th><th className="text-right">Duración</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={`${r.run_id}-${r.step}-${r.started_at}`} className="hover:bg-panelAlt transition">
                  <td className="font-mono text-xs text-textMuted">{String(r.run_id).slice(0, 8)}</td>
                  <td className="font-medium">{r.step}</td>
                  <td><Badge status={r.status} /></td>
                  <td className="text-right tabular-nums">{r.rows_processed?.toLocaleString() ?? "—"}</td>
                  <td className="text-textMuted">{fmtDate(r.started_at)}</td>
                  <td className="text-right tabular-nums">{fmtDur(r.duration_ms)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}