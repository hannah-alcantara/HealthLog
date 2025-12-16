'use client';

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import type { Symptom } from '@/lib/schemas/symptom';

interface SeverityTrendChartProps {
  symptoms: Symptom[];
  days?: number;
}

export function SeverityTrendChart({ symptoms, days = 30 }: SeverityTrendChartProps) {
  const chartData = useMemo(() => {
    const endDate = new Date();
    const startDate = subDays(endDate, days);

    // Create array of all dates in range
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

    // Calculate daily severity stats
    const dailyStats = new Map<string, { sum: number; count: number; max: number }>();
    dateRange.forEach(date => {
      const dateKey = format(date, 'yyyy-MM-dd');
      dailyStats.set(dateKey, { sum: 0, count: 0, max: 0 });
    });

    // Populate with actual symptom data
    symptoms.forEach(symptom => {
      const symptomDate = new Date(symptom.loggedAt);
      if (symptomDate >= startDate && symptomDate <= endDate) {
        const dateKey = format(symptomDate, 'yyyy-MM-dd');
        const stats = dailyStats.get(dateKey);
        if (stats) {
          stats.sum += symptom.severity;
          stats.count += 1;
          stats.max = Math.max(stats.max, symptom.severity);
        }
      }
    });

    // Convert to chart data format with averages
    return Array.from(dailyStats.entries()).map(([date, stats]) => ({
      date: format(new Date(date), 'MMM dd'),
      average: stats.count > 0 ? Math.round((stats.sum / stats.count) * 10) / 10 : null,
      max: stats.count > 0 ? stats.max : null,
    }));
  }, [symptoms, days]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
        No severity data available
      </div>
    );
  }

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis
            dataKey="date"
            className="text-xs fill-gray-600 dark:fill-gray-400"
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis
            className="text-xs fill-gray-600 dark:fill-gray-400"
            tick={{ fontSize: 12 }}
            domain={[0, 10]}
            ticks={[0, 2, 4, 6, 8, 10]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Legend
            wrapperStyle={{
              paddingTop: '10px',
              fontSize: '12px',
            }}
          />
          <Line
            type="monotone"
            dataKey="average"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ r: 3 }}
            name="Average Severity"
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="max"
            stroke="hsl(142.1 76.2% 36.3%)"
            strokeWidth={2}
            dot={{ r: 3 }}
            strokeDasharray="5 5"
            name="Max Severity"
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
