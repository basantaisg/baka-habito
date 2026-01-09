import { useState, useEffect, useCallback, useRef } from 'react';
import { POMODORO_PRESETS } from '@/lib/constants';
import { useFocusSessions } from './useFocusSessions';

type SessionType = 'focus' | 'short_break' | 'long_break';
type PresetType = 'standard' | 'extended' | 'custom';

interface PomodoroState {
  isRunning: boolean;
  sessionType: SessionType;
  timeRemaining: number;
  completedPomodoros: number;
  preset: PresetType;
  customTimes: { focus: number; shortBreak: number; longBreak: number };
  startedAt: Date | null;
  linkedGoalId: string | null;
  linkedTaskId: string | null;
  linkedHabitId: string | null;
}

const STORAGE_KEY = 'pomodoro-state';

const loadState = (): PomodoroState | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const state = JSON.parse(saved);
      state.startedAt = state.startedAt ? new Date(state.startedAt) : null;
      return state;
    }
  } catch (e) {
    console.error('Failed to load pomodoro state:', e);
  }
  return null;
};

const saveState = (state: PomodoroState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save pomodoro state:', e);
  }
};

export const usePomodoro = () => {
  const { createSession } = useFocusSessions();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const getDefaultState = (): PomodoroState => ({
    isRunning: false,
    sessionType: 'focus',
    timeRemaining: POMODORO_PRESETS.standard.focus * 60,
    completedPomodoros: 0,
    preset: 'standard',
    customTimes: { focus: 25, shortBreak: 5, longBreak: 15 },
    startedAt: null,
    linkedGoalId: null,
    linkedTaskId: null,
    linkedHabitId: null,
  });

  const [state, setState] = useState<PomodoroState>(() => {
    const saved = loadState();
    if (saved) {
      // Recalculate time if was running
      if (saved.isRunning && saved.startedAt) {
        const elapsed = Math.floor((Date.now() - new Date(saved.startedAt).getTime()) / 1000);
        const remaining = Math.max(0, saved.timeRemaining - elapsed);
        return { ...saved, timeRemaining: remaining };
      }
      return saved;
    }
    return getDefaultState();
  });

  // Save state whenever it changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (state.isRunning && state.timeRemaining > 0) {
      interval = setInterval(() => {
        setState(prev => ({
          ...prev,
          timeRemaining: Math.max(0, prev.timeRemaining - 1),
        }));
      }, 1000);
    } else if (state.timeRemaining === 0 && state.isRunning) {
      // Session complete
      handleSessionComplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.isRunning, state.timeRemaining]);

  const playSound = useCallback(() => {
    if (soundEnabled) {
      // Create a simple beep sound using Web Audio API
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.3;
        
        oscillator.start();
        setTimeout(() => oscillator.stop(), 200);
      } catch (e) {
        console.error('Failed to play sound:', e);
      }
    }
  }, [soundEnabled]);

  const handleSessionComplete = async () => {
    playSound();
    
    const preset = state.preset === 'custom' ? state.customTimes : POMODORO_PRESETS[state.preset];
    
    if (state.sessionType === 'focus' && state.startedAt) {
      // Record the focus session
      await createSession.mutateAsync({
        started_at: state.startedAt.toISOString(),
        ended_at: new Date().toISOString(),
        focus_minutes: Math.round((Date.now() - state.startedAt.getTime()) / 60000),
        break_minutes: 0,
        session_type: 'focus',
        goal_id: state.linkedGoalId,
        task_id: state.linkedTaskId,
        habit_id: state.linkedHabitId,
      });

      const newCompletedPomodoros = state.completedPomodoros + 1;
      const nextSessionType: SessionType = 
        newCompletedPomodoros % 4 === 0 ? 'long_break' : 'short_break';
      const nextTime = nextSessionType === 'long_break' 
        ? preset.longBreak * 60 
        : preset.shortBreak * 60;

      setState(prev => ({
        ...prev,
        isRunning: false,
        sessionType: nextSessionType,
        timeRemaining: nextTime,
        completedPomodoros: newCompletedPomodoros,
        startedAt: null,
      }));
    } else {
      // Break complete, start new focus
      setState(prev => ({
        ...prev,
        isRunning: false,
        sessionType: 'focus',
        timeRemaining: preset.focus * 60,
        startedAt: null,
      }));
    }
  };

  const start = useCallback(() => {
    setState(prev => ({
      ...prev,
      isRunning: true,
      startedAt: prev.startedAt || new Date(),
    }));
  }, []);

  const pause = useCallback(() => {
    setState(prev => ({
      ...prev,
      isRunning: false,
    }));
  }, []);

  const reset = useCallback(() => {
    const preset = state.preset === 'custom' ? state.customTimes : POMODORO_PRESETS[state.preset];
    let time: number;
    
    switch (state.sessionType) {
      case 'focus':
        time = preset.focus * 60;
        break;
      case 'short_break':
        time = preset.shortBreak * 60;
        break;
      case 'long_break':
        time = preset.longBreak * 60;
        break;
    }

    setState(prev => ({
      ...prev,
      isRunning: false,
      timeRemaining: time,
      startedAt: null,
    }));
  }, [state.preset, state.customTimes, state.sessionType]);

  const skipToNext = useCallback(() => {
    const preset = state.preset === 'custom' ? state.customTimes : POMODORO_PRESETS[state.preset];
    
    if (state.sessionType === 'focus') {
      const nextSessionType: SessionType = 
        (state.completedPomodoros + 1) % 4 === 0 ? 'long_break' : 'short_break';
      const nextTime = nextSessionType === 'long_break' 
        ? preset.longBreak * 60 
        : preset.shortBreak * 60;

      setState(prev => ({
        ...prev,
        isRunning: false,
        sessionType: nextSessionType,
        timeRemaining: nextTime,
        completedPomodoros: prev.completedPomodoros + 1,
        startedAt: null,
      }));
    } else {
      setState(prev => ({
        ...prev,
        isRunning: false,
        sessionType: 'focus',
        timeRemaining: preset.focus * 60,
        startedAt: null,
      }));
    }
  }, [state.preset, state.customTimes, state.sessionType, state.completedPomodoros]);

  const setPreset = useCallback((preset: PresetType) => {
    const times = preset === 'custom' ? state.customTimes : POMODORO_PRESETS[preset];
    setState(prev => ({
      ...prev,
      preset,
      timeRemaining: times.focus * 60,
      sessionType: 'focus',
      isRunning: false,
      startedAt: null,
    }));
  }, [state.customTimes]);

  const setCustomTimes = useCallback((times: { focus: number; shortBreak: number; longBreak: number }) => {
    setState(prev => ({
      ...prev,
      customTimes: times,
      timeRemaining: times.focus * 60,
      sessionType: 'focus',
      isRunning: false,
      startedAt: null,
    }));
  }, []);

  const setLinkedItems = useCallback((goalId: string | null, taskId: string | null, habitId: string | null) => {
    setState(prev => ({
      ...prev,
      linkedGoalId: goalId,
      linkedTaskId: taskId,
      linkedHabitId: habitId,
    }));
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = (): number => {
    const preset = state.preset === 'custom' ? state.customTimes : POMODORO_PRESETS[state.preset];
    let totalTime: number;
    
    switch (state.sessionType) {
      case 'focus':
        totalTime = preset.focus * 60;
        break;
      case 'short_break':
        totalTime = preset.shortBreak * 60;
        break;
      case 'long_break':
        totalTime = preset.longBreak * 60;
        break;
    }

    return ((totalTime - state.timeRemaining) / totalTime) * 100;
  };

  return {
    ...state,
    start,
    pause,
    reset,
    skipToNext,
    setPreset,
    setCustomTimes,
    setLinkedItems,
    formatTime: () => formatTime(state.timeRemaining),
    getProgress,
    soundEnabled,
    setSoundEnabled,
  };
};
