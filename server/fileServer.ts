import express from 'express';
import { Server as WebSocketServer } from 'ws';
import { VirtualFileSystem } from './virtualFs';
import cors from 'cors';
import path from 'path';

export class FileServer {
  private app: express.Application;
  private vfs: VirtualFileSystem;
  private wss: WebSocketServer;
  private connectedClients: Set<WebSocket>;

  constructor() {
    this.app = express();
    this.vfs = new VirtualFileSystem();
    this.connectedClients = new Set();
    
    // Setup middleware
    this.app.use(cors());
    this.app.use(express.json());

    // Setup routes
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Get file content
    this.app.get('/files/*', (req, res) => {
      const filePath = req.params[0];
      const file = this.vfs.getFile(filePath);

      if (!file) {
        console.error('File not found:', filePath);
        res.status(404).send('File not found');
        return;
      }

      const contentType = this.vfs.getContentType(filePath);
      console.log('Serving file:', filePath, 'Content-Type:', contentType);
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.send(file.content);
    });

    // Update file
    this.app.post('/files/*', (req, res) => {
      const filePath = req.params[0];
      const { content, type } = req.body;

      this.vfs.setFile(filePath, content, type);

      // Notify all clients about the file change
      const message = JSON.stringify({
        type: 'fileChanged',
        data: { path: filePath, content, type }
      });
      
      this.connectedClients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });

      res.status(200).send('File updated');
    });

    // Delete file
    this.app.delete('/files/*', (req, res) => {
      const filePath = req.params[0];
      this.vfs.deleteFile(filePath);

      // Notify all clients about the file deletion
      const message = JSON.stringify({
        type: 'fileDeleted',
        data: { path: filePath }
      });
      
      this.connectedClients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });

      res.status(200).send('File deleted');
    });

    // List files
    this.app.get('/files', (_, res) => {
      res.json(this.vfs.listFiles());
    });
  }

  setupWebSocket(server: any): void {
    this.wss = new WebSocketServer({ server });

    this.wss.on('connection', (ws) => {
      console.log('Client connected');
      this.connectedClients.add(ws);

      // Send initial file list
      ws.send(JSON.stringify({
        type: 'fileList',
        data: this.vfs.listFiles()
      }));

      // Handle file changes
      this.vfs.on('fileChanged', ({ path, content, type }) => {
        ws.send(JSON.stringify({
          type: 'fileChanged',
          data: { path, content, type }
        }));
      });

      this.vfs.on('fileDeleted', ({ path }) => {
        ws.send(JSON.stringify({
          type: 'fileDeleted',
          data: { path }
        }));
      });

      ws.on('close', () => {
        console.log('Client disconnected');
        this.connectedClients.delete(ws);
      });
    });
  }

  start(port: number): void {
    const server = this.app.listen(port, () => {
      console.log(`File server running on port ${port}`);
    });

    this.setupWebSocket(server);
  }

  getVirtualFileSystem(): VirtualFileSystem {
    return this.vfs;
  }
}
