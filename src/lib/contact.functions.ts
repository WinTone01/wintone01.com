import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { contactSchema } from "./contact.schema";
import { sendContactEmail } from "./contact.server";
import { checkRateLimit, verifyTurnstile } from "./turnstile.server";

/** Cloudflare puts the real client IP here; the others are fallbacks. */
function clientIp(headers: Headers) {
  return (
    headers.get("cf-connecting-ip") ??
    headers.get("x-real-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    undefined
  );
}

export const sendContactMessage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => contactSchema.parse(data))
  .handler(async ({ data }) => {
    const ip = clientIp(getRequest().headers);

    // Turnstile first: a rejected bot should not consume the visitor's quota.
    const captcha = await verifyTurnstile(data.turnstileToken, ip);
    if (!captcha.ok) {
      throw new Error("Verification failed. Please reload the page and try again.");
    }

    const limit = await checkRateLimit(ip);
    if (!limit.ok) {
      throw new Error(
        `That is a few messages in a short time — please try again in ${limit.retryAfterMinutes} minutes.`,
      );
    }

    const { turnstileToken: _token, ...message } = data;
    return sendContactEmail(message);
  });
