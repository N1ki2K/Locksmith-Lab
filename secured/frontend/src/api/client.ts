const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";
let csrfToken: string | undefined;

async function getCsrfToken() {
  if (!csrfToken) {
    const response = await fetch(`${API_URL}/csrf-token`, { credentials: "include" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not establish a secure session");
    csrfToken = data.csrfToken as string;
  }
  return csrfToken;
}

export async function apiRequest(path: string, options: RequestInit = {}) {
  const method = (options.method ?? "GET").toUpperCase();
  const headers: Record<string, string> = { "Content-Type": "application/json", ...(options.headers as Record<string, string> | undefined) };
  if (!["GET", "HEAD", "OPTIONS"].includes(method)) headers["X-CSRF-Token"] = await getCsrfToken();
  const response = await fetch(`${API_URL}${path}`, { ...options, method, credentials: "include", headers });
  const data = await response.json();
  if (!response.ok) {
    if (response.status === 401) {
      csrfToken = undefined;
      window.dispatchEvent(new Event("session-expired"));
    }
    throw new Error(data.error || "Request failed");
  }
  if (typeof data.csrfToken === "string") csrfToken = data.csrfToken;
  else if (path === "/auth/logout" && method === "POST") csrfToken = undefined;
  return data;
}
