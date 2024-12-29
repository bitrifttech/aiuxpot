import Editor from "@monaco-editor/react";
import { useRef } from "react";
import type { editor } from "monaco-editor";

interface MonacoEditorProps {
  code: string;
  showLineNumbers: boolean;
  wordWrap: "on" | "off";
  onChange: (value: string | undefined) => void;
  onUndo?: () => void;
  onFormat?: () => void;
}

export const MonacoEditor = ({
  code,
  showLineNumbers,
  wordWrap,
  onChange,
  onUndo,
  onFormat,
}: MonacoEditorProps) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
  };

  // Expose undo method to parent
  if (onUndo && editorRef.current) {
    onUndo = () => {
      console.log('Triggering undo command...');
      editorRef.current?.trigger('keyboard', 'undo', null);
    };
  }

  // Expose format method to parent
  if (onFormat && editorRef.current) {
    onFormat = () => {
      console.log('Triggering format command...');
      editorRef.current?.getAction('editor.action.formatDocument')?.run();
    };
  }

  return (
    <Editor
      height="100%"
      defaultLanguage="typescript"
      defaultValue={code}
      theme="vs-dark"
      onChange={onChange}
      onMount={handleEditorDidMount}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        wordWrap: wordWrap,
        lineNumbers: showLineNumbers ? "on" : "off",
        folding: true,
        foldingHighlight: true,
        foldingStrategy: 'auto',
        showFoldingControls: 'always',
        automaticLayout: true,
        tabSize: 2,
        formatOnPaste: true,
        formatOnType: true,
      }}
    />
  );
};