"use client";

import type { Artist } from "@/types/artist";

type Props = {
  artists: Artist[] | null;
  loading: boolean;
  error: string | null;
};

export default function TopArtistsCard({ artists, loading, error }: Props) {
  const top5 = (artists ?? []).slice(0, 5);

  return (
    <div className="card">
      <h3 className="card-title">Top 5 artistas</h3>

      {loading && <p className="text-textMuted">Cargando…</p>}
      {error && <p className="text-red-400">{error}</p>}

      {!loading && !error && top5.length === 0 && (
        <p className="text-textMuted">No hay datos todavía.</p>
      )}

      {!loading && !error && top5.length > 0 && (
        <ol className="space-y-2">
          {top5.map((a, i) => (
            <li
              key={a.id}
              className="flex items-center gap-3 py-1.5"
            >
              <span className="w-5 text-right text-textMuted text-sm">
                {i + 1}
              </span>
              {a.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={a.image_url}
                  alt={a.name}
                  className="w-10 h-10 rounded-full object-cover bg-panelAlt"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-panelAlt" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-text font-medium truncate">{a.name}</p>
                <p className="text-xs text-textMuted truncate">
                  {a.genres.slice(0, 2).join(", ") || "—"}
                </p>
              </div>
              <span className="text-xs text-textMuted">
                pop {a.popularity}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}