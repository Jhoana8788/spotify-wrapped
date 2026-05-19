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

// Acepta el shape del backend con o sin los fixes aplicados:
// (spotify_id|id), (followers|followers_count)
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

  const totalFollowers = (artists || []).reduce((s, a) => s + (a.followers || 0), 0);
  const avgPop = artists && artists.length
    ? Math.round(artists.reduce((s, a) => s + a.popularity, 0) / artists.length)
    : 0;
  const top5 = (artists || []).slice(0, 5);
  const top10 = (artists || []).slice(0, 10);

  const topGenres = useMemo(() => {
    const m = new Map<string, number>();
    (artists || []).forEach(a => (a.genres || []).forEach(g => m.set(g, (m.get(g) || 0) + 1)));
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
  }, [artists]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="flex items-center gap-2"><span>🎤</span> Top Artistas</h1>
        <p className="text-textMuted text-sm mt-1">Descubre tus artistas más escuchados</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Artistas únicos" value={(artists?.length ?? 0).toLocaleString()} emoji="🎤" variant="pink" />
        <KpiCard label="Followers totales" value={totalFollowers > 0 ? totalFollowers.toLocaleString() : "—"} emoji="👥" variant="violet" />
        <KpiCard label="Popularidad media" value={avgPop > 0 ? `${avgPop}/100` : "—"} emoji="🔥" variant="orange" />
        <KpiCard label="Géneros únicos" value={topGenres.length.toLocaleString()} emoji="🎭" variant="cyan" />
      </div>

      {loading && <div className="card"><p className="text-textMuted">Cargando…</p></div>}
      {error && <div className="card"><p className="text-rose-400">{error}</p></div>}

      {!loading && !error && top5.length > 0 && (
        <>
          {/* TOP 5 HERO */}
          <div className="card">
            <h3 className="card-title">
              <span>🏆</span> Top 5 Artistas
              <span className="badge badge-success ml-2">los más sonados</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {top5.map((a, i) => (
                <div key={a.id} className="text-center group">
                  <div className="relative inline-block">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-pink-500/30 to-violet-500/30 flex items-center justify-center text-4xl border-2 border-border group-hover:border-accent transition">
                      🎤
                    </div>
                    <span className="absolute -top-1 -right-1 text-2xl">{MEDALS[i]}</span>
                  </div>
                  <p className="text-sm font-bold mt-3 truncate" title={a.name}>{a.name}</p>
                  <p className="text-xs text-textMuted mt-0.5">🔥 {a.popularity}</p>
                  {a.followers != null && a.followers > 0 && (
                    <p className="text-[10px] text-textMuted mt-0.5">
                      👥 {a.followers >= 1000
                        ? `${(a.followers / 1000).toFixed(0)}K`
                        : a.followers.toLocaleString()}
                    </p>
                  )}
                  {(a.genres || []).length > 0 && (
                    <p className="text-[10px] text-textMuted mt-0.5 truncate" title={a.genres.join(", ")}>
                      {a.genres.slice(0, 1).join(", ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* CHARTS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card">
              <h3 className="card-title"><span>📊</span> Popularidad — Top 10</h3>
              <ul className="space-y-2">
                {top10.map((a, i) => (
                  <li key={a.id}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="flex items-center gap-2 min-w-0">
                        <span className="text-textMuted w-5 text-xs">{i + 1}</span>
                        <span className="truncate">{a.name}</span>
                      </span>
                      <span className="text-textMuted text-xs tabular-nums">{a.popularity}</span>
                    </div>
                    <div className="h-1.5 bg-panelAlt rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-orange-500 to-rose-500" style={{ width: `${a.popularity}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card">
              <h3 className="card-title"><span>🎭</span> Géneros que escuchas</h3>
              {topGenres.length > 0 ? (
                <div className="flex items-center gap-6 flex-wrap">
                  <DonutChart
                    size={180}
                    thickness={22}
                    slices={topGenres.slice(0, 6).map(([label, value], i) => ({
                      label, value, color: COLORS[i % COLORS.length]
                    }))}
                    center={{ label: "géneros", value: topGenres.length.toString() }}
                  />
                  <ul className="flex-1 space-y-2 min-w-[140px]">
                    {topGenres.slice(0, 6).map(([g, c], i) => (
                      <li key={g} className="flex items-center gap-2 text-sm">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="flex-1 capitalize truncate">{g}</span>
                        <span className="text-textMuted text-xs">{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : <p className="text-textMuted text-sm">Sin géneros para mostrar.</p>}
            </div>
          </div>

          {/* RANKING COMPLETO */}
          <div className="card">
            <h3 className="card-title"><span>📋</span> Ranking completo</h3>
            <div className="overflow-x-auto">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Artista</th>
                    <th>Géneros</th>
                    <th>Followers</th>
                    <th className="text-right">Popularidad</th>
                  </tr>
                </thead>
                <tbody>
                  {artists!.map((a, i) => (
                    <tr key={a.id} className="hover:bg-panelAlt transition">
                      <td className="text-textMuted">{i + 1}</td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-panelAlt flex items-center justify-center">🎤</div>
                          <span className="font-medium">{a.name}</span>
                        </div>
                      </td>
                      <td className="text-textMuted text-xs">{(a.genres || []).slice(0, 3).join(", ") || "—"}</td>
                      <td className="text-textMuted text-xs tabular-nums">
                        {a.followers != null ? a.followers.toLocaleString() : "—"}
                      </td>
                      <td className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <div className="w-20 h-1.5 bg-panelAlt rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-orange-500 to-rose-500" style={{ width: `${a.popularity}%` }} />
                          </div>
                          <span className="text-xs tabular-nums">{a.popularity}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function ArtistsPage() {
  return <ProtectedRoute><Content /></ProtectedRoute>;
}