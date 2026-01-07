'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { Symptom } from '@/lib/schemas/symptom';

interface SymptomFrequencyChartProps {
  symptoms: Symptom[];
  days?: number;
}

interface BarLabelProps {
  x?: number;
  y?: number;
  width?: number;
  value?: number;
  index?: number;
}

export function SymptomFrequencyChart({ symptoms }: SymptomFrequencyChartProps) {
  const chartData = useMemo(() => {
    if (symptoms.length === 0) return [];

    // Count occurrences of each symptom type
    const symptomCounts = new Map<string, number>();
    symptoms.forEach(symptom => {
      const count = symptomCounts.get(symptom.symptomType) || 0;
      symptomCounts.set(symptom.symptomType, count + 1);
    });

    // Convert to chart data format and sort by count (descending)
    return Array.from(symptomCounts.entries())
      .map(([symptomType, count]) => ({
        symptom: symptomType,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Show top 10 symptoms
  }, [symptoms]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
        No symptom data available
      </div>
    );
  }

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }} layout="vertical">
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="symptom" hide />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
            cursor={{ fill: 'hsl(var(--muted))' }}
          />
          <Bar
            dataKey="count"
            fill="hsl(var(--primary))"
            radius={[0, 4, 4, 0]}
            name="Occurrences"
            label={(props: BarLabelProps) => {
              const { x = 0, y = 0, width = 0, value = 0, index = 0 } = props;
              const symptom = chartData[index]?.symptom || '';
              return (
                <text
                  x={x + 10}
                  y={y + (width / 2)}
                  fill="white"
                  fontSize={12}
                  textAnchor="start"
                  dominantBaseline="middle"
                >
                  {`${symptom} (${value})`}
                </text>
              );
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
