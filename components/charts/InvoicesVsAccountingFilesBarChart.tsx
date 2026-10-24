'use client';

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';

const chartConfig = {
  invoices: { label: 'Facturas recibidas', color: '#E8A020' },
  files: { label: 'Archivos contables creados', color: '#243B50' },
} satisfies ChartConfig;

interface Props {
  data: { label: string; invoices: number; files: number }[];
}

export function InvoicesVsAccountingFilesBarChart({ data }: Props) {
  const hasData = useMemo(() => data.some(d => d.invoices > 0 || d.files > 0), [data]);

  if (!hasData) {
    return (
      <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
        Sin facturas ni archivos contables en el período
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-[280px] w-full">
      <BarChart data={data} accessibilityLayer margin={{ top: 20, right: 8, bottom: 0, left: 0 }}>
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
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="invoices" fill="var(--color-invoices)" radius={[4, 4, 0, 0]}>
          <LabelList dataKey="invoices" position="top" fontSize={11} />
        </Bar>
        <Bar dataKey="files" fill="var(--color-files)" radius={[4, 4, 0, 0]}>
          <LabelList dataKey="files" position="top" fontSize={11} />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
