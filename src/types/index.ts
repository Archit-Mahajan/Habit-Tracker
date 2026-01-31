// Habit Types
export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type Frequency = 'Daily' | 'Weekly';
export type Category = 'Health' | 'Fitness' | 'Study' | 'Work' | 'Mental Health' | 'Productivity' | 'Other';

export interface Habit {
  id: string;
  name: string;
  category: Category;
  difficulty: Difficulty;
  frequency: Frequency;
  targetStreak: number;
  currentStreak: number;
  bestStreak: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalCompletions: number;
  createdAt: Date;
  completedDates: string[]; // ISO date strings
  color: string;
  icon: string;
}

export interface HabitCompletion {
  habitId: string;
  date: string;
  completed: boolean;
}

// Goal Types
export type GoalType = 'Monthly' | 'Yearly';
export type GoalStatus = 'Active' | 'Completed' | 'Abandoned';

export interface Goal {
  id: string;
  title: string;
  description: string;
  type: GoalType;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: Date;
  status: GoalStatus;
  milestones: Milestone[];
  createdAt: Date;
  category: Category;
}

export interface Milestone {
  id: string;
  title: string;
  targetValue: number;
  completed: boolean;
  completedAt?: Date;
}

// Analytics Types
export interface DailyProgress {
  date: string;
  completed: number;
  total: number;
  percentage: number;
}

export interface WeeklyStats {
  weekStart: string;
  completed: number;
  missed: number;
  completionRate: number;
}

export interface MonthlyStats {
  month: string;
  totalCompletions: number;
  averageStreak: number;
  bestHabit: string;
  completionRate: number;
}

// Gamification Types
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  condition: string;
}

export interface UserStats {
  totalXP: number;
  level: number;
  currentStreak: number;
  bestStreak: number;
  totalHabitsCompleted: number;
  badges: Badge[];
  productivityScore: number;
}

// Theme Types
export type Theme = 'light' | 'dark';

// UI Types
export type View = 'dashboard' | 'habits' | 'analytics' | 'goals' | 'weekly-review' | 'monthly-review';

// Form Types
export interface HabitFormData {
  name: string;
  category: Category;
  difficulty: Difficulty;
  frequency: Frequency;
  targetStreak: number;
  color: string;
  icon: string;
}

export interface GoalFormData {
  title: string;
  description: string;
  type: GoalType;
  targetValue: number;
  unit: string;
  deadline: Date;
  category: Category;
  milestones: string[];
}
