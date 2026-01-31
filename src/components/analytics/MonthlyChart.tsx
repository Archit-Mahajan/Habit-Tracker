import { useMemo } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Line } from 'recharts';
import { useHabits } from '@/context/HabitContext';
import { format, subMonths, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

interface MonthlyChartProps {
  months?: number;
}

export function MonthlyChart({ months = 6 }: MonthlyChartProps) {
  const { habits } = useHabits();

  const data = useMemo(() => {
    const today = new Date();
    const chartData: { month: string; completions: number; rate: number; averageStreak: number }[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const monthDate = subMonths(today, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

      let totalCompletions = 0;
      const dailyRates: number[] = [];

      daysInMonth.forEach(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const dayCompleted = habits.filter(h => h.completedDates.includes(dateStr)).length;
        const dayTotal = habits.length;
        
        totalCompletions += dayCompleted;
        if (dayTotal > 0) {
          dailyRates.push((dayCompleted / dayTotal) * 100);
        }
      });

      const averageRate = dailyRates.length > 0 
        ? Math.round(dailyRates.reduce((a, b) => a + b, 0) / dailyRates.length) 
        : 0;

      const averageStreak = habits.length > 0
        ? Math.round(habits.reduce((sum, h) => sum + h.currentStreak, 0) / habits.length)
        : 0;

      chartData.push({
        month: format(monthDate, 'MMM yyyy'),
        completions: totalCompletions,
        rate: averageRate,
        averageStreak,
      });
    }

    return chartData;
  }, [habits, months]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-sm mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <p className="text-emerald-500">
              Total Completions: {payload[0].value}
            </p>
            <p className="text-blue-500">
              Avg. Rate: {payload[0].payload.rate}%
            </p>
            <p className="text-orange-500">
              Avg. Streak: {payload[0].payload.averageStreak} days
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
        <p>No data available. Start tracking habits to see your monthly progress!</p>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCompletions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis 
            dataKey="month" 
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
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="completions" 
            stroke="hsl(var(--success))" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorCompletions)" 
            animationDuration={1500}
          />
          <Line 
            type="monotone" 
            dataKey="rate" 
            stroke="hsl(var(--info))" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
