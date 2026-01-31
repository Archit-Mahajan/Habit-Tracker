import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { Textarea } from '@/components/ui/textarea';
import { useHabits } from '@/context/HabitContext';
import type { Category, GoalType } from '@/types';
import { 
  Target, 
  Calendar, 
  TrendingUp, 
  Heart, 
  Brain, 
  Dumbbell, 
  BookOpen, 
  Briefcase, 
  Zap,
  MoreHorizontal,
  Plus,
  X
} from 'lucide-react';

interface GoalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categories: { value: Category; label: string; icon: React.ElementType }[] = [
  { value: 'Health', label: 'Health', icon: Heart },
  { value: 'Fitness', label: 'Fitness', icon: Dumbbell },
  { value: 'Study', label: 'Study', icon: BookOpen },
  { value: 'Work', label: 'Work', icon: Briefcase },
  { value: 'Mental Health', label: 'Mental Health', icon: Brain },
  { value: 'Productivity', label: 'Productivity', icon: Zap },
  { value: 'Other', label: 'Other', icon: MoreHorizontal },
];

const goalTypes: { value: GoalType; label: string; icon: React.ElementType }[] = [
  { value: 'Monthly', label: 'Monthly Goal', icon: Calendar },
  { value: 'Yearly', label: 'Yearly Goal', icon: TrendingUp },
];

export function GoalForm({ open, onOpenChange }: GoalFormProps) {
  const { addGoal } = useHabits();
  const [step, setStep] = useState(1);
  const [milestones, setMilestones] = useState<string[]>(['']);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Monthly' as GoalType,
    targetValue: 30,
    unit: 'days',
    category: 'Health' as Category,
    deadline: new Date(new Date().setMonth(new Date().getMonth() + 1)),
  });

  const resetForm = () => {
    setStep(1);
    setMilestones(['']);
    setFormData({
      title: '',
      description: '',
      type: 'Monthly',
      targetValue: 30,
      unit: 'days',
      category: 'Health',
      deadline: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    });
  };

  const handleSubmit = () => {
    const validMilestones = milestones.filter(m => m.trim() !== '');
    
    const goalData = {
      title: formData.title,
      description: formData.description,
      type: formData.type,
      targetValue: formData.targetValue,
      unit: formData.unit,
      category: formData.category,
      deadline: formData.deadline,
      milestones: validMilestones,
    };
    addGoal(goalData as any);
    resetForm();
    onOpenChange(false);
  };

  const addMilestone = () => {
    setMilestones([...milestones, '']);
  };

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const updateMilestone = (index: number, value: string) => {
    const newMilestones = [...milestones];
    newMilestones[index] = value;
    setMilestones(newMilestones);
  };

  const canProceed = () => {
    switch (step) {
      case 1: return formData.title.trim().length > 0;
      case 2: return true;
      case 3: return formData.targetValue > 0 && formData.unit.trim().length > 0;
      default: return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open) resetForm(); onOpenChange(open); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Create New Goal
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
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
                {s < 3 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
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
                  <Label htmlFor="title">Goal Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Read 12 books this year..."
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Add details about your goal..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1.5"
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Goal Type</Label>
                  <div className="flex gap-2 mt-1.5">
                    {goalTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setFormData({ ...formData, type: type.value })}
                        className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
                          formData.type === type.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <type.icon className="w-4 h-4" />
                        <span className="text-sm">{type.label}</span>
                      </button>
                    ))}
                  </div>
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
                        <cat.icon className="w-4 h-4" />
                        <span className="text-sm">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Target & Deadline */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="targetValue">Target Value</Label>
                    <Input
                      id="targetValue"
                      type="number"
                      min={1}
                      value={formData.targetValue}
                      onChange={(e) => setFormData({ ...formData, targetValue: parseInt(e.target.value) || 0 })}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit">Unit</Label>
                    <Input
                      id="unit"
                      placeholder="e.g., days, books, km"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline.toISOString().split('T')[0]}
                    onChange={(e) => setFormData({ ...formData, deadline: new Date(e.target.value) })}
                    className="mt-1.5"
                  />
                </div>

                {/* Milestones */}
                <div>
                  <div className="flex items-center justify-between">
                    <Label>Milestones (Optional)</Label>
                    <Button type="button" variant="ghost" size="sm" onClick={addMilestone}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  <div className="space-y-2 mt-1.5">
                    {milestones.map((milestone, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder={`Milestone ${index + 1}`}
                          value={milestone}
                          onChange={(e) => updateMilestone(index, e.target.value)}
                        />
                        {milestones.length > 1 && (
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon"
                            onClick={() => removeMilestone(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="p-4 rounded-lg border bg-card">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Goal Preview</Label>
                  
                  <div className="mt-3 space-y-3">
                    <div>
                      <span className="text-sm text-muted-foreground">Title</span>
                      <p className="font-medium">{formData.title}</p>
                    </div>
                    
                    {formData.description && (
                      <div>
                        <span className="text-sm text-muted-foreground">Description</span>
                        <p className="text-sm">{formData.description}</p>
                      </div>
                    )}
                    
                    <div className="flex gap-4">
                      <div>
                        <span className="text-sm text-muted-foreground">Type</span>
                        <p className="font-medium">{formData.type}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Category</span>
                        <p className="font-medium">{formData.category}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <div>
                        <span className="text-sm text-muted-foreground">Target</span>
                        <p className="font-medium">{formData.targetValue} {formData.unit}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Deadline</span>
                        <p className="font-medium">{formData.deadline.toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    {milestones.filter(m => m.trim()).length > 0 && (
                      <div>
                        <span className="text-sm text-muted-foreground">Milestones</span>
                        <ul className="mt-1 space-y-1">
                          {milestones.filter(m => m.trim()).map((m, i) => (
                            <li key={i} className="text-sm flex items-center gap-2">
                              <Target className="w-3 h-3 text-primary" />
                              {m}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
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
              onClick={() => step < 3 ? setStep(step + 1) : handleSubmit()}
              disabled={!canProceed()}
            >
              {step < 3 ? 'Next' : 'Create Goal'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
