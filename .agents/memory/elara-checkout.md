---
name: Elara checkout & payment
description: 4-step checkout modal with Angola-specific payment methods
---

## Rule
CheckoutModal is a 4-step flow: Address → Review → Payment → Confirmation.

## Payment methods (Angola-specific)
- **Multicaixa Express**: QR code shown inline (30min expiry)
- **Referência Multicaixa**: Reference number + instructions for ATM/banking
- **COD (Pagamento na Entrega)**: Cash on delivery — customer told to have exact change

## Delivery options
- Luanda fast: 24–48h, Kz 1,500
- Provinces: 2–5 days, Kz 2,500
- Store pickup: Free

**Why:** These are the dominant payment rails in Angola — no international card acceptance needed on first launch. Supabase order write is wrapped in try/catch; gracefully skips if Supabase not configured.

**How to apply:** Any new checkout flow or order creation must include these 3 payment types and 3 delivery options.
