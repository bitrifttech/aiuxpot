import { useState, lazy, Suspense, useCallback, useEffect, useRef } from 'react';
import { FileTree } from './FileTree';
import { TabsManager } from './TabsManager';
import { useToast } from '@/components/ui/use-toast';
import { fileApi } from '@/utils/fileApi';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SplitSquareHorizontal, X, Plus } from 'lucide-react';
import debounce from 'lodash/debounce';
import type { editor } from 'monaco-editor';
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { PreviewPane } from './PreviewPane';
import { cn } from '@/lib/utils';
import { previewApi } from '@/utils/previewApi'; // Import previewApi

const MonacoEditor = lazy(() => import("./MonacoEditor").then(module => ({
  default: module.MonacoEditor
})));

const LoadingSpinner = () => (
  <div className="h-full flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
  </div>
);

interface OpenTab {
  path: string;
  content: string;
  isDirty: boolean;
}

export interface EditorPane {
  id: string;
  tabs: OpenTab[];
  activeTab?: string;
}

interface SavedEditorState {
  panes: EditorPane[];
  activePaneId: string;
  timestamp: number;
}

const EDITOR_STATE_KEY = 'aiuxpot-editor-state';

export const EditorContainer = () => {
  const [panes, setPanes] = useState<EditorPane[]>([
    {
      id: '1',
      tabs: [],
      activeTab: undefined
    }
  ]);
  const [activePaneId, setActivePaneId] = useState('1');
  const [isLoading, setIsLoading] = useState(false);
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  const [newFilePath, setNewFilePath] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('empty');
  const [showPreview, setShowPreview] = useState(false);
  const refreshFileTreeRef = useRef<() => void>(() => {});
  const { toast } = useToast();

  // Load saved editor state
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(EDITOR_STATE_KEY);
      if (savedState) {
        const state = JSON.parse(savedState) as SavedEditorState;
        // Only restore if saved less than 24 hours ago
        if (Date.now() - state.timestamp < 24 * 60 * 60 * 1000) {
          setPanes(state.panes);
          setActivePaneId(state.activePaneId);
        }
      }
    } catch (error) {
      console.error('Error loading editor state:', error);
    }
  }, []);

  // Save editor state
  useEffect(() => {
    const state: SavedEditorState = {
      panes,
      activePaneId,
      timestamp: Date.now()
    };
    localStorage.setItem(EDITOR_STATE_KEY, JSON.stringify(state));
  }, [panes, activePaneId]);

  const templates = {
    empty: '',
    typescript: `// TypeScript file
export function example() {
  return 'Hello, World!';
}`,
    react: `import React from 'react';

export function ExampleComponent() {
  return (
    <div>
      <h1>Hello, World!</h1>
    </div>
  );
}`,
    test: `import { describe, it, expect } from 'vitest';

describe('Example Test', () => {
  it('should pass', () => {
    expect(true).toBe(true);
  });
});`
  };

  // Load file contents when component mounts
  useEffect(() => {
    const loadFileContents = async () => {
      console.log('Loading file contents...');
      setIsLoading(true);
      try {
        const updatedPanes = await Promise.all(
          panes.map(async (pane) => {
            const updatedTabs = await Promise.all(
              pane.tabs.map(async (tab) => {
                try {
                  console.log('Loading file content for:', tab.path);
                  const content = await fileApi.readFile(tab.path);
                  if (content !== null) {
                    console.log('Content loaded for:', tab.path);
                    return { ...tab, content };
                  }
                  console.warn('No content found for:', tab.path);
                } catch (error) {
                  console.error('Error loading file:', tab.path, error);
                }
                return tab;
              })
            );
            return { ...pane, tabs: updatedTabs };
          })
        );
        setPanes(updatedPanes);
      } catch (error) {
        console.error('Error loading file contents:', error);
        toast({
          title: "Error",
          description: "Failed to load some files",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (panes.some(pane => pane.tabs.length > 0)) {
      loadFileContents();
    }
  }, []); // Only run once when component mounts

  // Auto-save debounced function
  const debouncedSave = useCallback(
    debounce(async (path: string, content: string) => {
      try {
        await fileApi.writeFile(path, content);
        setPanes(currentPanes => 
          currentPanes.map(pane => ({
            ...pane,
            tabs: pane.tabs.map(tab =>
              tab.path === path ? { ...tab, isDirty: false } : tab
            )
          }))
        );
        toast({
          title: "Saved",
          description: `File ${path.split('/').pop()} saved successfully`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to save file",
          variant: "destructive",
        });
      }
    }, 1000),
    []
  );

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        const activePane = panes.find(p => p.id === activePaneId);
        if (activePane?.activeTab) {
          const tab = activePane.tabs.find(t => t.path === activePane.activeTab);
          if (tab) {
            debouncedSave(tab.path, tab.content);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePaneId, panes, debouncedSave]);

  useEffect(() => {
    const handleFileDeleted = (event: CustomEvent<{ path: string }>) => {
      // Close any tabs for the deleted file
      setPanes(currentPanes =>
        currentPanes.map(pane => ({
          ...pane,
          tabs: pane.tabs.filter(tab => tab.path !== event.detail.path),
          activeTab: pane.activeTab === event.detail.path
            ? pane.tabs[pane.tabs.length - 2]?.path
            : pane.activeTab
        }))
      );
    };

    window.addEventListener('file-deleted' as any, handleFileDeleted as EventListener);
    return () => {
      window.removeEventListener('file-deleted' as any, handleFileDeleted as EventListener);
    };
  }, []);

  const handleFileSelect = async (path: string) => {
    const activePane = panes.find(p => p.id === activePaneId);
    if (!activePane) return;

    // Check if file is already open in this pane
    const existingTab = activePane.tabs.find(tab => tab.path === path);
    if (existingTab) {
      // Just switch to the existing tab
      setPanes(currentPanes =>
        currentPanes.map(pane =>
          pane.id === activePaneId
            ? { ...pane, activeTab: path }
            : pane
        )
      );
      return;
    }

    try {
      setIsLoading(true);
      const content = await fileApi.readFile(path);
      
      if (content === null) {
        toast({
          title: "Error",
          description: "Could not read file content",
          variant: "destructive",
        });
        return;
      }

      // Add new tab with content
      setPanes(currentPanes =>
        currentPanes.map(pane =>
          pane.id === activePaneId
            ? {
                ...pane,
                tabs: [...pane.tabs, { path, content, isDirty: false }],
                activeTab: path
              }
            : pane
        )
      );
    } catch (error) {
      console.error('Error loading file:', error);
      toast({
        title: "Error",
        description: "Failed to load file",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabClose = (paneId: string, path: string) => {
    const pane = panes.find(p => p.id === paneId);
    if (!pane) return;

    const tab = pane.tabs.find(t => t.path === path);
    if (tab?.isDirty) {
      // TODO: Show confirmation dialog
      debouncedSave(path, tab.content);
    }

    setPanes(currentPanes =>
      currentPanes.map(pane =>
        pane.id === paneId
          ? {
              ...pane,
              tabs: pane.tabs.filter(t => t.path !== path),
              activeTab: pane.activeTab === path
                ? pane.tabs[pane.tabs.length - 2]?.path
                : pane.activeTab
            }
          : pane
      )
    );
  };

  const handleCodeChange = (paneId: string, value: string | undefined) => {
    if (!value) return;
    
    const pane = panes.find(p => p.id === paneId);
    if (!pane?.activeTab) return;

    setPanes(currentPanes =>
      currentPanes.map(pane =>
        pane.id === paneId
          ? {
              ...pane,
              tabs: pane.tabs.map(tab =>
                tab.path === pane.activeTab
                  ? { ...tab, content: value, isDirty: true }
                  : tab
              )
            }
          : pane
      )
    );

    // Update preview for HTML, CSS, and JavaScript files
    const activeTab = pane.tabs.find(tab => tab.path === pane.activeTab);
    if (activeTab) {
      const ext = activeTab.path.split('.').pop()?.toLowerCase();
      if (ext && ['html', 'css', 'js'].includes(ext)) {
        previewApi.updateFile(activeTab.path, value, `text/${ext}`).catch(error => {
          console.error('Error updating preview:', error);
          toast({
            title: "Error",
            description: "Failed to update preview",
            variant: "destructive",
          });
        });
      }
    }

    // Trigger auto-save
    debouncedSave(pane.activeTab, value);
  };

  const handleCreateFile = async () => {
    if (!newFilePath.trim()) {
      toast({
        title: "Error",
        description: "Please enter a file path",
        variant: "destructive",
      });
      return;
    }

    try {
      const content = templates[selectedTemplate as keyof typeof templates];
      await fileApi.writeFile(newFilePath, content);
      
      // Add the new file as a tab in the current pane
      const activePane = panes.find(p => p.id === activePaneId);
      if (activePane) {
        const updatedPane = {
          ...activePane,
          tabs: [...activePane.tabs, { path: newFilePath, content, isDirty: false }],
          activeTab: newFilePath
        };
        setPanes(panes.map(p => p.id === activePaneId ? updatedPane : p));
      }

      // Refresh the file tree
      refreshFileTreeRef.current();

      setShowNewFileDialog(false);
      setNewFilePath('');
      toast({
        title: "Success",
        description: "File created successfully",
      });
    } catch (error) {
      console.error('Error creating file:', error);
      toast({
        title: "Error",
        description: "Failed to create file",
        variant: "destructive",
      });
    }
  };

  const handleCreateDirectory = async (path: string) => {
    try {
      await fileApi.writeFile(path + '/.gitkeep', '');
      refreshFileTreeRef.current();
      toast({
        title: "Success",
        description: "Directory created successfully",
      });
    } catch (error) {
      console.error('Error creating directory:', error);
      toast({
        title: "Error",
        description: "Failed to create directory",
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = async (path: string) => {
    try {
      await fileApi.deleteFile(path);
      
      // Close any tabs with this file
      setPanes(currentPanes =>
        currentPanes.map(pane => ({
          ...pane,
          tabs: pane.tabs.filter(tab => tab.path !== path),
          activeTab: pane.activeTab === path
            ? pane.tabs[pane.tabs.length - 2]?.path
            : pane.activeTab
        }))
      );

      // Refresh the file tree
      refreshFileTreeRef.current();

      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    }
  };

  const handleSplitPane = () => {
    const activePane = panes.find(p => p.id === activePaneId);
    if (!activePane?.activeTab) return;

    const newPaneId = `pane-${Date.now()}`;
    const activeTab = activePane.tabs.find(t => t.path === activePane.activeTab);
    if (!activeTab) return;

    setPanes(currentPanes => [
      ...currentPanes,
      {
        id: newPaneId,
        tabs: [{ ...activeTab }],
        activeTab: activeTab.path
      }
    ]);
    setActivePaneId(newPaneId);
  };

  const handleClosePane = (paneId: string) => {
    if (panes.length === 1) return;
    setPanes(currentPanes => currentPanes.filter(p => p.id !== paneId));
    setActivePaneId(panes[0].id);
  };

  const getLanguageFromFilename = (filename: string) => {
    const extension = filename.split('.').pop();
    switch (extension) {
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'json':
        return 'json';
      default:
        return 'plaintext';
    }
  };

  // Initialize preview connection
  useEffect(() => {
    previewApi.connect();
  }, []);

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex-none p-2 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNewFileDialog(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            New File
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            <SplitSquareHorizontal className="h-4 w-4 mr-1" />
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
        </div>
      </div>

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={20} minSize={15}>
          <FileTree
            onSelect={handleFileSelect}
            refreshRef={refreshFileTreeRef}
          />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={showPreview ? 40 : 80}>
          <div className="h-full flex flex-col">
            <TabsManager
              panes={panes}
              activePaneId={activePaneId}
              onTabClose={handleTabClose}
              onTabChange={(paneId, path) => {
                setPanes(currentPanes =>
                  currentPanes.map(pane =>
                    pane.id === paneId
                      ? { ...pane, activeTab: path }
                      : pane
                  )
                );
              }}
            />
            <div className="flex-1 relative">
              {isLoading && (
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-50">
                  <LoadingSpinner />
                </div>
              )}
              {panes.map(pane => {
                const activeTab = pane.tabs.find(
                  tab => tab.path === pane.activeTab
                );
                return (
                  <div
                    key={pane.id}
                    className={cn(
                      'absolute inset-0',
                      pane.id === activePaneId ? 'block' : 'hidden'
                    )}
                  >
                    {activeTab ? (
                      <Suspense fallback={<LoadingSpinner />}>
                        <MonacoEditor
                          code={activeTab.content}
                          language={getLanguageFromFilename(activeTab.path)}
                          onChange={(value) =>
                            handleCodeChange(pane.id, value)
                          }
                        />
                      </Suspense>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        No file open
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </ResizablePanel>
        {showPreview && (
          <>
            <ResizableHandle />
            <ResizablePanel defaultSize={40}>
              {panes.map(pane => {
                const activeTab = pane.tabs.find(
                  tab => tab.path === pane.activeTab
                );
                return (
                  <div
                    key={pane.id}
                    className={cn(
                      'h-full',
                      pane.id === activePaneId ? 'block' : 'hidden'
                    )}
                  >
                    {activeTab ? (
                      <PreviewPane
                        content={activeTab.content}
                        filePath={activeTab.path}
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        No file open
                      </div>
                    )}
                  </div>
                );
              })}
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>

      <Dialog open={showNewFileDialog} onOpenChange={setShowNewFileDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New File</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Input
                id="path"
                placeholder="File path (e.g., src/components/Button.tsx)"
                value={newFilePath}
                onChange={(e) => setNewFilePath(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => setShowNewFileDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateFile} disabled={!newFilePath}>
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};