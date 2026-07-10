/**
 * Normalizes VITE_API_BASE_URL so a misconfigured value (missing "/api",
 * trailing slash, etc.) still resolves to a working backend URL instead of
 * silently sending every request to the wrong path.
 */
export function resolveApiBaseUrl(raw) {
  const fallback = "http://localhost:8000/api";
  let url = (raw || fallback).trim().replace(/\/+$/, "");
  if (!/\/api$/.test(url)) {
    url = `${url}/api`;
  }
  return url;
}
