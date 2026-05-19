"use client";

import { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import KpiCard from "@/components/ui/KpiCard";
import TopArtistsCard from "@/components/dashboard/TopArtistsCard";
import TopTracksCard from "@/components/dashboard/TopTracksCard";
import PeakHourCard from "@/components/dashboard/PeakHourCard";
import GenresCard from "@/components/dashboard/GenresCard";
import EtlPipelineFlow from "@/components/dashboard/EtlPipelineFlow";
import SystemStatus from "@/components/dashboard/SystemStatus";
import { api, ApiError } from "@/lib/api";
import type { Artist } from "@/types/artist";
import type { Track } from "@/types/track";
import type { HistoryItem } from "@/types/history";
import type { User } from "@/types/user";
import type { DwhStatus, EtlRun } from "@/types/etl";

function unwrap<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object" && Array.isArray((payload as { items?: unknown[] }).items)) {
    return (payload as { items: T[] }).items;
  }
  return [];
}

function parseEtl(payload: unknown): { tables: DwhStatus[]; runs: EtlRun[] } {
  if (Array.isArray(payload)) return { tables: [], runs: payload as EtlRun[] };
  if (payload && typeof payload === "object") {
    const o = payload as Record<string, unknown>;
    return {
      tables: (Array.isArray(o.tables) ? o.tables : Array.isArray(o.dwh) ? o.dwh : []) as DwhStatus[],
      runs: (Array.isArray(o.runs) ? o.runs : Array.isArray(o.audit) ? o.audit : []) as EtlRun[],
    };
  }
  return { tables: [], runs: [] };
}

function DashboardContent() {
  const [user, setUser] = useState<User | null>(null);
  const [artists, setArtists] = useState<Artist[] | null>(null);
  const [tracks, setTracks] = useState<Track[] | null>(null);
  const [history, setHistory] = useState<HistoryItem[] | null>(null);
  const [etlTables, setEtlTables] = useState<DwhStatus[]>([]);
  const [etlRuns, setEtlRuns] = useState<EtlRun[]>([]);

  const [loadingArtists, setLoadingArtists] = useState(true);
  const [loadingTracks, setLoadingTracks] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [errArtists, setErrArtists] = useState<string | null>(null);
  const [errTracks, setErrTracks] = useState<string | null>(null);
  const [errHistory, setErrHistory] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const toMsg = (e: unknown) => (e instanceof ApiError ? e.message : "Error de red");

    api.get<User>("/v1/profile/me").then((u) => { if (!cancelled) setUser(u); }).catch(() => {});

    api.get<unknown>("/v1/artists/top")
      .then((d) => { if (!cancelled) setArtists(unwrap<Artist>(d)); })
      .catch((e) => !cancelled && setErrArtists(toMsg(e)))
      .finally(() => !cancelled && setLoadingArtists(false));

    api.get<unknown>("/v1/tracks/top")
      .then((d) => { if (!cancelled) setTracks(unwrap<Track>(d)); })
      .catch((e) => !cancelled && setErrTracks(toMsg(e)))
      .finally(() => !cancelled && setLoadingTracks(false));

    api.get<unknown>("/v1/history/recently-played")
      .then((d) => { if (!cancelled) setHistory(unwrap<HistoryItem>(d)); })
      .catch((e) => !cancelled && setErrHistory(toMsg(e)))
      .finally(() => !cancelled && setLoadingHistory(false));

    api.get<unknown>("/v1/etl/status")
      .then((d) => { if (cancelled) return; const p = parseEtl(d); setEtlTables(p.tables); setEtlRuns(p.runs); })
      .catch(() => {});

    return () => { cancelled = true; };
  }, []);

  const tracksProcessed = useMemo(() => {
    const t = etlTables.reduce((s, t) => s + (t.row_count || 0), 0);
    return t || tracks?.length || 0;
  }, [etlTables, tracks]);

  const uniqueArtists = artists?.length ?? 0;

  const genresCount = useMemo(() => {
    if (!artists) return 0;
    const set = new Set<string>();
    artists.forEach((a) => (a.genres ?? []).forEach((g) => set.add(g)));
    return set.size;
  }, [artists]);

  const peakHour = useMemo(() => {
    if (!history || history.length === 0) return null;
    const c = new Array(24).fill(0);
    for (const i of history) {
      const d = new Date(i.played_at);
      if (!Number.isNaN(d.getTime())) c[d.getHours()] += 1;
    }
    let mh = 0, mc = 0;
    c.forEach((cc, h) => { if (cc > mc) { mc = cc; mh = h; } });
    return mh;
  }, [history]);

  const lastEtlMs = useMemo(() => {
    if (!etlRuns || etlRuns.length === 0) return null;
    const last = etlRuns.filter((r) => r.duration_ms != null)
      .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())[0];
    return last?.duration_ms ?? null;
  }, [etlRuns]);

  const firstName = (user?.display_name ?? "").split(" ")[0] || "amig@";

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="flex items-center gap-2">
          ¡Hola, {firstName}! <span className="text-3xl">👋</span>
        </h1>
        <p className="text-textMuted text-sm mt-1">
          Aquí tienes tu resumen musical con emoción 🎵
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <KpiCard label="Tracks procesados" value={tracksProcessed.toLocaleString()} emoji="🎵" variant="green" hint="datos en el DWH" />
        <KpiCard label="Artistas únicos" value={uniqueArtists.toLocaleString()} emoji="🎤" variant="pink" hint="en tu top" />
        <KpiCard label="Géneros detectados" value={genresCount.toLocaleString()} emoji="🎭" variant="orange" hint="explorando estilos" />
        <KpiCard label="Hora pico" value={peakHour !== null ? `${peakHour.toString().padStart(2, "0")}:00` : "—"} emoji="⏰" variant="cyan" hint="tu franja más activa" />
        <KpiCard label="Tiempo ETL" value={lastEtlMs !== null ? `${(lastEtlMs / 1000).toFixed(1)}s` : "—"} emoji="⚡" variant="violet" hint="última ejecución" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <PeakHourCard history={history} loading={loadingHistory} error={errHistory} />
          <GenresCard artists={artists} loading={loadingArtists} error={errArtists} />
          <EtlPipelineFlow tables={etlTables} />
        </div>
        <div className="space-y-4">
          <TopArtistsCard artists={artists} loading={loadingArtists} error={errArtists} />
          <TopTracksCard tracks={tracks} artists={artists} loading={loadingTracks || loadingArtists} error={errTracks} />
        </div>
      </div>

      <SystemStatus etlTables={etlTables} />
    </div>
  );
}

export default function DashboardPage() {
  return <ProtectedRoute><DashboardContent /></ProtectedRoute>;
}