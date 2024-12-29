import { File, FolderOpen, Trash2, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileTreeNodeType } from "./types";

interface FileTreeNodeProps {
  node: FileTreeNodeType;
  level: number;
  currentFileName?: string;
  expandedFolders: Set<string>;
  onFileSelect: (fileName: string) => void;
  onDeleteFile: (path: string) => void;
  onToggleFolder: (path: string) => void;
}

export const FileTreeNode = ({
  node,
  level,
  currentFileName,
  expandedFolders,
  onFileSelect,
  onDeleteFile,
  onToggleFolder,
}: FileTreeNodeProps) => {
  const handleFileClick = () => {
    console.log('FileTreeNode: Handling file click:', node.path);
    onFileSelect(node.path);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteFile(node.path);
  };

  if (node.type === 'directory') {
    return (
      <div key={node.path}>
        <div className="group flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 px-2"
            onClick={() => onToggleFolder(node.path)}
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
        {expandedFolders.has(node.path) && node.children && (
          <div className="pl-2">
            {node.children.map((child) => (
              <FileTreeNode
                key={child.path}
                node={child}
                level={level + 1}
                currentFileName={currentFileName}
                expandedFolders={expandedFolders}
                onFileSelect={onFileSelect}
                onDeleteFile={onDeleteFile}
                onToggleFolder={onToggleFolder}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`group flex items-center justify-between p-2 rounded-md hover:bg-accent text-sm ${
        currentFileName === node.path ? 'bg-accent' : ''
      }`}
      style={{ paddingLeft: `${level * 12}px` }}
    >
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start gap-2 px-2"
        onClick={handleFileClick}
      >
        <File className="h-4 w-4" />
        <span className="truncate">{node.name}</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 opacity-0 group-hover:opacity-100"
        onClick={handleDeleteClick}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};