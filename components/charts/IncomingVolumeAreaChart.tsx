'use client';

import { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

const chartConfig = {
  invoices: { label: 'Facturas recibidas', color: '#E8A020' },
} satisfies ChartConfig;

interface Props {
  data: { label: string; invoices: number }[];
}

export function IncomingVolumeAreaChart({ data }: Props) {
  const hasData = useMemo(() => data.some(d => d.invoices > 0), [data]);

  if (!hasData) {
    return (
      <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
        Sin facturas recibidas en el período
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-[280px] w-full">
      <AreaChart data={data} accessibilityLayer margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="fillInvoices" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-invoices)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--color-invoices)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 11 }} />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fontSize: 11 }}
          allowDecimals={false}
          width={30}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area
          dataKey="invoices"
          type="monotone"
          stroke="var(--color-invoices)"
          fill="url(#fillInvoices)"
          strokeWidth={2}
          dot={false}
        />
      </AreaChart>
    </ChartContainer>
  );
}
