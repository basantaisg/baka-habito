-- Create app_role enum for potential future use
CREATE TYPE public.goal_status AS ENUM ('active', 'paused', 'completed');
CREATE TYPE public.task_status AS ENUM ('todo', 'doing', 'done');
CREATE TYPE public.task_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE public.frequency_type AS ENUM ('daily', 'weekly');
CREATE TYPE public.session_type AS ENUM ('focus', 'short_break', 'long_break');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  timezone TEXT DEFAULT 'Asia/Kolkata',
  strict_mode BOOLEAN DEFAULT FALSE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goals table
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  status goal_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habits table
CREATE TABLE public.habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  difficulty INT DEFAULT 3 CHECK (difficulty BETWEEN 1 AND 5),
  frequency_type frequency_type DEFAULT 'daily',
  weekly_target INT DEFAULT 5 CHECK (weekly_target BETWEEN 1 AND 7),
  days_of_week INT[] DEFAULT '{0,1,2,3,4,5,6}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habit logs table
CREATE TABLE public.habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  habit_id UUID REFERENCES public.habits(id) ON DELETE CASCADE NOT NULL,
  log_date DATE NOT NULL,
  completed BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (habit_id, log_date)
);

-- Tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  priority task_priority DEFAULT 'medium',
  status task_status DEFAULT 'todo',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Focus sessions table
CREATE TABLE public.focus_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  habit_id UUID REFERENCES public.habits(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ NOT NULL,
  focus_minutes INT NOT NULL,
  break_minutes INT DEFAULT 0,
  session_type session_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily check-ins table
CREATE TABLE public.daily_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  checkin_date DATE NOT NULL,
  top_priorities TEXT[] DEFAULT '{}',
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, checkin_date)
);

-- Daily scores table
CREATE TABLE public.score_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  score_date DATE NOT NULL,
  habit_points INT DEFAULT 0,
  task_points INT DEFAULT 0,
  focus_points INT DEFAULT 0,
  total_points INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, score_date)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.score_daily ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Goals policies
CREATE POLICY "Users can view own goals" ON public.goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own goals" ON public.goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON public.goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals" ON public.goals FOR DELETE USING (auth.uid() = user_id);

-- Habits policies
CREATE POLICY "Users can view own habits" ON public.habits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own habits" ON public.habits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own habits" ON public.habits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own habits" ON public.habits FOR DELETE USING (auth.uid() = user_id);

-- Habit logs policies
CREATE POLICY "Users can view own habit logs" ON public.habit_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own habit logs" ON public.habit_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own habit logs" ON public.habit_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own habit logs" ON public.habit_logs FOR DELETE USING (auth.uid() = user_id);

-- Tasks policies
CREATE POLICY "Users can view own tasks" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

-- Focus sessions policies
CREATE POLICY "Users can view own focus sessions" ON public.focus_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own focus sessions" ON public.focus_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own focus sessions" ON public.focus_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own focus sessions" ON public.focus_sessions FOR DELETE USING (auth.uid() = user_id);

-- Daily check-ins policies
CREATE POLICY "Users can view own checkins" ON public.daily_checkins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own checkins" ON public.daily_checkins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own checkins" ON public.daily_checkins FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own checkins" ON public.daily_checkins FOR DELETE USING (auth.uid() = user_id);

-- Score daily policies (users can only view/insert/update their own, but we need public read for leaderboard)
CREATE POLICY "Users can view own scores" ON public.score_daily FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scores" ON public.score_daily FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own scores" ON public.score_daily FOR UPDATE USING (auth.uid() = user_id);

-- Create a view for leaderboard (public access to aggregated data)
CREATE OR REPLACE VIEW public.leaderboard_view AS
SELECT 
  p.id as user_id,
  p.display_name,
  COALESCE(SUM(s.total_points), 0) as lifetime_points,
  COALESCE(SUM(CASE WHEN s.score_date >= CURRENT_DATE - INTERVAL '7 days' THEN s.total_points ELSE 0 END), 0) as weekly_points
FROM public.profiles p
LEFT JOIN public.score_daily s ON p.id = s.user_id
WHERE p.display_name IS NOT NULL
GROUP BY p.id, p.display_name;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to calculate and update daily score
CREATE OR REPLACE FUNCTION public.calculate_daily_score(p_user_id UUID, p_date DATE)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_habit_points INT := 0;
  v_task_points INT := 0;
  v_focus_points INT := 0;
  v_total_points INT := 0;
BEGIN
  -- Calculate habit points (10 * difficulty for each completed habit)
  SELECT COALESCE(SUM(h.difficulty * 10), 0) INTO v_habit_points
  FROM habit_logs hl
  JOIN habits h ON hl.habit_id = h.id
  WHERE hl.user_id = p_user_id 
    AND hl.log_date = p_date 
    AND hl.completed = TRUE;

  -- Calculate task points (15 for each task completed today)
  SELECT COALESCE(COUNT(*) * 15, 0) INTO v_task_points
  FROM tasks
  WHERE user_id = p_user_id 
    AND DATE(completed_at) = p_date;

  -- Calculate focus points (1 point per 5 focus minutes)
  SELECT COALESCE(SUM(focus_minutes) / 5, 0) INTO v_focus_points
  FROM focus_sessions
  WHERE user_id = p_user_id 
    AND DATE(started_at) = p_date 
    AND session_type = 'focus';

  v_total_points := v_habit_points + v_task_points + v_focus_points;

  -- Upsert the daily score
  INSERT INTO score_daily (user_id, score_date, habit_points, task_points, focus_points, total_points)
  VALUES (p_user_id, p_date, v_habit_points, v_task_points, v_focus_points, v_total_points)
  ON CONFLICT (user_id, score_date)
  DO UPDATE SET
    habit_points = EXCLUDED.habit_points,
    task_points = EXCLUDED.task_points,
    focus_points = EXCLUDED.focus_points,
    total_points = EXCLUDED.total_points;
END;
$$;