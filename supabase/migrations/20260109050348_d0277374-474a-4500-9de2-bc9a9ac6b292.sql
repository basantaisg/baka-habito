-- Fix the security definer view issue by using a function instead
DROP VIEW IF EXISTS public.leaderboard_view;

-- Create a security definer function to get leaderboard data
CREATE OR REPLACE FUNCTION public.get_leaderboard()
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  lifetime_points BIGINT,
  weekly_points BIGINT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id as user_id,
    p.display_name,
    COALESCE(SUM(s.total_points), 0)::BIGINT as lifetime_points,
    COALESCE(SUM(CASE WHEN s.score_date >= CURRENT_DATE - INTERVAL '7 days' THEN s.total_points ELSE 0 END), 0)::BIGINT as weekly_points
  FROM public.profiles p
  LEFT JOIN public.score_daily s ON p.id = s.user_id
  WHERE p.display_name IS NOT NULL
  GROUP BY p.id, p.display_name
  ORDER BY lifetime_points DESC;
$$;