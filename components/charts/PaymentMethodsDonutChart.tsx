'use client';

import { Pie, PieChart, Cell } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';

const PALETTE = ['#E8A020', '#0CE4AC', '#243B50', '#F5C96D', '#6B7E8E', '#172C3B'];

interface DataItem {
  name: string;
  value: number;
}

interface Props {
  data: DataItem[];
}

export function PaymentMethodsDonutChart({ data }: Props) {
  if (!data.length) {
    return (
      <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
        Sin datos para el período seleccionado
      </div>
    );
  }

  const chartConfig = data.reduce<ChartConfig>((acc, item, i) => {
    acc[item.name] = { label: item.name, color: PALETTE[i % PALETTE.length] };
    return acc;
  }, {});

  const chartData = data.map((item, i) => ({
    ...item,
    fill: PALETTE[i % PALETTE.length],
  }));

  return (
    <ChartContainer config={chartConfig} className="h-[280px] w-full">
      <PieChart accessibilityLayer>
        <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
        <ChartLegend content={<ChartLegendContent nameKey="name" />} />
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={90}
          strokeWidth={2}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}
