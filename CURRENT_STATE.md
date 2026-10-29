# COD Confirmer: Current State (audit, 2026-10-29)

How this audit was done: every tracked file was read, `npm run build` was run (it passes), and the
original request was taken from the first chat session that built the app. The app was **not**
clicked through in a browser during this audit, and no live Supabase project or Vercel deployment
was inspected. Anything that depends on those is marked **unverified**.

Legend: ✅ works (by code reading + successful build) · 🟡 partly works · ❌ missing

---

## 1. Tech stack, versions, folder structure

| Item | Version (installed in `node_modules`) | Declared in `package.json` |
|---|---|---|
| Node.js (this machine) | 22.23.4 | not pinned (no `engines` field) |
| Next.js (App Router, Turbopack build) | 16.4.3 | `^16.4.3` |
| React / React DOM | 19.3.1 | `^19.3.1` |
| @supabase/supabase-js | 2.118.0 | `^2.118.0` |
| Language | Plain JavaScript (no TypeScript) | |
| Styling | One hand-written CSS file, `app/globals.css` (252 lines), no CSS framework | |
| Tests / linter | None | |

The whole app is one client-side page (`'use client'`). There are no API routes and no server code
except the PWA icon generator. All database calls go straight from the browser to Supabase.

```
app/
  layout.js              <html lang="en">, page title, theme colour
  page.js                renders <App />
  globals.css            all styles (light + dark mode)
  manifest.js            PWA manifest ("Add to Home screen")
  icon.svg               favicon
  pwa-icon/[size]/route.js  generates 192/512 PNG icons at build time
components/
  App.js                 login check, data loading, tabs, toast/undo, CSV export
  Login.js               email one-time code login
  LangToggle.js          English / Urdu switch
  OrderForm.js           add / edit order sheet
  OrderCard.js           one order + status buttons
  TodayView.js           daily view
  OrdersView.js          all orders, search, status filter
  SettingsView.js        shop name, message language, sign out
lib/
  data.js                all reads/writes (Supabase, or localStorage in demo mode)
  supabase.js            creates the Supabase client from env vars
  phone.js               phone normalising/formatting
  messages.js            WhatsApp message text + wa.me links
  csv.js                 courier CSV builder + download
  i18n.js                English + Roman Urdu dictionary
supabase/schema.sql      tables, view, RLS policies (paste into Supabase SQL editor)
.env.local.example       template for the two Supabase env vars
.claude/launch.json      dev-server config for Claude Code (committed)
README.md                beginner setup guide
```

---

## 2. Features from the original request

### Version one features

| # | Requested | Status | Notes |
|---|---|---|---|
| 1 | Add an order in under 20 seconds: name, WhatsApp number, city, items, amount (Rs) | ✅ | `components/OrderForm.js`. Phone field first; returning customers get name/city/address auto-filled; city suggestions list. The "under 20 seconds" goal itself is **unverified** (not timed). Also has an optional Address field. |
| 2 | "Send confirmation" opens WhatsApp via wa.me with a Roman Urdu message | ✅ | `lib/messages.js`. Text matches the requested template, plus a city/address line and optional shop name. Available on the form ("Save & send on WhatsApp") and on every Waiting order card. English version also exists (chosen in Settings). |
| 3 | Statuses Waiting, Confirmed, Cancelled, Shipped, Delivered, Refused, one tap each | ✅ | Next-step buttons on the card; "More ▾" shows all six as chips. 5-second Undo toast after each change. |
| 4 | Red warning on a new order if that number refused before, with count | ✅ | Shown in the form as soon as the number is valid, and on every order card. Counts come from the `customer_refusals` view. Counts are per seller only (by design, because of RLS). |
| 5 | Daily view: confirmed orders ready to ship, waiting orders with "Remind" | ✅ / 🟡 | `components/TodayView.js` also shows a "Shipped" section. 🟡 It is not filtered by date: it shows **all** orders currently in those statuses, not only today's. Whether that matches the intent is a judgement call. |
| 6 | Export confirmed list as CSV for the courier | 🟡 | `lib/csv.js`. Works and offers to mark them Shipped afterwards. Columns are generic (Order ID, Customer Name, Phone, City, Address, Items, COD Amount, Order Date); not matched to any specific courier's bulk-upload template (TCS, Leopards, PostEx, etc.). Upload acceptance by any courier is **unverified**. |

