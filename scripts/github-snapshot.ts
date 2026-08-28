/**
 * Regenerates `src/lib/github.snapshot.json` — the build-time fallback the live
 * GitHub panel falls back to when the API is unreachable or no token is set.
 *
 *   GITHUB_TOKEN=$(gh auth token) bun run scripts/github-snapshot.ts
 *
 * Committing the output is deliberate: it is public data, and it is what keeps
 * the section from rendering an empty grid on a cold deploy.
 */
import { fetchGithubStats } from "../src/lib/github.server";

const token = process.env["GITHUB_TOKEN"]?.trim();
if (!token) {
  console.error(
    "GITHUB_TOKEN is required. Try: GITHUB_TOKEN=$(gh auth token) bun run scripts/github-snapshot.ts",
  );
  process.exit(1);
}

const stats = await fetchGithubStats();
if (!stats.live) {
  console.error("Refused to write: the fetch fell back to the existing snapshot.");
  process.exit(1);
}

const { live: _live, ...persisted } = stats;
await Bun.write("src/lib/github.snapshot.json", JSON.stringify(persisted, null, 2) + "\n");
console.log(
  `snapshot written — ${persisted.totalContributions} contributions, best day ${persisted.bestDay.count} on ${persisted.bestDay.date}, longest streak ${persisted.longestStreak}d`,
);
