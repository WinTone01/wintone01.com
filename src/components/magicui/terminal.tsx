"use client";

import { motion, useInView, type MotionProps } from "motion/react";
import {
  Children,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

/**
 * MagicUI Terminal, adapted to the portfolio design system:
 * children animate one after another, each line waiting for the one above it.
 * Colours come from tokens (--ok / --warn / --note) instead of Tailwind palette
 * classes so both themes stay legible.
 *
 * The context deliberately exposes `complete` as a stable callback and the
 * cursor as a plain number. Handing children the whole context object instead
 * would put a value that changes on every completed line into their effect
 * dependencies, which restarts the typing animation of lines that already
 * finished and wipes their text.
 */

type SequenceContextValue = {
  activeIndex: number;
  started: boolean;
  complete: (index: number) => void;
};

/** One output line: never wraps, so the pane scrolls instead of reflowing. */
const LINE =
  "grid whitespace-pre font-mono text-[12px] leading-relaxed tracking-tight sm:text-[13px]";

const SequenceContext = createContext<SequenceContextValue | null>(null);
const ItemIndexContext = createContext<number | null>(null);

/** Resolves whether this child's turn has come, without leaking context identity. */
function useSequenceSlot(startOnViewFallback = true) {
  const sequence = useContext(SequenceContext);
  const index = useContext(ItemIndexContext);
  const [turnTaken, setTurnTaken] = useState(false);

  const inSequence = sequence !== null && index !== null;
  const isMyTurn = inSequence && sequence.started && sequence.activeIndex === index;

  useEffect(() => {
    if (isMyTurn) setTurnTaken(true);
  }, [isMyTurn]);

  const complete = sequence?.complete;
  const reportComplete = useCallback(() => {
    if (complete && index !== null) complete(index);
  }, [complete, index]);

  return {
    inSequence,
    shouldRun: inSequence ? turnTaken : startOnViewFallback,
    reportComplete,
  };
}

/* ---------------- AnimatedSpan ---------------- */
export function AnimatedSpan({
  children,
  delay = 0,
  className,
  ...props
}: MotionProps & { children: ReactNode; delay?: number; className?: string }) {
  const { inSequence, shouldRun, reportComplete } = useSequenceSlot();
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={shouldRun ? { opacity: 1, y: 0 } : { opacity: 0, y: -4 }}
      transition={
        reduced ? { duration: 0 } : { duration: 0.28, delay: inSequence ? 0 : delay / 1000 }
      }
      className={cn(LINE, className)}
      onAnimationComplete={reportComplete}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/* ---------------- TypingAnimation ---------------- */
export function TypingAnimation({
  children,
  className,
  duration = 34,
  delay = 0,
}: {
  children: string;
  className?: string;
  duration?: number;
  delay?: number;
}) {
  const { inSequence, shouldRun, reportComplete } = useSequenceSlot();
  const reduced = useReducedMotion();
  const [typed, setTyped] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!shouldRun || done) return;

    // Reduced motion: the line is content, so it still appears — all at once,
    // and the sequence moves on immediately.
    if (reduced) {
      setTyped(children);
      setDone(true);
      return;
    }

    let i = 0;
    let interval: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(
      () => {
        interval = setInterval(() => {
          i += 1;
          setTyped(children.slice(0, i));
          if (i >= children.length) {
            clearInterval(interval);
            setDone(true);
          }
        }, duration);
      },
      inSequence ? 0 : delay,
    );

    return () => {
      clearTimeout(start);
      if (interval) clearInterval(interval);
    };
  }, [shouldRun, done, children, duration, delay, inSequence, reduced]);

  // Hand the sequence on only once the whole line has been typed.
  useEffect(() => {
    if (done) reportComplete();
  }, [done, reportComplete]);

  return (
    <div className={cn(LINE, className)}>
      <span>
        {typed}
        {shouldRun && !done && (
          <span className="animate-caret-blink ml-px inline-block h-[1em] w-[7px] translate-y-[2px] bg-foreground align-middle" />
        )}
      </span>
    </div>
  );
}

/* ---------------- Terminal shell ---------------- */
export function Terminal({
  children,
  className,
  title = "wintone01@arch:~",
  sequence = true,
  startOnView = true,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  sequence?: boolean;
  startOnView?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const [activeIndex, setActiveIndex] = useState(0);

  const items = useMemo(() => Children.toArray(children).filter(isValidElement), [children]);
  const started = startOnView ? inView : true;

  // Stable: a line reporting completion must not change the identity children see.
  const complete = useCallback(
    (index: number) => setActiveIndex((current) => (index === current ? current + 1 : current)),
    [],
  );

  const value = useMemo<SequenceContextValue>(
    () => ({ activeIndex, started, complete }),
    [activeIndex, started, complete],
  );

  const body = sequence
    ? items.map((child, i) => (
        <ItemIndexContext.Provider key={i} value={i}>
          {child}
        </ItemIndexContext.Provider>
      ))
    : children;

  return (
    <div
      ref={ref}
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border border-border bg-card",
        className,
      )}
      style={{ boxShadow: "var(--shadow-premium)" }}
    >
      {/* title bar */}
      <div className="flex items-center gap-2 border-b border-border bg-elevated px-4 py-3">
        <span className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-muted-foreground/40" />
          <span className="size-2.5 rounded-full bg-muted-foreground/40" />
          <span className="size-2.5 rounded-full bg-muted-foreground/40" />
        </span>
        <span className="ml-2 truncate font-mono text-[11px] text-muted-foreground">{title}</span>
      </div>

      <div className="max-h-[440px] overflow-auto p-5 sm:p-6">
        {sequence ? (
          <SequenceContext.Provider value={value}>
            <div className="grid gap-1">{body}</div>
          </SequenceContext.Provider>
        ) : (
          <div className="grid gap-1">{body}</div>
        )}
      </div>
    </div>
  );
}