### Rules

| Rule | Status | Notes |
|---|---|---|
| Roman Urdu / English toggle | 🟡 | Covers nearly all UI text; gaps listed in section 6. |
| Big buttons | ✅ | Buttons 50px+ tall, inputs 52px, text 17–18px (`app/globals.css`). |
| Works on a cheap Android phone | 🟡 | Light bundle, no heavy libraries, PWA manifest present. No service worker, so nothing works offline. Not tested on a real low-end device (**unverified**). |
| Login with email so data survives a lost phone | ✅ (code) | Email one-time code via Supabase. Working end to end is **unverified** (no Supabase project is connected on this machine; see section 8). |
| Never message a customer automatically | ✅ | The app only builds wa.me links; the seller presses send in WhatsApp. |

### Version two (requested for later)

| Item | Status |
|---|---|
| Automatic confirmations via WhatsApp Business Cloud API with approved template | ❌ Not built (intentionally; README describes the plan) |
| Customer reply updates the order automatically | ❌ Not built (intentionally) |

### Tech / delivery

| Item | Status |
|---|---|
| Next.js | ✅ |
| Supabase database | ✅ schema written; ❓ whether it has been run in a real Supabase project is **unverified** |
| Deployed free on Vercel | ❌ No evidence of a deployment (see section 8) |
| Beginner explanations | ✅ `README.md` is a step-by-step beginner guide |

---

## 3. Database schema and row-level security

Source: `supabase/schema.sql`. This describes what the file **would** create. Whether it has
actually been run in a Supabase project is **unverified**.

### Table `public.orders`

| Column | Type | Rules |
|---|---|---|
| `id` | uuid | primary key, default `gen_random_uuid()` |
| `user_id` | uuid | not null, default `auth.uid()`, FK → `auth.users(id)` on delete cascade |
| `customer_name` | text | not null, 1–100 chars |
| `phone` | text | not null, must match `^92[0-9]{10}$` |
| `city` | text | not null, default `''` |
| `address` | text | not null, default `''` |
| `items` | text | not null, 1–500 chars |
| `amount` | integer | not null, `> 0` (whole rupees) |
| `status` | text | not null, default `'waiting'`, one of waiting/confirmed/cancelled/shipped/delivered/refused |
| `messages_sent` | integer | not null, default 0 |
| `last_message_at` | timestamptz | nullable |
| `status_changed_at` | timestamptz | not null, default `now()` |
| `created_at` | timestamptz | not null, default `now()` |

Indexes: `(user_id, created_at desc)`, `(user_id, phone)`.

### Table `public.shops`

| Column | Type | Rules |
|---|---|---|
| `user_id` | uuid | primary key, default `auth.uid()`, FK → `auth.users(id)` on delete cascade |
| `shop_name` | text | not null, default `''`, max 60 chars |
| `message_lang` | text | not null, default `'ur'`, `'ur'` or `'en'` |
| `updated_at` | timestamptz | not null, default `now()` (set by the app, no trigger) |

### View `public.customer_refusals`

`select phone, count(*) as refused from orders where status = 'refused' group by user_id, phone`,
created `with (security_invoker = true)` so it obeys the `orders` RLS policies.

### Row-level security

| Object | RLS enabled in schema.sql? | Policies |
|---|---|---|
| `orders` | ✅ Yes | select / insert / update / delete, all `to authenticated`, all `user_id = auth.uid()` |
| `shops` | ✅ Yes | select / insert / update `to authenticated`, `user_id = auth.uid()`. No delete policy (so sellers cannot delete their shop row; probably fine). |
| `customer_refusals` (view) | n/a (views have no RLS) | `security_invoker = true`, so it inherits `orders` RLS. Granted `select` to `authenticated`. |

