"use client";

import { Suspense, lazy, useRef } from "react";
import { useInView } from "motion/react";
import { EMAIL } from "@/lib/profile";

/**
 * The contact form, loaded when the visitor gets near it.
 *
 * It sits at the bottom of a twelve-thousand pixel page, and it was the only
 * thing pulling react-hook-form, zod and the resolver into the first bundle —
 * parsed on every visit, including the majority that never scroll this far.
 *
 * The placeholder is the same box at the same height, so the swap costs no
 * layout shift, and it is what the server renders: a form whose submit path is
 * a fetch to a server function was never going to work without JavaScript, so
 * nothing is lost by not shipping it in the HTML. The `noscript` address is
 * strictly more than was there before.
 */
const ContactForm = lazy(() => import("./contact-form").then((m) => ({ default: m.ContactForm })));

function Placeholder({ withRef }: { withRef?: React.Ref<HTMLDivElement> }) {
  return (
    <div ref={withRef} className="relative mx-auto mt-12 w-full max-w-2xl sm:mt-14">
      <div
        className="min-h-[34rem] rounded-2xl border border-border bg-card"
        aria-hidden
        // Matches the loaded card, so nothing moves when the real form arrives.
      />
      <noscript>
        <p className="mt-4 text-sm text-muted-foreground">
          The contact form needs JavaScript. You can email{" "}
          <a className="underline" href={`mailto:${EMAIL}`}>
            {EMAIL}
          </a>{" "}
          instead.
        </p>
      </noscript>
    </div>
  );
}

export function ContactFormSlot() {
  const ref = useRef<HTMLDivElement>(null);
  // Generous margin: the chunk should be parsed by the time the form is read.
  const inView = useInView(ref, { once: true, margin: "500px" });

  if (!inView) return <Placeholder withRef={ref} />;

  return (
    <Suspense fallback={<Placeholder />}>
      <ContactForm />
    </Suspense>
  );
}
