import React from 'react';
import { useProjectStore } from '@/store/projectStore';
import { cn } from '@/lib/utils';
import { 
  Rocket, 
  Cloud,
  Container,
  GitBranch,
  Server,
  Shield,
  CheckCircle2,
  Copy,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const DEPLOYMENT_OPTIONS = [
  { id: 'vercel', name: 'Vercel', icon: Cloud, description: 'Optimal for React/Next.js apps', recommended: true },
  { id: 'netlify', name: 'Netlify', icon: Cloud, description: 'Great for static sites and SPAs' },
  { id: 'docker', name: 'Docker', icon: Container, description: 'Containerized deployment' },
  { id: 'aws', name: 'AWS', icon: Server, description: 'Full cloud infrastructure' },
];

const CI_CD_TEMPLATE = `
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: build
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: build
      - name: Deploy to production
        run: echo "Deploy step here"
`.trim();

const DOCKERFILE_TEMPLATE = `
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
`.trim();

export const DeploymentPhase: React.FC<{ canEdit?: boolean }> = ({ canEdit = true }) => {
  const { project, updatePhaseProgress } = useProjectStore();
  const [selectedPlatform, setSelectedPlatform] = React.useState('vercel');

  const copyCode = (code: string, name: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`${name} copied to clipboard!`);
  };

  const deploymentChecklist = [
    { id: 1, label: 'Environment variables configured', done: true },
    { id: 2, label: 'Database migrations ready', done: true },
    { id: 3, label: 'CI/CD pipeline set up', done: false },
    { id: 4, label: 'SSL/TLS configured', done: false },
    { id: 5, label: 'Monitoring and logging enabled', done: false },
    { id: 6, label: 'Backup strategy implemented', done: false },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Deployment</h2>
          <p className="text-muted-foreground">
            CI/CD setup and deployment guidance
          </p>
        </div>
        <Button className="bg-gradient-primary text-primary-foreground">
          <Rocket className="w-4 h-4 mr-2" />
          Deploy to Production
        </Button>
      </div>

      {/* Deployment Platforms */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Choose Deployment Platform</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {DEPLOYMENT_OPTIONS.map((platform) => {
            const Icon = platform.icon;
            const isSelected = selectedPlatform === platform.id;
            
            return (
              <button
                key={platform.id}
                onClick={() => setSelectedPlatform(platform.id)}
                className={cn(
                  'glass-card p-4 text-left transition-all hover:border-primary/50 relative',
                  isSelected && 'border-primary bg-primary/5'
                )}
              >
                {platform.recommended && (
                  <span className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                    Recommended
                  </span>
                )}
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center mb-3',
                  isSelected ? 'bg-primary/20' : 'bg-secondary'
                )}>
                  <Icon className={cn('w-5 h-5', isSelected && 'text-primary')} />
                </div>
                <p className="font-semibold">{platform.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{platform.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Configuration Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-primary" />
              GitHub Actions Workflow
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => copyCode(CI_CD_TEMPLATE, 'Workflow')}>
              <Copy className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="code-block">
              <pre className="font-mono text-xs overflow-auto max-h-64">{CI_CD_TEMPLATE}</pre>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Container className="w-5 h-5 text-primary" />
              Dockerfile
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => copyCode(DOCKERFILE_TEMPLATE, 'Dockerfile')}>
              <Copy className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="code-block">
              <pre className="font-mono text-xs overflow-auto max-h-64">{DOCKERFILE_TEMPLATE}</pre>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deployment Checklist */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Pre-Deployment Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deploymentChecklist.map((item) => (
              <div
                key={item.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg',
                  item.done ? 'bg-green-500/10' : 'bg-secondary/50'
                )}
              >
                <CheckCircle2
                  className={cn(
                    'w-5 h-5',
                    item.done ? 'text-green-400' : 'text-muted-foreground'
                  )}
                />
                <span className={cn(
                  'text-sm',
                  item.done ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* VS Code Extension Guide */}
      <Card className="glass-card border-primary/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-primary" />
            Build as VS Code Extension
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            This web app can complement a VS Code extension. See the documentation below for scaffolding a full TypeScript VS Code extension with the same SDLC features.
          </p>
          <Button variant="outline">
            View Extension Scaffold Guide
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
