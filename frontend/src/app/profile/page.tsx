"use client";

import { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import KpiCard from "@/components/ui/KpiCard";
import DonutChart from "@/components/ui/DonutChart";
import { api, ApiError } from "@/lib/api";
import type { User } from "@/types/user";
import type { Artist } from "@/types/artist";
import type { Track } from "@/types/track";
import type { HistoryItem } from "@/types/history";

function unwrap<T>(p: unknown): T[] {
  if (Array.isArray(p)) return p as T[];
  if (p && typeof p === "object" && Array.isArray((p as { items?: unknown[] }).items)) {
    return (p as { items: T[] }).items;
  }
  return [];
}

const DONUT_COLORS = ["#1DB954","#8b5cf6","#ec4899","#f97316","#06b6d4","#f59e0b"];

function ProfileContent() {
  const [user, setUser] = useState<User | null>(null);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api.get<User>("/v1/profile/me"),
      api.get<unknown>("/v1/artists/top").catch(() => null),
      api.get<unknown>("/v1/tracks/top").catch(() => null),
      api.get<unknown>("/v1/history/recently-played").catch(() => null),
    ])
      .then(([u, a, t, h]) => {
        if (cancelled) return;
        setUser(u);
        if (a) setArtists(unwrap<Artist>(a));
        if (t) setTracks(unwrap<Track>(t));
        if (h) setHistory(unwrap<HistoryItem>(h));
      })
      .catch((e) => !cancelled && setError(e instanceof ApiError ? e.message : "Error de red"))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  const genresCount = useMemo(() => {
    const s = new Set<string>();
    artists.forEach((a) => (a.genres || []).forEach((g) => s.add(g)));
    return s.size;
  }, [artists]);

  const topGenres = useMemo(() => {
    const c = new Map<string, number>();
    artists.forEach((a) => (a.genres || []).forEach((g) => c.set(g, (c.get(g) || 0) + 1)));
    return Array.from(c.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [artists]);

  const peakHour = useMemo(() => {
    if (!history.length) return null;
    const c = new Array(24).fill(0);
    history.forEach((i) => { const d = new Date(i.played_at); if (!isNaN(d.getTime())) c[d.getHours()]++; });
    let mh = 0, mc = 0;
    c.forEach((cc, h) => { if (cc > mc) { mc = cc; mh = h; } });
    return mh;
  }, [history]);

  const weeklyActivity = useMemo(() => {
    const days = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
    const counts = new Array(7).fill(0);
    history.forEach((i) => {
      const d = new Date(i.played_at);
      if (!isNaN(d.getTime())) {
        const idx = (d.getDay() + 6) % 7;
        counts[idx]++;
      }
    });
    return days.map((d, i) => ({ day: d, count: counts[i] }));
  }, [history]);

  if (loading) return <div className="card"><p className="text-textMuted">Cargando…</p></div>;
  if (error) return <div className="card"><p className="text-rose-400">{error}</p></div>;
  if (!user) return null;

  const totalGenresCount = topGenres.reduce((s, [, c]) => s + c, 0) || 1;
  const topGenre = topGenres[0];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1>Mi Perfil</h1>
        <p className="text-textMuted text-sm mt-1">Tu identidad musical en FREME EMOTIO 🎧</p>
      </div>

      <div className="card relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
          {user.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image_url} alt={user.display_name} className="w-24 h-24 rounded-full object-cover ring-4 ring-accent/30" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-4xl font-bold">
              {user.display_name?.[0]?.toUpperCase() ?? "?"}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="truncate">{user.display_name}</h2>
              {user.product && (
                <span className="badge badge-premium">
                  {user.product === "premium" ? "💎 Premium" : user.product}
                </span>
              )}
            </div>
            <p className="text-textMuted text-sm mt-1">Amante de la música 🎵</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm text-textMuted">
              {user.country && <span>📍 {user.country}</span>}
              {user.email && <span>✉️ {user.email}</span>}
            </div>
          </div>

          {typeof user.followers === "number" && (
            <div className="text-center shrink-0">
              <p className="text-2xl font-bold text-accent">{user.followers.toLocaleString()}</p>
              <p className="text-xs text-textMuted">Followers</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Total de tracks" value={tracks.length.toLocaleString()} emoji="🎵" variant="green" />
        <KpiCard label="Artistas únicos" value={artists.length.toLocaleString()} emoji="🎤" variant="pink" />
        <KpiCard label="Géneros favoritos" value={genresCount.toLocaleString()} emoji="🎭" variant="orange" />
        <KpiCard label="Hora pico" value={peakHour !== null ? `${peakHour.toString().padStart(2, "0")}:00` : "—"} emoji="⏰" variant="cyan" hint="tu franja más activa" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="card-title"><span>🎭</span> Top Género</h3>
          {topGenres.length > 0 ? (
            <div className="flex items-center gap-6 flex-wrap">
              <DonutChart
                size={180}
                thickness={22}
                slices={topGenres.map(([label, value], i) => ({ label, value, color: DONUT_COLORS[i % DONUT_COLORS.length] }))}
                center={topGenre ? { label: "género top", value: `${Math.round((topGenre[1] / totalGenresCount) * 100)}%` } : undefined}
              />
              <ul className="flex-1 space-y-2 min-w-[140px]">
                {topGenres.map(([g, c], i) => {
                  const pct = Math.round((c / totalGenresCount) * 100);
                  return (
                    <li key={g} className="flex items-center gap-2 text-sm">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                      <span className="flex-1 capitalize truncate">{g}</span>
                      <span className="text-textMuted text-xs">{pct}%</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <p className="text-textMuted text-sm">Sin datos.</p>
          )}
        </div>

        <div className="card">
          <h3 className="card-title"><span>📊</span> Actividad semanal</h3>
          {weeklyActivity.some((d) => d.count > 0) ? (
            <div className="flex items-end justify-between gap-2 h-40">
              {weeklyActivity.map((d) => {
                const max = Math.max(...weeklyActivity.map((x) => x.count)) || 1;
                const h = Math.max(8, (d.count / max) * 100);
                return (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-2 h-full">
                    <div className="w-full bg-panelAlt rounded-t-md overflow-hidden flex items-end h-full">
                      <div className="w-full bg-gradient-to-t from-accent to-emerald-400 rounded-t-md" style={{ height: `${h}%` }} />
                    </div>
                    <span className="text-xs text-textMuted">{d.day}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-textMuted text-sm">Sin actividad reciente.</p>
          )}
        </div>
      </div>

      <div className="card">
        <h3 className="card-title"><span>🎤</span> Artistas más escuchados</h3>
        {artists.length > 0 ? (
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
            {artists.slice(0, 5).map((a, i) => (
              <div key={a.id} className="text-center">
                <div className="relative inline-block">
                  {a.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.image_url} alt={a.name} className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover bg-panelAlt" />
                  ) : (
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-panelAlt flex items-center justify-center text-2xl">🎤</div>
                  )}
                  <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-accent text-black text-xs font-bold flex items-center justify-center">{i + 1}</span>
                </div>
                <p className="text-sm font-medium mt-2 truncate">{a.name}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-textMuted text-sm">Sin artistas.</p>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return <ProtectedRoute><ProfileContent /></ProtectedRoute>;
}