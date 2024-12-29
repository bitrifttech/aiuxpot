import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { File, FolderOpen, Plus, Trash2 } from "lucide-react";
import { memoryFS } from "@/utils/memoryFileSystem";
import { useState, useEffect } from "react";

interface FilePaneProps {
  onFileSelect: (fileName: string) => void;
  currentFileName?: string;
}

export const FilePane = ({ onFileSelect, currentFileName }: FilePaneProps) => {
  const [files, setFiles] = useState<string[]>([]);

  useEffect(() => {
    // Update files list whenever component mounts or files change
    const updateFiles = () => {
      const filesList = memoryFS.listFiles();
      setFiles(filesList);
      console.log('Files list updated:', filesList);
    };

    updateFiles();
    // We could add a subscription system to memoryFS to trigger updates
  }, []);

  const handleFileClick = (fileName: string) => {
    onFileSelect(fileName);
  };

  const handleDeleteFile = (path: string) => {
    memoryFS.deleteFile(path);
    setFiles(memoryFS.listFiles());
    console.log('File deleted:', path);
  };

  return (
    <div className="h-full border-r bg-background">
      <div className="p-2 border-b">
        <h2 className="text-sm font-semibold">Files</h2>
      </div>
      <ScrollArea className="h-[calc(100%-40px)]">
        <div className="p-2 space-y-1">
          {files.map((file) => (
            <div
              key={file}
              className={`group flex items-center justify-between p-2 rounded-md hover:bg-accent text-sm ${
                currentFileName === file ? 'bg-accent' : ''
              }`}
            >
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 px-2"
                onClick={() => handleFileClick(file)}
              >
                <File className="h-4 w-4" />
                <span className="truncate">{file}</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100"
                onClick={() => handleDeleteFile(file)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};