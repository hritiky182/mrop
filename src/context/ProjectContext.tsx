import React, { createContext, useContext, useState } from 'react';
import { MiningProject } from '@/types';
import { MOCK_PROJECT } from '@/data/mock/project';

interface ProjectContextType {
  project: MiningProject;
  updateProject: (updated: Partial<MiningProject>) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [project, setProject] = useState<MiningProject>(MOCK_PROJECT);

  const updateProject = (updated: Partial<MiningProject>) => {
    setProject((prev) => ({ ...prev, ...updated }));
  };

  return (
    <ProjectContext.Provider value={{ project, updateProject }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
