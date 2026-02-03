import React, { useState } from 'react';
import { useSDLCStore, TestCase } from '@/store/sdlcStore';
import { cn } from '@/lib/utils';
import { 
  TestTube, 
  Plus,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  ChevronRight,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MOCK_TEST_CASES: TestCase[] = [
  {
    id: '1',
    title: 'User can successfully login with valid credentials',
    type: 'functional',
    description: 'Verify that users can access the system with correct email and password',
    steps: ['Navigate to login page', 'Enter valid email', 'Enter valid password', 'Click login button'],
    expectedResult: 'User is redirected to dashboard with session established',
    status: 'passed',
  },
  {
    id: '2',
    title: 'Login fails with invalid password',
    type: 'functional',
    description: 'Verify that authentication fails with incorrect password',
    steps: ['Navigate to login page', 'Enter valid email', 'Enter invalid password', 'Click login button'],
    expectedResult: 'Error message displayed, user remains on login page',
    status: 'passed',
  },
  {
    id: '3',
    title: 'Dashboard loads within 2 seconds',
    type: 'integration',
    description: 'Performance test for dashboard initial load time',
    steps: ['Login as authenticated user', 'Navigate to dashboard', 'Measure load time'],
    expectedResult: 'Dashboard fully rendered in under 2 seconds',
    status: 'pending',
  },
  {
    id: '4',
    title: 'API handles concurrent requests',
    type: 'integration',
    description: 'Load test for API endpoint under concurrent usage',
    steps: ['Simulate 100 concurrent requests', 'Monitor response times', 'Check for errors'],
    expectedResult: 'All requests complete successfully with <500ms response time',
    status: 'failed',
  },
];

export const TestingPhase: React.FC = () => {
  const { project, addTestCase, updatePhaseProgress, setActivePhase } = useSDLCStore();
  const [testCases, setTestCases] = useState<TestCase[]>(MOCK_TEST_CASES);
  const [isRunning, setIsRunning] = useState(false);

  const passedCount = testCases.filter(t => t.status === 'passed').length;
  const failedCount = testCases.filter(t => t.status === 'failed').length;
  const pendingCount = testCases.filter(t => t.status === 'pending').length;
  const passRate = Math.round((passedCount / testCases.length) * 100);

  const runTests = async () => {
    setIsRunning(true);
    // Simulate test execution
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setTestCases(prev => prev.map(t => ({
      ...t,
      status: t.status === 'pending' ? (Math.random() > 0.3 ? 'passed' : 'failed') : t.status
    })));
    
    updatePhaseProgress('testing', 75);
    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'failed': return 'bg-red-500/10 text-red-400 border-red-500/30';
      default: return 'bg-secondary text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Testing & QA</h2>
          <p className="text-muted-foreground">
            Generate and manage test cases
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Tests from Requirements
          </Button>
          <Button 
            onClick={runTests}
            disabled={isRunning}
            className="bg-gradient-primary text-primary-foreground"
          >
            <Play className="w-4 h-4 mr-2" />
            {isRunning ? 'Running...' : 'Run All Tests'}
          </Button>
        </div>
      </div>

      {/* Test Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-3xl font-bold text-foreground">{testCases.length}</p>
              <TestTube className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Total Tests</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-3xl font-bold text-green-400">{passedCount}</p>
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-sm text-muted-foreground">Passed</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-3xl font-bold text-red-400">{failedCount}</p>
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-sm text-muted-foreground">Failed</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-3xl font-bold text-primary">{passRate}%</p>
            </div>
            <Progress value={passRate} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">Pass Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Test Cases */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="bg-secondary">
          <TabsTrigger value="all">All ({testCases.length})</TabsTrigger>
          <TabsTrigger value="functional">Functional</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
          <TabsTrigger value="unit">Unit</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3">
          {testCases.map((test) => (
            <Card key={test.id} className="glass-card hover:border-primary/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(test.status)}
                      <h3 className="font-semibold">{test.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {test.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{test.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="font-medium text-muted-foreground mb-1">Steps:</p>
                        <ol className="list-decimal list-inside space-y-0.5 text-muted-foreground">
                          {test.steps.map((step, idx) => (
                            <li key={idx}>{step}</li>
                          ))}
                        </ol>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground mb-1">Expected Result:</p>
                        <p className="text-muted-foreground">{test.expectedResult}</p>
                      </div>
                    </div>
                  </div>
                  <Badge className={getStatusBadge(test.status)} variant="outline">
                    {test.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="functional" className="space-y-3">
          {testCases.filter(t => t.type === 'functional').map((test) => (
            <Card key={test.id} className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  {getStatusIcon(test.status)}
                  <h3 className="font-semibold">{test.title}</h3>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="integration" className="space-y-3">
          {testCases.filter(t => t.type === 'integration').map((test) => (
            <Card key={test.id} className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  {getStatusIcon(test.status)}
                  <h3 className="font-semibold">{test.title}</h3>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="unit" className="space-y-3">
          <Card className="glass-card p-8 text-center">
            <TestTube className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No unit tests generated yet</p>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Next Phase */}
      <div className="flex justify-end pt-4">
        <Button 
          onClick={() => setActivePhase('documentation')}
          className="bg-gradient-primary text-primary-foreground"
        >
          Continue to Documentation
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
