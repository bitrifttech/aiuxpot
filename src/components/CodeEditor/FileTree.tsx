import { useState, useEffect, useCallback } from 'react';
import { ChevronRight, ChevronDown, Folder, File, Plus, Trash2, Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { fileApi } from '@/utils/fileApi';

interface FileTreeItem {
  name: string;
  type: 'file' | 'directory';
  children?: FileTreeItem[];
  path: string;
}

interface FileTreeProps {
  onSelect: (path: string) => void;
  refreshRef?: React.MutableRefObject<() => void>;
}

export const FileTree = ({ onSelect, refreshRef }: FileTreeProps) => {
  const [items, setItems] = useState<FileTreeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const { toast } = useToast();

  const buildFileTree = (files: string[]): FileTreeItem[] => {
    const root: { [key: string]: FileTreeItem } = {};

    files.forEach(path => {
      const parts = path.split('/');
      let current = root;

      parts.forEach((part, index) => {
        const currentPath = parts.slice(0, index + 1).join('/');
        if (!current[part]) {
          current[part] = {
            name: part,
            type: index === parts.length - 1 ? 'file' : 'directory',
            path: currentPath,
            children: index === parts.length - 1 ? undefined : {}
          };
        }
        if (index < parts.length - 1) {
          current = current[part].children as { [key: string]: FileTreeItem };
        }
      });
    });

    const sortItems = (items: FileTreeItem[]): FileTreeItem[] => {
      return items.sort((a, b) => {
        if (a.type === b.type) {
          return a.name.localeCompare(b.name);
        }
        return a.type === 'directory' ? -1 : 1;
      });
    };

    const convertToArray = (obj: { [key: string]: FileTreeItem }): FileTreeItem[] => {
      return sortItems(
        Object.values(obj).map(item => ({
          ...item,
          children: item.children ? convertToArray(item.children as { [key: string]: FileTreeItem }) : undefined
        }))
      );
    };

    return convertToArray(root);
  };

  const loadFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const files = await fileApi.listFiles();
      const tree = buildFileTree(files);
      setItems(tree);
    } catch (error) {
      console.error('Error loading files:', error);
      toast({
        title: "Error",
        description: "Failed to load files",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadFiles();
    if (refreshRef) {
      refreshRef.current = loadFiles;
    }
  }, [loadFiles, refreshRef]);

  const TreeNode = ({ item, level = 0 }: { item: FileTreeItem; level?: number }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const isFiltered = filter && !item.path.toLowerCase().includes(filter.toLowerCase());
    
    if (isFiltered) return null;

    return (
      <div>
        <div
          className={cn(
            "group flex items-center gap-2 py-1 px-2 hover:bg-accent rounded-sm cursor-pointer",
            { "pl-[calc(0.5rem_+_var(--indent))]": level > 0 }
          )}
          style={{ "--indent": `${level * 1}rem` } as any}
          onClick={() => item.type === 'file' ? onSelect(item.path) : setIsExpanded(!isExpanded)}
        >
          {item.type === 'directory' && (
            <div className="text-muted-foreground">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>
          )}
          {item.type === 'directory' ? (
            <Folder className="h-4 w-4 text-muted-foreground" />
          ) : (
            <File className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-sm truncate flex-1">{item.name}</span>
        </div>
        {item.type === 'directory' && isExpanded && (
          <div>
            {item.children?.map((child) => (
              <TreeNode key={child.path} item={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-2 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-4 text-sm text-muted-foreground">
              No files found
            </div>
          ) : (
            items.map(item => (
              <TreeNode key={item.path} item={item} />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
