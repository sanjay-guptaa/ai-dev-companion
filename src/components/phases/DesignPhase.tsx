import React, { useState } from 'react';
import { useSDLCStore, DesignArtifact } from '@/store/sdlcStore';
import { cn } from '@/lib/utils';
import { 
  Palette, 
  Plus, 
  Sparkles,
  Download,
  FileCode,
  GitBranch,
  Database,
  Activity,
  Users,
  Workflow,
  Box,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

export const DesignPhase: React.FC = () => {
  const { project, addDesignArtifact, updatePhaseProgress, setActivePhase } = useSDLCStore();
  const [selectedType, setSelectedType] = useState<string>('use-case');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateDiagram = async (type: string) => {
    setIsGenerating(true);
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 1500));

    const mock = MOCK_DIAGRAMS[type];
    if (mock) {
      const artifact: DesignArtifact = {
        id: crypto.randomUUID(),
        type: type as any,
        title: `${DIAGRAM_TYPES.find(d => d.id === type)?.label} Diagram`,
        content: mock.explanation,
        mermaidCode: mock.mermaid,
      };
      addDesignArtifact(artifact);
      
      const currentArtifacts = project?.designArtifacts.length || 0;
      const progress = Math.min((currentArtifacts + 1) * 15, 100);
      updatePhaseProgress('design', progress);
    }

    setIsGenerating(false);
  };

  const existingArtifacts = project?.designArtifacts || [];

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
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* Diagram Types Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Generate Diagrams</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {DIAGRAM_TYPES.map((type) => {
            const hasArtifact = existingArtifacts.some(a => a.type === type.id);
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
        {/* Mermaid Preview */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              Diagram Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isGenerating ? (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <Sparkles className="w-8 h-8 text-primary mx-auto mb-3 animate-pulse" />
                  <p className="text-muted-foreground">Generating diagram...</p>
                </div>
              </div>
            ) : existingArtifacts.find(a => a.type === selectedType) ? (
              <div className="code-block">
                <pre className="text-sm text-muted-foreground overflow-auto max-h-64">
                  {existingArtifacts.find(a => a.type === selectedType)?.mermaidCode}
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
            {existingArtifacts.find(a => a.type === selectedType) ? (
              <div className="space-y-4">
                <p className="text-sm leading-relaxed">
                  {existingArtifacts.find(a => a.type === selectedType)?.content}
                </p>
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-xs text-primary font-medium mb-1">Pro Tip</p>
                  <p className="text-xs text-muted-foreground">
                    This diagram can be edited in the Mermaid Live Editor and re-imported.
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
      {existingArtifacts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Generated Artifacts ({existingArtifacts.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {existingArtifacts.map((artifact) => {
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
      {existingArtifacts.length >= 3 && (
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
