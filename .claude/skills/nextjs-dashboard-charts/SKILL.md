---
name: nextjs-dashboard-charts
description: Build performant, production-grade dashboards and data-visualization charts in a Next.js (App Router) + Tailwind application using shadcn/ui charts (built on Recharts). Use this skill whenever the user asks to build a dashboard, analytics page, admin panel, metrics view, or any UI containing charts (line, area, bar, pie, radar, radial, KPI/stat cards, sparklines) in a Next.js + React + Tailwind project. Trigger on mentions of "dashboard", "charts", "graphs", "data viz", "analytics page", "shadcn charts", "Recharts", or rendering tabular/time-series data visually. Pairs with the frontend-design skill for aesthetic direction. Do NOT use for static marketing pages with no data viz, or for non-React / non-Tailwind stacks.
---

# Next.js Dashboard & Charts (shadcn/ui)

Build dashboards and charts that are fast, accessible, server-rendered where possible, and visually consistent with a Tailwind design system. This skill encodes the library choice, the App Router rendering boundaries, and the performance patterns that separate a production dashboard from a laggy `'use client'` blob.

For the *aesthetic* layer (palette, typography, layout personality), defer to the **frontend-design** skill and treat the guidance here as the structural/performance layer. The two compose.

## Library choice: shadcn/ui charts (the default)

Use **shadcn/ui charts** — the official chart components at `ui.shadcn.com/charts` — for any Tailwind + Next.js project.

- **Not a dependency, it's your code**: `npx shadcn@latest add chart` copies a `chart.tsx` component into `@/components/ui/`. You own it, can edit it, and there's no extra package to track for security advisories.
- **Built on Recharts**: the actual rendering is Recharts (MIT, ~2M weekly downloads, SVG, minimal dependency surface). shadcn adds a thin theming/wrapper layer (`ChartContainer`, `ChartConfig`, `ChartTooltip`) — so all Recharts knowledge and the performance rules below still apply.
- **Free & clean license**: MIT, no commercial tier, no attribution.
- **Tailwind-native theming**: colors live in a `chartConfig` object referencing `var(--chart-1..5)` CSS variables that shadcn defines in your global stylesheet. Dark mode works automatically through the same token system as the rest of your shadcn UI.
- **Copy-paste blocks**: whole chart variants (e.g. `npx shadcn@latest add chart-area-interactive`) can be pulled in and customized.

### Prerequisite: shadcn must be initialized

shadcn charts require shadcn/ui to be set up in the project (`components.json` present, `@/components/ui`, Tailwind configured). If it isn't:

```bash
npx shadcn@latest init      # only if components.json doesn't exist yet
```

Then add the chart component (this also installs Recharts as a dependency):

```bash
npx shadcn@latest add chart
```

This creates `components/ui/chart.tsx` exporting `ChartContainer`, `ChartTooltip`, `ChartTooltipContent`, `ChartLegend`, `ChartLegendContent`, and the `ChartConfig` type. Verify the Recharts version it pulled with `npm view recharts version` (currently 3.x) before pinning.

### When to pick something else

shadcn charts render **SVG** (via Recharts), great up to a few thousand points but degrading past that. Switch only for a real reason:

| Need | Use instead | Why |
|---|---|---|
| 10k–1M+ points, real-time streams, financial tick data | **react-chartjs-2** (Chart.js, Canvas) or **Apache ECharts** | Canvas/GPU rendering holds 60fps where SVG chokes |
| Chart families Recharts lacks (heatmap, treemap, candlestick) | **ApexCharts** or **ECharts** | native support for those types |
| Fully bespoke / artistic visualization | **visx** (Airbnb) or raw **D3** | low-level primitives, total control, more engineering time |

All are free and widely used. Don't reach for them by default — shadcn charts are the practical default for a Tailwind dashboard; the rest are escalations. State the tradeoff if you switch. Pin versions, install only what you need, and avoid abandoned wrappers.

## The one rule that governs everything: the client boundary

Recharts (and therefore shadcn charts) depends on browser APIs, so **every chart must live in a Client Component** (`'use client'`). The performance mistake is letting that `'use client'` leak upward and turn your whole dashboard into a client bundle.

**Pattern: fetch on the server, render charts on the client.** Keep the page a Server Component, do data fetching there, and pass plain serializable data down into small client-side chart components.

```
app/dashboard/page.tsx           ← Server Component: fetch data, lay out the grid
  └─ components/charts/RevenueChart.tsx   ← 'use client': ChartContainer + Recharts
  └─ components/StatCard.tsx              ← Server Component: no interactivity needed
```

Push `'use client'` **as far down the tree as possible**. A KPI/stat card with no interaction stays a Server Component. Only the chart leaf is a client island.

See `references/architecture.md` for the full server/client split, streaming with `<Suspense>`, the `chartConfig` theming model, and data-fetching patterns.

## Performance patterns (read before building)

These keep a dashboard fast. Full code in `references/performance.md`.

1. **Server-fetch, client-render.** Never `useEffect`-fetch chart data when the page can fetch it on the server.
2. **`ChartContainer` handles sizing — give it a height class.** shadcn's `ChartContainer` wraps Recharts' `ResponsiveContainer` internally; set its height with a Tailwind class (e.g. `className="h-[300px] w-full"`) on a stable parent to avoid layout shift. Do NOT add your own `ResponsiveContainer` inside it.
3. **Memoize derived data** with `useMemo` so tooltip/hover/filter re-renders don't recompute the series.
4. **Disable animation on large/real-time series**: `isAnimationActive={false}` on the Recharts series element.
5. **Stream below-the-fold charts with `<Suspense>`** so first paint isn't blocked by a slow query.
6. **Code-split heavy/rarely-seen charts** with `next/dynamic`; use `ssr: false` only when a component truly can't render server-side.
7. **Stay under the SVG point budget.** Aggregate/downsample server-side past a few thousand points, or switch to a Canvas library.
8. **Import only the Recharts pieces you use** inside each chart component (shadcn's wrapper is already minimal).

## Build order

1. **Plan layout & data** — which metrics, which chart per metric, what's interactive. Decide the server/client boundary up front.
2. **Ensure shadcn is initialized**, then `npx shadcn@latest add chart`.
3. **Consult frontend-design** for palette and type; map the chosen palette onto the `--chart-1..5` CSS variables so every chart themes from one place.
4. **Scaffold the Server Component page** with the grid and server-side data fetching.
5. **Build chart leaves** as `'use client'` components using `ChartContainer` + a typed `chartConfig`.
6. **Apply performance patterns** (memoization, suspense streaming, animation flags).
7. **Accessibility pass** — `accessibilityLayer` on each chart, labels, and a data-table fallback (`references/accessibility.md`).

## Reference files

- `references/architecture.md` — server/client split, Suspense streaming, data fetching, `next/dynamic`, and the `chartConfig` / CSS-variable theming model.
- `references/chart-patterns.md` — copy-paste shadcn chart components (line, area, bar, pie/donut, radar, sparkline), KPI/stat card, dashboard grid, and tooltip/legend usage.
- `references/performance.md` — each performance pattern with before/after code and the SVG point-budget guidance.
- `references/accessibility.md` — `accessibilityLayer`, labels, reduced-motion, screen-reader data fallbacks.

Read the reference file relevant to the task before writing code; don't reconstruct these from memory.
