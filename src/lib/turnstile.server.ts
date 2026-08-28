const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Cloudflare Turnstile verification.
 *
 * The widget's token is single-use and bound to the secret, so a bot cannot
 * replay one. It is checked on the server for the obvious reason: the client
 * side of a captcha is a suggestion.
 *
 * Configured by `TURNSTILE_SECRET_KEY`; when that is absent verification is
 * skipped so local development does not need Cloudflare credentials.
 */
export async function verifyTurnstile(token: string | undefined, ip?: string) {
  const secret = process.env["TURNSTILE_SECRET_KEY"]?.trim();
  if (!secret) return { ok: true as const, skipped: true as const };

  if (!token) {
    return { ok: false as const, reason: "missing-token" };
  }

  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set("remoteip", ip);

  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = (await res.json()) as { success: boolean; "error-codes"?: string[] };
    if (!data.success) {
      console.warn("Turnstile rejected a submission:", data["error-codes"]);
      return { ok: false as const, reason: "rejected" };
    }
    return { ok: true as const, skipped: false as const };
  } catch (error) {
    // A Cloudflare outage should not take the contact form down with it.
    console.error("Turnstile verification errored, allowing through:", error);
    return { ok: true as const, skipped: true as const };
  }
}

const WINDOW_MS = 1000 * 60 * 10;
const MAX_PER_WINDOW = 3;
const RATE_PREFIX = "https://portfolio.local/__rate/";

/**
 * A soft per-IP limit on top of Turnstile.
 *
 * It leans on the Cloudflare Cache API, which is per-colo rather than global, so
 * a determined attacker spread across regions gets more than `MAX_PER_WINDOW`.
 * That is the accepted trade: Turnstile is the actual defence, and this only has
 * to stop the boring case of one script hammering the endpoint. A global limit
 * would need Durable Objects or KV, which is a binding this project does not
 * otherwise need.
 */
export async function checkRateLimit(ip: string | undefined) {
  if (!ip) return { ok: true as const };

  let cache: Cache | null = null;
  try {
    if (typeof caches === "undefined") return { ok: true as const };
    cache = (caches as CacheStorage & { default?: Cache }).default ?? (await caches.open("rate"));
  } catch {
    return { ok: true as const };
  }
  if (!cache) return { ok: true as const };

  const key = `${RATE_PREFIX}${encodeURIComponent(ip)}`;
  const now = Date.now();

  try {
    const hit = await cache.match(key);
    const hits: number[] = hit ? ((await hit.json()) as number[]) : [];
    const recent = hits.filter((t) => now - t < WINDOW_MS);

    if (recent.length >= MAX_PER_WINDOW) {
      const oldest = recent[0] ?? now;
      return {
        ok: false as const,
        retryAfterMinutes: Math.max(1, Math.ceil((WINDOW_MS - (now - oldest)) / 60000)),
      };
    }

    recent.push(now);
    await cache.put(
      key,
      new Response(JSON.stringify(recent), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": `max-age=${WINDOW_MS / 1000}`,
        },
      }),
    );
  } catch {
    /* best-effort — never fail a legitimate send because the counter broke */
  }

  return { ok: true as const };
}
