import React, { useEffect } from 'react';
import { useSDLCStore } from '@/store/sdlcStore';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProjectIdeaForm } from '@/components/phases/ProjectIdeaForm';
import { RequirementsPhase } from '@/components/phases/RequirementsPhase';
import { DesignPhase } from '@/components/phases/DesignPhase';
import { DevelopmentPhase } from '@/components/phases/DevelopmentPhase';
import { TestingPhase } from '@/components/phases/TestingPhase';
import { DocumentationPhase } from '@/components/phases/DocumentationPhase';
import { DeploymentPhase } from '@/components/phases/DeploymentPhase';

const Index = () => {
  const { activePhase, project, resetProject } = useSDLCStore();

  // Initialize empty project on first load
  useEffect(() => {
    if (!project) {
      resetProject();
    }
  }, [project, resetProject]);

  const renderPhase = () => {
    switch (activePhase) {
      case 'idea':
        return <ProjectIdeaForm />;
      case 'requirements':
        return <RequirementsPhase />;
      case 'design':
        return <DesignPhase />;
      case 'development':
        return <DevelopmentPhase />;
      case 'testing':
        return <TestingPhase />;
      case 'documentation':
        return <DocumentationPhase />;
      case 'deployment':
        return <DeploymentPhase />;
      default:
        return <ProjectIdeaForm />;
    }
  };

  return (
    <DashboardLayout>
      {renderPhase()}
    </DashboardLayout>
  );
};

export default Index;
