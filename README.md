# QR Platform

Dynamic QR code platform: create a QR code, enter the details you want
shown when it's scanned, download a print-ready high-resolution PDF,
and track scans. Built with Next.js 14 (App Router), Supabase
(Postgres + Auth), Upstash Redis (caching + rate limiting), and
QStash (async, durable scan-analytics writes).

## How it works

- Each QR code gets a random 8-character `short_code` and encodes
  `https://yourdomain.com/q/<short_code>`.
- Scanning it loads `/q/[code]`, a public page that reads the QR's
  details (title, description, phone, email, website, address, notes)
  from Redis (falling back to Postgres on a cache miss) and renders
  them — this is "whatever you entered while generating the QR."
- The scan event is queued to QStash, which calls back `/api/track`
  (signature-verified) to durably write the scan to the `qr_scans`
  table without blocking the page render.
- `/api/qr/[id]/pdf` generates a high-resolution (1200px) QR PNG with
  `qrcode`, then composes it with the entered details into a
  downloadable PDF with `pdf-lib`.

## 1. Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project
- An [Upstash](https://upstash.com) Redis database
- An [Upstash QStash](https://upstash.com/docs/qstash) instance
- A [Vercel](https://vercel.com) account for deployment

## 2. Local setup

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=            # Supabase project settings > API
NEXT_PUBLIC_SUPABASE_ANON_KEY=       # Supabase project settings > API
SUPABASE_SERVICE_ROLE_KEY=           # Supabase project settings > API (keep secret!)
DATABASE_URL=                        # Supabase project settings > Database

UPSTASH_REDIS_REST_URL=              # Upstash console > your Redis DB > REST API
UPSTASH_REDIS_REST_TOKEN=

QSTASH_TOKEN=                        # Upstash console > QStash
QSTASH_CURRENT_SIGNING_KEY=          # Upstash console > QStash > signing keys
QSTASH_NEXT_SIGNING_KEY=

NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_BASE_DOMAIN=localhost:3000
```

> Note: I added `QSTASH_CURRENT_SIGNING_KEY` / `QSTASH_NEXT_SIGNING_KEY`
> beyond your original list — they're required to verify that calls to
> `/api/track` genuinely came from QStash. Both are on the same
> Upstash QStash dashboard page as your token.

## 3. Database schema

Run the migration against your Supabase project:

```bash
# Option A: Supabase CLI
supabase link --project-ref <your-project-ref>
supabase db push

# Option B: paste supabase/migrations/0001_init.sql into
# Supabase Studio > SQL Editor > Run
```

This creates `qr_codes` and `qr_scans` with Row Level Security so
users can only see/edit their own QR codes. The public scan page and
the QStash callback use the **service role** key server-side, which
intentionally bypasses RLS — never expose that key to the client.

In Supabase Auth settings, you can leave "Confirm email" on (default)
or turn it off for faster local testing.

## 4. Run locally

```bash
npm run dev
```

Visit `http://localhost:3000`, sign up, create a QR code, and open
`/dashboard/<id>` to preview it and download the PDF.

**QStash + localhost:** QStash needs a publicly reachable URL to call
back, so it can't reach `http://localhost:3000` directly. The scan
page (`app/q/[code]/page.tsx`) already detects `localhost` in
`NEXT_PUBLIC_APP_URL` and writes scans directly instead of going
through QStash, so everything works locally without extra setup. Once
`NEXT_PUBLIC_APP_URL` points at your real deployed domain, it
automatically switches to the QStash path.

## 5. Test checklist

1. Sign up -> land on `/dashboard` (empty state).
2. Create a QR code with a title + a couple of fields -> redirected to
   its detail page, QR image renders.
3. Click "Download high-res PDF" -> PDF opens with the QR + your
   entered details.
4. Open the `/q/<code>` URL shown on the detail page (in a private
   window, logged out) -> details render.
5. Refresh the dashboard detail page -> "Total scans" incremented and
   a row appears under "Recent scans."
6. Click "Pause QR code" -> re-visit `/q/<code>` -> should 404 (page
   not found) since inactive codes don't resolve.
7. Delete a QR code -> disappears from the dashboard list and its
   `/q/<code>` page 404s.

## 6. Deploy to Vercel

```bash
npm i -g vercel   # if you don't have it
vercel login
vercel link
```

Add every variable from `.env.local` to the Vercel project (Project
Settings > Environment Variables), **except** point the two URLs at
your real domain:

```
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_BASE_DOMAIN=your-app.vercel.app
```

(swap in a custom domain later the same way). Then:

```bash
vercel --prod
```

After the first deploy, double-check:

- Supabase Auth > URL Configuration: add
  `https://your-app.vercel.app/auth/callback` as a redirect URL.
- QStash: no dashboard config needed — it calls whatever URL you pass
  in `queueScanEvent`, which is derived from `NEXT_PUBLIC_APP_URL`.
- Visit `/q/<code>` for a real QR code post-deploy and confirm a scan
  shows up (this is the first real end-to-end test of the QStash
  callback path, since local dev bypasses it).

## Project structure

```
app/
  page.tsx                 landing page
  login/, signup/           auth pages + server actions
  auth/callback, auth/signout
  dashboard/                protected (see middleware.ts)
    page.tsx                list of QR codes
    new/                     create form + action
    [id]/                    detail page: preview, PDF, analytics, pause/delete
  q/[code]/page.tsx          public scan-landing page
  api/qr/[id]/pdf/           high-res PDF generation
  api/qr/[id]/preview/       small PNG preview for the dashboard
  api/track/                 QStash-verified analytics write
lib/
  supabase/                  browser/server/middleware Supabase clients
  redis.ts                   Upstash Redis cache + rate limiters
  qstash.ts                  QStash client + signature receiver
  qr-image.ts                QR PNG generation
  shortcode.ts                short_code generator
supabase/migrations/0001_init.sql
```

## Notes / things to harden further for high-volume production use

- Add a custom-domain feature (multi-tenant `NEXT_PUBLIC_BASE_DOMAIN`)
  if you want each user to brand their QR links.
- The PDF route currently authenticates the requesting user via
  cookies; if you want QR PDFs to be downloadable via a signed,
  shareable link instead, add a signed-URL token.
- Consider adding Upstash Analytics or a scheduled QStash job to roll
  up `qr_scans` into daily aggregates once volume grows, so the
  dashboard doesn't scan the raw table for busy codes.
