"use client";

import Link from "next/link";
import type { Artist } from "@/types/artist";

type Props = { artists: Artist[] | null; loading: boolean; error: string | null; };

export default function TopArtistsCard({ artists, loading, error }: Props) {
  const top5 = (artists ?? []).slice(0, 5);
  return (
    <div className="card">
      <h3 className="card-title flex items-center justify-between">
        <span className="flex items-center gap-2"><span>🎤</span> Top Artistas</span>
        <Link href="/artists" className="text-xs text-accent hover:underline">Ver todos</Link>
      </h3>
      {loading && <p className="text-textMuted">Cargando…</p>}
      {error && <p className="text-rose-400">{error}</p>}
      {!loading && !error && top5.length === 0 && <p className="text-textMuted">No hay datos todavía.</p>}
      {!loading && !error && top5.length > 0 && (
        <ol className="space-y-3">
          {top5.map((a, i) => (
            <li key={a.id} className="flex items-center gap-3 group">
              <span className="w-6 text-center text-textMuted text-sm font-medium">{i + 1}</span>
              {a.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.image_url} alt={a.name} className="w-11 h-11 rounded-full object-cover bg-panelAlt ring-2 ring-transparent group-hover:ring-accent/40 transition" />
              ) : (
                <div className="w-11 h-11 rounded-full bg-panelAlt flex items-center justify-center text-lg">🎤</div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-text font-medium truncate">{a.name}</p>
                <p className="text-xs text-textMuted truncate">{(a.genres ?? []).slice(0, 2).join(", ") || "—"}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-orange-400">
                <span>🔥</span><span className="tabular-nums">{a.popularity}</span>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}