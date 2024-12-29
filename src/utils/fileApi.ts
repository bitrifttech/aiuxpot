import { toast } from "@/components/ui/use-toast";

interface FileResponse {
  type: 'file' | 'directory';
  content?: string;
  files?: string[];
}

export const fileApi = {
  async listFiles(): Promise<string[]> {
    try {
      const response = await fetch('/api/files');
      if (!response.ok) {
        throw new Error('Failed to list files');
      }
      return await response.json();
    } catch (error) {
      console.error('Error listing files:', error);
      return [];
    }
  },

  async readFile(filename: string): Promise<string | null> {
    try {
      const response = await fetch(`/api/files/${filename}`);
      if (!response.ok) {
        throw new Error('Failed to read file');
      }
      const data: FileResponse = await response.json();
      if (data.type === 'directory') {
        return null; // Don't try to read directories as files
      }
      return data.content || null;
    } catch (error) {
      console.error('Error reading file:', error);
      return null;
    }
  },

  async writeFile(filename: string, content: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/files/${filename}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) {
        throw new Error('Failed to write file');
      }
      return true;
    } catch (error) {
      console.error('Error writing file:', error);
      return false;
    }
  },

  async deleteFile(filename: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/files/${filename}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete file');
      }
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  },
};