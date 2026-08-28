import snapshot from "./github.snapshot.json";

const USER = "WinTone01";
/** Organisation whose repositories WinTone01 authors — counted as own work. */
const ORG = "Liwinux-Project";
const ACCOUNT_CREATED_YEAR = 2022;
const GRAPHQL = "https://api.github.com/graphql";

export type ContributionDay = { date: string; count: number };

export type GithubStats = {
  publicRepos: number;
  /** Non-fork repositories across the account and the organisation it authors in. */
  authoredRepos: number;
  followers: number;
  stars: number;
  forks: number;
  languages: { name: string; percent: number; bytes: number }[];
  /** Contributions since the account was created, not a rolling window. */
  totalContributions: number;
  /** Current calendar year — a number that stays strong on a quiet morning. */
  thisYearContributions: number;
  bestDay: ContributionDay;
  longestStreak: number;
  currentStreak: number;
  activeDays: number;
  /** Trailing window for the heatmap. */
  contributions: ContributionDay[];
  generatedAt: string;
  /** False when the numbers came from the build-time snapshot. */
  live: boolean;
};

const HEATMAP_DAYS = 119;

type RepoNode = {
  name: string;
  stargazerCount: number;
  forkCount: number;
  languages: { edges: { size: number; node: { name: string } }[] };
};

type Calendar = {
  contributionCalendar: {
    totalContributions: number;
    weeks: { contributionDays: { date: string; contributionCount: number }[] }[];
  };
};

/**
 * One request for everything.
 *
 * The REST version needed fifteen — a user call, two repository listings, an
 * events feed and a `/languages` call per repository — which spent the whole
 * unauthenticated 60/hour budget in four refreshes and left the panel empty
 * most of the time. GraphQL also reaches the full contribution history; the
 * events feed only goes back about ninety days, so "best day" and "longest
 * streak" were not answerable at all before.
 */
function buildQuery(years: number[]) {
  const calendars = years
    .map(
      (y) =>
        `    y${y}: contributionsCollection(from: "${y}-01-01T00:00:00Z", to: "${y}-12-31T23:59:59Z") { contributionCalendar { totalContributions weeks { contributionDays { date contributionCount } } } }`,
    )
    .join("\n");

  return `query($login: String!, $org: String!) {
  user(login: $login) {
    followers { totalCount }
    repositories(first: 100, ownerAffiliations: OWNER, isFork: false, privacy: PUBLIC) {
      totalCount
      nodes { name stargazerCount forkCount languages(first: 12) { edges { size node { name } } } }
    }
${calendars}
  }
  organization(login: $org) {
    repositories(first: 100, isFork: false, privacy: PUBLIC) {
      nodes { name stargazerCount forkCount languages(first: 12) { edges { size node { name } } } }
    }
  }
}`;
}

function isoDay(d: Date) {
  return d.toISOString().slice(0, 10);
}

