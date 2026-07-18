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
- `src/components/` — Modular UI (auth, cart, layout, product, common, discovery)
- `src/views/` — Full-page view components
- `src/lib/supabase.ts` — Supabase client
- `src/constants/` — Mock product and category data (falls back when Supabase is not connected)

## Agent 2 — Product Discovery (this branch of work)
Implemented the product discovery/browsing experience:
- `src/views/ProductListingView.tsx` — dedicated Product Listing Page (PLP) with filters, sort, and active filter chips
- `src/components/discovery/FiltersPanel.tsx` — price range, condition, verified seller, local/import toggles; sidebar on desktop, bottom sheet on mobile
- `src/components/discovery/SortSelect.tsx` — sort dropdown (relevance, price, newest, promotions, rating)
- `src/components/discovery/SearchSuggestions.tsx` — search input with suggestions and recent searches (component ready for integration)
- `src/components/product/ProductCard.tsx` — enhanced with discount badge, delivery estimate, verified badge, seller info
- `src/components/product/ProductDetailsModal.tsx` — enhanced with image gallery, description, specs, seller card, WhatsApp button, "Buy Now" button
- `src/components/product/ProductGallery.tsx` — reusable image gallery
- Home page now has category pills and fixes the always-true `ImportFeed` bug; ImportFeed is only shown for the `intermediary` (Micheiro) role
- App falls back to mock products when Supabase is not configured so the frontend can be tested

## User Preferences
- Keep the purple colour theme (`#5A189A`)
- Keep the existing dark/light mode toggle
- Build proper Amazon-style e-commerce features for Angola
