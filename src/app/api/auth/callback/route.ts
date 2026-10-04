import { NextResponse, type NextRequest } from "next/server";
import { COOKIE, applyTokens, clientId, redirectUri, requestToken, appUrl } from "@/lib/spotify";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const code = params.get("code");
  const state = params.get("state");
  const verifier = request.cookies.get(COOKIE.verifier)?.value;
  const expectedState = request.cookies.get(COOKIE.state)?.value;
  const id = clientId();

  const fail = (reason: string) => {
    const res = NextResponse.redirect(appUrl(`/now?error=${reason}`, request));
    res.cookies.delete(COOKIE.verifier);
    res.cookies.delete(COOKIE.state);
    return res;
  };

  if (params.get("error")) return fail("denied");
  if (!code || !state || !verifier || state !== expectedState || !id) return fail("state");

  try {
    const tokens = await requestToken({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri(request),
      client_id: id,
      code_verifier: verifier,
    });
    const res = NextResponse.redirect(appUrl("/now", request));
    res.cookies.delete(COOKIE.verifier);
    res.cookies.delete(COOKIE.state);
    applyTokens(res, tokens);
    return res;
  } catch (err) {
    console.error(err);
    return fail("token");
  }
}
