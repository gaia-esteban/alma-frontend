# Architecture: App Router server/client split (shadcn charts)

The goal: keep the page a **Server Component**, fetch data on the server, and make each chart a small **client island** built with shadcn's `ChartContainer`. This minimizes the client bundle and avoids `useEffect` fetch waterfalls.

## Directory shape

```
app/
  dashboard/
    page.tsx              # Server Component — fetch + layout
    loading.tsx           # optional route-level skeleton
components/
  ui/
    chart.tsx             # from `npx shadcn@latest add chart` — do not hand-edit unless needed
  charts/
    RevenueChart.tsx      # 'use client'
    UsersAreaChart.tsx    # 'use client'
  StatCard.tsx            # Server Component (no interactivity)
lib/
  data.ts                 # server-only data access
```

## Theming model: chartConfig + CSS variables

shadcn charts get their colors from two places working together:

1. **CSS variables** `--chart-1` through `--chart-5`, defined by shadcn in your global stylesheet (light + dark). Derive these from the frontend-design palette.

```css
/* globals.css (shadcn typically scaffolds these) */
:root {
  --chart-1: 220 90% 56%;
  --chart-2: 160 84% 39%;
  --chart-3: 38 92% 50%;
  --chart-4: 280 65% 60%;
  --chart-5: 340 75% 55%;
}
.dark {
  --chart-1: 220 70% 50%;
  --chart-2: 160 60% 45%;
  --chart-3: 30 80% 55%;
  --chart-4: 280 65% 60%;
  --chart-5: 340 75% 55%;
}
```

2. **A typed `chartConfig`** per chart that maps each data series to a label and a color token:

```tsx
import { type ChartConfig } from '@/components/ui/chart';

const chartConfig = {
  revenue: { label: 'Revenue', color: 'var(--chart-1)' },
  users:   { label: 'Users',   color: 'var(--chart-2)' },
} satisfies ChartConfig;
```

The `satisfies ChartConfig` gives you autocomplete and type-checking on series keys. Reference the color in Recharts elements as `var(--color-revenue)` — shadcn auto-generates a `--color-{key}` variable from the config key, so you never hardcode a hex inside the chart.

## Server Component page (fetch here)

```tsx
// app/dashboard/page.tsx  — NO 'use client'
import { Suspense } from 'react';
import { getRevenue, getUsers, getKpis } from '@/lib/data';
import { RevenueChart } from '@/components/charts/RevenueChart';
import { UsersAreaChart } from '@/components/charts/UsersAreaChart';
import { StatCard } from '@/components/StatCard';
import { Skeleton } from '@/components/ui/skeleton';

export default async function DashboardPage() {
  const kpis = await getKpis(); // fast — render immediately

  return (
    <main className="space-y-6 p-6">
      {/* KPI cards are Server Components, painted on first response */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <StatCard key={k.id} label={k.label} value={k.value} delta={k.delta} />
        ))}
      </section>

      {/* Charts stream in independently so they don't block first paint */}
      <section className="grid gap-4 lg:grid-cols-2">
        <Suspense fallback={<Skeleton className="h-[340px] w-full rounded-xl" />}>
          <RevenuePanel />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-[340px] w-full rounded-xl" />}>
          <UsersPanel />
        </Suspense>
      </section>
    </main>
  );
}

// Each async panel fetches its own slice — independent streaming.
async function RevenuePanel() {
  const data = await getRevenue();
  return <RevenueChart data={data} />;
}
async function UsersPanel() {
  const data = await getUsers();
  return <UsersAreaChart data={data} />;
}
```

Splitting into `*Panel` async components means each `<Suspense>` boundary streams as soon as *its* data resolves — a slow query for one chart never blocks the others.

## Client chart leaf (render here)

```tsx
// components/charts/RevenueChart.tsx
'use client';

import { useMemo } from 'react';
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig,
} from '@/components/ui/chart';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

type Point = { date: string; revenue: number };

const chartConfig = {
  revenue: { label: 'Revenue', color: 'var(--chart-1)' },
} satisfies ChartConfig;

export function RevenueChart({ data }: { data: Point[] }) {
  // Memoize any transform so tooltip/hover re-renders don't recompute.
  const series = useMemo(
    () => data.map((d) => ({ ...d, revenue: Math.round(d.revenue) })),
    [data],
  );

  return (
    <Card>
      <CardHeader><CardTitle>Revenue</CardTitle></CardHeader>
      <CardContent>
        {/* ChartContainer handles responsive sizing — set height here, no ResponsiveContainer */}
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <LineChart data={series} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              dataKey="revenue"
              type="monotone"
              stroke="var(--color-revenue)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
```

Key points: **no `ResponsiveContainer`** — `ChartContainer` wraps it for you and sizes from the `h-[300px]` class; data arrives as a serializable **prop** from the server, not a client fetch; the line color is `var(--color-revenue)`, auto-derived from the `chartConfig` key.

## When you genuinely need client-only loading

If a chart truly cannot render on the server path, lazy-load it with `next/dynamic`:

```tsx
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const HeatmapChart = dynamic(
  () => import('@/components/charts/HeatmapChart'),
  { ssr: false, loading: () => <Skeleton className="h-[300px] w-full" /> },
);
```

Use `ssr: false` sparingly — it gives up server rendering for that component. Prefer the server-fetch/client-render split above; reach for `dynamic` mainly to **code-split** heavy or rarely-viewed charts out of the initial bundle.