Whether RLS is **actually on** in a live project: **unverified** (depends on schema.sql having been run).

---

## 4. Phone numbers: storage and comparison

- **Stored as** a 12-digit text string `92XXXXXXXXXX` (e.g. `923001234567`), enforced by the
  database check `^92[0-9]{10}$`.
- **Normalising** (`lib/phone.js` → `normalizePhone`): strips all non-digits, then accepts
  `0092…`, `92` + 10 digits starting with 3, `03` + 9 digits, or `3` + 9 digits. Anything else
  returns `null` and the form shows "Enter a Pakistani mobile number".
- **Compared** by exact string equality on the normalised value: refusal counts
  (`refusals[order.phone]`), returning-customer lookup (`o.phone === phone`).
- **Displayed** as `0300-1234567` (`displayPhone`); exported to CSV as `03001234567` (`localPhone`).
- **Search** (`OrdersView.js`): strips non-digits and one leading 0 from the query, then does a
  substring match on the stored number (needs 3+ digits).
- Edge cases: only Pakistani mobiles are accepted; landlines and foreign numbers are rejected.
  `+92 0300 1234567` (with the extra 0) is rejected. The database check does not require the
  third digit to be `3`, but the app does.

---

## 5. Auth setup

- **Email one-time code (OTP), with magic link as a fallback.** No passwords.
- `components/Login.js` calls `supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } })`,
  then `supabase.auth.verifyOtp({ email, token, type: 'email' })` with the typed code.
- The code only appears in the email if the seller edits the Supabase "Magic Link" and
  "Confirm signup" email templates to include `{{ .Token }}` (README Part 2, step 4). Whether that
  was done is **unverified**.
- Clicking the link in the email instead should also work through supabase-js's default URL
  session detection (**unverified**; requires Site URL / Redirect URLs set in Supabase).
- Sign-ups are open: anyone with the URL can create an account (Supabase default). Each account
  only sees its own data because of RLS.
- If the two env vars are missing, there is **no login at all** ("demo mode", data in the browser's
  localStorage).

---

## 6. Roman Urdu / English toggle coverage

The toggle (`components/LangToggle.js`) is on the top bar, the login screen and Settings. Choice is
saved in localStorage (`cod-confirmer-lang`). All labels go through `t()` in `lib/i18n.js`, and the
`ur` dictionary has an entry for every `en` key, so almost the whole UI switches.

Not covered / always English:
- **Error messages from Supabase** (login errors, the load-error banner, and the text in brackets
  after "Could not save…") are shown raw, in English.
- Toggle button labels "English" / "Urdu" and the message-language buttons "Roman Urdu" / "English"
  (arguably intentional).
- App name "COD Confirmer", the `aria-label="Language"`, the amount placeholder "2500", "Rs".
- `<html lang="en">` never changes.
- The app always starts in English for a split second before the saved language loads
  (state default is `'en'`, read from localStorage after mount).

