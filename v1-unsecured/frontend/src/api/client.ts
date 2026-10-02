const API_URL = "http://loclhost:3000/api";

export async function apiRequest(path: string, options: RequestInit = {}) {
  const response = await fetch(` ${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}
