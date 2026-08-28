"use client";

import { ArrowUpRight, Building2, Check, Globe, MapPin } from "lucide-react";
import {
  BlurFade,
  BorderBeam,
  Marquee,
  OrbitingCircles,
  SpotlightCard,
  TextAnimate,
} from "@/components/magicui/effects";
import { TechIcon } from "@/components/tech-icon";
import { contributions, orgs } from "@/lib/profile";
import { useLocale } from "@/components/locale-provider";
import { ui } from "@/lib/i18n";

export function Orgs() {
  const { t } = useLocale();

  return (
    <section id="orgs" className="relative mx-auto max-w-6xl px-6 pb-28 sm:pb-36">
      <BlurFade>
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
          {t(ui.orgs.eyebrow)}
        </p>
        <h2 className="mt-5 max-w-2xl text-balance font-display text-4xl font-semibold sm:text-5xl">
          <TextAnimate key={t(ui.orgs.title)}>{t(ui.orgs.title)}</TextAnimate>
        </h2>
      </BlurFade>

      <div className="mt-14 grid gap-5 lg:grid-cols-2">
        {orgs.map((org, i) => (
          <BlurFade key={org.handle} delay={i * 0.1}>
            <SpotlightCard className="h-full">
              <BorderBeam duration={12} delay={i * 3} />
              <div className="flex h-full flex-col p-7 sm:p-9">
                <div className="flex items-start justify-between gap-4">
                  <span className="flex size-11 items-center justify-center rounded-xl border border-border bg-elevated">
                    <Building2 className="size-5" />
                  </span>
                  <a
                    href={org.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group/link flex items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {org.handle}
                    <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                  </a>
                </div>

                <h3 className="mt-8 font-display text-2xl font-semibold sm:text-3xl">{org.name}</h3>
                <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  {t(org.role)}
                </p>

                <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{t(org.blurb)}</p>

                <ul className="mt-6 space-y-2.5">
                  {t(org.work).map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-relaxed">
                      <Check className="mt-[3px] size-3.5 shrink-0 text-muted-foreground" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-8 font-mono text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-3.5" />
                    {org.location}
                  </span>
                  {org.site && (
                    <a
                      href={org.site}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 transition-colors hover:text-foreground"
                    >
                      <Globe className="size-3.5" />
                      {org.site.replace("https://", "")}
                    </a>
                  )}
                  <span className="ml-auto">{t(org.meta)}</span>
                </div>
              </div>
            </SpotlightCard>
          </BlurFade>
        ))}
      </div>

      {/* Upstream work — orbiting the point that this is other people's code. */}
      <BlurFade delay={0.12}>
        <div className="relative mt-5 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="grid items-center gap-8 p-7 sm:p-9 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="min-w-0">
              <h3 className="font-display text-xl font-semibold">{t(ui.orgs.upstreamTitle)}</h3>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                {t(ui.orgs.upstreamBody)}
              </p>
              <div className="mt-7">
                <Marquee duration={40}>
                  {contributions.map((repo) => (
                    <a
                      key={`${repo.owner}/${repo.name}`}
                      href={`https://github.com/${repo.owner}/${repo.name}`}
                      target="_blank"
                      rel="noreferrer"
                      title={`${repo.owner}/${repo.name}`}
                      className="group/repo flex items-center gap-2 rounded-full border border-border bg-elevated py-2 pl-3 pr-2.5 font-mono text-xs text-muted-foreground transition-colors duration-300 hover:border-ring hover:text-foreground"
                    >
                      <TechIcon name={repo.tech} colored className="size-3.5" />
                      <span lang="en">{repo.name}</span>
                      <ArrowUpRight className="size-3.5 opacity-50 transition-all duration-300 group-hover/repo:translate-x-0.5 group-hover/repo:-translate-y-0.5 group-hover/repo:opacity-100" />
                    </a>
                  ))}
                </Marquee>
              </div>
            </div>

            {/* The languages these upstream repositories are actually written in,
                in their own colours — the one place the monochrome system gives way. */}
            <div className="relative hidden h-[280px] items-center justify-center lg:flex">
              <OrbitingCircles radius={110} duration={26} iconSize={44}>
                {["Java", "Kotlin", "QML", "Linux"].map((tech) => (
                  <span
                    key={tech}
                    title={tech}
                    className="flex size-11 items-center justify-center rounded-full border border-border bg-elevated transition-transform duration-300 hover:scale-110"
                  >
                    <TechIcon name={tech} colored className="size-5" />
                  </span>
                ))}
              </OrbitingCircles>
              <OrbitingCircles radius={58} duration={18} iconSize={36} reverse>
                {["Shell", "KDE", "Git"].map((tech) => (
                  <span
                    key={tech}
                    title={tech}
                    className="flex size-9 items-center justify-center rounded-full border border-border bg-card transition-transform duration-300 hover:scale-110"
                  >
                    <TechIcon name={tech} colored className="size-4" />
                  </span>
                ))}
              </OrbitingCircles>
              <span className="flex size-12 items-center justify-center rounded-full border border-border bg-elevated">
                <TechIcon name="GitHub" className="size-6 text-foreground" />
              </span>
            </div>
          </div>
        </div>
      </BlurFade>
    </section>
  );
}
