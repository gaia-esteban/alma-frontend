# Chart patterns (shadcn/ui)

Copy-paste client components for common dashboard charts using shadcn's chart layer. All assume:
- `'use client'` at the top of the file,
- `npx shadcn@latest add chart` has been run (provides `@/components/ui/chart`),
- `--chart-1..5` CSS variables exist (see `architecture.md`),
- each chart defines a typed `chartConfig` and references colors as `var(--color-{key})`.

`ChartContainer` replaces Recharts' `ResponsiveContainer` — set height with a Tailwind class on it, never nest a `ResponsiveContainer` inside.

## Dashboard grid + KPI card (Server Components, no chart)

```tsx
// Pure layout — no 'use client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function StatCard({
  label, value, delta,
}: { label: string; value: string; delta?: number }) {
  const up = (delta ?? 0) >= 0;
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {delta !== undefined && (
          <p className={up ? 'text-sm text-emerald-600' : 'text-sm text-red-600'}>
            {up ? '▲' : '▼'} {Math.abs(delta)}%
          </p>
        )}
      </CardContent>
    </Card>
  );
}
```

Grid is just Tailwind: `grid gap-4 sm:grid-cols-2 lg:grid-cols-4` for KPIs, `grid gap-4 lg:grid-cols-2` for charts.

## Line chart (multi-series)

```tsx
'use client';
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
  ChartLegend, ChartLegendContent, type ChartConfig,
} from '@/components/ui/chart';

const chartConfig = {
  desktop: { label: 'Desktop', color: 'var(--chart-1)' },
  mobile:  { label: 'Mobile',  color: 'var(--chart-2)' },
} satisfies ChartConfig;

export function VisitorsLineChart({ data }: { data: any[] }) {
  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <LineChart data={data} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} tickMargin={8} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Line dataKey="desktop" type="monotone" stroke="var(--color-desktop)" strokeWidth={2} dot={false} />
        <Line dataKey="mobile"  type="monotone" stroke="var(--color-mobile)"  strokeWidth={2} dot={false} />
      </LineChart>
    </ChartContainer>
  );
}
```

## Area chart (gradient fill)

```tsx
'use client';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig,
} from '@/components/ui/chart';

const chartConfig = {
  users: { label: 'Users', color: 'var(--chart-1)' },
} satisfies ChartConfig;

export function UsersAreaChart({ data }: { data: any[] }) {
  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <AreaChart data={data} accessibilityLayer>
        <defs>
          <linearGradient id="fillUsers" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="var(--color-users)" stopOpacity={0.4} />
            <stop offset="95%" stopColor="var(--color-users)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} tickMargin={8} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area dataKey="users" type="monotone" stroke="var(--color-users)" fill="url(#fillUsers)" strokeWidth={2} />
      </AreaChart>
    </ChartContainer>
  );
}
```

## Bar chart

```tsx
'use client';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig,
} from '@/components/ui/chart';

const chartConfig = {
  revenue: { label: 'Revenue', color: 'var(--chart-1)' },
} satisfies ChartConfig;

export function RevenueBarChart({ data }: { data: any[] }) {
  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <BarChart data={data} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} tickMargin={8} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
```

For stacked bars, add `stackId="a"` to multiple `<Bar>` elements, each with its own config key/color.

## Pie / donut chart

```tsx
'use client';
import { Pie, PieChart } from 'recharts';
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig,
} from '@/components/ui/chart';

// For pies, color each datum via a `fill` field on the data referencing --color-{key}.
const chartConfig = {
  visitors: { label: 'Visitors' },
  chrome:   { label: 'Chrome',  color: 'var(--chart-1)' },
  safari:   { label: 'Safari',  color: 'var(--chart-2)' },
  firefox:  { label: 'Firefox', color: 'var(--chart-3)' },
} satisfies ChartConfig;

export function BrowserPie({ data }: { data: { browser: string; visitors: number; fill: string }[] }) {
  // data items look like: { browser: 'chrome', visitors: 275, fill: 'var(--color-chrome)' }
  return (
    <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
      <PieChart accessibilityLayer>
        <ChartTooltip content={<ChartTooltipContent nameKey="browser" hideLabel />} />
        <Pie data={data} dataKey="visitors" nameKey="browser" innerRadius={60} strokeWidth={2} />
      </PieChart>
    </ChartContainer>
  );
}
```

## Radar chart

```tsx
'use client';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from 'recharts';
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig,
} from '@/components/ui/chart';

const chartConfig = {
  score: { label: 'Score', color: 'var(--chart-1)' },
} satisfies ChartConfig;

export function SkillsRadar({ data }: { data: { area: string; score: number }[] }) {
  return (
    <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
      <RadarChart data={data} accessibilityLayer>
        <ChartTooltip content={<ChartTooltipContent />} />
        <PolarGrid />
        <PolarAngleAxis dataKey="area" />
        <Radar dataKey="score" fill="var(--color-score)" fillOpacity={0.6} stroke="var(--color-score)" />
      </RadarChart>
    </ChartContainer>
  );
}
```

## Sparkline (tiny inline trend, e.g. inside a KPI card)

```tsx
'use client';
import { Line, LineChart } from 'recharts';
import { ChartContainer, type ChartConfig } from '@/components/ui/chart';

const chartConfig = { v: { label: 'Trend', color: 'var(--chart-1)' } } satisfies ChartConfig;

export function Sparkline({ data }: { data: { v: number }[] }) {
  return (
    <ChartContainer config={chartConfig} className="h-9 w-28">
      <LineChart data={data}>
        {/* tiny + frequently rendered → no animation */}
        <Line dataKey="v" type="monotone" stroke="var(--color-v)" strokeWidth={2}
              dot={false} isAnimationActive={false} />
      </LineChart>
    </ChartContainer>
  );
}
```

## Notes

- The shadcn tooltip (`ChartTooltipContent`) and legend (`ChartLegendContent`) read labels/colors straight from `chartConfig` — you rarely need a custom tooltip. Use `hideLabel`, `nameKey`, `labelKey` props to adjust.
- Recharts is tree-shakeable — import only the elements each chart uses.
- Pull whole prebuilt blocks when they fit: `npx shadcn@latest add chart-area-interactive`, `chart-bar-interactive`, etc., then trim to your data.
- Keep raw numbers in the data and format in the tooltip/axis (`tickFormatter`) so `useMemo` transforms stay clean.
