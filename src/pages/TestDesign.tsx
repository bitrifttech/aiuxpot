import { useParams, useNavigate } from "react-router-dom";
import { useProject } from "@/contexts/ProjectContext";
import { Button } from "@/components/ui/button";

export default function TestDesign() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { projects } = useProject();
  
  const project = projects.find(p => p.id === projectId);
  
  if (!project) {
    return (
      <div className="p-4">
        <p>Project not found</p>
        <Button onClick={() => navigate('/')}>Go back</Button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <Button onClick={() => navigate('/')}>Go back</Button>
      </div>
      <h1 className="text-2xl font-bold mb-4">{project.title}</h1>
      <p>{project.description}</p>
    </div>
  );
}
