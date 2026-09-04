// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { writeFileSync } from "node:fs";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import type { Plugin } from "vite";

const SITE_URL = "https://wintone01.com";

/**
 * Stamps `public/sitemap.xml` with the build date.
 *
 * `lastmod` used to be a date typed into the file by hand, which is a value
 * that is wrong the day after anyone forgets it. This runs inside the build
 * rather than as a `prebuild` script so it does not care whether the deploy
 * container has node, bun or neither on its PATH.
 */
function sitemapPlugin(): Plugin {
  return {
    name: "wintone-sitemap",
    apply: "build",
    buildStart() {
      const lastmod = new Date().toISOString().slice(0, 10);
      writeFileSync(
        new URL("./public/sitemap.xml", import.meta.url),
        `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>${SITE_URL}/</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}/"/>
    <xhtml:link rel="alternate" hreflang="tr" href="${SITE_URL}/"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}/"/>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`,
      );
    },
  };
}

export default defineConfig({
  plugins: [sitemapPlugin()],
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
