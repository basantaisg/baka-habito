import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';
import { useProfile } from '@/hooks/useProfile';
import { useHabits } from '@/hooks/useHabits';
import { useTasks } from '@/hooks/useTasks';
import { useStats } from '@/hooks/useStats';
import { useFocusSessions } from '@/hooks/useFocusSessions';
import { Timer, Target, CheckCircle2, Flame, Trophy, Repeat } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const { profile, isLoading: profileLoading } = useProfile();
  const { habitsDueToday, todayLogs, logHabit } = useHabits();
  const { tasksDueToday, overdueTasks, updateTask } = useTasks();
  const { todayScore, streak } = useStats();
  const { todayFocusMinutes, todaySessionCount } = useFocusSessions();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!profileLoading && profile && !profile.onboarding_completed) {
      setShowOnboarding(true);
    }
  }, [profile, profileLoading]);

  const stats = [
    { label: 'Today\'s Score', value: todayScore?.total_points || 0, icon: Trophy, color: 'text-accent' },
    { label: 'Current Streak', value: `${streak} days`, icon: Flame, color: 'text-destructive' },
    { label: 'Focus Time', value: `${todayFocusMinutes} min`, icon: Timer, color: 'text-primary' },
    { label: 'Sessions', value: todaySessionCount, icon: Target, color: 'text-success' },
  ];

  return (
    <AppLayout>
      <OnboardingModal open={showOnboarding} onComplete={() => setShowOnboarding(false)} />
      
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold">
            Welcome back{profile?.display_name ? `, ${profile.display_name}` : ''}!
          </h1>
          <p className="text-muted-foreground">Here's your productivity overview for today.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-muted ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Focus */}
        <Card className="gradient-primary text-primary-foreground">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <h3 className="font-display text-xl font-bold">Ready to Focus?</h3>
              <p className="opacity-80">Start a Pomodoro session to boost your productivity.</p>
            </div>
            <Link to="/focus">
              <Button size="lg" variant="secondary">
                <Timer className="mr-2 h-5 w-5" /> Start Focus
              </Button>
            </Link>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Habits Due Today */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Repeat className="h-5 w-5 text-primary" /> Habits Due Today
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {habitsDueToday.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No habits scheduled for today!</p>
              ) : (
                habitsDueToday.map(habit => {
                  const isCompleted = todayLogs.some(log => log.habit_id === habit.id);
                  return (
                    <div key={habit.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className={isCompleted ? 'line-through text-muted-foreground' : ''}>{habit.name}</span>
                      <Button size="sm" variant={isCompleted ? 'secondary' : 'default'} onClick={() => logHabit.mutate(habit.id)}>
                        {isCompleted ? 'Undo' : 'Complete'}
                      </Button>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Tasks Due Today */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" /> Tasks Due Today
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasksDueToday.length === 0 && overdueTasks.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">All caught up!</p>
              ) : (
                <>
                  {overdueTasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                      <div>
                        <span>{task.title}</span>
                        <p className="text-xs text-destructive">Overdue</p>
                      </div>
                      <Button size="sm" onClick={() => updateTask.mutate({ id: task.id, status: 'done' })}>Done</Button>
                    </div>
                  ))}
                  {tasksDueToday.map(task => (
                    <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span>{task.title}</span>
                      <Button size="sm" onClick={() => updateTask.mutate({ id: task.id, status: 'done' })}>Done</Button>
                    </div>
                  ))}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
