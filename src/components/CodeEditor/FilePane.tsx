import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { File, FolderOpen, Plus, Trash2, ChevronRight, ChevronDown } from "lucide-react";
import { memoryFS } from "@/utils/memoryFileSystem";
import { useState, useEffect } from "react";

interface FilePaneProps {
  onFileSelect: (fileName: string) => void;
  currentFileName?: string;
}

interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: Record<string, FileTreeNode>;
}

interface FileTreeStructure {
  [key: string]: FileTreeNode;
}

export const FilePane = ({ onFileSelect, currentFileName }: FilePaneProps) => {
  const [files, setFiles] = useState<string[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/']));

  useEffect(() => {
    // Update files list whenever component mounts or files change
    const updateFiles = () => {
      const filesList = memoryFS.listFiles();
      setFiles(filesList);
      console.log('Files list updated:', filesList);
    };

    updateFiles();
  }, []);

  const handleFileClick = (fileName: string) => {
    onFileSelect(fileName);
  };

  const handleDeleteFile = (path: string) => {
    memoryFS.deleteFile(path);
    setFiles(memoryFS.listFiles());
    console.log('File deleted:', path);
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
            children: index === parts.length - 1 ? undefined : {}
          };
        }
        if (index !== parts.length - 1) {
          currentLevel = currentLevel[currentPath].children || {};
        }
      });
    });

    return Object.values(root).map(node => ({
      ...node,
      children: node.children ? Object.values(node.children) : undefined
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
        <h2 className="text-sm font-semibold">Files</h2>
      </div>
      <ScrollArea className="h-[calc(100%-40px)]">
        <div className="p-2 space-y-1">
          {renderFileTree(fileTree)}
        </div>
      </ScrollArea>
    </div>
  );
};