import Editor from "@monaco-editor/react";
import { useEffect, forwardRef } from "react";
import type { editor } from "monaco-editor";

interface MonacoEditorProps {
  code: string;
  showLineNumbers: boolean;
  wordWrap: "on" | "off";
  onChange: (value: string | undefined) => void;
  onUndo?: () => void;
  onFormat?: () => void;
}

export const MonacoEditor = forwardRef<editor.IStandaloneCodeEditor, MonacoEditorProps>(({
  code,
  showLineNumbers,
  wordWrap,
  onChange,
  onUndo,
  onFormat,
}, ref) => {
  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    if (typeof ref === 'function') {
      ref(editor);
    } else if (ref) {
      ref.current = editor;
    }
  };

  useEffect(() => {
    if (ref && onUndo) {
      onUndo = () => {
        console.log('Executing undo command...');
        if (typeof ref === 'function') {
          // Handle function ref case
        } else if (ref.current) {
          ref.current.trigger('keyboard', 'undo', null);
        }
      };
    }
  }, [ref, onUndo]);

  useEffect(() => {
    if (ref && onFormat) {
      onFormat = () => {
        console.log('Executing format command...');
        if (typeof ref === 'function') {
          // Handle function ref case
        } else if (ref.current) {
          ref.current.getAction('editor.action.formatDocument')?.run();
        }
      };
    }
  }, [ref, onFormat]);

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
});

MonacoEditor.displayName = 'MonacoEditor';