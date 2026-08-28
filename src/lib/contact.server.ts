import type { ContactInput } from "./contact.schema";

/**
 * Contact form delivery over the Mailtrap Email API.
 *
 * Mailtrap *sends*; it does not host a mailbox. `noreply@wintone01.com` is the
 * verified sending identity and `support@wintone01.com` is the destination —
 * that address receives through Cloudflare Email Routing, which forwards it to
 * a real inbox. See `docs/email-setup.md` for the DNS records both halves need.
 *
 * `MAILTRAP_SANDBOX_INBOX_ID` switches to the sandbox endpoint, which captures
 * mail instead of delivering it. Set it in development so testing the form does
 * not spend real sending quota or reputation.
 */

const LIVE_ENDPOINT = "https://send.api.mailtrap.io/api/send";
const SANDBOX_ENDPOINT = "https://sandbox.api.mailtrap.io/api/send";

const FROM = { email: "noreply@wintone01.com", name: "WinTone01 Portfolio" };
const DEFAULT_TO = "support@wintone01.com";

function env(key: string) {
  return process.env[key]?.trim() || undefined;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Header injection guard. `name` and `subject` reach mail headers (the subject
 * line and the display name), and a newline in either would let a sender append
 * headers of their own.
 */
function singleLine(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

export async function sendContactEmail(data: ContactInput) {
  const token = env("MAILTRAP_API_TOKEN");
  if (!token) {
    throw new Error("Email sending is not configured yet. Please try again later.");
  }

  const sandboxInbox = env("MAILTRAP_SANDBOX_INBOX_ID");
  const endpoint = sandboxInbox ? `${SANDBOX_ENDPOINT}/${sandboxInbox}` : LIVE_ENDPOINT;
  const to = env("CONTACT_TO_ADDRESS") ?? DEFAULT_TO;

  const name = singleLine(data.name);
  const subject = singleLine(data.subject);

  const text = [`From: ${name} <${data.email}>`, `Subject: ${subject}`, "", data.message].join(
    "\n",
  );

  const html = `
    <div style="font-family:system-ui,sans-serif;line-height:1.6;color:#18181b">
      <h2 style="margin:0 0 12px;font-size:18px">New portfolio message</h2>
      <p style="margin:0 0 4px"><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(data.email)}&gt;</p>
      <p style="margin:0"><strong>Subject:</strong> ${escapeHtml(subject)}</p>
      <hr style="border:none;border-top:1px solid #e5e5e5;margin:16px 0" />
      <p style="white-space:pre-wrap;margin:0">${escapeHtml(data.message)}</p>
    </div>
  `;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Mailtrap accepts either header; Api-Token is the documented one.
      "Api-Token": token,
    },
    body: JSON.stringify({
      from: FROM,
      to: [{ email: to }],
      // Replying in the mail client goes straight back to the visitor.
      reply_to: { email: data.email, name },
      subject: `[Portfolio] ${subject}`,
      text,
      html,
      category: "portfolio-contact",
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error(`Mailtrap request failed [${response.status}]: ${body}`);
    throw new Error(`Could not send the message right now (${response.status}).`);
  }

  return { ok: true as const };
}