async function loadGithubStats(token: string): Promise<GithubStats> {
  const currentYear = new Date().getUTCFullYear();
  const years: number[] = [];
  for (let y = ACCOUNT_CREATED_YEAR; y <= currentYear; y++) years.push(y);

  const response = await fetch(GRAPHQL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "wintone01-portfolio",
    },
    body: JSON.stringify({ query: buildQuery(years), variables: { login: USER, org: ORG } }),
  });

  if (!response.ok) {
    throw new Error(`GitHub GraphQL failed [${response.status}]: ${await response.text()}`);
  }

  const payload = (await response.json()) as {
    data?: {
      user: {
        followers: { totalCount: number };
        repositories: { totalCount: number; nodes: RepoNode[] };
      } & Record<string, unknown>;
      organization: { repositories: { nodes: RepoNode[] } } | null;
    };
    errors?: { message: string }[];
  };

  if (payload.errors?.length || !payload.data) {
    throw new Error(`GitHub GraphQL errors: ${JSON.stringify(payload.errors ?? "no data")}`);
  }

  const user = payload.data.user;
  const orgRepos = payload.data.organization?.repositories.nodes ?? [];
  const repos = [...user.repositories.nodes, ...orgRepos];

  const stars = repos.reduce((sum, r) => sum + r.stargazerCount, 0);
  const forks = repos.reduce((sum, r) => sum + r.forkCount, 0);

  const byLang = new Map<string, number>();
  for (const repo of repos) {
    for (const edge of repo.languages.edges) {
      byLang.set(edge.node.name, (byLang.get(edge.node.name) ?? 0) + edge.size);
    }
  }
  const totalBytes = [...byLang.values()].reduce((a, b) => a + b, 0) || 1;
  const languages = [...byLang.entries()]
    .map(([name, bytes]) => ({
      name,
      bytes,
      percent: Math.round((bytes / totalBytes) * 1000) / 10,
    }))
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 6);

  // Flatten every year's calendar into one date -> count map.
  const byDate = new Map<string, number>();
  for (const year of years) {
    const calendar = user[`y${year}`] as Calendar | undefined;
    if (!calendar) continue;
    for (const week of calendar.contributionCalendar.weeks) {
      for (const day of week.contributionDays) {
        byDate.set(day.date, day.contributionCount);
      }
    }
  }

  const ordered = [...byDate.entries()].sort(([a], [b]) => a.localeCompare(b));
  const totalContributions = ordered.reduce((sum, [, count]) => sum + count, 0);
  const thisYearPrefix = `${currentYear}-`;
  const thisYearContributions = ordered
    .filter(([date]) => date.startsWith(thisYearPrefix))
    .reduce((sum, [, count]) => sum + count, 0);

  let bestDay: ContributionDay = { date: "", count: 0 };
  let longestStreak = 0;
  let running = 0;
  for (const [date, count] of ordered) {
    if (count > bestDay.count) bestDay = { date, count };
    running = count > 0 ? running + 1 : 0;
    if (running > longestStreak) longestStreak = running;
  }

  // Today counts only if it already has activity, so an unfinished day does not
  // read as a broken streak.
  let currentStreak = 0;
  for (let i = ordered.length - 1; i >= 0; i--) {
    const entry = ordered[i];
    if (!entry) break;
    if (entry[1] > 0) currentStreak++;
    else if (i !== ordered.length - 1) break;
  }

  const today = new Date();
  const contributions: ContributionDay[] = [];
  for (let i = HEATMAP_DAYS; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const key = isoDay(d);
    contributions.push({ date: key, count: byDate.get(key) ?? 0 });
  }

  return {
    publicRepos: user.repositories.totalCount,
    authoredRepos: repos.length,
    followers: user.followers.totalCount,
    stars,
    forks,
    languages,
    totalContributions,
    thisYearContributions,
    bestDay,
    longestStreak,
    currentStreak,
    activeDays: ordered.filter(([, count]) => count > 0).length,
    contributions,
    generatedAt: new Date().toISOString(),
    live: true,
  };
}

const TTL_MS = 1000 * 60 * 30;
const CACHE_KEY = "https://portfolio.local/__github-stats";

let cached: { at: number; data: GithubStats } | null = null;
let inFlight: Promise<GithubStats> | null = null;

/**
 * Cloudflare's Cache API, when running on Workers.
 *
 * A module-scope variable is per-isolate there, and isolates are evicted
 * unpredictably — on a low-traffic site almost every request would land on a
 * cold one. `caches.default` is shared across the isolates in a colo.
 */
async function edgeCache(): Promise<Cache | null> {
  try {
    if (typeof caches === "undefined") return null;
    const store = (caches as CacheStorage & { default?: Cache }).default;
    return store ?? (await caches.open("github-stats"));
  } catch {
    return null;
  }
}

async function readEdge(): Promise<GithubStats | null> {
  const cache = await edgeCache();
  if (!cache) return null;
  try {
    const hit = await cache.match(CACHE_KEY);
    return hit ? ((await hit.json()) as GithubStats) : null;
  } catch {
    return null;
  }
}

async function writeEdge(data: GithubStats) {
  const cache = await edgeCache();
  if (!cache) return;
  try {
    await cache.put(
      CACHE_KEY,
      new Response(JSON.stringify(data), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": `max-age=${TTL_MS / 1000}`,
        },
      }),
    );
  } catch {
    /* caching is best-effort — a failure here must not fail the request */
  }
}

/** Real numbers captured at build time, so the panel is never empty. */
const fallback: GithubStats = { ...(snapshot as Omit<GithubStats, "live">), live: false };

/**
 * Four layers: in-isolate value, shared edge cache, GitHub, build-time snapshot.
 *
 * That last one is what makes this section reliable. It used to render a grid of
 * dashes whenever the API was unreachable or rate-limited — which, on a shared
 * Workers egress IP with no token, was most of the time.
 */
export async function fetchGithubStats(): Promise<GithubStats> {
  if (cached && Date.now() - cached.at < TTL_MS) return cached.data;
  if (inFlight) return inFlight;

  const token = process.env["GITHUB_TOKEN"]?.trim();

  inFlight = (async () => {
    const fromEdge = await readEdge();
    if (fromEdge) {
      cached = { at: Date.now(), data: fromEdge };
      return fromEdge;
    }

    if (!token) return fallback;

    const data = await loadGithubStats(token);
    cached = { at: Date.now(), data };
    await writeEdge(data);
    return data;
  })()
    .catch((error: unknown) => {
      console.error("GitHub stats refresh failed:", error);
      return cached?.data ?? fallback;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}
