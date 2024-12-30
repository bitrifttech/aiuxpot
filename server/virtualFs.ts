import { EventEmitter } from 'events';

export interface VirtualFile {
  content: string;
  type: string;
  lastModified: number;
}

export class VirtualFileSystem extends EventEmitter {
  private files: Map<string, VirtualFile>;

  constructor() {
    super();
    this.files = new Map();
  }

  getFile(path: string): VirtualFile | null {
    console.log('Getting file:', path);
    const file = this.files.get(path);
    if (file) {
      console.log('File found:', path, 'Type:', file.type);
    } else {
      console.log('File not found:', path);
    }
    return file || null;
  }

  setFile(path: string, content: string, type: string): void {
    console.log('Setting file:', path, 'Type:', type);
    this.files.set(path, {
      content,
      type,
      lastModified: Date.now()
    });
    this.emit('fileChanged', { path, content, type });
  }

  deleteFile(path: string): void {
    console.log('Deleting file:', path);
    this.files.delete(path);
    this.emit('fileDeleted', { path });
  }

  listFiles(): string[] {
    console.log('Listing all files');
    return Array.from(this.files.keys());
  }

  getContentType(path: string): string {
    const ext = path.split('.').pop()?.toLowerCase();
    console.log('Getting content type for:', path, 'Extension:', ext);
    
    switch (ext) {
      case 'html':
        return 'text/html';
      case 'css':
        return 'text/css';
      case 'js':
        return 'application/javascript';
      case 'json':
        return 'application/json';
      case 'png':
        return 'image/png';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'gif':
        return 'image/gif';
      case 'svg':
        return 'image/svg+xml';
      default:
        return 'text/plain';
    }
  }
}
