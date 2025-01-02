import React from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, File } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFileSystem } from '@/contexts/filesystem-context';
import { FileSystemNode } from '@/types/filesystem';
import { Button } from '@/components/ui/button';

interface FileTreeNodeProps {
  node: FileSystemNode;
  depth: number;
}

function FileTreeNode({ node, depth }: FileTreeNodeProps) {
  const { isExpanded, isSelected, toggleNode, selectNode } = useFileSystem();
  const expanded = isExpanded(node.id);
  const selected = isSelected(node.id);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectNode(node.id);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.type === 'directory') {
      toggleNode(node.id);
    }
  };

  const getIcon = () => {
    if (node.type === 'directory') {
      return expanded ? <FolderOpen className="h-4 w-4" /> : <Folder className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  };

  return (
    <div>
      <div
        className={cn(
          'flex items-center px-2 py-1 hover:bg-accent/50 cursor-pointer',
          selected && 'bg-accent',
          'transition-colors'
        )}
        style={{ paddingLeft: `${depth * 12}px` }}
        onClick={handleClick}
      >
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'h-4 w-4 p-0 hover:bg-transparent',
            node.type !== 'directory' && 'invisible'
          )}
          onClick={handleToggle}
        >
          {expanded ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </Button>
        <div className="flex items-center gap-2 ml-1">
          {getIcon()}
          <span className="text-sm truncate">{node.name}</span>
        </div>
      </div>
      {expanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileTree() {
  const { state } = useFileSystem();

  return (
    <div className="h-full overflow-auto">
      <FileTreeNode node={state.root} depth={0} />
    </div>
  );
}
