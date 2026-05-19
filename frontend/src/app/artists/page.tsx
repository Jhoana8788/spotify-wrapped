"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import KpiCard from "@/components/ui/KpiCard";
import { api, ApiError } from "@/lib/api";
import type { Artist } from "@/types/artist";

function unwrap<T>(p: unknown): T[] {
  if (Array.isArray(p)) return p as T[];
  if (p && typeof p === "object" && Array.isArray((p as { items?: unknown[] }).items)) {
    return (p as { items: T[] }).items;
  }
  return [];
}

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

  const totalFollowers = (artists || []).reduce((s, a) => s + (a.followers || 0), 0);
  const avgPop = artists && artists.length
    ? Math.round(artists.reduce((s, a) => s + a.popularity, 0) / artists.length) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="flex items-center gap-2"><span>🎤</span> Top Artistas</h1>
        <p className="text-textMuted text-sm mt-1">Descubre tus artistas más escuchados</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <KpiCard label="Artistas únicos" value={(artists?.length ?? 0).toLocaleString()} emoji="🎤" variant="pink" />
        <KpiCard label="Followers totales" value={totalFollowers.toLocaleString()} emoji="👥" variant="violet" />
        <KpiCard label="Popularidad promedio" value={`${avgPop}/100`} emoji="🔥" variant="orange" />
      </div>

      <div className="card">
        <h3 className="card-title"><span>🏆</span> Ranking</h3>
        {loading && <p className="text-textMuted">Cargando…</p>}
        {error && <p className="text-rose-400">{error}</p>}
        {!loading && !error && artists && artists.length === 0 && <p className="text-textMuted">Sin artistas.</p>}
        {!loading && !error && artists && artists.length > 0 && (
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr><th>#</th><th>Artista</th><th>Géneros</th><th className="text-right">Popularidad</th></tr>
              </thead>
              <tbody>
                {artists.map((a, i) => (
                  <tr key={a.id} className="hover:bg-panelAlt transition">
                    <td className="text-textMuted">{i + 1}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        {a.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={a.image_url} alt={a.name} className="w-10 h-10 rounded-full object-cover bg-panelAlt" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-panelAlt flex items-center justify-center">🎤</div>
                        )}
                        <span className="font-medium">{a.name}</span>
                      </div>
                    </td>
                    <td className="text-textMuted text-xs">{(a.genres || []).slice(0, 3).join(", ") || "—"}</td>
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
        )}
      </div>
    </div>
  );
}

export default function ArtistsPage() {
  return <ProtectedRoute><Content /></ProtectedRoute>;
}