"use client";

import { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import KpiCard from "@/components/ui/KpiCard";
import DonutChart from "@/components/ui/DonutChart";
import { api, ApiError } from "@/lib/api";
import type { Artist } from "@/types/artist";

function unwrap<T>(p: unknown): T[] {
  if (Array.isArray(p)) return p as T[];
  if (p && typeof p === "object" && Array.isArray((p as any).items)) return (p as any).items;
  return [];
}

function normalizeArtist(raw: any): Artist {
  return {
    id: raw.id || raw.spotify_id || raw.name,
    name: raw.name,
    popularity: raw.popularity ?? 0,
    genres: Array.isArray(raw.genres) ? raw.genres : [],
    followers: raw.followers ?? raw.followers_count ?? null,
    image_url: raw.image_url || null,
  };
}

const COLORS = ["#1DB954","#8b5cf6","#ec4899","#f97316","#06b6d4","#f59e0b","#6366f1","#f43f5e"];
const MEDALS = ["🥇","🥈","🥉","4️⃣","5️⃣"];

function Content() {
  const [artists, setArtists] = useState<Artist[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api.get<unknown>("/v1/artists/top")
      .then(d => { if (!cancelled) setArtists(unwrap<any>(d).map(normalizeArtist)); })
      .catch(e => !cancelled && setError(e instanceof ApiError ? e.message : "Error de red"))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  const genreCounts = useMemo(() => {
    const m = new Map<string, number>();
    (artists || []).forEach(a => (a.genres || []).forEach(g => m.set(g, (m.get(g) || 0) + 1)));
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
  }, [artists]);

  const genreArtistsMap = useMemo(() => {
    const m = new Map<string, string[]>();
    (artists || []).forEach(a => {
      (a.genres || []).forEach(g => {
        if (!m.has(g)) m.set(g, []);
        m.get(g)!.push(a.name);
      });
    });
    return m;
  }, [artists]);

  const total = genreCounts.reduce((s, [, c]) => s + c, 0) || 1;
  const top5 = genreCounts.slice(0, 5);
  const top8 = genreCounts.slice(0, 8);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="flex items-center gap-2"><span>🎭</span> Géneros</h1>
        <p className="text-textMuted text-sm mt-1">Explora los géneros que más escuchas</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Géneros únicos" value={genreCounts.length.toLocaleString()} emoji="🎭" variant="orange" />
        <KpiCard label="Apariciones" value={total.toLocaleString()} emoji="🔢" variant="violet" />
        <KpiCard label="Top género" value={top5[0]?.[0] ?? "—"} emoji="🔥" variant="pink" />
        <KpiCard label="Artistas medidos" value={(artists?.length ?? 0).toLocaleString()} emoji="🎤" variant="cyan" />
      </div>

      {loading && <div className="card"><p className="text-textMuted">Cargando…</p></div>}
      {error && <div className="card"><p className="text-rose-400">{error}</p></div>}

      {!loading && !error && top5.length > 0 && (
        <>
          {/* TOP 5 HERO */}
          <div className="card">
            <h3 className="card-title">
              <span>🏆</span> Top 5 Géneros
              <span className="badge badge-success ml-2">tus favoritos</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {top5.map(([genre, count], i) => {
                const pct = Math.round((count / total) * 100);
                const examples = (genreArtistsMap.get(genre) || []).slice(0, 2);
                return (
                  <div key={genre} className="text-center p-3 rounded-xl border border-border bg-panelAlt hover:border-accent transition">
                    <div className="text-3xl mb-2">{MEDALS[i]}</div>
                    <p className="text-sm font-bold capitalize truncate" title={genre}>{genre}</p>
                    <p className="text-2xl font-bold mt-1" style={{ color: COLORS[i] }}>{pct}%</p>
                    <p className="text-[10px] text-textMuted">{count} artistas</p>
                    {examples.length > 0 && (
                      <p className="text-[10px] text-textMuted mt-1 truncate" title={examples.join(", ")}>
                        {examples.join(", ")}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* DONUT + BARRAS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card">
              <h3 className="card-title"><span>🍩</span> Distribución</h3>
              <div className="flex items-center gap-6 flex-wrap">
                <DonutChart
                  size={220}
                  thickness={28}
                  slices={top8.map(([label, value], i) => ({
                    label, value, color: COLORS[i % COLORS.length]
                  }))}
                  center={{ label: "géneros", value: genreCounts.length.toString() }}
                />
                <ul className="flex-1 space-y-2 min-w-[140px]">
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
              <h3 className="card-title"><span>📊</span> Ranking visual</h3>
              <ul className="space-y-3">
                {top8.map(([g, c], i) => {
                  const pct = Math.round((c / total) * 100);
                  return (
                    <li key={g}>
                      <div className="flex items-center justify-between mb-1 text-sm">
                        <span className="flex items-center gap-2">
                          <span className="text-textMuted w-5 text-xs">{i + 1}</span>
                          <span className="capitalize">{g} {i === 0 && "🔥"}</span>
                        </span>
                        <span className="text-textMuted text-xs">{c} · {pct}%</span>
                      </div>
                      <div className="h-2 bg-panelAlt rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* TODOS LOS GÉNEROS */}
          {genreCounts.length > 8 && (
            <div className="card">
              <h3 className="card-title"><span>📋</span> Todos los géneros ({genreCounts.length})</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {genreCounts.map(([g, c]) => (
                  <div key={g} className="flex items-center justify-between p-2 rounded bg-panelAlt text-sm">
                    <span className="capitalize truncate">{g}</span>
                    <span className="text-textMuted text-xs tabular-nums">{c}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function GenresPage() {
  return <ProtectedRoute><Content /></ProtectedRoute>;
}