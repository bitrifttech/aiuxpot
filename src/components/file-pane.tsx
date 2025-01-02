import React, { useState } from 'react';
import { FileSystemProvider, useFileSystem } from '@/contexts/filesystem-context';
import { FileTree } from '@/components/file-tree/file-tree';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, FolderPlus, FileText, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function FileActions() {
  const { state, createFile, createDirectory } = useFileSystem();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreatingFile, setIsCreatingFile] = useState(true);
  const [newName, setNewName] = useState('');

  const handleCreate = async () => {
    if (!newName) return;

    try {
      if (isCreatingFile) {
        await createFile(state.selectedNode || 'root', newName);
      } else {
        await createDirectory(state.selectedNode || 'root', newName);
      }
      setIsDialogOpen(false);
      setNewName('');
    } catch (error) {
      console.error('Failed to create:', error);
    }
  };

  const openCreateDialog = (isFile: boolean) => {
    setIsCreatingFile(isFile);
    setNewName('');
    setIsDialogOpen(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Plus className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => openCreateDialog(true)}>
            <FileText className="mr-2 h-4 w-4" />
            New File
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openCreateDialog(false)}>
            <FolderPlus className="mr-2 h-4 w-4" />
            New Folder
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Create New {isCreatingFile ? 'File' : 'Folder'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-4">
              <Input
                placeholder={isCreatingFile ? 'filename.ext' : 'folder-name'}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreate();
                  }
                }}
              />
              <Button onClick={handleCreate}>Create</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function FilePane() {
  return (
    <FileSystemProvider>
      <div className="h-full flex flex-col">
        <div className="p-2 border-b flex items-center justify-between">
          <h2 className="text-sm font-semibold">Files</h2>
          <FileActions />
        </div>
        <div className="flex-1 overflow-hidden">
          <FileTree />
        </div>
      </div>
    </FileSystemProvider>
  );
}
