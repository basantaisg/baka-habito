import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Target, Timer, Trophy, BarChart3, CheckCircle2, Zap } from 'lucide-react';

const features = [
  { icon: Target, title: 'Goal Tracking', description: 'Set and track your goals with clarity' },
  { icon: CheckCircle2, title: 'Daily Habits', description: 'Build habits that stick' },
  { icon: Timer, title: 'Pomodoro Focus', description: 'Stay focused with timed sessions' },
  { icon: Trophy, title: 'Leaderboards', description: 'Compete and stay motivated' },
  { icon: BarChart3, title: 'Analytics', description: 'Visualize your progress' },
  { icon: Zap, title: 'Daily Scores', description: 'Earn points for consistency' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        
        <nav className="relative z-10 container mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="font-display text-2xl font-bold text-white">Goal Assister</h1>
          <div className="flex gap-4">
            <Link to="/login">
              <Button variant="ghost" className="text-white hover:bg-white/10">Log In</Button>
            </Link>
            <Link to="/signup">
              <Button className="gradient-primary">Sign Up</Button>
            </Link>
          </div>
        </nav>

        <div className="relative z-10 container mx-auto px-4 py-24 lg:py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Achieve Your Goals<br />
              <span className="text-gradient">One Day at a Time</span>
            </h2>
            <p className="text-lg lg:text-xl text-white/80 max-w-2xl mx-auto mb-10">
              Track habits, manage tasks, focus with Pomodoro, and compete on leaderboards. 
              Build the life you want with Goal Assister.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg" className="gradient-primary text-lg px-8 shadow-glow">
                  Start Free
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="text-lg px-8 border-white/30 text-white hover:bg-white/10">
                  Log In
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Features */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="font-display text-3xl lg:text-4xl font-bold mb-4">
              Everything You Need to <span className="text-primary">Succeed</span>
            </h3>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A complete productivity system designed to help you build better habits and achieve your goals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl gradient-card border border-border hover:shadow-glow transition-all duration-300"
              >
                <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h4 className="font-display text-xl font-semibold mb-2">{feature.title}</h4>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 gradient-primary">
        <div className="container mx-auto px-4 text-center">
          <h3 className="font-display text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Life?
          </h3>
          <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
            Join thousands building better habits and achieving their goals.
          </p>
          <Link to="/signup">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 Goal Assister. Built for productivity.</p>
        </div>
      </footer>
    </div>
  );
}
