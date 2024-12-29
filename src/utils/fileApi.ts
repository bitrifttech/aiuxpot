import { toast } from "@/components/ui/use-toast";

export const fileApi = {
  async listFiles(): Promise<string[]> {
    try {
      const response = await fetch('/api/files');
      if (!response.ok) throw new Error('Failed to list files');
      return await response.json();
    } catch (error) {
      console.error('Error listing files:', error);
      toast({
        title: "Error",
        description: "Failed to list files",
        variant: "destructive",
      });
      return [];
    }
  },

  async readFile(filename: string): Promise<string | null> {
    try {
      const response = await fetch(`/api/files/${filename}`);
      if (!response.ok) throw new Error('Failed to read file');
      const data = await response.json();
      return data.content;
    } catch (error) {
      console.error('Error reading file:', error);
      toast({
        title: "Error",
        description: `Failed to read file: ${filename}`,
        variant: "destructive",
      });
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
      if (!response.ok) throw new Error('Failed to write file');
      return true;
    } catch (error) {
      console.error('Error writing file:', error);
      toast({
        title: "Error",
        description: `Failed to write file: ${filename}`,
        variant: "destructive",
      });
      return false;
    }
  },

  async deleteFile(filename: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/files/${filename}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete file');
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: "Error",
        description: `Failed to delete file: ${filename}`,
        variant: "destructive",
      });
      return false;
    }
  },
};