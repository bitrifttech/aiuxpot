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
  currentFile?: string;
  onFileSelect: (path: string) => void;
  onCreateFile: (path: string) => void;
  onCreateDirectory: (path: string) => void;
  onDeleteItem: (path: string) => void;
  onRefresh?: (refresh: () => void) => void;
}

const TreeNode = ({
  item,
  level = 0,
  currentFile,
  onFileSelect,
  onCreateFile,
  onCreateDirectory,
  onDeleteItem
}: {
  item: FileTreeItem;
  level?: number;
  currentFile?: string;
  onFileSelect: (path: string) => void;
  onCreateFile: (path: string) => void;
  onCreateDirectory: (path: string) => void;
  onDeleteItem: (path: string) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showNewItemDialog, setShowNewItemDialog] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState<'file' | 'directory'>('file');
  const { toast } = useToast();

  const handleCreateItem = () => {
    if (!newItemName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name",
        variant: "destructive",
      });
      return;
    }

    const newPath = `${item.path}/${newItemName}`;
    if (newItemType === 'file') {
      onCreateFile(newPath);
    } else {
      onCreateDirectory(newPath);
    }

    setShowNewItemDialog(false);
    setNewItemName('');
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteItem(item.path);
  };

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-accent group",
          currentFile === item.path && "bg-accent",
          level > 0 && "ml-4"
        )}
        onClick={() => item.type === 'file' ? onFileSelect(item.path) : setIsExpanded(!isExpanded)}
      >
        {item.type === 'directory' ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
            <Folder className="h-4 w-4 text-blue-500" />
          </>
        ) : (
          <>
            <div className="w-4" />
            <File className="h-4 w-4 text-gray-500" />
          </>
        )}
        <span className="flex-1">{item.name}</span>
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
          {item.type === 'directory' && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                setShowNewItemDialog(true);
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {showNewItemDialog && (
        <Dialog open={showNewItemDialog} onOpenChange={setShowNewItemDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New {newItemType === 'file' ? 'File' : 'Directory'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant={newItemType === 'file' ? 'default' : 'outline'}
                  onClick={() => setNewItemType('file')}
                >
                  File
                </Button>
                <Button
                  variant={newItemType === 'directory' ? 'default' : 'outline'}
                  onClick={() => setNewItemType('directory')}
                >
                  Directory
                </Button>
              </div>
              <Input
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder={newItemType === 'file' ? 'filename.ext' : 'directory-name'}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowNewItemDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateItem}>Create</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {item.type === 'directory' && isExpanded && item.children && (
        <div>
          {item.children.map((child) => (
            <TreeNode
              key={child.path}
              item={child}
              level={level + 1}
              currentFile={currentFile}
              onFileSelect={onFileSelect}
              onCreateFile={onCreateFile}
              onCreateDirectory={onCreateDirectory}
              onDeleteItem={onDeleteItem}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export function FileTree({
  currentFile,
  onFileSelect,
  onCreateFile,
  onCreateDirectory,
  onDeleteItem,
  onRefresh
}: FileTreeProps) {
  const [fileTree, setFileTree] = useState<FileTreeItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const loadFileTree = useCallback(async () => {
    try {
      const files = await fileApi.listFiles();
      const tree = buildFileTree(files);
      setFileTree(tree);
    } catch (error) {
      console.error('Error loading file tree:', error);
      toast({
        title: "Error",
        description: "Failed to load file tree",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Initial load
  useEffect(() => {
    loadFileTree();
  }, []);

  // Pass the refresh callback to parent
  useEffect(() => {
    if (onRefresh) {
      onRefresh(loadFileTree);
    }
  }, [onRefresh]);

  const buildFileTree = (files: string[]): FileTreeItem[] => {
    const root: { [key: string]: FileTreeItem } = {};

    files.forEach(path => {
      const parts = path.split('/');
      let current = root;

      parts.forEach((part, index) => {
        if (!current[part]) {
          current[part] = {
            name: part,
            type: index === parts.length - 1 ? 'file' : 'directory',
            path: parts.slice(0, index + 1).join('/'),
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

  const filterTree = (items: FileTreeItem[], query: string): FileTreeItem[] => {
    if (!query) return items;

    return items.reduce<FileTreeItem[]>((filtered, item) => {
      if (item.name.toLowerCase().includes(query.toLowerCase())) {
        filtered.push(item);
      } else if (item.children) {
        const filteredChildren = filterTree(item.children, query);
        if (filteredChildren.length > 0) {
          filtered.push({ ...item, children: filteredChildren });
        }
      }
      return filtered;
    }, []);
  };

  const filteredTree = filterTree(fileTree, searchQuery);

  return (
    <div className="h-full flex flex-col">
      <div className="p-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredTree.map((item) => (
            <TreeNode
              key={item.path}
              item={item}
              currentFile={currentFile}
              onFileSelect={onFileSelect}
              onCreateFile={onCreateFile}
              onCreateDirectory={onCreateDirectory}
              onDeleteItem={onDeleteItem}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
