import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

export type SDLCPhase = 'idea' | 'requirements' | 'design' | 'development' | 'testing' | 'documentation' | 'deployment';

export interface Project {
  id: string;
  name: string;
  description: string;
  vision: string;
  scope: string;
  targetUsers: string[];
  features: string[];
  constraints: string[];
  currentPhase: SDLCPhase;
  phaseProgress: Record<string, number>;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Requirement {
  id: string;
  projectId: string;
  type: 'functional' | 'non-functional';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'draft' | 'approved' | 'implemented';
}

export interface UseCase {
  id: string;
  projectId: string;
  title: string;
  actor: string;
  description: string;
  preconditions: string[];
  steps: string[];
  postconditions: string[];
}

export interface DesignArtifact {
  id: string;
  projectId: string;
  type: 'use-case' | 'class' | 'sequence' | 'activity' | 'state' | 'component' | 'er';
  title: string;
  content: string;
  mermaidCode?: string;
}

export interface TestCase {
  id: string;
  projectId: string;
  title: string;
  type: 'unit' | 'integration' | 'functional' | 'e2e';
  description: string;
  steps: string[];
  expectedResult: string;
  status: 'pending' | 'passed' | 'failed';
}

export interface Document {
  id: string;
  projectId: string;
  type: 'srs' | 'design' | 'api' | 'developer' | 'testing' | 'deployment';
  title: string;
  content: string;
}

interface ProjectState {
  project: Project | null;
  requirements: Requirement[];
  useCases: UseCase[];
  designArtifacts: DesignArtifact[];
  testCases: TestCase[];
  documents: Document[];
  activePhase: SDLCPhase;
  sidebarOpen: boolean;
  isLoading: boolean;
  realtimeChannel: any;

  // Actions
  setProject: (project: Project) => void;
  updateProject: (updates: Partial<Project>) => Promise<void>;
  setActivePhase: (phase: SDLCPhase) => void;
  setSidebarOpen: (open: boolean) => void;
  
  // Requirements
  setRequirements: (requirements: Requirement[]) => void;
  addRequirement: (requirement: Omit<Requirement, 'id' | 'projectId'>) => Promise<void>;
  
  // Use Cases
  setUseCases: (useCases: UseCase[]) => void;
  addUseCase: (useCase: Omit<UseCase, 'id' | 'projectId'>) => Promise<void>;
  
  // Design Artifacts
  setDesignArtifacts: (artifacts: DesignArtifact[]) => void;
  addDesignArtifact: (artifact: Omit<DesignArtifact, 'id' | 'projectId'>) => Promise<void>;
  
  // Test Cases
  setTestCases: (testCases: TestCase[]) => void;
  addTestCase: (testCase: Omit<TestCase, 'id' | 'projectId'>) => Promise<void>;
  updateTestCase: (id: string, updates: Partial<TestCase>) => Promise<void>;
  
  // Documents
  setDocuments: (documents: Document[]) => void;
  addDocument: (document: Omit<Document, 'id' | 'projectId'>) => Promise<void>;
  
  // Phase Progress
  updatePhaseProgress: (phase: SDLCPhase, progress: number) => Promise<void>;
  
  // Realtime
  subscribeToRealtime: (projectId: string) => void;
  unsubscribeFromRealtime: () => void;
  
  // Reset
  resetProject: () => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  project: null,
  requirements: [],
  useCases: [],
  designArtifacts: [],
  testCases: [],
  documents: [],
  activePhase: 'idea',
  sidebarOpen: true,
  isLoading: false,
  realtimeChannel: null,

  setProject: (project) => set({ project }),
  
  updateProject: async (updates) => {
    const { project } = get();
    if (!project) return;

    const dbUpdates: Record<string, any> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.vision !== undefined) dbUpdates.vision = updates.vision;
    if (updates.scope !== undefined) dbUpdates.scope = updates.scope;
    if (updates.targetUsers !== undefined) dbUpdates.target_users = updates.targetUsers;
    if (updates.features !== undefined) dbUpdates.features = updates.features;
    if (updates.constraints !== undefined) dbUpdates.constraints = updates.constraints;
    if (updates.currentPhase !== undefined) dbUpdates.current_phase = updates.currentPhase;
    if (updates.phaseProgress !== undefined) dbUpdates.phase_progress = updates.phaseProgress;

