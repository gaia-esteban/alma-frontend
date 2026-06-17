'use client';

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

const chartConfig = {
  files: { label: 'Archivos creados', color: '#243B50' },
} satisfies ChartConfig;

interface Props {
  data: { label: string; files: number }[];
}

export function AccountingFilesBarChart({ data }: Props) {
  const hasData = useMemo(() => data.some(d => d.files > 0), [data]);

  if (!hasData) {
    return (
      <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
        Sin archivos contables en el período
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-[280px] w-full">
      <BarChart data={data} accessibilityLayer margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
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
        <Bar dataKey="files" fill="var(--color-files)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
