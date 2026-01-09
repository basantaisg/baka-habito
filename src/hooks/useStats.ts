import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface DailyScore {
  id: string;
  user_id: string;
  score_date: string;
  habit_points: number;
  task_points: number;
  focus_points: number;
  total_points: number;
  created_at: string;
}

export interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  lifetime_points: number;
  weekly_points: number;
}

export const useStats = () => {
  const { user } = useAuth();

  const { data: dailyScores = [], isLoading: scoresLoading } = useQuery({
    queryKey: ['daily-scores', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data, error } = await supabase
        .from('score_daily')
        .select('*')
        .eq('user_id', user.id)
        .gte('score_date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('score_date', { ascending: true });
      
      if (error) throw error;
      return data as DailyScore[];
    },
    enabled: !!user,
  });

  const { data: todayScore } = useQuery({
    queryKey: ['daily-score', user?.id, new Date().toISOString().split('T')[0]],
    queryFn: async () => {
      if (!user) return null;
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('score_daily')
        .select('*')
        .eq('user_id', user.id)
        .eq('score_date', today)
        .maybeSingle();
      
      if (error) throw error;
      return data as DailyScore | null;
    },
    enabled: !!user,
  });

  const { data: leaderboard = [], isLoading: leaderboardLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_leaderboard');
      if (error) throw error;
      return data as LeaderboardEntry[];
    },
  });

  // Calculate streak
  const calculateStreak = () => {
    if (dailyScores.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      const score = dailyScores.find(s => s.score_date === dateStr);
      if (score && score.total_points > 0) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    
    return streak;
  };

  const lifetimePoints = dailyScores.reduce((acc, s) => acc + s.total_points, 0);
  const weeklyPoints = dailyScores
    .filter(s => {
      const scoreDate = new Date(s.score_date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return scoreDate >= weekAgo;
    })
    .reduce((acc, s) => acc + s.total_points, 0);

  return { 
    dailyScores,
    todayScore,
    leaderboard,
    lifetimePoints,
    weeklyPoints,
    streak: calculateStreak(),
    scoresLoading,
    leaderboardLoading
  };
};
