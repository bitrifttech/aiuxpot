const API_BASE = 'http://localhost:3001';

interface FileUpdate {
  path: string;
  content: string;
  type: string;
}

class PreviewApi {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private fileCache: Map<string, { content: string; timestamp: number }> = new Map();

  connect(): void {
    if (this.ws) return;

    this.ws = new WebSocket('ws://localhost:3001');

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.notifyListeners(message.type, message.data);

        // Update cache if file content changed
        if (message.type === 'fileChanged') {
          this.fileCache.set(message.data.path, {
            content: message.data.content,
            timestamp: Date.now()
          });
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket connection closed');
      this.ws = null;
      // Try to reconnect after a delay
      setTimeout(() => this.connect(), 5000);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  async updateFile(path: string, content: string, type: string): Promise<void> {
    try {
      // Update cache immediately
      this.fileCache.set(path, {
        content,
        timestamp: Date.now()
      });

      const response = await fetch(`${API_BASE}/files/${path}`, {
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
        throw new Error(`Failed to update file: ${response.statusText}`);
      }

      // Notify listeners
      this.notifyListeners('fileChanged', { path, content, type });
    } catch (error) {
      console.error('Error updating file:', error);
      throw error;
    }
  }

  async getFile(path: string): Promise<string> {
    try {
      // Check cache first
      const cached = this.fileCache.get(path);
      if (cached && Date.now() - cached.timestamp < 5000) { // 5 second cache
        console.log('Returning cached file:', path);
        return cached.content;
      }

      console.log('Fetching file from server:', path);
      const response = await fetch(`${API_BASE}/files/${path}`, {
        headers: {
          'Accept': 'text/plain, text/css, application/javascript, text/html',
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get file: ${response.statusText}`);
      }

      const content = await response.text();
      console.log('File content received:', path, content.length, 'bytes');

      // Update cache
      this.fileCache.set(path, {
        content,
        timestamp: Date.now()
      });

      return content;
    } catch (error) {
      console.error('Error getting file:', error);
      throw error;
    }
  }

  addEventListener(type: string, callback: (data: any) => void): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)?.add(callback);
  }

  removeEventListener(type: string, callback: (data: any) => void): void {
    this.listeners.get(type)?.delete(callback);
  }

  private notifyListeners(type: string, data: any): void {
    this.listeners.get(type)?.forEach(callback => callback(data));
  }
}

export const previewApi = new PreviewApi();
