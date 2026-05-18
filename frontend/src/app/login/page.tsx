"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken, isTokenValid } from "@/lib/auth";
import { loginUrl } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();

  // Si ya hay sesión, no tiene sentido mostrar el login.
  useEffect(() => {
    if (isTokenValid(getToken())) {
      router.replace("/dashboard");
    }
  }, [router]);

  const handleConnect = () => {
    // Redirección server-side al endpoint de OAuth del backend.
    window.location.href = loginUrl();
  };

  return (
    <section className="min-h-[70vh] flex items-center justify-center">
      <div className="card max-w-md w-full text-center">
        <h1 className="mb-2">Spoty DWH</h1>
        <p className="text-textMuted mb-6">
          Conecta tu cuenta de Spotify para ver tus stats y operar el
          pipeline ETL.
        </p>

        <button onClick={handleConnect} className="btn btn-primary w-full">
          <SpotifyIcon />
          Connect with Spotify
        </button>

        <p className="text-xs text-textMuted mt-6">
          Te llevamos al flujo OAuth (PKCE) del backend.
        </p>
      </div>
    </section>
  );
}

function SpotifyIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24Zm5.5 17.3a.75.75 0 0 1-1 .25c-2.8-1.7-6.3-2.1-10.4-1.1a.75.75 0 1 1-.35-1.45c4.5-1.1 8.4-.65 11.5 1.3a.75.75 0 0 1 .25 1Zm1.5-3.3a.94.94 0 0 1-1.3.3c-3.2-2-8.1-2.55-11.9-1.4a.94.94 0 1 1-.55-1.8c4.35-1.3 9.75-.7 13.45 1.6.45.3.6.85.3 1.3Zm.15-3.4c-3.85-2.3-10.2-2.5-13.85-1.4a1.13 1.13 0 1 1-.65-2.15c4.2-1.25 11.2-1 15.6 1.6a1.13 1.13 0 1 1-1.1 1.95Z" />
    </svg>
  );
}