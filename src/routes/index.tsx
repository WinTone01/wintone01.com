import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowUpRight, ExternalLink, Github, LayoutGrid, MapPin, Scale, Star } from "lucide-react";
import {
  AnimatedGridPattern,
  AnimatedShinyText,
  BlurFade,
  BorderBeam,
  DotPattern,
  HyperText,
  Marquee,
  Meteors,
  NumberTicker,
  ShimmerButton,
  SpotlightCard,
  TextAnimate,
  WordRotate,
} from "@/components/magicui/effects";
import { Particles } from "@/components/magicui/particles";
import { TechIcon } from "@/components/tech-icon";
import { useLocale } from "@/components/locale-provider";
import { LocaleToggle } from "@/components/locale-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { GithubStats } from "@/components/github-stats";
import { ContactForm } from "@/components/contact-form";
import { Orgs } from "@/components/orgs";
import { TerminalShowcase } from "@/components/terminal-showcase";
import { MobileNav } from "@/components/mobile-nav";
import { ScrollProgress, BackToTop, useActiveSection } from "@/components/site-chrome";
import { GITHUB, NAV, heroStats, lanes, projects, roles, stack } from "@/lib/profile";
import { ui } from "@/lib/i18n";

/**
 * Grid spans. Below `sm` every card is full width; at `sm` only the lead card is
 * wide, which keeps the two-column rows paired; at `lg` the spans in
 * `profile.ts` apply. The trailing "all repositories" tile fills the last slot
 * so no row is ever left with a hole in it.
 */
const SPAN_CLASS: Record<1 | 2 | 3, string | undefined> = {
  1: undefined,
  2: "lg:col-span-2",
  3: "sm:col-span-2 lg:col-span-3",
};

const DESCRIPTION =
  "WinTone01 builds Linux systems tooling in Rust, Go and Shell — Unwall (DPI bypass), nabız (network diagnostics), liwinux (Android on Linux) — and game server infrastructure at Speaway.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WinTone01 — Linux Systems & Tooling Developer" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "WinTone01 — Linux Systems & Tooling Developer" },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: Portfolio,
});

