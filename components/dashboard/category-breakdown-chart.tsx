'use client';

import { useMemo } from 'react';
import type { Symptom } from '@/lib/schemas/symptom';

interface CategoryBreakdownChartProps {
  symptoms: Symptom[];
}

interface TimeOfDayData {
  label: string;
  timeRange: string;
  count: number;
  percentage: number;
}

// Time of day periods
const TIME_PERIODS = [
  { label: 'Morning', timeRange: '6am-12pm', start: 6, end: 12 },
  { label: 'Afternoon', timeRange: '12pm-6pm', start: 12, end: 18 },
  { label: 'Evening', timeRange: '6pm-12am', start: 18, end: 24 },
  { label: 'Night', timeRange: '12am-6am', start: 0, end: 6 },
];

export function CategoryBreakdownChart({ symptoms }: CategoryBreakdownChartProps) {
  const timeOfDayData = useMemo(() => {
    if (symptoms.length === 0) return [];

    // Count symptoms by time of day
    const timeCounts = new Map<string, number>();
    TIME_PERIODS.forEach(period => {
      timeCounts.set(period.label, 0);
    });

    symptoms.forEach(symptom => {
      const date = new Date(symptom.loggedAt);
      const hour = date.getHours();

      const period = TIME_PERIODS.find(
        p => hour >= p.start && hour < p.end
      );

      if (period) {
        timeCounts.set(period.label, (timeCounts.get(period.label) || 0) + 1);
      }
    });

    // Convert to chart data format
    return TIME_PERIODS.map(period => ({
      label: period.label,
      timeRange: period.timeRange,
      count: timeCounts.get(period.label) || 0,
      percentage: Math.round(((timeCounts.get(period.label) || 0) / symptoms.length) * 100),
    }));
  }, [symptoms]);

  if (symptoms.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
        No time of day data available
      </div>
    );
  }

  const maxCount = Math.max(...timeOfDayData.map(d => d.count));

  return (
    <div className="w-full space-y-4 py-4">
      {timeOfDayData.map((period) => {
        const barWidth = maxCount > 0 ? (period.count / maxCount) * 100 : 0;

        return (
          <div key={period.label} className="space-y-1">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {period.label} ({period.timeRange}):
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                {period.percentage}%
              </span>
            </div>
            <div className="relative h-8 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 transition-all duration-300 flex items-center px-3"
                style={{ width: `${barWidth}%` }}
              >
                {period.count > 0 && (
                  <span className="text-white text-xs font-medium">
                    {period.count} {period.count === 1 ? 'symptom' : 'symptoms'}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
