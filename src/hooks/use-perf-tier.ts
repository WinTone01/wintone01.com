import { useSyncExternalStore } from "react";

/**
 * Whether this device should get the full decorative layer.
 *
 * Measured on a throttled 375px viewport, the ornamental layer pinned the main
 * thread at ~99% with 41% of every second spent in style recalculation alone —
 * the border beams animate a registered custom property, which invalidates style
 * for each element every frame. None of it survives a phone, and none of it is
 * load-bearing, so small or low-powered devices get a still version.
 *
 * A coarse pointer also rules out the effects that only exist to follow a mouse.
 */

const QUERY = "(max-width: 1023px), (pointer: coarse)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function isLite() {
  if (window.matchMedia(QUERY).matches) return true;

  // A big screen driven by a weak machine still deserves the calmer version.
  const cores = navigator.hardwareConcurrency;
  if (typeof cores === "number" && cores > 0 && cores <= 4) return true;

  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (typeof memory === "number" && memory > 0 && memory <= 4) return true;

  return false;
}

/**
 * `true` when the ornamental layer should be skipped. Server-rendered as `false`
 * so the markup matches the desktop default, then corrected on hydration by
 * `useSyncExternalStore` before the first committed frame.
 */
export function useLiteMode() {
  return useSyncExternalStore(subscribe, isLite, () => false);
}
