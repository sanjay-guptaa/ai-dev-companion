import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '@/store/projectStore';
import { useProjectRole } from '@/hooks/useProjectRole';
import { getPhaseConfig } from '@/config/phases';
import { cn } from '@/lib/utils';
import { LogOut, Settings, User, Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  const { role } = useProjectRole(project?.id);
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
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/dashboard')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Dashboard
          </Button>
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
            <div className="flex items-center gap-2 hidden md:flex">
              <span className="text-sm text-muted-foreground">
                {project.name}
              </span>
              {role && (
                <Badge variant="outline" className="text-xs capitalize">
                  <Shield className="w-3 h-3 mr-1" />
                  {role}
                </Badge>
              )}
            </div>
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
