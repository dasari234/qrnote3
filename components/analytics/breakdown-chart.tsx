'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface BreakdownChartProps {
  data: { name: string; count: number }[];
  title: string;
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

export function BreakdownChart({ data, title, colors = DEFAULT_COLORS }: BreakdownChartProps) {
  if (data.length === 0 || (data.length === 1 && data[0].name === 'Unknown')) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart
        data={data.slice(0, 8)}
        layout="vertical"
        margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
      >
        {/* Replace className with direct color variable evaluation for cross-theme stroke lines */}
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          tickLine={false}
          axisLine={false}
          width={70}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--popover))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 'var(--radius, 8px)',
            fontSize: '12px',
          }}
          labelStyle={{ color: 'hsl(var(--popover-foreground))', fontWeight: 600 }}
          itemStyle={{ color: 'hsl(var(--foreground))' }}
          cursor={false}
        />
        <Bar dataKey="count" name={title} radius={[0, 4, 4, 0]}>
          {data.slice(0, 8).map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
