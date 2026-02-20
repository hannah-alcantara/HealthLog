"use client";

import { useMemo } from "react";
import { format, eachDayOfInterval, getDay, subMonths } from "date-fns";
import type { Symptom } from "@/lib/schemas/symptom";

interface SymptomHeatmapProps {
  symptoms: Symptom[];
  months?: number;
}

export function SymptomHeatmap({ symptoms, months = 3 }: SymptomHeatmapProps) {
  const heatmapData = useMemo(() => {
    const endDate = new Date();
    let startDate = subMonths(endDate, months);

    // Adjust startDate to be the most recent Sunday to ensure first column has complete squares
    const startDayOfWeek = getDay(startDate);
    if (startDayOfWeek !== 0) {
      // Move back to the previous Sunday
      startDate = new Date(startDate);
      startDate.setDate(startDate.getDate() - startDayOfWeek);
    }

    // Get all days in the range
    const allDays = eachDayOfInterval({ start: startDate, end: endDate });

    // Count symptoms per day
    const symptomCounts = new Map<string, number>();
    symptoms.forEach(symptom => {
      const dateKey = format(new Date(symptom.loggedAt), 'yyyy-MM-dd');
      symptomCounts.set(dateKey, (symptomCounts.get(dateKey) || 0) + 1);
    });

    // Find max count for opacity scaling
    const maxCount = Math.max(...Array.from(symptomCounts.values()), 1);

    // Create calendar grid data
    const weeks: Array<Array<{ date: Date; count: number; opacity: number } | null>> = [];
    let currentWeek: Array<{ date: Date; count: number; opacity: number } | null> = [];

    // Add padding for first week
    const firstDayOfWeek = getDay(allDays[0]);
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push(null);
    }

    allDays.forEach(date => {
      const dateKey = format(date, 'yyyy-MM-dd');
      const count = symptomCounts.get(dateKey) || 0;
      const opacity = count > 0 ? Math.max(0.15, Math.min(1, count / maxCount)) : 0;

      currentWeek.push({ date, count, opacity });

      if (getDay(date) === 6) {
        // End of week (Saturday)
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    });

    // Push remaining days if any
    if (currentWeek.length > 0) {
      // Pad the last week to have 7 days
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push([...currentWeek]);
    }

    return { weeks };
  }, [symptoms, months]);

  const { weeks } = heatmapData;

  const totalWeeks = weeks.length;
  const cellWidth = `calc((100% - 40px - ${(totalWeeks - 1) * 3}px) / ${totalWeeks})`;
  const cellHeight = '14px';

  return (
    <div className="w-full overflow-hidden py-2">
      <div className="flex gap-3">
        {/* Day labels on the left */}
        <div className="flex flex-col flex-shrink-0">
          {/* Empty space for month labels */}
          <div className="h-3 mb-[3px]"></div>

          {/* Day labels aligned with grid rows */}
          {[0, 1, 2, 3, 4, 5, 6].map((dayIdx) => (
            <div key={dayIdx} style={{ height: cellHeight }} className="flex items-center mb-[3px] last:mb-0">
              {dayIdx === 1 && <span className="text-[11px] text-muted-foreground pr-2">Mon</span>}
              {dayIdx === 3 && <span className="text-[11px] text-muted-foreground pr-2">Wed</span>}
              {dayIdx === 5 && <span className="text-[11px] text-muted-foreground pr-2">Fri</span>}
              {dayIdx !== 1 && dayIdx !== 3 && dayIdx !== 5 && <span className="w-[30px]"></span>}
            </div>
          ))}
        </div>

        {/* Weeks grid - continuous without gaps between months */}
        <div className="flex flex-col gap-[3px] flex-1 min-w-0">
          {/* Month labels at the top */}
          <div className="flex gap-[3px] h-3">
            {weeks.map((week, weekIndex) => {
              const firstDay = week.find(d => d !== null);
              // Show month label at the start of each new month
              let showMonth = false;
              if (weekIndex === 0 && firstDay) {
                showMonth = true;
              } else if (firstDay && weekIndex > 0) {
                const prevWeek = weeks[weekIndex - 1];
                const prevDay = prevWeek.find(d => d !== null);
                if (prevDay) {
                  const currentMonth = new Date(firstDay.date).getMonth();
                  const prevMonth = new Date(prevDay.date).getMonth();
                  showMonth = currentMonth !== prevMonth;
                }
              }

              return (
                <div key={`month-${weekIndex}`} style={{ width: cellWidth }} className="text-[11px] text-muted-foreground leading-3">
                  {showMonth && firstDay ? format(firstDay.date, 'MMM') : ''}
                </div>
              );
            })}
          </div>

          {/* Grid of all days - 7 rows (days of week) */}
          {[0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => (
            <div key={`row-${dayOfWeek}`} className="flex gap-[3px]">
              {weeks.map((week, weekIndex) => {
                const day = week[dayOfWeek];

                if (!day) {
                  return <div key={`empty-${weekIndex}-${dayOfWeek}`} style={{ width: cellWidth, height: cellHeight }} />;
                }

                return (
                  <div
                    key={`${weekIndex}-${dayOfWeek}`}
                    className={`rounded-[2px] cursor-pointer group relative${day.count === 0 ? ' bg-muted' : ''}`}
                    style={{
                      width: cellWidth,
                      height: cellHeight,
                      backgroundColor: day.count > 0 ? '#10b981' : undefined,
                      opacity: day.count > 0 ? day.opacity : 1,
                    }}
                    title={`${format(day.date, 'MMM dd, yyyy')}: ${day.count} symptom${day.count !== 1 ? 's' : ''}`}
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover border rounded shadow-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                      <div className="font-medium">{format(day.date, 'MMM dd')}</div>
                      <div className="text-muted-foreground text-[11px]">{day.count} symptom{day.count !== 1 ? 's' : ''}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1.5 mt-2 pr-2">
        <span className="text-[11px] text-muted-foreground">Less</span>
        {[0, 0.3, 0.5, 0.7, 1].map((opacity, idx) => (
          <div
            key={idx}
            className={`w-[11px] h-[11px] rounded-[2px]${opacity === 0 ? ' bg-muted' : ''}`}
            style={{
              backgroundColor: opacity > 0 ? '#10b981' : undefined,
              opacity: opacity > 0 ? opacity : 1,
            }}
          />
        ))}
        <span className="text-[11px] text-muted-foreground ml-0.5">More</span>
      </div>
    </div>
  );
}