import React, { useEffect, useState } from 'react';

interface PreviewPaneProps {
  currentFileName?: string;
}

export function PreviewPane({ currentFileName }: PreviewPaneProps) {
  const [key, setKey] = useState(0);

  // Refresh iframe when file changes
  useEffect(() => {
    setKey(prev => prev + 1);
  }, [currentFileName]);

  if (!currentFileName) {
    return (
      <div className="flex items-center justify-center h-full bg-background border-l">
        <p className="text-muted-foreground">Select a file to preview</p>
      </div>
    );
  }

  const previewUrl = `/preview?file=${encodeURIComponent(currentFileName)}`;

  return (
    <div className="h-full bg-background border-l flex flex-col">
      <div className="p-2 border-b flex items-center justify-between">
        <h2 className="text-sm font-semibold">Preview</h2>
        <button
          onClick={() => setKey(prev => prev + 1)}
          className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          Refresh
        </button>
      </div>
      <div className="flex-1 relative">
        <iframe
          key={key}
          src={previewUrl}
          className="absolute inset-0 w-full h-full border-0"
          title="Component Preview"
        />
      </div>
    </div>
  );
} 