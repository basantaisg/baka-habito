import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useHabits } from '@/hooks/useHabits';
import { Plus, Repeat, Trash2, CheckCircle2 } from 'lucide-react';

export default function Habits() {
  const { habits, habitsDueToday, todayLogs, createHabit, deleteHabit, logHabit } = useHabits();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');

  const handleCreate = async () => {
    await createHabit.mutateAsync({ name, goal_id: null, difficulty: 3, frequency_type: 'daily', weekly_target: 5, days_of_week: [0,1,2,3,4,5,6], is_active: true });
    setName(''); setOpen(false);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-display text-3xl font-bold">Habits</h1>
            <p className="text-muted-foreground">Build consistency with daily habits</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary"><Plus className="mr-2 h-4 w-4" /> New Habit</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Habit</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Habit name" value={name} onChange={(e) => setName(e.target.value)} />
                <Button className="w-full" onClick={handleCreate} disabled={!name}>Create Habit</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {habitsDueToday.length > 0 && (
          <Card className="border-primary">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-primary" /> Due Today</h3>
              <div className="space-y-2">
                {habitsDueToday.map(habit => {
                  const isCompleted = todayLogs.some(log => log.habit_id === habit.id);
                  return (
                    <div key={habit.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className={isCompleted ? 'line-through text-muted-foreground' : ''}>{habit.name}</span>
                      <Button size="sm" variant={isCompleted ? 'secondary' : 'default'} onClick={() => logHabit.mutate(habit.id)}>
                        {isCompleted ? 'Undo' : 'Complete'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {habits.length === 0 ? (
          <Card><CardContent className="p-12 text-center text-muted-foreground">
            <Repeat className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No habits yet. Create your first habit!</p>
          </CardContent></Card>
        ) : (
          <div className="grid gap-3">
            {habits.map(habit => (
              <Card key={habit.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{habit.name}</h3>
                    <p className="text-sm text-muted-foreground">Difficulty: {habit.difficulty}/5</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteHabit.mutate(habit.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
