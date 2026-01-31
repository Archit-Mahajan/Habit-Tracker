import { motion } from 'framer-motion';
import { useHabits } from '@/context/HabitContext';
import { ProgressRing, XPProgressRing } from '@/components/ui-custom/ProgressRing';
import { 
  Flame, 
  Target, 
  TrendingUp, 
  Award,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { format, startOfWeek, eachDayOfInterval } from 'date-fns';

export function StatsOverview() {
  const { 
    habits, 
    totalXP, 
    userLevel, 
    currentStreak, 
    bestStreak, 
    productivityScore 
  } = useHabits();

  // Calculate today's stats
  const today = format(new Date(), 'yyyy-MM-dd');
  const completedToday = habits.filter(h => h.completedDates.includes(today)).length;
  const totalHabits = habits.length;
  const todayProgress = totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0;

  // Calculate weekly stats
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: new Date() });
  const weeklyCompletions = weekDays.reduce((sum, day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return sum + habits.filter(h => h.completedDates.includes(dateStr)).length;
  }, 0);

  // Calculate XP to next level
  const xpToNextLevel = Math.floor(100 * Math.pow(1.2, userLevel - 1));
  const currentLevelXP = totalXP - (userLevel > 1 ? Math.floor(100 * (Math.pow(1.2, userLevel - 1) - 1) / 0.2) : 0);

  const statCards = [
    {
      title: 'Today\'s Progress',
      value: `${completedToday}/${totalHabits}`,
      subtitle: `${Math.round(todayProgress)}% completed`,
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      progress: todayProgress,
    },
    {
      title: 'Current Streak',
      value: currentStreak.toString(),
      subtitle: `Best: ${bestStreak} days`,
      icon: Flame,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      showFlame: currentStreak > 0,
    },
    {
      title: 'Weekly Total',
      value: weeklyCompletions.toString(),
      subtitle: 'habits completed',
      icon: Calendar,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Total Habits',
      value: totalHabits.toString(),
      subtitle: 'active habits',
      icon: Target,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card border rounded-xl p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className={`text-2xl font-bold ${stat.showFlame && currentStreak > 5 ? 'text-orange-500' : ''}`}>
                    {stat.value}
                  </span>
                  {stat.showFlame && currentStreak > 5 && (
                    <Flame className="w-5 h-5 text-orange-500 streak-flame" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            
            {stat.progress !== undefined && (
              <div className="mt-3">
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-emerald-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${stat.progress}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* XP & Productivity Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* XP Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Level Progress</h3>
              <p className="text-sm text-muted-foreground">Keep completing habits to level up!</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Award className="w-6 h-6 text-amber-500" />
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <XPProgressRing 
              currentXP={currentLevelXP} 
              xpToNextLevel={xpToNextLevel} 
              level={userLevel}
              size={100}
            />
            <div className="flex-1 space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total XP</span>
                  <span className="font-medium text-amber-500">{totalXP}</span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Current Level</span>
                  <span className="font-medium">{userLevel}</span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">XP to Next Level</span>
                  <span className="font-medium">{xpToNextLevel - currentLevelXP}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Productivity Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card border rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Productivity Score</h3>
              <p className="text-sm text-muted-foreground">Based on your habit completion rate</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-cyan-500" />
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <ProgressRing 
              progress={productivityScore} 
              size={100}
              strokeWidth={10}
              color="hsl(var(--info))"
              showPercentage
            />
            <div className="flex-1 space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Score</span>
                  <span className={`font-medium ${
                    productivityScore >= 80 ? 'text-emerald-500' :
                    productivityScore >= 60 ? 'text-amber-500' :
                    'text-rose-500'
                  }`}>
                    {productivityScore}/100
                  </span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Rating</span>
                  <span className="font-medium">
                    {productivityScore >= 80 ? 'Excellent!' :
                     productivityScore >= 60 ? 'Good' :
                     productivityScore >= 40 ? 'Fair' :
                     'Needs Work'}
                  </span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Completed Today</span>
                  <span className="font-medium">{completedToday} habits</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
