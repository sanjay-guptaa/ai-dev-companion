import { create } from 'zustand';

export type SDLCPhase = 'idea' | 'requirements' | 'design' | 'development' | 'testing' | 'documentation' | 'deployment';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Requirement {
  id: string;
  type: 'functional' | 'non-functional';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'draft' | 'approved' | 'implemented';
}

export interface UseCase {
  id: string;
  title: string;
  actor: string;
  description: string;
  preconditions: string[];
  steps: string[];
  postconditions: string[];
}

export interface DesignArtifact {
  id: string;
  type: 'use-case' | 'class' | 'sequence' | 'activity' | 'state' | 'component' | 'er';
  title: string;
  content: string;
  mermaidCode?: string;
}

export interface TestCase {
  id: string;
  title: string;
  type: 'unit' | 'integration' | 'functional' | 'e2e';
  description: string;
  steps: string[];
  expectedResult: string;
  status: 'pending' | 'passed' | 'failed';
}

export interface Document {
  id: string;
  type: 'srs' | 'design' | 'api' | 'developer' | 'testing' | 'deployment';
  title: string;
  content: string;
  lastUpdated: Date;
}

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
  phaseProgress: Record<SDLCPhase, number>;
  requirements: Requirement[];
  useCases: UseCase[];
  designArtifacts: DesignArtifact[];
  testCases: TestCase[];
  documents: Document[];
  chatHistory: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface SDLCState {
  project: Project | null;
  isLoading: boolean;
  activePhase: SDLCPhase;
  sidebarOpen: boolean;
  
  // Actions
  setProject: (project: Project) => void;
  updateProject: (updates: Partial<Project>) => void;
  setActivePhase: (phase: SDLCPhase) => void;
  setSidebarOpen: (open: boolean) => void;
  addMessage: (message: Message) => void;
  addRequirement: (requirement: Requirement) => void;
  addUseCase: (useCase: UseCase) => void;
  addDesignArtifact: (artifact: DesignArtifact) => void;
  addTestCase: (testCase: TestCase) => void;
  addDocument: (document: Document) => void;
  updatePhaseProgress: (phase: SDLCPhase, progress: number) => void;
  resetProject: () => void;
}

const createEmptyProject = (): Project => ({
  id: crypto.randomUUID(),
  name: '',
  description: '',
  vision: '',
  scope: '',
  targetUsers: [],
  features: [],
  constraints: [],
  currentPhase: 'idea',
  phaseProgress: {
    idea: 0,
    requirements: 0,
    design: 0,
    development: 0,
    testing: 0,
    documentation: 0,
    deployment: 0,
  },
  requirements: [],
  useCases: [],
  designArtifacts: [],
  testCases: [],
  documents: [],
  chatHistory: [],
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const useSDLCStore = create<SDLCState>((set) => ({
  project: null,
  isLoading: false,
  activePhase: 'idea',
  sidebarOpen: true,

  setProject: (project) => set({ project }),
  
  updateProject: (updates) =>
    set((state) => ({
      project: state.project
        ? { ...state.project, ...updates, updatedAt: new Date() }
        : null,
    })),

  setActivePhase: (phase) => set({ activePhase: phase }),
  
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  addMessage: (message) =>
    set((state) => ({
      project: state.project
        ? {
            ...state.project,
            chatHistory: [...state.project.chatHistory, message],
            updatedAt: new Date(),
          }
        : null,
    })),

  addRequirement: (requirement) =>
    set((state) => ({
      project: state.project
        ? {
            ...state.project,
            requirements: [...state.project.requirements, requirement],
            updatedAt: new Date(),
          }
        : null,
    })),

  addUseCase: (useCase) =>
    set((state) => ({
      project: state.project
        ? {
            ...state.project,
            useCases: [...state.project.useCases, useCase],
            updatedAt: new Date(),
          }
        : null,
    })),

  addDesignArtifact: (artifact) =>
    set((state) => ({
      project: state.project
        ? {
            ...state.project,
            designArtifacts: [...state.project.designArtifacts, artifact],
            updatedAt: new Date(),
          }
        : null,
    })),

  addTestCase: (testCase) =>
    set((state) => ({
      project: state.project
        ? {
            ...state.project,
            testCases: [...state.project.testCases, testCase],
            updatedAt: new Date(),
          }
        : null,
    })),

  addDocument: (document) =>
    set((state) => ({
      project: state.project
        ? {
            ...state.project,
            documents: [...state.project.documents, document],
            updatedAt: new Date(),
          }
        : null,
    })),

  updatePhaseProgress: (phase, progress) =>
    set((state) => ({
      project: state.project
        ? {
            ...state.project,
            phaseProgress: { ...state.project.phaseProgress, [phase]: progress },
            updatedAt: new Date(),
          }
        : null,
    })),

  resetProject: () => set({ project: createEmptyProject(), activePhase: 'idea' }),
}));
