'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { Symptom } from '@/lib/schemas/symptom';

interface CategoryBreakdownChartProps {
  symptoms: Symptom[];
}

// Color palette for categories
const COLORS = [
  'hsl(var(--primary))',
  'hsl(142.1 76.2% 36.3%)', // Green
  'hsl(47.9 95.8% 53.1%)', // Yellow
  'hsl(0 84.2% 60.2%)', // Red
  'hsl(221.2 83.2% 53.3%)', // Blue
  'hsl(262.1 83.3% 57.8%)', // Purple
  'hsl(24.6 95% 53.1%)', // Orange
  'hsl(173 80.4% 40%)', // Teal
];

export function CategoryBreakdownChart({ symptoms }: CategoryBreakdownChartProps) {
  const chartData = useMemo(() => {
    if (symptoms.length === 0) return [];

    // Count symptoms by category
    const categoryCounts = new Map<string, number>();
    symptoms.forEach(symptom => {
      const count = categoryCounts.get(symptom.category) || 0;
      categoryCounts.set(symptom.category, count + 1);
    });

    // Convert to chart data format and sort by count
    return Array.from(categoryCounts.entries())
      .map(([category, count]) => ({
        name: category.charAt(0).toUpperCase() + category.slice(1),
        value: count,
        percentage: Math.round((count / symptoms.length) * 100),
      }))
      .sort((a, b) => b.value - a.value);
  }, [symptoms]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
        No category data available
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="bg-background border border-border rounded-md p-2 shadow-lg"
          style={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
          }}
        >
          <p className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>
            {payload[0].name}
          </p>
          <p className="text-sm" style={{ color: 'hsl(var(--foreground))' }}>
            Count: {payload[0].value}
          </p>
          <p className="text-sm" style={{ color: 'hsl(var(--foreground))' }}>
            {payload[0].payload.percentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(entry: any) => `${entry.name} (${entry.percentage}%)`}
            outerRadius={80}
            fill="hsl(var(--primary))"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{
              paddingTop: '20px',
              fontSize: '12px',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
