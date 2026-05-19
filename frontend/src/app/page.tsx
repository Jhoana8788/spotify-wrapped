"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isTokenValid } from "@/lib/auth";

export default function RootRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace(isTokenValid() ? "/dashboard" : "/login");
  }, [router]);

  return (
    <div className="flex items-center justify-center py-32 text-textMuted">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-pulse">🎧</div>
        <p>Cargando FREME EMOTIO…</p>
      </div>
    </div>
  );
}