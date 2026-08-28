import {
  siAndroid,
  siDocker,
  siGit,
  siGithub,
  siGnubash,
  siGo,
  siGtk,
  siKde,
  siKotlin,
  siLinux,
  siNextdotjs,
  siOpenjdk,
  siQt,
  siRedis,
  siRust,
  siTailwindcss,
  siTypescript,
  siVulkan,
} from "simple-icons";
import { Boxes, Network, Server, Settings2, TerminalSquare, type LucideIcon } from "lucide-react";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * Tech marks, from Simple Icons.
 *
 * Every glyph is a single path, so the same source renders monochrome (fill
 * `currentColor`, for the stack marquee) or in the project's official colour
 * (for the orbit). Named imports keep this tree-shakeable — the package ships
 * ~3000 icons and only the ones listed here reach the bundle.
 *
 * Simple Icons has no mark for systemd, nftables or Bubble Tea, so those fall
 * back to a Lucide glyph rather than being left blank.
 */

type Mark = { path: string; hex: string; title: string };

/**
 * Simple Icons publishes the colour each brand uses on a *light* background, so
 * several marks are pure black and vanish on this site's dark theme. These are
 * the on-brand light-theme substitutes (Java's orange, Rust's linguist tone);
 * anything else dark enough to disappear is blended toward white instead.
 */
const DARK_OVERRIDE: Record<string, string> = {
  Java: "E76F00",
  Rust: "DEA584",
  "Next.js": "FFFFFF",
  GitHub: "FFFFFF",
};

/** Perceived luminance, 0–1, from a 6-digit hex. */
function luminance(hex: string) {
  const n = parseInt(hex, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function darkHex(name: string, hex: string) {
  const override = DARK_OVERRIDE[name];
  if (override) return override;
  if (luminance(hex) >= 0.22) return hex;

  // Blend 55% toward white — keeps the hue, lifts it off the background.
  const n = parseInt(hex, 16);
  const lift = (c: number) => Math.round(c + (255 - c) * 0.55);
  const channels = [lift((n >> 16) & 255), lift((n >> 8) & 255), lift(n & 255)];
  return channels.map((c) => c.toString(16).padStart(2, "0")).join("");
}

const SI: Record<string, Mark> = {
  Rust: siRust,
  Go: siGo,
  Shell: siGnubash,
  TypeScript: siTypescript,
  Java: siOpenjdk,
  Kotlin: siKotlin,
  QML: siQt,
  Qt: siQt,
  Linux: siLinux,
  GTK4: siGtk,
  Waydroid: siAndroid,
  Vulkan: siVulkan,
  "KDE Plasma": siKde,
  KDE: siKde,
  "Next.js": siNextdotjs,
  Tailwind: siTailwindcss,
  Redis: siRedis,
  Docker: siDocker,
  Git: siGit,
  GitHub: siGithub,
};

const FALLBACK: Record<string, LucideIcon> = {
  nftables: Network,
  systemd: Settings2,
  "Bubble Tea": TerminalSquare,
  GPUI: Boxes,
  Paper: Server,
  Velocity: Network,
};

/**
 * `colored` paints the brand colour; without it the mark inherits `currentColor`
 * so it sits in the monochrome design system like any other glyph.
 */
export function TechIcon({
  name,
  className,
  colored = false,
}: {
  name: string;
  className?: string;
  colored?: boolean;
}) {
  const mark = SI[name];

  if (mark) {
    // Both colours are emitted as custom properties and picked by the `dark`
    // variant, so the icon flips with the theme without re-rendering.
    const colorStyle = colored
      ? ({
          "--si": `#${mark.hex}`,
          "--si-dark": `#${darkHex(name, mark.hex)}`,
        } as CSSProperties)
      : undefined;

    return (
      <svg
        role="img"
        aria-hidden
        viewBox="0 0 24 24"
        style={colorStyle}
        className={cn(
          "size-4 shrink-0",
          colored ? "[fill:var(--si)] dark:[fill:var(--si-dark)]" : "fill-current",
          className,
        )}
      >
        <path d={mark.path} />
      </svg>
    );
  }

  const Fallback = FALLBACK[name];
  if (Fallback) return <Fallback className={cn("size-4 shrink-0", className)} aria-hidden />;
  return null;
}
