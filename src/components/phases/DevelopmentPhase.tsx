import React from 'react';
import { useProjectStore } from '@/store/projectStore';
import { cn } from '@/lib/utils';
import {
  Code, 
  Sparkles,
  FileCode,
  FolderTree,
  GitBranch,
  Terminal,
  Copy,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const MOCK_CODE_STRUCTURE = `
├── src/
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   └── features/
│   ├── hooks/
│   ├── lib/
│   ├── pages/
│   ├── services/
│   ├── store/
│   ├── types/
│   └── utils/
├── tests/
├── docs/
└── package.json
`.trim();

const MOCK_AUTH_CODE = `
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await authService.login(email, password);
      setUser(result.user);
      navigate('/dashboard');
    } catch (error) {
      throw new Error('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    navigate('/login');
  };

  return { user, loading, login, logout };
};
`.trim();

const MOCK_API_CODE = `
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const projectService = {
  async getAll() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async create(project: Partial<Project>) {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};
`.trim();

export const DevelopmentPhase: React.FC<{ canEdit?: boolean }> = ({ canEdit = true }) => {
  const { project, updatePhaseProgress, setActivePhase } = useProjectStore();

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard!');
  };

  const features = [
    { name: 'Project Structure', status: 'generated', icon: FolderTree },
    { name: 'Authentication Hook', status: 'generated', icon: GitBranch },
    { name: 'API Services', status: 'generated', icon: Terminal },
    { name: 'Type Definitions', status: 'pending', icon: FileCode },
    { name: 'State Management', status: 'pending', icon: Code },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Development</h2>
          <p className="text-muted-foreground">
            Generate code and implementation scaffolding
          </p>
        </div>
        <Button className="bg-gradient-primary text-primary-foreground">
          <Sparkles className="w-4 h-4 mr-2" />
          Generate All Code
        </Button>
      </div>

      {/* Code Generation Status */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {features.map((feature, idx) => (
          <Card key={idx} className="glass-card">
            <CardContent className="p-4 text-center">
              <div className={cn(
                'w-10 h-10 mx-auto rounded-lg flex items-center justify-center mb-2',
                feature.status === 'generated' ? 'bg-primary/20' : 'bg-secondary'
              )}>
                <feature.icon className={cn(
                  'w-5 h-5',
                  feature.status === 'generated' && 'text-primary'
                )} />
              </div>
              <p className="text-sm font-medium">{feature.name}</p>
              <p className={cn(
                'text-xs mt-1',
                feature.status === 'generated' ? 'text-primary' : 'text-muted-foreground'
              )}>
                {feature.status === 'generated' ? (
                  <span className="flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Generated
                  </span>
                ) : 'Pending'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Code Viewer */}
      <Tabs defaultValue="structure" className="space-y-4">
        <TabsList className="bg-secondary">
          <TabsTrigger value="structure">Project Structure</TabsTrigger>
          <TabsTrigger value="auth">Authentication</TabsTrigger>
          <TabsTrigger value="api">API Services</TabsTrigger>
        </TabsList>

        <TabsContent value="structure">
          <Card className="glass-card">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-primary" />
                Recommended Project Structure
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => copyCode(MOCK_CODE_STRUCTURE)}>
                <Copy className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="code-block">
                <pre className="font-mono text-sm">{MOCK_CODE_STRUCTURE}</pre>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                This structure follows best practices for React/TypeScript applications, with clear separation of concerns between components, services, and utilities.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auth">
          <Card className="glass-card">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-primary" />
                Authentication Hook
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => copyCode(MOCK_AUTH_CODE)}>
                <Copy className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="code-block">
                <pre className="font-mono text-sm overflow-auto max-h-96">{MOCK_AUTH_CODE}</pre>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-xs text-primary font-medium mb-1">Implementation Notes</p>
                <p className="text-xs text-muted-foreground">
                  This hook provides authentication state management with login/logout functionality. 
                  Integrate with your preferred auth provider (Supabase, Firebase, Auth0, etc.)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card className="glass-card">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Terminal className="w-5 h-5 text-primary" />
                API Services
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => copyCode(MOCK_API_CODE)}>
                <Copy className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="code-block">
                <pre className="font-mono text-sm overflow-auto max-h-96">{MOCK_API_CODE}</pre>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-xs text-primary font-medium mb-1">Implementation Notes</p>
                <p className="text-xs text-muted-foreground">
                  Service layer for database operations using Supabase. 
                  Add error handling and caching as needed for production use.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Next Phase */}
      <div className="flex justify-end pt-4">
        <Button 
          onClick={() => setActivePhase('testing')}
          className="bg-gradient-primary text-primary-foreground"
        >
          Continue to Testing
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
