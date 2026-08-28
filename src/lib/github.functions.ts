import { createServerFn } from "@tanstack/react-start";
import { fetchGithubStats } from "./github.server";

export const getGithubStats = createServerFn({ method: "GET" }).handler(async () =>
  fetchGithubStats(),
);
