import { toast } from "@/components/ui/use-toast";

interface FileResponse {
  type: 'file' | 'directory';
  content?: string;
  files?: string[];
}

interface FileCache {
  content: string;
  timestamp: number;
}

const FILE_CACHE_KEY = 'aiuxpot-file-cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const API_BASE = 'http://localhost:3001';
const CURRENT_PROJECT_KEY = 'aiuxpot-current-project';

class FileApi {
  private cache: Map<string, FileCache>;
  private currentProjectId: string | null;

  constructor() {
    this.cache = new Map();
    this.currentProjectId = null;
    this.loadCache();
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

  private clearCache() {
    this.cache.clear();
    localStorage.removeItem(FILE_CACHE_KEY);
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

  async readFile(path: string): Promise<string | null> {
    try {
      // Check cache first
      const cached = this.cache.get(path);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('Cache hit for:', path);
        return cached.content;
      }

      console.log('Cache miss for:', path);
      const projectId = this.checkProjectChange();
      if (!projectId) {
        console.error('No current project selected');
        return null;
      }

      const response = await fetch(`${API_BASE}/projects/${projectId}/files/${encodeURIComponent(path)}`);
      if (!response.ok) throw new Error('Failed to read file');
      
      const data = await response.json();
      if (data.type === 'directory') {
        return null;
      }

      // Update cache
      this.cache.set(path, {
        content: data.content,
        timestamp: Date.now()
      });
      this.saveCache();
      
      return data.content;
    } catch (error) {
      console.error('Error reading file:', error);
      return null;
    }
  }

  async writeFile(path: string, content: string): Promise<boolean> {
    try {
      const projectId = this.checkProjectChange();
      if (!projectId) {
        console.error('No current project selected');
        return false;
      }

      const response = await fetch(`${API_BASE}/projects/${projectId}/files/${encodeURIComponent(path)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content,
          type: 'file'  
        }),
      });
      
      if (!response.ok) throw new Error('Failed to write file');
      
      // Update cache
      this.cache.set(path, {
        content,
        timestamp: Date.now()
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
}

export const fileApi = new FileApi();