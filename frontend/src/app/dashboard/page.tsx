"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import TopArtistsCard from "@/components/dashboard/TopArtistsCard";
import TopTracksCard from "@/components/dashboard/TopTracksCard";
import PeakHourCard from "@/components/dashboard/PeakHourCard";
import GenresCard from "@/components/dashboard/GenresCard";
import { api, ApiError } from "@/lib/api";
import type { Artist } from "@/types/artist";
import type { Track } from "@/types/track";
import type { HistoryItem } from "@/types/history";

/**
 * El backend a veces devuelve { items: [...] } y otras un array crudo.
 * Esta helper soporta los dos casos.
 */
function unwrap<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (
    payload &&
    typeof payload === "object" &&
    Array.isArray((payload as { items?: unknown[] }).items)
  ) {
    return (payload as { items: T[] }).items;
  }
  return [];
}

function DashboardContent() {
  const [artists, setArtists] = useState<Artist[] | null>(null);
  const [tracks, setTracks] = useState<Track[] | null>(null);
  const [history, setHistory] = useState<HistoryItem[] | null>(null);

  const [loadingArtists, setLoadingArtists] = useState(true);
  const [loadingTracks, setLoadingTracks] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const [errArtists, setErrArtists] = useState<string | null>(null);
  const [errTracks, setErrTracks] = useState<string | null>(null);
  const [errHistory, setErrHistory] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const toMsg = (e: unknown) =>
      e instanceof ApiError ? e.message : "Error de red";

    api
      .get<unknown>("/v1/artists/top")
      .then((d) => {
        if (!cancelled) setArtists(unwrap<Artist>(d));
      })
      .catch((e) => !cancelled && setErrArtists(toMsg(e)))
      .finally(() => !cancelled && setLoadingArtists(false));

    api
      .get<unknown>("/v1/tracks/top")
      .then((d) => {
        if (!cancelled) setTracks(unwrap<Track>(d));
      })
      .catch((e) => !cancelled && setErrTracks(toMsg(e)))
      .finally(() => !cancelled && setLoadingTracks(false));

    api
      .get<unknown>("/v1/history/recently-played")
      .then((d) => {
        if (!cancelled) setHistory(unwrap<HistoryItem>(d));
      })
      .catch((e) => !cancelled && setErrHistory(toMsg(e)))
      .finally(() => !cancelled && setLoadingHistory(false));

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1>Dashboard</h1>
        <p className="text-textMuted text-sm">
          Resumen de tu actividad musical.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopArtistsCard
          artists={artists}
          loading={loadingArtists}
          error={errArtists}
        />
        <TopTracksCard
          tracks={tracks}
          artists={artists}
          loading={loadingTracks || loadingArtists}
          error={errTracks}
        />
        <PeakHourCard
          history={history}
          loading={loadingHistory}
          error={errHistory}
        />
        <GenresCard
          artists={artists}
          loading={loadingArtists}
          error={errArtists}
        />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}