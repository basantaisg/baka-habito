import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStats } from '@/hooks/useStats';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Trophy, Flame, Target, Timer } from 'lucide-react';

export default function Stats() {
  const { dailyScores, lifetimePoints, weeklyPoints, streak } = useStats();

  const chartData = dailyScores.slice(-14).map(s => ({
    date: new Date(s.score_date).toLocaleDateString('en-US', { weekday: 'short' }),
    points: s.total_points,
    habits: s.habit_points,
    tasks: s.task_points,
    focus: s.focus_points,
  }));

  const stats = [
    { label: 'Lifetime Points', value: lifetimePoints, icon: Trophy, color: 'text-accent' },
    { label: 'Weekly Points', value: weeklyPoints, icon: Target, color: 'text-primary' },
    { label: 'Current Streak', value: `${streak} days`, icon: Flame, color: 'text-destructive' },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Statistics</h1>
          <p className="text-muted-foreground">Track your productivity over time</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {stats.map(stat => (
            <Card key={stat.label}>
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
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Points (Last 14 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="points" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
