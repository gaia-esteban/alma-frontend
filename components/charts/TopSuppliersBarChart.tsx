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
  revenue: { label: 'Ingresos', color: '#E8A020' },
  orders: { label: 'Facturas', color: '#243B50' },
} satisfies ChartConfig;

interface SupplierStat {
  supplier: string;
  revenue: number;
  orders: number;
}

interface Props {
  data: SupplierStat[];
}

export function TopSuppliersBarChart({ data }: Props) {
  const trimmed = useMemo(
    () => data.map(d => ({ ...d, supplier: d.supplier.length > 14 ? `${d.supplier.slice(0, 14)}…` : d.supplier })),
    [data],
  );

  if (!data.length) {
    return (
      <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
        Sin datos para el período seleccionado
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-[280px] w-full">
      <BarChart data={trimmed} layout="vertical" accessibilityLayer margin={{ top: 0, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        <XAxis
          type="number"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fontSize: 11 }}
          tickFormatter={v => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
        />
        <YAxis
          dataKey="supplier"
          type="category"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fontSize: 11 }}
          width={100}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name) =>
                name === 'Ingresos'
                  ? `$${Number(value).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
                  : String(value)
              }
            />
          }
        />
        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[0, 4, 4, 0]} />
        <Bar dataKey="orders" fill="var(--color-orders)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
