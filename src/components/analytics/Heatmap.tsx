import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, subDays, startOfWeek } from 'date-fns';
import { useHabits } from '@/context/HabitContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface HeatmapProps {
  days?: number;
}

export function Heatmap({ days = 365 }: HeatmapProps) {
  const { habits } = useHabits();

  const heatmapData = useMemo(() => {
    const today = new Date();
    const data: { date: Date; count: number; total: number; percentage: number }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      const completedCount = habits.filter(h => h.completedDates.includes(dateStr)).length;
      const totalHabits = habits.length;
      
      data.push({
        date,
        count: completedCount,
        total: totalHabits,
        percentage: totalHabits > 0 ? (completedCount / totalHabits) * 100 : 0,
      });
    }

    return data;
  }, [habits, days]);

  const weeks = useMemo(() => {
    const weeks: typeof heatmapData[] = [];
    let currentWeek: typeof heatmapData = [];
    
    const firstDate = heatmapData[0]?.date;
    if (!firstDate) return [];
    
    const startOfFirstWeek = startOfWeek(firstDate, { weekStartsOn: 0 });
    const daysToFirstWeek = Math.floor((firstDate.getTime() - startOfFirstWeek.getTime()) / (1000 * 60 * 60 * 24));
    
    // Fill empty cells for the first week
    for (let i = 0; i < daysToFirstWeek; i++) {
      currentWeek.push(null as any);
    }
    
    heatmapData.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });
    
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null as any);
      }
      weeks.push(currentWeek);
    }
    
    return weeks;
  }, [heatmapData]);

  const getColorIntensity = (percentage: number) => {
    if (percentage === 0) return 'bg-[hsl(var(--heatmap-0))]';
    if (percentage <= 25) return 'bg-[hsl(var(--heatmap-1))]';
    if (percentage <= 50) return 'bg-[hsl(var(--heatmap-2))]';
    if (percentage <= 75) return 'bg-[hsl(var(--heatmap-3))]';
    return 'bg-[hsl(var(--heatmap-4))]';
  };

  const monthLabels = useMemo(() => {
    const labels: { month: string; weekIndex: number }[] = [];
    let lastMonth = '';
    
    weeks.forEach((week, weekIndex) => {
      const firstValidDay = week.find(d => d !== null);
      if (firstValidDay) {
        const month = format(firstValidDay.date, 'MMM');
        if (month !== lastMonth) {
          labels.push({ month, weekIndex });
          lastMonth = month;
        }
      }
    });
    
    return labels;
  }, [weeks]);

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (habits.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>No habits yet. Create your first habit to see your progress!</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-3">
        {/* Month Labels */}
        <div className="flex text-xs text-muted-foreground ml-8">
          {monthLabels.map(({ month, weekIndex }) => (
            <div 
              key={`${month}-${weekIndex}`} 
              style={{ marginLeft: weekIndex === 0 ? 0 : `${(weekIndex - (monthLabels[monthLabels.findIndex(m => m.month === month) - 1]?.weekIndex || 0)) * 14 - 20}px` }}
              className="w-8"
            >
              {month}
            </div>
          ))}
        </div>

        <div className="flex">
          {/* Day Labels */}
          <div className="flex flex-col justify-around mr-2 text-[10px] text-muted-foreground">
            {dayLabels.filter((_, i) => i % 2 === 0).map((day) => (
              <div key={day} className="h-3 flex items-center">
                {day}
              </div>
            ))}
          </div>

          {/* Heatmap Grid */}
          <div className="flex gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => (
                  <div key={dayIndex} className="w-3 h-3">
                    {day ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: weekIndex * 0.01 + dayIndex * 0.001 }}
                            className={`w-full h-full rounded-sm heatmap-cell ${getColorIntensity(day.percentage)}`}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          <div className="space-y-1">
                            <p className="font-medium">{format(day.date, 'MMM d, yyyy')}</p>
                            <p>{day.count} of {day.total} habits completed</p>
                            <p>{Math.round(day.percentage)}% completion rate</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <div className="w-full h-full" />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-[hsl(var(--heatmap-0))]" />
            <div className="w-3 h-3 rounded-sm bg-[hsl(var(--heatmap-1))]" />
            <div className="w-3 h-3 rounded-sm bg-[hsl(var(--heatmap-2))]" />
            <div className="w-3 h-3 rounded-sm bg-[hsl(var(--heatmap-3))]" />
            <div className="w-3 h-3 rounded-sm bg-[hsl(var(--heatmap-4))]" />
          </div>
          <span>More</span>
        </div>
      </div>
    </TooltipProvider>
  );
}
