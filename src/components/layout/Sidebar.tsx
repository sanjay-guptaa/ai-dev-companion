import React from 'react';
import { useSDLCStore, SDLCPhase } from '@/store/sdlcStore';
import { PHASES, getPhaseConfig } from '@/config/phases';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export const Sidebar: React.FC = () => {
  const { project, activePhase, setActivePhase, sidebarOpen, setSidebarOpen } = useSDLCStore();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
        {sidebarOpen && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">SDLC Assistant</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-muted-foreground hover:text-foreground"
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-1">
        {PHASES.map((phase) => {
          const isActive = activePhase === phase.id;
          const progress = project?.phaseProgress[phase.id] || 0;
          const Icon = phase.icon;

          return (
            <button
              key={phase.id}
              onClick={() => setActivePhase(phase.id)}
              className={cn(
                'w-full group relative',
                'flex items-center gap-3 px-3 py-2.5 rounded-lg',
                'text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-lg transition-colors',
                  isActive ? 'bg-primary/20' : 'bg-secondary'
                )}
              >
                <Icon className={cn('w-4 h-4', isActive ? 'text-primary' : '')} />
              </div>
              
              {sidebarOpen && (
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between">
                    <span>{phase.label}</span>
                    {progress > 0 && (
                      <span className="text-xs text-muted-foreground">{progress}%</span>
                    )}
                  </div>
                  {progress > 0 && (
                    <Progress value={progress} className="h-1 mt-1.5" />
                  )}
                </div>
              )}

              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Project info */}
      {sidebarOpen && project && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
            <p className="text-xs text-muted-foreground mb-1">Current Project</p>
            <p className="text-sm font-medium truncate">{project.name || 'Untitled Project'}</p>
          </div>
        </div>
      )}
    </aside>
  );
};
