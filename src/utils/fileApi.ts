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
const API_BASE = '/api';

class FileApi {
  private cache: Map<string, FileCache>;

  constructor() {
    this.cache = new Map();
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

  async listFiles(): Promise<string[]> {
    try {
      const response = await fetch(`${API_BASE}/files`);
      if (!response.ok) throw new Error('Failed to list files');
      return await response.json();
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
      const response = await fetch(`${API_BASE}/files/read?path=${encodeURIComponent(path)}`);
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
      const response = await fetch(`${API_BASE}/files/write`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, content }),
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
      const response = await fetch(`${API_BASE}/files/delete?path=${encodeURIComponent(path)}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete file');
      
      // Remove from cache
      this.cache.delete(path);
      this.saveCache();
      
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  clearCache() {
    this.cache.clear();
    localStorage.removeItem(FILE_CACHE_KEY);
  }
}

export const fileApi = new FileApi();