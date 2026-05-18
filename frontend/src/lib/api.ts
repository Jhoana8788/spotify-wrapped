// Wrapper sobre fetch que añade automáticamente:
//  - base URL desde NEXT_PUBLIC_API_URL
//  - header Authorization: Bearer <token> cuando hay sesión
//  - manejo de errores con un ApiError serializable
//
// Si la respuesta es 401, limpiamos el token y redirigimos a /login.

import { getToken, logout } from "./auth";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
  "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

type FetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  /** Si true, no añade Authorization aunque haya token. */
  anonymous?: boolean;
};

async function request<T>(path: string, opts: FetchOptions = {}): Promise<T> {
  const { anonymous, body, headers, ...rest } = opts;

  const finalHeaders: Record<string, string> = {
    Accept: "application/json",
    ...(headers as Record<string, string> | undefined),
  };

  if (!anonymous) {
    const token = getToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  let serializedBody: BodyInit | undefined;
  if (body !== undefined && body !== null) {
    if (
      typeof body === "string" ||
      body instanceof FormData ||
      body instanceof Blob ||
      body instanceof ArrayBuffer
    ) {
      serializedBody = body as BodyInit;
    } else {
      finalHeaders["Content-Type"] = "application/json";
      serializedBody = JSON.stringify(body);
    }
  }

  const url = path.startsWith("http") ? path : `${API_URL}${path}`;

  const res = await fetch(url, {
    ...rest,
    headers: finalHeaders,
    body: serializedBody,
    cache: rest.cache ?? "no-store",
  });

  if (res.status === 401) {
    // Sesión inválida — limpiamos y mandamos al login.
    logout();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new ApiError(401, "Unauthorized");
  }

  // 204 No Content
  if (res.status === 204) {
    return undefined as T;
  }

  const contentType = res.headers.get("content-type") || "";
  const parsed = contentType.includes("application/json")
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null);

  if (!res.ok) {
    const detail =
      (parsed && typeof parsed === "object" && "detail" in parsed
        ? String((parsed as Record<string, unknown>).detail)
        : null) || `HTTP ${res.status}`;
    throw new ApiError(res.status, detail, parsed);
  }

  return parsed as T;
}

export const api = {
  get: <T>(path: string, opts?: FetchOptions) =>
    request<T>(path, { ...opts, method: "GET" }),
  post: <T>(path: string, body?: unknown, opts?: FetchOptions) =>
    request<T>(path, { ...opts, method: "POST", body }),
  put: <T>(path: string, body?: unknown, opts?: FetchOptions) =>
    request<T>(path, { ...opts, method: "PUT", body }),
  del: <T>(path: string, opts?: FetchOptions) =>
    request<T>(path, { ...opts, method: "DELETE" }),
};

/** URL absoluta para iniciar el flujo OAuth en el backend. */
export const loginUrl = () => `${API_URL}/v1/auth/login`;