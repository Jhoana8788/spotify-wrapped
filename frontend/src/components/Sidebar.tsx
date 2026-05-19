"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getToken, isTokenValid, logout } from "@/lib/auth";
import { loginUrl } from "@/lib/api";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", emoji: "📊" },
  { href: "/artists", label: "Top Artistas", emoji: "🎤" },
  { href: "/tracks", label: "Top Canciones", emoji: "🎵" },
  { href: "/genres", label: "Géneros", emoji: "🎭" },
  { href: "/etl", label: "ETL Monitor", emoji: "⚡" },
  { href: "/profile", label: "Perfil", emoji: "👤" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [authed, setAuthed] = useState(false);

  useEffect(() => { setAuthed(isTokenValid(getToken())); }, [pathname]);

  if (pathname === "/login" || pathname === "/callback" || pathname === "/") return null;

  const handleLogout = () => { logout(); setAuthed(false); router.replace("/login"); };
  const handleConnect = () => { window.location.href = loginUrl(); };

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-panel border-r border-border h-screen sticky top-0">
      <div className="p-5 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-accent flex items-center justify-center text-2xl group-hover:scale-105 transition shadow-glow">
            🎧
          </div>
          <div>
            <h2 className="text-base font-bold leading-none">
              FREME <span className="text-accent">EMOTIO</span>
            </h2>
            <p className="text-[10px] text-textMuted mt-1.5 leading-none">
              Music Analytics With Emotion
            </p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={`nav-link ${active ? "active" : ""}`}>
              <span className="text-lg">{item.emoji}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-3">
        <div className="bg-panelAlt border border-border rounded-xl p-3">
          <p className="text-xs font-semibold flex items-center gap-1.5 mb-1">
            <SpotifyIcon /> {authed ? "Spotify conectado" : "Conecta Spotify"}
          </p>
          <p className="text-[10px] text-textMuted mb-2 leading-tight">
            Sincroniza tus datos y obtén estadísticas personalizadas.
          </p>
          {authed ? (
            <button onClick={handleLogout} className="btn btn-secondary w-full !text-xs !py-1.5">
              Desconectar
            </button>
          ) : (
            <button onClick={handleConnect} className="btn btn-primary w-full !text-xs !py-1.5">
              Conectar
            </button>
          )}
        </div>

        <div className="text-[10px] text-textDim text-center leading-tight">
          <p className="font-semibold text-textMuted">FREME EMOTIO API</p>
          <p>v1.0.0</p>
          <p className="mt-1 flex items-center justify-center gap-1">
            Hecho con <span className="text-accent">💚</span> para los amantes de la música
          </p>
        </div>
      </div>
    </aside>
  );
}

function SpotifyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#1DB954" aria-hidden>
      <path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24Zm5.5 17.3a.75.75 0 0 1-1 .25c-2.8-1.7-6.3-2.1-10.4-1.1a.75.75 0 1 1-.35-1.45c4.5-1.1 8.4-.65 11.5 1.3a.75.75 0 0 1 .25 1Zm1.5-3.3a.94.94 0 0 1-1.3.3c-3.2-2-8.1-2.55-11.9-1.4a.94.94 0 1 1-.55-1.8c4.35-1.3 9.75-.7 13.45 1.6.45.3.6.85.3 1.3Zm.15-3.4c-3.85-2.3-10.2-2.5-13.85-1.4a1.13 1.13 0 1 1-.65-2.15c4.2-1.25 11.2-1 15.6 1.6a1.13 1.13 0 1 1-1.1 1.95Z"/>
    </svg>
  );
}