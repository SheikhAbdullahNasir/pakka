# COD Confirmer: Current State (audit, 2026-10-29; updated 2026-10-29 after the fixes round)

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
except the PWA icon generator. All database calls go straight from the browser to Supabase.

```
app/
  layout.js              <html lang="en"> (App.js changes it to match the language), page title, theme colour
  page.js                renders <App />
  globals.css            all styles and colour variables (light mode only; dark mode is a later phase)
  manifest.js            PWA manifest ("Add to Home screen")
  icon.svg               favicon
  pwa-icon/[size]/route.js  generates 192/512 PNG icons at build time
components/
  App.js                 login check, demo on/off, config-error screen, data loading, tabs, toast/undo, CSV export
  Login.js               email one-time code login + "Try demo" button
  LangToggle.js          "EN | Urdu" language chip
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
README.md                beginner setup guide
```

---

## 2. Features from the original request

### Version one features

| # | Requested | Status | Notes |
|---|---|---|---|
| 1 | Add an order in under 20 seconds: name, WhatsApp number, city, items, amount (Rs) | ✅ | `components/OrderForm.js`. Phone field first; returning customers get name/city/address auto-filled; city suggestions list. The "under 20 seconds" goal itself is **unverified** (not timed). Also has an optional Address field. Amount accepts digits and commas, and decimals are rounded to whole rupees (`2,500.50` → 2501); anything else (`2.5k`, `Rs 2500`) shows "Enter the amount in rupees using numbers only, like 2500 or 2,500" (both languages). |
| 2 | "Send confirmation" opens WhatsApp via wa.me with a Roman Urdu message | ✅ | `lib/messages.js`. Text matches the requested template, plus a city/address line and optional shop name. Available on the form ("Save & send on WhatsApp") and on every Waiting order card. English version also exists (chosen in Settings). "Save & send" now saves first: an empty window is opened during the tap (so phones don't block it), then sent to WhatsApp only after the save succeeds, or closed if the save fails. If the browser blocks even the empty window, WhatsApp opens in the same tab after saving. Tested in the browser with `window.open` stubbed; **not** tested on a real phone browser. |
| 3 | Statuses Waiting, Confirmed, Cancelled, Shipped, Delivered, Refused, one tap each | ✅ | One main action per card (Send confirmation / Mark confirmed + Remind / Mark shipped / Mark delivered + Mark refused); the "···" button opens a bottom sheet with all six statuses, Open chat in WhatsApp, Edit, Delete. 5-second Undo toast after each change. |
| 4 | Red warning on a new order if that number refused before, with count | ✅ | Shown in the form as soon as the number is valid, and on every order card. Counts come from the `customer_refusals` view. Counts are per seller only (by design, because of RLS). |
| 5 | Daily view: confirmed orders ready to ship, waiting orders with "Remind" | ✅ / 🟡 | `components/TodayView.js` also shows a "Shipped" section. 🟡 It is not filtered by date: it shows **all** orders currently in those statuses, not only today's. Whether that matches the intent is a judgement call. |
| 6 | Export confirmed list as CSV for the courier | 🟡 | `lib/csv.js`. Works and offers to mark them Shipped afterwards; the toast now reports the real result ("8 orders marked Shipped", or "8 marked Shipped, 2 failed…"). Columns are generic (Order ID, Customer Name, Phone, City, Address, Items, COD Amount, Order Date); not matched to any specific courier's bulk-upload template (TCS, Leopards, PostEx, etc.). Upload acceptance by any courier is **unverified**. |

### Rules

| Rule | Status | Notes |
|---|---|---|
| Roman Urdu / English toggle | 🟡 | Covers nearly all UI text; gaps listed in section 6. |
| Big buttons | ✅ | Every button and input is at least 48px tall (main buttons and inputs 52px); body text 16px, meta text 14px. Checked in the browser at 360px and 412px. |
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
- Supabase error messages are no longer shown. Login errors become "Too many tries…", "That code is
  wrong or has expired…" or "Something went wrong…"; load and save errors use fixed friendly text.
  All of these are translated. The raw error goes to the browser console only.
- Language chip labels "EN" / "Urdu" and the message-language buttons "Roman Urdu" / "English"
  (intentional).
- City quick-pick chips (Karachi, Lahore, …) are city names, the same in both languages.
- App name "COD Confirmer", the `aria-label="Language"`, the amount placeholder "2,500", "Rs", the "CC" monogram.
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
5. **Message counter counts taps, not sends.** Tapping Send/Remind increments `messages_sent`
   even if the seller backs out of WhatsApp.
6. ~~Deleting a refused order erases that refusal from history.~~ **Fixed in the app:** tapping
   Delete on a Refused order shows "Refused orders cannot be deleted. They are kept so you are
   warned if this number orders again." (both languages). Not enforced in the database: the
   `orders` delete policy in `schema.sql` is unchanged, and a seller can still change the status
   away from Refused and then delete.
7. **No live sync between devices.** A second phone/computer sees changes only after reload.
8. Two quick status taps on the same order can race: each update is sent independently, and the
   last response to arrive wins (**unverified** in practice).

### Hardcoded values

| Value | Where |
|---|---|
| Common cities list (16 Pakistani cities; the first 7 are quick-pick chips) | `components/OrderForm.js` |
| Message templates (Roman Urdu and English) | `lib/messages.js` |
| Colours: all as variables in `app/globals.css` (table in `PROJECT_SPEC.md` 3.1/3.2). Browser bar / PWA background `#F6EFE3`, icon `#1F4D3A` with cream "CC" | `app/layout.js`, `app/manifest.js`, `app/icon.svg`, `app/pwa-icon/[size]/route.js` |
| Load limit 1000 orders; page size 50 | `lib/data.js`, `components/OrdersView.js` |
| Undo/toast 5 s; 400 ms delay before "mark shipped?" | `components/App.js` |
| Settings preview sample (Ayesha, 2 lawn suits, Rs 4500, Lahore) | `components/SettingsView.js`, `lib/i18n.js` |
| localStorage keys `cod-confirmer-lang`, `cod-confirmer-demo`, `cod-confirmer-demo-on` | `App.js`, `lib/data.js` |
| Demo sample orders (11: names, phones, cities, items) | `lib/data.js` (`sampleData`) |
| Number format `en-PK`, CSV date `en-GB` (dd/mm/yyyy) | `lib/messages.js`, `lib/csv.js` |
| Pakistani-only phone rules | `lib/phone.js`, `supabase/schema.sql` |
| CSV Order ID = first 8 chars of the UUID (not a sequential number) | `lib/csv.js` |

No secrets are hardcoded. Supabase URL/key come from env vars; `.env.local` is git-ignored and
does not exist on this machine.

### Things that would break or hurt in production

1. ~~Silent demo mode.~~ **Fixed:** a production build without `NEXT_PUBLIC_SUPABASE_URL` /
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` shows a configuration error screen. The env vars are baked in at
   build time, so after adding them on Vercel you must redeploy. Demo mode is still available on a
   configured live site via **Try demo** (data stays in that browser, and the banner says so).
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
- **Build:** ✅ `npm run build` succeeds (Next.js 16.4.3, Turbopack; re-checked after the fixes round). Routes: `/` (static),
  `/manifest.webmanifest`, `/icon.svg`, `/pwa-icon/192`, `/pwa-icon/512`.

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
| Urdu Shipped card: "Deliver mark karein" + "Refuse mark karein" are too wide for one row at 360px, so they stack, with "···" on its own row | ✅ (found and fixed during testing) |
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
| Same card, Roman Urdu: does not fit on one row ("Confirm mark karein" + "Yaad dilaein" are too wide) | 🟡 Layout unchanged: **three rows at 360px** (the two buttons miss sharing a row by about 8px), two rows at 412px |
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
