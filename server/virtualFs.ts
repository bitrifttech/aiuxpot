import { EventEmitter } from 'events';
import path from 'path';

interface VirtualFile {
  content: string;
  type: string;
}

interface Project {
  id: string;
  name: string;
  files: Map<string, VirtualFile>;
  createdAt: Date;
  updatedAt: Date;
}

export class VirtualFileSystem extends EventEmitter {
  private projects: Map<string, Project>;

  constructor() {
    super();
    this.projects = new Map();
    console.log('VirtualFileSystem initialized');
  }

  createProject(name: string): string {
    const id = this.generateProjectId();
    console.log('Creating project:', { id, name });
    
    const project: Project = {
      id,
      name,
      files: new Map(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.projects.set(id, project);
    console.log('Project created:', { id, name });
    console.log('Current projects:', Array.from(this.projects.keys()));
    return id;
  }

  deleteProject(projectId: string): boolean {
    console.log('Deleting project:', projectId);
    const project = this.projects.get(projectId);
    if (!project) {
      console.log('Project not found for deletion:', projectId);
      return false;
    }

    const fileCount = project.files.size;
    const deleted = this.projects.delete(projectId);
    if (deleted) {
      console.log('Project deleted:', { projectId, fileCount });
      console.log('Remaining projects:', Array.from(this.projects.keys()));
      this.emit('projectDeleted', { projectId });
    }
    return deleted;
  }

  getProject(projectId: string): Project | undefined {
    console.log('Getting project:', projectId);
    const project = this.projects.get(projectId);
    if (project) {
      console.log('Project found:', { id: project.id, name: project.name, fileCount: project.files.size });
    } else {
      console.log('Project not found:', projectId);
    }
    return project;
  }

  listProjects(): Array<{ id: string; name: string; fileCount: number }> {
    console.log('Listing all projects');
    const projects = Array.from(this.projects.entries()).map(([id, project]) => ({
      id,
      name: project.name,
      fileCount: project.files.size
    }));
    console.log('Projects:', projects);
    return projects;
  }

  getFile(projectId: string, filePath: string): VirtualFile | undefined {
    console.log('Getting file:', { projectId, filePath });
    const project = this.projects.get(projectId);
    if (!project) {
      console.log('Project not found for file retrieval:', projectId);
      return undefined;
    }

    const normalizedPath = this.normalizePath(filePath);
    const file = project.files.get(normalizedPath);
    
    if (file) {
      console.log('File found:', { 
        projectId, 
        filePath: normalizedPath, 
        type: file.type, 
        contentLength: file.content.length 
      });
    } else {
      console.log('File not found:', { projectId, filePath: normalizedPath });
    }

    return file;
  }

  setFile(projectId: string, filePath: string, content: string, type: string): void {
    console.log('Setting file:', { projectId, filePath, type, contentLength: content.length });
    const project = this.projects.get(projectId);
    if (!project) {
      console.error('Project not found for file creation:', projectId);
      throw new Error(`Project not found: ${projectId}`);
    }

    const normalizedPath = this.normalizePath(filePath);
    const existingFile = project.files.get(normalizedPath);
    
    project.files.set(normalizedPath, { content, type });
    project.updatedAt = new Date();

    if (existingFile) {
      console.log('File updated:', { 
        projectId, 
        filePath: normalizedPath, 
        type,
        oldContentLength: existingFile.content.length,
        newContentLength: content.length 
      });
    } else {
      console.log('New file created:', { 
        projectId, 
        filePath: normalizedPath, 
        type,
        contentLength: content.length 
      });
    }

    console.log('Project file count:', { 
      projectId, 
      fileCount: project.files.size,
      files: Array.from(project.files.keys())
    });

    this.emit('fileChanged', { projectId, path: normalizedPath, content, type });
  }

  deleteFile(projectId: string, filePath: string): void {
    console.log('Deleting file:', { projectId, filePath });
    const project = this.projects.get(projectId);
    if (!project) {
      console.error('Project not found for file deletion:', projectId);
      throw new Error(`Project not found: ${projectId}`);
    }

    const normalizedPath = this.normalizePath(filePath);
    const deleted = project.files.delete(normalizedPath);
    
    if (deleted) {
      project.updatedAt = new Date();
      console.log('File deleted:', { 
        projectId, 
        filePath: normalizedPath,
        remainingFiles: Array.from(project.files.keys())
      });
      this.emit('fileDeleted', { projectId, path: normalizedPath });
    } else {
      console.log('File not found for deletion:', { projectId, filePath: normalizedPath });
    }
  }

  listFiles(projectId: string): Array<{ path: string; type: string }> {
    console.log('Listing files for project:', projectId);
    const project = this.projects.get(projectId);
    if (!project) {
      console.error('Project not found for file listing:', projectId);
      throw new Error(`Project not found: ${projectId}`);
    }

    const files = Array.from(project.files.entries()).map(([path, file]) => ({
      path,
      type: file.type
    }));

    console.log('Project files:', { 
      projectId, 
      fileCount: files.length,
      files: files.map(f => ({ path: f.path, type: f.type }))
    });

    return files;
  }

  getContentType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = this.getContentTypeForExtension(ext);
    console.log('Getting content type:', { filePath, ext, contentType });
    return contentType;
  }

  private getContentTypeForExtension(ext: string): string {
    switch (ext) {
      case '.html':
        return 'text/html';
      case '.css':
        return 'text/css';
      case '.js':
        return 'application/javascript';
      case '.json':
        return 'application/json';
      case '.png':
        return 'image/png';
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.gif':
        return 'image/gif';
      case '.svg':
        return 'image/svg+xml';
      default:
        return 'text/plain';
    }
  }

  private generateProjectId(): string {
    return 'proj_' + Math.random().toString(36).substr(2, 9);
  }

  private normalizePath(filePath: string): string {
    const normalized = path.normalize(filePath).replace(/^[/\\]+/, '');
    console.log('Normalized path:', { original: filePath, normalized });
    return normalized;
  }
}
