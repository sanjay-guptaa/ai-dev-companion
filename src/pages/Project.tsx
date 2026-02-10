import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProjectIdeaForm } from '@/components/phases/ProjectIdeaForm';
import { RequirementsPhase } from '@/components/phases/RequirementsPhase';
import { DesignPhase } from '@/components/phases/DesignPhase';
import { DevelopmentPhase } from '@/components/phases/DevelopmentPhase';
import { TestingPhase } from '@/components/phases/TestingPhase';
import { DocumentationPhase } from '@/components/phases/DocumentationPhase';
import { DeploymentPhase } from '@/components/phases/DeploymentPhase';
import { useProjectStore } from '@/store/projectStore';
import { useProjectRole } from '@/hooks/useProjectRole';
import { Loader2 } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export const Project: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    project, 
    activePhase, 
    setProject, 
    setActivePhase,
    subscribeToRealtime,
    unsubscribeFromRealtime 
  } = useProjectStore();
  const { canEdit, isOwner, role } = useProjectRole(projectId);

  // Auth check
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate('/auth');
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Load project data
  useEffect(() => {
    if (user && projectId) {
      loadProject();
      subscribeToRealtime(projectId);
    }

    return () => {
      unsubscribeFromRealtime();
    };
  }, [user, projectId]);

  const loadProject = async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        toast({
          title: 'Project not found',
          description: 'The project you are looking for does not exist or you do not have access.',
          variant: 'destructive',
        });
        navigate('/dashboard');
        return;
      }

      // Transform database project to store format
      setProject({
        id: data.id,
        name: data.name,
        description: data.description || '',
        vision: data.vision || '',
        scope: data.scope || '',
        targetUsers: data.target_users || [],
        features: data.features || [],
        constraints: data.constraints || [],
        currentPhase: data.current_phase as any,
        phaseProgress: data.phase_progress as Record<string, number>,
        ownerId: data.owner_id,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      });
      
      setActivePhase(data.current_phase as any);
    } catch (error: any) {
      toast({
        title: 'Error loading project',
        description: error.message,
        variant: 'destructive',
      });
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPhase = () => {
    switch (activePhase) {
      case 'idea':
        return <ProjectIdeaForm canEdit={canEdit} />;
      case 'requirements':
        return <RequirementsPhase canEdit={canEdit} />;
      case 'design':
        return <DesignPhase canEdit={canEdit} />;
      case 'development':
        return <DevelopmentPhase canEdit={canEdit} />;
      case 'testing':
        return <TestingPhase canEdit={canEdit} />;
      case 'documentation':
        return <DocumentationPhase canEdit={canEdit} />;
      case 'deployment':
        return <DeploymentPhase canEdit={canEdit} />;
      default:
        return <ProjectIdeaForm canEdit={canEdit} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <DashboardLayout>
      {renderPhase()}
    </DashboardLayout>
  );
};

export default Project;
