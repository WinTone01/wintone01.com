import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "motion/react";
import {
  Activity,
  CalendarCheck,
  Flame,
  GitCommitHorizontal,
  GitFork,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getGithubStats } from "@/lib/github.functions";
import type { GithubStats } from "@/lib/github.server";
import snapshotJson from "@/lib/github.snapshot.json";
import { BlurFade, BorderBeam, NumberTicker, SpotlightCard } from "@/components/magicui/effects";
import { TechIcon } from "@/components/tech-icon";
import { useLocale } from "@/components/locale-provider";
import { fill, ui } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** One headline number with its icon — the shape repeated across the panel. */
function Stat({
  icon: Icon,
  value,
  label,
  note,
  className,
}: {
  icon: LucideIcon;
  value: number;
  label: string;
  note?: string | undefined;
  className?: string | undefined;
}) {
  return (
    <SpotlightCard className={cn("h-full", className)}>
      <div className="flex h-full flex-col p-4 sm:p-6">
        <span className="flex size-9 items-center justify-center rounded-lg border border-border bg-elevated">
          <Icon className="size-4" />
        </span>
        <p className="mt-5 font-display text-3xl font-semibold leading-none sm:text-4xl">
          <NumberTicker value={value} />
        </p>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </p>
        {note && <p className="mt-auto pt-3 text-xs text-muted-foreground">{note}</p>}
      </div>
    </SpotlightCard>
  );
}

/**
 * The build-time snapshot, on the client too.
 *
 * Rendering it as placeholder data means the panel has real numbers in the SSR
 * HTML and from the first paint — it never shows the grid of dashes that made
 * this section look broken whenever the query was slow or the API was down.
 */
const snapshot: GithubStats = { ...(snapshotJson as Omit<GithubStats, "live">), live: false };

export function GithubStats() {
  const { t, locale } = useLocale();
  const fetchStats = useServerFn(getGithubStats);
  const { data: stats = snapshot } = useQuery({
    queryKey: ["github-stats"],
    queryFn: () => fetchStats(),
    staleTime: 1000 * 60 * 30,
    placeholderData: snapshot,
  });

  // The server always answers with real numbers — live, edge-cached, or the
  // build-time snapshot — so there is no empty state to design around, only the
  // brief moment before the query resolves.
  const busiestDate = stats.bestDay.date
    ? new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(stats.bestDay.date))
    : "";

  return (
    <section id="github" className="relative mx-auto max-w-6xl px-6 pb-20 sm:pb-36">
      <BlurFade>
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
          {t(ui.github.eyebrow)}
        </p>
        <h2 className="mt-5 max-w-2xl text-balance font-display text-4xl font-semibold sm:text-5xl">
          {t(ui.github.title)}
        </h2>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {t(ui.github.body)}
        </p>
        {!stats.live && (
          <p className="mt-3 max-w-xl text-xs text-muted-foreground">{t(ui.github.stale)}</p>
        )}
      </BlurFade>

      <div className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
        {/* contributions, all time */}
        <BlurFade className="sm:col-span-2">
          <SpotlightCard className="h-full">
            <BorderBeam duration={12} />
            <div className="flex h-full flex-col p-6 sm:p-8">
              <div className="flex items-center gap-2">
                <GitCommitHorizontal className="size-4" />
                <h3 className="font-display text-lg font-semibold">{t(ui.github.contributions)}</h3>
              </div>
              <p className="mt-6 font-display text-6xl font-semibold leading-none sm:text-7xl">
                <NumberTicker value={stats.totalContributions} />
              </p>
              <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                {t(ui.github.contributionsNote)}
              </p>

              <div className="mt-auto pt-8">
                <div className="flex flex-wrap gap-[3px]">
                  {stats.contributions.map((day, i) => (
                    <motion.span
                      key={day.date}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.003, duration: 0.3 }}
                      title={`${day.date}: ${day.count}`}
                      className="size-[9px] rounded-[2px] bg-primary"
                      style={{ opacity: Math.min(0.1 + day.count * 0.12, 1) }}
                    />
                  ))}
                </div>
                <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {t(ui.github.heatmap)}
                </p>
              </div>
            </div>
          </SpotlightCard>
        </BlurFade>

        <BlurFade delay={0.06}>
          <Stat
            icon={Trophy}
            value={stats.bestDay.count}
            label={t(ui.github.bestDay)}
            note={busiestDate ? `${t(ui.github.bestDayNote)} · ${busiestDate}` : undefined}
          />
        </BlurFade>

        <BlurFade delay={0.12}>
          <Stat
            icon={Flame}
            value={stats.longestStreak}
            label={t(ui.github.longestStreak)}
            note={t(ui.github.days)}
          />
        </BlurFade>

        <BlurFade delay={0.18}>
          <Stat
            icon={CalendarCheck}
            value={stats.activeDays}
            label={t(ui.github.activeDays)}
            note={t(ui.github.days)}
          />
        </BlurFade>

        <BlurFade delay={0.22}>
          <Stat
            icon={Activity}
            value={stats.thisYearContributions}
            label={t(ui.github.thisYear)}
            note={t(ui.github.contributionsShort)}
          />
        </BlurFade>

        <BlurFade delay={0.26}>
          <Stat icon={Star} value={stats.stars} label={t(ui.github.stars)} />
        </BlurFade>

        <BlurFade delay={0.3}>
          <Stat icon={Users} value={stats.followers} label={t(ui.github.followers)} />
        </BlurFade>
      </div>

      <div className="mt-4 grid gap-4 sm:mt-5 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
        <BlurFade delay={0.1} className="sm:col-span-2 lg:col-span-3">
          <SpotlightCard className="h-full">
            <div className="p-6 sm:p-8">
              <h3 className="font-display text-lg font-semibold">{t(ui.github.languages)}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {fill(t(ui.github.languagesNote), stats.authoredRepos)}
              </p>

              <div className="mt-8 space-y-5">
                {stats.languages.map((lang, i) => (
                  <div key={lang.name}>
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="flex items-center gap-2 font-medium">
                        <TechIcon name={lang.name} colored className="size-4" />
                        <span lang="en">{lang.name}</span>
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {lang.percent}%
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <motion.div
                        className="h-full rounded-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${lang?.percent}%` }}
                        transition={{
                          duration: 1.1,
                          delay: 0.1 * i,
                          ease: [0.21, 0.47, 0.32, 0.98],
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SpotlightCard>
        </BlurFade>

        <BlurFade delay={0.16} className="sm:col-span-2 lg:col-span-1">
          <div className="grid h-full gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-1">
            <Stat icon={GitFork} value={stats.forks} label={t(ui.github.forks)} />
            <Stat
              icon={GitCommitHorizontal}
              value={stats.authoredRepos}
              label={t(ui.github.repos)}
            />
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
