"use client";

import { useCallback, useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DwhStatusTable from "@/components/etl/DwhStatusTable";
import RunHistory from "@/components/etl/RunHistory";
import SyncButton from "@/components/etl/SyncButton";
import { api, ApiError } from "@/lib/api";
import type { DwhStatus, EtlRun } from "@/types/etl";

/**
 * El endpoint /v1/etl/status puede venir en varias formas. Soportamos:
 *  - { tables: DwhStatus[], runs: EtlRun[] }
 *  - { dwh:    DwhStatus[], audit: EtlRun[] }
 *  - EtlRun[]  (en cuyo caso no podemos derivar el estado por tabla y
 *               solo poblamos el historial)
 */
function parseStatusPayload(payload: unknown): {
  tables: DwhStatus[];
  runs: EtlRun[];
} {
  if (Array.isArray(payload)) {
    return { tables: [], runs: payload as EtlRun[] };
  }
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    const tables =
      (Array.isArray(obj.tables) && (obj.tables as DwhStatus[])) ||
      (Array.isArray(obj.dwh) && (obj.dwh as DwhStatus[])) ||
      [];
    const runs =
      (Array.isArray(obj.runs) && (obj.runs as EtlRun[])) ||
      (Array.isArray(obj.audit) && (obj.audit as EtlRun[])) ||
      [];
    return { tables, runs };
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
      const payload = await api.get<unknown>("/v1/etl/status");
      const parsed = parseStatusPayload(payload);
      setTables(parsed.tables);
      setRuns(parsed.runs);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Error de red");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1>ETL</h1>
          <p className="text-textMuted text-sm">
            Estado del DWH, historial y ejecución manual del pipeline.
          </p>
        </div>
        <button
          onClick={fetchStatus}
          disabled={loading}
          className="btn btn-secondary"
        >
          {loading ? "Actualizando…" : "Refrescar"}
        </button>
      </div>

      <DwhStatusTable tables={tables} loading={loading} error={error} />

      <SyncButton onComplete={fetchStatus} />

      <RunHistory runs={runs} loading={loading} error={error} />
    </div>
  );
}

export default function EtlPage() {
  return (
    <ProtectedRoute>
      <EtlContent />
    </ProtectedRoute>
  );
}