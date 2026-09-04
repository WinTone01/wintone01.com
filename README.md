<div align="center">

# wintone01.com

**Personal site for [@WinTone01](https://github.com/WinTone01)** — Linux systems tooling,
Rust and Go, and game server infrastructure.

[![TanStack Start](https://img.shields.io/badge/TanStack-Start-ef4444?logo=react&logoColor=white)](https://tanstack.com/start)
[![React 19](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=black)](https://react.dev)
[![Tailwind v4](https://img.shields.io/badge/Tailwind-v4-06b6d4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Cloudflare Workers](https://img.shields.io/badge/deploy-Cloudflare%20Workers-f38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com)
[![EN · TR](https://img.shields.io/badge/i18n-EN%20%C2%B7%20TR-9aa4c0)](#bilingual-by-type)

</div>

---

A single-page portfolio built with TanStack Start, React 19, Tailwind CSS v4 and Motion,
using a vendored set of [Magic UI](https://magicui.design) components adapted to its own
design tokens. Light and dark, English and Turkish, and a GitHub panel that reads real
numbers off the API.

## What is interesting in here

Most of this is an ordinary marketing page. These parts are not:

**A live GitHub panel that cannot go blank.** One authenticated GraphQL call covers
repositories, per-language byte counts and the entire contribution history since 2022. It
replaced fifteen REST calls that spent the whole unauthenticated 60-requests/hour budget
in four refreshes — and the events feed those used only reaches back ninety days, so
"busiest day" and "longest streak" were not answerable at all. Results are cached in
Cloudflare's Cache API rather than a module variable, because a Worker isolate is evicted
unpredictably and a plain `let` would miss on almost every request. Underneath all of that
sits a committed snapshot of real numbers, so the section renders real figures on the
first paint and during any outage.

**A terminal that shows real output.** The three tools the site is mostly about —
[Unwall](https://github.com/WinTone01/Unwall), [nabız](https://github.com/WinTone01/nabiz)
and [liwinux](https://github.com/Liwinux-Project/liwinux) — are shown in the medium they
were built for. Every line is output those projects actually print.

**Bilingual by type.** `L10n<T>` is `Record<"en" | "tr", T>`, so both languages are
required by the compiler and a translation cannot silently go missing.

**Motion that actually stands down.** `prefers-reduced-motion` is honoured by the CSS
*and* by every JavaScript-driven animation, through a hook that gets the value right on
the first committed frame — see [the note below](#reduced-motion).

## Content

The copy is data, not markup. Projects, organisations and the stack live in
[`src/lib/profile.ts`](src/lib/profile.ts); UI chrome lives in
[`src/lib/i18n.ts`](src/lib/i18n.ts). Edit those and the whole page follows.

Two rules the content keeps:

- **`projects` is authored work only.** Forks and translation repositories belong in
  `contributions`, which renders separately under "Upstream, not mine". Their owners are
  read from each fork's `parent` on the GitHub API rather than guessed.
- **The GitHub panel excludes forks.** Counting them made the language split report
  whatever the largest fork happened to be written in — Java at 85%, for an account whose
  own work is mostly Rust.

Regenerate the fallback snapshot after a burst of activity:

```sh
GITHUB_TOKEN=$(gh auth token) bun run scripts/github-snapshot.ts
```

## Magic UI components

Vendored under [`src/components/magicui/`](src/components/magicui) rather than installed,
because each one reads its colours from the design tokens in
[`src/styles.css`](src/styles.css) so light and dark stay in sync:

`BlurFade` · `BorderBeam` · `SpotlightCard` · `Marquee` · `NumberTicker` ·
`AnimatedShinyText` · `DotPattern` · `AnimatedGridPattern` · `OrbitingCircles` ·
`Meteors` · `ShimmerButton` · `WordRotate` · `TextAnimate` · `HyperText` · `Particles` ·
`Terminal` (with `TypingAnimation` and `AnimatedSpan`) · `AnimatedThemeToggler`

Tech marks come from [Simple Icons](https://simpleicons.org) via
[`tech-icon.tsx`](src/components/tech-icon.tsx) — monochrome in the stack marquee, in
brand colour in the contributions orbit. Simple Icons publishes each brand's colour for a
*light* background, so several marks are pure black; the component substitutes an on-brand
light tone in dark mode rather than letting them vanish.

## Things that will break if you edit around them

**Project card spans must total a multiple of three.** `span` in `profile.ts` drives the
three-column grid — currently `3 | 2+1 | 2+1 | 1+1+tile`, where the tile is the
"Everything else" card. Add a project without rebalancing and a row is left with a hole.

**`SpotlightCard`'s inner wrapper must keep `h-full`.** `BorderBeam` positions against it,
so at content height a card stretched by its grid row gets its bottom edge drawn part-way
up the card instead of on the border.

**A no-wrap terminal needs `min-w-0` on its grid track.** Grid and flex items default to
`min-width: auto`, so the terminal grows the column to its widest line instead of
scrolling inside it — and `main`'s `overflow-x-hidden` then clips it with no way to reach
the rest.

**Latin identifiers under `lang="tr"` need `lang="en"`.** CSS `text-transform: uppercase`
follows the element's language, and Turkish maps `i` to `İ` — correct for Turkish words,
wrong for `TYPESCRIPT` and `LIWINUX-PROJECT`.

**Tailwind v4 moved `rotate-*` onto the standalone `rotate` property**, so a keyframe that
also rotates now *composes* with the class instead of overriding it. Magic UI's stock
`Meteors` markup relies on the v3 behaviour; keeping the rotation only in the keyframe is
what makes the streaks fall instead of flying off the top of the screen.

<a id="reduced-motion"></a>

**Reduced motion uses [its own hook](src/hooks/use-reduced-motion.ts), not Motion's.**
Motion's `useReducedMotion` seeds `false` for hydration safety and only re-renders when
the query *changes* — so a visitor who already had the preference enabled never triggers
it, and every component reading it during render animates anyway. `useSyncExternalStore`
gets the value right on the first committed frame.

<a id="bilingual-by-type"></a>

**Switching locale re-renders every string at once**, which drops frames on a phone, so
[`locale-provider.tsx`](src/components/locale-provider.tsx) wraps the swap in
`startTransition` and covers it with a brief overlay.

## Email, spam protection and environment

Sending goes through the Mailtrap Email API; receiving is Cloudflare Email Routing. The
contact form is defended by Cloudflare Turnstile plus a soft per-IP rate limit. Every DNS
record, address and environment variable is in
[`docs/email-setup.md`](docs/email-setup.md).

| Variable | What it does |
|---|---|
| `GITHUB_TOKEN` | One GraphQL call for the stats panel. Public data only — a fine-grained token with no scopes is enough. Without it the panel falls back to the snapshot and says so. |
| `MAILTRAP_API_TOKEN` | Contact form delivery. |
| `TURNSTILE_SECRET_KEY` / `VITE_TURNSTILE_SITE_KEY` | Turnstile. Absent = skipped, so local development needs no Cloudflare credentials. |
| `CONTACT_TO_ADDRESS` | Where the form delivers. Defaults to `support@wintone01.com`. |
| `MAILTRAP_SANDBOX_INBOX_ID` | Switches to Mailtrap's sandbox, which captures mail instead of sending it. Set it in development. |

## Deployment

Coolify builds this with Nixpacks. Two things in [`nixpacks.toml`](nixpacks.toml) make that
work and are easy to lose:

| Variable | Why |
|---|---|
| `NITRO_PRESET=node-server` | The vite config defaults Nitro to `cloudflare-module`, which emits a Worker export with no HTTP listener. |
| `PORT` | The port the built server binds. Keep it in step with the port Coolify exposes. |

Without a `start` script Nixpacks decides this is a static site and serves an empty
webroot through Caddy, which answers every request with a 404.

## Development

```sh
bun install
bun run dev
```

`bun run lint` · `bun run test` · `bun run build`

Fonts are self-hosted in `public/fonts`. Re-run `node scripts/fetch-fonts.mjs` after
changing a weight in that script; `public/sitemap.xml` is stamped with the build date
by a plugin in `vite.config.ts`.

## Licence

The code is MIT. The written content and the CV-style copy are not — please do not
republish those as your own.
