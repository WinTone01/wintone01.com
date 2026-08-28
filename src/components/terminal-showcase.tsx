"use client";

import { ArrowUpRight } from "lucide-react";
import { AnimatedSpan, Terminal, TypingAnimation } from "@/components/magicui/terminal";
import { AnimatedGridPattern, BlurFade, TextAnimate } from "@/components/magicui/effects";
import { useLocale } from "@/components/locale-provider";
import { ui } from "@/lib/i18n";

/**
 * The three tools side by side, in the medium they were built for.
 * Output shapes are taken from each project's own README so nothing here is
 * invented — the score, the kernel verdict and the Vulkan line are real.
 */
export function TerminalShowcase() {
  const { t } = useLocale();

  return (
    <section id="terminal" className="relative mx-auto max-w-6xl px-5 pb-16 sm:px-6 sm:pb-36">
      <AnimatedGridPattern
        numSquares={18}
        maxOpacity={0.16}
        duration={5}
        className="[mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,black,transparent)] inset-y-[-20%] h-[140%] skew-y-6"
      />

      <BlurFade className="relative">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
          {t(ui.terminal.eyebrow)}
        </p>
        <h2 className="mt-4 max-w-2xl text-balance font-display text-3xl font-semibold sm:mt-5 sm:text-5xl">
          <TextAnimate key={t(ui.terminal.title)}>{t(ui.terminal.title)}</TextAnimate>
        </h2>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {t(ui.terminal.body)}
        </p>
      </BlurFade>

      <div className="relative mt-10 grid gap-4 sm:mt-14 sm:gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <BlurFade className="min-w-0">
          <Terminal title="wintone01@arch — nabız" className="h-full">
            <TypingAnimation className="text-muted-foreground">
              $ nabiz test --quick
            </TypingAnimation>
            <AnimatedSpan className="text-ok">✔ Link · 100 Mbit · enp3s0</AnimatedSpan>
            <AnimatedSpan className="text-ok">✔ Internet · 24 ms · p95 31 · loss 0.0%</AnimatedSpan>
            <AnimatedSpan className="text-ok">
              ✔ DNS · DoH and DoT agree · no interference
            </AnimatedSpan>
            <AnimatedSpan className="text-warn">
              ▲ Kernel · retransmit 2.99% · link dropped 39×
            </AnimatedSpan>
            <AnimatedSpan className="text-note">
              → Advice · roll the kernel back to 6.18.42-lts
            </AnimatedSpan>
            <AnimatedSpan className="pt-1 text-foreground">
              Score 72.9 / 100 (B) · full · 106 s
            </AnimatedSpan>

            <TypingAnimation className="pt-3 text-muted-foreground">
              $ nabiz apply --dry-run --safe
            </TypingAnimation>
            <AnimatedSpan className="text-muted-foreground">
              snapshot → ~/.local/share/nabiz/snapshots/20260828-043651
            </AnimatedSpan>
            <AnimatedSpan className="text-ok">
              ✔ 6 changes reversible · connectivity verified after apply
            </AnimatedSpan>
          </Terminal>
        </BlurFade>

        <div className="grid min-w-0 gap-5">
          <BlurFade className="min-w-0" delay={0.1}>
            <Terminal title="wintone01@arch — Unwall">
              <TypingAnimation className="text-muted-foreground">$ unwall status</TypingAnimation>
              <AnimatedSpan className="text-ok">✔ engine · nfqws2 (zapret2)</AnimatedSpan>
              <AnimatedSpan className="text-ok">✔ strategy · TR / Türk Telekom</AnimatedSpan>
              <AnimatedSpan className="text-ok">✔ service · systemd, active (running)</AnimatedSpan>
              <AnimatedSpan className="text-ok">✔ dns · DoH via dnscrypt-proxy :443</AnimatedSpan>
              <AnimatedSpan className="text-note">
                → gateway · sharing to 2 devices on the LAN
              </AnimatedSpan>
            </Terminal>
          </BlurFade>

          <BlurFade className="min-w-0" delay={0.18}>
            <Terminal title="wintone01@arch — liwinux">
              <TypingAnimation className="text-muted-foreground">
                $ liw session start
              </TypingAnimation>
              <AnimatedSpan className="text-ok">
                ✔ GPU · ANGLE over Mesa Venus · Vulkan 1.3.341
              </AnimatedSpan>
              <AnimatedSpan className="text-ok">
                ✔ CPU · libhoudini 14 · arm64-v8a verified
              </AnimatedSpan>
              <AnimatedSpan className="text-ok">
                ✔ input · keymap attached, unbounded aim
              </AnimatedSpan>
              <AnimatedSpan className="text-muted-foreground">
                Android is up. Detached.
              </AnimatedSpan>
            </Terminal>
          </BlurFade>
        </div>
      </div>

      <BlurFade delay={0.1}>
        <div className="relative mt-10 flex justify-center">
          <a
            href="https://github.com/WinTone01/nabiz"
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {t(ui.terminal.cta)}
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>
      </BlurFade>
    </section>
  );
}
