// Tiny fetch wrapper: API with cookie credentials + CSRF double-submit token.
// In dev, Vite proxies /api to the backend (same-origin). In prod, set
// VITE_API_BASE to the backend URL.
const BASE = import.meta.env.VITE_API_BASE || "";

let csrfToken = null;

async function ensureCsrf() {
  if (csrfToken) return csrfToken;
  const res = await fetch(`${BASE}/api/csrf`, { credentials: "include" });
  const data = await res.json();
  csrfToken = data.csrfToken;
  return csrfToken;
}

async function request(method, path, body) {
  const headers = { "Content-Type": "application/json" };
  if (method !== "GET") {
    headers["X-CSRF-Token"] = await ensureCsrf();
  }
  const res = await fetch(`${BASE}/api${path}`, {
    method,
    credentials: "include",
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await res.json()
    : await res.text();

  if (!res.ok) {
    const err = new Error(
      (data && data.error) || "حدث خطأ. حاول مجدداً."
    );
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
