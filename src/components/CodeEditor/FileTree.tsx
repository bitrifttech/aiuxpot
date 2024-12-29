import { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Folder, File, Plus, Trash2, Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

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
        description: "Name cannot be empty",
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

  return (
    <div>
      <div 
        className={cn(
          "flex items-center gap-2 p-1 rounded-md hover:bg-accent group",
          currentFile === item.path && "bg-accent"
        )}
        style={{ paddingLeft: `${level * 12}px` }}
      >
        {item.type === 'directory' ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-accent rounded-sm"
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        ) : (
          <span className="w-6" />
        )}
        
        <span 
          onClick={() => item.type === 'file' && onFileSelect(item.path)}
          className={cn(
            "flex items-center gap-2 flex-1 cursor-pointer py-1",
            item.type === 'file' && "hover:text-primary"
          )}
        >
          {item.type === 'directory' ? (
            <Folder className="h-4 w-4 text-muted-foreground" />
          ) : (
            <File className="h-4 w-4 text-muted-foreground" />
          )}
          {item.name}
        </span>

        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
          {item.type === 'directory' && (
            <Dialog open={showNewItemDialog} onOpenChange={setShowNewItemDialog}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Item</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="flex gap-4">
                    <Button
                      variant={newItemType === 'file' ? 'default' : 'outline'}
                      onClick={() => setNewItemType('file')}
                      className="flex-1"
                    >
                      <File className="h-4 w-4 mr-2" />
                      File
                    </Button>
                    <Button
                      variant={newItemType === 'directory' ? 'default' : 'outline'}
                      onClick={() => setNewItemType('directory')}
                      className="flex-1"
                    >
                      <Folder className="h-4 w-4 mr-2" />
                      Directory
                    </Button>
                  </div>
                  <Input
                    placeholder={`Enter ${newItemType} name`}
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                  />
                  <Button onClick={handleCreateItem} className="w-full">
                    Create
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onDeleteItem(item.path)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

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

export const FileTree = ({
  currentFile,
  onFileSelect,
  onCreateFile,
  onCreateDirectory,
  onDeleteItem
}: FileTreeProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [fileStructure, setFileStructure] = useState<FileTreeItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchFileStructure = async () => {
      try {
        const response = await fetch('/api/files');
        if (!response.ok) {
          throw new Error('Failed to fetch file structure');
        }
        const data = await response.json();
        setFileStructure(data);
      } catch (error) {
        console.error('Error fetching file structure:', error);
        toast({
          title: "Error",
          description: "Failed to load file structure",
          variant: "destructive",
        });
      }
    };

    fetchFileStructure();
  }, [toast]);

  return (
    <div className="h-full flex flex-col">
      <div className="p-2 border-b">
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
          {fileStructure.map((item) => (
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
};
