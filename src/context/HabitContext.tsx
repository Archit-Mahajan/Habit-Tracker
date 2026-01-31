import { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import type { Habit, Goal, Badge, DailyProgress, WeeklyStats, MonthlyStats, Milestone } from '@/types';

interface HabitState {
  habits: Habit[];
  goals: Goal[];
  badges: Badge[];
  totalXP: number;
  userLevel: number;
  currentStreak: number;
  bestStreak: number;
  productivityScore: number;
}

type HabitAction =
  | { type: 'ADD_HABIT'; payload: Habit }
  | { type: 'UPDATE_HABIT'; payload: Habit }
  | { type: 'DELETE_HABIT'; payload: string }
  | { type: 'COMPLETE_HABIT'; payload: { habitId: string; date: string } }
  | { type: 'UNDO_COMPLETION'; payload: { habitId: string; date: string } }
  | { type: 'ADD_GOAL'; payload: Goal }
  | { type: 'UPDATE_GOAL'; payload: Goal }
  | { type: 'DELETE_GOAL'; payload: string }
  | { type: 'UPDATE_GOAL_PROGRESS'; payload: { goalId: string; value: number } }
  | { type: 'UNLOCK_BADGE'; payload: Badge }
  | { type: 'LOAD_STATE'; payload: HabitState };

const initialState: HabitState = {
  habits: [],
  goals: [],
  badges: [],
  totalXP: 0,
  userLevel: 1,
  currentStreak: 0,
  bestStreak: 0,
  productivityScore: 0,
};

// XP Calculation
const calculateXP = (difficulty: string): number => {
  switch (difficulty) {
    case 'Easy': return 10;
    case 'Medium': return 20;
    case 'Hard': return 30;
    default: return 10;
  }
};

const calculateXPToNextLevel = (level: number): number => {
  return Math.floor(100 * Math.pow(1.2, level - 1));
};

const calculateLevel = (xp: number): number => {
  let level = 1;
  let remainingXP = xp;
  let xpNeeded = 100;
  
  while (remainingXP >= xpNeeded) {
    remainingXP -= xpNeeded;
    level++;
    xpNeeded = calculateXPToNextLevel(level);
  }
  
  return Math.min(level, 10);
};

function habitReducer(state: HabitState, action: HabitAction): HabitState {
  switch (action.type) {
    case 'ADD_HABIT':
      return { ...state, habits: [...state.habits, action.payload] };

    case 'UPDATE_HABIT':
      return {
        ...state,
        habits: state.habits.map(h => h.id === action.payload.id ? action.payload : h),
      };

    case 'DELETE_HABIT':
      return {
        ...state,
        habits: state.habits.filter(h => h.id !== action.payload),
      };

    case 'COMPLETE_HABIT': {
      const { habitId, date } = action.payload;
      const habit = state.habits.find(h => h.id === habitId);
      if (!habit || habit.completedDates.includes(date)) return state;

      const xpGained = calculateXP(habit.difficulty);
      const newTotalXP = state.totalXP + xpGained;
      const newUserLevel = calculateLevel(newTotalXP);
      
      // Check if level up
      const didLevelUp = newUserLevel > state.userLevel;
      
      // Update habit
      const updatedHabit: Habit = {
        ...habit,
        completedDates: [...habit.completedDates, date],
        totalCompletions: habit.totalCompletions + 1,
        currentStreak: habit.currentStreak + 1,
        bestStreak: Math.max(habit.bestStreak, habit.currentStreak + 1),
        xp: habit.xp + xpGained,
        level: didLevelUp ? Math.min(habit.level + 1, 10) : habit.level,
        xpToNextLevel: calculateXPToNextLevel(didLevelUp ? habit.level + 1 : habit.level),
      };

      // Calculate overall streak
      const allHabitsCompletedToday = state.habits.every(h => 
        h.id === habitId ? true : h.completedDates.includes(date)
      );
      
      const newCurrentStreak = allHabitsCompletedToday ? state.currentStreak + 1 : state.currentStreak;
      const newBestStreak = Math.max(state.bestStreak, newCurrentStreak);

      // Calculate productivity score
      const totalPossible = state.habits.length;
      const totalCompleted = state.habits.filter(h => 
        h.id === habitId ? true : h.completedDates.includes(date)
      ).length;
      const productivityScore = Math.round((totalCompleted / totalPossible) * 100);

      return {
        ...state,
        habits: state.habits.map(h => h.id === habitId ? updatedHabit : h),
        totalXP: newTotalXP,
        userLevel: newUserLevel,
        currentStreak: newCurrentStreak,
        bestStreak: newBestStreak,
        productivityScore,
      };
    }

    case 'UNDO_COMPLETION': {
      const { habitId, date } = action.payload;
      const habit = state.habits.find(h => h.id === habitId);
      if (!habit || !habit.completedDates.includes(date)) return state;

      const xpLost = calculateXP(habit.difficulty);
      const newTotalXP = Math.max(0, state.totalXP - xpLost);
      const newUserLevel = calculateLevel(newTotalXP);

      const updatedHabit: Habit = {
        ...habit,
        completedDates: habit.completedDates.filter(d => d !== date),
        totalCompletions: Math.max(0, habit.totalCompletions - 1),
        currentStreak: Math.max(0, habit.currentStreak - 1),
        xp: Math.max(0, habit.xp - xpLost),
        level: newUserLevel < state.userLevel ? Math.max(1, habit.level - 1) : habit.level,
      };

      return {
        ...state,
        habits: state.habits.map(h => h.id === habitId ? updatedHabit : h),
        totalXP: newTotalXP,
        userLevel: newUserLevel,
      };
    }

    case 'ADD_GOAL':
      return { ...state, goals: [...state.goals, action.payload] };

    case 'UPDATE_GOAL':
      return {
        ...state,
        goals: state.goals.map(g => g.id === action.payload.id ? action.payload : g),
      };

    case 'DELETE_GOAL':
      return {
        ...state,
        goals: state.goals.filter(g => g.id !== action.payload),
      };

    case 'UPDATE_GOAL_PROGRESS': {
      const { goalId, value } = action.payload;
      const goal = state.goals.find(g => g.id === goalId);
      if (!goal) return state;

      const updatedGoal: Goal = {
        ...goal,
        currentValue: Math.min(value, goal.targetValue),
        status: value >= goal.targetValue ? 'Completed' : 'Active',
        milestones: goal.milestones.map(m => ({
          ...m,
          completed: value >= m.targetValue,
          completedAt: value >= m.targetValue && !m.completed ? new Date() : m.completedAt,
        })),
      };

      return {
        ...state,
        goals: state.goals.map(g => g.id === goalId ? updatedGoal : g),
      };
    }

    case 'UNLOCK_BADGE':
      if (state.badges.find(b => b.id === action.payload.id)) return state;
      return {
        ...state,
        badges: [...state.badges, { ...action.payload, unlockedAt: new Date() }],
      };

    case 'LOAD_STATE':
      return action.payload;

    default:
      return state;
  }
}

interface HabitContextType extends HabitState {
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'completedDates' | 'currentStreak' | 'bestStreak' | 'totalCompletions' | 'xp' | 'level' | 'xpToNextLevel'>) => void;
  updateHabit: (habit: Habit) => void;
  deleteHabit: (id: string) => void;
  completeHabit: (habitId: string, date: string) => void;
  undoCompletion: (habitId: string, date: string) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'status' | 'currentValue'> & { milestones: string[] }) => void;
  updateGoal: (goal: Goal) => void;
  deleteGoal: (id: string) => void;
  updateGoalProgress: (goalId: string, value: number) => void;
  getDailyProgress: (startDate: Date, endDate: Date) => DailyProgress[];
  getWeeklyStats: () => WeeklyStats[];
  getMonthlyStats: () => MonthlyStats[];
  getHabitStats: (habitId: string) => { completionRate: number; weeklyAverage: number; monthlyTrend: number[] };
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export function HabitProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(habitReducer, initialState, (initial) => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('habitTrackerState');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return {
            ...parsed,
            habits: parsed.habits.map((h: Habit) => ({
              ...h,
              createdAt: new Date(h.createdAt),
            })),
            goals: parsed.goals.map((g: Goal) => ({
              ...g,
              createdAt: new Date(g.createdAt),
              deadline: new Date(g.deadline),
              milestones: g.milestones.map((m: Milestone) => ({
                ...m,
                completedAt: m.completedAt ? new Date(m.completedAt) : undefined,
              })),
            })),
            badges: parsed.badges.map((b: Badge) => ({
              ...b,
              unlockedAt: b.unlockedAt ? new Date(b.unlockedAt) : undefined,
            })),
          };
        } catch {
          return initial;
        }
      }
    }
    return initial;
  });

  // Persist state to localStorage
  const persistState = useCallback((newState: HabitState) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('habitTrackerState', JSON.stringify(newState));
    }
  }, []);

  // Wrap dispatch to persist state
  const wrappedDispatch = useCallback((action: HabitAction) => {
    dispatch(action);
    if (action.type !== 'LOAD_STATE') {
      const newState = habitReducer(state, action);
      persistState(newState);
    }
  }, [state, persistState]);

  const addHabit = useCallback((habitData: Omit<Habit, 'id' | 'createdAt' | 'completedDates' | 'currentStreak' | 'bestStreak' | 'totalCompletions' | 'xp' | 'level' | 'xpToNextLevel'>) => {
    const newHabit: Habit = {
      ...habitData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      completedDates: [],
      currentStreak: 0,
      bestStreak: 0,
      totalCompletions: 0,
      xp: 0,
      level: 1,
      xpToNextLevel: 100,
    };
    wrappedDispatch({ type: 'ADD_HABIT', payload: newHabit });
  }, [wrappedDispatch]);

  const updateHabit = useCallback((habit: Habit) => {
    wrappedDispatch({ type: 'UPDATE_HABIT', payload: habit });
  }, [wrappedDispatch]);

  const deleteHabit = useCallback((id: string) => {
    wrappedDispatch({ type: 'DELETE_HABIT', payload: id });
  }, [wrappedDispatch]);

  const completeHabit = useCallback((habitId: string, date: string) => {
    wrappedDispatch({ type: 'COMPLETE_HABIT', payload: { habitId, date } });
  }, [wrappedDispatch]);

  const undoCompletion = useCallback((habitId: string, date: string) => {
    wrappedDispatch({ type: 'UNDO_COMPLETION', payload: { habitId, date } });
  }, [wrappedDispatch]);

  const addGoal = useCallback((goalData: Omit<Goal, 'id' | 'createdAt' | 'status' | 'currentValue'> & { milestones: string[] }) => {
    const newGoal: Goal = {
      ...goalData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      status: 'Active',
      currentValue: 0,
      milestones: goalData.milestones?.map((m: string, i: number) => ({
        id: crypto.randomUUID(),
        title: m,
        targetValue: Math.round((goalData.targetValue / (goalData.milestones?.length || 1)) * (i + 1)),
        completed: false,
      })) || [],
    };
    wrappedDispatch({ type: 'ADD_GOAL', payload: newGoal });
  }, [wrappedDispatch]);

  const updateGoal = useCallback((goal: Goal) => {
    wrappedDispatch({ type: 'UPDATE_GOAL', payload: goal });
  }, [wrappedDispatch]);

  const deleteGoal = useCallback((id: string) => {
    wrappedDispatch({ type: 'DELETE_GOAL', payload: id });
  }, [wrappedDispatch]);

  const updateGoalProgress = useCallback((goalId: string, value: number) => {
    wrappedDispatch({ type: 'UPDATE_GOAL_PROGRESS', payload: { goalId, value } });
  }, [wrappedDispatch]);

  const getDailyProgress = useCallback((startDate: Date, endDate: Date): DailyProgress[] => {
    const progress: DailyProgress[] = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0];
      const completed = state.habits.filter(h => h.completedDates.includes(dateStr)).length;
      const total = state.habits.length;
      
      progress.push({
        date: dateStr,
        completed,
        total,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return progress;
  }, [state.habits]);

  const getWeeklyStats = useCallback((): WeeklyStats[] => {
    const stats: WeeklyStats[] = [];
    const today = new Date();
    
    for (let i = 0; i < 12; i++) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - i * 7);
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      let completed = 0;
      let missed = 0;
      
      for (let d = new Date(weekStart); d <= weekEnd; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const dayCompleted = state.habits.filter(h => h.completedDates.includes(dateStr)).length;
        const dayTotal = state.habits.length;
        
        completed += dayCompleted;
        missed += (dayTotal - dayCompleted);
      }
      
      const total = completed + missed;
      stats.push({
        weekStart: weekStart.toISOString().split('T')[0],
        completed,
        missed,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      });
    }
    
    return stats.reverse();
  }, [state.habits]);

  const getMonthlyStats = useCallback((): MonthlyStats[] => {
    const stats: Map<string, { total: number; streakSum: number; bestHabit: string; bestCount: number }> = new Map();
    
    state.habits.forEach(habit => {
      habit.completedDates.forEach(dateStr => {
        const month = dateStr.substring(0, 7);
        const current = stats.get(month) || { total: 0, streakSum: 0, bestHabit: '', bestCount: 0 };
        
        current.total++;
        stats.set(month, current);
      });
    });
    
    return Array.from(stats.entries()).map(([month, data]) => ({
      month,
      totalCompletions: data.total,
      averageStreak: state.habits.reduce((sum, h) => sum + h.currentStreak, 0) / state.habits.length,
      bestHabit: state.habits.reduce((best, h) => h.totalCompletions > best.totalCompletions ? h : best, state.habits[0])?.name || '',
      completionRate: data.total / (state.habits.length * 30) * 100,
    })).slice(-12);
  }, [state.habits]);

  const getHabitStats = useCallback((habitId: string) => {
    const habit = state.habits.find(h => h.id === habitId);
    if (!habit) return { completionRate: 0, weeklyAverage: 0, monthlyTrend: [] };
    
    const daysSinceCreated = Math.max(1, Math.floor((Date.now() - habit.createdAt.getTime()) / (1000 * 60 * 60 * 24)));
    const completionRate = (habit.totalCompletions / daysSinceCreated) * 100;
    const weeklyAverage = habit.totalCompletions / Math.max(1, Math.floor(daysSinceCreated / 7));
    
    // Calculate monthly trend
    const monthlyTrend: number[] = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthStr = month.toISOString().substring(0, 7);
      const monthCompletions = habit.completedDates.filter(d => d.startsWith(monthStr)).length;
      monthlyTrend.push(monthCompletions);
    }
    
    return { completionRate, weeklyAverage, monthlyTrend };
  }, [state.habits]);

  return (
    <HabitContext.Provider
      value={{
        ...state,
        addHabit,
        updateHabit,
        deleteHabit,
        completeHabit,
        undoCompletion,
        addGoal,
        updateGoal,
        deleteGoal,
        updateGoalProgress,
        getDailyProgress,
        getWeeklyStats,
        getMonthlyStats,
        getHabitStats,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
}

export function useHabits() {
  const context = useContext(HabitContext);
  if (context === undefined) {
    throw new Error('useHabits must be used within a HabitProvider');
  }
  return context;
}
