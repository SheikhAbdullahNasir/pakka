# Pakka: Project Spec

Confirmed orders. Fewer refusals.

Living document. Read this together with `CURRENT_STATE.md` before making changes.
`CURRENT_STATE.md` describes what the code does today. This file describes what it should become.

---

## 1. What this is

A mobile-first web app for small Pakistani sellers who take cash-on-delivery orders on Instagram and WhatsApp. It helps them confirm each order on WhatsApp before shipping and warns them about customers who refused orders before.

**Current goal: portfolio-first.** It must look polished, work end to end, and be easy for a visitor to try without signing up. Real-seller features (courier-specific CSV formats, custom email SMTP, scale) are out of scope for now.

**Primary user:** a non-technical seller using a cheap Android phone, often outdoors, often on a weak connection, switching between this app and WhatsApp many times a day.

**Second user:** a recruiter or developer visiting from a portfolio link, who will spend under a minute and will not create an account.

---

## 2. Decisions log

| Decision | Choice |
|---|---|
| Demo approach | Existing localStorage demo mode, made explicit with a "Try the demo" button and seeded sample data |
| Missing Supabase config in production | Show a setup error screen, never fall back silently |
| Visual direction | "Warm local": cream background, deep green primary, mustard accent |
| Font | Plus Jakarta Sans (self-hosted with `next/font`), weights 400, 600, 700 only |
| Theme | Light mode only for now. Dark mode is a later phase. All colors defined as CSS variables so dark mode can be added later |
| Today view | Shows all orders that need action, not only orders created today |
| Courier CSV | Generic columns, no courier-specific formats. Phones are exported as `0300-1234567` so spreadsheet apps keep the leading 0 |
| Login | Magic link only. Free plan locks email templates; custom SMTP stays out of scope. |
| Brand | Name: Pakka. Slogan: 'Confirmed orders. Fewer refusals.' (Urdu: 'Pakke orders. Kam refusals.'). |
| Logo | No longer a placeholder. A "P" with a tick, drawn from paths everywhere, never from a font. The shape lives in `components/Mark.js`; `app/icon.svg` repeats it because it is a static file. |
| Social preview | `app/opengraph-image.js`, 1200×630, English only. Plus Jakarta Sans is kept as woff in `assets/fonts/` with its OFL licence, because the image generator can't read woff2. |
| Deployment | Hosting: Vercel, pakkapk.vercel.app. Database: Supabase, Mumbai region. |
| License | Public repo, unlicensed for now (all rights reserved). Switch to MIT if Pakka is not taken to real users. Don't add a license without Abdullah's decision. |

---

## 3. Design system

### 3.1 Color tokens

Define all colors as CSS custom properties on `:root`. Components must use the variables, never raw hex values.

| Token | Value | Use |
|---|---|---|
| `--bg` | `#F6EFE3` | Page background (cream) |
| `--surface` | `#FFFBF4` | Cards, sheets, inputs |
| `--surface-muted` | `#EFE5D3` | Bottom bar, secondary buttons, "···" button |
| `--border` | `#E6DAC5` | Card and input borders |
| `--chip` | `#EADFCB` | Small neutral pills (language chip) |
| `--primary` | `#1F4D3A` | Main buttons, headings, active nav (deep green) |
| `--on-primary` | `#FFF6E6` | Text on primary |
| `--accent` | `#E3A93B` | "Mark shipped" and Export CSV buttons (mustard) |
| `--on-accent` | `#3D2A08` | Text on accent |
| `--text` | `#2A2420` | Body text |
| `--text-secondary` | `#665B4E` | Meta lines (phone, city, time). Darkened from `#6E6355`, which was 4.45:1 on `--chip` (now 5.02:1) |
| `--danger-bg` | `#F6DDD3` | Refusal warning background |
| `--danger-text` | `#8A3A22` | Refusal warning text, Refused button outline |

All text must meet WCAG AA contrast (4.5:1 for normal text) on its background. If any pairing fails, darken the text color and note the change here.

### 3.2 Status colors

Every status chip shows a text label. Color is never the only signal.

| Status | Chip background | Chip text |
|---|---|---|
| Waiting | `#F3E3BF` | `#6B4A0E` |
| Confirmed | `#D6E6DC` | `#1F4D3A` |
| Cancelled | `#E6E1D8` | `#5A5248` |
| Shipped | `#D7E5EC` | `#24536A` |
| Delivered | `#1F4D3A` | `#FFF6E6` |
| Refused | `#F6DDD3` | `#8A3A22` |

