import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80, "Name is too long"),
  email: z.string().trim().email("Enter a valid email address").max(160),
  subject: z.string().trim().min(3, "Add a short subject").max(120, "Subject is too long"),
  message: z
    .string()
    .trim()
    .min(20, "Tell me a bit more — at least 20 characters")
    .max(4000, "Message is too long"),
  /** Cloudflare Turnstile token; absent when the widget is not configured. */
  turnstileToken: z.string().max(4096).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
