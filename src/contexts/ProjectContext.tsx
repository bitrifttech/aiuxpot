import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Project } from '@/types/project';
import { previewApi } from '@/utils/previewApi';

interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  addProject: (title: string, description: string) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
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

  // Load projects from backend on mount
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const backendProjects = await previewApi.listProjects();
        const updatedProjects = backendProjects.map(bp => ({
          id: bp.id,
          title: bp.name,
          description: '',
          createdAt: new Date().toISOString(),
        }));
        setProjects(updatedProjects);

        // Update current project if it exists in backend
        if (currentProject) {
          const exists = backendProjects.some(bp => bp.id === currentProject.id);
          if (!exists) {
            setCurrentProject(null);
          }
        }
      } catch (error) {
        console.error('Error loading projects from backend:', error);
      }
    };

    loadProjects();
  }, []);

  // Save projects to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    } catch (error) {
      console.error('Error saving projects:', error);
    }
  }, [projects]);

  // Save current project to localStorage and update preview API
  useEffect(() => {
    try {
      if (currentProject) {
        localStorage.setItem(CURRENT_PROJECT_KEY, JSON.stringify(currentProject));
        previewApi.setCurrentProject(currentProject.id);
      } else {
        localStorage.removeItem(CURRENT_PROJECT_KEY);
      }
    } catch (error) {
      console.error('Error saving current project:', error);
    }
  }, [currentProject]);

  const addProject = async (title: string, description: string) => {
    try {
      // Create project in backend first
      const projectId = await previewApi.createProject(title);
      
      const newProject: Project = {
        id: projectId,
        title,
        description,
        createdAt: new Date().toISOString(),
      };
      
      setProjects(prev => [...prev, newProject]);
      // Set the new project as the current project
      setCurrentProject(newProject);
      
      return newProject;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      // Delete from backend first
      await previewApi.deleteProject(id);
      
      setProjects(prev => prev.filter(project => project.id !== id));
      if (currentProject?.id === id) {
        setCurrentProject(null);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
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
