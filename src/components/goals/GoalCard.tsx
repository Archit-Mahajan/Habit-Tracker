import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

import { Slider } from '@/components/ui/slider';
import { useHabits } from '@/context/HabitContext';
import type { Goal } from '@/types';
import { 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  Circle,
  MoreHorizontal,
  Trash2,
  Edit3,
  Clock,
  Award
} from 'lucide-react';
import { differenceInDays } from 'date-fns';

interface GoalCardProps {
  goal: Goal;
  onEdit?: (goal: Goal) => void;
}

const typeIcons = {
  Monthly: Calendar,
  Yearly: TrendingUp,
};

const typeColors = {
  Monthly: 'text-blue-500 bg-blue-500/10',
  Yearly: 'text-purple-500 bg-purple-500/10',
};

export function GoalCard({ goal, onEdit }: GoalCardProps) {
  const { updateGoalProgress, deleteGoal } = useHabits();
  const [showActions, setShowActions] = useState(false);
  const [showSlider, setShowSlider] = useState(false);
  
  const TypeIcon = typeIcons[goal.type];
  const progress = Math.min((goal.currentValue / goal.targetValue) * 100, 100);
  const isCompleted = goal.status === 'Completed';
  
  const daysRemaining = differenceInDays(goal.deadline, new Date());
  const isOverdue = daysRemaining < 0 && !isCompleted;
  
  const completedMilestones = goal.milestones.filter(m => m.completed).length;
  const totalMilestones = goal.milestones.length;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`habit-card relative bg-card border rounded-xl p-4 overflow-hidden ${
        isCompleted ? 'border-emerald-500/50 bg-emerald-500/5' : ''
      }`}
    >
      {/* Completion Badge */}
      {isCompleted && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-3 right-3"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* Type Icon */}
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeColors[goal.type]}`}>
            <TypeIcon className="w-5 h-5" />
          </div>
          
          {/* Info */}
          <div>
            <h3 className="font-semibold text-base leading-tight">{goal.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full ${typeColors[goal.type]}`}>
                {goal.type}
              </span>
              <span className="text-xs text-muted-foreground">{goal.category}</span>
            </div>
          </div>
        </div>

        {/* Actions Menu */}
        {!isCompleted && (
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
            </button>
            
            {showActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 top-full mt-1 bg-popover border rounded-lg shadow-lg p-1 z-10 min-w-[140px]"
              >
                <button
                  onClick={() => { onEdit?.(goal); setShowActions(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => { deleteGoal(goal.id); setShowActions(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      {goal.description && (
        <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
          {goal.description}
        </p>
      )}

      {/* Progress */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">
            {goal.currentValue} / {goal.targetValue} {goal.unit}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              isCompleted 
                ? 'bg-emerald-500' 
                : 'bg-gradient-to-r from-blue-500 to-purple-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{Math.round(progress)}% complete</span>
          {isCompleted ? (
            <span className="text-emerald-500 font-medium">Completed!</span>
          ) : (
            <span>{goal.targetValue - goal.currentValue} {goal.unit} remaining</span>
          )}
        </div>
      </div>

      {/* Milestones */}
      {totalMilestones > 0 && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground flex items-center gap-1">
              <Award className="w-4 h-4" />
              Milestones
            </span>
            <span className="text-xs">
              {completedMilestones} / {totalMilestones}
            </span>
          </div>
          <div className="space-y-1">
            {goal.milestones.slice(0, 3).map((milestone) => (
              <div 
                key={milestone.id}
                className="flex items-center gap-2 text-sm"
              >
                {milestone.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Circle className="w-4 h-4 text-muted-foreground" />
                )}
                <span className={milestone.completed ? 'text-emerald-600 line-through' : 'text-muted-foreground'}>
                  {milestone.title}
                </span>
              </div>
            ))}
            {totalMilestones > 3 && (
              <p className="text-xs text-muted-foreground pl-6">
                +{totalMilestones - 3} more milestones
              </p>
            )}
          </div>
        </div>
      )}

      {/* Deadline & Actions */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t">
        <div className="flex items-center gap-1 text-sm">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className={isOverdue ? 'text-destructive' : 'text-muted-foreground'}>
            {isCompleted 
              ? 'Completed!' 
              : isOverdue 
                ? `${Math.abs(daysRemaining)} days overdue`
                : `${daysRemaining} days left`
            }
          </span>
        </div>
        
        {!isCompleted && (
          <div className="flex items-center gap-2">
            {showSlider ? (
              <div className="flex items-center gap-2">
                <Slider
                  value={[goal.currentValue]}
                  onValueChange={([value]) => updateGoalProgress(goal.id, value)}
                  max={goal.targetValue}
                  step={1}
                  className="w-32"
                />
                <button 
                  onClick={() => setShowSlider(false)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Done
                </button>
              </div>
            ) : (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setShowSlider(true)}
              >
                Update Progress
              </Button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
