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
  logins: { label: 'Accesos exitosos', color: '#E8A020' },
} satisfies ChartConfig;

interface Props {
  data: { email: string; logins: number }[];
}

export function TopUsersBarChart({ data }: Props) {
  const trimmed = useMemo(
    () =>
      data.map(d => ({
        ...d,
        email: d.email.length > 20 ? `${d.email.slice(0, 20)}…` : d.email,
      })),
    [data],
  );

  if (!data.length) {
    return (
      <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
        Sin accesos registrados en el período
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-[280px] w-full">
      <BarChart data={trimmed} layout="vertical" accessibilityLayer margin={{ top: 0, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        <XAxis type="number" tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 11 }} allowDecimals={false} />
        <YAxis
          dataKey="email"
          type="category"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fontSize: 11 }}
          width={120}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="logins" fill="var(--color-logins)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
