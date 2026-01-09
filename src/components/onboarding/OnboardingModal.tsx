import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useProfile } from '@/hooks/useProfile';
import { useGoals } from '@/hooks/useGoals';
import { useHabits } from '@/hooks/useHabits';
import { useTasks } from '@/hooks/useTasks';
import { Target, Repeat, CheckSquare, ArrowRight, Sparkles } from 'lucide-react';

interface OnboardingModalProps {
  open: boolean;
  onComplete: () => void;
}

type Step = 'welcome' | 'goal' | 'habits' | 'tasks' | 'complete';

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ open, onComplete }) => {
  const { updateProfile } = useProfile();
  const { createGoal } = useGoals();
  const { createHabit } = useHabits();
  const { createTask } = useTasks();
  
  const [step, setStep] = useState<Step>('welcome');
  const [displayName, setDisplayName] = useState('');
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [habits, setHabits] = useState(['', '', '']);
  const [tasks, setTasks] = useState(['', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      // Update profile
      await updateProfile.mutateAsync({ 
        display_name: displayName || 'User',
        onboarding_completed: true 
      });

      // Create goal if provided
      let goalId: string | undefined;
      if (goalTitle) {
        const goal = await createGoal.mutateAsync({
          title: goalTitle,
          description: goalDescription || null,
          target_date: null,
          status: 'active',
        });
        goalId = goal.id;
      }

      // Create habits
      for (const habitName of habits.filter(h => h.trim())) {
        await createHabit.mutateAsync({
          name: habitName,
          goal_id: goalId || null,
          difficulty: 3,
          frequency_type: 'daily',
          weekly_target: 5,
          days_of_week: [0, 1, 2, 3, 4, 5, 6],
          is_active: true,
        });
      }

      // Create tasks
      for (const taskTitle of tasks.filter(t => t.trim())) {
        await createTask.mutateAsync({
          title: taskTitle,
          description: null,
          goal_id: goalId || null,
          due_date: new Date().toISOString().split('T')[0],
          priority: 'medium',
          status: 'todo',
        });
      }

      setStep('complete');
      setTimeout(onComplete, 1500);
    } catch (error) {
      console.error('Onboarding error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'welcome':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto gradient-primary rounded-full flex items-center justify-center shadow-glow">
                <Sparkles className="h-10 w-10 text-primary-foreground" />
              </div>
              <h2 className="font-display text-2xl font-bold">Welcome to Goal Assister!</h2>
              <p className="text-muted-foreground">
                Let's set you up for success. We'll create your first goal, habits, and tasks.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">What should we call you?</Label>
                <Input
                  id="displayName"
                  placeholder="Your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
            </div>

            <Button 
              className="w-full gradient-primary"
              onClick={() => setStep('goal')}
            >
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        );

      case 'goal':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold">Set Your First Goal</h2>
                <p className="text-sm text-muted-foreground">What do you want to achieve?</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="goalTitle">Goal Title</Label>
                <Input
                  id="goalTitle"
                  placeholder="e.g., Get fit, Learn a new skill, Build a habit"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goalDescription">Description (optional)</Label>
                <Textarea
                  id="goalDescription"
                  placeholder="Why is this goal important to you?"
                  value={goalDescription}
                  onChange={(e) => setGoalDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('welcome')} className="flex-1">
                Back
              </Button>
              <Button 
                className="flex-1 gradient-primary"
                onClick={() => setStep('habits')}
              >
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        );

      case 'habits':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                <Repeat className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold">Daily Habits</h2>
                <p className="text-sm text-muted-foreground">Add up to 3 habits to track daily</p>
              </div>
            </div>

            <div className="space-y-3">
              {habits.map((habit, index) => (
                <Input
                  key={index}
                  placeholder={`Habit ${index + 1} (e.g., Exercise, Read, Meditate)`}
                  value={habit}
                  onChange={(e) => {
                    const newHabits = [...habits];
                    newHabits[index] = e.target.value;
                    setHabits(newHabits);
                  }}
                />
              ))}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('goal')} className="flex-1">
                Back
              </Button>
              <Button 
                className="flex-1 gradient-primary"
                onClick={() => setStep('tasks')}
              >
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        );

      case 'tasks':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                <CheckSquare className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold">Today's Tasks</h2>
                <p className="text-sm text-muted-foreground">What do you want to accomplish today?</p>
              </div>
            </div>

            <div className="space-y-3">
              {tasks.map((task, index) => (
                <Input
                  key={index}
                  placeholder={`Task ${index + 1}`}
                  value={task}
                  onChange={(e) => {
                    const newTasks = [...tasks];
                    newTasks[index] = e.target.value;
                    setTasks(newTasks);
                  }}
                />
              ))}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('habits')} className="flex-1">
                Back
              </Button>
              <Button 
                className="flex-1 gradient-primary"
                onClick={handleComplete}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Setting up...' : 'Complete Setup'}
              </Button>
            </div>
          </motion.div>
        );

      case 'complete':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4 py-8"
          >
            <div className="w-20 h-20 mx-auto gradient-accent rounded-full flex items-center justify-center shadow-glow-accent">
              <Sparkles className="h-10 w-10 text-accent-foreground" />
            </div>
            <h2 className="font-display text-2xl font-bold">You're All Set!</h2>
            <p className="text-muted-foreground">
              Let's start building better habits and achieving your goals.
            </p>
          </motion.div>
        );
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="sr-only">Onboarding</DialogTitle>
        </DialogHeader>
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
