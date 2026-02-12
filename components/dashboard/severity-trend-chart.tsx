"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { subDays, eachWeekOfInterval, endOfWeek } from "date-fns";
import type { Symptom } from "@/lib/schemas/symptom";

interface SeverityTrendChartProps {
  symptoms: Symptom[];
  days?: number;
}

// Three distinct colors for the top 3 symptoms
const SYMPTOM_COLORS = [
  "#a855f7", // Purple
  "#3b82f6", // Blue
  "#10b981", // Green
  // "#f59e0b", //Amber
];

export function SeverityTrendChart({
  symptoms,
  days = 30,
}: SeverityTrendChartProps) {
  const chartData = useMemo(() => {
    const endDate = new Date();
    const startDate = subDays(endDate, days - 1);

    // Find top 3 symptoms by frequency (with severity as tiebreaker) in this period
    const symptomStats = new Map<
      string,
      { count: number; maxSeverity: number }
    >();
    symptoms.forEach((symptom) => {
      const symptomDate = new Date(symptom.loggedAt);
      if (symptomDate >= startDate && symptomDate <= endDate) {
        const current = symptomStats.get(symptom.symptomType);
        if (current) {
          symptomStats.set(symptom.symptomType, {
            count: current.count + 1,
            maxSeverity: Math.max(current.maxSeverity, symptom.severity),
          });
        } else {
          symptomStats.set(symptom.symptomType, {
            count: 1,
            maxSeverity: symptom.severity,
          });
        }
      }
    });

    const topSymptoms = Array.from(symptomStats.entries())
      .sort((a, b) => {
        // First sort by frequency (count)
        if (b[1].count !== a[1].count) {
          return b[1].count - a[1].count;
        }
        // If frequency is tied, sort by max severity
        return b[1].maxSeverity - a[1].maxSeverity;
      })
      .slice(0, 3)
      .map(([type]) => type);

    // Assign colors by position (1st = blue, 2nd = purple, 3rd = amber)
    const symptomColorMap = new Map<string, string>();
    topSymptoms.forEach((symptom, index) => {
      symptomColorMap.set(symptom, SYMPTOM_COLORS[index]);
    });

    // Create array of weeks in range
    const weeks = eachWeekOfInterval(
      { start: startDate, end: endDate },
      { weekStartsOn: 0 },
    );

    // Calculate weekly severity stats for each symptom
    const weeklyData = weeks.map((weekStart, index) => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 });
      const dataPoint: Record<string, string | number | null> = {
        date: `Week ${index + 1}`,
      };

      // Calculate average severity for each top symptom in this week
      topSymptoms.forEach((symptomType) => {
        const symptomsInWeek = symptoms.filter((s) => {
          const sDate = new Date(s.loggedAt);
          return (
            sDate >= weekStart &&
            sDate <= weekEnd &&
            s.symptomType === symptomType
          );
        });

        if (symptomsInWeek.length > 0) {
          const avgSeverity =
            symptomsInWeek.reduce((sum, s) => sum + s.severity, 0) /
            symptomsInWeek.length;
          dataPoint[symptomType] = Math.round(avgSeverity * 10) / 10;
        } else {
          dataPoint[symptomType] = 0; // Use 0 for area charts to maintain continuity
        }
      });

      return dataPoint;
    });

    return { data: weeklyData, topSymptoms, symptomColorMap };
  }, [symptoms, days]);

  const { data, topSymptoms, symptomColorMap } = chartData;

  if (data.length === 0 || topSymptoms.length === 0) {
    return (
      <div className='flex items-center justify-center h-[300px] text-muted-foreground'>
        No severity data available for the past month
      </div>
    );
  }

  return (
    <div className='w-full h-[300px]'>
      <ResponsiveContainer width='100%' height='100%'>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            {topSymptoms.map((symptomType) => {
              // Create a safe ID by removing spaces and special characters
              const safeId = `gradient-${symptomType.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "")}`;
              const color = symptomColorMap.get(symptomType);
              return (
                <linearGradient
                  key={safeId}
                  id={safeId}
                  x1='0'
                  y1='0'
                  x2='0'
                  y2='1'
                >
                  <stop offset='5%' stopColor={color} stopOpacity={0.3} />
                  <stop offset='95%' stopColor={color} stopOpacity={0.05} />
                </linearGradient>
              );
            })}
          </defs>
          <CartesianGrid
            strokeDasharray='0'
            horizontal={true}
            vertical={true}
            stroke='#94a3b8'
            strokeOpacity={0.15}
          />
          <XAxis
            dataKey='date'
            className='text-xs'
            tick={{
              fontSize: 12,
              fill: "hsl(var(--muted-foreground))",
              opacity: 0.5,
            }}
            tickLine={false}
            axisLine={false}
            tickMargin={10}
          />
          <YAxis
            className='text-xs'
            tick={{
              fontSize: 12,
              fill: "hsl(var(--muted-foreground))",
              opacity: 0.5,
            }}
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            domain={[0, 10]}
            ticks={[0, 2, 4, 6, 8, 10]}
            label={{
              value: "Pain Severity",
              angle: -90,
              position: "insideLeft",
              offset: 10,
              style: {
                fontSize: 12,
                fill: "hsl(var(--muted-foreground))",
                opacity: 0.5,
                textAnchor: "middle",
              },
            }}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload || payload.length === 0) return null;

              return (
                <div className='rounded-lg border bg-background p-3 shadow-md'>
                  <p className='text-sm font-medium mb-2'>{label}</p>
                  <div className='space-y-1'>
                    {payload.map((entry, index) => {
                      if (!entry.value || entry.value === 0) return null;
                      return (
                        <div
                          key={index}
                          className='flex items-center gap-2 text-sm'
                        >
                          <div
                            className='h-2.5 w-2.5 rounded-full'
                            style={{ backgroundColor: entry.color }}
                          />
                          <span className='text-muted-foreground'>
                            {entry.name}:
                          </span>
                          <span className='font-medium'>{entry.value}/10</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }}
          />
          <Legend
            wrapperStyle={{
              paddingTop: "10px",
              fontSize: "12px",
              opacity: 0.8,
            }}
            iconType='circle'
          />
          {topSymptoms.map((symptomType) => {
            // Create the same safe ID used in gradient definition
            const safeId = `gradient-${symptomType.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "")}`;
            const color = symptomColorMap.get(symptomType);
            return (
              <Area
                key={symptomType}
                type='monotone'
                dataKey={symptomType}
                stroke={color}
                fill={`url(#${safeId})`}
                fillOpacity={1}
                strokeWidth={2}
                name={symptomType}
                dot={(props) => {
                  if (props.payload[symptomType] === 0) return null;
                  return (
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={5}
                      fill={color}
                      strokeWidth={2}
                      stroke='hsl(var(--background))'
                    />
                  );
                }}
                activeDot={(props) => {
                  if (props.payload[symptomType] === 0) return null;
                  return (
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={7}
                      fill={color}
                      strokeWidth={2}
                      stroke='hsl(var(--background))'
                    />
                  );
                }}
                isAnimationActive={true}
              />
            );
          })}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
