import { Toaster } from "@/components/ui/toaster";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { EditorToolbar } from "@/components/CodeEditor/EditorToolbar";
import { MonacoEditor } from "@/components/CodeEditor/MonacoEditor";
import { Preview } from "@/components/CodeEditor/Preview";
import { FilePane } from "@/components/CodeEditor/FilePane";
import { memoryFS } from "@/utils/memoryFileSystem";
import type { editor } from "monaco-editor";

const DEFAULT_FILE_NAME = 'untitled.tsx';

const Design = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const project = location.state?.project;
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
  const [input, setInput] = useState("");
  const [currentFileName, setCurrentFileName] = useState(DEFAULT_FILE_NAME);
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

  // Initialize the default file in memory if it doesn't exist
  useEffect(() => {
    if (!memoryFS.readFile(DEFAULT_FILE_NAME)) {
      memoryFS.writeFile(DEFAULT_FILE_NAME, code);
      console.log('Initialized default file in memory');
    }
  }, []);

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

  useEffect(() => {
    if (!project) {
      navigate('/');
    }
  }, [project, navigate]);

  if (!project) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput("");
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "This is a simulated response. In a real implementation, this would be connected to an AI service." 
      }]);
    }, 1000);
  };

  const handleCodeChange = (value: string | undefined) => {
    if (value) {
      setCode(value);
      // Store the code in memory file system
      memoryFS.writeFile(currentFileName, value);
      console.log(`Code updated and stored in memory for file: ${currentFileName}`);
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

  const handleFileSelect = (fileName: string) => {
    const content = memoryFS.readFile(fileName);
    if (content) {
      setCurrentFileName(fileName);
      setCode(content);
      console.log('File content loaded into editor:', fileName);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="border-b p-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-semibold">{project.title}</h1>
      </div>
      
      <div className="flex-1">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={30} minSize={20}>
            <div className="h-full flex flex-col bg-sidebar p-4">
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                  {messages.map((message, i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground ml-4'
                          : 'bg-muted text-muted-foreground mr-4'
                      }`}
                    >
                      {message.content}
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <form onSubmit={handleSubmit} className="mt-4">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full p-2 rounded-lg border bg-background"
                />
              </form>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={70}>
            <Tabs defaultValue="editor" className="h-full">
              <EditorToolbar
                showLineNumbers={showLineNumbers}
                wordWrap={wordWrap}
                onToggleLineNumbers={() => setShowLineNumbers(!showLineNumbers)}
                onToggleWordWrap={() => setWordWrap(wordWrap === "on" ? "off" : "on")}
                onFormatDocument={handleFormatDocument}
                onCopyCode={handleCopyCode}
                onDownloadCode={handleDownloadCode}
                onUndo={handleUndo}
              />

              <TabsContent value="editor" className="h-[calc(100%-50px)]">
                <div className="h-full flex">
                  <div className="w-64">
                    <FilePane onFileSelect={handleFileSelect} />
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
            </Tabs>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default Design;