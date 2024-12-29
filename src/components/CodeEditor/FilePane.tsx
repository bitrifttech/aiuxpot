import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Plus, FolderPlus } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { FileTreeNode } from "./FileTree/FileTreeNode";
import { buildFileTree } from "./FileTree/utils";
import { fileApi } from "@/utils/fileApi";
import { FileTreeNodeType } from "./FileTree/types";

interface FilePaneProps {
  onFileSelect: (fileName: string) => void;
  currentFileName?: string;
}

export const FilePane = ({ onFileSelect, currentFileName }: FilePaneProps) => {
  const [files, setFiles] = useState<string[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/']));
  const [isNewFileDialogOpen, setIsNewFileDialogOpen] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const { toast } = useToast();

  const updateFiles = async () => {
    const filesList = await fileApi.listFiles();
    console.log('Files list updated:', filesList);
    setFiles(filesList);
    
    if (filesList.length > 0 && !currentFileName) {
      // Find the first file (not directory) to select
      const fileTree = buildFileTree(filesList);
      const findFirstFile = (nodes: FileTreeNodeType[]): string | undefined => {
        for (const node of nodes) {
          if (node.type === 'file') {
            return node.path;
          }
          if (node.children?.length) {
            const found = findFirstFile(node.children);
            if (found) return found;
          }
        }
        return undefined;
      };
      
      const firstFile = findFirstFile(fileTree);
      if (firstFile) {
        console.log('Auto-selecting initial file:', firstFile);
        onFileSelect(firstFile);
      }
    }
  };

  useEffect(() => {
    updateFiles();
    const interval = setInterval(updateFiles, 1000);
    return () => clearInterval(interval);
  }, [currentFileName, onFileSelect]);

  const handleDeleteFile = async (path: string) => {
    const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
    const success = await fileApi.deleteFile(normalizedPath);
    if (success) {
      await updateFiles();
      console.log('File deleted:', normalizedPath);
    }
  };

  const handleCreateFile = async () => {
    if (!newFileName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a file name",
        variant: "destructive",
      });
      return;
    }

    const fileName = newFileName.endsWith('.tsx') ? newFileName : `${newFileName}.tsx`;
    const normalizedFileName = fileName.startsWith('/') ? fileName.slice(1) : fileName;

    const content = `// ${normalizedFileName}\n\nexport default function ${newFileName.split('.')[0]}() {\n  return (\n    <div>\n      New Component\n    </div>\n  );\n}`;
    
    const success = await fileApi.writeFile(normalizedFileName, content);
    if (success) {
      await updateFiles();
      setNewFileName("");
      setIsNewFileDialogOpen(false);
      onFileSelect(normalizedFileName);
      
      toast({
        title: "Success",
        description: "File created successfully",
      });
    }
  };

  const handleInitProject = async () => {
    try {
      const response = await fetch('/api/init', { method: 'POST' });
      if (!response.ok) {
        throw new Error('Failed to initialize project');
      }
      await updateFiles();
      toast({
        title: "Success",
        description: "Project initialized successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initialize project",
        variant: "destructive",
      });
    }
  };

  const handleToggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const fileTree = buildFileTree(files);

  return (
    <div className="h-full border-r bg-background">
      <div className="p-2 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Files</h2>
          <div className="flex items-center space-x-1">
            <Dialog open={isNewFileDialogOpen} onOpenChange={setIsNewFileDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New File</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); handleCreateFile(); }} className="space-y-4">
                  <div>
                    <label htmlFor="fileName" className="text-sm font-medium">
                      File Name
                    </label>
                    <Input
                      id="fileName"
                      value={newFileName}
                      onChange={(e) => setNewFileName(e.target.value)}
                      placeholder="Enter file name (e.g., MyComponent.tsx)"
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Create File
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleInitProject}
              title="Initialize New Project"
            >
              <FolderPlus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <ScrollArea className="h-[calc(100%-40px)]">
        <div className="p-2 space-y-1">
          {fileTree.map((node) => (
            <FileTreeNode
              key={node.path}
              node={node}
              level={0}
              currentFileName={currentFileName}
              expandedFolders={expandedFolders}
              onFileSelect={onFileSelect}
              onDeleteFile={handleDeleteFile}
              onToggleFolder={handleToggleFolder}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};