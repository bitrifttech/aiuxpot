import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { EditorToolbar } from "./EditorToolbar";
import { MonacoEditor } from "./MonacoEditor";
import { Preview } from "./Preview";
import { FilePane } from "./FilePane";
import { memoryFS } from "@/utils/memoryFileSystem";
import type { editor } from "monaco-editor";
import { TabsContent } from "@/components/ui/tabs";

export const EditorContainer = () => {
  const [currentFileName, setCurrentFileName] = useState<string>('untitled.tsx');
  const [code, setCode] = useState(`// Welcome to the code editor
function App() {
  return (
    <div>Hello World</div>
  );
}`);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [wordWrap, setWordWrap] = useState<"on" | "off">("on");
  const { toast } = useToast();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleUndo = () => {
    console.log('Attempting to undo...');
    if (editorRef.current) {
      editorRef.current.trigger('keyboard', 'undo', null);
    }
  };

  const handleFormatDocument = () => {
    console.log('Attempting to format document...');
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
    }
  };

  const handleCodeChange = (value: string | undefined) => {
    if (value) {
      setCode(value);
      memoryFS.writeFile(currentFileName, value);
      console.log(`Code updated and stored in memory for file: ${currentFileName}`);
    }
  };

  const handleFileSelect = (fileName: string) => {
    console.log('File selected:', fileName);
    const content = memoryFS.readFile(fileName);
    if (content) {
      setCurrentFileName(fileName);
      setCode(content);
      console.log('File content loaded into editor:', fileName);
    }
  };

  const handleDownloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFileName;
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
    <>
      <EditorToolbar
        showLineNumbers={showLineNumbers}
        wordWrap={wordWrap}
        onToggleLineNumbers={() => setShowLineNumbers(!showLineNumbers)}
        onToggleWordWrap={() => setWordWrap(wordWrap === "on" ? "off" : "on")}
        onFormatDocument={handleFormatDocument}
        onCopyCode={handleCopyCode}
        onDownloadCode={handleDownloadCode}
        onUndo={handleUndo}
        currentFileName={currentFileName}
      />

      <TabsContent value="editor" className="h-[calc(100%-50px)]">
        <div className="h-full flex">
          <div className="w-64">
            <FilePane 
              onFileSelect={handleFileSelect}
              currentFileName={currentFileName}
            />
          </div>
          <div className="flex-1">
            <MonacoEditor
              code={code}
              showLineNumbers={showLineNumbers}
              wordWrap={wordWrap}
              onChange={handleCodeChange}
              onUndo={handleUndo}
              onFormat={handleFormatDocument}
              ref={editorRef}
            />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="preview" className="h-[calc(100%-50px)] p-4">
        <div className="h-full rounded-lg border bg-background p-4">
          <Preview code={code} />
        </div>
      </TabsContent>
    </>
  );
};