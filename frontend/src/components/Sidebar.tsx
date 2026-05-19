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
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setAuthed(isTokenValid(getToken()));
    try {
      if (localStorage.getItem("sidebar_collapsed") === "true") setCollapsed(true);
    } catch {}
  }, [pathname]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  if (pathname === "/login" || pathname === "/callback" || pathname === "/") return null;

  const handleLogout = () => { logout(); setAuthed(false); router.replace("/login"); };
  const handleConnect = () => { window.location.href = loginUrl(); };
  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    try { localStorage.setItem("sidebar_collapsed", String(next)); } catch {}
  };

  return (
    <>
      {/* Botón hamburguesa (solo móvil) */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-3 left-3 z-50 w-10 h-10 rounded-lg bg-panel border border-border flex items-center justify-center text-xl shadow-card"
        aria-label="Menú"
      >
        {mobileOpen ? "✕" : "☰"}
      </button>

      {/* Overlay móvil */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={[
          "bg-panel border-r border-border flex flex-col transition-all duration-300",
          "fixed inset-y-0 left-0 z-40 w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "lg:relative lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen",
          collapsed ? "lg:w-16" : "lg:w-64",
        ].join(" ")}
      >
        {/* Brand + toggle */}
        <div className="p-4 border-b border-border flex items-center justify-between gap-2">
          <Link href="/dashboard" className="flex items-center gap-3 group min-w-0">
            <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-emerald-500 to-accent flex items-center justify-center text-xl group-hover:scale-105 transition">
              🎧
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <h2 className="text-sm font-bold leading-none truncate">
                  FREME <span className="text-accent">EMOTIO</span>
                </h2>
                <p className="text-[10px] text-textMuted mt-1.5 leading-none truncate">
                  Music Analytics
                </p>
              </div>
            )}
          </Link>
          <button
            onClick={toggleCollapsed}
            className="hidden lg:flex w-7 h-7 rounded-md hover:bg-panelAlt text-textMuted hover:text-text items-center justify-center shrink-0"
            aria-label={collapsed ? "Expandir" : "Colapsar"}
            title={collapsed ? "Expandir" : "Colapsar"}
          >
            {collapsed ? "›" : "‹"}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={[
                  "flex items-center gap-3 rounded-lg text-sm font-medium transition-all",
                  collapsed ? "px-2 py-2.5 justify-center" : "px-3 py-2.5",
                  active
                    ? "bg-gradient-to-r from-accent/20 to-accent/5 text-accent border border-accent/20"
                    : "text-textMuted hover:bg-panelAlt hover:text-text",
                ].join(" ")}
              >
                <span className="text-lg">{item.emoji}</span>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={collapsed ? "p-2 border-t border-border" : "p-4 border-t border-border space-y-3"}>
          {!collapsed && (
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
          )}

          {collapsed && (
            <button
              onClick={authed ? handleLogout : handleConnect}
              title={authed ? "Cerrar sesión" : "Conectar Spotify"}
              className="w-full h-10 rounded-lg flex items-center justify-center bg-panelAlt border border-border hover:bg-border"
            >
              <SpotifyIcon />
            </button>
          )}

          {!collapsed && (
            <div className="text-[10px] text-textDim text-center leading-tight">
              <p className="font-semibold text-textMuted">FREME EMOTIO API v1.0.0</p>
              <p className="mt-1">
                Hecho con <span className="text-accent">💚</span>
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

function SpotifyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#1DB954" aria-hidden>
      <path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24Zm5.5 17.3a.75.75 0 0 1-1 .25c-2.8-1.7-6.3-2.1-10.4-1.1a.75.75 0 1 1-.35-1.45c4.5-1.1 8.4-.65 11.5 1.3a.75.75 0 0 1 .25 1Zm1.5-3.3a.94.94 0 0 1-1.3.3c-3.2-2-8.1-2.55-11.9-1.4a.94.94 0 1 1-.55-1.8c4.35-1.3 9.75-.7 13.45 1.6.45.3.6.85.3 1.3Zm.15-3.4c-3.85-2.3-10.2-2.5-13.85-1.4a1.13 1.13 0 1 1-.65-2.15c4.2-1.25 11.2-1 15.6 1.6a1.13 1.13 0 1 1-1.1 1.95Z" />
    </svg>
  );
}