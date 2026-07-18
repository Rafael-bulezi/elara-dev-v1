# Codebase State Audit: Phase 2 Baseline

This document provides a comprehensive overview of the current architectural state, component inventory, and integration status after the Phase 1 refactoring and early Phase 2 implementations.

## 1. Architectural Map

### Current Folder Structure (Post-Phase 1)
- `server.ts`: Node/Express entry point for API routes (Email/Resend).
- `src/`:
  - `components/`: Modular component architecture.
    - `auth/`: Authentication logic (`AuthModal`, `ProfileDrawer`).
    - `cart/`: Ecommerce checkout flows (`CartDrawer`, `CheckoutModal`).
    - `common/`: Generic UI utils (`DevTools`, `ErrorBoundary`, `InstallPrompt`).
    - `layout/`: Global structure (`Header`, `Hero`, `Footer`, `BottomNav`, `MobileMenu`).
    - `product/`: Commerce UI (`ProductCard`, `ProductDetailsModal`, `ImportRequestForm`).
  - `constants/`: Shared mocks and business logic (`categories`, `products`).
  - `lib/`: SDK initializations (`supabase.ts`, `notifications.ts`).
  - `types/`: Comprehensive TypeScript interfaces.
  - `utils/`: Reusable helpers and `animations.ts`.
  - `views/`: Full-page view components (state-based routing).

### Main Entry Points
- **Frontend**: `src/main.tsx` -> `src/App.tsx`.
- **Backend (API)**: `server.ts` (Handles `/api/notify`).

---

## 2. Component Inventory

### Active Components (Rendered in App.tsx)
| Component | Category | Purpose |
| ----------- | ----------- | ----------- |
| `Header` | Layout | Navigation & Search. |
| `Footer` | Layout | Page Bottom details. |
| `Hero` | Layout | Main home banner. |
| `ProductCard` | Product | Item display. |
| `AuthModal` | Auth | Sign-in/Sign-up flow. |
| `CartDrawer` | Cart | Sidebar cart view. |
| `DevTools` | Common | **[NEW]** Local mock authentication switcher. |
| `ImportRequestForm` | Product | **[NEW]** Buyer importation request modal. |
| `InstallPrompt` | Common | PWA installation handling. |

### Unlinked or Legacy Components
- **`ImportQuoteView.tsx`**: Legacy view component that references a `quotes` table. Currently bypassed in favor of the new `ImportRequestForm` modal.
- **`AdminView.tsx`**: Present on disk but logic for active rendering in `App.tsx` is secondary for Micheiros.

---

## 3. Environment & Integrations

### Service Status
- **`.env` Configuration**: Working correctly via `dotenv/config` at the top of `server.ts`.
- **Supabase**: Active in `lib/supabase.ts`. Handles profiles and products.
- **Resend**: Integrated into `server.ts`. **Safe Mode active**: Only attempts to send if `RESEND_API_KEY` is set; otherwise, logs to console.
- **OneSignal**: Initialized in `lib/notifications.ts` via `App.tsx` effect.

### Mock Data Strategy
- **Products/Categories**: Sourced from `src/constants/index.ts`.
- **User Roles**: Mocked via `DevTools.tsx` for local testing (`buyer`, `seller`, `intermediary`, `admin`).

---

## 4. Phase 2 Progress (Importation System)

### Implemented Features
- [x] **`ImportRequestForm.tsx`**: Complex form with image preview and budget/urgency fields.
- [x] **Header UI**: Added "Importar" button with `Globe` icon.
- [x] **Dashboard CTA**: Added high-end purple gradient card for custom requests.
- [x] **Mock Submission**: Submission logic in `App.tsx` logs to console and shows success toast.

### Missing / "Broken Links"
- **Micheiro Feed**: No active view exists for Micheiros to see incoming requests (currently showing standard buyer feed).
- **Import Table**: Submissions are not yet hitting the database (only console logs).
- **Profile Redirection**: Clicking "Ver Perfil" on the header doesn't yet route to a specific Micheiro view.

---

## 5. Global Styling Verification

### Primary Color: `#5A189A`
- **Definition**: Currently **not defined** as a CSS variable in `index.css` or as a theme color in `tailwind.config.js`.
- **Usage**: Hardcoded as hex values in multiple files:
  - `App.tsx`: Homepage CTA card gradient.
  - `Header.tsx`: Import button background.
  - `ImportRequestForm.tsx`: Submit button background.
- **Action Item**: Standardize this to `bg-brand` or `--color-primary` in Phase 3.
