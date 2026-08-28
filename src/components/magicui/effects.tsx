"use client";

import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useSpring,
  type Variants,
} from "motion/react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

/* ---------------- BlurFade ---------------- */
export function BlurFade({
  children,
  className,
  delay = 0,
  yOffset = 14,
  once = true,
}: {
  children: ReactNode;
  className?: string | undefined;
  delay?: number | undefined;
  yOffset?: number;
  once?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: "-60px" });
  const reduced = useReducedMotion();
  const variants: Variants = {
    hidden: reduced
      ? { y: 0, opacity: 1, filter: "blur(0px)" }
      : { y: yOffset, opacity: 0, filter: "blur(8px)" },
    visible: { y: 0, opacity: 1, filter: "blur(0px)" },
  };
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView || reduced ? "visible" : "hidden"}
      variants={variants}
      transition={
        reduced
          ? { duration: 0 }
          : { delay: 0.05 + delay, duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }
      }
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ---------------- BorderBeam ---------------- */
export function BorderBeam({
  duration = 8,
  delay = 0,
  className,
}: {
  duration?: number | undefined;
  delay?: number | undefined;
  className?: string | undefined;
}) {
  return (
    <span
      className={cn(
        "border-beam pointer-events-none absolute inset-0 rounded-[inherit]",
        className,
      )}
      style={{ animationDuration: `${duration}s`, animationDelay: `${delay}s` }}
      aria-hidden
    />
  );
}

/* ---------------- Spotlight card ---------------- */
export function SpotlightCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string | undefined;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0, active: false });

  function onMove(e: MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top, active: true });
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setPos((p) => ({ ...p, active: false }))}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-card transition-all duration-500 hover:border-ring",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: pos.active
            ? `radial-gradient(340px circle at ${pos.x}px ${pos.y}px, var(--spotlight), transparent 70%)`
            : undefined,
        }}
        aria-hidden
      />
      {/* h-full: the BorderBeam absolutely positions against this box, and a card
          stretched by its grid row would otherwise get its beam drawn inside it. */}
      <div className="relative h-full">{children}</div>
    </div>
  );
}

/* ---------------- Marquee ---------------- */
export function Marquee({
  children,
  reverse,
  className,
  duration = 40,
  pauseOnHover = true,
}: {
  children: ReactNode;
  reverse?: boolean | undefined;
  className?: string | undefined;
  duration?: number | undefined;
  pauseOnHover?: boolean | undefined;
}) {
  return (
    <div
      className={cn(
        "group flex overflow-hidden [--gap:2.5rem]",
        "[mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]",
        className,
      )}
    >
      {[0, 1].map((i) => (
        <div
          key={i}
          className={cn(
            "flex shrink-0 items-center gap-[var(--gap)] pr-[var(--gap)]",
            reverse ? "animate-marquee-reverse" : "animate-marquee",
            pauseOnHover && "group-hover:[animation-play-state:paused]",
          )}
          style={{ animationDuration: `${duration}s` }}
          aria-hidden={i === 1}
        >
          {children}
        </div>
      ))}
    </div>
  );
}

/* ---------------- NumberTicker ---------------- */
export function NumberTicker({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduced = useReducedMotion();
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { damping: 40, stiffness: 90 });

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      if (ref.current) ref.current.textContent = value.toString();
      return;
    }
    mv.set(value);
  }, [inView, mv, value, reduced]);

  useEffect(() => {
    if (reduced) return;
    return spring.on("change", (latest) => {
      if (ref.current) ref.current.textContent = Math.round(latest).toString();
    });
  }, [spring, reduced]);

  return (
    <span ref={ref} className={className}>
      0
    </span>
  );
}

/* ---------------- AnimatedShinyText ---------------- */
export function AnimatedShinyText({
  children,
  className,
}: {
  children: ReactNode;
  className?: string | undefined;
}) {
  return <span className={cn("shiny-text", className)}>{children}</span>;
}

/* ---------------- DotPattern background ---------------- */
export function DotPattern({ className }: { className?: string }) {
  return (
    <div
      className={cn("dot-pattern pointer-events-none absolute inset-0", className)}
      aria-hidden
    />
  );
}

