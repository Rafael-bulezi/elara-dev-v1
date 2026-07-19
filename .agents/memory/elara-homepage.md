---
name: Elara homepage structure
description: 7-section homepage layout, category mega-menu above hero
---

**Category strip:** `<CategoryMegaMenu>` — pill-style, sticky, rendered between `<Header>` and `<main>`. On hover shows mega-menu dropdown with category banner image (left) + 5 product mini-cards (right). The old plain-text category nav strip was removed from Header.tsx.

**Why:** User explicitly wanted the pill-format strip above the hero, not duplicated below it.

**Homepage 7 sections (in order):**
1. Hero carousel (hero-banner.jpg + promo banners)
2. Ofertas do Dia — 6-card horizontal scroll / 6-col grid
3. FeatureHeroSection (Smartphones) — 1 large + 2×2 asymmetric grid
4. StripSection (Moda) — 1×5 horizontal strip
5. ImportCTA — full-width purple banner
6. DuoGrid (Computadores & Casa) — 2×2 grid
7. StatsBanner — dark stats strip

**Do not add more sections** — user limit is 7. Additional categories go via PLP.

**Product images:** /hero-banner.jpg, /banner-urban.jpg, /banner-beauty.jpg, /banner-fitness.jpg, /banner-kitchen.jpg all in public/.
