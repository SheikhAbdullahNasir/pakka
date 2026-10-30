# COD Confirmer

A phone-first web app for small Pakistani sellers who take orders on Instagram and WhatsApp.
Confirm every cash-on-delivery order on WhatsApp **before** it ships, and remember who refused before.

This guide assumes you have never done this before. Follow the parts in order. Each one ends with
something you can see working, so you always know you're on track.

---

## What the app does (version one)

| Feature | Where to find it |
|---|---|
| Add an order in seconds (number, name, city, items, amount) | Green **+ New order** button |
| Opens WhatsApp with a ready Roman Urdu or English message. **You** press send | **Save & send on WhatsApp**, or **Send confirmation** on any waiting order |
| Statuses: Waiting, Confirmed, Cancelled, Shipped, Delivered, Refused | Big buttons on each order; **More ▾** shows all six |
| Red warning if this number refused before, with how many times | On the order card, and in the form as soon as you type the number |
| Daily view: ready to ship, waiting for reply (with **Remind**), shipped | **Today** tab |
| CSV of confirmed orders for your courier | **Export CSV for courier** on the Today tab |
| English / Roman Urdu | Toggle at the top |
| Email login, so orders survive a lost phone | Login screen |

A few extras that save time:
- When you type a number you've seen before, the name, city and address fill in by themselves.
- Every status change shows an **Undo** button for 5 seconds, in case of a wrong tap.
- After exporting the CSV, the app offers to mark all those orders as **Shipped** in one go.
- Settings: your shop name (it appears in the message) and which language customers get messages in.

The app **never** messages anyone by itself. It only opens WhatsApp with the text filled in.

---

## What's in this folder

```
app/               the pages (Next.js "App Router")
  page.js          the one page, which loads the app
  globals.css      all the colours and sizes (big buttons live here)
  manifest.js      lets you "Add to Home screen" on Android
components/        the screens and pieces you see
  App.js           login check, loading orders, the tabs
  OrderForm.js     add / edit an order
  OrderCard.js     one order with its buttons
  TodayView.js     the daily view
  OrdersView.js    all orders, search, filter
  SettingsView.js  shop name, message language, log out
  Login.js         email login
lib/               helpers, no screens
  i18n.js          every word on screen, English + Roman Urdu (edit wording here)
  messages.js      the WhatsApp message text (edit the customer message here)
  phone.js         turns 0300-1234567 into 923001234567 for WhatsApp
  csv.js           builds the courier CSV
  data.js          saves and loads orders (Supabase, or this browser in demo mode)
  supabase.js      connects to your database
supabase/schema.sql  the database tables, pasted into Supabase once
.env.local.example   template for your two secret-ish settings
```

---

## Part 1: Run it on your computer (demo mode, 5 minutes)

