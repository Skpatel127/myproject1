# Agency OS — Marketing Agency CRM (MVP)

Next.js 14 (App Router) + TypeScript + Tailwind, backed by Supabase (Postgres + Auth),
deployed on Vercel. Role-based permissions (`owner`, `management`, `employee`, `client`)
are enforced at the database level via Postgres Row Level Security — not just hidden in
the UI.

## What's included

- Email/password auth (Supabase)
- Role-aware dashboard, leads pipeline, client roster + detail, task board, content
  pipeline, and a simple client portal (approve / reject / request revision)
- `supabase/schema.sql` — full schema + RLS policies
- `supabase/seed.sql` — optional demo data

---

## 1. Run it locally FIRST — before touching Vercel

Do this step before deploying anywhere. It catches almost every problem early.

```bash
npm install
cp .env.local.example .env.local
```

Open `.env.local` and fill in your real Supabase values (see step 2 below), then:

```bash
npm run build
```

**This must finish with no errors before you deploy.** If it fails here, it will fail
on Vercel too — and the error message in your terminal will be far more complete than
what Vercel shows you. Fix it locally first.

Once `npm run build` succeeds:

```bash
npm run dev
```

Open `http://localhost:3000`.

## 2. Set up Supabase

1. [supabase.com](https://supabase.com) → **New project**.
2. **SQL Editor → New query** → paste all of `supabase/schema.sql` → **Run**.
3. **Settings → API** → copy the **Project URL** and **anon public** key into your
   `.env.local` as:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
4. Sign up in the app (`/signup`). Every new signup defaults to the `employee` role.
5. To make yourself Owner: Supabase → **Table Editor → profiles** → find your row →
   change `role` to `owner`.
6. Optional: run `supabase/seed.sql` in the SQL Editor for demo data.

## 3. Deploy to Vercel

1. Push this folder to a GitHub repo (see below).
2. [vercel.com](https://vercel.com) → **Add New → Project** → import the repo.
3. **Before clicking Deploy**, go to **Environment Variables** and add exactly these
   two (Production **and** Preview):
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```
   This is the single most common cause of a failed or broken deploy — the build (or
   the live app) can't reach Supabase without them. Copy the exact same values from
   your working `.env.local`, don't retype them from memory.
4. **Deploy**.

If the build fails on Vercel, open the failed deployment and read the **full** log —
scroll past "Creating an optimized production build..." to the actual error text
underneath it, then fix that specific error. Comparing it against a successful local
`npm run build` output is the fastest way to spot the difference.

### Push to GitHub

```bash
git init
git add .
git commit -m "Agency CRM MVP"
git remote add origin https://github.com/YOUR-USERNAME/agency-crm.git
git branch -M main
git push -u origin main
```

---

## How roles/permissions work

Enforced in Postgres via RLS policies in `schema.sql` — e.g. a `client`-role session
literally cannot `select` from `leads`, no matter what the frontend does.

- **owner** — full access
- **management** — clients, leads, projects, tasks, content (no user/role management)
- **employee** — sees only what's assigned to them
- **client** — sees only their own client record, and only content in an
  approval-facing stage

## Known simplification (MVP scope)

Client approvals in `/portal` write a row to the `approvals` table but do **not**
automatically move the content item to its next stage — that requires either a
Postgres trigger or the automation engine described as a later phase. Right now,
advance `content_items.stage` manually from the Table Editor or build the trigger
next.

## Next phases

Client onboarding checklists, content calendar with backward-calculated deadlines,
an automation/escalation engine, employee performance dashboard, file/asset storage,
notifications, reporting/export — see the original product spec for full detail.
