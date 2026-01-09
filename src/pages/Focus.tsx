import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePomodoro } from '@/hooks/usePomodoro';
import { Play, Pause, RotateCcw, SkipForward, Volume2, VolumeX } from 'lucide-react';

export default function Focus() {
  const {
    isRunning, sessionType, timeRemaining, completedPomodoros, preset,
    start, pause, reset, skipToNext, setPreset, formatTime, getProgress,
    soundEnabled, setSoundEnabled
  } = usePomodoro();

  const sessionLabels = { focus: 'Focus Time', short_break: 'Short Break', long_break: 'Long Break' };
  const progress = getProgress();

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold">Pomodoro Timer</h1>
          <p className="text-muted-foreground">Stay focused and productive</p>
        </div>

        {/* Timer */}
        <Card className="overflow-hidden">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <p className="text-lg font-medium text-primary">{sessionLabels[sessionType]}</p>
              
              <div className="relative w-64 h-64 mx-auto">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="128" cy="128" r="120" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted" />
                  <circle
                    cx="128" cy="128" r="120" fill="none" stroke="currentColor" strokeWidth="8"
                    strokeDasharray="754" strokeDashoffset={754 - (754 * progress) / 100}
                    className="text-primary transition-all duration-1000"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-display text-6xl font-bold">{formatTime()}</span>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <Button size="lg" variant="outline" onClick={reset}><RotateCcw className="h-5 w-5" /></Button>
                <Button size="lg" className="gradient-primary w-32" onClick={isRunning ? pause : start}>
                  {isRunning ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </Button>
                <Button size="lg" variant="outline" onClick={skipToNext}><SkipForward className="h-5 w-5" /></Button>
              </div>

              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <span>Pomodoros completed: {completedPomodoros}</span>
                <Button variant="ghost" size="icon" onClick={() => setSoundEnabled(!soundEnabled)}>
                  {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Presets */}
        <div className="flex justify-center gap-3">
          {(['standard', 'extended'] as const).map(p => (
            <Button key={p} variant={preset === p ? 'default' : 'outline'} onClick={() => setPreset(p)}>
              {p === 'standard' ? '25/5' : '50/10'}
            </Button>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
