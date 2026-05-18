"use client";

import type { Track } from "@/types/track";
import type { Artist } from "@/types/artist";

type Props = {
  tracks: Track[] | null;
  artists: Artist[] | null; // para resolver artist_id → nombre si hace falta
  loading: boolean;
  error: string | null;
};

function formatDuration(ms: number): string {
  if (!ms || ms < 0) return "—";
  const totalSec = Math.round(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function TopTracksCard({
  tracks,
  artists,
  loading,
  error,
}: Props) {
  const top5 = (tracks ?? []).slice(0, 5);

  const artistById = new Map<string, string>();
  (artists ?? []).forEach((a) => artistById.set(a.id, a.name));

  return (
    <div className="card">
      <h3 className="card-title">Top 5 canciones</h3>

      {loading && <p className="text-textMuted">Cargando…</p>}
      {error && <p className="text-red-400">{error}</p>}

      {!loading && !error && top5.length === 0 && (
        <p className="text-textMuted">No hay datos todavía.</p>
      )}

      {!loading && !error && top5.length > 0 && (
        <ol className="space-y-2">
          {top5.map((t, i) => {
            const artist =
              t.artist_name || artistById.get(t.artist_id) || "—";
            return (
              <li key={t.id} className="flex items-center gap-3 py-1.5">
                <span className="w-5 text-right text-textMuted text-sm">
                  {i + 1}
                </span>
                {t.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={t.image_url}
                    alt={t.name}
                    className="w-10 h-10 rounded object-cover bg-panelAlt"
                  />
                ) : (
                  <div className="w-10 h-10 rounded bg-panelAlt" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-text font-medium truncate">{t.name}</p>
                  <p className="text-xs text-textMuted truncate">{artist}</p>
                </div>
                <span className="text-xs text-textMuted tabular-nums">
                  {formatDuration(t.duration_ms)}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}