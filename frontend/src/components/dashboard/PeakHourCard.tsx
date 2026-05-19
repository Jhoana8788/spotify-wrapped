"use client";

import { useMemo } from "react";
import type { HistoryItem } from "@/types/history";

type Props = { history: HistoryItem[] | null; loading: boolean; error: string | null; };

function compute(history: HistoryItem[]) {
  const c = new Array<number>(24).fill(0);
  for (const i of history) {
    const d = new Date(i.played_at);
    if (!Number.isNaN(d.getTime())) c[d.getHours()] += 1;
  }
  let ph = 0, pc = 0;
  for (let h = 0; h < 24; h++) if (c[h] > pc) { pc = c[h]; ph = h; }
  return { counts: c, peakHour: ph, peakCount: pc, total: history.length };
}

const fmtH = (h: number) => `${h.toString().padStart(2, "0")}:00`;

export default function PeakHourCard({ history, loading, error }: Props) {
  const stats = useMemo(() => (history ? compute(history) : null), [history]);

  return (
    <div className="card">
      <h3 className="card-title flex items-center justify-between">
        <span className="flex items-center gap-2"><span>📈</span> Actividad por hora</span>
        <span className="text-xs text-textMuted font-normal">Últimos 7 días</span>
      </h3>
      {loading && <p className="text-textMuted">Cargando…</p>}
      {error && <p className="text-rose-400">{error}</p>}
      {!loading && !error && stats && stats.total === 0 && <p className="text-textMuted">Sin historial reciente.</p>}
      {!loading && !error && stats && stats.total > 0 && (
        <>
          <div className="flex items-baseline gap-4 mb-4 flex-wrap">
            <div>
              <p className="text-3xl font-bold text-accent">{fmtH(stats.peakHour)}</p>
              <p className="text-xs text-textMuted">Tu hora pico</p>
            </div>
            <div className="text-xs text-textMuted">
              {stats.peakCount} reproducciones · {stats.total} en total
            </div>
          </div>
          <div className="flex items-end gap-[3px] h-32" aria-label="Distribución por hora">
            {stats.counts.map((c, h) => {
              const max = Math.max(...stats.counts) || 1;
              const heightPct = Math.max(4, (c / max) * 100);
              const isPeak = h === stats.peakHour;
              return (
                <div key={h} className="flex-1 flex items-end h-full">
                  <div
                    title={`${fmtH(h)} — ${c} reproducciones`}
                    className={["w-full rounded-t", isPeak ? "bg-gradient-to-t from-accent to-emerald-300 shadow-glow" : "bg-gradient-to-t from-panelAlt to-panelHover"].join(" ")}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-[10px] text-textMuted mt-2">
            {[0, 4, 8, 12, 16, 20, 23].map((h) => <span key={h}>{h.toString().padStart(2, "0")}</span>)}
          </div>
        </>
      )}
    </div>
  );
}