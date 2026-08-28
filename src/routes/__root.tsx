import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { ThemeProvider, themeInitScript } from "@/components/theme-provider";
import { LocaleProvider, localeInitScript } from "@/components/locale-provider";
import { EMAIL, GITHUB, OG_IMAGE, SITE_URL, projects } from "@/lib/profile";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "WinTone01 — Systems & Tooling Developer" },
      {
        name: "description",
        content:
          "Portfolio of WinTone01: Linux tooling, Rust desktop apps and Minecraft server engineering.",
      },
      { name: "author", content: "WinTone01" },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
      { name: "googlebot", content: "index, follow, max-image-preview:large" },
      {
        name: "keywords",
        content:
          "WinTone01, Linux tooling, Rust developer, Go developer, DPI bypass, zapret, Unwall, nabız, liwinux, Waydroid, Minecraft server infrastructure, Speaway, Türkiye",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "WinTone01" },
      { property: "og:url", content: SITE_URL },
      { property: "og:locale", content: "en_US" },
      { property: "og:locale:alternate", content: "tr_TR" },
      // summary_large_image without an image renders a blank card, so these
      // four belong together — never declare the card type on its own.
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      {
        property: "og:image:alt",
        content: "WinTone01 — systems, tooling and the last 5%",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: OG_IMAGE },
      { name: "twitter:image:alt", content: "WinTone01 — systems, tooling and the last 5%" },
      { name: "twitter:title", content: "WinTone01 — Linux Systems & Tooling Developer" },
      { name: "theme-color", content: "#141416" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&family=JetBrains+Mono:wght@400;500&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "canonical", href: SITE_URL },
      // One page serving both languages, so both hreflang values point at it.
      { rel: "alternate", hreflang: "en", href: SITE_URL },
      { rel: "alternate", hreflang: "tr", href: SITE_URL },
      { rel: "alternate", hreflang: "x-default", href: SITE_URL },
      { rel: "manifest", href: "/site.webmanifest" },
      { rel: "dns-prefetch", href: "https://api.github.com" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Person",
              "@id": `${SITE_URL}/#person`,
              name: "WinTone01",
              url: SITE_URL,
              image: OG_IMAGE,
              email: `mailto:${EMAIL}`,
              jobTitle: "Systems & Tooling Developer",
              description:
                "Builds Linux systems tooling in Rust, Go and Shell, and game server infrastructure.",
              address: { "@type": "PostalAddress", addressCountry: "TR" },
              sameAs: [GITHUB, "https://github.com/Liwinux-Project", "https://github.com/speaway"],
              knowsLanguage: ["en", "tr"],
              knowsAbout: [
                "Linux",
                "Rust",
                "Go",
                "Systems programming",
                "Network diagnostics",
                "Deep packet inspection",
                "Game server infrastructure",
              ],
              worksFor: {
                "@type": "Organization",
                name: "Speaway",
                url: "https://speaway.com",
              },
            },
            {
              "@type": "WebSite",
              "@id": `${SITE_URL}/#website`,
              url: SITE_URL,
              name: "WinTone01",
              inLanguage: ["en", "tr"],
              publisher: { "@id": `${SITE_URL}/#person` },
            },
            ...projects.slice(0, 5).map((project) => ({
              "@type": "SoftwareSourceCode",
              name: project.name,
              description: project.desc.en,
              codeRepository: project.url,
              programmingLanguage: project.lang,
              ...(project.license ? { license: project.license } : {}),
              author: { "@id": `${SITE_URL}/#person` },
            })),
          ],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script dangerouslySetInnerHTML={{ __html: localeInitScript }} />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LocaleProvider>
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
        </LocaleProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
