import { NextResponse, type NextRequest } from "next/server";
import { COOKIE, SCOPES, clientId, redirectUri, setTempCookie, appUrl } from "@/lib/spotify";

function base64url(bytes: ArrayBuffer | Uint8Array) {
  return Buffer.from(bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)).toString("base64url");
}

export async function GET(request: NextRequest) {
  const id = clientId();
  if (!id) return NextResponse.redirect(appUrl("/now?error=config", request));

  const verifier = base64url(crypto.getRandomValues(new Uint8Array(64)));
  const challenge = base64url(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)));
  const state = base64url(crypto.getRandomValues(new Uint8Array(16)));

  const authorize = new URL("https://accounts.spotify.com/authorize");
  authorize.search = new URLSearchParams({
    client_id: id,
    response_type: "code",
    redirect_uri: redirectUri(request),
    scope: SCOPES,
    code_challenge_method: "S256",
    code_challenge: challenge,
    state,
  }).toString();

  const res = NextResponse.redirect(authorize);
  setTempCookie(res, COOKIE.verifier, verifier);
  setTempCookie(res, COOKIE.state, state);
  return res;
}
