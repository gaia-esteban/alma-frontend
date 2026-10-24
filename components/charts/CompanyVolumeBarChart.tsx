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
  data: { company: string; invoices: number; files: number }[];
}

export function CompanyVolumeBarChart({ data }: Props) {
  const hasData = useMemo(() => data.some(d => d.invoices > 0 || d.files > 0), [data]);

  if (!hasData) {
    return (
      <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
        Sin facturas ni archivos contables en el período
      </div>
    );
  }

  const height = Math.max(280, data.length * 56);

  return (
    <ChartContainer config={chartConfig} className="w-full" style={{ height }}>
      <BarChart
        data={data}
        layout="vertical"
        accessibilityLayer
        margin={{ top: 8, right: 24, bottom: 0, left: 8 }}
      >
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        <XAxis type="number" tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 11 }} allowDecimals={false} />
        <YAxis
          dataKey="company"
          type="category"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fontSize: 12 }}
          width={110}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="invoices" fill="var(--color-invoices)" radius={[0, 4, 4, 0]}>
          <LabelList dataKey="invoices" position="right" fontSize={11} />
        </Bar>
        <Bar dataKey="files" fill="var(--color-files)" radius={[0, 4, 4, 0]}>
          <LabelList dataKey="files" position="right" fontSize={11} />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
