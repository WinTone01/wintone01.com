import { beforeEach, describe, expect, test } from "bun:test";
import { contactSchema } from "../contact.schema";
import { checkRateLimit, resetRateLimit } from "../turnstile.server";

const valid = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  subject: "About nabız",
  message: "I read the README and had a question about the kernel verdict output.",
};

describe("contactSchema", () => {
  test("accepts a well-formed message", () => {
    expect(contactSchema.parse(valid).name).toBe("Ada Lovelace");
  });

  test("trims before it measures, so whitespace is not a message", () => {
    const spaces = { ...valid, message: "   " + "x".repeat(5) + "   " };
    expect(() => contactSchema.parse(spaces)).toThrow();
  });

  test("rejects a malformed address", () => {
    expect(() => contactSchema.parse({ ...valid, email: "ada@" })).toThrow();
  });

  test("rejects an over-long subject", () => {
    expect(() => contactSchema.parse({ ...valid, subject: "x".repeat(121) })).toThrow();
  });

  test("the captcha token is optional, so local development needs no keys", () => {
    expect(contactSchema.parse(valid).turnstileToken).toBeUndefined();
  });
});

describe("checkRateLimit", () => {
  beforeEach(resetRateLimit);

  test("allows three from one client, then holds the fourth", () => {
    const ip = "203.0.113.7";
    expect(checkRateLimit(ip).ok).toBe(true);
    expect(checkRateLimit(ip).ok).toBe(true);
    expect(checkRateLimit(ip).ok).toBe(true);
    const fourth = checkRateLimit(ip);
    expect(fourth.ok).toBe(false);
    expect(fourth.ok === false && fourth.retryAfterMinutes).toBeGreaterThan(0);
  });

  test("clients are counted separately", () => {
    for (let i = 0; i < 3; i++) checkRateLimit("203.0.113.7");
    expect(checkRateLimit("203.0.113.8").ok).toBe(true);
  });

  test("a rotating client key still hits the global ceiling", () => {
    let allowed = 0;
    for (let i = 0; i < 200; i++) {
      if (checkRateLimit(`10.0.0.${i}`).ok) allowed++;
    }
    // Whatever key the caller invents, the endpoint stops sending.
    expect(allowed).toBeLessThanOrEqual(40);
  });

  test("an unknown client is allowed through but still counted globally", () => {
    expect(checkRateLimit(undefined).ok).toBe(true);
  });
});
