import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Forward vs_userId cookie into a request header so server components
 * can read it even when cookies() is empty (e.g. some RSC/proxy cases).
 * Pages use getAuthUserId() to read cookie first, then this header as fallback.
 */
export function middleware(request: NextRequest) {
  const userId = request.cookies.get("vs_userId")?.value?.trim() ?? "";
  const requestHeaders = new Headers(request.headers);
  if (userId) {
    requestHeaders.set("x-vs-user-id", userId);
  }
  return NextResponse.next({
    request: { headers: requestHeaders }
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"]
};
