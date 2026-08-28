"use client";

import { useEffect, useRef } from "react";
import { useLiteMode } from "@/hooks/use-perf-tier";
import { cn } from "@/lib/utils";

type Circle = {
  x: number;
  y: number;
  translateX: number;
  translateY: number;
  size: number;
  alpha: number;
  targetAlpha: number;
  dx: number;
  dy: number;
  magnetism: number;
};

/**
 * MagicUI Particles. Two changes from the stock component:
 *  - the colour is read from the `--particle` token at paint time, so the field
 *    flips with the theme without a remount;
 *  - it opts out entirely under `prefers-reduced-motion`.
 */
export function Particles({
  className,
  quantity = 80,
  staticity = 50,
  ease = 50,
  size = 0.5,
  vx = 0,
  vy = 0,
}: {
  className?: string;
  quantity?: number;
  staticity?: number;
  ease?: number;
  size?: number;
  vx?: number;
  vy?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lite = useLiteMode();

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    // A requestAnimationFrame loop plus a window-level mousemove listener, for a
    // field that drifts toward a cursor that does not exist on a touch screen.
    if (lite) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // A 3x display would otherwise ask the GPU for nine times the pixels of a
    // field of dots nobody is looking closely at.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const circles: Circle[] = [];
    const mouse = { x: 0, y: 0 };
    const canvasSize = { w: 0, h: 0 };
    let raf = 0;
    let running = false;
    // Refreshed lazily instead of on every mouse move: `getBoundingClientRect`
    // in a pointer handler forces a layout on each of the hundreds of events a
    // single gesture produces.
    let rect: DOMRect | null = null;
    let rgb = "24, 24, 27";

    const readColor = () => {
      const token = getComputedStyle(document.documentElement)
        .getPropertyValue("--particle")
        .trim();
      if (token) rgb = token;
    };

    const circleParams = (): Circle => ({
      x: Math.floor(Math.random() * canvasSize.w),
      y: Math.floor(Math.random() * canvasSize.h),
      translateX: 0,
      translateY: 0,
      size: Math.floor(Math.random() * 2) + size,
      alpha: 0,
      targetAlpha: parseFloat((Math.random() * 0.5 + 0.1).toFixed(1)),
      dx: (Math.random() - 0.5) * 0.1,
      dy: (Math.random() - 0.5) * 0.1,
      magnetism: 0.1 + Math.random() * 4,
    });

    const drawCircle = (circle: Circle, update = false) => {
      const { x, y, translateX, translateY, size: s, alpha } = circle;
      ctx.translate(translateX, translateY);
      ctx.beginPath();
      ctx.arc(x, y, s, 0, 2 * Math.PI);
      ctx.fillStyle = `rgba(${rgb}, ${alpha})`;
      ctx.fill();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!update) circles.push(circle);
    };

    const resize = () => {
      canvasSize.w = container.offsetWidth;
      canvasSize.h = container.offsetHeight;
      canvas.width = canvasSize.w * dpr;
      canvas.height = canvasSize.h * dpr;
      canvas.style.width = `${canvasSize.w}px`;
      canvas.style.height = `${canvasSize.h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      rect = null;
      circles.length = 0;
      for (let i = 0; i < quantity; i++) drawCircle(circleParams());
    };

    const remap = (value: number, s1: number, e1: number, s2: number, e2: number) => {
      const out = ((value - s1) * (e2 - s2)) / (e1 - s1) + s2;
      return out > 0 ? out : 0;
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvasSize.w, canvasSize.h);
      for (let i = circles.length - 1; i >= 0; i--) {
        const circle = circles[i];
        if (!circle) continue;

        const edge = [
          circle.x + circle.translateX - circle.size,
          canvasSize.w - circle.x - circle.translateX - circle.size,
          circle.y + circle.translateY - circle.size,
          canvasSize.h - circle.y - circle.translateY - circle.size,
        ];
        const closest = Math.min(...edge);
        const remapped = parseFloat(remap(closest, 0, 20, 0, 1).toFixed(2));

        if (remapped > 1) {
          circle.alpha += 0.02;
          if (circle.alpha > circle.targetAlpha) circle.alpha = circle.targetAlpha;
        } else {
          circle.alpha = circle.targetAlpha * remapped;
        }

        circle.x += circle.dx + vx;
        circle.y += circle.dy + vy;
        circle.translateX += (mouse.x / (staticity / circle.magnetism) - circle.translateX) / ease;
        circle.translateY += (mouse.y / (staticity / circle.magnetism) - circle.translateY) / ease;

        drawCircle(circle, true);

        // Recycle a particle once it has drifted out of frame.
        if (
          circle.x < -circle.size ||
          circle.x > canvasSize.w + circle.size ||
          circle.y < -circle.size ||
          circle.y > canvasSize.h + circle.size
        ) {
          circles.splice(i, 1);
          drawCircle(circleParams());
        }
      }
      if (running) raf = window.requestAnimationFrame(animate);
    };

    /*
     * The field lives in the hero, and the page below it is some fourteen
     * thousand pixels tall. Left to itself the loop would keep redrawing ninety
     * circles for the whole time a visitor spends reading the rest of the page,
     * so it only runs while the hero is on screen and the tab is in front.
     */
    const start = () => {
      if (running) return;
      running = true;
      raf = window.requestAnimationFrame(animate);
    };
    const stop = () => {
      running = false;
      window.cancelAnimationFrame(raf);
    };

    let visible = false;
    const sync = () => (visible && !document.hidden ? start() : stop());

    const onMouseMove = (event: MouseEvent) => {
      if (!running) return;
      if (!rect) rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left - canvasSize.w / 2;
      const y = event.clientY - rect.top - canvasSize.h / 2;
      if (Math.abs(x) < canvasSize.w / 2 && Math.abs(y) < canvasSize.h / 2) {
        mouse.x = x;
        mouse.y = y;
      }
    };
    // The cached rect moves with the page, so it is thrown away on scroll and
    // re-read by the next move that needs it.
    const onScroll = () => {
      rect = null;
    };

    readColor();
    resize();

    const themeObserver = new MutationObserver(readColor);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    const viewObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? false;
        sync();
      },
      { rootMargin: "100px" },
    );
    viewObserver.observe(container);
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", sync);

    return () => {
      stop();
      themeObserver.disconnect();
      resizeObserver.disconnect();
      viewObserver.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [quantity, staticity, ease, size, vx, vy, lite]);

  if (lite) return null;

  return (
    <div
      ref={containerRef}
      className={cn("pointer-events-none absolute inset-0", className)}
      aria-hidden
    >
      <canvas ref={canvasRef} className="size-full" />
    </div>
  );
}
