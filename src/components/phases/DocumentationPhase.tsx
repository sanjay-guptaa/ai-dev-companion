import React, { useState } from 'react';
import { useSDLCStore } from '@/store/sdlcStore';
import { cn } from '@/lib/utils';
import { 
  BookOpen, 
  FileText,
  Code,
  Database,
  TestTube,
  Rocket,
  Download,
  Edit,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DOC_TYPES = [
  { id: 'srs', label: 'Requirements (SRS)', icon: FileText, status: 'generated' },
  { id: 'design', label: 'Design Documentation', icon: Database, status: 'generated' },
  { id: 'developer', label: 'Developer Guide', icon: Code, status: 'pending' },
  { id: 'api', label: 'API Documentation', icon: Code, status: 'pending' },
  { id: 'testing', label: 'Testing Documentation', icon: TestTube, status: 'generated' },
  { id: 'deployment', label: 'Deployment Guide', icon: Rocket, status: 'pending' },
];

const MOCK_SRS_CONTENT = `
# Software Requirements Specification

## 1. Introduction

### 1.1 Purpose
This document specifies the software requirements for the project management system designed to help teams track and manage their software development lifecycle.

### 1.2 Scope
The system will provide comprehensive SDLC management including requirements tracking, design documentation, development assistance, testing, and deployment guidance.

## 2. Functional Requirements

### 2.1 User Authentication
- FR-001: Users shall be able to register with email and password
- FR-002: Users shall be able to login with valid credentials
- FR-003: System shall support password reset via email

### 2.2 Project Management
- FR-004: Users shall be able to create new projects
- FR-005: Users shall be able to define project requirements
- FR-006: System shall generate design artifacts from requirements

## 3. Non-Functional Requirements

### 3.1 Performance
- NFR-001: System shall respond to user actions within 200ms
- NFR-002: Dashboard shall load within 2 seconds

### 3.2 Security
- NFR-003: All data shall be encrypted in transit using TLS 1.3
- NFR-004: Passwords shall be hashed using bcrypt

## 4. Constraints
- System must be compatible with modern web browsers
- Must support deployment on cloud platforms

## 5. Assumptions
- Users have reliable internet connectivity
- Users are familiar with basic SDLC concepts
`;

export const DocumentationPhase: React.FC = () => {
  const { project, updatePhaseProgress, setActivePhase } = useSDLCStore();
  const [selectedDoc, setSelectedDoc] = useState('srs');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateDoc = async (docId: string) => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsGenerating(false);
    updatePhaseProgress('documentation', 80);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Documentation</h2>
          <p className="text-muted-foreground">
            Auto-generated and synchronized documentation
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export All
          </Button>
          <Button className="bg-gradient-primary text-primary-foreground">
            <Sparkles className="w-4 h-4 mr-2" />
            Regenerate All
          </Button>
        </div>
      </div>

      {/* Doc Types Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {DOC_TYPES.map((doc) => {
          const Icon = doc.icon;
          const isSelected = selectedDoc === doc.id;
          
          return (
            <button
              key={doc.id}
              onClick={() => setSelectedDoc(doc.id)}
              className={cn(
                'glass-card p-4 text-center transition-all hover:border-primary/50',
                isSelected && 'border-primary bg-primary/5'
              )}
            >
              <div className={cn(
                'w-10 h-10 mx-auto rounded-lg flex items-center justify-center mb-2',
                doc.status === 'generated' ? 'bg-primary/20' : 'bg-secondary'
              )}>
                <Icon className={cn('w-5 h-5', doc.status === 'generated' && 'text-primary')} />
              </div>
              <p className="text-sm font-medium">{doc.label}</p>
              <p className={cn(
                'text-xs mt-1',
                doc.status === 'generated' ? 'text-primary' : 'text-muted-foreground'
              )}>
                {doc.status === 'generated' ? 'Generated' : 'Pending'}
              </p>
            </button>
          );
        })}
      </div>

      {/* Document Viewer */}
      <Card className="glass-card">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            {DOC_TYPES.find(d => d.id === selectedDoc)?.label}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button variant="ghost" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {selectedDoc === 'srs' ? (
            <div className="prose prose-invert prose-sm max-w-none">
              <pre className="whitespace-pre-wrap font-mono text-sm bg-secondary/50 p-4 rounded-lg overflow-auto max-h-[500px]">
                {MOCK_SRS_CONTENT}
              </pre>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center border border-dashed border-border rounded-lg">
              <div className="text-center">
                <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  Click to generate this documentation
                </p>
                <Button onClick={() => generateDoc(selectedDoc)} disabled={isGenerating}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isGenerating ? 'Generating...' : 'Generate Documentation'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Next Phase */}
      <div className="flex justify-end pt-4">
        <Button 
          onClick={() => setActivePhase('deployment')}
          className="bg-gradient-primary text-primary-foreground"
        >
          Continue to Deployment
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
