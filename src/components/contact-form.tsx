import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useServerFn } from "@tanstack/react-start";
import { motion, AnimatePresence } from "motion/react";
import { AlertCircle, ArrowUp, Check, Loader2, RotateCcw, Send } from "lucide-react";
import { contactSchema, type ContactInput } from "@/lib/contact.schema";
import { sendContactMessage } from "@/lib/contact.functions";
import { BlurFade, BorderBeam } from "@/components/magicui/effects";
import { Turnstile } from "@/components/turnstile";
import { useLocale } from "@/components/locale-provider";
import { fill, ui } from "@/lib/i18n";

/*
 * 16px on phones, not 14. Mobile Safari zooms the whole page in when a focused
 * input is smaller than that, and it does not zoom back out — tapping the name
 * field left the layout scaled up and scrolled sideways.
 */
const fieldClass =
  "w-full rounded-xl border border-border bg-elevated px-4 py-3 text-base outline-none transition-colors duration-300 placeholder:text-muted-foreground focus:border-ring sm:text-sm";

const REDIRECT_SECONDS = 6;

export function ContactForm() {
  const { t } = useLocale();
  const f = ui.contact.form;
  const send = useServerFn(sendContactMessage);
  const [sent, setSent] = useState(false);
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS);
  const [serverError, setServerError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | undefined>(undefined);
  // Stable, or the widget would re-render itself on every keystroke.
  const onToken = useCallback((token: string | undefined) => setCaptchaToken(token), []);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
  });

  // After a successful send, count down and smooth-scroll back to the top
  // of the page (the "redirect"), then offer a fresh form.
  useEffect(() => {
    if (!sent) return;
    setCountdown(REDIRECT_SECONDS);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          window.scrollTo({ top: 0, behavior: "smooth" });
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sent]);

  async function onSubmit(values: ContactInput) {
    setServerError(null);
    try {
      const result = await send({
        data: { ...values, ...(captchaToken ? { turnstileToken: captchaToken } : {}) },
      });
      if (!result?.ok) throw new Error("The message could not be delivered.");
      reset();
      setSent(true);
    } catch (err) {
      setServerError(
        err instanceof Error && err.message
          ? err.message
          : "Something went wrong while sending. Your message is still here — please try again.",
      );
    }
  }

  function dismissError() {
    setServerError(null);
  }

  return (
    <BlurFade className="relative mx-auto mt-12 w-full max-w-2xl sm:mt-14">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 text-left sm:p-9">
        <BorderBeam duration={12} />
        <AnimatePresence mode="wait" initial={false}>
          {sent ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center py-10 text-center"
              role="status"
              aria-live="polite"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
                className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground"
                style={{ boxShadow: "var(--glow)" }}
              >
                <Check className="size-8" strokeWidth={2.5} />
              </motion.div>
              <h3 className="mt-6 font-display text-2xl font-semibold tracking-tight">
                {t(f.sent)}
              </h3>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
                {t(f.sentBody)}
              </p>
              <p className="mt-6 text-xs text-muted-foreground">{fill(t(f.redirect), countdown)}</p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform duration-300 hover:scale-[1.03]"
                >
                  <ArrowUp className="size-4" /> {t(f.backToTop)}
                </button>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="flex items-center gap-2 rounded-xl border border-border bg-elevated px-5 py-2.5 text-sm font-medium transition-colors duration-300 hover:border-ring"
                >
                  <RotateCcw className="size-4" /> {t(f.sendAnother)}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="space-y-5"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="mb-2 block text-xs font-medium">
                    {t(f.name)}
                  </label>
                  <input
                    id="name"
                    className={fieldClass}
                    placeholder={t(f.namePlaceholder)}
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="mt-2 text-xs text-destructive">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="email" className="mb-2 block text-xs font-medium">
                    {t(f.email)}
                  </label>
                  <input
                    id="email"
                    type="email"
                    className={fieldClass}
                    placeholder="you@example.com"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="mt-2 text-xs text-destructive">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="mb-2 block text-xs font-medium">
                  {t(f.subject)}
                </label>
                <input
                  id="subject"
                  className={fieldClass}
                  placeholder={t(f.subjectPlaceholder)}
                  {...register("subject")}
                />
                {errors.subject && (
                  <p className="mt-2 text-xs text-destructive">{errors.subject.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="message" className="mb-2 block text-xs font-medium">
                  {t(f.message)}
                </label>
                <textarea
                  id="message"
                  rows={5}
                  className={`${fieldClass} resize-none`}
                  placeholder={t(f.messagePlaceholder)}
                  {...register("message")}
                />
                {errors.message && (
                  <p className="mt-2 text-xs text-destructive">{errors.message.message}</p>
                )}
              </div>

              <AnimatePresence>
                {serverError && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    role="alert"
                    className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3"
                  >
                    <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-destructive">{t(f.failed)}</p>
                      <p className="mt-1 text-xs leading-relaxed text-destructive/90">
                        {serverError}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={dismissError}
                      className="text-xs text-destructive/70 underline-offset-2 hover:underline"
                    >
                      Dismiss
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <Turnstile onToken={onToken} />

              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground transition-transform duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                style={{ boxShadow: "var(--glow)" }}
              >
                {/* sheen sweeping across on hover */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent_35%,var(--shimmer-color)_50%,transparent_65%)] opacity-40 transition-transform duration-700 ease-out group-hover:translate-x-full"
                />
                <AnimatePresence mode="wait" initial={false}>
                  {isSubmitting ? (
                    <motion.span
                      key="loading"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.22 }}
                      className="relative flex items-center gap-2"
                    >
                      <Loader2 className="size-4 animate-spin" /> {t(f.sending)}
                    </motion.span>
                  ) : serverError ? (
                    <motion.span
                      key="retry"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.22 }}
                      className="relative flex items-center gap-2"
                    >
                      <RotateCcw className="size-4 transition-transform duration-500 group-hover:-rotate-180" />
                      {t(f.tryAgain)}
                    </motion.span>
                  ) : (
                    <motion.span
                      key="idle"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.22 }}
                      className="relative flex items-center gap-2"
                    >
                      {t(f.send)}
                      <Send className="size-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              <p className="text-center text-xs text-muted-foreground">{t(f.footnote)}</p>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </BlurFade>
  );
}
