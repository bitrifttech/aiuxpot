import { Project } from "@/types/project";
import { ProjectCard } from "./ProjectCard";
import { CreateProjectDialog } from "./CreateProjectDialog";
import { useProject } from "@/contexts/ProjectContext";

export function MainWorkspace() {
  const { projects, addProject, deleteProject } = useProject();

  return (
    <div className="flex-1 p-6">
      <div className="grid gap-6">
        <section>
          <h2 className="text-xl font-semibold mb-4">My Projects</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <CreateProjectDialog onCreateProject={addProject} />
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={deleteProject}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}