function Portfolio() {
  const active = useActiveSection(NAV.map((n) => n.id));
  const { t } = useLocale();

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background">
      <ScrollProgress />
      <BackToTop />

      {/* nav */}
      <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-5">
        <motion.nav
          initial={{ y: -24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="glass relative flex w-full max-w-3xl items-center justify-between rounded-full px-2 py-2 pl-4 shadow-[var(--shadow-premium)] sm:px-3 sm:pl-5"
        >
          <span className="font-display text-sm font-semibold tracking-tight">WinTone01</span>
          <div className="hidden items-center gap-0.5 text-sm text-muted-foreground md:flex">
            {NAV.map((n) => (
              <a
                key={n.id}
                href={`#${n.id}`}
                className={`relative rounded-full px-3 py-1.5 transition-colors duration-300 hover:text-foreground ${
                  active === n.id ? "text-foreground" : ""
                }`}
              >
                {active === n.id && (
                  <motion.span
                    layoutId="nav-pill"
                    transition={{ type: "spring", stiffness: 340, damping: 30 }}
                    className="absolute inset-0 -z-10 rounded-full bg-accent"
                  />
                )}
                {t(ui.nav[n.id])}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <LocaleToggle />
            <ThemeToggle />
            <a
              href={GITHUB}
              target="_blank"
              rel="noreferrer"
              className="relative hidden items-center gap-2 overflow-hidden rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-transform duration-300 hover:scale-[1.03] md:flex"
            >
              <Github className="size-4" />
              GitHub
            </a>
            <MobileNav active={active} />
          </div>
        </motion.nav>
      </header>

      {/* hero */}
      <section className="relative flex min-h-[100svh] flex-col items-center justify-center px-5 pt-24 text-center sm:px-6 sm:pt-28">
        <Particles quantity={90} size={0.4} staticity={38} />
        <DotPattern />
        <div
          className="halo-bg pointer-events-none absolute left-1/2 top-[-10%] size-[420px] -translate-x-1/2 rounded-full opacity-70 blur-[70px] sm:size-[720px] sm:blur-[120px]"
          aria-hidden
        />

        <BlurFade delay={0.05}>
          <div className="relative mx-auto flex items-center gap-2 overflow-hidden rounded-full border border-border px-4 py-1.5 text-xs">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-foreground opacity-60" />
              <span className="relative inline-flex size-1.5 rounded-full bg-foreground" />
            </span>
            <AnimatedShinyText className="font-mono uppercase tracking-[0.18em]">
              {t(ui.hero.badge)}
            </AnimatedShinyText>
            <BorderBeam duration={9} />
          </div>
        </BlurFade>

        <BlurFade delay={0.15}>
          <h1 className="mt-7 max-w-4xl text-balance font-display text-[2.7rem] font-semibold leading-[0.95] sm:mt-8 sm:text-7xl md:text-8xl">
            <span className="text-ink">{t(ui.hero.titleTop)}</span>
            <br />
            <span className="text-muted-foreground">{t(ui.hero.titleBottom)}</span>
          </h1>
        </BlurFade>

        <BlurFade delay={0.28}>
          {/* Stacked on phones: the longest role would otherwise rewrap the line
              on every rotation and bounce everything under it. */}
          <p className="mx-auto mt-6 flex max-w-xl flex-col items-center gap-x-2 text-base leading-relaxed text-muted-foreground sm:mt-7 sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-center sm:text-lg">
            <span>{t(ui.hero.buildPrefix)}</span>
            <WordRotate
              words={t(roles)}
              className="whitespace-nowrap font-medium text-foreground"
            />
          </p>
        </BlurFade>

        <BlurFade delay={0.36}>
          <p className="mx-auto mt-3 max-w-lg text-balance text-sm leading-relaxed text-muted-foreground">
            {t(ui.hero.blurb)}
          </p>
        </BlurFade>

        <BlurFade delay={0.46} className="w-full max-w-xs sm:max-w-none">
          <div className="mt-9 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
            <ShimmerButton href="#projects" className="w-full sm:w-auto">
              {t(ui.hero.cta)}
            </ShimmerButton>
            <a
              href={GITHUB}
              target="_blank"
              rel="noreferrer"
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full border border-border px-7 py-3.5 text-sm font-medium transition-colors duration-300 hover:bg-accent sm:w-auto"
            >
              @WinTone01
              <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </BlurFade>

        <BlurFade delay={0.58} className="mt-12 w-full max-w-3xl sm:mt-20">
          <dl className="grid grid-cols-2 divide-x divide-y divide-border border-y border-border sm:grid-cols-4 sm:divide-y-0">
            {heroStats.map((s) => (
              <div key={s.key} className="px-4 py-5 sm:py-6">
                <dd className="font-display text-3xl font-semibold sm:text-4xl">
                  <NumberTicker value={s.n} />
                  <span className="text-muted-foreground">{s.suffix}</span>
                </dd>
                <dt className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  {t(ui.hero.stats[s.key])}
                </dt>
              </div>
            ))}
          </dl>
        </BlurFade>

        <div className="mt-9 flex items-center gap-2 pb-12 text-xs text-muted-foreground sm:mt-10 sm:pb-16">
          <MapPin className="size-3.5" /> Türkiye · @Speaway · @Liwinux-Project
        </div>
      </section>

      {/* stack marquee */}
      <section id="stack" className="relative border-y border-border py-5 sm:py-6">
        <Marquee duration={48}>
          {stack.map((s) => (
            <span
              key={s}
              className="flex items-center gap-2 font-display text-base font-medium text-muted-foreground transition-colors duration-300 hover:text-foreground sm:gap-2.5 sm:text-2xl"
            >
              <TechIcon name={s} className="size-4 sm:size-6" />
              {s}
            </span>
          ))}
        </Marquee>
      </section>

      {/* work */}
      <section id="work" className="relative mx-auto max-w-5xl px-5 py-16 sm:px-6 sm:py-36">
        <BlurFade>
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
            {t(ui.work.eyebrow)}
          </p>
          <h2 className="mt-4 max-w-2xl text-balance font-display text-3xl font-semibold sm:mt-5 sm:text-5xl">
            <TextAnimate key={t(ui.work.title)}>{t(ui.work.title)}</TextAnimate>
          </h2>
        </BlurFade>

        <div className="mt-10 divide-y divide-border border-t border-border sm:mt-16">
          {lanes.map((w, i) => (
            <BlurFade key={w.title.en} delay={i * 0.08}>
              <div className="group grid gap-3 py-8 transition-colors duration-500 sm:grid-cols-[140px_1fr] sm:gap-10">
                <span className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  {t(w.period)}
                </span>
                <div>
                  <h3 className="text-xl font-medium transition-transform duration-500 group-hover:translate-x-1 sm:text-2xl">
                    {t(w.title)}
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {t(w.body)}
                  </p>
                </div>
              </div>
            </BlurFade>
          ))}
        </div>
      </section>

      {/* projects */}
      <section id="projects" className="relative mx-auto max-w-6xl px-5 pb-16 sm:px-6 sm:pb-36">
        <AnimatedGridPattern
          numSquares={14}
          maxOpacity={0.09}
          duration={5}
          className="-z-10 [mask-image:radial-gradient(ellipse_70%_55%_at_50%_35%,black,transparent)] inset-y-[-15%] h-[130%]"
        />

        <BlurFade className="relative">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
            {t(ui.projects.eyebrow)}
          </p>
          <h2 className="mt-4 max-w-2xl text-balance font-display text-3xl font-semibold sm:mt-5 sm:text-5xl">
            <TextAnimate key={t(ui.projects.title)}>{t(ui.projects.title)}</TextAnimate>
          </h2>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t(ui.projects.note)}
          </p>
        </BlurFade>

        <div className="relative mt-10 grid gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {projects.map((p, i) => (
            <BlurFade key={p.name} delay={i * 0.07} className={SPAN_CLASS[p.span]}>
              <SpotlightCard className="h-full">
                <BorderBeam duration={9 + (i % 3) * 2} delay={i * 1.6} />
                <a
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-full flex-col p-5 sm:p-8"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex size-11 items-center justify-center rounded-xl border border-border bg-elevated">
                      <p.icon className="size-5" />
                    </span>
                    <div className="flex items-center gap-3">
                      {p.owner !== "WinTone01" && (
                        <span
                          lang="en"
                          className="rounded-full border border-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
                        >
                          {p.owner}
                        </span>
                      )}
                      {p.stars > 0 && (
                        <span className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
                          <Star className="size-3.5" />
                          {p.stars}
                        </span>
                      )}
                      <ArrowUpRight className="size-5 text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
                    </div>
                  </div>

                  <h3
                    className={
                      p.span === 3
                        ? "mt-7 font-display text-2xl font-semibold sm:mt-8 sm:text-4xl"
                        : "mt-7 font-display text-xl font-semibold sm:mt-8"
                    }
                  >
                    <HyperText>{p.name}</HyperText>
                  </h3>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    {t(p.desc)}
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-2">
                    <span
                      lang="en"
                      className="rounded-full border border-border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
                    >
                      {p.lang}
                    </span>
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-elevated px-3 py-1 font-mono text-[11px] text-muted-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-6 font-mono text-[11px] text-muted-foreground">
                    {p.license && (
                      <span className="flex items-center gap-1.5">
                        <Scale className="size-3" />
                        {p.license}
                      </span>
                    )}
                    {p.live && (
                      <span className="flex items-center gap-1.5">
                        <ExternalLink className="size-3" />
                        {p.live.replace("https://", "").replace(/\/$/, "")}
                      </span>
                    )}
                  </div>
                </a>
              </SpotlightCard>
            </BlurFade>
          ))}

          {/* Completes the last row: 3 | 2+1 | 2+1 | 1+1+this. */}
          <BlurFade delay={projects.length * 0.07} className="sm:col-span-2 lg:col-span-1">
            <SpotlightCard className="h-full">
              <BorderBeam duration={11} delay={projects.length * 1.6} />
              <a
                href={`${GITHUB}?tab=repositories`}
                target="_blank"
                rel="noreferrer"
                className="flex h-full flex-col justify-between p-5 sm:p-8"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="flex size-11 items-center justify-center rounded-xl border border-border bg-elevated">
                    <LayoutGrid className="size-5" />
                  </span>
                  <ArrowUpRight className="size-5 text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
                </div>
                <div className="mt-8">
                  <h3 className="font-display text-xl font-semibold">{t(ui.projects.tileTitle)}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {t(ui.projects.tileBody)}
                  </p>
                </div>
              </a>
            </SpotlightCard>
          </BlurFade>
        </div>
      </section>

      <TerminalShowcase />

      <Orgs />

      <GithubStats />

      {/* contact */}
      <section
        id="contact"
        className="relative overflow-hidden border-t border-border px-5 py-16 sm:px-6 sm:py-32"
      >
        <Meteors number={12} />
        <div
          className="halo-bg pointer-events-none absolute bottom-[-40%] left-1/2 size-[380px] -translate-x-1/2 rounded-full blur-[70px] sm:size-[640px] sm:blur-[130px]"
          aria-hidden
        />
        <BlurFade className="relative mx-auto max-w-3xl text-center">
          <h2 className="text-balance font-display text-4xl font-semibold leading-tight sm:text-6xl">
            <span className="text-ink">{t(ui.contact.titleTop)}</span>{" "}
            <span className="text-muted-foreground">{t(ui.contact.titleBottom)}</span>
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-balance text-muted-foreground">
            {t(ui.contact.body)}
          </p>
          <ShimmerButton href={GITHUB} target="_blank" rel="noreferrer" className="mt-10 px-8 py-4">
            <Github className="size-4" />
            github.com/WinTone01
          </ShimmerButton>
          <ContactForm />
        </BlurFade>
      </section>

      <footer className="border-t border-border px-5 py-8 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
          <span className="font-mono">© {new Date().getFullYear()} WinTone01</span>
          <span className="font-mono">{t(ui.footer.built)}</span>
        </div>
      </footer>
    </main>
  );
}
