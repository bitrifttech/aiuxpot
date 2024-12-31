import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useState } from 'react';
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { TestTube } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Project } from "@/types/project";

interface ProjectCardProps {
  project: Project;
  onDelete: (id: string) => void;
  className?: string;
}

export function ProjectCard({ project, onDelete, className }: ProjectCardProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { isMobile } = useSidebar();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    onDelete(project.id);
    setShowDeleteDialog(false);
    toast({
      title: "Project deleted",
      description: `${project.title} has been deleted successfully.`,
    });
  };

  const handleClick = () => {
    navigate(`/design/${project.id}`);
  };

  return (
    <>
      <Card 
        className={cn(
          "hover:border-primary/50 transition-colors cursor-pointer",
          "flex flex-col",
          className
        )}
        onClick={handleClick}
      >
        <CardHeader>
          <CardTitle className="flex justify-between items-center gap-2">
            <span className="truncate">{project.title}</span>
            <div className="flex gap-2 flex-shrink-0">
              {!isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/test-design/${project.id}`);
                  }}
                >
                  <TestTube className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Test</span>
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive/90"
                onClick={handleDelete}
              >
                <Trash className="h-4 w-4" />
                {!isMobile && <span className="ml-1 hidden sm:inline">Delete</span>}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {project.description}
          </p>
        </CardContent>
        <CardFooter className="mt-auto text-xs text-muted-foreground">
          <div className="flex justify-between items-center w-full">
            <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/test-design/${project.id}`);
                }}
              >
                <TestTube className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the project "{project.title}" and all its files.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}