import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  Zap, 
  Plus, 
  Search, 
  LogOut, 
  User,
  FolderOpen,
  Clock,
  Trash2,
  MoreVertical,
  Loader2,
  Users,
  Share2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { JoinProjectDialog } from '@/components/collaboration/JoinProjectDialog';
import { InviteTokenDialog } from '@/components/collaboration/InviteTokenDialog';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface Project {
  id: string;
  name: string;
  description: string;
  current_phase: string;
  phase_progress: Record<string, number>;
  updated_at: string;
  created_at: string;
  owner_id: string;
}

const PHASE_LABELS: Record<string, string> = {
  idea: 'Idea',
  requirements: 'Requirements',
  design: 'Design',
  development: 'Development',
  testing: 'Testing',
  documentation: 'Documentation',
  deployment: 'Deployment',
};

export const Dashboard: React.FC = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteProject, setInviteProject] = useState<{ id: string; name: string } | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

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

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      // Properly type the phase_progress field
      const typedProjects = (data || []).map(project => ({
        ...project,
        phase_progress: project.phase_progress as Record<string, number>
      }));
      
      setProjects(typedProjects);
    } catch (error: any) {
      toast({
        title: 'Error loading projects',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter a project name',
        variant: 'destructive',
      });
      return;
    }

    // Guard: Ensure user is authenticated before creating project
    const { data: { user: authenticatedUser } } = await supabase.auth.getUser();
    if (!authenticatedUser) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to create a project',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    setIsCreating(true);
    try {
      // Insert the project and get the ID using RETURNING via RPC workaround
      // The SELECT RLS policy uses is_project_member() which can't see uncommitted rows,
      // so we insert without .select() and then query the project separately
      const { error: insertError } = await supabase
        .from('projects')
        .insert({
          name: newProjectName.trim(),
          description: newProjectDescription.trim(),
          owner_id: authenticatedUser.id,
          current_phase: 'idea',
          phase_progress: {},
        });

      if (insertError) throw insertError;

      // Fetch the newly created project (now committed and visible to RLS)
      const { data: newProject, error: fetchError } = await supabase
        .from('projects')
        .select('id')
        .eq('owner_id', authenticatedUser.id)
        .eq('name', newProjectName.trim())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) throw fetchError;

      toast({
        title: 'Project created',
        description: 'Your new project is ready',
      });

      setShowNewProjectDialog(false);
      setNewProjectName('');
      setNewProjectDescription('');
      
      // Navigate to the new project
      if (newProject) {
        navigate(`/project/${newProject.id}`);
      } else {
        // Fallback to dashboard refresh
        fetchProjects();
      }
    } catch (error: any) {
      toast({
        title: 'Error creating project',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      setProjects(projects.filter(p => p.id !== projectId));
      toast({
        title: 'Project deleted',
        description: 'The project has been removed',
      });
    } catch (error: any) {
      toast({
        title: 'Error deleting project',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateOverallProgress = (phaseProgress: Record<string, number>) => {
    const phases = Object.values(phaseProgress);
    if (phases.length === 0) return 0;
    return Math.round(phases.reduce((a, b) => a + b, 0) / phases.length);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">SDLC Assistant</span>
            </div>
            
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="text-muted-foreground">
                    {user?.email}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">Your Projects</h1>
            <p className="text-muted-foreground">
              Manage and track your SDLC projects
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline"
              onClick={() => setShowJoinDialog(true)}
            >
              <Users className="w-5 h-5 mr-2" />
              Join Project
            </Button>
            <Button 
              onClick={() => setShowNewProjectDialog(true)}
              className="bg-gradient-primary text-primary-foreground"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Project
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 max-w-md"
          />
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20">
            <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No projects yet</h2>
            <p className="text-muted-foreground mb-6">
              Create your first project to get started with AI-powered SDLC
            </p>
            <Button 
              onClick={() => setShowNewProjectDialog(true)}
              className="bg-gradient-primary text-primary-foreground"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Link
                key={project.id}
                to={`/project/${project.id}`}
                className="glass-card p-6 hover:border-primary/30 transition-colors group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {project.description || 'No description'}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                      <Button variant="ghost" size="icon" className="shrink-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {project.owner_id === user?.id && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.preventDefault();
                            setInviteProject({ id: project.id, name: project.name });
                            setShowInviteDialog(true);
                          }}
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          Invite Members
                        </DropdownMenuItem>
                      )}
                      {project.owner_id === user?.id && (
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={(e) => {
                            e.preventDefault();
                            handleDeleteProject(project.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Phase</span>
                    <span className="font-medium">
                      {PHASE_LABELS[project.current_phase] || project.current_phase}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {calculateOverallProgress(project.phase_progress)}%
                      </span>
                    </div>
                    <Progress 
                      value={calculateOverallProgress(project.phase_progress)} 
                      className="h-2"
                    />
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                    <Clock className="w-3 h-3" />
                    Updated {formatDate(project.updated_at)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* New Project Dialog */}
      <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Start a new SDLC project with AI assistance
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                placeholder="My Awesome Project"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectDescription">Description (optional)</Label>
              <Textarea
                id="projectDescription"
                placeholder="Brief description of your project..."
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewProjectDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateProject}
              disabled={isCreating}
              className="bg-gradient-primary text-primary-foreground"
            >
              {isCreating ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Join Project Dialog */}
      <JoinProjectDialog open={showJoinDialog} onOpenChange={setShowJoinDialog} />

      {/* Invite Token Dialog */}
      {inviteProject && (
        <InviteTokenDialog
          open={showInviteDialog}
          onOpenChange={(open) => {
            setShowInviteDialog(open);
            if (!open) setInviteProject(null);
          }}
          projectId={inviteProject.id}
          projectName={inviteProject.name}
        />
      )}
    </div>
  );
};

export default Dashboard;
