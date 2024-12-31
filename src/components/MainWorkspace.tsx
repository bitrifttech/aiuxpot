import { Project } from "@/types/project";
import { ProjectCard } from "./ProjectCard";
import { CreateProjectDialog } from "./CreateProjectDialog";
import { useProject } from "@/contexts/ProjectContext";
import { useSidebar } from "@/components/ui/sidebar";

export function MainWorkspace() {
  const { projects, addProject, deleteProject } = useProject();
  const { isMobile } = useSidebar();

  return (
    <div className="flex-1 p-4 md:p-6 overflow-auto">
      <div className="grid gap-4 md:gap-6 max-w-7xl mx-auto">
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">My Projects</h2>
            <CreateProjectDialog 
              onCreateProject={addProject}
              className="md:hidden" // Show floating button on mobile
            />
          </div>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {!isMobile && (
              <CreateProjectDialog 
                onCreateProject={addProject}
                className="hidden md:block" // Hide on mobile
              />
            )}
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={deleteProject}
                className="w-full"
              />
            ))}
          </div>
        </section>
      </div>
      {isMobile && (
        <div className="fixed bottom-4 right-4 z-40">
          <CreateProjectDialog 
            onCreateProject={addProject}
            variant="floating"
          />
        </div>
      )}
    </div>
  );
}