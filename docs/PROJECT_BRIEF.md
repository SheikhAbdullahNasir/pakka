# Pakka: project brief

Paste this into any AI chat to give it full context on Pakka. Use only the facts below. Do not invent users, results or numbers.

Last updated: 2 November 2026

## Basics

- **Name:** Pakka (originally called COD Confirmer)
- **Slogan:** "Confirmed orders. Fewer refusals." (Roman Urdu: "Pakke orders. Kam refusals.")
- **One line:** a phone-first web app that helps small Pakistani sellers confirm cash-on-delivery orders on WhatsApp before shipping, and warns them about customers who refused before.
- **Live:** https://pakkapk.vercel.app (demo, no account needed)
- **Code:** https://github.com/SheikhAbdullahNasir/pakka (public)
- **Case study:** https://github.com/SheikhAbdullahNasir/pakka/blob/main/docs/CASE_STUDY.md
- **Built by:** Abdullah Bin Nasir, solo
- **When:** late October 2026, finished 1 November 2026
- **Time:** about 2.5 days, 25 to 30 hours
- **Status:** portfolio project, no real users

## The problem

Many small sellers in Pakistan sell through Instagram DMs and WhatsApp, mostly cash on delivery. When a customer refuses the parcel at the door, the seller has already paid to pack and ship it. Some customers refuse again and again, and the seller has no record of them. Existing tools are mostly Shopify apps; Pakka is for sellers without a store. The idea came from an Instagram post listing app ideas for Pakistani problems; Abdullah researched it and shaped it into this product.

## What it does

- One tap opens WhatsApp with a confirmation message already typed; the seller presses send
- Warns "Refused 2 times before" on the order card and on the new order form
- Today view: orders waiting for a reply, ready to ship, and shipped
- CSV export for couriers, then marks the orders as shipped
- English and Roman Urdu interface
- Demo mode with sample orders; login by email magic link
- Installable on the home screen (PWA)

## Tech

Next.js 16 (App Router, JavaScript), React 19, Supabase (Postgres, Auth, row-level security), Vercel.

## How it was built

Planned with Claude, implemented with Claude Code, driven by two documents: PROJECT_SPEC.md (what it should be) and CURRENT_STATE.md (what it does, and what was and wasn't tested). Abdullah made the product and design decisions, reviewed every change, and tested on a real Android phone.

## Key decisions

- WhatsApp links only, no automatic messages: no API approval or running costs, and the seller stays in control
- Logo: a P with a tick, because "pakka" means confirmed; checked at 16px before choosing
- CSV phone numbers exported as 0300-1234567 so spreadsheet apps keep the leading 0
- Refusal history private to each seller, enforced with Supabase row-level security
- A database rule that blocks deleting refused orders
- CSV cells protected against formula injection
- Designed for 360px-wide phones first

## Lessons

- Roman Urdu labels are longer than English and broke button rows on small phones, so every screen is now checked in both languages at the smallest width
- A spreadsheet app on the phone dropped the leading 0 from phone numbers; found only by testing the export on a real phone

## Verified

- Row-level security tested with two accounts: each saw only its own data
- On a real Android phone, on the live site: login, demo, Urdu, WhatsApp opening, CSV download (opened in WPS Office), home-screen icon, and link previews on WhatsApp and LinkedIn
- Git history scanned for secrets before the repo went public

## Do not claim

- Real users, customers or sellers using it
- Interviews or feedback from sellers (none done yet)
- Reduced refusals or any business results
- Tested with a courier upload, on iPhone, or on a low-end phone
- Automatic WhatsApp messages (not built)

## Next steps (if taken further)

Talk to real sellers first, then rebuild as a native app with React Native and Expo, then add automatic confirmations through the WhatsApp Business API.

## Ready-made text

**Short description:** Pakka helps Pakistani Instagram and WhatsApp sellers confirm cash-on-delivery orders on WhatsApp before shipping, and warns them about customers who refused before.

**Resume bullets:**
- Built and shipped Pakka, a phone-first web app (Next.js, Supabase, Vercel) that helps Pakistani Instagram and WhatsApp sellers confirm cash-on-delivery orders on WhatsApp and flags customers who refused before.
- Secured per-seller data with Supabase row-level security, tested with two accounts, and added a database rule that blocks deleting refused orders.
- Delivered in about 30 hours with a spec-driven AI workflow (Claude for planning, Claude Code for implementation), including an English and Roman Urdu interface and real-device testing on Android.

## Writing rules

Plain, honest and conversational. No em dashes, no hype words, no forced hooks, no hashtags unless asked. Use first person when writing as Abdullah.