You already have Node.js installed (that's the program that runs JavaScript on your computer).

1. Open a terminal in this folder. In VS Code: **Terminal → New Terminal**.
2. Install the building blocks (only needed once, or after you download the project fresh):
   ```bash
   npm install
   ```
3. Start the app:
   ```bash
   npm run dev
   ```
4. Open **http://localhost:3000** in your browser.

You'll see the login screen with a note that Supabase isn't connected yet. That's expected.
Tap **Try demo**: the app opens with about 10 sample orders (saved only in this browser), so you can
try every button. The bar at the top has **Reset demo** (bring the sample orders back) and
**Exit demo** (back to the login screen). Demo mode without Supabase only works on your own
computer: a live site without the Supabase settings shows a "Setup is not finished" screen instead.

**Try it on your phone:** the terminal also prints a "Network" address like `http://192.168.1.5:3000`.
Open that on a phone on the same Wi-Fi. (Demo data on the phone is separate from the computer.)

To stop the app, click the terminal and press `Ctrl + C`.

---

## Part 2: Create your free database (Supabase, 10 minutes)

Supabase gives you a database and email login for free.

1. Go to **https://supabase.com**, click **Start your project**, sign up (GitHub or email).
2. Click **New project**.
   - **Name:** `cod-confirmer`
   - **Database password:** click *Generate*, then save it in a safe place (you won't need it day to day).
   - **Region:** pick the one closest to Pakistan, for example **Mumbai** (or Singapore).
   - Click **Create new project** and wait about a minute.
3. **Create the tables.** In the left menu click **SQL Editor** → **New query**.
   Open `supabase/schema.sql` from this folder, copy *everything*, paste it in, and click **Run**.
   You should see "Success. No rows returned".
   *What this did:* made an `orders` table, a `shops` table, and a `customer_refusals` view, and
   switched on **Row Level Security**, a rule inside the database that means each seller can only
   ever see their own orders, even though everyone uses the same app.
4. **Tell Supabase where the login link should go.** Left menu: **Authentication → URL Configuration**.
   - **Site URL:** `http://localhost:3000`
   - **Redirect URLs:** add `http://localhost:3000`

   Click **Save**. *Why:* the login email contains a sign-in link, and this is where that link sends
   people back to. You'll add your live address in Part 4c. You don't need to change the email
   templates (the free plan doesn't allow it, and the default email already has the link).
5. **Copy your two keys.** Left menu: **Project Settings → API** (in newer dashboards it's
   **Project Settings → Data API** for the URL and **API Keys** for the key). You need:
   - **Project URL**, which looks like `https://abcdefgh.supabase.co`
   - **anon public** key (newer dashboards call it **Publishable key**, starts with `sb_publishable_`)

   The anon/publishable key is designed to be public and lives inside the app. Row Level Security
   is what keeps the data private. **Never** copy the `service_role` / secret key into this app.

---

## Part 3: Connect the app to Supabase (2 minutes)

1. In this folder, make a copy of `.env.local.example` and name the copy `.env.local`.
2. Open `.env.local` and paste your values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxxxxxxx
   ```
3. Stop the app (`Ctrl + C`) and start it again with `npm run dev`. The app only reads this file when it starts.
4. Open http://localhost:3000. You should now see the **login screen** instead of demo mode.
   Press **Log in with email**, type your email, press **Send sign-in link**, then tap the link in
   the email. Open it in the same browser, and you land on the **Today** screen.

`.env.local` is listed in `.gitignore`, so it won't be uploaded to GitHub. That's on purpose.

---

## Part 4: Put it on the internet for free (GitHub + Vercel, 15 minutes)

Vercel hosts the app for free. It takes the code from GitHub, so we put it there first.

### 4a. Upload the code to GitHub
1. Make a free account at **https://github.com**.
2. Click **+ → New repository**. Name: `cod-confirmer`. Choose **Private**. Don't tick any boxes. Click **Create repository**.
3. In your terminal, in this folder, run these one by one (replace `YOUR-USERNAME`):
   ```bash
   git init
   ```
   ```bash
   git add .
   ```
   ```bash
   git commit -m "COD Confirmer version one"
   ```
   ```bash
   git branch -M main
   ```
   ```bash
   git remote add origin https://github.com/YOUR-USERNAME/cod-confirmer.git
   ```
   ```bash
   git push -u origin main
   ```
   *What these do:* start tracking the folder, take a snapshot ("commit") of every file, and send it to GitHub.
   If it asks you to log in, a browser window opens; approve it.

### 4b. Deploy on Vercel
1. Go to **https://vercel.com**, click **Sign up**, and choose **Continue with GitHub**.
2. Click **Add New… → Project**, find `cod-confirmer`, click **Import**.
3. Open **Environment Variables** and add the same two lines from your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL` = your project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon / publishable key
4. Click **Deploy**. After a minute you get an address like `https://cod-confirmer-abc.vercel.app`.

### 4c. Tell Supabase your new address
Back in Supabase: **Authentication → URL Configuration**.
- **Site URL:** change it to your Vercel address, e.g. `https://cod-confirmer-abc.vercel.app`
- **Redirect URLs:** add the same address, and keep `http://localhost:3000` so testing on your computer keeps working.

Click **Save**. Without this, the link inside the login email would send people to the wrong place.

**From now on, every time you `git push`, Vercel updates the live app by itself.**

---

## Part 5: Put it on a seller's phone

1. Open the Vercel address in **Chrome** on the Android phone.
2. Log in with email.
3. Tap Chrome's **⋮ menu → Add to Home screen** (or **Install app**).

Now it opens from the home screen like a normal app, full screen, with no address bar.

---

## How a seller uses it every day

1. A customer messages on Instagram/WhatsApp → tap **+ New order**, type the number first.
   If they refused before, a **red warning** appears right away. Decide whether to ask for an advance.
2. Fill in name, city, items, amount → tap **Save & send on WhatsApp**. WhatsApp opens with the message ready; press send.
3. The customer replies **1** → tap **Confirmed**. Replies **2** → tap **Cancelled**.
   No reply? On the **Today** tab, tap **Remind**.
4. When the courier comes, tap **Export CSV for courier**, upload the file on the courier's portal,
   and let the app mark them **Shipped**.
5. When the courier reports back, tap **Delivered** or **Refused**. Marking **Refused** is what
   powers the warning next time, so please don't skip it.

**About the CSV:** columns are Order ID, Customer Name, Phone, City, Address, Items, COD Amount, Order Date.
Each courier (TCS, Leopards, PostEx, Trax, M&P…) has its own bulk-upload template. Most let you
match columns when uploading; if yours needs exact column names, tell me which courier and I'll make
the CSV match it.

---

## Changing words and messages

- **Words on screen:** `lib/i18n.js`. Each line is a label in English (`en`) and Roman Urdu (`ur`).
- **The WhatsApp message:** `lib/messages.js`.
- **Colours and button sizes:** `app/globals.css` (the colours are at the top).

Save the file, and the running app (`npm run dev`) updates by itself. `git push` when you're happy.

---

## When something goes wrong

| Problem | Fix |
|---|---|
| Login screen says Supabase is not connected, or the live site says "Setup is not finished" | The file must be named exactly `.env.local` (with the dot), in this folder. Restart `npm run dev`. On Vercel, check the two Environment Variables, then **Deployments → ⋮ → Redeploy**. |
| Login email never arrives | Check spam. Supabase's free built-in email only sends **a few emails per hour** and is meant for testing. Before real sellers use it, connect a free email sender: Supabase **Authentication → Emails → SMTP Settings**, using e.g. Resend or Brevo (both have free plans). |
| "That sign-in link has expired or was already used" | Links expire after about an hour and can only be used once. Type your email and send a new link. |
| The link opens the wrong site or a "can't connect" page | Check **Authentication → URL Configuration** in Supabase (Part 2 step 4 and Part 4c). |
| Orders don't save, error mentions "permission" or "relation does not exist" | The SQL in Part 2 step 3 didn't run fully. Run `supabase/schema.sql` again (it's safe to repeat). |
| WhatsApp doesn't open | The number must be a Pakistani mobile (03xx…). On a computer, wa.me opens WhatsApp Web instead. |
| Supabase project "paused" | Free projects pause after about a week with no use. Open the Supabase dashboard and click **Restore**. Regular daily use keeps it awake. |

---

## Version two (later, after real sellers use version one)

Not built yet, on purpose. When the time comes, the plan is:

1. Register a **WhatsApp Business Cloud API** number with Meta (it can't be the same number used in the WhatsApp app).
2. Get a **message template** approved by Meta (the confirmation text with placeholders for name, items, amount).
   Quick-reply buttons ("Confirm" / "Cancel") work better than asking people to type 1 or 2.
3. Add a server route in this app (`app/api/whatsapp/route.js`) that Meta calls when a customer replies,
   which finds the order and sets it to Confirmed or Cancelled by itself.
4. Add columns to `orders` for the WhatsApp message ID, so replies can be matched to the right order.

Meta charges per conversation, so it's worth confirming sellers want it before building it.
The current database and screens don't need to change for this, only additions.
