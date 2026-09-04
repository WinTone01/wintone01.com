/**
 * Two locales, because both of the tools this site is mostly about — Unwall and
 * nabız — ship their own interfaces in English and Turkish. A single-language
 * portfolio would contradict the projects it lists.
 *
 * English is the default, matching the projects' own `README.md` +
 * `README.tr.md` convention.
 */

export type Locale = "en" | "tr";

export const LOCALES: Locale[] = ["en", "tr"];
export const DEFAULT_LOCALE: Locale = "en";

/** A value that differs per language. Both are required, so neither can rot. */
export type L10n<T = string> = Record<Locale, T>;

export function pick<T>(value: L10n<T>, locale: Locale): T {
  return value[locale];
}

/** UI chrome — everything that is not project or organisation copy. */
export const ui = {
  nav: {
    work: { en: "Work", tr: "Neler" },
    projects: { en: "Projects", tr: "Projeler" },
    orgs: { en: "Orgs", tr: "Ekipler" },
    github: { en: "GitHub", tr: "GitHub" },
    contact: { en: "Contact", tr: "İletişim" },
  },
  hero: {
    badge: { en: "Available for collaboration", tr: "İş birliğine açık" },
    titleTop: { en: "Systems, tooling", tr: "Sistemler, araçlar" },
    titleBottom: { en: "and the last 5%", tr: "ve son %5" },
    buildPrefix: { en: "I'm WinTone01 — I build", tr: "Ben WinTone01 — geliştirdiğim şey" },
    blurb: {
      en: "Low-level where it matters, polished where it's seen. Rust and Go for the engine, GTK4 and a terminal for the part you touch.",
      tr: "Gerektiği yerde alt seviye, görünen yerde işlenmiş. Motor tarafında Rust ve Go, dokunduğun yerde GTK4 ve bir terminal.",
    },
    cta: { en: "View selected work", tr: "Seçilmiş işlere bak" },
    stats: {
      repos: { en: "Public repos", tr: "Açık depo" },
      years: { en: "Years shipping", tr: "Yıldır üretiyor" },
      languages: { en: "Languages", tr: "Dil" },
      orgs: { en: "Organizations", tr: "Organizasyon" },
    },
  },
  work: {
    eyebrow: { en: "01 — What I do", tr: "01 — Ne yapıyorum" },
    title: {
      en: "Four lanes, one obsession with details.",
      tr: "Dört alan, tek bir detay saplantısı.",
    },
  },
  projects: {
    eyebrow: { en: "02 — Selected projects", tr: "02 — Seçilmiş projeler" },
    title: {
      en: "Things I've built and still maintain.",
      tr: "Yazdığım ve hâlâ baktığım işler.",
    },
    note: {
      en: "Original work only — forks and translation repositories are further down, under their own heading.",
      tr: "Yalnızca kendi işlerim — fork'lar ve çeviri depoları aşağıda, kendi başlığı altında.",
    },
    tileTitle: { en: "Everything else", tr: "Geri kalanı" },
    tileBody: {
      en: "Forks, translations and the rest of the public repositories.",
      tr: "Fork'lar, çeviriler ve açık depoların geri kalanı.",
    },
  },
  terminal: {
    eyebrow: { en: "03 — In the terminal", tr: "03 — Terminalde" },
    title: {
      en: "Where the work actually happens.",
      tr: "İşin asıl döndüğü yer.",
    },
    body: {
      en: "Three tools, one session. Everything below is output these projects really print — the score, the kernel verdict and the Vulkan line included.",
      tr: "Üç araç, tek oturum. Aşağıdaki her satır bu projelerin gerçekten bastığı çıktı — skor, çekirdek kararı ve Vulkan satırı dahil.",
    },
    cta: { en: "Read the nabız write-up", tr: "nabız yazısını oku" },
  },
  orgs: {
    eyebrow: { en: "04 — Organizations", tr: "04 — Organizasyonlar" },
    title: {
      en: "Where the work has a team around it.",
      tr: "İşin etrafında bir ekip olduğu yer.",
    },
    upstreamTitle: { en: "Upstream, not mine", tr: "Bana ait değil" },
    upstreamBody: {
      en: "Projects I have contributed to or maintain Turkish translations for. They are other people's repositories, which is exactly why they are listed here and not above.",
      tr: "Katkı verdiğim ya da Türkçe çevirisini sürdürdüğüm projeler. Başkalarının depoları — tam da bu yüzden yukarıda değil, burada duruyorlar.",
    },
  },
  github: {
    eyebrow: { en: "05 — GitHub, live", tr: "05 — GITHUB, canlı" },
    title: {
      en: "Numbers pulled straight from the API.",
      tr: "Doğrudan API'den gelen sayılar.",
    },
    body: {
      en: "Every contribution since 2022, counting authored repositories only — forks would put other people's languages on this chart.",
      tr: "2022'den bu yana her katkı; yalnızca kendi yazdığım depolar — fork'lar bu grafiğe başkalarının dillerini koyardı.",
    },
    languages: { en: "Top languages", tr: "Öne çıkan diller" },
    languagesNote: {
      en: "Real byte counts across {n} authored repos, forks excluded.",
      tr: "{n} kendi deposunda gerçek byte sayıları, fork'lar hariç.",
    },
    languagesNoteLoading: {
      en: "Real byte counts across authored repos, forks excluded.",
      tr: "Kendi depolarında gerçek byte sayıları, fork'lar hariç.",
    },
    contributions: { en: "Contributions", tr: "Katkı" },
    contributionsNote: { en: "All time, since 2022", tr: "Tüm zamanlar, 2022'den beri" },
    bestDay: { en: "Busiest day", tr: "En yoğun gün" },
    bestDayNote: { en: "commits in one day", tr: "günde commit" },
    longestStreak: { en: "Longest streak", tr: "En uzun seri" },
    thisYear: { en: "This year", tr: "Bu yıl" },
    contributionsShort: { en: "contributions", tr: "katkı" },
    activeDays: { en: "Active days", tr: "Aktif gün" },
    days: { en: "days", tr: "gün" },
    heatmap: { en: "Last 120 days", tr: "Son 120 gün" },
    stars: { en: "Stars", tr: "Yıldız" },
    forks: { en: "Forks", tr: "Fork" },
    followers: { en: "Followers", tr: "Takipçi" },
    repos: { en: "Repos", tr: "Depo" },
    stale: {
      en: "Showing the last captured snapshot — the API is unreachable right now.",
      tr: "Son kaydedilen anlık görüntü gösteriliyor — API şu an erişilemiyor.",
    },
  },
  contact: {
    titleTop: { en: "Got something", tr: "Yapmaya değer" },
    titleBottom: { en: "worth building?", tr: "bir şey mi var?" },
    body: {
      en: "Open to Linux tooling, Rust and Go systems work, and game server infrastructure. The fastest way to reach me is GitHub — the form below lands in my inbox.",
      tr: "Linux araçları, Rust ve Go sistem işleri ve oyun sunucu altyapısına açığım. Bana en hızlı GitHub'dan ulaşırsın — aşağıdaki form da gelen kutuma düşüyor.",
    },
    form: {
      name: { en: "Name", tr: "Ad" },
      namePlaceholder: { en: "Your name", tr: "Adın" },
      email: { en: "Email", tr: "E-posta" },
      subject: { en: "Subject", tr: "Konu" },
      subjectPlaceholder: { en: "What is this about?", tr: "Konu nedir?" },
      message: { en: "Message", tr: "Mesaj" },
      messagePlaceholder: {
        en: "Tell me about the project, stack and timeline.",
        tr: "Projeden, kullandığın teknolojilerden ve takvimden bahset.",
      },
      send: { en: "Send message", tr: "Mesajı gönder" },
      sending: { en: "Sending…", tr: "Gönderiliyor…" },
      footnote: {
        en: "Goes straight to support@wintone01.com — I usually reply within a day.",
        tr: "Doğrudan support@wintone01.com adresine gider — genelde bir gün içinde dönerim.",
      },
      sent: { en: "Message sent!", tr: "Mesaj gönderildi!" },
      sentBody: {
        en: "Thanks for reaching out — your message is on its way. I usually reply within a day.",
        tr: "Yazdığın için teşekkürler — mesajın yola çıktı. Genelde bir gün içinde dönerim.",
      },
      redirect: { en: "Taking you back to the top in {n}s…", tr: "{n} sn içinde başa dönüyoruz…" },
      backToTop: { en: "Back to top now", tr: "Hemen başa dön" },
      sendAnother: { en: "Send another", tr: "Bir tane daha gönder" },
      tryAgain: { en: "Try again", tr: "Tekrar dene" },
      failed: { en: "Sending failed", tr: "Gönderilemedi" },
    },
  },
  footer: {
    built: { en: "Built in Türkiye · Always shipping", tr: "Türkiye'de yapıldı · Hep üretimde" },
  },
  a11y: {
    switchToTurkish: { en: "Switch to Turkish", tr: "Türkçe'ye geç" },
    switchToEnglish: { en: "Switch to English", tr: "İngilizce'ye geç" },
    openMenu: { en: "Open menu", tr: "Menüyü aç" },
    closeMenu: { en: "Close menu", tr: "Menüyü kapat" },
    backToTop: { en: "Back to top", tr: "Başa dön" },
    skipToContent: { en: "Skip to content", tr: "İçeriğe geç" },
    toLight: { en: "Switch to light theme", tr: "Açık temaya geç" },
    toDark: { en: "Switch to dark theme", tr: "Koyu temaya geç" },
  },
} satisfies Record<string, unknown>;

/** Fills `{n}` in a translated string. */
export function fill(template: string, value: string | number) {
  return template.replace("{n}", String(value));
}
