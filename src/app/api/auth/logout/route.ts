import { NextResponse, type NextRequest } from "next/server";
import { clearAuthCookies, appUrl } from "@/lib/spotify";

export async function POST(request: NextRequest) {
  const res = NextResponse.redirect(appUrl("/now", request), 303);
  clearAuthCookies(res);
  return res;
}
