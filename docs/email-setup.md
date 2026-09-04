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
| TXT | `wintone01.com` | `v=spf1 include:_spf.smtp.mailtrap.live ~all` |
| TXT | `rwmt1._domainkey` | (DKIM key from Mailtrap) |
| TXT | `rwmt2._domainkey` | (DKIM key from Mailtrap) |
| CNAME | `mt-link` | (link-tracking host, optional) |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:support@wintone01.com` |

Notes:

- **Only one SPF record per domain.** If `wintone01.com` already has a `v=spf1`
  TXT record, merge the `include:` into it rather than adding a second — two SPF
  records is a permanent error and mail starts failing. Enabling Email Routing
  publishes one of its own, so the merged record is what the domain needs:

  ```
  v=spf1 include:_spf.smtp.mailtrap.live include:_spf.mx.cloudflare.net ~all
  ```

  Email Routing locks the records it manages. To edit that TXT, unlock them
  first: *Email Routing → DNS records → Unlock*.
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

A verified address under *Destination Addresses* is only half of it — that tab
is a list of inboxes Cloudflare is allowed to forward **to**. Mail for
`support@wintone01.com` is only accepted once a rule under *Routing rules* maps
that custom address to one of them. Without the rule Cloudflare answers `550`
and every message hard-bounces, which is also how a sender ends up on an ESP's
suppression list.

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

### When it says "Not Delivered"

Mailtrap shows the same status for two opposite situations, and the field that
tells them apart is **Mailtrap Sending IP**:

| Last Event | Sending IP | What actually happened |
|---|---|---|
| `Bounced` | an IP | Mailtrap sent it; the receiving server refused it. The bounce text is the receiving server's own words — read it. |
| `Rejected` | `—` | Mailtrap never sent it. The recipient is on the account's **suppression list**. |

The two chain together, which is what makes it confusing: one hard bounce
(`5.1.1 Address does not exist`, from Cloudflare, because the address had no
routing rule yet) puts the address on the suppression list, and from then on
every send is `Rejected` before it leaves Mailtrap. Fixing the routing rule does
not clear the list.

So repair it in this order:

1. Cloudflare → *Email Routing → Routing rules* — the address needs a rule (or an
   active catch-all). Confirm with *Activity Log*: if nothing appears there, the
   mail never reached Cloudflare and the problem is still upstream.
2. Mailtrap → *Suppressions* — delete the address.
3. Re-send. `Mailtrap Sending IP` being populated is the sign it actually left.

## Not enabled, and why

**No auto-reply to the visitor.** Mailing the sender a "thanks, I got it" makes
the form a spam reflector — anyone can put any address in the field and have your
domain send mail to it. Turnstile and the rate limit now make it *defensible*
rather than reckless, but it still means your sending reputation is spent on
addresses you never chose. Turn it on deliberately if you want it, not as a side
effect of adding a nicety.
