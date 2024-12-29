import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { File, FolderOpen, Plus, Trash2, ChevronRight, ChevronDown } from "lucide-react";
import { memoryFS } from "@/utils/memoryFileSystem";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface FilePaneProps {
  onFileSelect: (fileName: string) => void;
  currentFileName?: string;
}

interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileTreeNode[];
}

interface FileTreeStructure {
  [key: string]: FileTreeNode;
}

export const FilePane = ({ onFileSelect, currentFileName }: FilePaneProps) => {
  const [files, setFiles] = useState<string[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/']));
  const [isNewFileDialogOpen, setIsNewFileDialogOpen] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const updateFiles = () => {
      const filesList = memoryFS.listFiles();
      setFiles(filesList);
      console.log('Files list updated:', filesList);
      
      // If we have files and no current file is selected, select the first one
      if (filesList.length > 0 && !currentFileName) {
        console.log('Selecting initial file:', filesList[0]);
        onFileSelect(filesList[0]);
      }
    };

    updateFiles();
  }, [currentFileName, onFileSelect]);

  const handleFileClick = (fileName: string) => {
    // Remove leading slash if present
    const normalizedPath = fileName.startsWith('/') ? fileName.slice(1) : fileName;
    console.log('Handling file click with normalized path:', normalizedPath);
    onFileSelect(normalizedPath);
  };

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

    // Add .tsx extension if not provided
    const fileName = newFileName.endsWith('.tsx') ? newFileName : `${newFileName}.tsx`;
    // Remove any leading slash
    const normalizedFileName = fileName.startsWith('/') ? fileName.slice(1) : fileName;

    if (memoryFS.readFile(normalizedFileName)) {
      toast({
        title: "Error",
        description: "A file with this name already exists",
        variant: "destructive",
      });
      return;
    }

    memoryFS.writeFile(normalizedFileName, `// ${normalizedFileName}\n\nexport default function ${newFileName.split('.')[0]}() {\n  return (\n    <div>\n      New Component\n    </div>\n  );\n}`);
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

  const buildFileTree = (files: string[]): FileTreeNode[] => {
    const root: FileTreeStructure = {};

    files.forEach(filePath => {
      const parts = filePath.split('/').filter(Boolean);
      let currentLevel = root;
      let currentPath = '';

      parts.forEach((part, index) => {
        currentPath += '/' + part;
        if (!currentLevel[currentPath]) {
          currentLevel[currentPath] = {
            name: part,
            path: currentPath,
            type: index === parts.length - 1 ? 'file' : 'directory',
            children: index === parts.length - 1 ? undefined : []
          };
        }
        if (index !== parts.length - 1) {
          // Ensure children is initialized as an array
          if (!currentLevel[currentPath].children) {
            currentLevel[currentPath].children = [];
          }
          // Find the next level in the children array
          const nextLevel: FileTreeStructure = {};
          currentLevel = nextLevel;
        }
      });
    });

    // Convert the tree structure to array format
    return Object.values(root).map(node => ({
      ...node,
      children: node.children || undefined
    }));
  };

  const renderFileTree = (nodes: FileTreeNode[], level: number = 0) => {
    return nodes.map((node) => (
      <div key={node.path} style={{ paddingLeft: `${level * 12}px` }}>
        {node.type === 'directory' ? (
          <div className="group flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 px-2"
              onClick={() => toggleFolder(node.path)}
            >
              {expandedFolders.has(node.path) ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <FolderOpen className="h-4 w-4" />
              <span className="truncate">{node.name}</span>
            </Button>
          </div>
        ) : (
          <div
            className={`group flex items-center justify-between p-2 rounded-md hover:bg-accent text-sm ${
              currentFileName === node.path ? 'bg-accent' : ''
            }`}
          >
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 px-2"
              onClick={() => handleFileClick(node.path)}
            >
              <File className="h-4 w-4" />
              <span className="truncate">{node.name}</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100"
              onClick={() => handleDeleteFile(node.path)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
        {node.type === 'directory' && expandedFolders.has(node.path) && node.children && (
          <div className="pl-2">
            {renderFileTree(node.children, level + 1)}
          </div>
        )}
      </div>
    ));
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
          {renderFileTree(fileTree)}
        </div>
      </ScrollArea>
    </div>
  );
};