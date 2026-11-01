# Pakka: Current State (audit, 2026-10-29; updated 2026-10-30 after the rename)

Confirmed orders. Fewer refusals.

**Phase 4 step 5, part 2: case study (2026-11-01).** `docs/CASE_STUDY.md` added and linked from the README. Phase 4
is done. No app code changed. Section 22 has the details.

**Phase 4 step 5, part 1: secret scan, screenshots, README (2026-11-01).** The full git history was scanned and
is clean. `README.md` is now a short page for visitors, and the setup guide moved to `docs/SETUP.md`. No app code
changed. Section 21 has the details. The case study is still to come.

**Phase 4 step 4: database rule for refused orders (2026-11-01).** `schema.sql` now refuses to delete a Refused
order. Abdullah ran the SQL on the live project and confirmed the policy is there. No app code changed. Section 20
lists what was tested and what wasn't.

**CSV phone format and real-phone tests (2026-11-01).** The courier CSV now exports phones as `0300-1234567`.
WhatsApp opening and CSV download were verified by Abdullah on a real phone. Section 19 has the details.

**Phase 4 step 2: welcome copy (2026-11-01).** The slogan moved from the footer to under the "Pakka" wordmark,
and the footer is "Made for Instagram and WhatsApp sellers in Pakistan" again. Section 18 lists what was tested.

**Social preview follow-up (2026-11-01).** The preview image now survives a centred square crop, and the meta
description no longer repeats the slogan. Abdullah checked the icon and link previews on a real Android phone.
Section 17 has the details.

**Phase 4 step 1: logo (2026-11-01).** The placeholder "P" is replaced by the real mark, a "P" with a tick,
on the welcome and setup-error screens and in every icon. A social preview image was added. Section 16 lists
what was tested and what wasn't.

**Rename to Pakka (2026-10-30).** The app was called COD Confirmer until now. The name, slogan, "P" tile
and icons changed; features, layout and colours did not. The localStorage keys keep their old
`cod-confirmer-*` names on purpose, so existing demo data and language choice survive. Section 14 lists
what was tested.

**Phase 3 part 2 (2026-10-30).** The app is live at https://pakkapk.vercel.app and connected to Supabase.
Abdullah checked it on a real Android phone. Section 15 lists the facts and what is still unverified.

**Phase 3 part 1 (2026-10-30).** Login is now magic link only, and the app was tested for the first time
against a real Supabase project (login, saving, refusal warnings, settings, RLS with two accounts).
Section 13 lists what was tested. Items marked **verified** below were checked in that test, unless they
name section 15.

**Action row rule and toast (2026-10-30).** "···" now always shares the last row of action buttons, and
the status-change toast has new wording in both languages. Section 12 lists what was tested.

**Phase 2 polish pass (2026-10-30).** Roman Urdu wording updated (Shipped is now "Ship ho gaya"
everywhere), all six chips in the "···" sheet are light, "Remind" is narrower, and the welcome content
is centered vertically. Section 11 lists what was tested.

**Phase 2 UI redesign (2026-10-30).** The whole interface was redone to match `PROJECT_SPEC.md`
sections 3 and 4: "warm local" colours (cream, deep green, mustard), Plus Jakarta Sans, light mode
only, new app shell, new order card with a "···" bottom sheet, redesigned Today / Orders / order form
/ welcome / Settings / setup-error screens, and friendly translated error messages. The data layer
(`lib/data.js`, `lib/supabase.js`, `supabase/schema.sql`) was not changed. Section 10 lists what was
tested.

**Fixes round (2026-10-29).** Six changes were made after the audit: amount parsing, real
results for CSV "mark as Shipped", save-before-WhatsApp, Refused orders can't be deleted, explicit
demo mode (with sample orders and a production config-error screen), and `<html lang>` following
the toggle. They were tested in the browser in demo mode (`npm run dev`, no Supabase) and with a
production build (`next start`, no Supabase). Nothing was tested against a live Supabase project.
Sections below are updated to match; section 9 lists what was tested.

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
| Styling | One hand-written CSS file, `app/globals.css` (~365 lines); every colour is a CSS variable on `:root`. Font: Plus Jakarta Sans via `next/font/google` (downloaded at build time, served from the site), no CSS framework | |
| Tests / linter | None | |

The whole app is one client-side page (`'use client'`). There are no API routes and no server code
except the icon and preview image generators, which run at build time. All database calls go straight from the browser to Supabase.

```
app/
  layout.js              <html lang="en"> (App.js changes it to match the language), page title, theme colour
  page.js                renders <App />
  globals.css            all styles and colour variables (light mode only; dark mode is a later phase)
  manifest.js            PWA manifest ("Add to Home screen")
  icon.svg               favicon
  apple-icon.js          generates the 180×180 iPhone home-screen icon at build time
  opengraph-image.js     generates the 1200×630 social preview image at build time
  pwa-icon/[size]/route.js  generates 192, 512 and maskable PNG icons at build time
assets/fonts/            Plus Jakarta Sans 400 and 700 as woff, for the preview image, with OFL.txt
components/
  App.js                 login check, demo on/off, config-error screen, data loading, tabs, toast/undo, CSV export
  Login.js               email sign-in link + "Try demo" button
  LangToggle.js          "EN | Urdu" language chip
  Brand.js               logo tile, "Pakka" wordmark and slogan
  Mark.js                the logo's shape and colours, the one source of truth
  Icons.js               bottom bar icons
  OrderForm.js           add / edit order sheet
  OrderCard.js           one order + main action button, and the "···" bottom sheet
  TodayView.js           daily view
  OrdersView.js          all orders, search, status filter
  SettingsView.js        shop name, message language, sign out
lib/
  data.js                all reads/writes (Supabase, or localStorage in demo mode) + demo sample orders
  supabase.js            creates the Supabase client from env vars; `configMissing` flag
  phone.js               phone normalising/formatting (also formats as you type)
  format.js              Title Case for names/cities, amount commas while typing
  messages.js            WhatsApp message text + wa.me links
  csv.js                 courier CSV builder + download
  i18n.js                English + Roman Urdu dictionary
supabase/schema.sql      tables, view, RLS policies (paste into Supabase SQL editor)
.env.local.example       template for the two Supabase env vars
.claude/launch.json      dev-server config for Claude Code (committed)
README.md                short page for visitors
docs/SETUP.md            beginner setup guide
docs/CASE_STUDY.md       case study, written by Abdullah
docs/banner.png          static copy of the social preview image, for the README
docs/screenshots/        README screenshots (committed; the root screenshots/ folder stays git-ignored)
```

---

## 2. Features from the original request

### Version one features

