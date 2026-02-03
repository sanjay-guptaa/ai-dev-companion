import { SDLCPhase } from '@/store/sdlcStore';
import { 
  Lightbulb, 
  FileText, 
  Palette, 
  Code, 
  TestTube, 
  BookOpen, 
  Rocket,
  LucideIcon
} from 'lucide-react';

export interface PhaseConfig {
  id: SDLCPhase;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

export const PHASES: PhaseConfig[] = [
  {
    id: 'idea',
    label: 'Project Idea',
    description: 'Define your vision and scope',
    icon: Lightbulb,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    id: 'requirements',
    label: 'Requirements',
    description: 'Capture functional & non-functional requirements',
    icon: FileText,
    color: 'text-[hsl(199,89%,58%)]',
    bgColor: 'phase-requirements',
  },
  {
    id: 'design',
    label: 'Design',
    description: 'Create UML diagrams and architecture',
    icon: Palette,
    color: 'text-[hsl(262,83%,68%)]',
    bgColor: 'phase-design',
  },
  {
    id: 'development',
    label: 'Development',
    description: 'Generate code and implementations',
    icon: Code,
    color: 'text-[hsl(142,71%,55%)]',
    bgColor: 'phase-development',
  },
  {
    id: 'testing',
    label: 'Testing',
    description: 'Create test cases and QA documentation',
    icon: TestTube,
    color: 'text-[hsl(38,92%,60%)]',
    bgColor: 'phase-testing',
  },
  {
    id: 'documentation',
    label: 'Documentation',
    description: 'Generate comprehensive docs',
    icon: BookOpen,
    color: 'text-[hsl(340,82%,62%)]',
    bgColor: 'phase-documentation',
  },
  {
    id: 'deployment',
    label: 'Deployment',
    description: 'CI/CD and deployment guidance',
    icon: Rocket,
    color: 'text-primary',
    bgColor: 'phase-deployment',
  },
];

export const getPhaseConfig = (phase: SDLCPhase): PhaseConfig => {
  return PHASES.find((p) => p.id === phase) || PHASES[0];
};
