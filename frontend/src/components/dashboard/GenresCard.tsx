"use client";

import { useMemo } from "react";
import type { Artist } from "@/types/artist";

type Props = {
  artists: Artist[] | null;
  loading: boolean;
  error: string | null;
};

/**
 * Géneros dominantes: aplastamos todos los `genres` de los artistas,
 * contamos ocurrencias y nos quedamos con el top 8.
 */
function computeGenres(artists: Artist[]) {
  const counts = new Map<string, number>();
  for (const a of artists) {
    for (const g of a.genres ?? []) {
      counts.set(g, (counts.get(g) ?? 0) + 1);
    }
  }
  const total = Array.from(counts.values()).reduce((s, n) => s + n, 0);
  const top = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  return { top, total };
}

export default function GenresCard({ artists, loading, error }: Props) {
  const { top, total } = useMemo(
    () =>
      artists ? computeGenres(artists) : { top: [], total: 0 },
    [artists],
  );

  return (
    <div className="card">
      <h3 className="card-title">Géneros dominantes</h3>

      {loading && <p className="text-textMuted">Cargando…</p>}
      {error && <p className="text-red-400">{error}</p>}

      {!loading && !error && top.length === 0 && (
        <p className="text-textMuted">
          No hay géneros para mostrar.
        </p>
      )}

      {!loading && !error && top.length > 0 && (
        <ul className="space-y-2">
          {top.map(([genre, count]) => {
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <li key={genre}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-text capitalize">{genre}</span>
                  <span className="text-textMuted text-xs">
                    {count} · {pct}%
                  </span>
                </div>
                <div className="h-1.5 bg-panelAlt rounded">
                  <div
                    className="h-1.5 bg-accent rounded"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}