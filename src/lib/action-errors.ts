/** True when a server action intentionally called redirect(). */
export function isRedirectError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

function safeInternalPath(path: string, fallback = "/"): string {
  const trimmed = path.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return fallback;
  return trimmed;
}

export function readNextPath(formData: FormData, fallback = "/"): string {
  return safeInternalPath(String(formData.get("next") ?? ""), fallback);
}
