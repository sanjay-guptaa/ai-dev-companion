import React from 'react';
import { useSDLCStore } from '@/store/sdlcStore';
import { getPhaseConfig } from '@/config/phases';
import { cn } from '@/lib/utils';
import { Bell, Search, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const Header: React.FC = () => {
  const { activePhase, sidebarOpen } = useSDLCStore();
  const phaseConfig = getPhaseConfig(activePhase);

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-30 h-16 bg-background/80 backdrop-blur-lg border-b border-border transition-all duration-300',
        sidebarOpen ? 'left-64' : 'left-16'
      )}
    >
      <div className="flex items-center justify-between h-full px-6">
        {/* Phase info */}
        <div className="flex items-center gap-4">
          <div className={cn('phase-badge', `phase-${activePhase}`)}>
            <phaseConfig.icon className="w-3.5 h-3.5" />
            <span>{phaseConfig.label}</span>
          </div>
          <p className="text-sm text-muted-foreground hidden sm:block">
            {phaseConfig.description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="w-64 pl-9 bg-secondary border-border/50"
            />
          </div>
          
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Bell className="w-5 h-5" />
          </Button>
          
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Settings className="w-5 h-5" />
          </Button>

          <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center cursor-pointer">
            <User className="w-4 h-4 text-primary-foreground" />
          </div>
        </div>
      </div>
    </header>
  );
};
