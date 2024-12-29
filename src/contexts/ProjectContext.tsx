import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Project } from '@/types/project';

interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  addProject: (title: string, description: string) => void;
  deleteProject: (id: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const PROJECTS_KEY = 'aiuxpot-projects';
const CURRENT_PROJECT_KEY = 'aiuxpot-current-project';

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const savedProjects = localStorage.getItem(PROJECTS_KEY);
      if (savedProjects) {
        return JSON.parse(savedProjects);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
    return [];
  });

  const [currentProject, setCurrentProject] = useState<Project | null>(() => {
    try {
      const savedProject = localStorage.getItem(CURRENT_PROJECT_KEY);
      if (savedProject) {
        return JSON.parse(savedProject);
      }
    } catch (error) {
      console.error('Error loading current project:', error);
    }
    return null;
  });

  // Save projects to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    } catch (error) {
      console.error('Error saving projects:', error);
    }
  }, [projects]);

  // Save current project to localStorage
  useEffect(() => {
    try {
      if (currentProject) {
        localStorage.setItem(CURRENT_PROJECT_KEY, JSON.stringify(currentProject));
      } else {
        localStorage.removeItem(CURRENT_PROJECT_KEY);
      }
    } catch (error) {
      console.error('Error saving current project:', error);
    }
  }, [currentProject]);

  const addProject = (title: string, description: string) => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      title,
      description,
      createdAt: new Date().toISOString(),
    };
    setProjects((prev) => [...prev, newProject]);
    setCurrentProject(newProject);
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((project) => project.id !== id));
    if (currentProject?.id === id) {
      setCurrentProject(null);
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        currentProject,
        setProjects,
        setCurrentProject,
        addProject,
        deleteProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
