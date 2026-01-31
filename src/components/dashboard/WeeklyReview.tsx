import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useHabits } from '@/context/HabitContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  AlertCircle, 
  Lightbulb,
  Target,
  Calendar,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { format, startOfWeek, eachDayOfInterval } from 'date-fns';

const motivationTips = [
  "Small steps every day lead to big changes over time.",
  "Consistency is more important than intensity.",
  "Don't break the chain - keep your streak alive!",
  "Every completion is a vote for the person you want to become.",
  "Progress, not perfection. Keep going!",
  "Your future self will thank you for the habits you build today.",
  "It's not about being the best, it's about being better than yesterday.",
  "Habits are the compound interest of self-improvement.",
];

export function WeeklyReview() {
  const { habits } = useHabits();

  const weekStats = useMemo(() => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 0 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: today });
    
    let totalCompleted = 0;
    let totalPossible = 0;
    const habitStats: { habit: typeof habits[0]; completed: number; missed: number }[] = [];
    
    habits.forEach(habit => {
      let completed = 0;
      let missed = 0;
      
      weekDays.forEach(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        if (habit.completedDates.includes(dateStr)) {
          completed++;
          totalCompleted++;
        } else {
          missed++;
        }
        totalPossible++;
      });
      
      habitStats.push({ habit, completed, missed });
    });
    
    // Find best and worst habits
    const sortedHabits = [...habitStats].sort((a, b) => b.completed - a.completed);
    const bestHabit = sortedHabits[0];
    const worstHabits = sortedHabits.filter(h => h.completed === 0 && h.missed > 0);
    
    return {
      totalCompleted,
      totalPossible,
      completionRate: totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0,
      bestHabit,
      worstHabits,
      daysActive: weekDays.filter(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        return habits.some(h => h.completedDates.includes(dateStr));
      }).length,
    };
  }, [habits]);

  const randomTip = motivationTips[Math.floor(Math.random() * motivationTips.length)];

  if (habits.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No habits to review</h3>
        <p className="text-muted-foreground">Create your first habit to start tracking your weekly progress!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Weekly Review</h2>
          <p className="text-muted-foreground">
            Week of {format(startOfWeek(new Date(), { weekStartsOn: 0 }), 'MMM d, yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Completion Rate:</span>
          <span className={`text-2xl font-bold ${
            weekStats.completionRate >= 80 ? 'text-emerald-500' :
            weekStats.completionRate >= 60 ? 'text-amber-500' :
            'text-rose-500'
          }`}>
            {weekStats.completionRate}%
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{weekStats.totalCompleted}</div>
              <p className="text-sm text-muted-foreground mt-1">
                habits this week
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-500" />
                Missed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {weekStats.totalPossible - weekStats.totalCompleted}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                opportunities missed
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                Days Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{weekStats.daysActive}</div>
              <p className="text-sm text-muted-foreground mt-1">
                out of 7 days
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Best Performing Habit */}
      {weekStats.bestHabit && weekStats.bestHabit.completed > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-emerald-500/50 bg-emerald-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-emerald-500" />
                Best Performing Habit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${weekStats.bestHabit.habit.color}20` }}
                  >
                    <Target className="w-6 h-6" style={{ color: weekStats.bestHabit.habit.color }} />
                  </div>
                  <div>
                    <h4 className="font-semibold">{weekStats.bestHabit.habit.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Completed {weekStats.bestHabit.completed} times this week
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-emerald-500">
                    {Math.round((weekStats.bestHabit.completed / (weekStats.bestHabit.completed + weekStats.bestHabit.missed)) * 100)}%
                  </div>
                  <p className="text-sm text-muted-foreground">success rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Missed Habits */}
      {weekStats.worstHabits.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                Habits Needing Attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {weekStats.worstHabits.slice(0, 3).map(({ habit }) => (
                  <div key={habit.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${habit.color}20` }}
                      >
                        <Target className="w-5 h-5" style={{ color: habit.color }} />
                      </div>
                      <div>
                        <p className="font-medium">{habit.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Current streak: {habit.currentStreak} days
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Start Now
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Motivation Tip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-amber-500 mt-0.5" />
              <div>
                <h4 className="font-medium mb-1">Motivation Tip</h4>
                <p className="text-sm text-muted-foreground">{randomTip}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
