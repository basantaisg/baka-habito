import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Habit {
  id: string;
  user_id: string;
  goal_id: string | null;
  name: string;
  difficulty: number;
  frequency_type: 'daily' | 'weekly';
  weekly_target: number;
  days_of_week: number[];
  is_active: boolean;
  created_at: string;
}

export interface HabitLog {
  id: string;
  user_id: string;
  habit_id: string;
  log_date: string;
  completed: boolean;
  created_at: string;
}

export const useHabits = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: habits = [], isLoading } = useQuery({
    queryKey: ['habits', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Habit[];
    },
    enabled: !!user,
  });

  const { data: todayLogs = [] } = useQuery({
    queryKey: ['habit-logs', user?.id, new Date().toISOString().split('T')[0]],
    queryFn: async () => {
      if (!user) return [];
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('log_date', today);
      
      if (error) throw error;
      return data as HabitLog[];
    },
    enabled: !!user,
  });

  const createHabit = useMutation({
    mutationFn: async (habit: Omit<Habit, 'id' | 'user_id' | 'created_at'>) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('habits')
        .insert({ ...habit, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      toast({ title: 'Habit created!' });
    },
    onError: (error) => {
      toast({ title: 'Failed to create habit', description: error.message, variant: 'destructive' });
    },
  });

  const updateHabit = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Habit> & { id: string }) => {
      const { data, error } = await supabase
        .from('habits')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      toast({ title: 'Habit updated!' });
    },
    onError: (error) => {
      toast({ title: 'Failed to update habit', description: error.message, variant: 'destructive' });
    },
  });

  const deleteHabit = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      toast({ title: 'Habit deleted' });
    },
    onError: (error) => {
      toast({ title: 'Failed to delete habit', description: error.message, variant: 'destructive' });
    },
  });

  const logHabit = useMutation({
    mutationFn: async (habitId: string) => {
      if (!user) throw new Error('Not authenticated');
      const today = new Date().toISOString().split('T')[0];
      
      // Check if already logged
      const existingLog = todayLogs.find(log => log.habit_id === habitId);
      
      if (existingLog) {
        // Toggle completion
        const { error } = await supabase
          .from('habit_logs')
          .delete()
          .eq('id', existingLog.id);
        if (error) throw error;
      } else {
        // Create new log
        const { error } = await supabase
          .from('habit_logs')
          .insert({ habit_id: habitId, user_id: user.id, log_date: today, completed: true });
        if (error) throw error;
      }
      
      // Recalculate daily score
      await supabase.rpc('calculate_daily_score', { p_user_id: user.id, p_date: today });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habit-logs'] });
      queryClient.invalidateQueries({ queryKey: ['daily-score'] });
      toast({ title: 'Habit logged!' });
    },
    onError: (error) => {
      toast({ title: 'Failed to log habit', description: error.message, variant: 'destructive' });
    },
  });

  // Get habits due today
  const today = new Date().getDay();
  const habitsDueToday = habits.filter(habit => 
    habit.is_active && habit.days_of_week.includes(today)
  );

  return { 
    habits, 
    habitsDueToday,
    todayLogs, 
    isLoading, 
    createHabit, 
    updateHabit, 
    deleteHabit,
    logHabit 
  };
};
