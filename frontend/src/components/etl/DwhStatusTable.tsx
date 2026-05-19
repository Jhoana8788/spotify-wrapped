"use client";

import type { DwhStatus, EtlRunStatus } from "@/types/etl";

type Props = { tables: DwhStatus[] | null; loading: boolean; error: string | null; };

function Badge({ status }: { status?: EtlRunStatus | null }) {
  if (!status) return <span className="text-textMuted">—</span>;
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

export default function DwhStatusTable({ tables, loading, error }: Props) {
  return (
    <div className="card">
      <h3 className="card-title"><span>🗄️</span> Estado del DWH</h3>
      {loading && <p className="text-textMuted">Cargando…</p>}
      {error && <p className="text-rose-400">{error}</p>}
      {!loading && !error && (!tables || tables.length === 0) && <p className="text-textMuted">Sin información del DWH.</p>}
      {!loading && !error && tables && tables.length > 0 && (
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr><th>Tabla</th><th className="text-right">Filas</th><th>Actualizada</th><th>Estado</th></tr>
            </thead>
            <tbody>
              {tables.map((t) => (
                <tr key={t.table} className="hover:bg-panelAlt transition">
                  <td className="font-medium">{t.table}</td>
                  <td className="text-right tabular-nums">{t.row_count?.toLocaleString() ?? "—"}</td>
                  <td className="text-textMuted">{fmtDate(t.last_updated)}</td>
                  <td><Badge status={t.last_run_status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}