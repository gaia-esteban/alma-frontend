---
name: alma-brand-system
description: Alma's brand colors and typography — gold amber + dark navy from logo, Plus Jakarta Sans font
metadata:
  type: project
---

Brand colors derived from the Alma logo (handwritten "Al Ma." script on dark navy, in gold amber):

**Primary accent**: `#E8A020` (gold amber) — buttons, links, CTAs, focus rings
**Primary light**: `#F5C96D` — hover tints
**Primary dark**: `#C4820A` — pressed states
**Primary foreground**: `#172C3B` — navy text on gold backgrounds

**Secondary structure**: `#172C3B` (dark navy) — headers, sidebar, nav
**Secondary light**: `#243B50` — hover states on navy
**Secondary foreground**: `#FFFFFF`

**Backgrounds**: `#F7F8FA` (page), `#FFFFFF` (card/surface)
**Text**: `#172C3B` primary, `#6B7E8E` muted
**Border**: `#D4DCE4`
**Success**: `#0CE4AC` (kept from original green)
**Destructive**: `#EF4444`

**Font**: Plus Jakarta Sans (300/400/500/600/700) — clean, humanist, widely-used in SaaS
Variable: `--font-jakarta-sans` in layout.tsx, referenced as `--font-sans` in globals.css

**Source files**: `lib/colors.ts`, `app/globals.css`, `app/layout.tsx`

**Why:** Logo shows navy + gold amber as the brand identity. Green primary (#0ce4ac) was replaced. Plus Jakarta Sans chosen for professional SaaS feel (sober, widely-used).
**How to apply:** Always import from `lib/colors.ts`. Use CSS vars (`--primary`, `--secondary`) in Tailwind. Do not hardcode hex values outside these files.
