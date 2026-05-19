"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setToken, isTokenValid } from "@/lib/auth";

function CallbackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = params.get("token");
    const errParam = params.get("error");
    if (errParam) { setError(errParam); return; }
    if (!token) { setError("No se recibió token en la URL."); return; }
    setToken(token);
    if (!isTokenValid(token)) { setError("El token recibido no es válido o ya expiró."); return; }
    router.replace("/dashboard");
  }, [params, router]);

  if (error) {
    return (
      <div className="card max-w-md mx-auto mt-16 text-center">
        <div className="text-4xl mb-3">😕</div>
        <h2 className="mb-2 text-rose-400">No se pudo iniciar sesión</h2>
        <p className="text-textMuted mb-4 break-words text-sm">{error}</p>
        <button onClick={() => router.replace("/login")} className="btn btn-secondary">
          Volver al login
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-20 text-textMuted">
      <div className="text-center">
        <div className="text-4xl mb-2 animate-pulse">🎧</div>
        <p>Procesando login…</p>
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20 text-textMuted">Cargando…</div>}>
      <CallbackInner />
    </Suspense>
  );
}