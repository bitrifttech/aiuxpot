import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Loader2 } from 'lucide-react';

interface PreviewPaneProps {
  content: string;
  filePath: string;
  className?: string;
}

export function PreviewPane({ content, filePath, className }: PreviewPaneProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    setIsLoading(true);
    setError(null);

    try {
      const fileExt = filePath.split('.').pop()?.toLowerCase();
      const blob = new Blob([content], { type: getContentType(fileExt) });
      const url = URL.createObjectURL(blob);

      iframe.src = url;

      const handleLoad = () => {
        setIsLoading(false);
        URL.revokeObjectURL(url);
      };

      const handleError = () => {
        setIsLoading(false);
        setError('Failed to load preview');
        URL.revokeObjectURL(url);
      };

      iframe.addEventListener('load', handleLoad);
      iframe.addEventListener('error', handleError);

      return () => {
        URL.revokeObjectURL(url);
        iframe.removeEventListener('load', handleLoad);
        iframe.removeEventListener('error', handleError);
      };
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : 'Failed to create preview');
    }
  }, [content, filePath]);

  return (
    <ErrorBoundary>
      <div className={cn('relative w-full h-full bg-background', className)}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <div className="text-destructive text-sm">{error}</div>
          </div>
        )}
        <iframe
          ref={iframeRef}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin"
          title="Preview"
        />
      </div>
    </ErrorBoundary>
  );
}

function getContentType(fileExt?: string): string {
  switch (fileExt) {
    case 'html':
      return 'text/html';
    case 'css':
      return 'text/css';
    case 'js':
    case 'jsx':
      return 'text/javascript';
    case 'ts':
    case 'tsx':
      return 'text/typescript';
    case 'json':
      return 'application/json';
    case 'md':
      return 'text/markdown';
    case 'svg':
      return 'image/svg+xml';
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'gif':
      return 'image/gif';
    default:
      return 'text/plain';
  }
}
