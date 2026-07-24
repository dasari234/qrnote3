'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface DonutChartProps {
  data: { name: string; count: number }[];
  colors?: string[];
}

const DEFAULT_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--primary))',
];

export function DonutChart({ data, colors = DEFAULT_COLORS }: DonutChartProps) {
  const filtered = data.filter((d) => d.name !== 'Unknown' && d.count > 0);

  if (filtered.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={filtered}
          dataKey="count"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={2}
          // Fix: Ensure the pie segments stroke border blends smoothly into the card surface
          stroke="var(--card)"
          strokeWidth={2}
        >
          {filtered.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} className="focus:outline-none" />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--popover))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 'var(--radius, 8px)',
            fontSize: '12px',
          }}
          labelStyle={{ color: 'hsl(var(--popover-foreground))', fontWeight: 600 }}
          itemStyle={{ color: 'hsl(var(--foreground))' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
