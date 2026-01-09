import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTasks, Task } from '@/hooks/useTasks';
import { PRIORITY_COLORS, STATUS_COLORS } from '@/lib/constants';
import { Plus, CheckSquare, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Tasks() {
  const { tasks, createTask, updateTask, deleteTask } = useTasks();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');

  const handleCreate = async () => {
    await createTask.mutateAsync({ title, description: null, goal_id: null, due_date: new Date().toISOString().split('T')[0], priority: 'medium', status: 'todo' });
    setTitle(''); setOpen(false);
  };

  const todoTasks = tasks.filter(t => t.status === 'todo');
  const doingTasks = tasks.filter(t => t.status === 'doing');
  const doneTasks = tasks.filter(t => t.status === 'done').slice(0, 10);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-display text-3xl font-bold">Tasks</h1>
            <p className="text-muted-foreground">Manage your to-dos</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary"><Plus className="mr-2 h-4 w-4" /> New Task</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Task</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} />
                <Button className="w-full" onClick={handleCreate} disabled={!title}>Create Task</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {tasks.length === 0 ? (
          <Card><CardContent className="p-12 text-center text-muted-foreground">
            <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No tasks yet. Create your first task!</p>
          </CardContent></Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {[{ title: 'To Do', tasks: todoTasks, status: 'todo' }, { title: 'Doing', tasks: doingTasks, status: 'doing' }, { title: 'Done', tasks: doneTasks, status: 'done' }].map(col => (
              <div key={col.status}>
                <h3 className={cn('font-semibold mb-3 px-2 py-1 rounded inline-block', STATUS_COLORS[col.status as keyof typeof STATUS_COLORS])}>{col.title} ({col.tasks.length})</h3>
                <div className="space-y-2">
                  {col.tasks.map(task => (
                    <Card key={task.id}>
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className={task.status === 'done' ? 'line-through text-muted-foreground' : ''}>{task.title}</p>
                            <span className={cn('text-xs px-2 py-0.5 rounded', PRIORITY_COLORS[task.priority])}>{task.priority}</span>
                          </div>
                          <div className="flex gap-1">
                            {task.status !== 'done' && (
                              <Button size="sm" variant="ghost" onClick={() => updateTask.mutate({ id: task.id, status: task.status === 'todo' ? 'doing' : 'done' })}>
                                {task.status === 'todo' ? 'Start' : 'Done'}
                              </Button>
                            )}
                            <Button size="icon" variant="ghost" onClick={() => deleteTask.mutate(task.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
