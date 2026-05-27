export function normalizeApiBaseUrl(value: string | undefined, fallback = "/api"): string {
  const raw = (value ?? "").trim()
  if (!raw) return fallback.replace(/\/$/, "")

  if (raw.startsWith("/")) {
    return raw.replace(/\/$/, "")
  }

  if (/^https?:\/\//i.test(raw)) {
    return raw.replace(/\/$/, "")
  }

  // If the user entered only host/domain, default to HTTPS for production safety.
  return `https://${raw}`.replace(/\/$/, "")
}

/**
 * The base URL for all API calls.
 *
 * - In development: Vite proxies /api/* to the backend, so this is just "/api".
 * - In production: set VITE_API_BASE_URL=https://youruser.pythonanywhere.com/api
 *   in your hosting platform's environment variables (or in .env.production).
 *   If the variable is absent the app falls back to "/api" (same-origin).
 */
export const API_BASE = normalizeApiBaseUrl(
    (import.meta as { env?: Record<string, string> }).env?.VITE_API_BASE_URL,
    "/api",
)