/* ---------------- AnimatedGridPattern ---------------- */
export function AnimatedGridPattern({
  width = 44,
  height = 44,
  x = -1,
  y = -1,
  numSquares = 26,
  maxOpacity = 0.28,
  duration = 4,
  className,
  ...props
}: ComponentPropsWithoutRef<"svg"> & {
  width?: number;
  height?: number;
  numSquares?: number;
  maxOpacity?: number;
  duration?: number;
}) {
  const id = useId();
  const ref = useRef<SVGSVGElement>(null);
  const [dims, setDims] = useState({ width: 0, height: 0 });
  const [squares, setSquares] = useState<{ id: number; pos: [number, number] }[]>([]);

  const getPos = useCallback(
    (): [number, number] => [
      Math.floor((Math.random() * dims.width) / width),
      Math.floor((Math.random() * dims.height) / height),
    ],
    [dims.width, dims.height, width, height],
  );

  useEffect(() => {
    if (!dims.width || !dims.height) return;
    setSquares(Array.from({ length: numSquares }, (_, i) => ({ id: i, pos: getPos() })));
  }, [dims.width, dims.height, numSquares, getPos]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDims({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <svg
      ref={ref}
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 size-full fill-[var(--pattern-dot)] stroke-[var(--pattern-line)]",
        className,
      )}
      {...props}
    >
      <defs>
        <pattern id={id} width={width} height={height} patternUnits="userSpaceOnUse" x={x} y={y}>
          <path d={`M.5 ${height}V.5H${width}`} fill="none" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
      <svg x={x} y={y} className="overflow-visible">
        {squares.map(({ pos: [sx, sy], id: squareId }, index) => (
          <motion.rect
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, maxOpacity, 0] }}
            transition={{
              duration,
              repeat: Infinity,
              delay: index * 0.12,
              repeatType: "reverse",
            }}
            key={`${sx}-${sy}-${squareId}`}
            width={width - 1}
            height={height - 1}
            x={sx * width + 1}
            y={sy * height + 1}
            fill="currentColor"
            strokeWidth="0"
            className="text-foreground"
          />
        ))}
      </svg>
    </svg>
  );
}

/* ---------------- OrbitingCircles ---------------- */
export function OrbitingCircles({
  className,
  children,
  reverse,
  duration = 22,
  radius = 150,
  path = true,
  iconSize = 40,
  speed = 1,
}: {
  className?: string;
  children?: ReactNode;
  reverse?: boolean;
  duration?: number;
  radius?: number;
  path?: boolean;
  iconSize?: number;
  speed?: number;
}) {
  const items = useMemo(() => (Array.isArray(children) ? children : [children]), [children]);
  const reduced = useReducedMotion();
  const calculated = duration / speed;

  return (
    <>
      {path && (
        <svg className="pointer-events-none absolute inset-0 size-full" aria-hidden>
          <circle className="orbit-path fill-none stroke-1" cx="50%" cy="50%" r={radius} />
        </svg>
      )}
      {items.map((child, index) => {
        const angle = (360 / items.length) * index;
        return (
          <div
            key={index}
            style={
              {
                "--duration": calculated,
                "--radius": radius,
                "--angle": angle,
                "--icon-size": `${iconSize}px`,
                // Inline, because `animate-orbit` is the `animation` shorthand and
                // it resets play-state — a utility class loses to it either way.
                ...(reduced ? { animationPlayState: "paused" } : {}),
              } as CSSProperties
            }
            className={cn(
              "animate-orbit absolute left-1/2 top-1/2 flex size-[var(--icon-size)] -translate-x-1/2 -translate-y-1/2 transform-gpu items-center justify-center rounded-full",
              reverse && "[animation-direction:reverse]",
              className,
            )}
          >
            {child}
          </div>
        );
      })}
    </>
  );
}

/* ---------------- Meteors ---------------- */
export function Meteors({ number = 14, className }: { number?: number; className?: string }) {
  const [meteors, setMeteors] = useState<CSSProperties[]>([]);
  const reduced = useReducedMotion();

  // Randomised on the client only, so SSR and hydration agree on an empty field.
  useEffect(() => {
    if (reduced) {
      setMeteors([]);
      return;
    }
    setMeteors(
      Array.from({ length: number }, () => ({
        // Started above the section and left of it: the travel is down-and-right,
        // so a negative left is what puts the streak inside the frame.
        top: `${-20 - Math.floor(Math.random() * 80)}px`,
        left: `${Math.floor(Math.random() * 120) - 40}%`,
        animationDelay: `${(Math.random() * 8).toFixed(2)}s`,
        ["--meteor-duration" as string]: `${(Math.random() * 4 + 5).toFixed(2)}s`,
      })),
    );
  }, [number, reduced]);

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden
    >
      {meteors.map((style, i) => (
        <span
          key={i}
          style={style}
          className="meteor animate-meteor absolute size-[2px] rounded-full"
        />
      ))}
    </div>
  );
}

