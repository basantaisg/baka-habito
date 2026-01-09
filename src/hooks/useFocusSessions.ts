import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface FocusSession {
  id: string;
  user_id: string;
  goal_id: string | null;
  task_id: string | null;
  habit_id: string | null;
  started_at: string;
  ended_at: string;
  focus_minutes: number;
  break_minutes: number;
  session_type: 'focus' | 'short_break' | 'long_break';
  created_at: string;
}

export const useFocusSessions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['focus-sessions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('focus_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data as FocusSession[];
    },
    enabled: !!user,
  });

  const createSession = useMutation({
    mutationFn: async (session: Omit<FocusSession, 'id' | 'user_id' | 'created_at'>) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('focus_sessions')
        .insert({ ...session, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      
      // Recalculate daily score
      const today = new Date().toISOString().split('T')[0];
      await supabase.rpc('calculate_daily_score', { p_user_id: user.id, p_date: today });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['focus-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['daily-score'] });
      toast({ title: 'Focus session recorded!' });
    },
    onError: (error) => {
      toast({ title: 'Failed to record session', description: error.message, variant: 'destructive' });
    },
  });

  // Get today's focus stats
  const today = new Date().toISOString().split('T')[0];
  const todaySessions = sessions.filter(s => 
    s.started_at.startsWith(today) && s.session_type === 'focus'
  );
  const todayFocusMinutes = todaySessions.reduce((acc, s) => acc + s.focus_minutes, 0);
  const todaySessionCount = todaySessions.length;

  return { 
    sessions, 
    isLoading, 
    createSession,
    todayFocusMinutes,
    todaySessionCount
  };
};
