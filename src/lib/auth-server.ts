import { cookies, headers } from "next/headers";

/**
 * Get the current user id from auth cookie or from the header set by middleware.
 * Use this in server components so admin/video/categories access works even when
 * cookies() is empty (e.g. RSC request without cookie in some deployments).
 */
export async function getAuthUserId(): Promise<string> {
  const cookieStore = await cookies();
  const userIdFromCookie = (cookieStore.get("vs_userId")?.value ?? "").trim();
  if (userIdFromCookie) return userIdFromCookie;

  const headerStore = await headers();
  const userIdFromHeader = (headerStore.get("x-vs-user-id") ?? "").trim();
  return userIdFromHeader;
}
