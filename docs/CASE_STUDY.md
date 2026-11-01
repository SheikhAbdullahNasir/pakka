# Pakka: case study

**Confirmed orders. Fewer refusals.**
Live: [pakkapk.vercel.app](https://pakkapk.vercel.app) · Code: [github.com/SheikhAbdullahNasir/pakka](https://github.com/SheikhAbdullahNasir/pakka)

## The problem

A lot of small sellers in Pakistan run their whole business from Instagram DMs and WhatsApp, and most of their orders are cash on delivery. The painful part is the refused order: the seller packs it, pays to ship it, and the customer just says no at the door. Some customers do this again and again, and the seller has no way to remember them.

The idea wasn't originally mine. I came across an Instagram post where a creator shared four or five rough app ideas for problems people in Pakistan deal with. One of them was about confirming COD orders. It stood out because the fix seemed simple: confirm the order before it ships, and remember who refused before. I researched it a bit, shaped it into something more specific, and started building.

Tools for this already exist, but they're mostly Shopify apps. Many sellers don't have a store at all. They have a phone, Instagram and WhatsApp. Pakka is built for them.

## What I built

Pakka is a phone-first web app. A seller adds an order quickly, taps one button, and WhatsApp opens with a confirmation message already typed. When a number that refused before places a new order, the app shows a warning like "Refused 2 times before" right on the order. A Today screen shows what needs action, and confirmed orders can be exported as a CSV for the courier. It works in English and Roman Urdu, and anyone can try it with a demo, no account needed.

## Decisions I made

**WhatsApp links, not automation.** The app never sends a message on its own. It only builds a `wa.me` link, and the seller presses send. Automating it would need the WhatsApp Business API, approved templates and running costs. A link needs no setup or approval, and the seller stays in control of what goes to their customers.

**The logo.** "Pakka" means confirmed, so the mark is a P with a tick inside it. I checked it at 16px, where favicons actually show up, before settling on it, and rejected options that looked good large but turned to mush small.

**Phone numbers in the CSV.** More on this below, but the fix was a decision too: export numbers as `0300-1234567`, the same way the app shows them, instead of a raw number.

Other choices that shaped it: refusal history is private to each seller and enforced in the database with Supabase row-level security, login is a magic link with no passwords, and every screen was designed for a 360px-wide phone first.

## What testing taught me

**Urdu needs more space than English.** The buttons fit fine in English on a small phone. In Roman Urdu, labels like "Deliver mark karein" are longer, and two buttons no longer fit in one row. Designing in one language and translating later doesn't work. I now check every screen in both languages at the smallest width, and we added a layout rule for when buttons don't fit.

**Excel drops the leading zero.** Everything worked in testing, until I exported the CSV on my own phone and opened it. Every number was missing its first 0. The file was correct, but spreadsheet apps see `03001234567` as a number and remove the zero. Adding a dash makes it text, so the 0 stays. I only found this because I tested on a real phone, the way a seller would actually use it.

## How it was built

About 2.5 days, 25 to 30 hours. I planned with Claude and built with Claude Code, working from two documents: `PROJECT_SPEC.md` for what the app should be, and `CURRENT_STATE.md` for what it actually does, including what was and wasn't tested. I made the product and design calls, reviewed every change, and did the real-phone testing on Android.

Stack: Next.js, Supabase (Postgres, Auth, RLS), Vercel.

## What I'd do next

Right now Pakka is a portfolio project with no real users, and I haven't spoken to sellers yet. If I took it further, I'd talk to real sellers first to check the problem is what I think it is. Then I'd rebuild it as a native app with React Native and Expo, for offline use and notifications, and after that add automatic confirmations through the WhatsApp Business API.