    const { error } = await supabase
      .from('projects')
      .update(dbUpdates)
      .eq('id', project.id);

    if (error) throw error;

    set({ 
      project: { 
        ...project, 
        ...updates, 
        updatedAt: new Date() 
      } 
    });
  },

  setActivePhase: (phase) => set({ activePhase: phase }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  setRequirements: (requirements) => set({ requirements }),
  
  addRequirement: async (requirement) => {
    const { project, requirements } = get();
    if (!project) return;

    const { data, error } = await supabase
      .from('requirements')
      .insert({
        project_id: project.id,
        type: requirement.type,
        title: requirement.title,
        description: requirement.description,
        priority: requirement.priority,
        status: requirement.status,
      })
      .select()
      .single();

    if (error) throw error;

    const newRequirement: Requirement = {
      id: data.id,
      projectId: data.project_id,
      type: data.type as any,
      title: data.title,
      description: data.description,
      priority: data.priority as any,
      status: data.status as any,
    };

    set({ requirements: [...requirements, newRequirement] });
  },

  setUseCases: (useCases) => set({ useCases }),
  
  addUseCase: async (useCase) => {
    const { project, useCases } = get();
    if (!project) return;

    const { data, error } = await supabase
      .from('use_cases')
      .insert({
        project_id: project.id,
        title: useCase.title,
        actor: useCase.actor,
        description: useCase.description,
        preconditions: useCase.preconditions,
        steps: useCase.steps,
        postconditions: useCase.postconditions,
      })
      .select()
      .single();

    if (error) throw error;

    const newUseCase: UseCase = {
      id: data.id,
      projectId: data.project_id,
      title: data.title,
      actor: data.actor,
      description: data.description,
      preconditions: data.preconditions,
      steps: data.steps,
      postconditions: data.postconditions,
    };

    set({ useCases: [...useCases, newUseCase] });
  },

  setDesignArtifacts: (artifacts) => set({ designArtifacts: artifacts }),
  
  addDesignArtifact: async (artifact) => {
    const { project, designArtifacts } = get();
    if (!project) return;

    const { data, error } = await supabase
      .from('design_artifacts')
      .insert({
        project_id: project.id,
        type: artifact.type,
        title: artifact.title,
        content: artifact.content,
        mermaid_code: artifact.mermaidCode,
      })
      .select()
      .single();

    if (error) throw error;

    const newArtifact: DesignArtifact = {
      id: data.id,
      projectId: data.project_id,
      type: data.type as any,
      title: data.title,
      content: data.content,
      mermaidCode: data.mermaid_code,
    };

    set({ designArtifacts: [...designArtifacts, newArtifact] });
  },

  setTestCases: (testCases) => set({ testCases }),
  
  addTestCase: async (testCase) => {
    const { project, testCases } = get();
    if (!project) return;

    const { data, error } = await supabase
      .from('test_cases')
      .insert({
        project_id: project.id,
        type: testCase.type,
        title: testCase.title,
        description: testCase.description,
        steps: testCase.steps,
        expected_result: testCase.expectedResult,
        status: testCase.status,
      })
      .select()
      .single();

    if (error) throw error;

    const newTestCase: TestCase = {
      id: data.id,
      projectId: data.project_id,
      type: data.type as any,
      title: data.title,
      description: data.description,
      steps: data.steps,
      expectedResult: data.expected_result,
      status: data.status as any,
    };

    set({ testCases: [...testCases, newTestCase] });
  },

  updateTestCase: async (id, updates) => {
    const { testCases } = get();
    
    const dbUpdates: Record<string, any> = {};
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;

    const { error } = await supabase
      .from('test_cases')
      .update(dbUpdates)
      .eq('id', id);

    if (error) throw error;

    set({
      testCases: testCases.map(tc =>
        tc.id === id ? { ...tc, ...updates } : tc
      ),
    });
  },

  setDocuments: (documents) => set({ documents }),
  
  addDocument: async (document) => {
    const { project, documents } = get();
    if (!project) return;

    const { data, error } = await supabase
      .from('documents')
      .insert({
        project_id: project.id,
        type: document.type,
        title: document.title,
        content: document.content,
      })
      .select()
      .single();

    if (error) throw error;

    const newDocument: Document = {
      id: data.id,
      projectId: data.project_id,
      type: data.type as any,
      title: data.title,
      content: data.content,
    };

    set({ documents: [...documents, newDocument] });
  },

  updatePhaseProgress: async (phase, progress) => {
    const { project } = get();
    if (!project) return;

    const newPhaseProgress = {
      ...project.phaseProgress,
      [phase]: progress,
    };

    await get().updateProject({ phaseProgress: newPhaseProgress });
  },

  subscribeToRealtime: (projectId) => {
    const channel = supabase
      .channel(`project-${projectId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects', filter: `id=eq.${projectId}` },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            const data = payload.new as any;
            set({
              project: {
                id: data.id,
                name: data.name,
                description: data.description || '',
                vision: data.vision || '',
                scope: data.scope || '',
                targetUsers: data.target_users || [],
                features: data.features || [],
                constraints: data.constraints || [],
                currentPhase: data.current_phase,
                phaseProgress: data.phase_progress,
                ownerId: data.owner_id,
                createdAt: new Date(data.created_at),
                updatedAt: new Date(data.updated_at),
              },
            });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'requirements', filter: `project_id=eq.${projectId}` },
        async () => {
          // Refetch requirements on any change
          const { data } = await supabase
            .from('requirements')
            .select('*')
            .eq('project_id', projectId);
          
          if (data) {
            set({
              requirements: data.map(r => ({
                id: r.id,
                projectId: r.project_id,
                type: r.type as any,
                title: r.title,
                description: r.description,
                priority: r.priority as any,
                status: r.status as any,
              })),
            });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'design_artifacts', filter: `project_id=eq.${projectId}` },
        async () => {
          const { data } = await supabase
            .from('design_artifacts')
            .select('*')
            .eq('project_id', projectId);
          
          if (data) {
            set({
              designArtifacts: data.map(a => ({
                id: a.id,
                projectId: a.project_id,
                type: a.type as any,
                title: a.title,
                content: a.content,
                mermaidCode: a.mermaid_code,
              })),
            });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'use_cases', filter: `project_id=eq.${projectId}` },
        async () => {
          const { data } = await supabase
            .from('use_cases')
            .select('*')
            .eq('project_id', projectId);
          
          if (data) {
            set({
              useCases: data.map(u => ({
                id: u.id,
                projectId: u.project_id,
                title: u.title,
                actor: u.actor,
                description: u.description,
                preconditions: u.preconditions,
                steps: u.steps,
                postconditions: u.postconditions,
              })),
            });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'documents', filter: `project_id=eq.${projectId}` },
        async () => {
          const { data } = await supabase
            .from('documents')
            .select('*')
            .eq('project_id', projectId);
          
          if (data) {
            set({
              documents: data.map(d => ({
                id: d.id,
                projectId: d.project_id,
                type: d.type as any,
                title: d.title,
                content: d.content,
              })),
            });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'test_cases', filter: `project_id=eq.${projectId}` },
        async () => {
          const { data } = await supabase
            .from('test_cases')
            .select('*')
            .eq('project_id', projectId);
          
          if (data) {
            set({
              testCases: data.map(t => ({
                id: t.id,
                projectId: t.project_id,
                type: t.type as any,
                title: t.title,
                description: t.description,
                steps: t.steps,
                expectedResult: t.expected_result,
                status: t.status as any,
              })),
            });
          }
        }
      )
      .subscribe();

    set({ realtimeChannel: channel });
  },

  unsubscribeFromRealtime: () => {
    const { realtimeChannel } = get();
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
      set({ realtimeChannel: null });
    }
  },

  resetProject: () => set({
    project: null,
    requirements: [],
    useCases: [],
    designArtifacts: [],
    testCases: [],
    documents: [],
    activePhase: 'idea',
  }),
}));
