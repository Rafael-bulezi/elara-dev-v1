---
name: Replit package firewall blocks tar
description: Replit's package firewall blocks tar@7.x (and many versions) as a security policy, so mobile-only deps may need to be removed during install.
---

# Replit package firewall blocks tar

During `npm install`, Replit's package firewall (`package-firewall.replit.local`) returned **403 Forbidden** for the `tar` package at both `7.5.13` and `6.2.1`.

**Why:** The tarball is blocked by Replit's security policy, so no version override will help.

**How to apply:** If `@capacitor/cli` (or another dependency) transitively requires `tar`, and you do not need that dependency for the current workflow, remove it from `devDependencies` rather than trying to pin or override the transitive version. Capacitor CLI is only needed for mobile builds; it is not required for the web dev server or preview.
