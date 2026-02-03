import React, { useState } from 'react';
import { useSDLCStore, Requirement, UseCase } from '@/store/sdlcStore';
import { cn } from '@/lib/utils';
import { 
  FileText, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  ChevronRight,
  Sparkles,
  Download,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const RequirementsPhase: React.FC = () => {
  const { project, addRequirement, addUseCase, updatePhaseProgress, setActivePhase } = useSDLCStore();
  const [isAddingRequirement, setIsAddingRequirement] = useState(false);
  const [newRequirement, setNewRequirement] = useState<Partial<Requirement>>({
    type: 'functional',
    priority: 'medium',
    status: 'draft',
  });

  const handleAddRequirement = () => {
    if (!newRequirement.title || !newRequirement.description) return;

    const requirement: Requirement = {
      id: crypto.randomUUID(),
      type: newRequirement.type || 'functional',
      title: newRequirement.title,
      description: newRequirement.description,
      priority: newRequirement.priority || 'medium',
      status: 'draft',
    };

    addRequirement(requirement);
    setNewRequirement({ type: 'functional', priority: 'medium', status: 'draft' });
    setIsAddingRequirement(false);

    // Update progress
    const currentReqs = project?.requirements.length || 0;
    const progress = Math.min((currentReqs + 1) * 10, 100);
    updatePhaseProgress('requirements', progress);
  };

  const generateSRSFromAI = async () => {
    // Simulated AI generation
    const mockRequirements: Requirement[] = [
      {
        id: crypto.randomUUID(),
        type: 'functional',
        title: 'User Authentication',
        description: 'Users must be able to register, login, and manage their accounts securely.',
        priority: 'high',
        status: 'draft',
      },
      {
        id: crypto.randomUUID(),
        type: 'functional',
        title: 'Data Dashboard',
        description: 'System shall provide a real-time dashboard displaying key metrics and analytics.',
        priority: 'high',
        status: 'draft',
      },
      {
        id: crypto.randomUUID(),
        type: 'non-functional',
        title: 'Performance',
        description: 'The system must respond to user actions within 200ms under normal load.',
        priority: 'medium',
        status: 'draft',
      },
      {
        id: crypto.randomUUID(),
        type: 'non-functional',
        title: 'Scalability',
        description: 'System must support up to 10,000 concurrent users without degradation.',
        priority: 'medium',
        status: 'draft',
      },
    ];

    mockRequirements.forEach(req => addRequirement(req));
    updatePhaseProgress('requirements', 60);
  };

  const functionalReqs = project?.requirements.filter(r => r.type === 'functional') || [];
  const nonFunctionalReqs = project?.requirements.filter(r => r.type === 'non-functional') || [];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/10 text-green-400 border-green-500/30';
      default: return 'bg-secondary text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'implemented': return <CheckCircle2 className="w-4 h-4 text-primary" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Requirements Specification</h2>
          <p className="text-muted-foreground">
            Define and manage your project requirements
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={generateSRSFromAI}>
            <Sparkles className="w-4 h-4 mr-2" />
            Generate from AI
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export SRS
          </Button>
          <Button onClick={() => setIsAddingRequirement(true)} className="bg-gradient-primary text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />
            Add Requirement
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Requirements', value: project?.requirements.length || 0, color: 'text-primary' },
          { label: 'Functional', value: functionalReqs.length, color: 'text-blue-400' },
          { label: 'Non-Functional', value: nonFunctionalReqs.length, color: 'text-purple-400' },
          { label: 'Use Cases', value: project?.useCases.length || 0, color: 'text-green-400' },
        ].map((stat, idx) => (
          <Card key={idx} className="glass-card">
            <CardContent className="pt-6">
              <p className="text-3xl font-bold mb-1 tabular-nums">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Requirement Form */}
      {isAddingRequirement && (
        <Card className="glass-card animate-slide-up">
          <CardHeader>
            <CardTitle className="text-lg">New Requirement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <Select 
                  value={newRequirement.type} 
                  onValueChange={(v) => setNewRequirement({...newRequirement, type: v as any})}
                >
                  <SelectTrigger className="bg-secondary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="functional">Functional</SelectItem>
                    <SelectItem value="non-functional">Non-Functional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Priority</label>
                <Select 
                  value={newRequirement.priority} 
                  onValueChange={(v) => setNewRequirement({...newRequirement, priority: v as any})}
                >
                  <SelectTrigger className="bg-secondary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <Input 
                placeholder="Requirement title..."
                value={newRequirement.title || ''}
                onChange={(e) => setNewRequirement({...newRequirement, title: e.target.value})}
                className="bg-secondary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea 
                placeholder="Detailed description of the requirement..."
                value={newRequirement.description || ''}
                onChange={(e) => setNewRequirement({...newRequirement, description: e.target.value})}
                className="bg-secondary min-h-[100px]"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsAddingRequirement(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddRequirement} className="bg-gradient-primary text-primary-foreground">
                Add Requirement
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Requirements Tabs */}
      <Tabs defaultValue="functional" className="space-y-4">
        <TabsList className="bg-secondary">
          <TabsTrigger value="functional">
            Functional ({functionalReqs.length})
          </TabsTrigger>
          <TabsTrigger value="non-functional">
            Non-Functional ({nonFunctionalReqs.length})
          </TabsTrigger>
          <TabsTrigger value="use-cases">
            Use Cases ({project?.useCases.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="functional" className="space-y-3">
          {functionalReqs.length === 0 ? (
            <Card className="glass-card p-8 text-center">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No functional requirements yet</p>
              <p className="text-muted-foreground mb-4">
                Add requirements manually or let AI generate them from your project idea
              </p>
              <Button onClick={generateSRSFromAI}>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Requirements
              </Button>
            </Card>
          ) : (
            functionalReqs.map((req) => (
              <Card key={req.id} className="glass-card hover:border-primary/30 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(req.status)}
                        <h3 className="font-semibold">{req.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{req.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(req.priority)} variant="outline">
                        {req.priority}
                      </Badge>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="non-functional" className="space-y-3">
          {nonFunctionalReqs.length === 0 ? (
            <Card className="glass-card p-8 text-center">
              <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No non-functional requirements yet</p>
              <p className="text-muted-foreground">
                Define performance, security, and other quality attributes
              </p>
            </Card>
          ) : (
            nonFunctionalReqs.map((req) => (
              <Card key={req.id} className="glass-card hover:border-primary/30 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(req.status)}
                        <h3 className="font-semibold">{req.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{req.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(req.priority)} variant="outline">
                        {req.priority}
                      </Badge>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="use-cases" className="space-y-3">
          <Card className="glass-card p-8 text-center">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Use Cases Coming Soon</p>
            <p className="text-muted-foreground">
              Use case modeling will be available in the Design phase
            </p>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Next Phase Button */}
      {(project?.requirements.length || 0) >= 3 && (
        <div className="flex justify-end pt-4">
          <Button 
            onClick={() => setActivePhase('design')}
            className="bg-gradient-primary text-primary-foreground"
          >
            Continue to Design Phase
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
};
