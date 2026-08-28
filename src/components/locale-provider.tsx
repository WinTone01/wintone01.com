import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { DEFAULT_LOCALE, pick, type L10n, type Locale } from "@/lib/i18n";

const STORAGE_KEY = "wintone-locale";

type LocaleContextValue = {
  locale: Locale;
  /** True while the swap is committing, so callers can show it is working. */
  switching: boolean;
  setLocale: (next: Locale) => void;
  toggleLocale: () => void;
  /** Resolves a localized value for the active locale. */
  t: <T>(value: L10n<T>) => T;
};

const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
  switching: false,
  setLocale: () => {},
  toggleLocale: () => {},
  t: (value) => value[DEFAULT_LOCALE],
});

/**
 * Runs before paint so `<html lang>` is right for the first frame — assistive
 * tech and Google both read it, and correcting it after hydration is too late
 * for a crawler that never runs the client bundle.
 */
export const localeInitScript = `(function(){try{var l=localStorage.getItem('${STORAGE_KEY}');if(l==='tr'||l==='en'){document.documentElement.lang=l;}}catch(e){}})();`;

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    let stored: Locale | null = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === "tr" || raw === "en") stored = raw;
    } catch {
      /* storage unavailable */
    }

    // No stored choice: follow the browser, since a Turkish visitor arriving
    // from a Turkish-language project README should not have to hunt for it.
    const preferred: Locale =
      stored ?? (navigator.language?.toLowerCase().startsWith("tr") ? "tr" : DEFAULT_LOCALE);

    setLocaleState(preferred);
    document.documentElement.lang = preferred;
  }, []);

  /**
   * Swapping the locale re-renders every string on the page at once, which is
   * enough work to drop frames on a phone. `startTransition` lets React keep the
   * old tree interactive while it builds the new one, and the overlay covers the
   * gap so the pause reads as loading rather than as a freeze.
   */
  const setLocale = useCallback((next: Locale) => {
    setSwitching(true);
    document.documentElement.lang = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage unavailable */
    }

    startTransition(() => setLocaleState(next));
    // One frame past the commit, so the overlay never flashes out early.
    window.setTimeout(() => setSwitching(false), 420);
  }, []);

  const toggleLocale = useCallback(
    () => setLocale(locale === "en" ? "tr" : "en"),
    [locale, setLocale],
  );

  const t = useCallback(<T,>(value: L10n<T>) => pick(value, locale), [locale]);

  return (
    <LocaleContext.Provider value={{ locale, switching, setLocale, toggleLocale, t }}>
      {children}
      <AnimatePresence>
        {switching && (
          <motion.div
            key="locale-switching"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center bg-background/70 backdrop-blur-[2px]"
            role="status"
            aria-live="polite"
            aria-label="Loading"
          >
            {/* Three dots breathing in sequence: no text to translate, and it
                reads the same at any size, on any device. */}
            <span className="flex items-center gap-2">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="size-2.5 rounded-full bg-foreground"
                  initial={{ opacity: 0.25, scale: 0.7 }}
                  animate={{ opacity: [0.25, 1, 0.25], scale: [0.7, 1, 0.7] }}
                  transition={{
                    duration: 0.9,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