/* ---------------- ShimmerButton ---------------- */
export function ShimmerButton({
  children,
  className,
  speed = "3s",
  ...props
}: ComponentPropsWithoutRef<"a"> & { speed?: string }) {
  return (
    <a
      {...props}
      style={{ ["--speed" as string]: speed, boxShadow: "var(--glow)", ...props.style }}
      className={cn(
        "shimmer-button group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-medium text-primary-foreground",
        "transition-transform duration-300 hover:scale-[1.03] active:scale-[0.99]",
        className,
      )}
    >
      {/* the travelling spark, clipped to the button's inner edge */}
      <span className="shimmer-spark animate-shimmer-slide -z-30 blur-[2px]">
        <span className="shimmer-spark-inner" />
      </span>
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      <span className="absolute inset-[1px] -z-20 rounded-full bg-primary" />
    </a>
  );
}

/* ---------------- WordRotate ---------------- */
export function WordRotate({
  words,
  duration = 2600,
  className,
}: {
  words: string[];
  duration?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % words.length), duration);
    return () => clearInterval(id);
  }, [words.length, duration, reduced]);

  // No `mode="wait"`: sequencing exit before enter leaves the slot blank for the
  // length of both transitions, which on a 2.6s cycle is a third of the time.
  // Overlapping them in one grid cell crossfades instead — always something legible.
  return (
    <span className="relative inline-grid overflow-hidden py-1 align-bottom">
      <AnimatePresence initial={false}>
        <motion.span
          key={words[index]}
          initial={{ opacity: 0, y: "70%", filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: "-70%", filter: "blur(6px)" }}
          transition={{ duration: 0.42, ease: [0.21, 0.47, 0.32, 0.98] }}
          className={cn("col-start-1 row-start-1", className)}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/* ---------------- TextAnimate (word-by-word reveal) ---------------- */
export function TextAnimate({
  children,
  className,
  delay = 0,
  stagger = 0.06,
  once = true,
}: {
  children: string;
  className?: string;
  delay?: number;
  stagger?: number;
  once?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once, margin: "-40px" });
  const reduced = useReducedMotion();
  const words = children.split(" ");

  return (
    <span ref={ref} className={className}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            initial={
              reduced
                ? { y: 0, opacity: 1, filter: "blur(0px)" }
                : { y: "100%", opacity: 0, filter: "blur(6px)" }
            }
            animate={
              inView || reduced
                ? { y: 0, opacity: 1, filter: "blur(0px)" }
                : { y: "100%", opacity: 0, filter: "blur(6px)" }
            }
            transition={
              reduced
                ? { duration: 0 }
                : { duration: 0.75, delay: delay + i * stagger, ease: [0.21, 0.47, 0.32, 0.98] }
            }
          >
            {word}
          </motion.span>
          {i < words.length - 1 && <span>&nbsp;</span>}
        </span>
      ))}
    </span>
  );
}

/* ---------------- HyperText (scramble-in) ---------------- */
const SCRAMBLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ-_/\\<>[]{}";

export function HyperText({
  children,
  className,
  duration = 900,
}: {
  children: string;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduced = useReducedMotion();
  const [text, setText] = useState(children);

  useEffect(() => {
    if (!inView || reduced) return;

    const steps = children.length;
    const tick = Math.max(duration / (steps || 1), 24);
    let frame = 0;

    const id = setInterval(() => {
      frame += 1;
      setText(
        children
          .split("")
          .map((char, i) =>
            i < frame || char === " "
              ? char
              : (SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)] ?? char),
          )
          .join(""),
      );
      if (frame >= steps) clearInterval(id);
    }, tick);

    return () => clearInterval(id);
  }, [inView, children, duration, reduced]);

  return (
    <span ref={ref} className={cn("tabular", className)}>
      {text}
    </span>
  );
}