Customer **messages** have their own separate language setting (Settings → "Language of customer
messages", default Roman Urdu), independent of the app UI language.

---

## 7. Known bugs, TODOs, hardcoded values, production risks

No `TODO` or `FIXME` comments exist in the code.

### Bugs (found by reading code; not reproduced in a browser)

1. **Amount with a decimal point is misread.** `OrderForm.js` strips every non-digit, so
   `2500.50` becomes `250050` and `2.5k` becomes `25`. Commas are fine (`2,500` → `2500`).
2. **CSV "mark as Shipped" always reports success.** `exportForCourier` in `App.js` shows
   "N orders marked Shipped" even if some updates failed (each failure briefly shows an error toast
   that is then overwritten).
3. **Only the newest 1,000 orders are loaded** (`listOrders` `.limit(1000)`). After that, older
   Waiting/Confirmed orders disappear from Today/Orders, and returning-customer auto-fill misses them.
   Refusal counts are not affected (they come from the view).
4. **"Save & send" opens WhatsApp before saving.** If the save then fails, the customer may already
   have the message but the order is not stored; retrying opens WhatsApp again.
5. **Message counter counts taps, not sends.** Tapping Send/Remind increments `messages_sent`
   even if the seller backs out of WhatsApp.
6. **Deleting a refused order erases that refusal from history** (hard delete), so the red warning
   can be lost.
7. **No live sync between devices.** A second phone/computer sees changes only after reload.
8. Two quick status taps on the same order can race: each update is sent independently, and the
   last response to arrive wins (**unverified** in practice).

### Hardcoded values

| Value | Where |
|---|---|
| Common cities list (16 Pakistani cities) | `components/OrderForm.js` |
| Message templates (Roman Urdu and English) | `lib/messages.js` |
| Theme colour `#0b7a4b`, background `#f3f5f4` | `app/layout.js`, `app/manifest.js`, `app/pwa-icon/[size]/route.js`, `globals.css` |
| Load limit 1000 orders; page size 50 | `lib/data.js`, `components/OrdersView.js` |
| Undo/toast 5 s; 400 ms delay before "mark shipped?" | `components/App.js` |
| Settings preview sample (Ayesha, 2 lawn suits, Rs 4500, Lahore) | `components/SettingsView.js`, `lib/i18n.js` |
| localStorage keys `cod-confirmer-lang`, `cod-confirmer-demo` | `App.js`, `lib/data.js` |
| Number format `en-PK`, CSV date `en-GB` (dd/mm/yyyy) | `lib/messages.js`, `lib/csv.js` |
| Pakistani-only phone rules | `lib/phone.js`, `supabase/schema.sql` |
| CSV Order ID = first 8 chars of the UUID (not a sequential number) | `lib/csv.js` |

No secrets are hardcoded. Supabase URL/key come from env vars; `.env.local` is git-ignored and
does not exist on this machine.

### Things that would break or hurt in production

1. **Silent demo mode.** If `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` are missing
   on Vercel, the live site runs with no login and stores orders only in each browser. A yellow
   banner appears, but nothing stops a seller from using it and losing data.
2. **Supabase's built-in email is rate-limited** (a few emails per hour). Real sellers will fail to
   log in until custom SMTP (e.g. Resend, Brevo) is set up. README mentions this; setup is
   **unverified**.
3. **Supabase free projects pause after ~1 week of no use.** The app would show load errors until
   someone restores it.
4. **Supabase Site URL / Redirect URLs** must be set to the Vercel address, or email links go to
   the wrong place.
5. **No offline support.** On a weak connection, saves fail with "Could not save" (the screen rolls
   back the change).
6. Open sign-ups: anyone can create an account (data is still isolated by RLS).
7. No tests, no error boundary, no monitoring/logging.

---

## 8. Git and deployment

- **Git:** ✅ Yes. One branch `main`, one commit `dafd7b7 "COD Confirmer version one"`. Working tree
  was clean at audit start.
- **GitHub:** ✅ Remote `origin` = `https://github.com/SheikhAbdullahNasir/cod-confirmer.git`.
  `git ls-remote` shows the remote `main` at the same commit `dafd7b7`, so GitHub is up to date.
  The public GitHub API returns 404 for the repo, which means it is **private** (or not visible
  without login).
- **Vercel / any deployment:** ❌ **No evidence of a deployment.** There is no `.vercel` folder, no
  `vercel.json`, and earlier chat sessions only mention placeholder addresses
  (`cod-confirmer-abc.vercel.app`). Whether a Vercel project was created through the website is
  **unverified**.
- **Supabase:** ❓ **No evidence it is connected.** There is no `.env.local` on this machine, so
  `npm run dev` here runs in demo mode. Earlier chats only mention the placeholder
  `abcdefgh.supabase.co`. Whether a Supabase project exists and `schema.sql` was run is
  **unverified**.
- **Build:** ✅ `npm run build` succeeds (Next.js 16.4.3, Turbopack). Routes: `/` (static),
  `/manifest.webmanifest`, `/icon.svg`, `/pwa-icon/192`, `/pwa-icon/512`.
