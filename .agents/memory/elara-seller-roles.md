---
name: Elara seller and mixeiro model
description: One-account role-based seller model, onboarding flow, and mixeiro as a future verified tier.
---

# Elara seller and mixeiro model

## Rule
Elara uses **one account with roles**, not separate buyer/seller/mixeiro accounts.

- Every new user starts as a **buyer**.
- A buyer can activate the **seller** role through a dedicated onboarding flow (`/src/views/SellerOnboardingView.tsx`).
- Once a seller is active, the app shows a **Seller Dashboard** (`/src/views/SellerDashboardView.tsx`) and a clear buyer/seller mode switch.
- **Mixeiro** is not a standalone role. It is treated as a future verified seller/agent tier (`mixeiroStatus` / `mixeiroVerified`) rather than a core role.
- The old `intermediary` user role has been removed from the type system and the UI.

**Why:** Separate buyer/seller accounts create duplication and confusion. One account keeps identity, orders, and messages unified. Mixeiro is deferred to Phase 2 so the core buying/selling experience is solid first.

**How to apply:**
- Do not reintroduce a role selector during signup; sign everyone up as `buyer`.
- Store seller-specific KYC fields (shop name, bank details, ID document, status, verification level) on the profile or in a joined `seller_profiles` table.
- Seller status lifecycle is `none` → `pending` → `active` (or `suspended`/`rejected`).
- The rotating Settings dev shortcut (old `DevTools`) should not be used to test roles; it has been removed.
