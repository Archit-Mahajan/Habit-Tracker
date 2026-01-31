import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { Slider } from '@/components/ui/slider';
import { useHabits } from '@/context/HabitContext';
import type { Category, Difficulty, Frequency } from '@/types';
import { 
  Dumbbell, 
  Brain, 
  BookOpen, 
  Briefcase, 
  Heart, 
  Zap, 
  MoreHorizontal,
  Target,
  TrendingUp,
  Flame,
  Award,
  Clock,
  Calendar
} from 'lucide-react';

interface HabitFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categories: { value: Category; label: string; icon: React.ElementType; color: string }[] = [
  { value: 'Health', label: 'Health', icon: Heart, color: '#10b981' },
  { value: 'Fitness', label: 'Fitness', icon: Dumbbell, color: '#f97316' },
  { value: 'Study', label: 'Study', icon: BookOpen, color: '#3b82f6' },
  { value: 'Work', label: 'Work', icon: Briefcase, color: '#8b5cf6' },
  { value: 'Mental Health', label: 'Mental Health', icon: Brain, color: '#ec4899' },
  { value: 'Productivity', label: 'Productivity', icon: Zap, color: '#06b6d4' },
  { value: 'Other', label: 'Other', icon: MoreHorizontal, color: '#6b7280' },
];

const difficulties: { value: Difficulty; label: string; xp: number; color: string }[] = [
  { value: 'Easy', label: 'Easy', xp: 10, color: '#10b981' },
  { value: 'Medium', label: 'Medium', xp: 20, color: '#f59e0b' },
  { value: 'Hard', label: 'Hard', xp: 30, color: '#ef4444' },
];

const frequencies: { value: Frequency; label: string; icon: React.ElementType }[] = [
  { value: 'Daily', label: 'Daily', icon: Clock },
  { value: 'Weekly', label: 'Weekly', icon: Calendar },
];

const icons = [
  { name: 'target', icon: Target },
  { name: 'trending', icon: TrendingUp },
  { name: 'flame', icon: Flame },
  { name: 'award', icon: Award },
  { name: 'zap', icon: Zap },
  { name: 'heart', icon: Heart },
  { name: 'brain', icon: Brain },
  { name: 'dumbbell', icon: Dumbbell },
];

const colors = [
  '#10b981', '#3b82f6', '#8b5cf6', '#f97316', 
  '#ec4899', '#06b6d4', '#f59e0b', '#ef4444',
  '#14b8a6', '#6366f1', '#84cc16', '#f43f5e'
];

export function HabitForm({ open, onOpenChange }: HabitFormProps) {
  const { addHabit } = useHabits();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Health' as Category,
    difficulty: 'Easy' as Difficulty,
    frequency: 'Daily' as Frequency,
    targetStreak: 7,
    color: colors[0],
    icon: 'target',
  });

  const resetForm = () => {
    setStep(1);
    setFormData({
      name: '',
      category: 'Health',
      difficulty: 'Easy',
      frequency: 'Daily',
      targetStreak: 7,
      color: colors[0],
      icon: 'target',
    });
  };

  const handleSubmit = () => {
    addHabit({
      name: formData.name,
      category: formData.category,
      difficulty: formData.difficulty,
      frequency: formData.frequency,
      targetStreak: formData.targetStreak,
      color: formData.color,
      icon: formData.icon,
    });
    resetForm();
    onOpenChange(false);
  };

  const canProceed = () => {
    switch (step) {
      case 1: return formData.name.trim().length > 0;
      case 2: return true;
      case 3: return true;
      case 4: return true;
      default: return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open) resetForm(); onOpenChange(open); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Create New Habit
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <motion.div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    s <= step 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                  animate={{ scale: s === step ? 1.1 : 1 }}
                >
                  {s}
                </motion.div>
                {s < 4 && (
                  <div className={`w-12 h-0.5 mx-2 ${
                    s < step ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="name">Habit Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Morning Exercise, Read 30 mins..."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Category</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1.5">
                    {categories.map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => setFormData({ ...formData, category: cat.value })}
                        className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                          formData.category === cat.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <cat.icon className="w-4 h-4" style={{ color: cat.color }} />
                        <span className="text-sm">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Difficulty & Frequency */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <Label>Difficulty Level</Label>
                  <div className="space-y-2 mt-1.5">
                    {difficulties.map((diff) => (
                      <button
                        key={diff.value}
                        onClick={() => setFormData({ ...formData, difficulty: diff.value })}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                          formData.difficulty === diff.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: diff.color }}
                          />
                          <span className="font-medium">{diff.label}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          +{diff.xp} XP
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Frequency</Label>
                  <div className="flex gap-2 mt-1.5">
                    {frequencies.map((freq) => (
                      <button
                        key={freq.value}
                        onClick={() => setFormData({ ...formData, frequency: freq.value })}
                        className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
                          formData.frequency === freq.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <freq.icon className="w-4 h-4" />
                        <span className="text-sm">{freq.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Target Streak */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <Label>Target Streak</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Set a goal for how many consecutive days you want to maintain this habit
                  </p>
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Target</span>
                      <span className="text-2xl font-bold">{formData.targetStreak} days</span>
                    </div>
                    <Slider
                      value={[formData.targetStreak]}
                      onValueChange={([value]) => setFormData({ ...formData, targetStreak: value })}
                      min={7}
                      max={365}
                      step={7}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>1 week</span>
                      <span>1 month</span>
                      <span>3 months</span>
                      <span>1 year</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted">
                  <div className="flex items-center gap-2 text-sm">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="font-medium">Streak Bonus</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Reach your target streak to earn bonus XP and unlock special badges!
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 4: Appearance */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <Label>Icon</Label>
                  <div className="grid grid-cols-4 gap-2 mt-1.5">
                    {icons.map((icon) => (
                      <button
                        key={icon.name}
                        onClick={() => setFormData({ ...formData, icon: icon.name })}
                        className={`p-3 rounded-lg border transition-all ${
                          formData.icon === icon.name
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <icon.icon className="w-5 h-5 mx-auto" style={{ color: formData.color }} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Color</Label>
                  <div className="grid grid-cols-6 gap-2 mt-1.5">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-full aspect-square rounded-lg transition-all ${
                          formData.color === color
                            ? 'ring-2 ring-primary ring-offset-2'
                            : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div className="p-4 rounded-lg border bg-card">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Preview</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${formData.color}20` }}
                    >
                      {(() => {
                        const IconComponent = icons.find(i => i.name === formData.icon)?.icon || Target;
                        return <IconComponent className="w-6 h-6" style={{ color: formData.color }} />;
                      })()}
                    </div>
                    <div>
                      <p className="font-medium">{formData.name || 'Your Habit'}</p>
                      <p className="text-sm text-muted-foreground">
                        {formData.category} • {formData.difficulty} • {formData.frequency}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => step > 1 ? setStep(step - 1) : onOpenChange(false)}
            >
              {step > 1 ? 'Back' : 'Cancel'}
            </Button>
            <Button
              onClick={() => step < 4 ? setStep(step + 1) : handleSubmit()}
              disabled={!canProceed()}
            >
              {step < 4 ? 'Next' : 'Create Habit'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
