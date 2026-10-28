import type { NextRequest } from "next/server";

export function hasTrustedOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin || origin === "null") return false;
  if (origin === request.nextUrl.origin) return true;
  const configuredOrigin = process.env.WEB_PUBLIC_ORIGIN?.trim();
  if (!configuredOrigin) return false;
  try {
    const url = new URL(configuredOrigin);
    if (!["http:", "https:"].includes(url.protocol)) return false;
    if (
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      url.pathname !== "/"
    )
      return false;
    return origin === url.origin;
  } catch {
    return false;
  }
}
