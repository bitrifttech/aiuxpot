type FileData = {
  content: string;
  timestamp: number;
};

class MemoryFileSystem {
  private files: Map<string, FileData>;

  constructor() {
    this.files = new Map();
    console.log('Memory file system initialized');
  }

  writeFile(path: string, content: string): void {
    this.files.set(path, {
      content,
      timestamp: Date.now()
    });
    console.log(`File written to memory: ${path}`);
  }

  readFile(path: string): string | null {
    const file = this.files.get(path);
    if (!file) {
      console.log(`File not found in memory: ${path}`);
      return null;
    }
    console.log(`File read from memory: ${path}`);
    return file.content;
  }

  deleteFile(path: string): boolean {
    const result = this.files.delete(path);
    console.log(`File deletion ${result ? 'successful' : 'failed'}: ${path}`);
    return result;
  }

  listFiles(): string[] {
    return Array.from(this.files.keys());
  }
}

export const memoryFS = new MemoryFileSystem();