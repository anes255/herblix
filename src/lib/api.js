// Fetch wrapper using Bearer-token auth. The admin token is stored in
// localStorage and sent as `Authorization: Bearer <token>`. This works across
// domains (Vercel + Render) and has no CSRF surface (no ambient cookies).
//
// In dev, Vite proxies /api to the backend. In prod, either the Vercel rewrite
// forwards /api, or set VITE_API_BASE to the backend URL.
const BASE = import.meta.env.VITE_API_BASE || "";
const TOKEN_KEY = "herblix_admin_token";

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore storage errors
  }
}

export function apiUrl(path) {
  return `${BASE}/api${path}`;
}

export function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(method, path, body) {
  const headers = { ...authHeaders() };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(apiUrl(path), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await res.json()
    : await res.text();

  if (!res.ok) {
    // Session expired / invalid → drop the stored token.
    if (res.status === 401) setToken(null);
    const err = new Error((data && data.error) || "حدث خطأ. حاول مجدداً.");
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  get: (p) => request("GET", p),
  post: (p, b) => request("POST", p, b),
  put: (p, b) => request("PUT", p, b),
  patch: (p, b) => request("PATCH", p, b),
  del: (p) => request("DELETE", p),
};
