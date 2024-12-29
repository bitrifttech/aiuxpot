import { toast } from "@/components/ui/use-toast";

export const fileApi = {
  async listFiles(): Promise<string[]> {
    try {
      console.log('Attempting to list files...');
      const response = await fetch('/api/files');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to list files');
      }
      
      // Store the parsed response to avoid reading the stream multiple times
      const files = await response.json();
      console.log('Files listed successfully:', files);
      return files;
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
      console.log('Attempting to read file:', filename);
      const response = await fetch(`/api/files/${filename}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to read file');
      }
      
      const data = await response.json();
      console.log('File read successfully:', filename);
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
      console.log('Attempting to write file:', filename);
      const response = await fetch(`/api/files/${filename}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to write file');
      }
      
      console.log('File written successfully:', filename);
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
      console.log('Attempting to delete file:', filename);
      const response = await fetch(`/api/files/${filename}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to delete file');
      }
      
      console.log('File deleted successfully:', filename);
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