import { NextResponse, type NextRequest } from "next/server";
import { COOKIE, applyTokens, clearAuthCookies, clientId, requestToken, safeNext, appUrl } from "@/lib/spotify";

// Server components can't set cookies, so expired sessions bounce through here and back.
export async function GET(request: NextRequest) {
  const next = safeNext(request.nextUrl.searchParams.get("next"));
  const refreshToken = request.cookies.get(COOKIE.refresh)?.value;
  const id = clientId();

  if (refreshToken && id) {
    try {
      const tokens = await requestToken({ grant_type: "refresh_token", refresh_token: refreshToken, client_id: id });
      const res = NextResponse.redirect(appUrl(next, request));
      applyTokens(res, tokens);
      return res;
    } catch (err) {
      console.error(err);
    }
  }

  const res = NextResponse.redirect(appUrl("/now?error=expired", request));
  clearAuthCookies(res);
  return res;
}
