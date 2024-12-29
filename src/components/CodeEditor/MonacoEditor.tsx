import Editor from "@monaco-editor/react";
import { useRef } from "react";
import type { editor } from "monaco-editor";

interface MonacoEditorProps {
  code: string;
  showLineNumbers: boolean;
  wordWrap: "on" | "off";
  onChange: (value: string | undefined) => void;
}

export const MonacoEditor = ({
  code,
  showLineNumbers,
  wordWrap,
  onChange,
}: MonacoEditorProps) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
  };

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