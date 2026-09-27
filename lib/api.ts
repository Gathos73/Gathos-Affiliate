export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api/affiliate${path}`, { cache: "no-store", ...init });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(payload.error || payload.detail || "Request failed.", response.status);
  return payload as T;
}

export function json(body: unknown, method = "POST"): RequestInit {
  return { method, body: JSON.stringify(body), headers: { "content-type": "application/json" } };
}
