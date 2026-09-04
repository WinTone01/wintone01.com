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
/** Stops one abusive client from growing the map without bound. */
const MAX_TRACKED_CLIENTS = 5000;

/**
 * A soft per-client limit on top of Turnstile.
 *
 * This used to lean on the Cloudflare Cache API. That silently became a no-op
 * the moment the site stopped being a Worker — `caches` is undefined on Node,
 * so every call returned "allowed" and Turnstile was the only thing left
 * standing. An in-process map is the right shape for the deployment this now
 * has: one long-lived Node process behind one proxy, which makes the count
 * exact rather than per-colo approximate.
 *
 * It resets on redeploy and does not span replicas. Both are acceptable —
 * Turnstile is the actual defence and this only has to stop the boring case of
 * one script hammering the endpoint. A limit that survives either would need a
 * store this project does not otherwise have.
 */
const hits = new Map<string, number[]>();

function sweep(now: number) {
  for (const [key, times] of hits) {
    const recent = times.filter((t) => now - t < WINDOW_MS);
    if (recent.length === 0) hits.delete(key);
    else hits.set(key, recent);
  }
}

/**
 * A ceiling across every client in the window.
 *
 * The per-client key comes from `CF-Connecting-IP`, which Cloudflare overwrites
 * on the way through and a visitor therefore cannot forge — but only for
 * traffic that actually goes through Cloudflare. Anyone who reaches the origin
 * directly can send a different value on every request and get a fresh bucket
 * each time. This is the backstop for that: whatever the per-client counters
 * say, the endpoint will not send more than this many messages in a window.
 */
const MAX_GLOBAL_PER_WINDOW = 40;
let globalHits: number[] = [];

export function checkRateLimit(client: string | undefined) {
  const started = Date.now();
  globalHits = globalHits.filter((t) => started - t < WINDOW_MS);
  if (globalHits.length >= MAX_GLOBAL_PER_WINDOW) {
    const oldest = globalHits[0] ?? started;
    return {
      ok: false as const,
      retryAfterMinutes: Math.max(1, Math.ceil((WINDOW_MS - (started - oldest)) / 60000)),
    };
  }
  globalHits.push(started);

  if (!client) return { ok: true as const };

  const now = Date.now();
  if (hits.size > MAX_TRACKED_CLIENTS) sweep(now);

  const recent = (hits.get(client) ?? []).filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_PER_WINDOW) {
    const oldest = recent[0] ?? now;
    hits.set(client, recent);
    return {
      ok: false as const,
      retryAfterMinutes: Math.max(1, Math.ceil((WINDOW_MS - (now - oldest)) / 60000)),
    };
  }

  recent.push(now);
  hits.set(client, recent);
  return { ok: true as const };
}

/** Test seam — the limiter is module state, and a test needs a clean slate. */
export function resetRateLimit() {
  hits.clear();
  globalHits = [];
}
