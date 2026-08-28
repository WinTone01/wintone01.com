"use client";

import { flushSync } from "react-dom";
import { useRef } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useLocale } from "@/components/locale-provider";
import { ui } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => { ready: Promise<void> };
};

/**
 * Magic UI's AnimatedThemeToggler: the new theme is revealed by a circle wiping
 * out from the button itself, using the View Transitions API.
 *
 * `flushSync` matters — the transition snapshots the DOM the moment the callback
 * returns, so React has to have committed the class change by then or the wipe
 * reveals the old theme. Browsers without the API (and anyone who asked for
 * reduced motion) just get the instant switch, which is the correct fallback
 * rather than a degraded animation.
 */
export function ThemeToggle({ className }: { className?: string | undefined }) {
  const { theme, setTheme } = useTheme();
  const { t } = useLocale();
  const ref = useRef<HTMLButtonElement>(null);
  const isDark = theme === "dark";

  async function toggle() {
    const next = isDark ? "light" : "dark";
    const doc = document as ViewTransitionDocument;
    const button = ref.current;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!button || reduced || typeof doc.startViewTransition !== "function") {
      setTheme(next);
      return;
    }

    await doc.startViewTransition(() => {
      flushSync(() => setTheme(next));
    }).ready;

    const { top, left, width, height } = button.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    // Radius out to the furthest corner, so the circle always clears the viewport.
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      {
        duration: 620,
        easing: "cubic-bezier(0.21, 0.47, 0.32, 0.98)",
        pseudoElement: "::view-transition-new(root)",
      },
    );
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={toggle}
      aria-label={t(isDark ? ui.a11y.toLight : ui.a11y.toDark)}
      aria-pressed={isDark}
      className={cn(
        "group relative flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-elevated text-muted-foreground transition-colors duration-300 hover:border-ring hover:text-foreground",
        className,
      )}
    >
      <Sun
        className={cn(
          "absolute size-4 transition-all duration-500",
          isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100",
        )}
      />
      <Moon
        className={cn(
          "absolute size-4 transition-all duration-500",
          isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0",
        )}
      />
    </button>
  );
}
