
import { Button } from '@/components/ui/button';
import { useHabits } from '@/context/HabitContext';
import { 
  Plus, 
  Award, 
  Flame, 
  Zap,
  TrendingUp,
  Target
} from 'lucide-react';
import type { View } from '@/types';

interface HeaderProps {
  currentView: View;
  onAddHabit: () => void;
  onAddGoal: () => void;
}

const viewTitles: Record<View, { title: string; subtitle: string; icon: React.ElementType }> = {
  dashboard: { 
    title: 'Dashboard', 
    subtitle: 'Overview of your habits and progress',
    icon: TrendingUp 
  },
  habits: { 
    title: 'My Habits', 
    subtitle: 'Manage and track your daily habits',
    icon: Target 
  },
  analytics: { 
    title: 'Analytics', 
    subtitle: 'Detailed insights and statistics',
    icon: TrendingUp 
  },
  goals: { 
    title: 'Goals', 
    subtitle: 'Track your long-term objectives',
    icon: Target 
  },
  'weekly-review': { 
    title: 'Weekly Review', 
    subtitle: 'Summary of your week\'s performance',
    icon: TrendingUp 
  },
  'monthly-review': { 
    title: 'Monthly Review', 
    subtitle: 'Monthly progress and achievements',
    icon: TrendingUp 
  },
};

export function Header({ currentView, onAddHabit, onAddGoal }: HeaderProps) {
  const { userLevel, currentStreak, productivityScore } = useHabits();
  const viewInfo = viewTitles[currentView];
  const Icon = viewInfo.icon;

  const showAddButton = currentView === 'habits' || currentView === 'goals';
  const addButtonLabel = currentView === 'habits' ? 'Add Habit' : 'Add Goal';
  const onAddClick = currentView === 'habits' ? onAddHabit : onAddGoal;

  return (
    <header className="bg-card border-b px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left: Title */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex w-12 h-12 rounded-xl bg-primary/10 items-center justify-center">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">{viewInfo.title}</h1>
            <p className="text-sm text-muted-foreground hidden sm:block">{viewInfo.subtitle}</p>
          </div>
        </div>

        {/* Right: Stats & Actions */}
        <div className="flex items-center gap-3">
          {/* Quick Stats - Desktop */}
          <div className="hidden md:flex items-center gap-4 mr-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10">
              <Award className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium">Lvl {userLevel}</span>
            </div>
            
            {currentStreak > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium">{currentStreak}d</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10">
              <Zap className="w-4 h-4 text-cyan-500" />
              <span className="text-sm font-medium">{productivityScore}%</span>
            </div>
          </div>

          {/* Add Button */}
          {showAddButton && (
            <Button onClick={onAddClick} className="gap-2">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{addButtonLabel}</span>
              <span className="sm:hidden">Add</span>
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Quick Stats */}
      <div className="flex md:hidden items-center gap-3 mt-3 pt-3 border-t">
        <div className="flex items-center gap-1.5 text-sm">
          <Award className="w-4 h-4 text-amber-500" />
          <span>Level {userLevel}</span>
        </div>
        {currentStreak > 0 && (
          <div className="flex items-center gap-1.5 text-sm">
            <Flame className="w-4 h-4 text-orange-500" />
            <span>{currentStreak} day streak</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-sm">
          <Zap className="w-4 h-4 text-cyan-500" />
          <span>{productivityScore}% productive</span>
        </div>
      </div>
    </header>
  );
}
