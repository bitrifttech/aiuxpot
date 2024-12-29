import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { memoryFS } from "@/utils/memoryFileSystem";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { FileTreeNode } from "./FileTree/FileTreeNode";
import { buildFileTree } from "./FileTree/utils";

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

  // Initialize files list and select first file if none selected
  useEffect(() => {
    const updateFiles = () => {
      const filesList = memoryFS.listFiles();
      console.log('Initializing files list:', filesList);
      setFiles(filesList);
      
      // If we have files and no current file is selected, select the first one
      if (filesList.length > 0 && !currentFileName) {
        const firstFile = filesList[0];
        console.log('Auto-selecting initial file:', firstFile);
        onFileSelect(firstFile);
      }
    };

    // Initial load
    updateFiles();

    // Set up an interval to check for new files
    const interval = setInterval(updateFiles, 1000);

    return () => clearInterval(interval);
  }, [currentFileName, onFileSelect]);

  const handleDeleteFile = (path: string) => {
    const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
    memoryFS.deleteFile(normalizedPath);
    setFiles(memoryFS.listFiles());
    console.log('File deleted:', normalizedPath);
  };

  const handleCreateFile = () => {
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

    if (memoryFS.readFile(normalizedFileName)) {
      toast({
        title: "Error",
        description: "A file with this name already exists",
        variant: "destructive",
      });
      return;
    }

    memoryFS.writeFile(
      normalizedFileName,
      `// ${normalizedFileName}\n\nexport default function ${newFileName.split('.')[0]}() {\n  return (\n    <div>\n      New Component\n    </div>\n  );\n}`
    );
    
    setFiles(memoryFS.listFiles());
    setNewFileName("");
    setIsNewFileDialogOpen(false);
    onFileSelect(normalizedFileName);
    
    toast({
      title: "Success",
      description: "File created successfully",
    });
  };

  const toggleFolder = (path: string) => {
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
              onToggleFolder={toggleFolder}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};