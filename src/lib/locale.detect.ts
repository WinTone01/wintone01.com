import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "./i18n";

/**
 * Where the active locale is read from, on both sides of the render.
 *
 * It used to be `localStorage` inside an effect, which meant the server had no
 * way of knowing and always rendered English: a Turkish visitor watched the
 * whole page swap language after hydration, and a crawler only ever saw the
 * English half of a site whose sitemap advertises both. A cookie is the same
 * value in a place the server can also read, so the first byte is already in
 * the right language.
 *
 * `createIsomorphicFn` keeps the two implementations apart at build time — the
 * server half, and the `@tanstack/react-start/server` import it needs, are not
 * in the client bundle.
 */

export const LOCALE_COOKIE = "wintone-locale";
/** A year: the choice is a preference, not a session. */
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function asLocale(value: string | null | undefined): Locale | null {
  return LOCALES.includes(value as Locale) ? (value as Locale) : null;
}

function fromCookieHeader(header: string | null | undefined): Locale | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [name, ...rest] = part.split("=");
    if (name?.trim() === LOCALE_COOKIE) return asLocale(decodeURIComponent(rest.join("=").trim()));
  }
  return null;
}

/**
 * No stored choice: follow the browser. A Turkish visitor arriving from a
 * Turkish README should not have to hunt for the switch.
 */
function fromAcceptLanguage(header: string | null | undefined): Locale | null {
  if (!header) return null;
  const first = header.split(",")[0]?.trim().toLowerCase();
  return first?.startsWith("tr") ? "tr" : null;
}

export const detectLocale = createIsomorphicFn()
  .server((): Locale => {
    const headers = getRequest().headers;
    return (
      fromCookieHeader(headers.get("cookie")) ??
      fromAcceptLanguage(headers.get("accept-language")) ??
      DEFAULT_LOCALE
    );
  })
  .client((): Locale => {
    // Same order as the server, so the value agrees across hydration.
    return (
      fromCookieHeader(document.cookie) ??
      (navigator.language?.toLowerCase().startsWith("tr") ? "tr" : null) ??
      DEFAULT_LOCALE
    );
  });

/** Exported for the tests — the parsing is the part worth pinning down. */
export const __test = { fromCookieHeader, fromAcceptLanguage };
