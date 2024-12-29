import { Button } from "@/components/ui/button";
import { Download, Copy, FileCode, ChevronDown, Hash, WrapText, Undo } from "lucide-react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EditorToolbarProps {
  showLineNumbers: boolean;
  wordWrap: "on" | "off";
  onToggleLineNumbers: () => void;
  onToggleWordWrap: () => void;
  onFormatDocument: () => void;
  onCopyCode: () => void;
  onDownloadCode: () => void;
  onUndo: () => void;
  currentFileName?: string;
}

export const EditorToolbar = ({
  showLineNumbers,
  wordWrap,
  onToggleLineNumbers,
  onToggleWordWrap,
  onFormatDocument,
  onCopyCode,
  onDownloadCode,
  onUndo,
  currentFileName,
}: EditorToolbarProps) => {
  return (
    <div className="border-b px-4 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <TabsList>
          <TabsTrigger value="editor">Code Editor</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        {currentFileName && (
          <span className="text-sm text-muted-foreground">
            Editing: {currentFileName}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            console.log('Undo button clicked');
            onUndo();
          }}
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleLineNumbers}
          title="Toggle line numbers"
        >
          <Hash className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleWordWrap}
          title="Toggle word wrap"
        >
          <WrapText className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            console.log('Format button clicked');
            onFormatDocument();
          }}
          title="Format document"
        >
          <FileCode className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onCopyCode}
          title="Copy code"
        >
          <Copy className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={onDownloadCode}
        >
          <Download className="h-4 w-4" />
          Download Code
        </Button>
      </div>
    </div>
  );
};