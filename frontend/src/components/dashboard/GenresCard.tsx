"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { Artist } from "@/types/artist";

type Props = { artists: Artist[] | null; loading: boolean; error: string | null; };

const COLORS = ["#1DB954","#8b5cf6","#ec4899","#f97316","#06b6d4","#f59e0b","#6366f1","#f43f5e"];

function compute(artists: Artist[]) {
  const m = new Map<string, number>();
  for (const a of artists) for (const g of a.genres ?? []) m.set(g, (m.get(g) ?? 0) + 1);
  const total = Array.from(m.values()).reduce((s, n) => s + n, 0);
  const top = Array.from(m.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);
  return { top, total };
}

export default function GenresCard({ artists, loading, error }: Props) {
  const { top, total } = useMemo(() => (artists ? compute(artists) : { top: [], total: 0 }), [artists]);

  return (
    <div className="card">
      <h3 className="card-title flex items-center justify-between">
        <span className="flex items-center gap-2"><span>🎭</span> Géneros más escuchados</span>
        <Link href="/genres" className="text-xs text-accent hover:underline">Ver todos</Link>
      </h3>
      {loading && <p className="text-textMuted">Cargando…</p>}
      {error && <p className="text-rose-400">{error}</p>}
      {!loading && !error && top.length === 0 && <p className="text-textMuted">No hay géneros para mostrar.</p>}
      {!loading && !error && top.length > 0 && (
        <ul className="space-y-3">
          {top.slice(0, 5).map(([genre, count], i) => {
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            const color = COLORS[i % COLORS.length];
            return (
              <li key={genre}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="capitalize">{genre} {i === 0 ? "🔥" : ""}</span>
                  <span className="text-textMuted text-xs tabular-nums">{pct}%</span>
                </div>
                <div className="h-2 bg-panelAlt rounded-full overflow-hidden">
                  <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}