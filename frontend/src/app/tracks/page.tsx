"use client";

import { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import KpiCard from "@/components/ui/KpiCard";
import { api, ApiError } from "@/lib/api";
import type { Track } from "@/types/track";
import type { Artist } from "@/types/artist";

function unwrap<T>(p: unknown): T[] {
  if (Array.isArray(p)) return p as T[];
  if (p && typeof p === "object" && Array.isArray((p as { items?: unknown[] }).items)) {
    return (p as { items: T[] }).items;
  }
  return [];
}

function fmt(ms: number): string {
  if (!ms || ms < 0) return "—";
  const tot = Math.round(ms / 1000);
  return `${Math.floor(tot / 60)}:${(tot % 60).toString().padStart(2, "0")}`;
}

function Content() {
  const [tracks, setTracks] = useState<Track[] | null>(null);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api.get<unknown>("/v1/tracks/top"),
      api.get<unknown>("/v1/artists/top").catch(() => null),
    ])
      .then(([t, a]) => {
        if (cancelled) return;
        setTracks(unwrap<Track>(t));
        if (a) setArtists(unwrap<Artist>(a));
      })
      .catch((e) => !cancelled && setError(e instanceof ApiError ? e.message : "Error de red"))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  const artistById = useMemo(() => {
    const m = new Map<string, string>();
    artists.forEach((a) => m.set(a.id, a.name));
    return m;
  }, [artists]);

  const totalDur = (tracks || []).reduce((s, t) => s + (t.duration_ms || 0), 0);
  const totalH = Math.round(totalDur / 1000 / 60 / 60);
  const totalM = Math.round(totalDur / 1000 / 60);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="flex items-center gap-2"><span>🎵</span> Top Canciones</h1>
        <p className="text-textMuted text-sm mt-1">Las canciones que más escuchas</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <KpiCard label="Canciones" value={(tracks?.length ?? 0).toLocaleString()} emoji="🎵" variant="green" />
        <KpiCard label="Horas de música" value={totalH > 0 ? `${totalH}h` : `${totalM}m`} emoji="⏳" variant="cyan" />
        <KpiCard label="Duración total" value={`${totalM.toLocaleString()}m`} emoji="🎧" variant="violet" />
      </div>

      <div className="card">
        <h3 className="card-title"><span>🏆</span> Ranking</h3>
        {loading && <p className="text-textMuted">Cargando…</p>}
        {error && <p className="text-rose-400">{error}</p>}
        {!loading && !error && tracks && tracks.length === 0 && <p className="text-textMuted">Sin canciones.</p>}
        {!loading && !error && tracks && tracks.length > 0 && (
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr><th>#</th><th>Canción</th><th>Artista</th><th className="text-right">Duración</th></tr>
              </thead>
              <tbody>
                {tracks.map((t, i) => (
                  <tr key={t.id} className="hover:bg-panelAlt transition">
                    <td className="text-textMuted">{i + 1}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        {t.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={t.image_url} alt={t.name} className="w-10 h-10 rounded object-cover bg-panelAlt" />
                        ) : (
                          <div className="w-10 h-10 rounded bg-panelAlt flex items-center justify-center">🎵</div>
                        )}
                        <span className="font-medium">{t.name}</span>
                      </div>
                    </td>
                    <td className="text-textMuted">{t.artist_name || artistById.get(t.artist_id) || "—"}</td>
                    <td className="text-right text-textMuted tabular-nums">{fmt(t.duration_ms)}</td>
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

export default function TracksPage() {
  return <ProtectedRoute><Content /></ProtectedRoute>;
}