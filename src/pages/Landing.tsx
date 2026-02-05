import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Lightbulb, 
  FileText, 
  Palette, 
  Code, 
  TestTube, 
  BookOpen, 
  Rocket,
  ArrowRight,
  Zap,
  Users,
  Github,
  Check
} from 'lucide-react';

const FEATURES = [
  { 
    icon: Lightbulb, 
    title: 'Idea Intake', 
    description: 'Start with a simple idea and let AI guide you through scope refinement' 
  },
  { 
    icon: FileText, 
    title: 'SRS Generation', 
    description: 'Auto-generate complete Software Requirements Specifications' 
  },
  { 
    icon: Palette, 
    title: 'UML Design', 
    description: 'Create class, sequence, ER, and activity diagrams automatically' 
  },
  { 
    icon: Code, 
    title: 'Code Scaffolding', 
    description: 'Generate boilerplate code based on your design artifacts' 
  },
  { 
    icon: TestTube, 
    title: 'Test Cases', 
    description: 'AI-powered test case generation with coverage analysis' 
  },
  { 
    icon: BookOpen, 
    title: 'Documentation', 
    description: 'Maintain synchronized docs across all SDLC phases' 
  },
];

const PHASES = [
  { label: 'Requirements', color: 'bg-blue-500' },
  { label: 'Design', color: 'bg-purple-500' },
  { label: 'Development', color: 'bg-green-500' },
  { label: 'Testing', color: 'bg-amber-500' },
  { label: 'Deploy', color: 'bg-cyan-500' },
];

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">SDLC Assistant</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/auth">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button className="bg-gradient-primary text-primary-foreground">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary mb-8">
            <Zap className="w-4 h-4" />
            AI-Powered Development Lifecycle
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            From Idea to Deployment
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">
              Powered by AI
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Transform your project ideas into production-ready software with AI-guided 
            requirements, design, development, testing, and documentation.
          </p>

          {/* Phase Flow */}
          <div className="flex items-center justify-center gap-2 flex-wrap mb-12">
            {PHASES.map((phase, i) => (
              <React.Fragment key={phase.label}>
                <div className={`px-4 py-2 rounded-lg ${phase.color} text-white text-sm font-medium`}>
                  {phase.label}
                </div>
                {i < PHASES.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-muted-foreground hidden sm:block" />
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="flex items-center justify-center gap-4">
            <Link to="/auth?mode=signup">
              <Button size="lg" className="bg-gradient-primary text-primary-foreground h-12 px-8">
                Start Free Project
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="h-12 px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Complete SDLC Coverage
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Every phase of software development, enhanced with AI intelligence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <div 
                key={feature.title}
                className="glass-card p-6 hover:border-primary/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Collaboration Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Built for Teams
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Collaborate with your team in real-time. Share projects, assign roles, 
                and keep everyone aligned throughout the development lifecycle.
              </p>
              <ul className="space-y-4">
                {[
                  'Real-time sync across all collaborators',
                  'Role-based access (Owner, Contributor, Viewer)',
                  'Project sharing via invite tokens',
                  'GitHub integration for artifact export',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass-card p-8">
              <div className="flex items-center gap-4 mb-6">
                <Users className="w-8 h-8 text-primary" />
                <div>
                  <h3 className="font-semibold">Team Workspace</h3>
                  <p className="text-sm text-muted-foreground">3 members online</p>
                </div>
              </div>
              <div className="space-y-3">
                {['Requirements updated', 'New class diagram generated', 'Test cases approved'].map((activity, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-sm">{activity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/10 to-cyan-500/10 border-y border-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Transform Your Development Process?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Join developers using AI to accelerate their software development lifecycle.
          </p>
          <Link to="/auth?mode=signup">
            <Button size="lg" className="bg-gradient-primary text-primary-foreground h-14 px-10 text-lg">
              Start Your First Project
              <Rocket className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">SDLC Assistant</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} AI-Powered SDLC Assistant. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
