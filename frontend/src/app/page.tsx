"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isTokenValid } from "@/lib/auth";

/**
 * Ruta raíz: decide en cliente a dónde mandar al usuario.
 * Si hay token válido → /dashboard; si no → /login.
 *
 * No podemos hacerlo en server component porque el JWT vive
 * en localStorage (no en cookie).
 */
export default function RootRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (isTokenValid()) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center py-20 text-textMuted">
      Redirigiendo…
    </div>
  );
}