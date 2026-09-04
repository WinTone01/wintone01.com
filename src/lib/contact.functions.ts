import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { contactSchema } from "./contact.schema";
import { sendContactEmail } from "./contact.server";
import { checkRateLimit, verifyTurnstile } from "./turnstile.server";

/**
 * The rate limiter's bucket key.
 *
 * `CF-Connecting-IP` is set by Cloudflare and overwritten there, so a visitor
 * coming through the CDN — which is every real visitor — cannot choose their
 * own bucket. The reverse proxy in front of the app rewrites `X-Forwarded-For`
 * to its own address, which is why that one is last and near useless here.
 *
 * None of this is trustworthy for a request that reaches the origin directly,
 * so it is not the only defence: see the global ceiling in `turnstile.server`.
 */
function clientKey(headers: Headers) {
  return (
    headers.get("cf-connecting-ip")?.trim() ??
    headers.get("x-real-ip")?.trim() ??
    headers.get("x-forwarded-for")?.split(",").pop()?.trim() ??
    undefined
  );
}

export const sendContactMessage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => contactSchema.parse(data))
  .handler(async ({ data }) => {
    const client = clientKey(getRequest().headers);

    // Turnstile first: a rejected bot should not consume the visitor's quota.
    const captcha = await verifyTurnstile(data.turnstileToken, client);
    if (!captcha.ok) {
      throw new Error("Verification failed. Please reload the page and try again.");
    }

    const limit = checkRateLimit(client);
    if (!limit.ok) {
      throw new Error(
        `That is a few messages in a short time — please try again in ${limit.retryAfterMinutes} minutes.`,
      );
    }

    const { turnstileToken: _token, ...message } = data;
    return sendContactEmail(message);
  });
