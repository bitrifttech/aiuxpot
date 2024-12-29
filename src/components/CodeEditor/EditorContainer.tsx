import { useState, lazy, Suspense, useCallback, useEffect, useRef } from 'react';
import { FileTree } from './FileTree';
import { TabsManager } from './TabsManager';
import { useToast } from '@/components/ui/use-toast';
import { fileApi } from '@/utils/fileApi';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { SplitSquareHorizontal, X } from 'lucide-react';
import debounce from 'lodash/debounce';
import type { editor } from 'monaco-editor';
import React from 'react';

const MonacoEditor = lazy(() => import("./MonacoEditor").then(module => ({
  default: module.MonacoEditor
})));

const LoadingSpinner = () => (
  <div className="h-full flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

interface OpenTab {
  path: string;
  content: string;
  isDirty: boolean;
}

interface EditorPane {
  id: string;
  tabs: OpenTab[];
  activeTab?: string;
}

export const EditorContainer = () => {
  const [panes, setPanes] = useState<EditorPane[]>([
    { id: 'main', tabs: [], activeTab: undefined }
  ]);
  const [activePaneId, setActivePaneId] = useState('main');
  const [isLoading, setIsLoading] = useState(false);
  const editorRef = useRef<editor.IStandaloneCodeEditor>();
  const { toast } = useToast();

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

  const handleFileSelect = async (path: string) => {
    const activePane = panes.find(p => p.id === activePaneId);
    if (!activePane) return;

    // If file is already open in the active pane, just switch to it
    if (activePane.tabs.some(tab => tab.path === path)) {
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
    
    // Trigger auto-save
    debouncedSave(pane.activeTab, value);
  };

  const handleCreateFile = async (path: string) => {
    try {
      await fileApi.writeFile(path, '');
      handleFileSelect(path);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create file",
        variant: "destructive",
      });
    }
  };

  const handleCreateDirectory = async (path: string) => {
    // TODO: Implement directory creation in fileApi
    toast({
      title: "Success",
      description: "Directory created",
    });
  };

  const handleDeleteItem = async (path: string) => {
    try {
      await fileApi.deleteFile(path);
      // Close all tabs with this file
      setPanes(currentPanes =>
        currentPanes.map(pane => ({
          ...pane,
          tabs: pane.tabs.filter(t => t.path !== path),
          activeTab: pane.activeTab === path
            ? pane.tabs[pane.tabs.length - 2]?.path
            : pane.activeTab
        }))
      );
      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
    } catch (error) {
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

  return (
    <div className="h-full flex">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={20} minSize={15}>
          <FileTree
            currentFile={panes.find(p => p.id === activePaneId)?.activeTab}
            onFileSelect={handleFileSelect}
            onCreateFile={handleCreateFile}
            onCreateDirectory={handleCreateDirectory}
            onDeleteItem={handleDeleteItem}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={80}>
          <ResizablePanelGroup direction="horizontal">
            {panes.map((pane, index) => (
              <React.Fragment key={pane.id}>
                {index > 0 && <ResizableHandle withHandle />}
                <ResizablePanel>
                  <div className="h-full flex flex-col" onClick={() => setActivePaneId(pane.id)}>
                    <div className="border-b flex items-center">
                      <TabsManager
                        tabs={pane.tabs.map(tab => ({
                          path: tab.path,
                          isDirty: tab.isDirty
                        }))}
                        activeTab={pane.activeTab}
                        onTabSelect={(path) => {
                          setPanes(currentPanes =>
                            currentPanes.map(p =>
                              p.id === pane.id
                                ? { ...p, activeTab: path }
                                : p
                            )
                          );
                        }}
                        onTabClose={(path) => handleTabClose(pane.id, path)}
                      />
                      <div className="flex items-center border-l px-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSplitPane()}
                          className="h-8 w-8"
                        >
                          <SplitSquareHorizontal className="h-4 w-4" />
                        </Button>
                        {panes.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleClosePane(pane.id)}
                            className="h-8 w-8"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      {isLoading ? (
                        <LoadingSpinner />
                      ) : pane.activeTab ? (
                        <Suspense fallback={<LoadingSpinner />}>
                          <MonacoEditor
                            code={pane.tabs.find(t => t.path === pane.activeTab)?.content || ''}
                            onChange={(value) => handleCodeChange(pane.id, value)}
                            showLineNumbers={true}
                            wordWrap="on"
                            language={pane.activeTab}
                          />
                        </Suspense>
                      ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                          Select a file to edit
                        </div>
                      )}
                    </div>
                  </div>
                </ResizablePanel>
              </React.Fragment>
            ))}
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};