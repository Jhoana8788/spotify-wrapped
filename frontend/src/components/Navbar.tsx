"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getToken, isTokenValid, logout } from "@/lib/auth";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/profile", label: "Profile" },
  { href: "/etl", label: "ETL" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [authed, setAuthed] = useState(false);

  // El estado de auth solo se conoce en cliente (localStorage).
  // Recalculamos cuando cambia la ruta — cubre login/logout en la SPA.
  useEffect(() => {
    setAuthed(isTokenValid(getToken()));
  }, [pathname]);

  const handleLogout = () => {
    logout();
    setAuthed(false);
    router.replace("/login");
  };

  return (
    <header className="border-b border-border bg-panel">
      <nav className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href={authed ? "/dashboard" : "/login"}
          className="flex items-center gap-2 font-bold text-text hover:text-accent"
        >
          <span
            aria-hidden
            className="inline-block w-3 h-3 rounded-full bg-accent"
          />
          Spoty DWH
        </Link>

        <div className="flex items-center gap-1">
          {authed &&
            links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={[
                    "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                    active
                      ? "bg-panelAlt text-text"
                      : "text-textMuted hover:text-text hover:bg-panelAlt",
                  ].join(" ")}
                >
                  {l.label}
                </Link>
              );
            })}

          {authed ? (
            <button
              onClick={handleLogout}
              className="btn btn-secondary ml-2 !py-1.5 !px-3 !text-sm"
            >
              Logout
            </button>
          ) : (
            pathname !== "/login" && (
              <Link
                href="/login"
                className="btn btn-primary ml-2 !py-1.5 !px-3 !text-sm"
              >
                Login
              </Link>
            )
          )}
        </div>
      </nav>
    </header>
  );
}