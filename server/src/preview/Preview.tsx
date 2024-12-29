import React, { useEffect, useState } from 'react';

interface PreviewProps {
  onError?: (error: Error) => void;
}

export const Preview: React.FC<PreviewProps> = ({ onError }) => {
  const [Component, setComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadPreview = async () => {
      try {
        // Get the current preview file from the URL query params
        const params = new URLSearchParams(window.location.search);
        const file = params.get('file');

        if (!file) {
          throw new Error('No preview file specified');
        }

        // Dynamically import the preview file
        const module = await import(`/preview/file/${file}`);
        const PreviewComponent = module.default;

        if (!PreviewComponent) {
          throw new Error('Preview component not found');
        }

        setComponent(() => PreviewComponent);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to load preview');
        setError(error);
        onError?.(error);
      }
    };

    loadPreview();
  }, [onError]);

  if (error) {
    return (
      <div className="preview-error">
        <h2>Preview Error</h2>
        <pre>{error.message}</pre>
      </div>
    );
  }

  if (!Component) {
    return (
      <div className="preview-loading">
        Loading preview...
      </div>
    );
  }

  return (
    <div className="preview-container">
      <Component />
    </div>
  );
}; 