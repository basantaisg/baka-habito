import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStats } from '@/hooks/useStats';
import { useAuth } from '@/contexts/AuthContext';
import { Trophy, Medal, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Leaderboard() {
  const { leaderboard } = useStats();
  const { user } = useAuth();
  const [tab, setTab] = useState('lifetime');

  const sortedBoard = [...leaderboard].sort((a, b) => 
    tab === 'lifetime' ? b.lifetime_points - a.lifetime_points : b.weekly_points - a.weekly_points
  );

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return <span className="w-5 text-center text-muted-foreground">{rank}</span>;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Leaderboard</h1>
          <p className="text-muted-foreground">See how you rank against others</p>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="lifetime">All Time</TabsTrigger>
            <TabsTrigger value="weekly">This Week</TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>{tab === 'lifetime' ? 'All Time' : 'Weekly'} Rankings</CardTitle>
              </CardHeader>
              <CardContent>
                {sortedBoard.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No rankings yet. Start earning points!</p>
                ) : (
                  <div className="space-y-2">
                    {sortedBoard.map((entry, index) => {
                      const isCurrentUser = entry.user_id === user?.id;
                      const points = tab === 'lifetime' ? entry.lifetime_points : entry.weekly_points;
                      return (
                        <div
                          key={entry.user_id}
                          className={cn(
                            'flex items-center gap-4 p-3 rounded-lg',
                            isCurrentUser ? 'bg-primary/10 border border-primary' : 'bg-muted/50'
                          )}
                        >
                          <div className="flex items-center justify-center w-8">{getRankIcon(index + 1)}</div>
                          <div className="flex-1">
                            <span className="font-medium">{entry.display_name || 'Anonymous'}</span>
                            {isCurrentUser && <span className="ml-2 text-xs text-primary">(You)</span>}
                          </div>
                          <span className="font-bold">{points} pts</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
