import { useState, useEffect, useCallback } from 'react';
import { ChevronRight, ChevronDown, Folder, File, Trash2, Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { fileApi } from '@/utils/fileApi';
import { previewApi } from '@/utils/previewApi'; // Import previewApi

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
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; path: string; name: string }>({
    open: false,
    path: '',
    name: ''
  });
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const { toast } = useToast();

  // Track current project ID
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(() => {
    try {
      const currentProject = localStorage.getItem('aiuxpot-current-project');
      if (currentProject) {
        const { id } = JSON.parse(currentProject);
        return id;
      }
    } catch (error) {
      console.error('Error getting current project:', error);
    }
    return null;
  });

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

  // Listen for project changes and refresh files
  useEffect(() => {
    const handleProjectChange = () => {
      console.log('Project changed, reloading files');
      // Don't clear items immediately, wait for loadFiles to complete
      loadFiles();
    };

    previewApi.addListener('projectChanged', handleProjectChange);
    return () => {
      previewApi.removeListener('projectChanged', handleProjectChange);
    };
  }, [loadFiles]);

  // Load files on mount and when currentProjectId changes
  useEffect(() => {
    if (currentProjectId) {
      loadFiles();
      if (refreshRef) {
        refreshRef.current = loadFiles;
      }
    } else {
      setItems([]);
    }
  }, [loadFiles, refreshRef, currentProjectId]);

  // Update current project ID when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const currentProject = localStorage.getItem('aiuxpot-current-project');
        if (currentProject) {
          const { id } = JSON.parse(currentProject);
          setCurrentProjectId(id);
        } else {
          setCurrentProjectId(null);
        }
      } catch (error) {
        console.error('Error checking project:', error);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Get current project ID
  const getCurrentProjectId = useCallback(() => currentProjectId, [currentProjectId]);

  // Save expanded nodes state
  useEffect(() => {
    const currentProjectId = getCurrentProjectId();
    if (!currentProjectId) return;

    localStorage.setItem(`filetree-expanded-${currentProjectId}`, JSON.stringify(Array.from(expandedNodes)));
  }, [expandedNodes, getCurrentProjectId]);

  // Load expanded nodes state
  useEffect(() => {
    const currentProjectId = getCurrentProjectId();
    if (!currentProjectId) return;

    try {
      const savedNodes = localStorage.getItem(`filetree-expanded-${currentProjectId}`);
      if (savedNodes) {
        setExpandedNodes(new Set(JSON.parse(savedNodes)));
      }
    } catch (error) {
      console.error('Error loading expanded nodes:', error);
    }
  }, [getCurrentProjectId]);

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

  const handleDelete = async () => {
    try {
      const success = await fileApi.deleteFile(deleteDialog.path);
      if (success) {
        toast({
          title: "Success",
          description: `Deleted ${deleteDialog.name}`,
        });
        loadFiles(); // Refresh the file list
      } else {
        throw new Error('Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive",
      });
    } finally {
      setDeleteDialog({ open: false, path: '', name: '' });
    }
  };

  const TreeNode = ({ item, level = 0 }: { item: FileTreeItem; level?: number }) => {
    const [isExpanded, setIsExpanded] = useState(expandedNodes.has(item.path));

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
        >
          <div 
            className="flex-1 flex items-center gap-2"
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
          {item.type === 'file' && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteDialog({ 
                  open: true, 
                  path: item.path,
                  name: item.name
                });
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
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

  useEffect(() => {
    if (selectedFile) {
      setExpandedNodes(prev => new Set([...prev, ...selectedFile.split('/').slice(0, -1)]));
    }
  }, [selectedFile]);

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
      <AlertDialog 
        open={deleteDialog.open} 
        onOpenChange={(open) => !open && setDeleteDialog({ open: false, path: '', name: '' })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDialog.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
