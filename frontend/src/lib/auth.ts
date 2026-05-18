// Helpers para gestionar el JWT que el backend devuelve tras OAuth PKCE.
// El token se guarda en localStorage bajo la clave "app_token".

const TOKEN_KEY = "app_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* noop */
  }
}

export function logout(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* noop */
  }
}

/**
 * Decodifica el payload de un JWT sin validar la firma.
 * Solo lo usamos para chequear el `exp` en cliente.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);
    const json =
      typeof atob === "function"
        ? atob(padded)
        : Buffer.from(padded, "base64").toString("utf-8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Devuelve true si hay un token y todavía no ha expirado.
 * Si el JWT no trae `exp`, asumimos que sigue siendo válido.
 */
export function isTokenValid(token?: string | null): boolean {
  const t = token ?? getToken();
  if (!t) return false;
  const payload = decodeJwtPayload(t);
  if (!payload) return false;
  const exp = payload["exp"];
  if (typeof exp !== "number") return true;
  const nowSec = Math.floor(Date.now() / 1000);
  return exp > nowSec;
}