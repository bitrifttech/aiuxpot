import { toast } from "@/components/ui/use-toast";

interface FileResponse {
  type: 'file' | 'directory';
  content?: string;
  files?: string[];
}

interface FileCache {
  content: string;
  timestamp: number;
  hash: string;
}

const FILE_CACHE_KEY = 'aiuxpot-file-cache';
const CACHE_DURATION = 5000; // 5 seconds
const MAX_CACHE_SIZE = 100; // Maximum number of cached files
const API_BASE = 'http://localhost:3001';
const CURRENT_PROJECT_KEY = 'aiuxpot-current-project';

class FileApi {
  private cache: Map<string, FileCache>;
  private currentProjectId: string | null;

  constructor() {
    this.cache = new Map();
    this.currentProjectId = null;
    this.loadCache();
    // Clean cache periodically
    setInterval(() => this.cleanCache(), 60000); // Clean every minute
  }

  private async computeHash(content: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private loadCache() {
    try {
      const savedCache = localStorage.getItem(FILE_CACHE_KEY);
      if (savedCache) {
        const parsed = JSON.parse(savedCache) as Record<string, FileCache>;
        const now = Date.now();
        
        // Filter out expired entries
        Object.entries(parsed).forEach(([path, cache]) => {
          if (now - cache.timestamp < CACHE_DURATION) {
            this.cache.set(path, cache);
          }
        });
      }
    } catch (error) {
      console.error('Error loading file cache:', error);
    }
  }

  private saveCache() {
    try {
      const cacheObj = Object.fromEntries(this.cache.entries());
      localStorage.setItem(FILE_CACHE_KEY, JSON.stringify(cacheObj));
    } catch (error) {
      console.error('Error saving file cache:', error);
    }
  }

  private cleanCache() {
    const now = Date.now();
    let changed = false;
    
    // Remove expired entries
    for (const [path, cache] of this.cache.entries()) {
      if (now - cache.timestamp > CACHE_DURATION) {
        this.cache.delete(path);
        changed = true;
      }
    }

    // Enforce maximum cache size
    if (this.cache.size > MAX_CACHE_SIZE) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      const toRemove = entries.slice(0, entries.length - MAX_CACHE_SIZE);
      toRemove.forEach(([key]) => this.cache.delete(key));
      changed = true;
    }

    if (changed) {
      this.saveCache();
    }
  }

  private checkProjectChange(): string | null {
    try {
      const currentProject = localStorage.getItem(CURRENT_PROJECT_KEY);
      if (!currentProject) {
        if (this.currentProjectId !== null) {
          // Project was unselected, clear cache
          this.currentProjectId = null;
          this.clearCache();
        }
        return null;
      }

      const { id: projectId } = JSON.parse(currentProject);
      if (this.currentProjectId !== projectId) {
        // Project changed, clear cache
        this.currentProjectId = projectId;
        this.clearCache();
      }
      return projectId;
    } catch (error) {
      console.error('Error checking project change:', error);
      return null;
    }
  }

  async listFiles(): Promise<string[]> {
    try {
      const projectId = this.checkProjectChange();
      if (!projectId) {
        console.error('No current project selected');
        return [];
      }

      const response = await fetch(`${API_BASE}/projects/${projectId}/files`);
      if (!response.ok) throw new Error('Failed to list files');
      const files = await response.json();
      // Convert the array of {path, type} objects to array of strings
      return files.map((file: { path: string; type: string }) => file.path);
    } catch (error) {
      console.error('Error listing files:', error);
      return [];
    }
  }

  async readFile(path: string): Promise<FileResponse> {
    try {
      const cached = this.cache.get(path);
      const now = Date.now();

      if (cached && now - cached.timestamp < CACHE_DURATION) {
        console.log('Returning cached file:', path);
        return {
          type: 'file',
          content: cached.content
        };
      }

      const projectId = this.checkProjectChange();
      if (!projectId) {
        throw new Error('No current project selected');
      }

      const response = await fetch(`${API_BASE}/projects/${projectId}/files/${encodeURIComponent(path)}`, {
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to read file: ${path}`);
      }

      const content = await response.text();
      const hash = await this.computeHash(content);

      this.cache.set(path, {
        content,
        timestamp: now,
        hash
      });

      this.saveCache();
      return {
        type: 'file',
        content
      };
    } catch (error) {
      console.error('Error reading file:', error);
      throw error;
    }
  }

  async writeFile(path: string, content: string): Promise<boolean> {
    try {
      const hash = await this.computeHash(content);
      const cached = this.cache.get(path);

      // Only update if content has changed
      if (cached && cached.hash === hash) {
        console.log('File content unchanged, skipping update');
        return true;
      }

      const projectId = this.checkProjectChange();
      if (!projectId) {
        console.error('No current project selected');
        return false;
      }

      const response = await fetch(`${API_BASE}/projects/${projectId}/files/${encodeURIComponent(path)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          content,
          type: 'file'  
        }),
      });
      
      if (!response.ok) throw new Error('Failed to write file');
      
      // Update cache
      this.cache.set(path, {
        content,
        timestamp: Date.now(),
        hash
      });
      this.saveCache();
      
      return true;
    } catch (error) {
      console.error('Error writing file:', error);
      return false;
    }
  }

  async deleteFile(path: string): Promise<boolean> {
    try {
      const projectId = this.checkProjectChange();
      if (!projectId) {
        console.error('No current project selected');
        return false;
      }

      const response = await fetch(`${API_BASE}/projects/${projectId}/files/${encodeURIComponent(path)}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete file');
      
      // Remove from cache
      this.cache.delete(path);
      this.saveCache();

      // Dispatch file deleted event
      window.dispatchEvent(new CustomEvent('file-deleted', { 
        detail: { path } 
      }));
      
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  async initProject(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to initialize project');
      }
      
      // Clear cache after project initialization
      this.clearCache();
      return true;
    } catch (error) {
      console.error('Error initializing project:', error);
      throw error;
    }
  }

  clearCache(): void {
    this.cache.clear();
    localStorage.removeItem(FILE_CACHE_KEY);
  }

  forceRefresh(path: string): void {
    this.cache.delete(path);
    this.saveCache();
  }
}

export const fileApi = new FileApi();