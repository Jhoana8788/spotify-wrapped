"use client";

import { useMemo } from "react";
import type { HistoryItem } from "@/types/history";

type Props = {
  history: HistoryItem[] | null;
  loading: boolean;
  error: string | null;
};

/**
 * Hora pico: bucketizamos played_at por hora local del usuario
 * y nos quedamos con la que más ocurrencias tiene. Devolvemos
 * también el histograma para pintar las barras.
 */
function computePeakHour(history: HistoryItem[]) {
  const counts = new Array<number>(24).fill(0);
  for (const item of history) {
    const d = new Date(item.played_at);
    if (Number.isNaN(d.getTime())) continue;
    counts[d.getHours()] += 1;
  }
  let peakHour = 0;
  let peakCount = 0;
  for (let h = 0; h < 24; h++) {
    if (counts[h] > peakCount) {
      peakCount = counts[h];
      peakHour = h;
    }
  }
  return { counts, peakHour, peakCount, total: history.length };
}

function fmtHour(h: number): string {
  return `${h.toString().padStart(2, "0")}:00`;
}

export default function PeakHourCard({ history, loading, error }: Props) {
  const stats = useMemo(
    () => (history ? computePeakHour(history) : null),
    [history],
  );

  return (
    <div className="card">
      <h3 className="card-title">Hora pico de escucha</h3>

      {loading && <p className="text-textMuted">Cargando…</p>}
      {error && <p className="text-red-400">{error}</p>}

      {!loading && !error && stats && stats.total === 0 && (
        <p className="text-textMuted">Sin historial reciente.</p>
      )}

      {!loading && !error && stats && stats.total > 0 && (
        <>
          <p className="text-3xl font-bold text-accent">
            {fmtHour(stats.peakHour)}
          </p>
          <p className="text-xs text-textMuted mb-4">
            {stats.peakCount} reproducciones a esa hora · {stats.total} en
            total
          </p>

          <div
            className="flex items-end gap-[2px] h-20"
            aria-label="Distribución por hora"
          >
            {stats.counts.map((c, h) => {
              const max = Math.max(...stats.counts) || 1;
              const heightPct = Math.max(4, (c / max) * 100);
              const isPeak = h === stats.peakHour;
              return (
                <div
                  key={h}
                  title={`${fmtHour(h)} — ${c} reproducciones`}
                  className={[
                    "flex-1 rounded-sm",
                    isPeak ? "bg-accent" : "bg-panelAlt",
                  ].join(" ")}
                  style={{ height: `${heightPct}%` }}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-[10px] text-textMuted mt-1">
            <span>00</span>
            <span>06</span>
            <span>12</span>
            <span>18</span>
            <span>23</span>
          </div>
        </>
      )}
    </div>
  );
}