"use client";

import { useEffect, useRef } from "react";
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

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const circles: Circle[] = [];
    const mouse = { x: 0, y: 0 };
    const canvasSize = { w: 0, h: 0 };
    let raf = 0;
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
      raf = window.requestAnimationFrame(animate);
    };

    const onMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left - canvasSize.w / 2;
      const y = event.clientY - rect.top - canvasSize.h / 2;
      if (Math.abs(x) < canvasSize.w / 2 && Math.abs(y) < canvasSize.h / 2) {
        mouse.x = x;
        mouse.y = y;
      }
    };

    readColor();
    resize();
    animate();

    const themeObserver = new MutationObserver(readColor);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    window.addEventListener("mousemove", onMouseMove);

    return () => {
      window.cancelAnimationFrame(raf);
      themeObserver.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [quantity, staticity, ease, size, vx, vy]);

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
