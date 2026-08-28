"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Github, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { BorderBeam } from "@/components/magicui/effects";
import { GITHUB, NAV } from "@/lib/profile";
import { useLocale } from "@/components/locale-provider";
import { ui } from "@/lib/i18n";

/**
 * Below `md` the desktop link row is hidden, so without this there is no way to
 * reach a section on a phone. Opens a sheet under the floating nav pill, stagger
 * animating the links in.
 */
export function MobileNav({ active }: { active: string }) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // A phone keeps the page behind the sheet from scrolling under a stray touch.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Escape closes it, and so does resizing up into the desktop layout.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const mq = window.matchMedia("(min-width: 768px)");
    const onWide = () => {
      if (mq.matches) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onWide);
    return () => {
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onWide);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={t(open ? ui.a11y.closeMenu : ui.a11y.openMenu)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-elevated text-muted-foreground transition-colors duration-300 hover:border-ring hover:text-foreground md:hidden"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? "close" : "open"}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </motion.span>
        </AnimatePresence>
      </button>

      {/* Portalled to the body: inside the z-50 header it would paint over the
          nav pill it belongs to, dimming the logo and the close button. */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                key="scrim"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                onClick={() => setOpen(false)}
                className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm md:hidden"
                aria-hidden
              />
            )}
          </AnimatePresence>,
          document.body,
        )}

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="sheet"
              id="mobile-nav"
              initial={{ opacity: 0, y: -12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.97 }}
              transition={{ duration: 0.32, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="glass absolute inset-x-0 top-[calc(100%+0.6rem)] z-50 overflow-hidden rounded-3xl p-3 shadow-[var(--shadow-premium)] md:hidden"
            >
              <BorderBeam duration={10} />
              <nav className="flex flex-col">
                {NAV.map((n, i) => (
                  <motion.a
                    key={n.id}
                    href={`#${n.id}`}
                    onClick={() => setOpen(false)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.06 + i * 0.05, duration: 0.35 }}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3.5 text-base transition-colors duration-300 ${
                      active === n.id
                        ? "bg-accent text-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="font-mono text-[11px] text-muted-foreground">0{i + 1}</span>
                      {t(ui.nav[n.id])}
                    </span>
                    {active === n.id && (
                      <span className="size-1.5 rounded-full bg-foreground" aria-hidden />
                    )}
                  </motion.a>
                ))}

                <motion.a
                  href={GITHUB}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.06 + NAV.length * 0.05, duration: 0.35 }}
                  className="mt-2 flex items-center justify-between rounded-2xl bg-primary px-4 py-3.5 text-base font-medium text-primary-foreground"
                >
                  <span className="flex items-center gap-3">
                    <Github className="size-4" />
                    @WinTone01
                  </span>
                  <ArrowUpRight className="size-4" />
                </motion.a>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
