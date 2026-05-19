"use client";

import { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import KpiCard from "@/components/ui/KpiCard";
import { api, ApiError } from "@/lib/api";
import type { Track } from "@/types/track";
import type { Artist } from "@/types/artist";

function unwrap<T>(p: unknown): T[] {
  if (Array.isArray(p)) return p as T[];
  if (p && typeof p === "object" && Array.isArray((p as any).items)) return (p as any).items;
  return [];
}

function normalizeTrack(raw: any): Track {
  return {
    id: raw.id || raw.spotify_id || (raw.track_id != null ? String(raw.track_id) : raw.name),
    name: raw.name,
    duration_ms: raw.duration_ms ?? 0,
    artist_id: raw.artist_id != null ? String(raw.artist_id) : "",
    artist_name: raw.artist_name || null,
    album: raw.album || raw.album_name || null,
    popularity: raw.popularity ?? null,
    image_url: raw.image_url || null,
  };
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

function fmt(ms: number): string {
  if (!ms || ms < 0) return "—";
  const tot = Math.round(ms / 1000);
  return `${Math.floor(tot / 60)}:${(tot % 60).toString().padStart(2, "0")}`;
}

const MEDALS = ["🥇","🥈","🥉","4️⃣","5️⃣"];

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
        setTracks(unwrap<any>(t).map(normalizeTrack));
        if (a) setArtists(unwrap<any>(a).map(normalizeArtist));
      })
      .catch(e => !cancelled && setError(e instanceof ApiError ? e.message : "Error de red"))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  const artistById = useMemo(() => {
    const m = new Map<string, string>();
    artists.forEach(a => m.set(a.id, a.name));
    return m;
  }, [artists]);

  const totalDur = (tracks || []).reduce((s, t) => s + (t.duration_ms || 0), 0);
  const totalM = Math.round(totalDur / 1000 / 60);
  const totalH = Math.floor(totalM / 60);
  const avgPop = tracks && tracks.length
    ? Math.round(tracks.reduce((s, t) => s + (t.popularity || 0), 0) / tracks.length)
    : 0;

  const top5 = (tracks || []).slice(0, 5);
  const top10 = (tracks || []).slice(0, 10);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="flex items-center gap-2"><span>🎵</span> Top Canciones</h1>
        <p className="text-textMuted text-sm mt-1">Las canciones que más escuchas</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Canciones" value={(tracks?.length ?? 0).toLocaleString()} emoji="🎵" variant="green" />
        <KpiCard label="Horas de música" value={totalH > 0 ? `${totalH}h` : `${totalM}m`} emoji="⏳" variant="cyan" />
        <KpiCard label="Duración total" value={`${totalM.toLocaleString()}m`} emoji="🎧" variant="violet" />
        <KpiCard label="Popularidad media" value={avgPop > 0 ? `${avgPop}/100` : "—"} emoji="🔥" variant="orange" />
      </div>

      {loading && <div className="card"><p className="text-textMuted">Cargando…</p></div>}
      {error && <div className="card"><p className="text-rose-400">{error}</p></div>}

      {!loading && !error && top5.length > 0 && (
        <>
          {/* TOP 5 HERO */}
          <div className="card">
            <h3 className="card-title">
              <span>🏆</span> Top 5 Canciones
              <span className="badge badge-success ml-2">más reproducidas</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {top5.map((t, i) => {
                const artist = t.artist_name || artistById.get(t.artist_id) || "—";
                return (
                  <div key={t.id} className="text-center group">
                    <div className="relative inline-block">
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-gradient-to-br from-emerald-500/30 to-accent/30 flex items-center justify-center text-4xl border-2 border-border group-hover:border-accent transition">
                        🎵
                      </div>
                      <span className="absolute -top-1 -right-1 text-2xl">{MEDALS[i]}</span>
                    </div>
                    <p className="text-sm font-bold mt-3 truncate" title={t.name}>{t.name}</p>
                    <p className="text-xs text-textMuted mt-0.5 truncate">{artist}</p>
                    <p className="text-[10px] text-textMuted mt-0.5 tabular-nums">⏱ {fmt(t.duration_ms)}</p>
                    {t.popularity != null && (
                      <p className="text-[10px] text-textMuted mt-0.5">🔥 {t.popularity}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* POPULARIDAD CHART */}
          <div className="card">
            <h3 className="card-title"><span>📊</span> Popularidad — Top 10</h3>
            <ul className="space-y-2">
              {top10.map((t, i) => {
                const pop = t.popularity ?? 0;
                const artist = t.artist_name || artistById.get(t.artist_id) || "—";
                return (
                  <li key={t.id}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="flex items-center gap-2 min-w-0">
                        <span className="text-textMuted w-5 text-xs">{i + 1}</span>
                        <span className="truncate">{t.name}</span>
                        <span className="text-textMuted text-xs hidden md:inline">— {artist}</span>
                      </span>
                      <span className="text-textMuted text-xs tabular-nums">{pop}</span>
                    </div>
                    <div className="h-1.5 bg-panelAlt rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-accent" style={{ width: `${pop}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* RANKING TABLE */}
          <div className="card">
            <h3 className="card-title"><span>📋</span> Ranking completo</h3>
            <div className="overflow-x-auto">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Canción</th>
                    <th>Artista</th>
                    <th>Álbum</th>
                    <th className="text-right">Duración</th>
                  </tr>
                </thead>
                <tbody>
                  {tracks!.map((t, i) => (
                    <tr key={t.id} className="hover:bg-panelAlt transition">
                      <td className="text-textMuted">{i + 1}</td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded bg-panelAlt flex items-center justify-center">🎵</div>
                          <span className="font-medium truncate" title={t.name}>{t.name}</span>
                        </div>
                      </td>
                      <td className="text-textMuted">{t.artist_name || artistById.get(t.artist_id) || "—"}</td>
                      <td className="text-textMuted text-xs">{t.album || "—"}</td>
                      <td className="text-right text-textMuted tabular-nums">{fmt(t.duration_ms)}</td>
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

export default function TracksPage() {
  return <ProtectedRoute><Content /></ProtectedRoute>;
}