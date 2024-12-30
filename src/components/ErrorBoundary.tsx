import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error);
    console.error('Component stack:', errorInfo.componentStack);
    
    // Log to help with debugging
    console.log('Current route:', window.location.pathname);
    console.log('localStorage:', {
      projects: localStorage.getItem('aiuxpot-projects'),
      currentProject: localStorage.getItem('aiuxpot-current-project'),
    });
  }

  private handleReload = () => {
    // Clear potentially corrupted state
    localStorage.removeItem('aiuxpot-current-project');
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="max-w-md p-8 bg-card rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-destructive mb-4">Something went wrong</h1>
            <div className="text-muted-foreground mb-6">
              <p className="mb-2">Error: {this.state.error?.message || 'An unexpected error occurred'}</p>
              {this.state.error?.stack && (
                <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                  {this.state.error.stack}
                </pre>
              )}
            </div>
            <div className="flex gap-4">
              <Button onClick={this.handleReload}>Reload Page</Button>
              <Button variant="outline" onClick={() => {
                localStorage.clear();
                window.location.href = '/';
              }}>
                Reset & Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
