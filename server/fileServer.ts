import express from 'express';
import { WebSocket, WebSocketServer } from 'ws';
import cors from 'cors';
import { VirtualFileSystem } from './virtualFs';

interface WebSocketMessage {
  type: string;
  data: any;
}

interface FileUpdate {
  projectId: string;
  path: string;
  content: string;
  type: string;
}

export class FileServer {
  private app: express.Express;
  private wss: WebSocketServer;
  private vfs: VirtualFileSystem;
  private clients: Set<WebSocket>;

  constructor() {
    console.log('Initializing FileServer');
    this.app = express();
    this.vfs = new VirtualFileSystem();
    this.clients = new Set();

    // Configure Express
    this.app.use(cors());
    this.app.use(express.json({ limit: '50mb' }));
    this.setupRoutes();

    // Create WebSocket server
    this.wss = new WebSocketServer({ port: 3003 }); // Use port 3003 for WebSocket
    this.setupWebSocket();
    console.log('FileServer initialized');
  }

  private setupRoutes(): void {
    console.log('Setting up routes');

    // Project routes
    this.app.post('/projects', (req, res) => {
      console.log('Creating project:', req.body);
      try {
        const { name } = req.body;
        const projectId = this.vfs.createProject(name);
        console.log('Project created successfully:', { projectId, name });
        res.json({ projectId });
      } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Failed to create project' });
      }
    });

    this.app.get('/projects', (req, res) => {
      console.log('Listing projects');
      try {
        const projects = this.vfs.listProjects();
        console.log('Projects retrieved:', projects);
        res.json(projects);
      } catch (error) {
        console.error('Error listing projects:', error);
        res.status(500).json({ error: 'Failed to list projects' });
      }
    });

    this.app.delete('/projects/:projectId', (req, res) => {
      const { projectId } = req.params;
      console.log('Deleting project:', projectId);
      try {
        const deleted = this.vfs.deleteProject(projectId);
        if (deleted) {
          console.log('Project deleted successfully:', projectId);
          res.sendStatus(200);
        } else {
          console.log('Project not found for deletion:', projectId);
          res.sendStatus(404);
        }
      } catch (error) {
        console.error('Error deleting project:', { projectId, error });
        res.status(500).json({ error: 'Failed to delete project' });
      }
    });

    // File routes
    this.app.get('/projects/:projectId/files', (req, res) => {
      const { projectId } = req.params;
      console.log('Listing files for project:', projectId);
      try {
        const files = this.vfs.listFiles(projectId);
        console.log('Files retrieved:', { projectId, fileCount: files.length });
        res.json(files);
      } catch (error) {
        console.error('Error listing files:', { projectId, error });
        res.status(500).json({ error: 'Failed to list files' });
      }
    });

    this.app.get('/projects/:projectId/files/:filePath(*)', (req, res) => {
      const { projectId, filePath } = req.params;
      console.log('Getting file:', { projectId, filePath });
      try {
        const file = this.vfs.getFile(projectId, filePath);
        if (file) {
          console.log('File found:', { projectId, filePath, type: file.type });
          // Always return a FileResponse object with type and content
          res.json({
            type: 'file',  // Always 'file' since we don't support directories yet
            content: file.content
          });
        } else {
          console.log('File not found:', { projectId, filePath });
          res.status(404).json({ error: 'File not found' });
        }
      } catch (error) {
        console.error('Error getting file:', { projectId, filePath, error });
        res.status(500).json({ error: 'Failed to get file' });
      }
    });

    this.app.post('/projects/:projectId/files/:filePath(*)', (req, res) => {
      const { projectId, filePath } = req.params;
      const { content, type } = req.body;
      console.log('Setting file:', { projectId, filePath, type, contentLength: content.length });
      try {
        this.vfs.setFile(projectId, filePath, content, type);
        console.log('File set successfully:', { projectId, filePath });
        res.sendStatus(200);
      } catch (error) {
        console.error('Error setting file:', { projectId, filePath, error });
        res.status(500).json({ error: 'Failed to set file' });
      }
    });

    this.app.delete('/projects/:projectId/files/:filePath(*)', (req, res) => {
      const { projectId, filePath } = req.params;
      console.log('Deleting file:', { projectId, filePath });
      try {
        this.vfs.deleteFile(projectId, filePath);
        console.log('File deleted successfully:', { projectId, filePath });
        res.sendStatus(200);
      } catch (error) {
        console.error('Error deleting file:', { projectId, filePath, error });
        res.status(500).json({ error: 'Failed to delete file' });
      }
    });
  }

  private setupWebSocket(): void {
    console.log('Setting up WebSocket server on port 3003');

    this.wss.on('connection', (ws: WebSocket) => {
      console.log('New WebSocket connection established');
      this.clients.add(ws);

      // Send initial project list
      const projects = this.vfs.listProjects();
      ws.send(JSON.stringify({
        type: 'projectList',
        data: { projects }
      }));

      ws.on('message', (data: string) => {
        try {
          const message: WebSocketMessage = JSON.parse(data);
          console.log('Received WebSocket message:', message);

          switch (message.type) {
            case 'setProject':
              const projectId = message.data.projectId;
              if (projectId) {
                const project = this.vfs.getProject(projectId);
                if (project) {
                  const files = this.vfs.listFiles(projectId);
                  ws.send(JSON.stringify({
                    type: 'projectFiles',
                    data: { projectId, files }
                  }));
                }
              }
              break;
          }
        } catch (error) {
          console.error('Error handling WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        console.log('WebSocket connection closed');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
      });
    });

    // Listen for file system events
    this.vfs.on('fileChanged', (update: FileUpdate) => {
      const message = JSON.stringify({
        type: 'fileChanged',
        data: update
      });
      this.broadcast(message);
    });

    this.vfs.on('projectDeleted', ({ projectId }) => {
      const message = JSON.stringify({
        type: 'projectDeleted',
        data: { projectId }
      });
      this.broadcast(message);
    });
  }

  private broadcast(message: string): void {
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  listen(port: number): void {
    console.log(`Starting server on port ${port}`);
    this.app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  }
}
