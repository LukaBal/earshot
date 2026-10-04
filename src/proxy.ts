import type { NextRequest } from "next/server";

// Spotify no longer accepts "localhost" redirect URIs, only 127.0.0.1. Cookies and the
// browser-stored history are per-host, so keep everyone on 127.0.0.1 to avoid a split session.
//
// Reads the Host header because request.nextUrl reports "localhost" in dev regardless. And it
// can't use a Location redirect: Next treats localhost and 127.0.0.1 as the same origin and
// rewrites the header to a relative path, looping forever. A meta refresh gets around that.
export function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  if (request.method !== "GET" || !/^localhost(:\d+)?$/.test(host)) return;

  const target = `http://${host.replace("localhost", "127.0.0.1")}${request.nextUrl.pathname}${request.nextUrl.search}`;
  const safe = target.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  return new Response(
    `<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${safe}"><title>Redirecting…</title><a href="${safe}">Continue to ${safe}</a>`,
    { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } },
  );
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
