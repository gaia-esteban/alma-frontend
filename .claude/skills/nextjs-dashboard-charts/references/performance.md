# Performance patterns (shadcn / Recharts)

Each pattern with the mistake it fixes. Apply all that are relevant; for most dashboards 1–5 are mandatory. shadcn charts render via Recharts, so these are Recharts-level concerns with shadcn's `ChartContainer` in place of a raw `ResponsiveContainer`.

## 1. Server-fetch, client-render (not `useEffect` fetch)

**Bad** — client waterfall, spinner, no SSR/SEO:
```tsx
'use client';
function Chart() {
  const [data, setData] = useState([]);
  useEffect(() => { fetch('/api/revenue').then(r => r.json()).then(setData); }, []);
  return <ChartContainer config={cfg}><LineChart data={data} .../></ChartContainer>;
}
```

**Good** — fetch in the Server Component, pass data as a prop:
```tsx
// page.tsx (Server Component)
const data = await getRevenue();
return <RevenueChart data={data} />;   // RevenueChart is the 'use client' leaf
```

Data is in the first HTML response, no client round-trip, no spinner.

## 2. Let `ChartContainer` size the chart — give it a height class

**Bad** — adding your own `ResponsiveContainer` inside `ChartContainer` (double-wrapping causes measurement bugs and zero-height charts), or hardcoding pixel width with a resize listener:
```tsx
<ChartContainer config={cfg}>
  <ResponsiveContainer width="100%" height={300}>  {/* ❌ ChartContainer already does this */}
    <LineChart .../>
  </ResponsiveContainer>
</ChartContainer>
```

**Good**:
```tsx
<ChartContainer config={cfg} className="h-[300px] w-full">
  <LineChart data={data} accessibilityLayer>...</LineChart>
</ChartContainer>
```

`ChartContainer` wraps `ResponsiveContainer` internally and measures from its own box. Set the height with a Tailwind class on a stable parent so there's no cumulative layout shift.

## 3. Memoize derived data

Tooltips, hover, and filter toggles re-render the chart. Without memoization every re-render re-transforms the full series.

```tsx
const series = useMemo(
  () => raw.map(d => ({ ...d, total: d.a + d.b })),
  [raw],
);
```

Passing an inline-computed array (`data={raw.map(...)}`) allocates a new array every render and defeats Recharts' internal memoization.

## 4. Disable animation on large or real-time series

```tsx
<Line dataKey="v" isAnimationActive={false} dot={false} />
```

Animation replays on every data update. For streaming/real-time dashboards or series with thousands of points, the animation re-run is a primary jank source. Turn it off there; keep it for small static charts where it adds polish.

## 5. Stream below-the-fold charts with `<Suspense>`

```tsx
<section className="grid gap-4 sm:grid-cols-4">{/* KPIs, render immediately */}</section>

<Suspense fallback={<Skeleton className="h-[340px] w-full rounded-xl" />}>
  <HeavyChartPanel />   {/* async server component, streams when ready */}
</Suspense>
```

First paint shows KPIs and skeletons; charts hydrate as their data resolves. One slow query no longer blocks the page.

## 6. Code-split heavy / rarely-seen charts

```tsx
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const GeoMap = dynamic(() => import('@/components/charts/GeoMap'), {
  loading: () => <Skeleton className="h-[300px] w-full" />,
  // ssr: false ONLY if it can't render server-side
});
```

Keeps charts that aren't on the initial view out of the first JS bundle.

## 7. Respect the SVG point budget

Recharts renders SVG. Comfortable up to ~1–2k points per series; degrades beyond, struggles past ~10k.

- **Aggregate/downsample on the server**: roll daily data up to weekly, or LTTB-downsample dense series before sending to the client.
- Cap visible points; load detail on zoom rather than rendering everything.
- For 10k+ live points (financial ticks, sensor streams), switch that chart to a **Canvas** library — `react-chartjs-2` (Chart.js) or **Apache ECharts**, both free. Per-chart decision; the rest of the dashboard stays on shadcn/Recharts.

## 8. Import only what you use

```tsx
import { BarChart, Bar, XAxis, YAxis } from 'recharts'; // tree-shaken
```

Don't `import * as Recharts`. Don't ship chart types the dashboard never renders. shadcn's `chart.tsx` wrapper is already minimal.

## Quick checklist

- [ ] Page is a Server Component; charts are `'use client'` leaves
- [ ] Data fetched on server, passed as serializable props
- [ ] Each chart uses `ChartContainer` with a height class — no nested `ResponsiveContainer`
- [ ] Derived data memoized; no inline `.map()` into `data=`
- [ ] Animation off for large/real-time series
- [ ] Below-the-fold charts behind `<Suspense>`
- [ ] Heavy/rare charts code-split with `next/dynamic`
- [ ] Series under the SVG point budget (else Canvas lib)
- [ ] `accessibilityLayer` on each chart
