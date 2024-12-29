import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import Editor from "@monaco-editor/react";
import { useToast } from "@/components/ui/use-toast";

const Design = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const project = location.state?.project;
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
  const [input, setInput] = useState("");
  const [code, setCode] = useState(`// Welcome to the code editor
function App() {
  return (
    <div>Hello World</div>
  );
}`);
  const { toast } = useToast();

  if (!project) {
    navigate('/');
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
      console.log('Code updated:', value);
    }
  };

  const handleDownloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'code.tsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Code downloaded",
      description: "Your code has been downloaded successfully.",
    });
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
          {/* Chat Panel */}
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

          {/* Code Editor and Preview Panel */}
          <ResizablePanel defaultSize={70}>
            <Tabs defaultValue="editor" className="h-full">
              <div className="border-b px-4 flex justify-between items-center">
                <TabsList>
                  <TabsTrigger value="editor">Code Editor</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={handleDownloadCode}
                >
                  <Download className="h-4 w-4" />
                  Download Code
                </Button>
              </div>

              <TabsContent value="editor" className="h-[calc(100%-50px)]">
                <Editor
                  height="100%"
                  defaultLanguage="typescript"
                  defaultValue={code}
                  theme="vs-dark"
                  onChange={handleCodeChange}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: "on",
                    automaticLayout: true,
                    tabSize: 2,
                    formatOnPaste: true,
                    formatOnType: true,
                  }}
                />
              </TabsContent>

              <TabsContent value="preview" className="h-[calc(100%-50px)] p-4">
                <div className="h-full rounded-lg border bg-background p-4">
                  Preview content will appear here
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