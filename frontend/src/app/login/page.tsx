"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken, isTokenValid } from "@/lib/auth";
import { loginUrl } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  useEffect(() => {
    if (isTokenValid(getToken())) router.replace("/dashboard");
  }, [router]);

  const handleConnect = () => { window.location.href = loginUrl(); };

  return (
    <div className="min-h-screen relative overflow-hidden bg-bg flex items-center justify-center px-4 -mx-4 -my-6 lg:-mx-8 lg:-my-8">
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-pink-600/20 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-accent/5 blur-3xl pointer-events-none" />

      <div className="absolute top-10 left-10 text-4xl opacity-20 select-none pointer-events-none">🎵</div>
      <div className="absolute top-20 right-20 text-4xl opacity-20 select-none pointer-events-none">🎶</div>
      <div className="absolute bottom-20 left-1/4 text-4xl opacity-20 select-none pointer-events-none">🎧</div>
      <div className="absolute bottom-10 right-1/3 text-4xl opacity-20 select-none pointer-events-none">♪</div>

      <div className="relative w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-accent shadow-2xl shadow-accent/30 mb-4 text-4xl">
            🎧
          </div>
          <h1 className="text-3xl font-black">
            FREME <span className="text-accent">EMOTIO</span>
          </h1>
          <p className="text-sm text-textMuted mt-1">Music Analytics With Emotion</p>
        </div>

        <div className="card border-borderLight backdrop-blur-xl bg-panel/80">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-panelAlt border border-border text-xs text-textMuted mb-4">
              🎧 Analiza tu música. Siente la emoción.
            </div>
            <h2 className="mb-1">Bienvenido de nuevo <span>👋</span></h2>
            <p className="text-sm text-textMuted">Inicia sesión para ver tus estadísticas musicales</p>
          </div>

          <button onClick={handleConnect} className="btn btn-primary w-full text-base py-3 mb-4 animate-pulse-glow">
            <SpotifyIcon />
            Iniciar sesión con Spotify
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-panel px-3 text-xs text-textMuted">O continúa con</span>
            </div>
          </div>

          <button disabled title="Próximamente" className="btn btn-secondary w-full mb-2 cursor-not-allowed">
            <span className="text-base">🟢</span> Continuar con Google
          </button>
          <button disabled title="Próximamente" className="btn btn-secondary w-full cursor-not-allowed">
            <span className="text-base">🍎</span> Continuar con Apple
          </button>

          <p className="text-xs text-textMuted text-center mt-6 flex items-center justify-center gap-1.5">
            <span>🔒</span> Tu privacidad es importante para nosotros.
          </p>
          <p className="text-[11px] text-textDim text-center mt-1">
            No almacenamos tus credenciales de Spotify.
          </p>
        </div>

        <p className="text-center text-xs text-textMuted mt-6">
          ¿No tienes cuenta? Conecta tu Spotify y comienza ahora.
        </p>

        <div className="text-center mt-8 text-xs text-textDim">
          <p className="flex items-center justify-center gap-1.5">
            <span className="text-accent">💚</span> FREME EMOTIO API
          </p>
          <p className="text-[10px] mt-0.5">v1.0.0</p>
        </div>
      </div>
    </div>
  );
}

function SpotifyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24Zm5.5 17.3a.75.75 0 0 1-1 .25c-2.8-1.7-6.3-2.1-10.4-1.1a.75.75 0 1 1-.35-1.45c4.5-1.1 8.4-.65 11.5 1.3a.75.75 0 0 1 .25 1Zm1.5-3.3a.94.94 0 0 1-1.3.3c-3.2-2-8.1-2.55-11.9-1.4a.94.94 0 1 1-.55-1.8c4.35-1.3 9.75-.7 13.45 1.6.45.3.6.85.3 1.3Zm.15-3.4c-3.85-2.3-10.2-2.5-13.85-1.4a1.13 1.13 0 1 1-.65-2.15c4.2-1.25 11.2-1 15.6 1.6a1.13 1.13 0 1 1-1.1 1.95Z"/>
    </svg>
  );
}