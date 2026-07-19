---
name: Elara routing pattern
description: How navigation works in App.tsx — state machine, no router library
---

State-based routing via `currentView` state. Views: home | orders | products | settings | seller | admin | messages | chat | quote | category | product.

**Why:** Project was bootstrapped without a router; adding one would require a full migration.

**How to apply:** 
- Navigate with `navigateTo(view)` which sets state, resets scroll, closes drawers.
- Product click → `handleProductClick(p)` sets `selectedProduct` + navigates to `'product'` view.
- Category click → `handleSelectCategory(name)` sets filter + navigates to `'category'`.
- The `'product'` view renders `<ProductDetailPage>` as a full page (not modal).
- `ProductDetailsModal` is kept in the codebase but no longer triggered by card clicks.
