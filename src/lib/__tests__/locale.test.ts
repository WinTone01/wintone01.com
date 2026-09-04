import { describe, expect, test } from "bun:test";
import { __test, LOCALE_COOKIE } from "../locale.detect";

const { fromCookieHeader, fromAcceptLanguage } = __test;

describe("fromCookieHeader", () => {
  test("finds the locale among other cookies", () => {
    expect(fromCookieHeader(`_ga=x; ${LOCALE_COOKIE}=tr; other=1`)).toBe("tr");
  });

  test("tolerates the spacing browsers actually send", () => {
    expect(fromCookieHeader(`a=1;${LOCALE_COOKIE}=en`)).toBe("en");
  });

  test("ignores a cookie whose name merely ends with ours", () => {
    expect(fromCookieHeader(`not-${LOCALE_COOKIE}=tr`)).toBeNull();
  });

  test("ignores a value that is not a locale we ship", () => {
    expect(fromCookieHeader(`${LOCALE_COOKIE}=de`)).toBeNull();
  });

  test("no header is not an error", () => {
    expect(fromCookieHeader(null)).toBeNull();
    expect(fromCookieHeader("")).toBeNull();
  });
});

describe("fromAcceptLanguage", () => {
  test("matches Turkish in either form", () => {
    expect(fromAcceptLanguage("tr-TR,tr;q=0.9,en;q=0.8")).toBe("tr");
    expect(fromAcceptLanguage("tr")).toBe("tr");
  });

  test("only the first entry decides — a later tr is not a preference", () => {
    expect(fromAcceptLanguage("en-GB,en;q=0.9,tr;q=0.5")).toBeNull();
  });

  test("no header is not an error", () => {
    expect(fromAcceptLanguage(undefined)).toBeNull();
  });
});
