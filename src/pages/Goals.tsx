import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGoals, Goal } from '@/hooks/useGoals';
import { GOAL_STATUS_COLORS } from '@/lib/constants';
import { Plus, Target, Trash2 } from 'lucide-react';

export default function Goals() {
  const { goals, createGoal, updateGoal, deleteGoal } = useGoals();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = async () => {
    await createGoal.mutateAsync({ title, description: description || null, target_date: null, status: 'active' });
    setTitle(''); setDescription(''); setOpen(false);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-display text-3xl font-bold">Goals</h1>
            <p className="text-muted-foreground">Track your long-term objectives</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary"><Plus className="mr-2 h-4 w-4" /> New Goal</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Goal</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Goal title" value={title} onChange={(e) => setTitle(e.target.value)} />
                <Textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
                <Button className="w-full" onClick={handleCreate} disabled={!title}>Create Goal</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {goals.length === 0 ? (
          <Card><CardContent className="p-12 text-center text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No goals yet. Create your first goal to get started!</p>
          </CardContent></Card>
        ) : (
          <div className="grid gap-4">
            {goals.map(goal => (
              <Card key={goal.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{goal.title}</h3>
                    {goal.description && <p className="text-sm text-muted-foreground">{goal.description}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <Select value={goal.status} onValueChange={(status: Goal['status']) => updateGoal.mutate({ id: goal.id, status })}>
                      <SelectTrigger className={`w-32 ${GOAL_STATUS_COLORS[goal.status]}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" onClick={() => deleteGoal.mutate(goal.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