| # | Requested | Status | Notes |
|---|---|---|---|
| 1 | Add an order in under 20 seconds: name, WhatsApp number, city, items, amount (Rs) | ✅ | `components/OrderForm.js`. Phone field first; returning customers get name/city/address auto-filled; city suggestions list. The "under 20 seconds" goal itself is **unverified** (not timed). Also has an optional Address field. Amount accepts digits and commas, and decimals are rounded to whole rupees (`2,500.50` → 2501); anything else (`2.5k`, `Rs 2500`) shows "Enter the amount in rupees using numbers only, like 2500 or 2,500" (both languages). |
| 2 | "Send confirmation" opens WhatsApp via wa.me with a Roman Urdu message | ✅ | `lib/messages.js`. Text matches the requested template, plus a city/address line and optional shop name. Available on the form ("Save & send on WhatsApp") and on every Waiting order card. English version also exists (chosen in Settings). "Save & send" now saves first: an empty window is opened during the tap (so phones don't block it), then sent to WhatsApp only after the save succeeds, or closed if the save fails. If the browser blocks even the empty window, WhatsApp opens in the same tab after saving. **Verified** on a real phone on the live site, in Chrome and in the home-screen app: the WhatsApp app opened with the message filled in (section 19). |
| 3 | Statuses Waiting, Confirmed, Cancelled, Shipped, Delivered, Refused, one tap each | ✅ **verified** | One main action per card (Send confirmation / Mark confirmed + Remind / Mark shipped / Mark delivered + Mark refused); the "···" button opens a bottom sheet with all six statuses, Open chat in WhatsApp, Edit, Delete. 5-second Undo toast after each change. Status changes, Undo, edit and delete were confirmed in the real database. |
| 4 | Red warning on a new order if that number refused before, with count | ✅ **verified** | Shown in the form as soon as the number is valid, and on every order card. Counts come from the `customer_refusals` view. Counts are per seller only (by design, because of RLS; a second account saw no warning for the same number). |
| 5 | Daily view: confirmed orders ready to ship, waiting orders with "Remind" | ✅ / 🟡 | `components/TodayView.js` also shows a "Shipped" section. 🟡 It is not filtered by date: it shows **all** orders currently in those statuses, not only today's. Whether that matches the intent is a judgement call. |
| 6 | Export confirmed list as CSV for the courier | 🟡 | `lib/csv.js`. Works and offers to mark them Shipped afterwards (**verified** against the real database, with the file captured in the page rather than downloaded); the toast now reports the real result ("8 orders marked Shipped", or "8 marked Shipped, 2 failed…"). Columns are generic (Order ID, Customer Name, Phone, City, Address, Items, COD Amount, Order Date); not matched to any specific courier's bulk-upload template (TCS, Leopards, PostEx, etc.). Phones are exported as `0300-1234567`, so spreadsheet apps keep the leading 0. Upload acceptance by any courier is **unverified**, including whether courier portals accept the dash. A real file download is **verified** on a real phone, in Chrome and in the home-screen app, and the file opened in Excel (section 19). The new phone format is **verified** in WPS Office on a real Android phone; Google Sheets on the phone was not tested (section 19). |

### Rules

| Rule | Status | Notes |
|---|---|---|
| Roman Urdu / English toggle | 🟡 | Covers nearly all UI text; gaps listed in section 6. Urdu **verified** on a real Android phone (section 15). |
| Big buttons | ✅ | Every button and input is at least 48px tall (main buttons and inputs 52px); body text 16px, meta text 14px. Checked in the browser at 360px and 412px. |
| Works on a cheap Android phone | 🟡 | Light bundle, no heavy libraries, PWA manifest present. No service worker, so nothing works offline. The live site works on Abdullah's Android phone (section 15), but that was not a low-end device test (**unverified**). |
| Login with email so data survives a lost phone | ✅ **verified** | Email sign-in link via Supabase. Two accounts logged in end to end on `localhost`. Signing in again on the same account was skipped to save emails (persistence was checked by reloading and reading the database). Magic link login also **verified** on the live site, on a real Android phone in Chrome (section 15). |
| Never message a customer automatically | ✅ | The app only builds wa.me links; the seller presses send in WhatsApp. |

### Version two (requested for later)

| Item | Status |
|---|---|
| Automatic confirmations via WhatsApp Business Cloud API with approved template | ❌ Not built (intentionally; `docs/SETUP.md` describes the plan) |
| Customer reply updates the order automatically | ❌ Not built (intentionally) |

### Tech / delivery

| Item | Status |
|---|---|
| Next.js | ✅ |
| Supabase database | ✅ **verified**: `schema.sql` was run in a real Supabase project by Abdullah, and the app reads and writes it |
| Deployed free on Vercel | ✅ https://pakkapk.vercel.app (see section 8) |
| Beginner explanations | ✅ `docs/SETUP.md` is a step-by-step beginner guide |

---

## 3. Database schema and row-level security

Source: `supabase/schema.sql`. It has been run in a real Supabase project (**verified**: the app's
inserts, updates, deletes, the view and the shop upsert all work against it). Schema unchanged in
Phase 3 part 1. The one later change is the `orders` delete policy below, which Abdullah also ran on the
live project (section 20).

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
| `orders` | ✅ Yes | select / insert / update, all `to authenticated`, all `user_id = auth.uid()`. Delete (`"orders: delete own"`), `to authenticated`: `user_id = auth.uid() and status <> 'refused'` (in the live project too, confirmed from `pg_policies`, section 20). |
| `shops` | ✅ Yes | select / insert / update `to authenticated`, `user_id = auth.uid()`. No delete policy (so sellers cannot delete their shop row; probably fine). |
| `customer_refusals` (view) | n/a (views have no RLS) | `security_invoker = true`, so it inherits `orders` RLS. Granted `select` to `authenticated`. |

RLS in the live project: ✅ **verified** with two accounts and signed out (section 13). A second account
saw none of the first account's orders, refusal counts or shop, and reading, updating or deleting the
first account's order by id returned 0 rows. Signed out, reads and updates returned 0 rows and an insert
was refused (401).

---

## 4. Phone numbers: storage and comparison

- **Stored as** a 12-digit text string `92XXXXXXXXXX` (e.g. `923001234567`), enforced by the
  database check `^92[0-9]{10}$`.
- **Normalising** (`lib/phone.js` → `normalizePhone`): strips all non-digits, then accepts
  `0092…`, `92` + 10 digits starting with 3, `03` + 9 digits, or `3` + 9 digits. Anything else
  returns `null` and the form shows "Enter a Pakistani mobile number".
- **Compared** by exact string equality on the normalised value: refusal counts
  (`refusals[order.phone]`), returning-customer lookup (`o.phone === phone`).
- **Displayed and exported to CSV** as `0300-1234567` (`displayPhone`). `localPhone` in `lib/phone.js`
  (`03001234567`) is no longer used by anything.
- **Search** (`OrdersView.js`): strips non-digits and one leading 0 from the query, then does a
  substring match on the stored number (needs 3+ digits).
- Edge cases: only Pakistani mobiles are accepted; landlines and foreign numbers are rejected.
  `+92 0300 1234567` (with the extra 0) is rejected. The database check does not require the
  third digit to be `3`, but the app does.

---

## 5. Auth setup

- **Magic link only** (**verified**). No passwords and no code. On the free plan without custom SMTP,
  Supabase email templates can't be edited, so emails contain only a sign-in link.
- `components/Login.js` calls `supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } })`,
  then shows "Check your email and tap the sign-in link. Open it on this phone.", the email address, a
  **Send again** button with a 60-second cooldown (counted from the clock, so it keeps correct time
  while the seller is in their email app), and a "Use a different email" link.
- Returning from the link: supabase-js picks up the session from the address (its default "implicit"
  flow, so the link works in any browser, and logs in whichever browser opened it). `lib/supabase.js`
  notes what the address contained before the client removes it, and `App.js` then clears what
  supabase-js leaves behind (a bare `#`, or a failed link's error text). The seller lands on Today.
- A link that expired or was already used returns to the welcome screen with the email field open and
  `errLinkExpired`.
- Tapping a link turns demo mode off, so a seller who tried the demo while waiting for the email lands
  in their real account. (Tested with a failed link only. It was not tested with a successful link.)
- Supabase **URL Configuration** (set by Abdullah): Site URL is `https://pakkapk.vercel.app`; Redirect
  URLs are `https://pakkapk.vercel.app` and `http://localhost:3000`. The dev server must run on port 3000
  for links to return to it.
- Sign-ups are open: anyone with the URL can create an account (Supabase default). Each account
  only sees its own data because of RLS.
- **Demo mode is explicit.** The login screen has a **Try demo** button. Demo stores everything in
  this browser's localStorage (`cod-confirmer-demo` for data, `cod-confirmer-demo-on` = `'1'` while
  demo is on, so it survives a reload). On first entry it seeds 11 sample orders in all six statuses
  (Pakistani names, cities, items); Kamran Shah (0321-1234567, Multan) has 2 refused orders and a new
  Waiting one, so the red warning shows. While in demo, a thin "Demo mode" strip sits under the
  screen title, with **Reset** (asks first, then restores the sample orders) and **Exit** (back
  to the welcome screen; demo data is kept for next time). The welcome screen says demo data stays
  on this phone. Settings shows **Exit demo** instead of "Signed in as / Sign out" in demo.
- **Missing env vars:**
  - Production build (`next build` / Vercel): a "Setup is not finished" screen naming the two env
    vars. No login, no demo, even if a demo flag is left in the browser.
  - Development (`npm run dev`): the welcome screen hides **Log in with email** and shows only
    **Try the demo** (no error box).

---

## 6. Roman Urdu / English toggle coverage

The language chip (`components/LangToggle.js`) is on the top bar, the welcome screen and Settings. Choice is
saved in localStorage (`cod-confirmer-lang`). All labels go through `t()` in `lib/i18n.js`, and the
`ur` dictionary has an entry for every `en` key, so almost the whole UI switches.

Not covered / always English:
- Supabase error messages are no longer shown. Login errors become "Too many tries…" or "Something went
  wrong…", and a failed link shows "That sign-in link has expired or was already used…"; load and save
  errors use fixed friendly text. All of these are translated. The raw error goes to the browser console
  only.
- Language chip labels "EN" / "Urdu" and the message-language buttons "Roman Urdu" / "English"
  (intentional).
- City quick-pick chips (Karachi, Lahore, …) are city names, the same in both languages.
- App name "Pakka", the `aria-label="Language"`, the amount placeholder "2,500", "Rs", the social preview image.
- `<html lang>` now follows the toggle (`en` / `ur`), set from `App.js`. The server-rendered HTML
  still starts as `lang="en"` until the page loads.
- The app always starts in English for a split second before the saved language loads
  (state default is `'en'`, read from localStorage after mount).

Customer **messages** have their own separate language setting (Settings → "Language of customer
messages", default Roman Urdu), independent of the app UI language.

---

## 7. Known bugs, TODOs, hardcoded values, production risks

No `TODO` or `FIXME` comments exist in the code.

### Bugs (found by reading code; not reproduced in a browser)

1. ~~Amount with a decimal point is misread.~~ **Fixed:** digits and commas only, decimals rounded,
   anything else rejected with a message.
2. ~~CSV "mark as Shipped" always reports success.~~ **Fixed:** shows "N marked Shipped, M failed".
3. **Only the newest 1,000 orders are loaded** (`listOrders` `.limit(1000)`). After that, older
   Waiting/Confirmed orders disappear from Today/Orders, and returning-customer auto-fill misses them.
   Refusal counts are not affected (they come from the view).
4. ~~"Save & send" opens WhatsApp before saving.~~ **Fixed:** WhatsApp opens only after a successful save.
   Opening WhatsApp is **verified** on a real phone (section 19); the failed-save path was not tried there.
5. **Message counter counts taps, not sends.** Tapping Send/Remind increments `messages_sent`
   even if the seller backs out of WhatsApp.
6. ~~Deleting a refused order erases that refusal from history.~~ **Fixed in the app:** tapping
   Delete on a Refused order shows "Refused orders cannot be deleted. They are kept so you are
   warned if this number orders again." (both languages). **Now enforced in the database too:** the
   `orders` delete policy, in `schema.sql` and in the live project, also needs
   `status <> 'refused'` (section 20).
   - **Known gap, not fixed:** a seller can still change a Refused order to another status and then
     delete it. Closing that would need a separate refusal history table, which is out of scope.
   - **Blocked deletes look like successes to the app.** The database refuses by matching 0 rows, not
     with an error. If an order was marked Refused on another device and this one still shows the old
     status, Delete removes the card here, and it comes back on reload. Found by reading the code, not
     reproduced. Left as is, because this step changes no app code.
7. **No live sync between devices.** A second phone/computer sees changes only after reload.
8. Two quick status taps on the same order can race: each update is sent independently, and the
   last response to arrive wins (**unverified** in practice).
9. **Misleading message for a rejected email address.** If Supabase rejects an address as invalid, the
   seller sees `errNetwork` ("Check your internet…"), because the old `errBadCode` branch was removed
   with the code step. Found by reading the code, not reproduced. Left as is for now, by Abdullah's
   decision.

### Hardcoded values

| Value | Where |
|---|---|
| Common cities list (16 Pakistani cities; the first 7 are quick-pick chips) | `components/OrderForm.js` |
| Message templates (Roman Urdu and English) | `lib/messages.js` |
| Colours: all as variables in `app/globals.css` (table in `PROJECT_SPEC.md` 3.1/3.2). Browser bar / PWA background `#F6EFE3`. Generated images can't read CSS variables, so they use the same colours as hex | `app/layout.js`, `app/manifest.js`, `app/icon.svg`, `components/Mark.js`, `app/opengraph-image.js` |
| Site address for share links, `https://pakkapk.vercel.app` (`metadataBase`). If the domain changes, this must change too | `app/layout.js` |
| Load limit 1000 orders; page size 50 | `lib/data.js`, `components/OrdersView.js` |
| Undo/toast 5 s; 400 ms delay before "mark shipped?" | `components/App.js` |
| Settings preview sample (Ayesha, 2 lawn suits, Rs 4500, Lahore) | `components/SettingsView.js`, `lib/i18n.js` |
| localStorage keys `cod-confirmer-lang`, `cod-confirmer-demo`, `cod-confirmer-demo-on` (old name kept on purpose, so saved demo data and language survive the rename) | `App.js`, `lib/data.js` |
| Demo sample orders (11: names, phones, cities, items) | `lib/data.js` (`sampleData`) |
| Number format `en-PK`, CSV date `en-GB` (dd/mm/yyyy) | `lib/messages.js`, `lib/csv.js` |
| Pakistani-only phone rules | `lib/phone.js`, `supabase/schema.sql` |
| CSV Order ID = first 8 chars of the UUID (not a sequential number) | `lib/csv.js` |

No secrets are hardcoded. Supabase URL/key come from env vars; `.env.local` exists on this machine, is
git-ignored (`.gitignore` line 6), and has never been committed (**verified**).

### Things that would break or hurt in production

1. ~~Silent demo mode.~~ **Fixed:** a production build without `NEXT_PUBLIC_SUPABASE_URL` /
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` shows a configuration error screen. The env vars are baked in at
   build time, so after adding them on Vercel you must redeploy. Demo mode is still available on a
   configured live site via **Try demo** (data stays in that browser, and the banner says so).
2. **Supabase's built-in email is rate-limited** (**verified**: the third email within about 15 minutes
   was refused, and one about an hour after the first went through; that fits about two per hour for the
   whole project). A few sellers logging in together would get "Too many tries". Custom SMTP would fix it
   but stays out of scope for now.
3. **Supabase free projects pause after ~1 week of no use.** The app would show load errors until
   someone restores it.
4. **Supabase Site URL / Redirect URLs** must stay on the Vercel address (keep
   `http://localhost:3000` in Redirect URLs), or email links go back to `localhost:3000`. Set by Abdullah,
   and a magic link worked on the live site (section 15). If the domain ever changes, these must change too.
   Magic link makes this critical: there is no other way to log in.
5. **No offline support.** On a weak connection, saves fail with "Could not save" (the screen rolls
   back the change).
6. Open sign-ups: anyone can create an account (data is still isolated by RLS).
7. No tests, no error boundary, no monitoring/logging.
8. **Links used up before the seller taps them.** Each link works once, and simply opening it uses it up.
   An email security scanner or link preview that opens it first would leave the seller with the "expired
   or already used" message. This is the biggest risk of magic-link-only login. A browser request did use
   up a link this way during testing (section 13). Not seen from a real scanner yet.
9. **Link opening in the wrong browser.** If Gmail or another app opens the link in its own built-in
   browser, the seller is logged in there, not in Chrome or the home-screen app. The on-screen text asks
   them to open it on this phone, but it can't control which browser opens. Login worked on Abdullah's
   phone in Chrome (section 15); other email apps and browsers were not tested.
10. **Rejected email addresses** show a misleading "check your internet" message (section 7, bug 9).
11. **The Vercel domain is `pakkapk.vercel.app`**, because the plain "pakka" name was not available.

---

## 8. Git and deployment

- **Git:** ✅ Yes. One branch, `main`. Every change is committed and pushed to it.
- **GitHub:** ✅ Remote `origin` = `https://github.com/SheikhAbdullahNasir/pakka.git` (renamed from `cod-confirmer` on 2026-10-30).
  The repo is **public**, made so by Abdullah after the history scan in section 21 (the public GitHub API reports
  `"visibility": "public"`, checked 2026-11-01). It has no license (see the decisions log in `PROJECT_SPEC.md`).
- **Vercel:** ✅ **Deployed** at https://pakkapk.vercel.app (Vercel project `pakka`). It deploys
  automatically on every push to `main`. `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  are set for Production and Preview.
- **Supabase:** ✅ **Connected, on this machine and on the live site.** Region: Mumbai (`ap-south-1`).
  Abdullah created a project, ran `schema.sql` and put the two values in `.env.local`. Abdullah deleted all
  test orders and shops from the live project on 2026-11-01. Both test accounts still exist, with no data.
- **Build:** ✅ `npm run build` succeeds (Next.js 16.4.3, Turbopack; re-checked in Phase 3 part 1). Routes: `/` (static),
  `/manifest.webmanifest`, `/icon.svg`, `/apple-icon`, `/opengraph-image`, `/pwa-icon/192`, `/pwa-icon/512`, `/pwa-icon/maskable`.

---

## 9. Fixes round: what was tested (2026-10-29)

Browser: the Claude desktop app's built-in browser, phone-size viewport (375×812), no Supabase.

| Check | Result |
|---|---|
| Dev server, no env vars: login shows "Supabase is not connected…" + Try demo | ✅ |
| Try demo seeds 11 orders covering all six statuses | ✅ |
| Red "Refused 2 time(s) before!" on Kamran Shah's Waiting order | ✅ |
| Delete on a Refused order: blocked, message shown in English and Roman Urdu, order kept | ✅ |
| Language toggle sets `<html lang>` to `ur` / `en` | ✅ |
| Amount `2.5k` and `Rs 2500` rejected with the message; `2500` saved; `2,500.50` saved as 2501 | ✅ |
| Save & send: empty window opened during the tap, sent to wa.me only after the order was saved (`window.open` stubbed) | ✅ |
| CSV export with one update forced to fail: toast "1 marked Shipped, 1 failed…" | ✅ |
| Reset demo restores the 11 sample orders; demo survives a reload; Exit demo returns to login | ✅ |
| Production build (`next start`), no env vars: "Setup is not finished" screen, even with a demo flag set | ✅ |
| No console errors during the demo run | ✅ |

Not tested: real Supabase login and saves, the save-failure path of Save & send (demo saves can't
fail), WhatsApp actually opening on a real Android/iPhone browser, and the Urdu config-error text
on screen (the text exists in `lib/i18n.js`).

---

## 10. Phase 2 UI redesign: what was tested (2026-10-30)

Browser: the Claude desktop app's built-in browser at 360×780 and 412×860, in English and Roman Urdu.
Demo mode on the dev server (no Supabase), plus two production builds: one with placeholder Supabase
values (to see the email login and its error) and one with none (setup-error screen).

| Check | Result |
|---|---|
| No horizontal overflow, no clipped button text, no tap target under 48px: Today, Orders, Settings, "···" sheet, order form, welcome (both widths, both languages) | ✅ (checked with a script on every screen) |
| Urdu Shipped card: "Deliver mark karein" + "Refuse mark karein" are too wide for one row at 360px, so they stack, with "···" on its own row | ✅ (found and fixed during testing; layout replaced later, see section 12) |
| Today: sections in order Waiting / Ready to ship / Shipped, counts in headings, Export CSV in the Ready header, last card clears the bottom bar | ✅ |
| "···" sheet: six status chips with the current one marked ✓; choosing one closes the sheet and shows the 5-second Undo toast; Undo works | ✅ |
| Orders: filter chips (selected chip scrolls into view); search by last 4 digits (`4567`), by "0321-123", by items ("earbuds"), by name | ✅ |
| New order: number auto-formats to 0321-1234567; refusal warning + "Returning customer · 3 orders before" + name/city/address auto-filled; city chip highlighted and scrolled into view; amount shows "Rs 25,000"; Save only saved it | ✅ |
| Empty form: all five field errors shown | ✅ |
| Edit order: single "Save changes" button | ✅ |
| Welcome with Supabase configured: "Log in with email" reveals the email field in place; a failed request shows "Something went wrong. Check your internet and try again." | ✅ (placeholder Supabase address, so the request fails on purpose) |
| Production build with no env vars: setup-error screen in the welcome style, English and Urdu | ✅ |
| WCAG AA contrast for every colour pairing used (lowest 5.02:1) | ✅ `--text-secondary` darkened from `#6E6355` to `#665B4E` (was 4.45:1 on `--chip`) |
| `npm run build` | ✅ |

Not tested: a real phone, real Supabase login (the code step and the "code is wrong" message), the
save-failure message in the order form (demo saves can't fail), Save and send opening WhatsApp
(logic unchanged since the fixes round), and screen readers.

---

## 11. Phase 2 polish pass: what was tested (2026-10-30)

Browsers: headless Edge (scripted checks and screenshots) and the Claude desktop app's built-in browser,
at 360×780 and 412×860, in English and Roman Urdu, on the dev server in demo mode. A placeholder Supabase
address was used to show the email login, then removed.

| Check | Result |
|---|---|
| No horizontal overflow, no clipped button text, no tap target under 48px: welcome, Today, "···" sheet, Orders, Settings, order form (both widths, both languages) | ✅ |
| Waiting card with message sent, English: "Mark confirmed", "Remind" and "···" on one row at 360px and 412px | ✅ |
| Same card, Roman Urdu: does not fit on one row ("Confirm mark karein" + "Yaad dilaein" are too wide) | 🟡 Layout unchanged at the time: three rows at 360px, two rows at 412px (now two rows at both, see section 12) |
| "···" sheet: six light chips, Delivered no longer filled; only the current status has the dark border and ✓, checked with Waiting and with Delivered as the current status | ✅ |
| Urdu Shipped label shows "Ship ho gaya" on the card chip, filter chip and sheet; no "Bhej diya" left for the Shipped status | ✅ |
| Welcome: content centered, footer 24px from the bottom, no page scroll (with and without the email button) | ✅ |
| Setup-error screen, which shares the welcome layout, in a production build with no env vars (English, 360px): centered, no overflow | ✅ |
| Failed email request in Urdu shows the new `errNetwork` text | ✅ (placeholder Supabase address, so the request fails on purpose) |
| `npm run build` | ✅ |

Not tested: a real phone, and on screen the new `errLoad`, `errRateLimit`, `errBadCode`,
`markAllShipped`, `markedShipped` and `markedShippedFailed` strings (these need a real Supabase project
or a CSV export run). The text was checked in `lib/i18n.js` only.

Screenshots are in `screenshots/`, English plus `-ur` Urdu versions at 360px. The folder is git-ignored,
so they stay on this computer and are not on GitHub.

---

## 12. Action row rule and toast: what was tested (2026-10-30)

Browser: headless Edge (scripted checks and screenshots) at 360×780 and 412×860, in English and Roman
Urdu, on the dev server in demo mode. Every order card type was checked, on Today and on Orders.

| Card | 360px English | 360px Urdu | 412px English | 412px Urdu |
|---|---|---|---|---|
| Waiting, message sent | 1 row | 2 rows | 1 row | 2 rows |
| Waiting, not sent | 1 row | 1 row | 1 row | 1 row |
| Confirmed | 1 row | 1 row | 1 row | 1 row |
| Shipped | 2 rows | 2 rows | 1 row | 2 rows |
| Delivered, Cancelled, Refused | "···" only | "···" only | "···" only | "···" only |

| Check | Result |
|---|---|
| On every 2-row card, the first button is full width, and the second button and "···" share row two, with "···" at the right edge | ✅ |
| No horizontal overflow, no clipped button text, no tap target under 48px on any screen (both widths, both languages) | ✅ |
| Toast for all five status changes, each one undone: "Status changed to Shipped" / "Status badal gaya: Ship ho gaya". No overflow; the Urdu text wraps to two lines at 360px next to the Undo button | ✅ |
| `npm run build` | ✅ |

Not tested: a real phone. Replaced screenshots: `2-today-ur.jpg`, `4-orders-filter.jpg`, `4-orders-filter-ur.jpg`.

---

## 13. Phase 3 part 1: what was tested (2026-10-30)

Browser: the Claude desktop app's built-in browser at 360×780 on the dev server (`http://localhost:3000`),
against the real Supabase project. Two real accounts. Results were read from the screen and from the
database. For the RLS checks, a temporary line exposed the Supabase client in the browser console; it was
removed before commit and confirmed gone with `git diff`.

### Login

| Check | Result |
|---|---|
| Real link request: Supabase accepts it, screen shows the message, email address, cooldown and "Use a different email" | ✅ |
| Login from a real link, opened in the browser by Abdullah, accounts one and two: lands on Today, no demo strip, address is `http://localhost:3000/` with no tokens or `#` | ✅ |
| Session survives a reload | ✅ |
| Send again: disabled, counts down, enabled again when it reaches 0 | ✅ |
| Real rate limit: third email refused, "Too many tries" shown | ✅ |
| Internet-failure message, English and Urdu | ✅ (fake response) |
| Rate-limit message in Urdu | ✅ (fake response) |
| Used or expired link: message shown, email field open, address cleaned, demo switched off | ✅ (real used link seen by Abdullah; the detailed check used a made-up error address) |
| Long email wraps, no sideways scroll, buttons at least 48px | ✅ |
| Sign out: back to welcome, session removed | ✅ |

**The first real link was used up by Claude's own browser request, not by an app bug.** Claude tried to
open the pasted link, and the browser tool reported "denied or failed". Supabase's records show the
account was confirmed at 11:45:53 UTC, matching that attempt to within about a second, so the request most
likely reached Supabase and used up the one-time link even though the return to the app never landed.
Abdullah then saw the correct "expired or already used" message, requested a new link and logged in with
it. The fake-response tests did not cause the message. The same thing could happen to sellers through
email scanners (section 7, risk 8).

### App, signed in as account one

| Check | Result |
|---|---|
| Create orders (Save only, 3 orders; 1 throwaway order for delete) | ✅ rows confirmed in the database |
| Save and send: saved with message count 1 | ✅ (`window.open` faked, so WhatsApp itself was not opened) |
| Status change, then Undo, then change again | ✅ database went confirmed → waiting → confirmed |
| Change status from the "···" sheet | ✅ |
| Edit: one "Save changes" button; amount and items updated; message count unchanged | ✅ |
| Delete: gone from the screen and the database | ✅ |
| CSV export: correct 3 rows, then mark as shipped: "3 orders marked shipped" and all shipped in the database | ✅ (file captured in the page, no real download) |
| Reload: orders, statuses and section counts all came back | ✅ |
| Refusal warning: refused twice, form and card show "Refused once before", then "Refused 2 times before"; the view's count is 2; returning-customer auto-fill works | ✅ |
| Refused order can't be deleted | ✅ message shown |
| Settings: shop name and message language survive a reload; preview follows them | ✅ |
| No sideways scroll at 360px | ✅ |

### RLS

| Check | Signed out | Account two |
|---|---|---|
| Read all orders | 0 rows | 0 rows |
| Read account one's order by id | 0 rows | 0 rows |
| Update that order | 0 rows | 0 rows |
| Delete that order | not tried | 0 rows |
| `customer_refusals` view | 0 rows | 0 rows |
| `shops` | 0 rows | 0 rows |
| Insert an order | refused (401) | not tried |

Account two's app: empty Today, empty shop name, and no refusal warning or auto-fill for the number account
one refused twice. The update and delete attempts were not followed by a read as account one, because that
would have needed another email; the evidence is the 0 rows affected that Supabase returned.

### Try demo on the configured site

| Check | Result |
|---|---|
| 11 sample orders, demo strip shown, changes saved to `cod-confirmer-demo` in localStorage | ✅ |
| No requests to Supabase while in demo, and no login token stored | ✅ |

### Other

| Check | Result |
|---|---|
| `npm run build` | ✅ |
| `npm test` | Not run: the project has no test script (section 1) |

**Not tested:** signing in again on the same account (skipped by Abdullah's decision to save emails);
pressing Send again for real; a successful link while demo is on; a real file download; WhatsApp opening; a
real phone; a live site or Vercel; the rejected-email message; the new Urdu strings on the used-link
message (checked in `lib/i18n.js` only).

---

## 14. Rename to Pakka: what was tested (2026-10-30)

Browser: the Claude desktop app's built-in browser at 360×780 and 412×860, in English and Roman Urdu. Today
and Settings were checked on the dev server. Welcome and setup-error were checked on production builds, with
and without the Supabase settings. The welcome screen was also checked at 360×640.

| Check | Result |
|---|---|
| No sideways scroll, no clipped text, no tap target under 48px: welcome, Today, Settings, setup-error (both widths, both languages) | ✅ |
| Welcome: "P" tile with "Pakka" next to it. The slogan replaces the old footer line, so the screen is no taller, and it switches with the language | ✅ |
| Welcome with the email field and the error message open, 360×640: nothing clipped, but the page scrolls up and down (727px tall in English, 761px in Urdu). It fits at 360×780 and 412×860 | 🟡 Only on short phones. The tile row is the same height as the old tile, so the rename added no height |
| Setup-error screen: same tile, wordmark and slogan | ✅ |
| Tab title "Pakka · Confirmed orders. Fewer refusals.", meta description with the slogan, favicon is the "P" tile | ✅ |
| Manifest: name and short name "Pakka", description with the slogan, a maskable icon added | ✅ |
| Existing demo data under the unchanged `cod-confirmer-demo` key: all 11 orders still there, and unchanged after moving around and switching language. Language choice kept | ✅ |
| New demo on a clean browser: 11 orders, data survives a reload | ✅ |
| Expired link message in Urdu shows the new `errLinkExpired` | ✅ (made-up error address) |
| `npm run build` | ✅ |
| `npm test` | Not run: the project has no test script |

**Not tested:** installing the icon on a real phone, so how Android crops the maskable icon was not seen;
a real phone; a live site.

Left with the old name on purpose: the localStorage keys, and the local folder on this computer, which is
still called `COD Confirmer`. The Supabase project keeps whatever name it was given, which the app doesn't use.

The PNG home-screen icons draw "P" in a regular-weight font, because the icon generator only has that font
built in. The favicon and welcome tile are bold. This is left as is, because the tile is a placeholder.
(Gone since section 16: all icons are now drawn from paths, with no font.)

---

## 15. Phase 3 part 2: deployment (2026-10-30)

Docs only, no code changes. The facts below come from Abdullah; Claude did not test them.

- Live at https://pakkapk.vercel.app (Vercel project `pakka`, deploys automatically on push to `main`).
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set in Vercel for Production and
  Preview. The anon key value is Supabase's publishable key.
- Supabase project region: Mumbai (`ap-south-1`).
- Supabase Site URL: `https://pakkapk.vercel.app`. Redirect URLs: `https://pakkapk.vercel.app` and
  `http://localhost:3000`.
- The domain is `pakkapk.vercel.app` because the plain "pakka" name was not available.

Checked by Abdullah on a real Android phone in Chrome, on the live site:

| Check | Result |
|---|---|
| Welcome screen | ✅ |
| Try the demo | ✅ |
| Email login via magic link | ✅ |
| Urdu | ✅ |

**Still unverified:** a low-end device test. WhatsApp opening and CSV download were verified later (section 19).

`npm run build` passes (run by Claude).

---

## 16. Phase 4 step 1: logo and brand assets, what was tested (2026-11-01)

Browser: headless Edge at 1× pixel density, against production builds (`next start`) on this computer. Welcome
was checked with the Supabase settings, setup-error without them. Screenshots are in `screenshots/brand/`,
which is git-ignored.

The mark uses the given geometry exactly, with no optical tweaks. Two placement notes:
- With its tile, the mark is not mathematically centred: 4 units right of centre and 1 unit low on the 120 grid.
  The heavy stem on the left balances it by eye, so it was left alone, and Abdullah kept it. This also applies
  to the apple-touch icon.
- In the maskable icon, the mark is centred by its own bounds. The limit is the top and bottom of the stem.
- The welcome tile's corners went from a 16px radius (the old `.monogram` CSS, now removed) to about 13px,
  which is the given `rx` 28 at 56px. The tile's size and position did not change.

| Check | Result |
|---|---|
| `npm run build` | ✅ |
| `/icon.svg`: 200, `image/svg+xml`, 392 bytes, paths only, no `<text>` | ✅ |
| `/pwa-icon/192`, `/pwa-icon/512`: right size, rounded tile, transparent corners (alpha 0 measured) | ✅ |
| `/pwa-icon/maskable`: 512×512, opaque corners, no rounded corners | ✅ |
| Maskable, farthest painted pixel from the centre: 69.66% of the icon's width as a diameter, so inside the 70% circle. Screenshot with the 80% circle overlaid and with a real circular crop: nothing clipped | ✅ |
| `/apple-icon`: 180×180, opaque, square corners, linked as `apple-touch-icon` | ✅ |
| Manifest: unchanged, because the icon addresses stayed the same. All three entries load | ✅ |
| `/opengraph-image`: 1200×630, 43 KB. Content is 256px from the left and right edges, 129px from the top, 127px from the bottom (at least 80px required) | ✅ |
| Built HTML: `og:image` and `twitter:image` are absolute `https://pakkapk.vercel.app/opengraph-image?…` addresses, `twitter:card` is `summary_large_image`, `og:image:alt` and `twitter:image:alt` are set | ✅ |
| Mark at 32px: tick clearly a tick | ✅ |
| Mark at 16px: the P is clear and the mustard is visible. The rising stroke survives, but the short left arm merges into it, so it reads as a mustard hook more than a tick | ✅ Accepted as is by Abdullah, no variant made |
| Welcome at 360px and 412px, English and Urdu: tile, wordmark, headline and footer positions and sizes are identical to the old screen, measured before and after. No sideways or up-and-down scroll | ✅ |
| Setup-error at 360px and 412px, English and Urdu: tile right, no overflow | ✅ |
| Roman Urdu strings | None changed. `lib/i18n.js` was not touched |

**Not tested:** installing on a real Android phone or iPhone, so how the launcher crops the maskable icon and
how iOS rounds the apple-touch icon were only simulated; a real WhatsApp, LinkedIn or X link preview (these
need the deployed site, and they cache previews); a real browser tab's favicon at 16px (the 16px check drew
the file at that size in a page); the live site. (Abdullah has since checked the Android icon and the WhatsApp
and LinkedIn previews, see section 17.)

The font files are the Latin subset from `@fontsource/plus-jakarta-sans` 5.3.0, copied into the repo, not added
as a dependency. They hold Latin characters only, which is enough because the preview image is English only.

---

## 17. Social preview follow-up (2026-11-01)

WhatsApp and some other apps crop the preview image to a centred square, so everything now sits inside the
middle 560px (x 320 to 880). The slogan went from 40px to 34px, and "Made for Instagram and WhatsApp sellers in
Pakistan" is now two lines. The meta description, `og:description` and `twitter:description` are now "Confirm
cash-on-delivery orders on WhatsApp before they ship, and get warned about customers who refused before."

Tested by Claude on the image from the production build, in headless Edge:

| Check | Result |
|---|---|
| `npm run build` | ✅ |
| Full image: 1200×630, 43 KB. Content runs from x 329 to x 869 | ✅ |
| Top margin 115px, bottom margin 120px (was 129px and 127px, because the extra line makes the block taller; at least 80px required) | ✅ |
| Centred 630×630 crop: nothing clipped | ✅ |
| Built HTML: the description, `og:description` and `twitter:description` have the new text. `og:image` and `twitter:image` are absolute, `twitter:card` is `summary_large_image`, alt text is set | ✅ |
| Roman Urdu strings | None changed |

Checked by Abdullah on a real Android phone (2026-11-01). This was before this follow-up was deployed, so it
saw the wider image and the old description:

| Check | Result |
|---|---|
| Home screen icon: full-bleed and unclipped | ✅ |
| WhatsApp preview: image, title and domain show | ✅ |
| LinkedIn preview: image, title and domain show | ✅ |

**WhatsApp caches previews.** To see the new image there, re-check with `https://pakkapk.vercel.app/?v=2`.

Re-checked by Abdullah on a real Android phone in WhatsApp, after `febce44` deployed (2026-11-01):

| Check | Result |
|---|---|
| Square thumbnail: all content shows, unclipped | ✅ |
| Sent preview: shows the new description | ✅ |

**Not tested:** the new image and description in a real LinkedIn preview; an iPhone install.

---

## 18. Phase 4 step 2: welcome copy, what was tested (2026-11-01)

The slogan is now directly under the "Pakka" wordmark (14px, `--text-secondary`, weight 400) and switches with
the language. The footer is `welcomeFoot` in `lib/i18n.js`, which had been removed in the rename, so it was
added back with its old wording in both languages. The setup-error screen shares `Brand.js` and the same footer.

The English footer doesn't fit on one line at 360px. It first wrapped with "Pakistan" alone on line two, so
`.welcome-foot` got `text-wrap: balance`. It now reads "Made for Instagram and / WhatsApp sellers in Pakistan",
at the same height. An older browser without `text-wrap: balance` shows the first wrap, which is harmless.

Browser: headless Edge at 1× pixel density, against production builds (`next start`). The "before" numbers were
measured the same way on the previous commit, and they match section 14's 727px and 761px exactly. Supabase was
blocked during the runs, so no email was sent. "Error" was checked with both the expired-link message (a made-up
error address) and the internet-failure message (a blocked request). Both give the same height in every state.

Page height in px, before → after:

| Screen | State | English | Urdu |
|---|---|---|---|
| 360×780 | Default, email open, email and error | 780 → 780 | 780 → 780 |
| 412×860 | Default, email open, email and error | 860 → 860 | 860 → 860 |
| 360×640 | Default | 640 → 640 | 640 → 640 |
| 360×640 | Email open | 683 → 703 | 716 → 716 |
| 360×640 | Email and error | 727 → 748 | 761 → 761 |

The only growth is English at 360×640 with the email field open: 20px, or 21px with the error showing, from the
footer's second line. That is within the limit of about 20px Abdullah set. Short phones already scrolled in these
states. The tile row stays 56px tall, because the wordmark and slogan fit inside the tile's height.

| Check | Result |
|---|---|
| All 24 combinations of size, language and state: no sideways scroll, no clipped text, no element off screen, smallest tap target 48px | ✅ |
| Slogan: one line in every combination, 0px from the wordmark and 29px above the headline, switches with the language | ✅ |
| Content block centred above the footer, footer pinned to the bottom (24px gap) | ✅ |
| Setup-error in a production build with no env vars, at all three sizes, English and Urdu: new slogan and footer, no scroll, no overflow | ✅ |
| `npm run build` | ✅ |

New Roman Urdu string for Abdullah's review: `welcomeFoot`, "Pakistan ke Instagram aur WhatsApp sellers ke liye"
(the same wording used before the rename). No other Roman Urdu strings changed. The Urdu line fits on one line at
360px with almost no room to spare, so a phone with slightly wider text could wrap it to two lines.

**Not tested:** a real phone; the sent-link state, which needs a real email; the live site.

Screenshots are in `screenshots/welcome-copy/`, which is git-ignored.

---

## 19. CSV phone format and real-phone tests (2026-11-01)

### Real-phone tests by Abdullah

On the live site, on a real phone, logged in to a real account, in Chrome and in the home-screen app. The facts
come from Abdullah; Claude did not run these.

| Check | Result |
|---|---|
| Save and send on WhatsApp: the WhatsApp app opened with the message filled in; the order was saved and showed the message as sent | ✅ |
| Remind: the same | ✅ |
| Export CSV: the file downloaded and opened in Excel; the mark-as-shipped prompt worked | ✅ |
| Phone numbers in Excel | ❌ Leading 0 dropped (`3001234567`), because Excel treats the column as a number. Fixed below |

That was the only problem found.

### The fix

`lib/csv.js` now exports the Phone column with `displayPhone`, as `0300-1234567`. Nothing else in the CSV changed.

Tested by Claude: the real Export CSV button in demo mode on the dev server, in headless Edge, with the real
downloaded files compared before and after the change on identical orders. The test orders included commas, quotes
and a new line in names, cities, items and addresses, and text starting with `=`, `-`, `+` and `@`.

| Check | Result |
|---|---|
| Every phone is `03XX-XXXXXXX` and is the old number with a dash added | ✅ |
| Every other cell identical, same 8 columns in the same order, byte order mark kept | ✅ |
| Commas, quotes and a new line read back correctly with a strict CSV parser | ✅ |
| Text starting with `=`, `-`, `+` or `@` still gets the leading `'` | ✅ |
| Mark-as-shipped prompt still appears after the download (answered No in this test) | ✅ |
| `npm run build` | ✅ |

Re-checked by Abdullah on his Android phone, after `fac1340` deployed (2026-11-01):

| Check | Result |
|---|---|
| The CSV opened in WPS Office, and phones showed as `0300-1234567` | ✅ |
| Excel re-check | Replaced by the WPS check |
| Google Sheets on the phone | Not tested: it only opens in the browser there |

**Not tested:** whether any courier portal accepts the dash. The comment on `localPhone` says `03001234567` is
what most courier portals expect, so a portal could reject `0300-1234567`. No portal has been tried in either format.

---

## 20. Phase 4 step 4: database rule for refused orders (2026-11-01)

`schema.sql` only: the `"orders: delete own"` policy gained `and status <> 'refused'`. Its name and everything else
stayed the same. **Abdullah ran this SQL on the live project (2026-11-01)**, and the check below returned the
expected row.

The SQL, as run in the Supabase SQL editor:

```sql
drop policy "orders: delete own" on public.orders;

create policy "orders: delete own" on public.orders for delete to authenticated
  using (user_id = (select auth.uid()) and status <> 'refused');
```

The drop has no `if exists` on purpose. Policies of this kind add up, so if the live policy had another name, the
old one would stay and keep allowing the delete. An error is better than that.

To confirm it took effect:

```sql
select policyname, cmd, qual
from pg_policies
where schemaname = 'public' and tablename = 'orders' and cmd = 'DELETE';
```

It should return one row, with `qual` reading
`((user_id = ( SELECT auth.uid() AS uid)) AND (status <> 'refused'::text))`.

Tested by Claude in a throwaway in-memory Postgres (PGlite), on this computer, with a stand-in for Supabase's
`auth.uid()` and the requests run as the `authenticated` role. It used the real `schema.sql`, from before and after
this change. The test script was not added to the repo, and the project still has no tests of its own.

| Check | Result |
|---|---|
| Old policy: the owner can delete a Refused order, so the test can tell the two apart | ✅ |
| Migration on a database built from the old schema, with a Refused order already in it: one delete policy, and the owner's delete affects 0 rows and the order stays | ✅ |
| Waiting, Confirmed, Cancelled, Shipped, Delivered: the owner can delete, another seller can't | ✅ |
| Refused: another seller and a signed-out request can't delete it | ✅ |
| `customer_refusals` count unchanged after the blocked deletes | ✅ |
| Status changes still work, including to and from Refused (so Undo isn't blocked) | ✅ |
| Known gap still there: Refused to Waiting, then delete, succeeds | ✅ As documented in section 7 |
| Deleting from the admin role, as the Supabase SQL editor does, and deleting an account, still remove Refused orders. Only sellers' own requests are limited | ✅ |
| `schema.sql` run twice gives the same policy as the migration | ✅ |
| The migration stops with an error if the policy name isn't there | ✅ |
| `npm run build` | ✅ |
| `npm test` | Not run: the project has no test script |

**Not tested:** an actual delete being refused on the live database, or through the app. The live check shows the
policy is in place, not how it behaves there. Testing it as a seller would need a new login, so no login emails were
sent. PGlite is real Postgres, but it isn't the Supabase project.

---

## 21. Phase 4 step 5, part 1: secret scan, screenshots, README (2026-11-01)

No app code changed. Git history was not rewritten, and repo visibility was not changed. Making the repo public is
Abdullah's step. `.gitignore` now says `/screenshots/`, so only the root folder is ignored and `docs/screenshots/`
can be committed.

### Secret and personal-data scan: clean

Scanned by Claude: all 15 commits on all refs (`main` and `origin/main`, no tags or stashes, no dangling objects),
as full diffs including removed lines, plus commit messages, up to and including `d4d1a76`. The two binary files
ever committed are font files from `@fontsource`, and their contents were not searched.

| Looked for | Result |
|---|---|
| The real values in this computer's `.env.local` (full values and the project address) | Not found anywhere. Compared without printing them |
| `.env` files, keys, certificates, `.vercel`, `settings.local.json` ever committed | None. Only `.env.local.example`, added in `dafd7b7`, with placeholders in its only version |
| Anything starting with `eyJ`, in any case | None |
| `sb_secret` | None |
| `sb_publishable_` | Placeholder only: `sb_publishable_xxxxxxxx` in the setup guide (`dafd7b7`) |
| `service_role` | One warning sentence in the setup guide (`dafd7b7`), no value |
| Supabase addresses | Placeholders only: `abcdefgh.supabase.co` (`dafd7b7`, `e751f43`), `your-project-id.supabase.co` (`dafd7b7`) |
| API tokens (GitHub, Slack, Stripe, AWS, Vercel, Resend, bearer, private keys), and long opaque strings | None. The long strings found were a GitHub path, placeholder text, a UUID template and comment rules |
| Email addresses in file contents | None |
| Email addresses in commit data | `abdullah.nasir7312@gmail.com` as author and committer on all 15 commits, and `noreply@anthropic.com` in Co-Authored-By lines. Neither is in the files |
| Phone numbers | Demo numbers in `lib/data.js`, and made-up examples `0300-1234567` and `923001234567` (same number) in docs, UI hints and comments. `0321-1234567` in docs is Kamran Shah's demo number |
| `package-lock.json` download addresses | `registry.npmjs.org` only |

This was a pattern search, not a dedicated scanning tool such as gitleaks. The screenshots added in this step show
demo data only, and Supabase was blocked while they were taken.

### Screenshots

In `docs/screenshots/`. Demo mode on a production build (`next start`), headless Edge, 360px wide, device scale
factor 3, so 1,080px wide files. Optimised to 256-colour PNG, which was smaller than WebP at quality 90 for every
shot, with no visible loss when checked by eye.

| File | Shows | Height in CSS px | Size |
|---|---|---|---|
| `welcome.png` | Welcome, English | 780 | 50 KB |
| `today-top.png` | Today, first screen. Not in the requested list; added so the README row has equal heights | 780 | 68 KB |
| `today.png` | Today, all three sections | 1,850 | 156 KB |
| `order-card-refusal-warning.png` | Kamran Shah's card, "Refused 2 times before" | 256 | 22 KB |
| `new-order-refusal-warning.png` | New order, refusal warning, "Returning customer · 3 orders before", name, city and address filled in | 780 | 49 KB |
| `more-actions-sheet.png` | The "···" sheet, for Ayesha Khan's order | 780 | 46 KB |
| `today-roman-urdu.png` | Today in Roman Urdu, all three sections | 1,940 | 165 KB |

The two full-length Today shots use a viewport as tall as the page, so the bottom bar sits under the last card.
The order form's city chips scrolled themselves to show the selected city, which cuts "Rawalpindi" at the left edge.
That is how the screen really looks.

### README

- `README.md` is rewritten for a visitor with under a minute. The old guide moved to `docs/SETUP.md`.
- `docs/banner.png` is a static copy of the `app/opengraph-image` output, so GitHub doesn't depend on the live site.
- Beyond the requested honest limits, one line was added, because the README's refused-order claim would otherwise
  overstate it: the known gap of changing status and then deleting (section 7). That a blocked delete has not been
  tried on the live database is recorded in section 20 only; Abdullah removed that line from the README.
- No license section and no LICENSE file.
- `docs/SETUP.md` fixes: button names (`+ New`, `···`, `Save and send on WhatsApp`, `Export CSV`, `Mark confirmed`,
  `Try the demo`, `Reset`, `Exit`), 11 sample orders, the welcome screen without Supabase (no longer a note, just no
  email button), the folder list, the CSV phone format, and "tell me which courier", which was left over from a chat.

### Tests

| Check | Result |
|---|---|
| `npm run build` | ✅ |
| All 11 relative image and link targets in `README.md`, and the one in `docs/SETUP.md`, exist | ✅ |
| Live site, GitHub profile and portfolio links return 200 | ✅ |
| LinkedIn link | Not confirmed: LinkedIn answers automated requests with 999. Abdullah supplied the address |
| README rendered with GitHub's Markdown API, then shown in headless Edge with its image rules, at 880, 680, 390 and 320px | ✅ All images load, no sideways scroll, and the API keeps the `width` and `align` attributes |
| Screenshot row | Replaced by the one-row layout below |
| No em dashes or exclamation marks in `README.md` or `docs/SETUP.md` | ✅ |
| Roman Urdu strings | None changed |
| `npm test` | Not run: the project has no test script |

**Not tested:** the README on github.com itself, since the check used GitHub's renderer with GitHub's image rules
copied by hand. Relative image links on a private repo only show when logged in, so a visitor sees them only once
the repo is public.

### README fix: one screenshot row (2026-11-01)

Abdullah's screenshots of the README on github.com showed the two-row layout unevenly, with the short refusal card
next to the tall sheet. `README.md` is the only file changed for this, apart from this section.

- The screenshots are now one row of four at width 165: welcome, Today, new order form and the "···" sheet.
- The refusal card is no longer shown as an image. It is linked in the "Full length" line, with the two long Today shots.
- The Honest limits line about the local Postgres test is gone. The detail stays in section 20.

Checked with GitHub's Markdown API in headless Edge, with GitHub's image rules copied by hand:

| Width | Screenshot row |
|---|---|
| 880px | ✅ Four in one row, same width and top edge |
| 680px | 🟡 Three, then the fourth below. The row needs a README column of about 675px; this test's column was 633px |
| 390px | ✅ Two rows of two |
| 320px | ✅ One column |

| Check | Result |
|---|---|
| `npm run build` | ✅ |
| All relative image and link targets exist, no sideways scroll at any width above | ✅ |
| No em dashes or exclamation marks in `README.md` | ✅ |
| Roman Urdu strings | None changed |

**Not tested:** this new layout on github.com itself, until Abdullah looks at it after this push.

---

## 22. Phase 4 step 5, part 2: case study (2026-11-01)

`docs/CASE_STUDY.md` is Abdullah's text, added word for word. `README.md` gained one line under "How it was built",
linking to it. `PROJECT_SPEC.md` section 8 marks Phase 4 done. No app code changed.

| Check | Result |
|---|---|
| `npm run build` | ✅ |
| Case study links: the live site and the GitHub repo return 200, logged out | ✅ |
| Case study has no relative links. `PROJECT_SPEC.md` and `CURRENT_STATE.md` are named in code style, and both exist | ✅ |
| README's new link: `docs/CASE_STUDY.md` exists | ✅ |
| Case study renders with GitHub's Markdown API | ✅ |
| Roman Urdu strings | None changed |
| `npm test` | Not run: the project has no test script |

Two lines in the case study go further than the tests in this file. They are kept as written, since the text is
Abdullah's:

- "adds an order in a few seconds": adding an order was never timed (section 2, feature 1).
- "A link works on any phone today": WhatsApp opening was checked on one real Android phone (section 19).

The case study's statements about the idea's origin and the rejected logo options come from Abdullah, and aren't
recorded elsewhere in this file.
