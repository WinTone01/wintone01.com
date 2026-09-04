import { describe, expect, test } from "bun:test";
import { summarizeContributions, summarizeLanguages } from "../github.server";

const repo = (langs: Record<string, number>) => ({
  languages: {
    edges: Object.entries(langs).map(([name, size]) => ({ size, node: { name } })),
  },
});

describe("summarizeLanguages", () => {
  test("sums the same language across repositories", () => {
    const [top] = summarizeLanguages([repo({ Rust: 100 }), repo({ Rust: 300, Go: 100 })]);
    expect(top).toEqual({ name: "Rust", bytes: 400, percent: 80 });
  });

  test("orders by bytes and keeps at most six", () => {
    const langs = Object.fromEntries("abcdefgh".split("").map((n, i) => [n, (i + 1) * 10]));
    const out = summarizeLanguages([repo(langs)]);
    expect(out).toHaveLength(6);
    expect(out.map((l) => l.name)).toEqual(["h", "g", "f", "e", "d", "c"]);
  });

  test("percentages stay within a rounding step of 100", () => {
    const out = summarizeLanguages([repo({ a: 1, b: 1, c: 1 })]);
    const sum = out.reduce((t, l) => t + l.percent, 0);
    expect(Math.abs(sum - 100)).toBeLessThanOrEqual(0.3);
  });

  test("no repositories does not divide by zero", () => {
    expect(summarizeLanguages([])).toEqual([]);
  });
});

const days = (entries: [string, number][]) => new Map(entries);

describe("summarizeContributions", () => {
  test("totals everything and this year separately", () => {
    const out = summarizeContributions(
      days([
        ["2025-12-30", 4],
        ["2026-01-02", 6],
        ["2026-01-03", 1],
      ]),
      2026,
      new Date("2026-01-03T12:00:00Z"),
    );
    expect(out.totalContributions).toBe(11);
    expect(out.thisYearContributions).toBe(7);
  });

  test("best day is the highest count, not the latest", () => {
    const out = summarizeContributions(
      days([
        ["2026-01-01", 9],
        ["2026-01-02", 3],
      ]),
      2026,
      new Date("2026-01-02T00:00:00Z"),
    );
    expect(out.bestDay).toEqual({ date: "2026-01-01", count: 9 });
  });

  test("longest streak survives a later, shorter one", () => {
    const out = summarizeContributions(
      days([
        ["2026-01-01", 1],
        ["2026-01-02", 1],
        ["2026-01-03", 1],
        ["2026-01-04", 0],
        ["2026-01-05", 1],
      ]),
      2026,
      new Date("2026-01-05T00:00:00Z"),
    );
    expect(out.longestStreak).toBe(3);
  });

  test("an empty today does not break the current streak", () => {
    const out = summarizeContributions(
      days([
        ["2026-01-01", 2],
        ["2026-01-02", 2],
        ["2026-01-03", 0],
      ]),
      2026,
      new Date("2026-01-03T09:00:00Z"),
    );
    expect(out.currentStreak).toBe(2);
  });

  test("an empty yesterday does break it", () => {
    const out = summarizeContributions(
      days([
        ["2026-01-01", 2],
        ["2026-01-02", 0],
        ["2026-01-03", 5],
      ]),
      2026,
      new Date("2026-01-03T09:00:00Z"),
    );
    expect(out.currentStreak).toBe(1);
  });

  test("the heatmap is a fixed 120-day window ending today", () => {
    const out = summarizeContributions(
      days([["2026-06-01", 7]]),
      2026,
      new Date("2026-06-02T00:00:00Z"),
    );
    expect(out.contributions).toHaveLength(120);
    expect(out.contributions.at(-1)?.date).toBe("2026-06-02");
    expect(out.contributions.at(-2)).toEqual({ date: "2026-06-01", count: 7 });
    // Days with no data are zero, not missing — the grid must not have holes.
    expect(out.contributions.every((d) => typeof d.count === "number")).toBe(true);
  });

  test("dates out of order are sorted before anything is derived", () => {
    const out = summarizeContributions(
      days([
        ["2026-01-03", 1],
        ["2026-01-01", 1],
        ["2026-01-02", 1],
      ]),
      2026,
      new Date("2026-01-03T00:00:00Z"),
    );
    expect(out.longestStreak).toBe(3);
  });
});
