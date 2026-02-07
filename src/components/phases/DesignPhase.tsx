import React, { useState, useEffect } from 'react';
import { useProjectStore, DesignArtifact } from '@/store/projectStore';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import DOMPurify from 'dompurify';
import { 
  Palette, 
  Download,
  FileCode,
  GitBranch,
  Database,
  Activity,
  Users,
  Workflow,
  Box,
  ChevronRight,
  Sparkles,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import mermaid from 'mermaid';

const DIAGRAM_TYPES = [
  { id: 'use-case', label: 'Use Case', icon: Users, description: 'Actor interactions with the system' },
  { id: 'class', label: 'Class', icon: Box, description: 'Object-oriented structure' },
  { id: 'sequence', label: 'Sequence', icon: Activity, description: 'Object interactions over time' },
  { id: 'activity', label: 'Activity', icon: Workflow, description: 'Workflow and process flow' },
  { id: 'state', label: 'State', icon: GitBranch, description: 'State transitions' },
  { id: 'component', label: 'Component', icon: FileCode, description: 'System architecture' },
  { id: 'er', label: 'ER Diagram', icon: Database, description: 'Database schema design' },
] as const;

const MOCK_DIAGRAMS: Record<string, { mermaid: string; explanation: string }> = {
  'use-case': {
    mermaid: `graph TB
    subgraph "System Boundary"
        UC1[Login]
        UC2[View Dashboard]
        UC3[Manage Settings]
        UC4[Generate Reports]
    end
    
    User((User)) --> UC1
    User --> UC2
    Admin((Admin)) --> UC3
    Admin --> UC4
    UC2 --> UC4`,
    explanation: 'This use case diagram shows the main actors (User, Admin) and their interactions with the system. Users can login and view the dashboard, while Admins have additional capabilities for managing settings and generating reports.'
  },
  'class': {
    mermaid: `classDiagram
    class User {
        +String id
        +String email
        +String name
        +login()
        +logout()
    }
    class Project {
        +String id
        +String name
        +Date createdAt
        +getStatus()
    }
    class Requirement {
        +String id
        +String title
        +String priority
        +validate()
    }
    User "1" --> "*" Project : owns
    Project "1" --> "*" Requirement : contains`,
    explanation: 'The class diagram illustrates the main domain entities: User, Project, and Requirement. It shows their attributes, methods, and relationships (one-to-many associations).'
  },
  'sequence': {
    mermaid: `sequenceDiagram
    participant U as User
    participant C as Client
    participant S as Server
    participant D as Database
    
    U->>C: Enter credentials
    C->>S: POST /auth/login
    S->>D: Query user
    D-->>S: User data
    S-->>C: JWT Token
    C-->>U: Redirect to dashboard`,
    explanation: 'This sequence diagram shows the authentication flow, demonstrating how a user login request flows from the client through the server to the database and back.'
  },
  'er': {
    mermaid: `erDiagram
    USER ||--o{ PROJECT : creates
    PROJECT ||--|{ REQUIREMENT : contains
    PROJECT ||--o{ DOCUMENT : has
    REQUIREMENT ||--o{ TEST_CASE : validates
    
    USER {
        uuid id PK
        string email UK
        string password_hash
        timestamp created_at
    }
    PROJECT {
        uuid id PK
        uuid user_id FK
        string name
        string status
    }
    REQUIREMENT {
        uuid id PK
        uuid project_id FK
        string title
        string type
        string priority
    }`,
    explanation: 'The ER diagram shows the database schema with entities for Users, Projects, Requirements, Documents, and Test Cases, along with their relationships and key attributes.'
  }
};

// Initialize mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    primaryColor: '#22d3ee',
    primaryTextColor: '#ffffff',
    primaryBorderColor: '#0e7490',
    lineColor: '#64748b',
    secondaryColor: '#1e293b',
    tertiaryColor: '#0f172a',
  },
});

