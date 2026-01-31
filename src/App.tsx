import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider } from '@/context/ThemeContext';
import { HabitProvider, useHabits } from '@/context/HabitContext';
import { Navigation } from '@/components/layout/Navigation';
import { Header } from '@/components/layout/Header';
import { HabitForm } from '@/components/habits/HabitForm';
import { HabitCard } from '@/components/habits/HabitCard';
import { GoalForm } from '@/components/goals/GoalForm';
import { GoalCard } from '@/components/goals/GoalCard';
import { StatsOverview } from '@/components/dashboard/StatsOverview';
import { WeeklyReview } from '@/components/dashboard/WeeklyReview';
import { MonthlyReview } from '@/components/dashboard/MonthlyReview';
import { Heatmap } from '@/components/analytics/Heatmap';
import { WeeklyChart } from '@/components/analytics/WeeklyChart';
import { MonthlyChart } from '@/components/analytics/MonthlyChart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { View } from '@/types';
import { 
  Plus, 
  Target, 
  TrendingUp, 
  Calendar,
  BarChart3,
  Zap,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';

// Dashboard View
function DashboardView({ onAddHabit }: { onAddHabit: () => void }) {
  const { habits } = useHabits();
  const today = format(new Date(), 'yyyy-MM-dd');
  const completedToday = habits.filter(h => h.completedDates.includes(today)).length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary to-purple-500 rounded-2xl p-6 text-primary-foreground"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              {completedToday === habits.length && habits.length > 0 
                ? 'All habits completed! 🎉' 
                : `Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}!`}
            </h2>
            <p className="opacity-90">
              {completedToday === habits.length && habits.length > 0
                ? 'Amazing work today. Keep up the momentum!'
                : `You have ${habits.length - completedToday} habits remaining for today.`}
            </p>
          </div>
          <div className="hidden sm:block">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
              <Zap className="w-8 h-8" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <StatsOverview />

      {/* Today's Habits */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Today's Habits</h3>
          <Button variant="ghost" size="sm" onClick={onAddHabit}>
            <Plus className="w-4 h-4 mr-1" />
            Add Habit
          </Button>
        </div>
        
        {habits.length === 0 ? (
          <Card className="p-8 text-center">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="font-semibold mb-2">No habits yet</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first habit to start tracking your progress
            </p>
            <Button onClick={onAddHabit}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Habit
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {habits.slice(0, 6).map((habit, index) => (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <HabitCard habit={habit} />
              </motion.div>
            ))}
            {habits.length > 6 && (
              <Card className="flex items-center justify-center p-8 border-dashed">
                <Button variant="ghost" onClick={onAddHabit}>
                  View All ({habits.length})
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Quick Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Activity Heatmap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Heatmap days={180} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Weekly Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WeeklyChart weeks={6} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Habits View
function HabitsView() {
  const { habits } = useHabits();
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');

  const today = format(new Date(), 'yyyy-MM-dd');
  const filteredHabits = habits.filter(habit => {
    if (filter === 'completed') return habit.completedDates.includes(today);
    if (filter === 'pending') return !habit.completedDates.includes(today);
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList>
          <TabsTrigger value="all">All ({habits.length})</TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({habits.filter(h => h.completedDates.includes(today)).length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({habits.filter(h => !h.completedDates.includes(today)).length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Habits Grid */}
      {filteredHabits.length === 0 ? (
        <Card className="p-8 text-center">
          <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h4 className="font-semibold mb-2">No habits found</h4>
          <p className="text-sm text-muted-foreground">
            {filter === 'completed' 
              ? 'No habits completed yet today.' 
              : filter === 'pending'
                ? 'All habits completed! Great job!'
                : 'Create your first habit to get started.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredHabits.map((habit) => (
              <HabitCard key={habit.id} habit={habit} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// Analytics View
function AnalyticsView() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="heatmap" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
        </TabsList>
        
        <TabsContent value="heatmap" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Activity Heatmap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Heatmap days={365} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="weekly" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Weekly Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WeeklyChart weeks={12} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="monthly" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Monthly Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MonthlyChart months={6} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Goals View
function GoalsView({ onAddGoal }: { onAddGoal: () => void }) {
  const { goals } = useHabits();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const filteredGoals = goals.filter(goal => {
    if (filter === 'active') return goal.status === 'Active';
    if (filter === 'completed') return goal.status === 'Completed';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList>
          <TabsTrigger value="all">All ({goals.length})</TabsTrigger>
          <TabsTrigger value="active">
            Active ({goals.filter(g => g.status === 'Active').length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({goals.filter(g => g.status === 'Completed').length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Goals Grid */}
      {filteredGoals.length === 0 ? (
        <Card className="p-8 text-center">
          <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h4 className="font-semibold mb-2">No goals yet</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Set your first goal to start working towards your dreams
          </p>
          <Button onClick={onAddGoal}>
            <Plus className="w-4 h-4 mr-2" />
            Create First Goal
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// Main App Content
function AppContent() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [habitFormOpen, setHabitFormOpen] = useState(false);
  const [goalFormOpen, setGoalFormOpen] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView onAddHabit={() => setHabitFormOpen(true)} />;
      case 'habits':
        return <HabitsView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'goals':
        return <GoalsView onAddGoal={() => setGoalFormOpen(true)} />;
      case 'weekly-review':
        return <WeeklyReview />;
      case 'monthly-review':
        return <MonthlyReview />;
      default:
        return <DashboardView onAddHabit={() => setHabitFormOpen(true)} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Navigation */}
      <Navigation currentView={currentView} onViewChange={setCurrentView} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <Header 
          currentView={currentView} 
          onAddHabit={() => setHabitFormOpen(true)}
          onAddGoal={() => setGoalFormOpen(true)}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Modals */}
      <HabitForm open={habitFormOpen} onOpenChange={setHabitFormOpen} />
      <GoalForm open={goalFormOpen} onOpenChange={setGoalFormOpen} />
    </div>
  );
}

// App with Providers
function App() {
  return (
    <ThemeProvider>
      <HabitProvider>
        <AppContent />
      </HabitProvider>
    </ThemeProvider>
  );
}

export default App;
