"use client";

import { motion } from "motion/react";
import { useLocale } from "@/components/locale-provider";
import { ui } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** EN / TR switch, sharing the nav pill's sliding-indicator language. */
export function LocaleToggle({ className }: { className?: string | undefined }) {
  const { locale, setLocale, t } = useLocale();

  return (
    <div
      className={cn(
        "relative flex h-9 shrink-0 items-center rounded-full border border-border bg-elevated p-0.5",
        className,
      )}
    >
      {(["en", "tr"] as const).map((code) => {
        const active = locale === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            aria-label={t(code === "tr" ? ui.a11y.switchToTurkish : ui.a11y.switchToEnglish)}
            aria-pressed={active}
            className={cn(
              "relative z-10 rounded-full px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors duration-300",
              active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId="locale-pill"
                transition={{ type: "spring", stiffness: 340, damping: 30 }}
                className="absolute inset-0 -z-10 rounded-full bg-primary"
              />
            )}
            {code}
          </button>
        );
      })}
    </div>
  );
}
