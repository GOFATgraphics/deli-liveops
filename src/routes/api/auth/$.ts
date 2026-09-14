import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@/lib/auth/server";

/**
 * Email/password POSTs send an `Origin` Better Auth must allowlist.
 * The live preview (and its identity proxy) often send a different origin
 * than localhost:8080 / *.grok-sandbox.com — that surfaces as "Invalid origin".
 *
 * Same-origin / loopback requests are this app. Rewrite Origin to a trusted
 * loopback so CSRF still fails for cross-site callers.
 */
function requestForAuth(request: Request): Request {
  if (request.method !== "POST") return request;
  if (!isOwnPageRequest(request)) return request;
  request.headers.set("origin", "http://127.0.0.1:8080");
  return request;
}

function isOwnPageRequest(request: Request): boolean {
  const site = request.headers.get("sec-fetch-site");
  if (site === "same-origin" || site === "none") return true;
  const origin = request.headers.get("origin") ?? "";
  if (!origin || origin === "null") return false;
  try {
    const host = new URL(origin).hostname;
    if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => auth.handler(request),
      POST: ({ request }) => auth.handler(requestForAuth(request)),
    },
  },
});
