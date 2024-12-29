import { useState } from 'react';
import { Editor } from '@monaco-editor/react';

export function SimpleEditor() {
  const [code, setCode] = useState('// Type your code here');

  return (
    <div className="h-full w-full">
      <Editor
        defaultLanguage="typescript"
        value={code}
        onChange={value => value && setCode(value)}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          automaticLayout: true,
        }}
      />
    </div>
  );
}
