# Accessibility (shadcn / Recharts)

shadcn charts inherit Recharts' accessibility primitives and add labels via `chartConfig`, but you still need to do the work below. Charts are easy to ship as inaccessible images-of-data.

## 1. Enable `accessibilityLayer`

Add `accessibilityLayer` to every chart element (`<LineChart>`, `<BarChart>`, etc.). It enables keyboard navigation across data points and exposes values to assistive tech.

```tsx
<LineChart data={data} accessibilityLayer>...</LineChart>
```

## 2. Label the chart and its axes

A styled `<CardTitle>` is not a programmatic name. Wrap the chart region with one:

```tsx
<div role="img" aria-label="Monthly revenue, January to December 2026, trending upward">
  <ChartContainer config={chartConfig} className="h-[300px] w-full">...</ChartContainer>
</div>
```

Give axes human-readable labels with units:

```tsx
<XAxis dataKey="date" label={{ value: 'Month', position: 'insideBottom', offset: -4 }} />
<YAxis label={{ value: 'Revenue (USD)', angle: -90, position: 'insideLeft' }} />
```

The `chartConfig` `label` fields also feed the shadcn tooltip/legend, so accurate labels there improve the screen-reader experience automatically.

## 3. Provide a data-table fallback

The most reliable screen-reader experience is the underlying numbers as a real table, visually hidden alongside the chart. Use Tailwind's `sr-only`:

```tsx
<table className="sr-only">
  <caption>Monthly revenue 2026</caption>
  <thead><tr><th>Month</th><th>Revenue (USD)</th></tr></thead>
  <tbody>
    {data.map((d) => (
      <tr key={d.date}><td>{d.date}</td><td>{d.revenue.toLocaleString()}</td></tr>
    ))}
  </tbody>
</table>
```

`sr-only` ships with Tailwind — no custom CSS needed.

## 4. Don't encode meaning with color alone

Differentiate series by more than hue: vary line `strokeDasharray`, marker shape, or direct labels. Serves color-blind users and survives grayscale printing. The `--chart-1..5` defaults aren't guaranteed colorblind-safe — verify if your data has many series.

## 5. Respect reduced motion

Disable chart animation when the user asks for less motion.

```tsx
'use client';
import { useState, useEffect } from 'react';

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

// usage:
const reduced = usePrefersReducedMotion();
<Line dataKey="v" isAnimationActive={!reduced} />
```

## 6. Contrast

Axis text, gridlines, and series colors must meet WCAG contrast against the surface (4.5:1 for text). Because shadcn defines `--chart-*` separately for light and `.dark`, **verify both themes** — gridlines and lighter series tend to fail in dark mode.

## Checklist

- [ ] `accessibilityLayer` on every chart
- [ ] `role="img"` + descriptive `aria-label` on each chart container
- [ ] Accurate `label`s in `chartConfig`; axis labels with units
- [ ] Visually-hidden (`sr-only`) data table per chart
- [ ] Series distinguishable without color
- [ ] Animation respects `prefers-reduced-motion`
- [ ] Contrast checked in both light and `.dark` themes
