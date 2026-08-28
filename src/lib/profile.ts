/**
 * Single source of truth for the portfolio copy.
 *
 * Everything here was read off the GitHub API and the projects' own READMEs on
 * 2026-08-28 — repository names, languages, licences and star counts included.
 * Forks are deliberately absent from `projects`: that section claims authorship,
 * so only original work belongs in it. Contributions to other people's projects
 * live in `contributions` instead.
 *
 * The Speaway repositories are private, so the entry describes the kind of work
 * rather than naming them.
 */

import { Boxes, Cpu, Gamepad2, Radio, Shield, Terminal, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { L10n } from "./i18n";

export const SITE_URL = "https://wintone01.com";
export const OG_IMAGE = `${SITE_URL}/og.png`;
export const GITHUB_USER = "WinTone01";
/** Public repository count. Single-sourced — it appears in three places. */
export const PUBLIC_REPOS = 35;
export const GITHUB = `https://github.com/${GITHUB_USER}`;
/** Public contact address — routed to a real inbox by Cloudflare Email Routing. */
export const EMAIL = "support@wintone01.com";

export type Project = {
  name: string;
  owner: string;
  desc: L10n;
  lang: string;
  license?: string;
  stars: number;
  url: string;
  live?: string;
  icon: LucideIcon;
  /**
   * Columns the card occupies in the 3-column grid. The spans below plus the
   * trailing "all repositories" tile must stay a multiple of 3, or the grid
   * leaves a hole — which is exactly what `featured`/`wide` booleans used to do.
   * Current tiling: 3 | 2+1 | 2+1 | 1+1+tile.
   */
  span: 1 | 2 | 3;
  tags: string[];
};

export const projects: Project[] = [
  {
    name: "liwinux",
    owner: "Liwinux-Project",
    desc: {
      en: "An Android gaming layer for Linux — what GameLoop is on Windows. It sets up GPU acceleration through ANGLE over Mesa Venus, installs and verifies libhoudini arm64 translation, scripts the LineageOS 20 GAPPS rebuild, repairs the DNS the container quietly loses, restarts a wedged audio HAL instead of all of Android, and keeps the Waydroid session alive detached from any terminal. Then it measures whether any of it helped.",
      tr: "Linux için bir Android oyun katmanı — Windows'taki GameLoop neyse o. ANGLE üzerinden Mesa Venus ile GPU hızlandırmayı kurar, libhoudini arm64 çevirisini kurup doğrular, LineageOS 20 GAPPS yeniden derlemesini betikler, konteynerin sessizce kaybettiği DNS'i onarır, kilitlenen ses HAL'ını Android'in tamamı yerine tek başına yeniden başlatır ve Waydroid oturumunu terminalden bağımsız ayakta tutar. Sonra da bunların işe yarayıp yaramadığını ölçer.",
    },
    lang: "Rust",
    license: "GPL-3.0",
    stars: 0,
    url: "https://github.com/Liwinux-Project/liwinux",
    icon: Gamepad2,
    span: 3,
    tags: ["Waydroid", "Vulkan", "libhoudini", "frame timing"],
  },
  {
    name: "Unwall",
    owner: GITHUB_USER,
    desc: {
      en: "A Linux control panel for the zapret / zapret2 DPI-bypass engines. Carrier presets, blockcheck, hostlist management, a systemd service, LAN gateway mode and one-switch encrypted DNS — behind a GTK4 interface that never runs as root.",
      tr: "zapret / zapret2 DPI atlatma motorları için bir Linux kontrol paneli. Operatör hazır ayarları, blockcheck, hostlist yönetimi, systemd servisi, LAN ağ geçidi modu ve tek anahtarla şifreli DNS — hiçbir zaman root çalışmayan bir GTK4 arayüzünün arkasında.",
    },
    lang: "Shell",
    license: "GPL-3.0",
    stars: 8,
    url: "https://github.com/WinTone01/Unwall",
    icon: Shield,
    span: 2,
    tags: ["nfqws", "nftables", "systemd", "GTK4", "DoH/DoT"],
  },
  {
    name: "postillion",
    owner: GITHUB_USER,
    desc: {
      en: "Control your coding agents — Claude Code, Codex, Cursor, Grok, Hermes, Pi — from one desktop client. Local-first by default: no account, no network, sessions on the device. Optional sync only ever points at a server you run yourself.",
      tr: "Kodlama ajanlarını tek bir masaüstü istemciden yönet — Claude Code, Codex, Cursor, Grok, Hermes, Pi. Varsayılan olarak yerel: hesap yok, ağ yok, oturumlar cihazda. İsteğe bağlı senkron yalnızca kendi kurduğun sunucuya bakar.",
    },
    lang: "Rust",
    license: "MIT",
    stars: 3,
    url: "https://github.com/WinTone01/postillion",
    icon: Cpu,
    span: 1,
    tags: ["GPUI", "daemon", "self-hosted"],
  },
  {
    name: "nabız",
    owner: GITHUB_USER,
    desc: {
      en: "Internet stability measured all the way down: seven test suites, physical link through TCP counters to netfilter and sysctl. It tells a driver regression from a broken cable — a real bug it found on the machine it was written on — and applies the fix behind a snapshot, a generated undo script and an automatic rollback.",
      tr: "İnternet kararlılığını en dibe kadar ölçer: yedi test paketi, fiziksel bağlantıdan TCP sayaçlarına, oradan netfilter ve sysctl'e. Sürücü regresyonunu kopuk kablodan ayırt eder — yazıldığı makinede bulduğu gerçek bir hata — ve düzeltmeyi bir anlık görüntü, üretilmiş bir geri alma betiği ve otomatik geri dönüşün arkasında uygular.",
    },
    lang: "Go",
    license: "GPL-3.0",
    stars: 0,
    url: "https://github.com/WinTone01/nabiz",
    icon: Radio,
    span: 2,
    tags: ["Bubble Tea", "TUI", "bpftune", "no root"],
  },
  {
    name: "liwinux-keymapper",
    owner: "Liwinux-Project",
    desc: {
      en: "The input engine behind liwinux: host keyboard and mouse into Android touch, with unbounded FPS aim because it writes straight to the FIFO where nothing clamps coordinates. 118 tests, and it knows nothing about Waydroid, D-Bus or systemd.",
      tr: "liwinux'un arkasındaki giriş motoru: klavye ve fareyi Android dokunuşuna çevirir, sınırsız FPS nişan ile — çünkü koordinatları hiçbir katmanın kırpmadığı FIFO'ya doğrudan yazar. 118 test, ve Waydroid, D-Bus ya da systemd hakkında hiçbir şey bilmiyor.",
    },
    lang: "Rust",
    license: "GPL-3.0",
    stars: 0,
    url: "https://github.com/Liwinux-Project/liwinux-keymapper",
    icon: Terminal,
    span: 1,
    tags: ["input", "state machine", "118 tests"],
  },
  {
    name: "schooldashboard",
    owner: GITHUB_USER,
    desc: {
      en: "A school TV dashboard running fullscreen on a display in the hall: class schedules, watch duty, a server-synced clock and an exam overlay.",
      tr: "Koridordaki ekranda tam ekran çalışan bir okul TV panosu: ders programı, nöbet listesi, sunucuyla senkron saat ve sınav kaplaması.",
    },
    lang: "TypeScript",
    stars: 0,
    url: "https://github.com/WinTone01/schooldashboard",
    live: "https://myschoolpanel.vercel.app/",
    icon: Boxes,
    span: 1,
    tags: ["Next.js 16", "React 19", "Tailwind"],
  },
  {
    name: "PriceCardGallery",
    owner: GITHUB_USER,
    desc: {
      en: "Nineteen pricing card designs, each a self-contained component — a reference sheet for the layout problem everyone re-solves from scratch.",
      tr: "On dokuz fiyat kartı tasarımı, her biri kendi içinde bağımsız bir bileşen — herkesin sıfırdan yeniden çözdüğü yerleşim problemi için bir referans sayfası.",
    },
    lang: "TypeScript",
    stars: 0,
    url: "https://github.com/WinTone01/PriceCardGallery",
    icon: Wrench,
    span: 1,
    tags: ["Next.js", "Tailwind", "19 designs"],
  },
];

export type Org = {
  name: string;
  handle: string;
  url: string;
  site?: string;
  location: string;
  role: L10n;
  blurb: L10n;
  work: L10n<string[]>;
  meta: L10n;
};

export const orgs: Org[] = [
  {
    name: "Speaway",
    handle: "@speaway",
    url: "https://github.com/speaway",
    site: "https://speaway.com",
    location: "United Kingdom",
    role: {
      en: "Game infrastructure engineer",
      tr: "Oyun altyapısı mühendisi",
    },
    blurb: {
      en: "High-performance solutions for game servers, and the platform around them. Most of the codebase is private, so what follows is the shape of the work rather than a repository list.",
      tr: "Oyun sunucuları için yüksek performanslı çözümler ve etraflarındaki platform. Kod tabanının çoğu özel, bu yüzden aşağıdaki liste depoların değil, işin kendisinin tarifi.",
    },
    work: {
      en: [
        "Java gameplay systems — profiles, friends, avatars and an in-game marketplace",
        "An internal SDK the plugins are built on, so each one is not its own framework",
        "Typed clients for the services the platform leans on: Tebex billing and Pterodactyl / Calagopus node control",
        "The public site and its documentation, built with Fumadocs",
        "Provisioning scripts for the game-server fleet",
      ],
      tr: [
        "Java oyun sistemleri — profiller, arkadaşlar, avatarlar ve oyun içi pazar yeri",
        "Eklentilerin üzerine kurulduğu dahili bir SDK, böylece her eklenti kendi çatısı olmuyor",
        "Platformun dayandığı servisler için tipli istemciler: Tebex faturalama ve Pterodactyl / Calagopus düğüm kontrolü",
        "Fumadocs ile yapılmış açık site ve dokümantasyonu",
        "Oyun sunucu filosu için kurulum betikleri",
      ],
    },
    meta: { en: "Since 2025 · 13 repositories", tr: "2025'ten beri · 13 depo" },
  },
  {
    name: "Liwinux Project",
    handle: "@Liwinux-Project",
    url: "https://github.com/Liwinux-Project",
    location: "Türkiye",
    role: { en: "Founder & maintainer", tr: "Kurucu ve sürdürücü" },
    blurb: {
      en: "Android games, on Linux, with a keyboard and mouse — and measurements to prove it. An open-source stack built on Waydroid, split into a runtime and an input engine that stands on its own.",
      tr: "Linux'ta Android oyunları, klavye ve fareyle — ve bunu kanıtlayan ölçümlerle. Waydroid üzerine kurulu açık kaynak bir yığın; bir çalışma zamanı ile tek başına ayakta duran bir giriş motoruna ayrılmış.",
    },
    work: {
      en: [
        "liwinux — the runtime: GPU, ARM translation, image, network, audio and session supervision",
        "liwinux-keymapper — the mapping engine, pure and testable, extractable by design",
        "351 tests across the two repositories, both GPL-3.0",
      ],
      tr: [
        "liwinux — çalışma zamanı: GPU, ARM çevirisi, imaj, ağ, ses ve oturum gözetimi",
        "liwinux-keymapper — eşleme motoru; saf, test edilebilir, tasarımı gereği ayrılabilir",
        "İki depoda toplam 351 test, ikisi de GPL-3.0",
      ],
    },
    meta: {
      en: "Founded August 2026 · 2 public repositories",
      tr: "Ağustos 2026'da kuruldu · 2 açık depo",
    },
  },
];

export type Lane = {
  period: L10n;
  title: L10n;
  body: L10n;
};

export const lanes: Lane[] = [
  {
    period: { en: "Now", tr: "Şimdi" },
    title: {
      en: "Linux systems & desktop tooling",
      tr: "Linux sistemleri ve masaüstü araçları",
    },
    body: {
      en: "Unwall and nabız: DPI bypass, netfilter plumbing and kernel-level diagnostics, wrapped in a GTK4 panel and a terminal UI that people actually open. Both ship in English and Turkish, both refuse to run as root when they do not need to.",
      tr: "Unwall ve nabız: DPI atlatma, netfilter tesisatı ve çekirdek seviyesinde teşhis — insanların gerçekten açtığı bir GTK4 paneli ve bir terminal arayüzüne sarılı. İkisi de İngilizce ve Türkçe çıkıyor, ikisi de gerek yokken root çalışmayı reddediyor.",
    },
  },
  {
    period: { en: "2026", tr: "2026" },
    title: {
      en: "Liwinux Project — Android on Linux",
      tr: "Liwinux Project — Linux'ta Android",
    },
    body: {
      en: 'Founded to make phone games run properly on a desktop: GPU acceleration, arm64 translation, keyboard and mouse with unbounded aim, and frame timing so "it feels laggy" becomes a number. Rust, GPL-3.0, 351 tests.',
      tr: 'Telefon oyunlarının masaüstünde düzgün çalışması için kuruldu: GPU hızlandırma, arm64 çevirisi, sınırsız nişanlı klavye-fare ve "takılıyor gibi"yi bir sayıya çeviren kare zamanlaması. Rust, GPL-3.0, 351 test.',
    },
  },
  {
    period: { en: "Ongoing", tr: "Sürüyor" },
    title: {
      en: "Speaway — game server infrastructure",
      tr: "Speaway — oyun sunucu altyapısı",
    },
    body: {
      en: "Gameplay systems in Java on a shared internal SDK, typed clients for billing and node control, and the web platform and documentation around them.",
      tr: "Ortak bir dahili SDK üzerinde Java oyun sistemleri, faturalama ve düğüm kontrolü için tipli istemciler, ve bunların etrafındaki web platformu ile dokümantasyon.",
    },
  },
  {
    period: { en: "Community", tr: "Topluluk" },
    title: {
      en: "Turkish localization & upstream work",
      tr: "Türkçe yerelleştirme ve upstream katkılar",
    },
    body: {
      en: "Turkish translations maintained for Vane, StorageMechanic and UClans, plus contributions across the Paper and Velocity plugin ecosystem — HuskHomes, HuskSync, RedisEconomy, Sierra and others.",
      tr: "Vane, StorageMechanic ve UClans için sürdürülen Türkçe çeviriler; ayrıca Paper ve Velocity eklenti ekosisteminde katkılar — HuskHomes, HuskSync, RedisEconomy, Sierra ve diğerleri.",
    },
  },
];

/**
 * Upstream projects contributed to or maintained translations for — not authored.
 * `owner` makes each one a real link; `tech` picks the brand mark shown beside it.
 */
export const contributions: { name: string; owner: string; tech: string }[] = [
  { name: "vane", owner: "oddlama", tech: "Java" },
  { name: "StorageMechanic", owner: "Wuason6x9", tech: "Java" },
  { name: "UClansV6", owner: "Kuero2137", tech: "Java" },
  { name: "HuskHomes", owner: "WiIIiam278", tech: "Java" },
  { name: "HuskSync", owner: "WiIIiam278", tech: "Java" },
  { name: "RedisEconomy", owner: "Emibergo02", tech: "Java" },
  { name: "Sierra", owner: "Henriks9", tech: "Java" },
  { name: "EnhancedVelocity", owner: "Syrent", tech: "Kotlin" },
  { name: "VelocityReport", owner: "Syrent", tech: "Kotlin" },
  { name: "Resourcify", owner: "DeDiamondPro", tech: "Kotlin" },
  { name: "plasmoid-tailscale", owner: "s-celles", tech: "QML" },
  { name: "caelestia-dots-kde", owner: "ladybug-me", tech: "QML" },
];

export const stack = [
  "Rust",
  "Go",
  "Shell",
  "TypeScript",
  "Java",
  "Kotlin",
  "QML",
  "Linux",
  "nftables",
  "systemd",
  "GTK4",
  "Bubble Tea",
  "GPUI",
  "Waydroid",
  "Vulkan",
  "KDE Plasma",
  "Next.js",
  "Tailwind",
  "Redis",
  "Paper",
  "Velocity",
  "Docker",
];

/** Hero counters. Static because they are stable; the live numbers are in the GitHub section. */
export const heroStats = [
  { n: PUBLIC_REPOS, key: "repos", suffix: "" },
  { n: 4, key: "years", suffix: "+" },
  { n: 6, key: "languages", suffix: "" },
  { n: 2, key: "orgs", suffix: "" },
] as const;

export const roles: L10n<string[]> = {
  en: ["Linux tooling", "Rust systems", "Network diagnostics", "Game infrastructure"],
  tr: ["Linux araçları", "Rust sistemleri", "Ağ teşhisi", "Oyun altyapısı"],
};

export const NAV = [
  { id: "work" },
  { id: "projects" },
  { id: "orgs" },
  { id: "github" },
  { id: "contact" },
] as const;

export type NavId = (typeof NAV)[number]["id"];
