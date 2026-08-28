import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/**
 * Whether the visitor asked for reduced motion.
 *
 * Motion's own `useReducedMotion` is not usable during render here: it seeds
 * `false` for hydration safety and only re-renders when the media query
 * *changes*. Someone who already had the preference on before the page loaded
 * never produces a change event, so the value stays `false` forever and every
 * component that reads it at render time animates anyway.
 *
 * `useSyncExternalStore` is the fix — React reads the client snapshot during
 * hydration and re-renders when it disagrees with the server's, so the value is
 * correct on the first committed frame without tearing.
 */
export function useReducedMotion() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
