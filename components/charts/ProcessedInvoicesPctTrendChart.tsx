'use client';

import { useMemo } from 'react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

const chartConfig = {
  pct: { label: '% procesadas', color: '#0CE4AC' },
} satisfies ChartConfig;

interface Props {
  data: { label: string; pct: number; received: number; processed: number }[];
}

export function ProcessedInvoicesPctTrendChart({ data }: Props) {
  const hasData = useMemo(() => data.some(d => d.received > 0), [data]);

  if (!hasData) {
    return (
      <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
        Sin facturas en el período seleccionado
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-[280px] w-full">
      <LineChart data={data} accessibilityLayer margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 11 }} />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fontSize: 11 }}
          domain={[0, 100]}
          tickFormatter={v => `${v}%`}
          width={36}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, _name, item) => {
                const point = item.payload as { received: number; processed: number };
                return `${Number(value).toFixed(0)}% (${point.processed}/${point.received})`;
              }}
            />
          }
        />
        <Line
          dataKey="pct"
          type="monotone"
          stroke="var(--color-pct)"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ChartContainer>
  );
}
