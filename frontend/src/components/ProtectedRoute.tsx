"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, isTokenValid } from "@/lib/auth";

/**
 * Envuelve el contenido de las páginas privadas.
 * - Mientras decide (`checking`), muestra un placeholder.
 * - Si no hay JWT válido → router.replace("/login").
 * - Si lo hay, renderiza `children`.
 */
export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [state, setState] = useState<"checking" | "ok">("checking");

  useEffect(() => {
    if (isTokenValid(getToken())) {
      setState("ok");
    } else {
      router.replace("/login");
    }
  }, [router]);

  if (state === "checking") {
    return (
      <div className="flex items-center justify-center py-20 text-textMuted">
        Verificando sesión…
      </div>
    );
  }

  return <>{children}</>;
}