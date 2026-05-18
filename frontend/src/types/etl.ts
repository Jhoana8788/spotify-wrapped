export type EtlRunStatus = "ok" | "error" | "running" | string;

export interface EtlRun {
  run_id: string | number;
  step: string;
  status: EtlRunStatus;
  rows_processed?: number | null;
  started_at: string;
  finished_at?: string | null;
  duration_ms?: number | null;
  message?: string | null;
}

/**
 * Snapshot del estado actual de las tablas del DWH.
 */
export interface DwhStatus {
  table: string;
  row_count: number;
  last_updated?: string | null;
  last_run_status?: EtlRunStatus | null;
  [extra: string]: unknown;
}

/** Línea de log paso a paso emitida por POST /v1/etl/run. */
export interface EtlStepLog {
  step: string;
  status: EtlRunStatus;
  message?: string | null;
  rows?: number | null;
  ts?: string | null;
}