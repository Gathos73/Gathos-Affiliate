import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SAFE = new Set(["GET", "HEAD"]);
const ALLOWED = new Map<string, Set<string>>([
  ["auth/send-otp", new Set(["POST"])], ["auth/verify-otp", new Set(["POST"])],
  ["auth/logout", new Set(["POST"])], ["auth/me", new Set(["GET", "HEAD"])],
  ["overview", new Set(["GET", "HEAD"])], ["profile", new Set(["PATCH"])],
  ["codes", new Set(["GET", "HEAD", "POST"])],
  ["conversions", new Set(["GET", "HEAD"])],
  ["withdrawals", new Set(["GET", "HEAD", "POST"])],
]);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function allowed(path: string[], method: string) {
  const joined = path.join("/");
  if (ALLOWED.get(joined)?.has(method)) return true;
  return path.length === 2 && path[0] === "codes" && UUID.test(path[1]) && method === "PATCH";
}

async function forward(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  if (!allowed(path, request.method)) return Response.json({ error: "not_found" }, { status: 404 });
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) return Response.json({ error: "invalid_origin" }, { status: 403 });
  const base = process.env.BACKEND_URL || "http://127.0.0.1:8000";
  const upstreamUrl = new URL(`${base.replace(/\/$/, "")}/api/affiliate/${path.map(encodeURIComponent).join("/")}`);
  upstreamUrl.search = request.nextUrl.search;
  const headers = new Headers(request.headers);
  for (const key of ["host", "content-length", "connection", "x-forwarded-for", "x-real-ip"]) headers.delete(key);
  headers.set("x-gathos-client", "affiliate-dashboard-bff");
  try {
    const upstream = await fetch(upstreamUrl, {
      method: request.method, headers, redirect: "manual", cache: "no-store",
      body: SAFE.has(request.method) ? undefined : await request.arrayBuffer(),
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(20_000)]),
    });
    const responseHeaders = new Headers();
    const contentType = upstream.headers.get("content-type");
    if (contentType) responseHeaders.set("content-type", contentType);
    const cookieHeaders = upstream.headers as Headers & { getSetCookie?: () => string[] };
    for (const cookie of cookieHeaders.getSetCookie?.() ?? []) responseHeaders.append("set-cookie", cookie);
    if (!responseHeaders.has("set-cookie")) {
      const cookie = upstream.headers.get("set-cookie");
      if (cookie) responseHeaders.append("set-cookie", cookie);
    }
    responseHeaders.set("cache-control", "private, no-store");
    return new Response(request.method === "HEAD" ? null : upstream.body, { status: upstream.status, headers: responseHeaders });
  } catch {
    return Response.json({ error: "Affiliate service is temporarily unavailable." }, { status: 502 });
  }
}

export const GET = forward;
export const HEAD = forward;
export const POST = forward;
export const PATCH = forward;
