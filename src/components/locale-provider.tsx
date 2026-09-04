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
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE } from "@/lib/locale.detect";

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

function writeCookie(locale: Locale) {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
}

export function LocaleProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: {
  children: ReactNode;
  /** Resolved on the server from the cookie, so the first paint is already right. */
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [switching, setSwitching] = useState(false);

  // A first-time visitor was matched by Accept-Language, not by a cookie.
  // Writing it back means the next request does not have to guess again.
  useEffect(() => {
    document.documentElement.lang = locale;
    writeCookie(locale);
    // Only ever on mount: later changes go through setLocale, which writes it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    writeCookie(next);

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