In the "···" sheet, all six chips use a light background, so none looks like a filled button. Delivered, the only filled chip above, uses `#CFE3C4` with `#1F4D3A` text there (7.08:1). Only the current status is marked, with a dark border (`--text`) and a check mark.

### 3.3 Typography

- Font: Plus Jakarta Sans via `next/font/google` (self-hosted, no layout shift), with a system sans-serif fallback.
- Weights: 400 body, 600 buttons and labels, 700 headings and amounts.
- Sizes: body 16px, meta text 14px minimum, chips 12px minimum, screen titles 22px, welcome headline 28px.
- Amounts and phone numbers use tabular numbers (`font-variant-numeric: tabular-nums`).

### 3.4 Shape and spacing

- Card radius 16px, button radius 12px, chip radius full pill, input radius 12px.
- Minimum tap target 48px tall. Main buttons 52px.
- Screen side padding 16px. Spacing scale: 4, 8, 12, 16, 24, 32.
- No drop shadows except a subtle one on bottom sheets. No gradients.
- Motion: short (150 to 200ms) and only for sheets and toasts. Respect `prefers-reduced-motion`.

### 3.5 Theme

- Force light mode: `color-scheme: light`, remove all `prefers-color-scheme: dark` styles.
- `theme-color` meta and PWA manifest background: `#F6EFE3`. Icons all use the mark: a `#FFF6E6` "P" with a `#E3A93B` tick on `#1F4D3A`.
- Favicon and PWA icons 192 and 512: rounded tile (`rx` 28 on a 120 grid), transparent corners.
- Maskable: full-bleed `#1F4D3A` square, no tile, with the P and tick inside a centred circle of 70% diameter.
- Apple touch icon: 180×180, full-bleed square with no rounded corners, because iOS rounds it.

---

## 4. Screens

### 4.1 Welcome / login

- Small language chip top right (EN / Urdu).
- The logo tile (see 3.5) with "Pakka" as a small wordmark next to it, and the slogan directly under the wordmark as a small secondary line (14px, `--text-secondary`, weight 400). The slogan switches language with the toggle.
- Headline: "Stop paying for refused COD orders".
- One-line description: confirm every order on WhatsApp before it ships, and get warned about customers who refused before.
- Primary button: **Try the demo**. Helper text below: demo needs no account.
- Secondary (outline) button: **Log in with email**. Tapping it reveals the email field in place.
- After sending, this shows in place: "Check your email and tap the sign-in link. Open it on this phone.", the email it was sent to, a **Send again** button with a 60-second cooldown, and a "Use a different email" link.
- Returning from the link signs the seller in and lands on Today, with nothing left in the address. A link that expired or was already used returns to this screen with a friendly message.
- Footer line: "Made for Instagram and WhatsApp sellers in Pakistan" (Urdu: "Pakistan ke Instagram aur WhatsApp sellers ke liye"), which switches language with the toggle. It stays at the bottom, and the content block is centered vertically in the space above it.
- When Supabase is not configured in development, hide the email option and keep demo only. No red error box on this screen.

### 4.2 App shell

- Top: screen title on the left, language chip on the right. No full-width colored header bar.
- Demo mode: one thin mustard-tinted strip under the title: "Demo mode" on the left, "Reset · Exit" on the right.
- Bottom bar (sticky, `--surface-muted`): Today, Orders, **+ New** (filled primary pill), Settings. Respect the phone's safe-area inset at the bottom.
- Remove the floating "New order" button and the three stat tiles.
- Content gets enough bottom padding that the last card is never hidden behind the bottom bar.

### 4.3 Today

Sections in this order, each heading showing its count ("Waiting for reply · 3"):

1. **Waiting for reply**
2. **Ready to ship**, with an **Export CSV** button (accent) in the section header
3. **Shipped: mark the result**

Empty section: one short line plus no clutter (for example "No orders waiting"). If all sections are empty, show one empty state with a **New order** button.

### 4.4 Order card

Top to bottom:
1. Refusal warning (only if the number refused before): full-width strip, "Refused 2 times before" (singular "Refused once before"). Always the first thing on the card.
2. Name and amount on one row. Amount bold, formatted "Rs 3,500".
3. Meta line: phone (0321-1234567) · city · relative time.
4. Items.
5. Address: shown on Confirmed and Shipped cards (needed for packing). Hidden on others.
6. Status chip plus message state ("Not sent yet" / "Message sent 4h ago").
7. Actions row: one main action and a square "···" button.

Main action by status:

