import { useState } from 'react';
import { Editor } from '@monaco-editor/react';
import { FilePane } from './FilePane';
import { PreviewPane } from '../PreviewPane';
import { useToast } from '@/components/ui/use-toast';
import { fileApi } from '@/utils/fileApi';

export const EditorContainer = () => {
  const [currentFileName, setCurrentFileName] = useState<string>();
  const [code, setCode] = useState<string>('');
  const { toast } = useToast();

  const handleFileSelect = async (fileName: string) => {
    console.log('File selected:', fileName);
    const content = await fileApi.readFile(fileName);
    
    // If content is null, it might be a directory
    if (content === null) {
      // Don't clear the editor state for directories
      return;
    }

    setCurrentFileName(fileName);
    setCode(content);
    console.log('File content loaded into editor:', fileName);
  };

  const handleCodeChange = async (value: string | undefined) => {
    if (!currentFileName || !value) return;
    
    setCode(value);
    const success = await fileApi.writeFile(currentFileName, value);
    if (!success) {
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive",
      });
    }
  };

  const handleDownloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFileName || 'code.tsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Code downloaded",
      description: `Your code has been downloaded as ${currentFileName}`,
    });
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: "Code copied",
        description: "Code has been copied to clipboard.",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy code to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-full flex">
      <div className="w-64 h-full">
        <FilePane
          onFileSelect={handleFileSelect}
          currentFileName={currentFileName}
        />
      </div>
      <div className="flex-1 h-full flex">
        <div className="flex-1 h-full">
          <div className="h-full flex flex-col">
            <div className="p-2 border-b flex items-center justify-between">
              <h2 className="text-sm font-semibold">
                {currentFileName || 'No file selected'}
              </h2>
              {currentFileName && (
                <div className="space-x-2">
                  <button
                    onClick={handleCopyCode}
                    className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded hover:bg-secondary/90"
                  >
                    Copy
                  </button>
                  <button
                    onClick={handleDownloadCode}
                    className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90"
                  >
                    Download
                  </button>
                </div>
              )}
            </div>
            <div className="flex-1">
              {currentFileName ? (
                <Editor
                  height="100%"
                  defaultLanguage="typescript"
                  language="typescript"
                  theme="vs-dark"
                  value={code}
                  onChange={handleCodeChange}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    readOnly: false,
                    automaticLayout: true,
                  }}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <p>Select a file to edit</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="w-1/2 h-full">
          <PreviewPane currentFileName={currentFileName} />
        </div>
      </div>
    </div>
  );
};