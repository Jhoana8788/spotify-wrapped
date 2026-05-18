"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { api, ApiError } from "@/lib/api";
import type { User } from "@/types/user";

function ProfileContent() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get<User>("/v1/profile/me")
      .then((u) => {
        if (!cancelled) setUser(u);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof ApiError ? e.message : "Error de red");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1>Profile</h1>
        <p className="text-textMuted text-sm">
          Datos de tu cuenta de Spotify.
        </p>
      </div>

      <div className="card max-w-2xl">
        {loading && <p className="text-textMuted">Cargando…</p>}
        {error && <p className="text-red-400">{error}</p>}

        {!loading && !error && user && (
          <div className="flex items-center gap-5">
            {user.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image_url}
                alt={user.display_name}
                className="w-24 h-24 rounded-full object-cover bg-panelAlt"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-panelAlt flex items-center justify-center text-3xl text-textMuted">
                {user.display_name?.[0]?.toUpperCase() ?? "?"}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h2 className="truncate">{user.display_name}</h2>
              {user.email && (
                <p className="text-textMuted text-sm truncate">
                  {user.email}
                </p>
              )}
              <dl className="grid grid-cols-2 gap-x-6 gap-y-1 mt-3 text-sm">
                <dt className="text-textMuted">ID</dt>
                <dd className="truncate" title={user.id}>
                  {user.id}
                </dd>

                {user.country && (
                  <>
                    <dt className="text-textMuted">País</dt>
                    <dd>{user.country}</dd>
                  </>
                )}

                {user.product && (
                  <>
                    <dt className="text-textMuted">Plan</dt>
                    <dd className="capitalize">{user.product}</dd>
                  </>
                )}

                {typeof user.followers === "number" && (
                  <>
                    <dt className="text-textMuted">Followers</dt>
                    <dd>{user.followers.toLocaleString()}</dd>
                  </>
                )}
              </dl>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}