| Status | Main action(s) |
|---|---|
| Waiting, message not sent | **Send confirmation** (primary) |
| Waiting, message sent | **Mark confirmed** (primary) + **Remind** (secondary) |
| Confirmed | **Mark shipped** (accent) |
| Shipped | **Mark delivered** (primary) + **Mark refused** (danger outline) |
| Delivered, Cancelled, Refused | No main action, "···" only |

Buttons always use action words ("Mark confirmed"), never a bare status name, so they can't be confused with the status chip.

The "···" button always shares the last row of action buttons and never sits alone on its own row. This applies at every width and in both languages:

- When the main button(s) fit on one row with "···", keep one row.
- When they don't fit, the first main button takes the full width of row one, and the second main button plus "···" share row two.
- The only exception is a card with no main action (Delivered, Cancelled, Refused), where "···" is the only button.

**Remind** has narrower padding so the Waiting card fits on one row where the text allows (English at 360px does, Roman Urdu does not).

The "···" button opens a bottom sheet with: change status (all six as light chips, current one marked, see 3.2), Open chat in WhatsApp, Edit, Delete. Delete on a Refused order shows the existing "refusal history is kept" message.

Every status change keeps the existing 5-second Undo toast.

### 4.5 Orders

- Search field at top: matches name, items, or phone digits. Searching by the last 4 digits of a number must work.
- Horizontally scrollable status filter chips under the search: All + six statuses.
- Same order card as Today.

### 4.6 New / edit order (full-screen sheet)

- Field order: WhatsApp number, customer name, city, address, items, amount.
- Phone: `inputmode="tel"`, auto-formats as the seller types (0300-1234567). As soon as the number is valid:
  - If the number refused before, show the refusal warning directly under the field.
  - If it's a returning customer, auto-fill name, city, address, with a small "Returning customer" note.
- City: text input plus a row of quick-pick chips for the most common cities (Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, more). Matching is case-insensitive.
- Address: optional, but show a hint that couriers need it.
- Amount: `inputmode="decimal"`, "Rs" prefix inside the field, shows thousands separators.
- Buttons stick to the bottom of the sheet: **Save and send on WhatsApp** (primary), **Save only** (secondary). These two are for new orders only.
- Editing an existing order shows one button, **Save changes** (primary). Sending stays on the card (Send confirmation / Remind), so the message counter is never reset by an edit.
- If saving fails, keep the sheet open with everything the seller typed, and show the error above the buttons.

### 4.7 Settings

- Shop name.
- Language of customer messages (Roman Urdu / English) with the existing preview.
- App language (same as the top chip).
- Sign out (logged in) or Exit demo (demo mode).

### 4.8 Setup error screen

Same look as the welcome screen, with a clear message that the app is not configured. Keep the existing logic.

---

## 5. UX rules

- Designed for 360px-wide screens first. Nothing may overflow or wrap badly at 360px.
- Every interactive element at least 48px tall.
- Show loading states on buttons while saving (spinner or "Saving…"), and disable double taps during a save.
- Never lose what the seller typed because of a network error.
- No confirmation dialogs for reversible actions. Use Undo instead.
- Display names and cities in Title Case ("Nasir", "Karachi") without changing what is stored.
- Correct plurals in both languages ("1 day ago", "2 days ago").
- No exclamation marks in UI text.
- No horizontal page scrolling anywhere.

---

## 6. Copy and language

- All UI text goes through `lib/i18n.js`, in both English and Roman Urdu.
- Roman Urdu should sound like how sellers actually text, short and natural, not formal translation.
- **Abdullah reviews every Roman Urdu string before release.** List any new or changed Urdu strings in the commit summary so he can check them.
- Supabase error messages shown to users must be replaced with friendly translated messages (keep the raw error in the console only).

---

## 7. Out of scope (for now)

- Dark mode (planned later phase)
- Courier-specific CSV formats
- WhatsApp Business Cloud API automation (version two)
- Live sync between devices, offline support, more than 1,000 orders
- Custom SMTP for login emails
- Urdu Nastaliq script

---

## 8. Phases

| Phase | Status |
|---|---|
| 1. Bug fixes + explicit demo mode | Done (commit `763ee31`) |
| 2. UI and UX redesign per this spec | Done (2026-10-30) |
| 3. Supabase setup + Vercel deploy | Done (2026-10-30) |
| 4. Real phone testing, README polish, portfolio write-up | Done (2026-11-01) |
| 5. Dark mode | Optional, later |

### Phase 2 definition of done

- Every screen in section 4 matches the spec.
- Checked at 360px and 412px widths, in English and Roman Urdu.
- No raw hex colors in components, only CSS variables.
- `npm run build` passes.
- `CURRENT_STATE.md` updated.
- New and changed Roman Urdu strings listed for review.