export const DesignPhase: React.FC = () => {
  const { project, designArtifacts, setDesignArtifacts, addDesignArtifact, updatePhaseProgress, setActivePhase } = useProjectStore();
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<string>('use-case');
  const [isGenerating, setIsGenerating] = useState(false);
  const [renderedSvg, setRenderedSvg] = useState<string>('');
  const [zoom, setZoom] = useState(1);

  // Load design artifacts on mount
  useEffect(() => {
    if (project?.id) {
      loadDesignArtifacts();
    }
  }, [project?.id]);

  // Render mermaid diagram when selected artifact changes
  useEffect(() => {
    const artifact = designArtifacts.find(a => a.type === selectedType);
    if (artifact?.mermaidCode) {
      renderMermaid(artifact.mermaidCode);
    } else {
      setRenderedSvg('');
    }
  }, [selectedType, designArtifacts]);

  const loadDesignArtifacts = async () => {
    if (!project?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('design_artifacts')
        .select('*')
        .eq('project_id', project.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setDesignArtifacts(data?.map(a => ({
        id: a.id,
        projectId: a.project_id,
        type: a.type as any,
        title: a.title,
        content: a.content,
        mermaidCode: a.mermaid_code,
      })) || []);
    } catch (error: any) {
      toast({
        title: 'Error loading artifacts',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const renderMermaid = async (code: string) => {
    try {
      const { svg } = await mermaid.render(`mermaid-${Date.now()}`, code);
      setRenderedSvg(svg);
    } catch (error) {
      console.error('Mermaid render error:', error);
      setRenderedSvg('');
    }
  };

  const generateDiagram = async (type: string) => {
    setIsGenerating(true);
    
    try {
      // Simulate AI generation delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mock = MOCK_DIAGRAMS[type];
      if (mock) {
        await addDesignArtifact({
          type: type as any,
          title: `${DIAGRAM_TYPES.find(d => d.id === type)?.label} Diagram`,
          content: mock.explanation,
          mermaidCode: mock.mermaid,
        });
        
        const progress = Math.min((designArtifacts.length + 1) * 15, 100);
        await updatePhaseProgress('design', progress);

        toast({
          title: 'Diagram generated',
          description: `${DIAGRAM_TYPES.find(d => d.id === type)?.label} diagram has been created`,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error generating diagram',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const exportDiagram = () => {
    if (!renderedSvg) return;
    
    const blob = new Blob([renderedSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedType}-diagram.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedArtifact = designArtifacts.find(a => a.type === selectedType);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Design & Architecture</h2>
          <p className="text-muted-foreground">
            Generate UML diagrams and design artifacts
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={exportDiagram} disabled={!renderedSvg}>
            <Download className="w-4 h-4 mr-2" />
            Export SVG
          </Button>
        </div>
      </div>

      {/* Diagram Types Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Generate Diagrams</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {DIAGRAM_TYPES.map((type) => {
            const hasArtifact = designArtifacts.some(a => a.type === type.id);
            const Icon = type.icon;
            
            return (
              <button
                key={type.id}
                onClick={() => {
                  setSelectedType(type.id);
                  if (!hasArtifact) {
                    generateDiagram(type.id);
                  }
                }}
                disabled={isGenerating}
                className={cn(
                  'glass-card p-4 text-center transition-all hover:border-primary/50',
                  selectedType === type.id && 'border-primary',
                  hasArtifact && 'bg-primary/5'
                )}
              >
                <div className={cn(
                  'w-10 h-10 mx-auto rounded-lg flex items-center justify-center mb-2',
                  hasArtifact ? 'bg-primary/20' : 'bg-secondary'
                )}>
                  <Icon className={cn('w-5 h-5', hasArtifact && 'text-primary')} />
                </div>
                <p className="text-sm font-medium">{type.label}</p>
                {hasArtifact && (
                  <p className="text-xs text-primary mt-1">Generated</p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Diagram Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visual Preview */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" />
                Diagram Preview
              </CardTitle>
              {renderedSvg && (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}>
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-xs text-muted-foreground">{Math.round(zoom * 100)}%</span>
                  <Button variant="ghost" size="icon" onClick={() => setZoom(z => Math.min(2, z + 0.1))}>
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setZoom(1)}>
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isGenerating ? (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <Sparkles className="w-8 h-8 text-primary mx-auto mb-3 animate-pulse" />
                  <p className="text-muted-foreground">Generating diagram...</p>
                </div>
              </div>
            ) : renderedSvg ? (
              <div 
                className="overflow-auto max-h-96 bg-secondary/30 rounded-lg p-4"
                style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
              >
                <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(renderedSvg, { USE_PROFILES: { svg: true } }) }} />
              </div>
            ) : selectedArtifact?.mermaidCode ? (
              <div className="code-block">
                <pre className="text-sm text-muted-foreground overflow-auto max-h-64">
                  {selectedArtifact.mermaidCode}
                </pre>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center border border-dashed border-border rounded-lg">
                <div className="text-center">
                  <Palette className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    Click a diagram type to generate
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Explanation */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileCode className="w-5 h-5 text-primary" />
              Design Explanation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedArtifact ? (
              <div className="space-y-4">
                <p className="text-sm leading-relaxed">
                  {selectedArtifact.content}
                </p>
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-xs text-primary font-medium mb-1">Pro Tip</p>
                  <p className="text-xs text-muted-foreground">
                    Export as SVG for use in documentation or edit in the Mermaid Live Editor.
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center">
                <p className="text-muted-foreground text-sm">
                  Select a diagram to view its explanation
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Generated Artifacts List */}
      {designArtifacts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Generated Artifacts ({designArtifacts.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {designArtifacts.map((artifact) => {
              const typeConfig = DIAGRAM_TYPES.find(d => d.id === artifact.type);
              const Icon = typeConfig?.icon || FileCode;
              
              return (
                <Card 
                  key={artifact.id} 
                  className={cn(
                    'glass-card cursor-pointer hover:border-primary/30 transition-colors',
                    selectedType === artifact.type && 'border-primary'
                  )}
                  onClick={() => setSelectedType(artifact.type)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{artifact.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {artifact.content}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Next Phase Button */}
      {designArtifacts.length >= 3 && (
        <div className="flex justify-end pt-4">
          <Button 
            onClick={() => setActivePhase('development')}
            className="bg-gradient-primary text-primary-foreground"
          >
            Continue to Development
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
};
