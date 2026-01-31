import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { useHabits } from '@/context/HabitContext';
import type { Habit } from '@/types';
import { 
  Check, 
  Flame, 
  TrendingUp, 
  Target, 
  Award,
  Zap,
  Heart,
  Brain,
  Dumbbell,
  BookOpen,
  Briefcase,
  MoreHorizontal,
  RotateCcw,
  Trash2,
  Edit3
} from 'lucide-react';
import { format } from 'date-fns';

interface HabitCardProps {
  habit: Habit;
  onEdit?: (habit: Habit) => void;
}

const iconMap: Record<string, React.ElementType> = {
  target: Target,
  trending: TrendingUp,
  flame: Flame,
  award: Award,
  zap: Zap,
  heart: Heart,
  brain: Brain,
  dumbbell: Dumbbell,
  book: BookOpen,
  briefcase: Briefcase,
  more: MoreHorizontal,
};

const categoryIcons: Record<string, React.ElementType> = {
  Health: Heart,
  Fitness: Dumbbell,
  Study: BookOpen,
  Work: Briefcase,
  'Mental Health': Brain,
  Productivity: Zap,
  Other: MoreHorizontal,
};

const difficultyColors = {
  Easy: 'text-emerald-500',
  Medium: 'text-amber-500',
  Hard: 'text-rose-500',
};



export function HabitCard({ habit, onEdit }: HabitCardProps) {
  const { completeHabit, undoCompletion, deleteHabit } = useHabits();
  const [showActions, setShowActions] = useState(false);
  const [showXPGain, setShowXPGain] = useState(false);
  
  const today = format(new Date(), 'yyyy-MM-dd');
  const isCompletedToday = habit.completedDates.includes(today);
  
  const Icon = iconMap[habit.icon] || Target;
  const CategoryIcon = categoryIcons[habit.category] || MoreHorizontal;
  
  const xpProgress = (habit.xp / habit.xpToNextLevel) * 100;
  const streakProgress = (habit.currentStreak / habit.targetStreak) * 100;
  
  const handleComplete = () => {
    if (!isCompletedToday) {
      completeHabit(habit.id, today);
      setShowXPGain(true);
      setTimeout(() => setShowXPGain(false), 1000);
    }
  };
  
  const handleUndo = () => {
    if (isCompletedToday) {
      undoCompletion(habit.id, today);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="habit-card relative bg-card border rounded-xl p-4 overflow-hidden"
    >
      {/* XP Gain Animation */}
      <AnimatePresence>
        {showXPGain && (
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -40 }}
            exit={{ opacity: 0 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
          >
            <div className="flex items-center gap-1 text-amber-500 font-bold text-lg">
              <Zap className="w-5 h-5 fill-current" />
              <span>+{habit.difficulty === 'Easy' ? 10 : habit.difficulty === 'Medium' ? 20 : 30} XP</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${habit.color}20` }}
          >
            <Icon className="w-6 h-6" style={{ color: habit.color }} />
          </div>
          
          {/* Info */}
          <div>
            <h3 className="font-semibold text-base leading-tight">{habit.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <CategoryIcon className="w-3 h-3" />
                {habit.category}
              </span>
              <span className={`text-xs font-medium ${difficultyColors[habit.difficulty]}`}>
                {habit.difficulty}
              </span>
            </div>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
          </button>
          
          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 top-full mt-1 bg-popover border rounded-lg shadow-lg p-1 z-10 min-w-[140px]"
              >
                <button
                  onClick={() => { onEdit?.(habit); setShowActions(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </button>
                {isCompletedToday && (
                  <button
                    onClick={() => { handleUndo(); setShowActions(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Undo
                  </button>
                )}
                <button
                  onClick={() => { deleteHabit(habit.id); setShowActions(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-4 mt-4">
        {/* Streak */}
        <div className="flex items-center gap-1.5">
          <Flame className={`w-4 h-4 ${habit.currentStreak > 0 ? 'text-orange-500 streak-flame' : 'text-muted-foreground'}`} />
          <span className={`text-sm font-medium ${habit.currentStreak > 0 ? 'text-orange-500' : 'text-muted-foreground'}`}>
            {habit.currentStreak}
          </span>
          <span className="text-xs text-muted-foreground">day streak</span>
        </div>
        
        {/* Level */}
        <div className="flex items-center gap-1.5">
          <Award className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-medium">Lvl {habit.level}</span>
        </div>
        
        {/* Total */}
        <div className="flex items-center gap-1.5">
          <Target className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{habit.totalCompletions} total</span>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="space-y-2 mt-4">
        {/* XP Progress */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">XP Progress</span>
          <span className="text-amber-500 font-medium">{habit.xp} / {habit.xpToNextLevel}</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${xpProgress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        
        {/* Streak Progress */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Streak Goal</span>
          <span className="text-orange-500 font-medium">{habit.currentStreak} / {habit.targetStreak}</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(streakProgress, 100)}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Complete Button */}
      <motion.button
        onClick={handleComplete}
        disabled={isCompletedToday}
        whileTap={{ scale: 0.98 }}
        className={`w-full mt-4 py-2.5 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
          isCompletedToday
            ? 'bg-emerald-500/10 text-emerald-600 cursor-default'
            : 'bg-primary text-primary-foreground hover:bg-primary/90'
        }`}
      >
        {isCompletedToday ? (
          <>
            <Check className="w-4 h-4" />
            Completed Today
          </>
        ) : (
          <>
            <Check className="w-4 h-4" />
            Mark Complete
          </>
        )}
      </motion.button>
    </motion.div>
  );
}
