"use client";

import Link from "next/link";
import type { Track } from "@/types/track";
import type { Artist } from "@/types/artist";

type Props = { tracks: Track[] | null; artists: Artist[] | null; loading: boolean; error: string | null; };

function fmt(ms: number): string {
  if (!ms || ms < 0) return "—";
  const t = Math.round(ms / 1000);
  return `${Math.floor(t / 60)}:${(t % 60).toString().padStart(2, "0")}`;
}

export default function TopTracksCard({ tracks, artists, loading, error }: Props) {
  const top5 = (tracks ?? []).slice(0, 5);
  const byId = new Map<string, string>();
  (artists ?? []).forEach((a) => byId.set(a.id, a.name));

  return (
    <div className="card">
      <h3 className="card-title flex items-center justify-between">
        <span className="flex items-center gap-2"><span>🎵</span> Top Canciones</span>
        <Link href="/tracks" className="text-xs text-accent hover:underline">Ver todas</Link>
      </h3>
      {loading && <p className="text-textMuted">Cargando…</p>}
      {error && <p className="text-rose-400">{error}</p>}
      {!loading && !error && top5.length === 0 && <p className="text-textMuted">Sin datos.</p>}
      {!loading && !error && top5.length > 0 && (
        <ol className="space-y-3">
          {top5.map((t, i) => {
            const artist = t.artist_name || byId.get(t.artist_id) || "—";
            return (
              <li key={t.id} className="flex items-center gap-3 group">
                <span className="w-6 text-center text-textMuted text-sm font-medium">{i + 1}</span>
                {t.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.image_url} alt={t.name} className="w-11 h-11 rounded object-cover bg-panelAlt" />
                ) : (
                  <div className="w-11 h-11 rounded bg-panelAlt flex items-center justify-center text-lg">🎵</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-text font-medium truncate">{t.name}</p>
                  <p className="text-xs text-textMuted truncate">{artist}</p>
                </div>
                <span className="text-xs text-textMuted tabular-nums">{fmt(t.duration_ms)}</span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}