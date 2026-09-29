# Divyanshu's 7-Day Smoke-Free Challenge

**Independent single-user app.** Dates: 29 September to 5 October 2026, Asia/Kolkata. Inspired by the original 100-day challenge, without modifying or importing its data.

## Features
- Private email magic-link authentication, restricted in the database to Divyanshu's email
- Three daily check-ins (12:05 PM, 5:30 PM, 10:30 PM IST)
- Seven-day calendar, clean-day count and transparent consumption log
- Catch-up check-ins for past challenge days
- Smoking entries require quantity, exact time and reason
- A recorded slip does not end the challenge

## Infrastructure
- Separate Supabase project: `qtcykwhaqrjzgwzasdwy` (Mumbai)
- Static GitHub Pages frontend; no service-role secrets in source
- Supabase RLS restricts all data to the designated account

## Launch
1. In Supabase [Authentication → URL Configuration](https://supabase.com/dashboard/project/qtcykwhaqrjzgwzasdwy/auth/url-configuration), set Site URL and redirect allowlist to `https://cadivyanshu.github.io/7-Day-Challenge-/`.
2. In GitHub Settings → Pages, select **GitHub Actions** as the source. The included workflow deploys the root.
3. Open `https://cadivyanshu.github.io/7-Day-Challenge-/`, request a magic link for your email and sign in.
4. Do not create other users. The database denies access to other email addresses.

**Email reminders are not activated.** They require a separate email-provider secret and scheduler in the new Supabase project. Do not copy secrets from the old project.

The old 100-day repository and its Supabase project are unchanged.