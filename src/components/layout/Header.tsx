import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '@/store/projectStore';
import { getPhaseConfig } from '@/config/phases';
import { cn } from '@/lib/utils';
import { LogOut, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Header: React.FC = () => {
  const { activePhase, sidebarOpen, project } = useProjectStore();
  const phaseConfig = getPhaseConfig(activePhase);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

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
          {project && (
            <span className="text-sm text-muted-foreground hidden md:block">
              {project.name}
            </span>
          )}
          
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Settings className="w-5 h-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center cursor-pointer">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
