import { useEffect, useRef } from 'react';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';

interface PreviewProps {
  code: string;
}

export const Preview = ({ code }: PreviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<ReactDOM.Root | null>(null);

  useEffect(() => {
    try {
      // Clear previous content
      if (containerRef.current) {
        if (!rootRef.current) {
          rootRef.current = ReactDOM.createRoot(containerRef.current);
        }

        // Transform the code string into a React component
        const transformedCode = `
          ${code}
          return App;
        `;
        
        const Component = new Function(transformedCode)();
        
        rootRef.current.render(
          <React.StrictMode>
            <ErrorBoundary>
              <Component />
            </ErrorBoundary>
          </React.StrictMode>
        );
      }
    } catch (error) {
      console.error('Preview error:', error);
      if (rootRef.current && containerRef.current) {
        rootRef.current.render(
          <div className="text-red-500 p-4">
            Error rendering preview: {error.message}
          </div>
        );
      }
    }
  }, [code]);

  return <div ref={containerRef} className="h-full w-full" />;
};

// Error Boundary component to catch runtime errors
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-red-500 p-4">
          Runtime error: {this.state.error?.message}
        </div>
      );
    }

    return this.props.children;
  }
}