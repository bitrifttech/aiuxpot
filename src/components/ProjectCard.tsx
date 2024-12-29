import { Trash } from "lucide-react";
import { Project } from "@/types/project";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { useToast } from "@/hooks/use-toast";

interface ProjectCardProps {
  project: Project;
  onDelete: (id: string) => void;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const { toast } = useToast();

  const handleDelete = () => {
    onDelete(project.id);
    toast({
      title: "Project deleted",
      description: `${project.title} has been deleted successfully.`,
    });
  };

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{project.title}</span>
          <Button variant="ghost" size="icon" onClick={handleDelete}>
            <Trash className="h-4 w-4 text-destructive" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{project.description}</p>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Created: {new Date(project.createdAt).toLocaleDateString()}
      </CardFooter>
    </Card>
  );
}