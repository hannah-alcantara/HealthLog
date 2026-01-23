"use client";

import { useMemo, useState } from "react";
import type { Symptom } from "@/lib/schemas/symptom";

interface SymptomFrequencyChartProps {
  symptoms: Symptom[];
  days?: number;
}

interface SymptomDayData {
  date: string;
  count: number;
  totalSeverity: number;
  avgSeverity: number;
}

/**
 * Converts a Date object to YYYY-MM-DD string in local timezone.
 * Used to group symptoms by calendar day regardless of exact time.
 *
 * Why we need this: Extracts local date components instead of using toISOString()
 * which would convert to UTC and cause off-by-one day errors in different timezones.
 */
function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parses a YYYY-MM-DD string as a Date object in local timezone.
 * Used for display and comparison of calendar dates.
 *
 * Why we need this: new Date("2026-01-13") interprets the string as UTC midnight,
 * which causes timezone shift bugs. This function creates the date in local timezone.
 */
function fromLocalDateString(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

// Orange to red gradient for severity/frequency
function getOrangeRedColor(count: number, avgSeverity: number): string {
  if (count === 0) return "#f3f4f6"; // gray-200 for no data

  // Combine count and severity for intensity (severity weighted more heavily)
  const intensity = count * 0.3 + avgSeverity * 0.7;

  // Orange to red gradient (5 levels)
  if (intensity <= 2) return "#fed7aa"; // Light orange
  if (intensity <= 4) return "#fdba74"; // Orange
  if (intensity <= 6) return "#fb923c"; // Dark orange
  if (intensity <= 8) return "#f97316"; // Orange-red
  return "#ea580c"; // Deep red
}

export function SymptomFrequencyChart({
  symptoms,
  days = 30,
}: SymptomFrequencyChartProps) {
  // eslint-disable-next-line react-hooks/preserve-manual-memoization -- Complex data transformation with nested loops
  const topSymptoms = useMemo(() => {
    if (symptoms.length === 0) return [];

    const now = new Date();
    now.setHours(23, 59, 59, 999); // End of today to include all symptoms logged today

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1);
    startDate.setHours(0, 0, 0, 0); // Start of day 30 days ago

    // Group symptoms by type and calculate stats
    const symptomStats = new Map<
      string,
      { count: number; totalSeverity: number; symptoms: Symptom[] }
    >();

    symptoms.forEach((symptom) => {
      const loggedDate = new Date(symptom.loggedAt);
      const isInRange = loggedDate >= startDate && loggedDate <= now;

      if (!isInRange) return;

      if (!symptomStats.has(symptom.symptomType)) {
        symptomStats.set(symptom.symptomType, {
          count: 0,
          totalSeverity: 0,
          symptoms: [],
        });
      }

      const stats = symptomStats.get(symptom.symptomType)!;
      stats.count++;
      stats.totalSeverity += symptom.severity;
      stats.symptoms.push(symptom);
    });

    // Calculate average severity and sort by it (worst symptoms first)
    const rankedSymptoms = Array.from(symptomStats.entries())
      .map(([type, stats]) => ({
        symptomType: type,
        avgSeverity: stats.totalSeverity / stats.count,
        totalCount: stats.count,
        symptoms: stats.symptoms,
      }))
      .sort((a, b) => b.avgSeverity - a.avgSeverity)
      .slice(0, 3); // Top 3 worst symptoms

    // Create heatmap grid for each symptom
    return rankedSymptoms.map((symptomData) => {
      // Group by date
      const dateMap = new Map<string, SymptomDayData>();

      symptomData.symptoms.forEach((symptom) => {
        // Use local date string to avoid timezone issues
        const loggedDate = new Date(symptom.loggedAt);
        const dateKey = toLocalDateString(loggedDate);

        if (!dateMap.has(dateKey)) {
          dateMap.set(dateKey, {
            date: dateKey,
            count: 0,
            totalSeverity: 0,
            avgSeverity: 0,
          });
        }

        const dayData = dateMap.get(dateKey)!;
        dayData.count++;
        dayData.totalSeverity += symptom.severity;
      });

      // Calculate average severity for each day
      dateMap.forEach((dayData) => {
        dayData.avgSeverity = dayData.totalSeverity / dayData.count;
      });

      // Create grid (weeks × 7 days)
      const grid: SymptomDayData[][] = [];
      let currentWeek: SymptomDayData[] = [];

      // Find Monday before start date
      const firstMonday = new Date(startDate);
      const dayOfWeek = firstMonday.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      firstMonday.setDate(firstMonday.getDate() - daysToMonday);

      const endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);

      // eslint-disable-next-line prefer-const -- currentDate is mutated by setDate() in the loop
      let currentDate = new Date(firstMonday);
      while (currentDate <= endDate) {
        // Use local date string to avoid timezone issues
        const dateKey = toLocalDateString(currentDate);
        const dayData = dateMap.get(dateKey) || {
          date: dateKey,
          count: 0,
          totalSeverity: 0,
          avgSeverity: 0,
        };

        currentWeek.push(dayData);

        if (currentWeek.length === 7) {
          grid.push(currentWeek);
          currentWeek = [];
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Add remaining days
      if (currentWeek.length > 0) {
        while (currentWeek.length < 7) {
          // Use local date string to avoid timezone issues
          const dateKey = toLocalDateString(currentDate);
          currentWeek.push({
            date: dateKey,
            count: 0,
            totalSeverity: 0,
            avgSeverity: 0,
          });
          currentDate.setDate(currentDate.getDate() + 1);
        }
        grid.push(currentWeek);
      }

      return {
        symptomType: symptomData.symptomType,
        avgSeverity: symptomData.avgSeverity,
        totalCount: symptomData.totalCount,
        grid,
      };
    });
  }, [symptoms, days]);

  const [hoveredCell, setHoveredCell] = useState<{
    symptom: string;
    day: SymptomDayData;
  } | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  if (symptoms.length === 0) {
    return (
      <div className='flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400'>
        No symptom data available
      </div>
    );
  }

  if (topSymptoms.length === 0) {
    return (
      <div className='flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400'>
        No symptom data in the last {days} days
      </div>
    );
  }

  const weekLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className='w-full space-y-4'>
      <div className='text-sm text-gray-600 dark:text-gray-400'>
        Top 3 symptoms by average severity (last 30 days)
      </div>

      {/* Heatmaps in a row */}
      <div className='flex gap-6'>
        {/* Individual heatmaps for each symptom */}
        {topSymptoms.map((symptomData, index) => (
          <div key={symptomData.symptomType} className='flex-1 space-y-2'>
            {/* Symptom header */}
            <div className='space-y-1'>
              <h4 className='font-semibold text-gray-900 dark:text-gray-100 text-sm'>
                {index + 1}. {symptomData.symptomType}
              </h4>
              <div className='text-xs text-gray-600 dark:text-gray-400'>
                <span className='font-semibold text-orange-600 dark:text-orange-400'>
                  {symptomData.avgSeverity.toFixed(1)}/10
                </span>
                <span className='mx-1'>•</span>
                <span>{symptomData.totalCount}×</span>
              </div>
            </div>

            {/* Heatmap with day labels */}
            <div className='flex gap-1'>
              {/* Day labels - only show for first symptom */}
              {index === 0 && (
                <div className='flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-400 pr-1'>
                  {weekLabels.map((day, i) => (
                    <div
                      key={day}
                      className={`h-4 flex items-center ${i % 2 === 0 ? "opacity-100" : "opacity-0"}`}
                    >
                      {i % 2 === 0 ? day : ""}
                    </div>
                  ))}
                </div>
              )}

              {/* Heatmap cells */}
              <div className='flex gap-1 flex-1'>
                {symptomData.grid.map((week, weekIndex) => (
                  <div key={weekIndex} className='flex flex-col gap-1 flex-1'>
                    {week.map((day) => {
                      const date = fromLocalDateString(day.date);
                      const isToday =
                        date.toDateString() === new Date().toDateString();
                      const bgColor = getOrangeRedColor(
                        day.count,
                        day.avgSeverity,
                      );

                      return (
                        <div
                          key={day.date}
                          className={`h-4 rounded-xs cursor-pointer transition-all hover:ring-2 hover:ring-orange-500 hover:scale-110 ${
                            isToday
                              ? "ring-1 ring-blue-500 dark:ring-blue-400"
                              : ""
                          }`}
                          style={{ backgroundColor: bgColor }}
                          onMouseEnter={(e) => {
                            setHoveredCell({
                              symptom: symptomData.symptomType,
                              day,
                            });
                            setMousePosition({ x: e.clientX, y: e.clientY });
                          }}
                          onMouseMove={(e) => {
                            setMousePosition({ x: e.clientX, y: e.clientY });
                          }}
                          onMouseLeave={() => setHoveredCell(null)}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {hoveredCell && hoveredCell.day.count > 0 && (
        <div
          className='fixed z-50 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl pointer-events-none'
          style={{
            left: `${mousePosition.x + 12}px`,
            top: `${mousePosition.y + 12}px`,
          }}
        >
          <p className='font-semibold text-gray-900 dark:text-gray-100 mb-1'>
            {hoveredCell.symptom}
          </p>
          <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>
            {fromLocalDateString(hoveredCell.day.date).toLocaleDateString(
              "en-US",
              {
                weekday: "long",
                month: "short",
                day: "numeric",
                year: "numeric",
              },
            )}
          </p>
          <div className='space-y-1'>
            <div className='text-sm flex items-center justify-between gap-3'>
              <span className='text-gray-700 dark:text-gray-300'>
                Occurrences:
              </span>
              <span className='font-semibold text-gray-900 dark:text-gray-100'>
                {hoveredCell.day.count}×
              </span>
            </div>
            <div className='text-sm flex items-center justify-between gap-3'>
              <span className='text-gray-700 dark:text-gray-300'>
                Avg Severity:
              </span>
              <span className='font-semibold text-orange-600 dark:text-orange-400'>
                {hoveredCell.day.avgSeverity.toFixed(1)}/10
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className='mt-4 pt-4 border-t border-gray-200 dark:border-gray-700'>
        <div className='flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400'>
          <span className='font-medium'>Intensity:</span>
          <div className='flex gap-1 items-center'>
            {[
              { label: "None", color: "#f3f4f6" },
              { label: "Low", color: "#fed7aa" },
              { label: "Med", color: "#fb923c" },
              { label: "High", color: "#f97316" },
              { label: "Severe", color: "#ea580c" },
            ].map((item) => (
              <div
                key={item.label}
                className='flex flex-col items-center gap-1'
              >
                <div
                  className='w-5 h-5 rounded'
                  style={{ backgroundColor: item.color }}
                />
                <span className='text-xs'>{item.label}</span>
              </div>
            ))}
          </div>
          <span className='ml-2 text-xs italic'>
            (Based on frequency + severity)
          </span>
        </div>
      </div>
    </div>
  );
}
