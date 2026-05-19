"use client";

import { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import KpiCard from "@/components/ui/KpiCard";
import DonutChart from "@/components/ui/DonutChart";
import { api, ApiError } from "@/lib/api";
import type { Artist } from "@/types/artist";

function unwrap<T>(p: unknown): T[] {
  if (Array.isArray(p)) return p as T[];
  if (p && typeof p === "object" && Array.isArray((p as { items?: unknown[] }).items)) {
    return (p as { items: T[] }).items;
  }
  return [];
}

const COLORS = ["#1DB954","#8b5cf6","#ec4899","#f97316","#06b6d4","#f59e0b","#6366f1","#f43f5e"];

function Content() {
  const [artists, setArtists] = useState<Artist[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api.get<unknown>("/v1/artists/top")
      .then((d) => { if (!cancelled) setArtists(unwrap<Artist>(d)); })
      .catch((e) => !cancelled && setError(e instanceof ApiError ? e.message : "Error de red"))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  const genreCounts = useMemo(() => {
    const m = new Map<string, number>();
    (artists || []).forEach((a) => (a.genres || []).forEach((g) => m.set(g, (m.get(g) || 0) + 1)));
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
  }, [artists]);

  const total = genreCounts.reduce((s, [, c]) => s + c, 0) || 1;
  const top8 = genreCounts.slice(0, 8);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="flex items-center gap-2"><span>🎭</span> Géneros</h1>
        <p className="text-textMuted text-sm mt-1">Explora los géneros que más escuchas</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <KpiCard label="Géneros únicos" value={genreCounts.length.toLocaleString()} emoji="🎭" variant="orange" />
        <KpiCard label="Apariciones" value={total.toLocaleString()} emoji="🔢" variant="violet" />
        <KpiCard label="Top género" value={top8[0]?.[0] ?? "—"} emoji="🔥" variant="pink" />
      </div>

      {loading && <div className="card"><p className="text-textMuted">Cargando…</p></div>}
      {error && <div className="card"><p className="text-rose-400">{error}</p></div>}

      {!loading && !error && top8.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card">
            <h3 className="card-title"><span>🍩</span> Distribución por género</h3>
            <div className="flex items-center gap-6 flex-wrap">
              <DonutChart
                size={220}
                thickness={28}
                slices={top8.map(([label, value], i) => ({ label, value, color: COLORS[i % COLORS.length] }))}
                center={{ label: "apariciones", value: total.toLocaleString() }}
              />
              <ul className="flex-1 space-y-2 min-w-[150px]">
                {top8.map(([g, c], i) => (
                  <li key={g} className="flex items-center gap-2 text-sm">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="flex-1 capitalize truncate">{g}</span>
                    <span className="text-textMuted text-xs tabular-nums">{Math.round((c / total) * 100)}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title"><span>📊</span> Top géneros</h3>
            <ul className="space-y-3">
              {top8.map(([g, c], i) => {
                const pct = Math.round((c / total) * 100);
                return (
                  <li key={g}>
                    <div className="flex items-center justify-between mb-1 text-sm">
                      <span className="flex items-center gap-2">
                        <span className="text-textMuted w-5 text-xs">{i + 1}</span>
                        <span className="capitalize">{g}</span>
                      </span>
                      <span className="text-textMuted text-xs">{c} · {pct}%</span>
                    </div>
                    <div className="h-1.5 bg-panelAlt rounded">
                      <div className="h-1.5 rounded" style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GenresPage() {
  return <ProtectedRoute><Content /></ProtectedRoute>;
}