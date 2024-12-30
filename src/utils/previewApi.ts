const API_BASE = 'http://localhost:3001';

interface FileUpdate {
  projectId: string;
  path: string;
  content: string;
  type: string;
}

interface Project {
  id: string;
  name: string;
  fileCount: number;
}

class PreviewApi {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private fileCache: Map<string, { content: string; timestamp: number }> = new Map();
  private currentProjectId: string | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  constructor() {
    // Try to restore current project from localStorage
    try {
      const savedProject = localStorage.getItem('aiuxpot-current-project');
      if (savedProject) {
        const { id } = JSON.parse(savedProject);
        this.currentProjectId = id;
      }
    } catch (error) {
      console.error('Error restoring current project:', error);
    }
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    try {
      this.ws = new WebSocket('ws://localhost:3003');
      console.log('Connecting to WebSocket server...');

      this.ws.onopen = () => {
        console.log('WebSocket connection established');
        this.reconnectAttempts = 0;
        
        // Send current project ID to sync server state
        if (this.currentProjectId) {
          this.ws.send(JSON.stringify({
            type: 'setProject',
            data: { projectId: this.currentProjectId }
          }));
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.notifyListeners(message.type, message.data);

          if (message.type === 'fileChanged') {
            const cacheKey = this.getCacheKey(message.data.projectId, message.data.path);
            this.fileCache.set(cacheKey, {
              content: message.data.content,
              timestamp: Date.now()
            });
          }
        } catch (error) {
          console.error('Error handling WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket connection closed');
        this.ws = null;

        // Try to reconnect with backoff
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
          this.reconnectAttempts++;
          console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
          setTimeout(() => this.connect(), delay);
        } else {
          console.error('Max reconnection attempts reached');
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
    }
  }

  async createProject(name: string): Promise<string> {
    console.log('Creating project:', name);
    const response = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to create project:', error);
      throw new Error(error || 'Failed to create project');
    }

    const { projectId } = await response.json();
    console.log('Project created:', { projectId, name });
    return projectId;
  }

  async listProjects(): Promise<Project[]> {
    console.log('Listing projects');
    const response = await fetch(`${API_BASE}/projects`);
    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to list projects:', error);
      throw new Error(error || 'Failed to list projects');
    }
    const projects = await response.json();
    console.log('Projects retrieved:', projects);
    return projects;
  }

  async deleteProject(projectId: string): Promise<void> {
    console.log('Deleting project:', projectId);
    const response = await fetch(`${API_BASE}/projects/${projectId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to delete project:', error);
      throw new Error(error || 'Failed to delete project');
    }

    console.log('Project deleted:', projectId);
    if (this.currentProjectId === projectId) {
      this.currentProjectId = null;
    }
  }

  setCurrentProject(projectId: string | null): void {
    console.log('Setting current project:', projectId);
    if (this.currentProjectId !== projectId) {
      this.currentProjectId = projectId;
      this.fileCache.clear();

      // Update localStorage
      if (projectId) {
        localStorage.setItem('aiuxpot-current-project', JSON.stringify({ id: projectId }));
      } else {
        localStorage.removeItem('aiuxpot-current-project');
      }

      // Notify WebSocket if connected
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          type: 'setProject',
          data: { projectId }
        }));
      }

      // Notify listeners
      this.notifyListeners('projectChanged', { projectId });
    }
  }

  getCurrentProject(): string {
    if (!this.currentProjectId) {
      throw new Error('No project selected');
    }
    return this.currentProjectId;
  }

  async updateFile(path: string, content: string, type: string): Promise<void> {
    const projectId = this.getCurrentProject();
    console.log('Updating file:', { projectId, path, type });
    
    try {
      // Update cache immediately
      const cacheKey = this.getCacheKey(projectId, path);
      this.fileCache.set(cacheKey, {
        content,
        timestamp: Date.now()
      });

      const response = await fetch(`${API_BASE}/projects/${projectId}/files/${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          content, 
          type,
          timestamp: Date.now() 
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to update file');
      }

      console.log('File updated successfully:', { projectId, path });
      this.notifyListeners('fileChanged', { projectId, path, content, type });
    } catch (error) {
      console.error('Error updating file:', error);
      throw error;
    }
  }

  async getFile(path: string): Promise<string> {
    const projectId = this.getCurrentProject();
    try {
      // Check cache first
      const cacheKey = this.getCacheKey(projectId, path);
      const cached = this.fileCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < 5000) { // 5 second cache
        console.log('Returning cached file:', { projectId, path });
        return cached.content;
      }

      console.log('Fetching file from server:', { projectId, path });
      const response = await fetch(`${API_BASE}/projects/${projectId}/files/${path}`, {
        headers: {
          'Accept': 'text/plain, text/css, application/javascript, text/html',
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to get file');
      }

      const content = await response.text();
      console.log('File content received:', { projectId, path, size: content.length });

      // Update cache
      this.fileCache.set(cacheKey, {
        content,
        timestamp: Date.now()
      });

      return content;
    } catch (error) {
      console.error('Error getting file:', error);
      throw error;
    }
  }

  async listFiles(): Promise<Array<{ path: string; type: string }>> {
    const projectId = this.getCurrentProject();
    console.log('Listing files for project:', projectId);
    
    const response = await fetch(`${API_BASE}/projects/${projectId}/files`);
    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to list files:', error);
      throw new Error(error || 'Failed to list files');
    }
    
    const files = await response.json();
    console.log('Files retrieved:', { projectId, files });
    return files;
  }

  addListener(type: string, callback: (data: any) => void): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)?.add(callback);
  }

  removeListener(type: string, callback: (data: any) => void): void {
    this.listeners.get(type)?.delete(callback);
    if (this.listeners.get(type)?.size === 0) {
      this.listeners.delete(type);
    }
  }

  private notifyListeners(type: string, data: any): void {
    const typeListeners = this.listeners.get(type);
    if (typeListeners) {
      typeListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in listener callback:', error);
        }
      });
    }
  }

  private getCacheKey(projectId: string, path: string): string {
    return `${projectId}:${path}`;
  }
}

export const previewApi = new PreviewApi();
