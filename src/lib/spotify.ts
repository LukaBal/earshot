// Server-side Spotify Web API helpers. Uses Authorization Code + PKCE, so no client secret is needed.
import type { NextResponse } from "next/server";

export const SCOPES = "user-top-read user-read-recently-played";

export const COOKIE = {
  access: "sp_access",
  refresh: "sp_refresh",
  verifier: "sp_verifier",
  state: "sp_state",
} as const;

const cookieBase = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
};

export function clientId() {
  return process.env.SPOTIFY_CLIENT_ID || null;
}

/**
 * The origin the browser actually used. `request.url` can't be trusted for this: in dev Next
 * reports "localhost" even when the browser asked for 127.0.0.1.
 */
export function requestOrigin(request: Request) {
  const url = new URL(request.url);
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? url.host;
  const proto = request.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  return `${proto}://${host}`;
}

/** Absolute URL on the browser's own origin, for redirects. */
export function appUrl(path: string, request: Request) {
  return new URL(path, requestOrigin(request));
}

/** Must exactly match a Redirect URI registered in the Spotify dashboard. */
export function redirectUri(request: Request) {
  return process.env.SPOTIFY_REDIRECT_URI || `${requestOrigin(request)}/api/auth/callback`;
}

/** Only allow same-site relative paths as post-auth destinations. */
export function safeNext(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/now";
}

type TokenResponse = { access_token: string; refresh_token?: string; expires_in: number };

export async function requestToken(params: Record<string, string>): Promise<TokenResponse> {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Spotify token request failed (${res.status}): ${await res.text()}`);
  return res.json();
}

export function applyTokens(res: NextResponse, t: TokenResponse) {
  // Expire the cookie a minute early so we refresh before Spotify starts rejecting it.
  res.cookies.set(COOKIE.access, t.access_token, { ...cookieBase, maxAge: Math.max(t.expires_in - 60, 60) });
  if (t.refresh_token) {
    res.cookies.set(COOKIE.refresh, t.refresh_token, { ...cookieBase, maxAge: 60 * 60 * 24 * 30 });
  }
}

export function setTempCookie(res: NextResponse, name: string, value: string) {
  res.cookies.set(name, value, { ...cookieBase, maxAge: 600 });
}

export function clearAuthCookies(res: NextResponse) {
  for (const name of Object.values(COOKIE)) res.cookies.delete(name);
}

export class SpotifyError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function spotifyGet<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`https://api.spotify.com/v1${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new SpotifyError(res.status, `Spotify ${path} failed (${res.status})`);
  return res.json();
}

// Minimal shapes for the fields we actually render.
export type SpotifyImage = { url: string; width: number | null; height: number | null };
export type SpotifyArtist = {
  id: string;
  name: string;
  images: SpotifyImage[];
  external_urls: { spotify: string };
};
export type SpotifyTrack = {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { name: string; images: SpotifyImage[] };
  external_urls: { spotify: string };
};
export type Paging<T> = { items: T[] };
export type RecentlyPlayed = { items: { played_at: string; track: SpotifyTrack }[] };
export type Me = { display_name: string | null; images: SpotifyImage[] };

/** Smallest image that's still at least `min` px, so we don't pull 640px art for a 48px thumb. */
export function pickImage(images: SpotifyImage[], min = 64) {
  const sorted = [...images].sort((a, b) => (a.width ?? 0) - (b.width ?? 0));
  return (sorted.find((i) => (i.width ?? 0) >= min) ?? sorted.at(-1))?.url ?? null;
}
