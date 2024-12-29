import { useState, lazy, Suspense, useCallback, useEffect, useRef } from 'react';
import { FileTree } from './FileTree';
import { TabsManager } from './TabsManager';
import { useToast } from '@/components/ui/use-toast';
import { fileApi } from '@/utils/fileApi';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import debounce from 'lodash/debounce';
import type { editor } from 'monaco-editor';

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

export const EditorContainer = () => {
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([]);
  const [activeTab, setActiveTab] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const editorRef = useRef<editor.IStandaloneCodeEditor>();
  const { toast } = useToast();

  // Auto-save debounced function
  const debouncedSave = useCallback(
    debounce(async (path: string, content: string) => {
      try {
        await fileApi.writeFile(path, content);
        setOpenTabs(tabs =>
          tabs.map(tab =>
            tab.path === path ? { ...tab, isDirty: false } : tab
          )
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
        if (activeTab) {
          const tab = openTabs.find(t => t.path === activeTab);
          if (tab) {
            debouncedSave(tab.path, tab.content);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, openTabs, debouncedSave]);

  const handleFileSelect = async (path: string) => {
    // If file is already open, just switch to it
    if (openTabs.some(tab => tab.path === path)) {
      setActiveTab(path);
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

      setOpenTabs(tabs => [...tabs, { path, content, isDirty: false }]);
      setActiveTab(path);
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

  const handleTabClose = (path: string) => {
    const tab = openTabs.find(t => t.path === path);
    if (tab?.isDirty) {
      // TODO: Show confirmation dialog
      debouncedSave(path, tab.content);
    }
    setOpenTabs(tabs => tabs.filter(t => t.path !== path));
    if (activeTab === path) {
      setActiveTab(openTabs[openTabs.length - 2]?.path);
    }
  };

  const handleCodeChange = (value: string | undefined) => {
    if (!activeTab || !value) return;
    
    setOpenTabs(tabs =>
      tabs.map(tab =>
        tab.path === activeTab
          ? { ...tab, content: value, isDirty: true }
          : tab
      )
    );
    
    // Trigger auto-save
    debouncedSave(activeTab, value);
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
      handleTabClose(path);
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

  const activeContent = openTabs.find(tab => tab.path === activeTab)?.content || '';

  return (
    <div className="h-full flex">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={20} minSize={15}>
          <FileTree
            currentFile={activeTab}
            onFileSelect={handleFileSelect}
            onCreateFile={handleCreateFile}
            onCreateDirectory={handleCreateDirectory}
            onDeleteItem={handleDeleteItem}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={80}>
          <div className="h-full flex flex-col">
            <TabsManager
              tabs={openTabs.map(tab => ({
                path: tab.path,
                isDirty: tab.isDirty
              }))}
              activeTab={activeTab}
              onTabSelect={setActiveTab}
              onTabClose={handleTabClose}
            />
            
            <div className="flex-1">
              {isLoading ? (
                <LoadingSpinner />
              ) : activeTab ? (
                <Suspense fallback={<LoadingSpinner />}>
                  <MonacoEditor
                    code={activeContent}
                    onChange={handleCodeChange}
                    showLineNumbers={true}
                    wordWrap="on"
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
      </ResizablePanelGroup>
    </div>
  );
};