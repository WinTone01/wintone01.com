# Email for wintone01.com

Two halves that people conflate, and they need different providers:

| | Provider | Address |
|---|---|---|
| **Sending** — the contact form's notification | Mailtrap Email API | `noreply@wintone01.com` |
| **Receiving** — where that notification lands | Cloudflare Email Routing | `support@wintone01.com` → your real inbox |

Mailtrap sends transactional mail; it does **not** host a mailbox, so it cannot
receive anything at `support@wintone01.com` on its own. Cloudflare Email Routing
covers that half, is free, and the domain is already on Cloudflare because the
site deploys to Workers.

---

## 1. Sending — Mailtrap

**Add and verify the domain.** Mailtrap → *Sending Domains* → add `wintone01.com`.
It will hand you records to publish. They look like this — **use the exact values
Mailtrap shows you**, the selectors and hostnames are per-account:

| Type | Name | Value |
|---|---|---|
| TXT | `wintone01.com` | `v=spf1 include:_spf.mailtrap.live ~all` |
| TXT | `rwmt1._domainkey` | (DKIM key from Mailtrap) |
| TXT | `rwmt2._domainkey` | (DKIM key from Mailtrap) |
| CNAME | `mt-link` | (link-tracking host, optional) |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:support@wintone01.com` |

Notes:

- **Only one SPF record per domain.** If `wintone01.com` already has a `v=spf1`
  TXT record, merge the `include:` into it rather than adding a second — two SPF
  records is a permanent error and mail starts failing.
- Start DMARC at `p=none` and read the reports for a week or two before moving to
  `quarantine`. Going straight to `reject` on a fresh sending domain is how you
  find out something was misconfigured by having your mail disappear.
- Verification is usually minutes, but DNS TTLs can stretch it to a few hours.

**Create the token.** Mailtrap → *Sending Domains → API tokens*. It needs the
send permission only.

## 2. Receiving — Cloudflare Email Routing

Cloudflare dashboard → `wintone01.com` → **Email** → *Email Routing* → Enable.
It publishes the MX and SPF records itself.

Then add the destination addresses:

| Custom address | Destination |
|---|---|
| `support@wintone01.com` | your real inbox (e.g. the Proton address) |
| `hello@wintone01.com` | same, optional public-facing alias |

Cloudflare emails the destination address a confirmation link; the route stays
inactive until you click it.

`noreply@wintone01.com` deliberately gets **no** route — replies to it should
bounce. The notification carries `Reply-To: <the visitor>`, so replying in your
mail client goes to the person who wrote in, not to the sender address.

> Cloudflare Email Routing **forwards**; it does not let you send *as*
> `support@wintone01.com`. If you want to reply from that address, you need a
> mailbox provider (Proton with a custom domain, Fastmail, Migadu) instead of
> forwarding. The contact form does not need it.

## 3. Environment variables

Set these as Worker secrets (`wrangler secret put NAME`) or in the Cloudflare
dashboard under *Settings → Variables and Secrets*:

| Variable | Required | What it does |
|---|---|---|
| `MAILTRAP_API_TOKEN` | yes | Mailtrap sending token. Without it the form returns "Email sending is not configured yet". |
| `CONTACT_TO_ADDRESS` | no | Overrides the `support@wintone01.com` destination. |
| `MAILTRAP_SANDBOX_INBOX_ID` | no | Development only — routes to Mailtrap's sandbox, which captures mail instead of delivering it. Never set it in production. |
| `GITHUB_TOKEN` | **yes, in practice** | The stats panel is one authenticated GraphQL call. Without a token it falls back to the build-time snapshot and says so — the unauthenticated REST budget is 60/hour per IP and Workers egress IPs are shared, so it was empty most of the time. Public data only: a fine-grained token with **no** scopes is enough. |
| `TURNSTILE_SECRET_KEY` | recommended | Server-side Turnstile verification for the contact form. Absent = verification skipped, which is what makes local development work without Cloudflare credentials. |
| `VITE_TURNSTILE_SITE_KEY` | recommended | The public half of the Turnstile pair. Build-time, not a secret — it must be set where the build runs, not only at runtime. Absent = the widget does not render. |

Local development — `.dev.vars` (already gitignored):

```
MAILTRAP_API_TOKEN=...
MAILTRAP_SANDBOX_INBOX_ID=...
GITHUB_TOKEN=...
```

## 4. Spam protection

The form is defended in two layers:

1. **Cloudflare Turnstile.** Create a widget at *Turnstile → Add site* for
   `wintone01.com`, then set `VITE_TURNSTILE_SITE_KEY` (public, build-time) and
   `TURNSTILE_SECRET_KEY` (secret, runtime). The token is verified server-side —
   the client half of a captcha is a suggestion.
2. **A soft per-IP rate limit**, three submissions per ten minutes, held in the
   Cloudflare Cache API. That store is per-colo rather than global, so someone
   spread across regions gets more than three; Turnstile is the actual defence
   and this only has to stop one script hammering the endpoint. A global limit
   would need a Durable Object or KV binding this project does not otherwise use.

If Turnstile is unreachable the form still submits and falls back to the rate
limit alone — a third-party outage taking the contact form down would be worse
than the spam it prevents.

## 5. Checking it works

```bash
curl -X POST https://send.api.mailtrap.io/api/send \
  -H "Api-Token: $MAILTRAP_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"from":{"email":"noreply@wintone01.com","name":"Portfolio"},
       "to":[{"email":"support@wintone01.com"}],
       "subject":"Routing test","text":"If this lands, both halves work."}'
```

A `200` means Mailtrap accepted it; the mail arriving in your real inbox means
Cloudflare's forwarding works too. Check the headers show `dkim=pass` and
`spf=pass` — Gmail shows them under *Show original*.

## Not enabled, and why

**No auto-reply to the visitor.** Mailing the sender a "thanks, I got it" makes
the form a spam reflector — anyone can put any address in the field and have your
domain send mail to it. Turnstile and the rate limit now make it *defensible*
rather than reckless, but it still means your sending reputation is spent on
addresses you never chose. Turn it on deliberately if you want it, not as a side
effect of adding a nicety.
