import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { previewApi } from '@/utils/previewApi';

interface PreviewFrameProps {
  projectId: string;
  filePath: string;
  content: string;
}

interface FileResources {
  html: string[];
  css: string[];
  js: string[];
}

export const PreviewFrame = ({ projectId, filePath, content }: PreviewFrameProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [resources, setResources] = useState<FileResources>({
    html: [],
    css: [],
    js: []
  });
  const { toast } = useToast();

  // Set current project
  useEffect(() => {
    console.log('Setting current project:', projectId);
    previewApi.setCurrentProject(projectId);
  }, [projectId]);

  // Track related files
  useEffect(() => {
    const fileExt = filePath.split('.').pop()?.toLowerCase();
    if (!fileExt) return;

    console.log('Current file:', { projectId, filePath, fileExt });

    setResources(prev => {
      const newResources = { ...prev };
      // Remove the current file from all arrays
      Object.keys(newResources).forEach(key => {
        newResources[key as keyof FileResources] = newResources[key as keyof FileResources]
          .filter(path => path !== filePath);
      });
      // Add the file to the appropriate array
      if (fileExt === 'html' || fileExt === 'css' || fileExt === 'js') {
        newResources[fileExt] = [filePath];
      }
      console.log('Updated resources:', { projectId, resources: newResources });
      return newResources;
    });
  }, [projectId, filePath]);

  // Listen for file updates
  useEffect(() => {
    const handleFileChange = async ({ projectId: changedProjectId, path, content: newContent }: { projectId: string, path: string, content: string }) => {
      // Only handle updates for current project
      if (changedProjectId !== projectId) {
        console.log('Ignoring file change from different project:', { changedProjectId, currentProject: projectId });
        return;
      }

      const ext = path.split('.').pop()?.toLowerCase();
      if (!ext || !['html', 'css', 'js'].includes(ext)) return;

      console.log('File changed:', { projectId, path, ext });

      // Update the resources to trigger a preview update
      setResources(prev => {
        const newResources = { ...prev };
        const fileType = ext as keyof FileResources;
        if (!newResources[fileType].includes(path)) {
          newResources[fileType] = [...newResources[fileType], path];
        }
        console.log('Updated resources after change:', { projectId, resources: newResources });
        return newResources;
      });
    };

    previewApi.addEventListener('fileChanged', handleFileChange);
    return () => previewApi.removeEventListener('fileChanged', handleFileChange);
  }, [projectId]);

  const injectCSS = async (doc: Document): Promise<void> => {
    console.log('Injecting CSS files:', { projectId, files: resources.css });
    for (const cssPath of resources.css) {
      try {
        console.log('Loading CSS from:', { projectId, path: cssPath });
        const cssContent = await previewApi.getFile(cssPath);
        console.log('CSS content:', cssContent);
        
        // Create a blob URL for the CSS
        const blob = new Blob([cssContent], { type: 'text/css' });
        const cssUrl = URL.createObjectURL(blob);
        
        // Create link element
        const link = doc.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = cssUrl;
        link.setAttribute('data-path', cssPath);
        
        // Add load event listener
        link.onload = () => {
          console.log('CSS loaded successfully:', { projectId, path: cssPath });
          URL.revokeObjectURL(cssUrl);
        };
        
        link.onerror = (e) => {
          console.error('Error loading CSS:', { projectId, path: cssPath, error: e });
        };
        
        doc.head.appendChild(link);
      } catch (error) {
        console.error('Error injecting CSS:', { projectId, path: cssPath, error });
      }
    }
  };

  const injectJS = async (doc: Document): Promise<void> => {
    console.log('Injecting JS files:', { projectId, files: resources.js });
    for (const jsPath of resources.js) {
      try {
        console.log('Loading JS from:', { projectId, path: jsPath });
        const jsContent = await previewApi.getFile(jsPath);
        console.log('JS content:', jsContent.substring(0, 100) + '...');
        const script = doc.createElement('script');
        script.text = jsContent;
        script.setAttribute('data-path', jsPath);
        doc.body.appendChild(script);
        console.log('JS injected successfully:', { projectId, path: jsPath });
      } catch (error) {
        console.error('Error loading JavaScript:', { projectId, path: jsPath, error });
      }
    }
  };

  const updatePreview = async () => {
    const iframe = iframeRef.current;
    if (!iframe) {
      console.error('No iframe reference available');
      return;
    }

    try {
      const doc = iframe.contentDocument;
      if (!doc) {
        console.error('No document available in iframe');
        return;
      }

      setIsLoading(true);
      console.log('Starting preview update:', { projectId, resources });

      // Start with a clean document
      doc.open();
      doc.write('<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body></body></html>');
      console.log('Base HTML document created');

      // First, inject CSS
      await injectCSS(doc);

      // Then, add HTML content
      if (resources.html.length > 0) {
        try {
          console.log('Loading HTML from:', { projectId, path: resources.html[0] });
          const htmlContent = await previewApi.getFile(resources.html[0]);
          console.log('HTML content:', htmlContent.substring(0, 100) + '...');
          
          // Extract body content
          const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*)<\/body>/i);
          const bodyContent = bodyMatch ? bodyMatch[1] : htmlContent;
          doc.body.innerHTML = bodyContent;
          console.log('Body content injected');

          // Extract and append head content (except scripts)
          const headMatch = htmlContent.match(/<head[^>]*>([\s\S]*)<\/head>/i);
          if (headMatch) {
            const headContent = headMatch[1].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
            doc.head.insertAdjacentHTML('beforeend', headContent);
            console.log('Head content injected');
          }
        } catch (error) {
          console.error('Error loading HTML:', { projectId, error });
        }
      }

      // Add error handling
      const errorScript = doc.createElement('script');
      errorScript.text = `
        window.onerror = function(message, source, lineno, colno, error) {
          console.error('Preview error:', message, source, lineno, colno);
          window.parent.postMessage({
            type: 'error',
            message: message,
            source: source,
            lineno: lineno,
            colno: colno
          }, '*');
          return true;
        };
        console._error = console.error;
        console.error = function(...args) {
          console._error.apply(this, args);
          window.parent.postMessage({
            type: 'error',
            message: args.join(' ')
          }, '*');
        };
      `;
      doc.head.appendChild(errorScript);
      console.log('Error handling script injected');

      // Finally, inject JavaScript
      await injectJS(doc);

      doc.close();
      console.log('Preview update completed for project:', projectId);
    } catch (error) {
      console.error('Error updating preview:', { projectId, error });
      toast({
        title: 'Preview Error',
        description: 'Failed to update preview',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update preview when content or resources change
  useEffect(() => {
    console.log('Content or resources changed, updating preview:', { projectId });
    updatePreview();
  }, [projectId, content, resources]);

  // Handle preview messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'error') {
        console.error('Preview frame error:', { projectId, error: event.data });
        toast({
          title: 'Preview Error',
          description: event.data.message,
          variant: 'destructive',
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [projectId, toast]);

  return (
    <div className="w-full h-full relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        </div>
      )}
      <iframe
        ref={iframeRef}
        className="w-full h-full bg-white"
        sandbox="allow-scripts allow-same-origin allow-forms"
        title="Preview"
      />
    </div>
  );
};
