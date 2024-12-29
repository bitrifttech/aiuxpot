import { useEffect, useRef } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import { ErrorBoundary } from '@/components/ErrorBoundary';

loader.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs'
  }
});

interface MonacoEditorProps {
  code: string;
  onChange?: (value: string | undefined) => void;
  showLineNumbers?: boolean;
  wordWrap?: 'on' | 'off';
  language?: string;
}

const getLanguageFromFilename = (filename?: string): string => {
  if (!filename) return 'typescript';
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js':
      return 'javascript';
    case 'jsx':
      return 'javascript';
    case 'ts':
      return 'typescript';
    case 'tsx':
      return 'typescript';
    case 'json':
      return 'json';
    case 'html':
      return 'html';
    case 'css':
      return 'css';
    case 'scss':
      return 'scss';
    case 'md':
      return 'markdown';
    default:
      return 'typescript';
  }
};

export const MonacoEditor = ({
  code,
  onChange,
  showLineNumbers = true,
  wordWrap = 'on',
  language,
}: MonacoEditorProps) => {
  return (
    <ErrorBoundary>
      <Editor
        height="100%"
        defaultLanguage={language || 'typescript'}
        defaultValue={code}
        onChange={onChange}
        options={{
          minimap: { enabled: false },
          lineNumbers: showLineNumbers ? 'on' : 'off',
          wordWrap,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          contextmenu: true,
          scrollbar: {
            vertical: 'visible',
            horizontal: 'visible',
          },
        }}
        beforeMount={(monaco) => {
          monaco.editor.defineTheme('custom-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [],
            colors: {},
          });
          monaco.editor.setTheme('custom-dark');
        }}
      />
    </ErrorBoundary>
  );
};

MonacoEditor.displayName = 'MonacoEditor';