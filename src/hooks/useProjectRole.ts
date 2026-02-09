import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type ProjectRole = 'owner' | 'contributor' | 'viewer' | null;

export const useProjectRole = (projectId: string | undefined) => {
  const [role, setRole] = useState<ProjectRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!projectId) {
      setRole(null);
      setIsLoading(false);
      return;
    }

    const fetchRole = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setRole(null);
          return;
        }

        // Check if owner
        const { data: project } = await supabase
          .from('projects')
          .select('owner_id')
          .eq('id', projectId)
          .maybeSingle();

        if (project?.owner_id === user.id) {
          setRole('owner');
          return;
        }

        // Check project_members
        const { data: membership } = await supabase
          .from('project_members')
          .select('role')
          .eq('project_id', projectId)
          .eq('user_id', user.id)
          .maybeSingle();

        setRole((membership?.role as ProjectRole) ?? null);
      } catch (error) {
        console.error('Error fetching project role:', error);
        setRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRole();
  }, [projectId]);

  const canEdit = role === 'owner' || role === 'contributor';
  const isOwner = role === 'owner';
  const isViewer = role === 'viewer';

  return { role, isLoading, canEdit, isOwner, isViewer };
};
