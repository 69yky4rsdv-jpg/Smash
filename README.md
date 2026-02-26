## VelvetStream – Subscription Video Platform (Prototype)

This is a **Next.js + Tailwind CSS** prototype for a subscription-based adult video platform inspired by the Brazzers-style layouts you provided.

### Features

- **Age gate** modal as soon as the site loads (18+ confirmation, exits otherwise).
- **Home page** with hero banner, best-value pricing strip, latest videos, and trending section.
- **Pricing page** with 12-month, 30-day, and 7-day style membership cards.
- **Auth**:
  - `admin@velvetstream.test` / `admin` demo account.
  - Email + password **login** and **register** flows.
- **Admin CMS**:
  - Add videos (title, description, thumbnail URL, video URL, categories, models).
  - Manage models (add + toggle active/hidden).
  - Manage categories (add new chips).
  - Manage users & subscriptions (assign/unassign plans).
- **Affiliate signup page** with application form.
- Black background with **pink gradient accents** and pill-shaped gradient buttons.

> Note: All data (users, videos, models, categories, subscriptions) is stored **in memory** in `src/lib/data.ts`. It is meant for demo/testing only and will reset on each server restart or rebuild. Replace this with a real database (Prisma + Postgres, etc.) before production use.

### Getting started

1. Install dependencies:

```bash
npm install
```

2. Run the dev server:

```bash
npm run dev
```

3. Open `http://localhost:3000` in your browser.

4. Use the demo admin login:

```text
Email: admin@velvetstream.test
Password: admin
```

Then visit `/admin` to manage content.

### Where things live

- `app/layout.tsx` – global shell and theme.
- `app/page.tsx` – homepage (hero, latest, trending) with age gate + shell.
- `app/pricing/page.tsx` – membership pricing.
- `app/auth/login/page.tsx` – login form (calls `/api/auth/login`).
- `app/auth/register/page.tsx` – register form (calls `/api/auth/register`).
- `app/auth/logout/route.ts` – clears auth cookie and redirects home.
- `app/affiliate/page.tsx` – affiliate program pitch + signup form.
- `app/admin/page.tsx` – admin dashboard + server actions for CMS.
- `src/lib/types.ts` – TypeScript types for users, videos, models, plans, etc.
- `src/lib/data.ts` – in-memory demo data (including default admin user).
- `src/lib/auth.ts` – simple cookie-based auth helpers.
- `src/lib/admin.ts` – helper functions for admin CRUD logic.
- `app/(site)/AgeGate.tsx` – 18+ overlay.
- `app/(site)/Shell.tsx` – top navigation + footer.

### Next steps for production

- Swap the in-memory arrays for a proper database (e.g. Prisma + PostgreSQL).
- Integrate a payment provider (Stripe, CCBill, Crypto, etc.) for real subscriptions.
- Add a secure auth system (e.g. NextAuth) and password hashing.
- Lock down routes and API endpoints with proper authorization & rate limiting.
- Connect real video storage / streaming (e.g. S3 + Cloudfront, bunny.net, etc.).

