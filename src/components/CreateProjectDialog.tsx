import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateProjectDialogProps {
  onCreateProject: (title: string, description: string) => Promise<void>;
  className?: string;
  variant?: 'default' | 'floating';
}

export function CreateProjectDialog({ 
  onCreateProject, 
  className,
  variant = 'default' 
}: CreateProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a project title",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      await onCreateProject(title, description);
      setTitle("");
      setDescription("");
      setOpen(false);
      toast({
        title: "Success",
        description: "Project created successfully",
      });
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {variant === 'floating' ? (
          <Button
            size="icon"
            className={cn(
              "h-14 w-14 rounded-full shadow-lg",
              "bg-primary hover:bg-primary/90",
              className
            )}
          >
            <Plus className="h-6 w-6" />
          </Button>
        ) : (
          <div
            className={cn(
              "hover:border-primary/50 transition-colors cursor-pointer p-4 flex items-center justify-center",
              className
            )}
          >
            <div className="text-center">
              <Plus className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <h3 className="font-medium">Create New Project</h3>
            </div>
          </div>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new project.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Project Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter project title"
              disabled={isCreating}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter project description"
              disabled={isCreating}
            />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={isCreating}
              className="w-full sm:w-auto"
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Project"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}