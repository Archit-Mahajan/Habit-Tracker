import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useHabits } from '@/context/HabitContext';
import { subWeeks, startOfWeek, endOfWeek, eachDayOfInterval, format as formatDate } from 'date-fns';

interface WeeklyChartProps {
  weeks?: number;
}

export function WeeklyChart({ weeks = 8 }: WeeklyChartProps) {
  const { habits } = useHabits();

  const data = useMemo(() => {
    const today = new Date();
    const chartData: { week: string; completed: number; missed: number; rate: number }[] = [];

    for (let i = weeks - 1; i >= 0; i--) {
      const weekStart = startOfWeek(subWeeks(today, i), { weekStartsOn: 0 });
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 });
      const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

      let completed = 0;
      let missed = 0;

      daysInWeek.forEach(day => {
        const dateStr = formatDate(day, 'yyyy-MM-dd');
        const dayCompleted = habits.filter(h => h.completedDates.includes(dateStr)).length;
        const dayTotal = habits.length;
        
        completed += dayCompleted;
        missed += (dayTotal - dayCompleted);
      });

      const total = completed + missed;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

      chartData.push({
        week: formatDate(weekStart, 'MMM d'),
        completed,
        missed,
        rate,
      });
    }

    return chartData;
  }, [habits, weeks]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-sm mb-2">Week of {label}</p>
          <div className="space-y-1 text-sm">
            <p className="text-emerald-500">
              Completed: {payload[0].value}
            </p>
            <p className="text-rose-500">
              Missed: {payload[1].value}
            </p>
            <p className="text-muted-foreground pt-1 border-t">
              Success Rate: {payload[0].payload.rate}%
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (habits.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        <p>No data available. Start tracking habits to see your weekly progress!</p>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis 
            dataKey="week" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }} />
          <Legend 
            wrapperStyle={{ paddingTop: 20 }}
            iconType="circle"
          />
          <Bar 
            dataKey="completed" 
            name="Completed" 
            fill="hsl(var(--success))" 
            radius={[4, 4, 0, 0]}
            animationDuration={1000}
          />
          <Bar 
            dataKey="missed" 
            name="Missed" 
            fill="hsl(var(--destructive))" 
            radius={[4, 4, 0, 0]}
            animationDuration={1000}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
