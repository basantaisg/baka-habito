export const POMODORO_PRESETS = {
  standard: { focus: 25, shortBreak: 5, longBreak: 15 },
  extended: { focus: 50, shortBreak: 10, longBreak: 20 },
  custom: { focus: 25, shortBreak: 5, longBreak: 15 },
} as const;

export const DAYS_OF_WEEK = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
] as const;

export const DIFFICULTY_LABELS = {
  1: 'Very Easy',
  2: 'Easy',
  3: 'Medium',
  4: 'Hard',
  5: 'Very Hard',
} as const;

export const PRIORITY_COLORS = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-warning/20 text-warning',
  high: 'bg-destructive/20 text-destructive',
} as const;

export const STATUS_COLORS = {
  todo: 'bg-muted text-muted-foreground',
  doing: 'bg-primary/20 text-primary',
  done: 'bg-success/20 text-success',
} as const;

export const GOAL_STATUS_COLORS = {
  active: 'bg-primary/20 text-primary',
  paused: 'bg-warning/20 text-warning',
  completed: 'bg-success/20 text-success',
} as const;
