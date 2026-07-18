# Elara — Angolan E-Commerce Marketplace

## Project Overview
Elara is a React + TypeScript + Vite PWA with an Express backend. It's being built as an Amazon-style marketplace for Angola, supporting buyers, sellers, intermediaries ("Micheiros"), and admins.

**Stack:**
- Frontend: React 18, TypeScript, Tailwind CSS, Framer Motion
- Backend: Node.js + Express (`server.ts`) serving both API routes and Vite dev middleware
- Database & Auth: Supabase
- Email: Resend
- Push Notifications: OneSignal
- Mobile: Capacitor (Android)
- PWA: vite-plugin-pwa

**Brand colour:** `#5A189A` (purple)

## How to Run
The workflow `Start application` runs `npm run dev`, which starts the Express + Vite dev server on port 5000.

## Required Secrets
Set these in Replit Secrets before the app can connect to the database:
- `VITE_SUPABASE_URL` — your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — your Supabase anon/public key

Optional:
- `RESEND_API_KEY` — for email notifications (falls back to console logging if unset)
- `ONESIGNAL_APP_ID` — for push notifications

## Architecture
- `server.ts` — Express entry point; handles `/api/notify` email endpoint and proxies to Vite in dev
- `src/App.tsx` — Root component; holds global state and routing logic (view-based, no router library)
- `src/components/` — Modular UI (auth, cart, layout, product, common)
- `src/views/` — Full-page view components
- `src/lib/supabase.ts` — Supabase client
- `src/constants/` — Mock product and category data (to be replaced with real DB data)

## User Preferences
- Keep the purple colour theme (`#5A189A`)
- Keep the existing dark/light mode toggle
- Build proper Amazon-style e-commerce features for Angola
