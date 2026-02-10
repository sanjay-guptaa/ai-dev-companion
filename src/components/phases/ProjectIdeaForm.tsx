import React, { useState, useEffect } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { cn } from '@/lib/utils';
import { 
  Lightbulb, 
  ArrowRight, 
  Sparkles, 
  Users, 
  Target, 
  Zap,
  CheckCircle2,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const INITIAL_QUESTIONS = [
  "What's the primary goal or problem this project solves?",
  "Who are the target users?",
  "What are the 3-5 core features?",
  "Any technical constraints or preferences?"
];

export const ProjectIdeaForm: React.FC<{ canEdit?: boolean }> = ({ canEdit = true }) => {
  const { project, updateProject, setActivePhase, updatePhaseProgress } = useProjectStore();
  const { toast } = useToast();
  
  const [step, setStep] = useState<'input' | 'clarify' | 'generating'>('input');
  const [projectName, setProjectName] = useState(project?.name || '');
  const [projectIdea, setProjectIdea] = useState(project?.description || '');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');

  // Initialize with existing project data
  useEffect(() => {
    if (project) {
      setProjectName(project.name);
      setProjectIdea(project.description);
      
      // If project has vision, we've already completed this phase
      if (project.vision) {
        // Show the clarify step completed or skip to next
      }
    }
  }, [project]);

  const handleStartClarify = async () => {
    if (!projectIdea.trim()) return;

    try {
      await updateProject({
        name: projectName || project?.name,
        description: projectIdea,
      });
      
      await updatePhaseProgress('idea', 20);
      setStep('clarify');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleAnswerQuestion = () => {
    if (!currentAnswer.trim()) return;

    const newAnswers = [...answers, currentAnswer];
    setAnswers(newAnswers);

    if (currentQuestionIndex < INITIAL_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentAnswer('');
    } else {
      setStep('generating');
      generateProjectSummary(newAnswers);
    }
  };

  const generateProjectSummary = async (allAnswers: string[]) => {
    try {
      // Update project with gathered information
      await updateProject({
        vision: allAnswers[0] || '',
        targetUsers: allAnswers[1]?.split(',').map(s => s.trim()) || [],
        features: allAnswers[2]?.split(',').map(s => s.trim()) || [],
        constraints: allAnswers[3]?.split(',').map(s => s.trim()) || [],
        currentPhase: 'requirements',
      });

      await updatePhaseProgress('idea', 100);
      
      toast({
        title: 'Project setup complete',
        description: 'Moving to Requirements phase',
      });

      setActivePhase('requirements');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      setStep('clarify');
    }
  };

  if (step === 'input') {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-primary mb-6 glow-primary">
            <Lightbulb className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Start Your <span className="gradient-text">Project Journey</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform your idea into a complete software project. Our AI assistant will guide you through every phase of the SDLC.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {[
            { icon: Target, title: 'Clear Requirements', desc: 'Auto-generate SRS documents' },
            { icon: Zap, title: 'Smart Design', desc: 'UML & ER diagrams instantly' },
            { icon: Users, title: 'Full Lifecycle', desc: 'From idea to deployment' },
          ].map((feature, idx) => (
            <div key={idx} className="glass-card p-4">
              <feature.icon className="w-6 h-6 text-primary mb-2" />
              <h3 className="font-semibold mb-1">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Input Form */}
        <div className="glass-card p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Project Name</label>
              <Input
                placeholder="My Awesome Project"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="bg-secondary border-border/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Describe your project idea
                <span className="text-muted-foreground font-normal ml-2">
                  (Be as detailed as possible)
                </span>
              </label>
              <Textarea
                placeholder="I want to build a mobile app that helps users track their daily habits and provides personalized recommendations based on their progress..."
                value={projectIdea}
                onChange={(e) => setProjectIdea(e.target.value)}
                className="min-h-[150px] bg-secondary border-border/50 resize-none"
              />
            </div>

            <Button
              onClick={handleStartClarify}
              disabled={!projectIdea.trim()}
              className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90 glow-primary"
              size="lg"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Analyze & Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'clarify') {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Clarifying Your Vision</h2>
          <p className="text-muted-foreground">
            Answer a few questions to help us understand your project better.
          </p>
          
          {/* Progress */}
          <div className="flex items-center gap-2 mt-4">
            {INITIAL_QUESTIONS.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  'h-1.5 flex-1 rounded-full transition-colors',
                  idx <= currentQuestionIndex ? 'bg-primary' : 'bg-secondary'
                )}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Question {currentQuestionIndex + 1} of {INITIAL_QUESTIONS.length}
          </p>
        </div>

        {/* Answered Questions */}
        <div className="space-y-4 mb-6">
          {answers.map((answer, idx) => (
            <React.Fragment key={idx}>
              <div className="glass-card p-4">
                <p className="text-sm text-muted-foreground mb-1">Question {idx + 1}</p>
                <p className="font-medium">{INITIAL_QUESTIONS[idx]}</p>
              </div>
              <div className="ml-8 p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                  <p className="text-sm">{answer}</p>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* Current Question */}
        <div className="glass-card p-6">
          <p className="text-lg font-medium mb-4">{INITIAL_QUESTIONS[currentQuestionIndex]}</p>
          <div className="flex gap-3">
            <Textarea
              placeholder="Type your answer..."
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAnswerQuestion();
                }
              }}
              className="flex-1 min-h-[80px] bg-secondary border-border/50 resize-none"
            />
            <Button
              onClick={handleAnswerQuestion}
              disabled={!currentAnswer.trim()}
              size="icon"
              className="self-end bg-gradient-primary text-primary-foreground"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'generating') {
    return (
      <div className="max-w-md mx-auto text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-primary mb-6 animate-pulse-glow">
          <Sparkles className="w-10 h-10 text-primary-foreground animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Analyzing Your Project</h2>
        <p className="text-muted-foreground mb-6">
          Processing your responses and setting up the project foundation...
        </p>
        <div className="flex justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return null;
};
