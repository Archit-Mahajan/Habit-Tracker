import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useHabits } from '@/context/HabitContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  TrendingUp, 
  Target,
  Calendar,
  Award,
  Zap,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns';
import { MonthlyChart } from '@/components/analytics/MonthlyChart';

export function MonthlyReview() {
  const { habits, totalXP, userLevel } = useHabits();

  const monthlyStats = useMemo(() => {
    const today = new Date();
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
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

    // Find best habit this month
    const habitCompletions = habits.map(habit => {
      const monthCompletions = habit.completedDates.filter(date => {
        const d = new Date(date);
        return isSameMonth(d, today);
      }).length;
      return { habit, completions: monthCompletions };
    }).sort((a, b) => b.completions - a.completions);

    const bestHabit = habitCompletions[0];

    // Calculate level progression
    const previousMonthXP = totalXP - (habits.reduce((sum, h) => {
      const monthCompletions = h.completedDates.filter(date => {
        const d = new Date(date);
        return isSameMonth(d, today);
      }).length;
      return sum + monthCompletions * (h.difficulty === 'Easy' ? 10 : h.difficulty === 'Medium' ? 20 : 30);
    }, 0));

    const xpGainedThisMonth = totalXP - previousMonthXP;

    // Compare to last month
    const lastMonth = subMonths(today, 1);
    const lastMonthCompletions = habits.reduce((sum, h) => {
      return sum + h.completedDates.filter(date => {
        const d = new Date(date);
        return isSameMonth(d, lastMonth);
      }).length;
    }, 0);

    const thisMonthCompletions = totalCompletions;
    const monthOverMonthChange = lastMonthCompletions > 0 
      ? ((thisMonthCompletions - lastMonthCompletions) / lastMonthCompletions) * 100 
      : 0;

    return {
      totalCompletions,
      averageRate,
      bestHabit,
      xpGainedThisMonth,
      monthOverMonthChange,
      daysTracked: dailyRates.length,
      totalDays: daysInMonth.length,
    };
  }, [habits, totalXP]);

  if (habits.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No data yet</h3>
        <p className="text-muted-foreground">Start tracking habits to see your monthly review!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Monthly Review</h2>
          <p className="text-muted-foreground">
            {format(new Date(), 'MMMM yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Success Rate:</span>
          <span className={`text-2xl font-bold ${
            monthlyStats.averageRate >= 80 ? 'text-emerald-500' :
            monthlyStats.averageRate >= 60 ? 'text-amber-500' :
            'text-rose-500'
          }`}>
            {monthlyStats.averageRate}%
          </span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-500" />
                Total Completions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{monthlyStats.totalCompletions}</div>
              <div className="flex items-center gap-1 mt-1">
                {monthlyStats.monthOverMonthChange > 0 ? (
                  <>
                    <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-emerald-500">
                      +{monthlyStats.monthOverMonthChange.toFixed(1)}%
                    </span>
                  </>
                ) : monthlyStats.monthOverMonthChange < 0 ? (
                  <>
                    <ArrowDownRight className="w-4 h-4 text-rose-500" />
                    <span className="text-sm text-rose-500">
                      {monthlyStats.monthOverMonthChange.toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <Minus className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">No change</span>
                  </>
                )}
                <span className="text-sm text-muted-foreground">vs last month</span>
              </div>
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
                <Zap className="w-4 h-4 text-amber-500" />
                XP Gained
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-500">+{monthlyStats.xpGainedThisMonth}</div>
              <p className="text-sm text-muted-foreground mt-1">
                this month
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
                <Award className="w-4 h-4 text-purple-500" />
                Current Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{userLevel}</div>
              <p className="text-sm text-muted-foreground mt-1">
                keep leveling up!
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                Days Tracked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{monthlyStats.daysTracked}</div>
              <p className="text-sm text-muted-foreground mt-1">
                out of {monthlyStats.totalDays} days
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Monthly Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              6-Month Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyChart months={6} />
          </CardContent>
        </Card>
      </motion.div>

      {/* Best Habit & Level Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {monthlyStats.bestHabit && monthlyStats.bestHabit.completions > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="border-emerald-500/50 bg-emerald-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-emerald-500" />
                  Best Habit This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${monthlyStats.bestHabit.habit.color}20` }}
                  >
                    <Target className="w-7 h-7" style={{ color: monthlyStats.bestHabit.habit.color }} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{monthlyStats.bestHabit.habit.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Completed {monthlyStats.bestHabit.completions} times this month
                    </p>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Monthly progress</span>
                        <span className="font-medium">
                          {Math.round((monthlyStats.bestHabit.completions / monthlyStats.totalDays) * 100)}%
                        </span>
                      </div>
                      <Progress 
                        value={(monthlyStats.bestHabit.completions / monthlyStats.totalDays) * 100} 
                        className="h-2"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Level Progression
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                      <Award className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                      <p className="font-semibold">Level {userLevel}</p>
                      <p className="text-sm text-muted-foreground">
                        {Math.floor(100 * Math.pow(1.2, userLevel - 1)) - (totalXP - Math.floor(100 * (Math.pow(1.2, userLevel - 1) - 1) / 0.2))} XP to next
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-amber-500">{totalXP}</p>
                    <p className="text-sm text-muted-foreground">total XP</p>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Progress to Level {userLevel + 1}</span>
                    <span className="font-medium">
                      {Math.round(((totalXP - Math.floor(100 * (Math.pow(1.2, userLevel - 1) - 1) / 0.2)) / Math.floor(100 * Math.pow(1.2, userLevel - 1))) * 100)}%
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${((totalXP - Math.floor(100 * (Math.pow(1.2, userLevel - 1) - 1) / 0.2)) / Math.floor(100 * Math.pow(1.2, userLevel - 1))) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Goal Completion Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Monthly Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-emerald-500">
                  {habits.filter(h => h.currentStreak >= 7).length}
                </p>
                <p className="text-sm text-muted-foreground">Week+ Streaks</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-blue-500">
                  {habits.filter(h => h.level >= 3).length}
                </p>
                <p className="text-sm text-muted-foreground">Level 3+ Habits</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-purple-500">
                  {Math.round(habits.reduce((sum, h) => sum + h.totalCompletions, 0) / habits.length) || 0}
                </p>
                <p className="text-sm text-muted-foreground">Avg Completions</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-orange-500">
                  {Math.max(...habits.map(h => h.bestStreak), 0)}
                </p>
                <p className="text-sm text-muted-foreground">Best Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
