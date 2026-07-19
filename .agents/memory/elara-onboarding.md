---
name: Elara onboarding
description: First-visit onboarding flow, shown once, stored in localStorage
---

## Rule
OnboardingFlow renders as a full-screen overlay (z-[200]) on first visit. It is stored in App.tsx state initialized from `localStorage.getItem('elara_onboarded')`.

## Steps
1. Welcome — value props (fast delivery, secure payment, verified sellers) + CTA + skip
2. City picker — 6 Angolan cities with delivery speed labels; selected city saved to `elara_city`
3. Account (optional) — Google, Facebook, email/phone; "Continuar como visitante" always available

## Persistence
- `localStorage.setItem('elara_onboarded', '1')` on complete or skip
- `localStorage.setItem('elara_city', city)` on step 2

**Why:** Progressive onboarding improves conversion; skippable at every step to avoid friction. City selection enables correct delivery time estimates throughout the app.

**How to apply:** To reset onboarding for testing, clear `elara_onboarded` from localStorage. DevTools gear icon can also be used for role switching without triggering onboarding again.
