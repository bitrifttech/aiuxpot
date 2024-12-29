import { useState } from "react";
import { Project } from "@/types/project";
import { ProjectCard } from "./ProjectCard";
import { CreateProjectDialog } from "./CreateProjectDialog";

export function MainWorkspace() {
  const [projects, setProjects] = useState<Project[]>([]);

  const handleCreateProject = (title: string, description: string) => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      title,
      description,
      createdAt: new Date(),
    };
    setProjects((prev) => [...prev, newProject]);
  };

  const handleDeleteProject = (id: string) => {
    setProjects((prev) => prev.filter((project) => project.id !== id));
  };

  return (
    <div className="flex-1 p-6">
      <div className="grid gap-6">
        <section>
          <h2 className="text-xl font-semibold mb-4">My Projects</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <CreateProjectDialog onCreateProject={handleCreateProject} />
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={handleDeleteProject}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}