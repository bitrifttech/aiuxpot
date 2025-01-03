import { File, FolderOpen, Folder, Trash2, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileTreeNodeType } from "./types";
import { cn } from "@/lib/utils";

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
  const isExpanded = expandedFolders.has(node.path);
  const indent = level * 12;

  const handleFileClick = () => {
    console.log('FileTreeNode: Handling file click:', node.path);
    onFileSelect(node.path);
  };

  const handleFolderClick = () => {
    console.log('FileTreeNode: Handling folder click:', node.path);
    onToggleFolder(node.path);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteFile(node.path);
  };

  if (node.type === 'directory') {
    return (
      <div>
        <div
          className={cn(
            "group flex items-center hover:bg-accent rounded-md",
            isExpanded && "bg-accent/50"
          )}
        >
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 px-2"
            onClick={handleFolderClick}
          >
            <span style={{ width: indent }} />
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0" />
            )}
            {isExpanded ? (
              <FolderOpen className="h-4 w-4 shrink-0" />
            ) : (
              <Folder className="h-4 w-4 shrink-0" />
            )}
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
        {isExpanded && node.children && (
          <div className="pl-4">
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
      className={cn(
        "group flex items-center hover:bg-accent rounded-md",
        currentFileName === node.path && "bg-accent"
      )}
    >
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start gap-2 px-2"
        onClick={handleFileClick}
      >
        <span style={{ width: indent }} />
        <File className="h-4 w-4 shrink-0" />
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