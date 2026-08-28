"use client";

import { useEffect, useId, useRef } from "react";
import { useTheme } from "@/components/theme-provider";

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type TurnstileApi = {
  render: (
    el: HTMLElement,
    options: {
      sitekey: string;
      theme?: "light" | "dark" | "auto";
      size?: "normal" | "flexible" | "compact";
      callback?: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
    },
  ) => string;
  remove: (id: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<void> | null = null;

/** Loaded once per page, on demand — the form is at the bottom of a long page. */
function loadScript() {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    if (window.turnstile) return resolve();
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("turnstile failed to load")));
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("turnstile failed to load"));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

/**
 * Cloudflare Turnstile, rendered explicitly so the widget can be themed and
 * cleaned up. Renders nothing when `VITE_TURNSTILE_SITE_KEY` is unset, which is
 * what makes local development work without Cloudflare credentials — the server
 * skips verification under the same condition.
 */
export function Turnstile({ onToken }: { onToken: (token: string | undefined) => void }) {
  const siteKey = import.meta.env["VITE_TURNSTILE_SITE_KEY"] as string | undefined;
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const { theme } = useTheme();

  useEffect(() => {
    if (!siteKey || !ref.current) return;
    const host = ref.current;
    let widgetId: string | undefined;
    let cancelled = false;

    loadScript()
      .then(() => {
        if (cancelled || !window.turnstile) return;
        widgetId = window.turnstile.render(host, {
          sitekey: siteKey,
          theme: theme === "dark" ? "dark" : "light",
          size: "flexible",
          callback: (token) => onToken(token),
          // A token is valid for five minutes; clearing it forces a fresh one
          // rather than letting the form submit something the server will reject.
          "expired-callback": () => onToken(undefined),
          "error-callback": () => onToken(undefined),
        });
      })
      .catch(() => {
        // Widget unreachable: let the submission through and leave it to the
        // server-side rate limit. Blocking the form on a third-party script
        // outage would be worse than the spam it prevents.
        onToken(undefined);
      });

    return () => {
      cancelled = true;
      if (widgetId && window.turnstile) {
        try {
          window.turnstile.remove(widgetId);
        } catch {
          /* already gone */
        }
      }
    };
    // Re-rendered on theme change so the widget matches the page.
  }, [siteKey, theme, onToken, id]);

  if (!siteKey) return null;
  return <div ref={ref} className="mt-1 flex justify-center [&_iframe]:rounded-xl" />;
}
