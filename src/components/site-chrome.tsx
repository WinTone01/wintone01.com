"use client";

import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocale } from "@/components/locale-provider";
import { ui } from "@/lib/i18n";

/** Thin reading-progress line pinned to the very top of the page. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.4 });
  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-px origin-left bg-foreground/70"
    />
  );
}

/** Floating back-to-top pill that fades in after the hero. */
export function BackToTop() {
  const { t } = useLocale();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.9);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.9 }}
          transition={{ duration: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label={t(ui.a11y.backToTop)}
          className="glass fixed bottom-6 right-6 z-50 flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors duration-300 hover:text-foreground"
        >
          <ArrowUp className="size-4" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/** Returns the id of the section currently in view. */
export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ids.join(",")]);

  return active;
}
