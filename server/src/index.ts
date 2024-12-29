import express from 'express';
import cors from 'cors';
import { join, dirname } from 'path';
import { promises as fs } from 'fs';
import { Router } from 'express';
import { previewRouter } from './preview/previewRouter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const router = Router();
const PORT = process.env.PREVIEW_PORT || 3001;

// Directory paths
const FILES_DIR = join(__dirname, '..', 'files');
const TEMPLATES_DIR = join(__dirname, '..', 'templates');

// Create necessary directories
(async () => {
  try {
    await fs.mkdir(FILES_DIR, { recursive: true });
    console.log('Files directory ensured at:', FILES_DIR);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error creating files directory:', error.message);
    }
  }
})();

// Helper function to copy directory recursively
async function copyDir(src: string, dest: string) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

// Helper function to list files recursively
async function listFilesRecursively(dir: string, baseDir: string = ''): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async entry => {
      const relativePath = baseDir ? `${baseDir}/${entry.name}` : entry.name;
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        const subFiles = await listFilesRecursively(fullPath, relativePath);
        return subFiles;
      }
      return [relativePath];
    })
  );
  return files.flat();
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, '..', 'public')));

// Root route
app.get('/', (_req, res) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Preview Server</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            line-height: 1.6;
          }
          pre {
            background: #f1f1f1;
            padding: 1rem;
            border-radius: 4px;
            overflow-x: auto;
          }
          .container {
            margin-top: 2rem;
          }
          h1 {
            border-bottom: 2px solid #eee;
            padding-bottom: 0.5rem;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Preview Server</h1>
          <p>Welcome to the preview server! This server is running on port ${PORT}.</p>
          
          <h2>Available Routes:</h2>
          <ul>
            <li><strong>/preview</strong> - Preview a component (requires a file parameter)</li>
            <li><strong>/api/files</strong> - List all available files</li>
          </ul>

          <h2>How to Use:</h2>
          <p>To preview a component, visit:</p>
          <pre>/preview?file=YourComponent.tsx</pre>
          
          <p>Example:</p>
          <pre><a href="/preview?file=example.tsx">/preview?file=example.tsx</a></pre>

          <h2>API Endpoints:</h2>
          <ul>
            <li><code>GET /api/files</code> - List all files</li>
            <li><code>GET /api/files/:filename</code> - Get file content</li>
            <li><code>PUT /api/files/:filename</code> - Create/Update file</li>
            <li><code>DELETE /api/files/:filename</code> - Delete file</li>
            <li><code>POST /api/init</code> - Initialize new project from template</li>
          </ul>
        </div>
      </body>
    </html>
  `;
  res.send(html);
});

// API Routes
app.use('/api', router);

// Preview Routes
app.use('/preview', previewRouter);

// Initialize new project from template
router.post('/init', async (_req, res) => {
  try {
    // Clear existing files
    const files = await fs.readdir(FILES_DIR);
    for (const file of files) {
      const filePath = join(FILES_DIR, file);
      await fs.rm(filePath, { recursive: true, force: true });
    }

    // Copy template files
    const templatePath = join(TEMPLATES_DIR, 'basic');
    await copyDir(templatePath, FILES_DIR);

    console.log('Project initialized from template');
    res.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error initializing project:', error.message);
      res.status(500).json({ error: 'Failed to initialize project', details: error.message });
    } else {
      res.status(500).json({ error: 'Failed to initialize project', details: 'Unknown error' });
    }
  }
});

// List all files
router.get('/files', async (_req, res) => {
  try {
    const files = await listFilesRecursively(FILES_DIR);
    console.log('Files listed successfully:', files);
    res.json(files);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error listing files:', error.message);
      res.status(500).json({ error: 'Failed to list files', details: error.message });
    } else {
      res.status(500).json({ error: 'Failed to list files', details: 'Unknown error' });
    }
  }
});

// Read file content
router.get('/files/:filename', async (req, res) => {
  try {
    const filePath = join(FILES_DIR, req.params.filename);
    const stats = await fs.stat(filePath);
    
    if (stats.isDirectory()) {
      const files = await fs.readdir(filePath);
      console.log('Directory read successfully:', req.params.filename);
      res.json({ type: 'directory', files });
    } else {
      const content = await fs.readFile(filePath, 'utf-8');
      console.log('File read successfully:', req.params.filename);
      res.json({ type: 'file', content });
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error reading file/directory:', error.message);
      res.status(500).json({ error: 'Failed to read file/directory', details: error.message });
    } else {
      res.status(500).json({ error: 'Failed to read file/directory', details: 'Unknown error' });
    }
  }
});

// Create/Update file
router.put('/files/:filename', async (req, res) => {
  try {
    const filePath = join(FILES_DIR, req.params.filename);
    await fs.mkdir(dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, req.body.content);
    console.log('File written successfully:', req.params.filename);
    res.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error writing file:', error.message);
      res.status(500).json({ error: 'Failed to write file', details: error.message });
    } else {
      res.status(500).json({ error: 'Failed to write file', details: 'Unknown error' });
    }
  }
});

// Delete file
router.delete('/files/:filename', async (req, res) => {
  try {
    await fs.unlink(join(FILES_DIR, req.params.filename));
    console.log('File deleted successfully:', req.params.filename);
    res.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error deleting file:', error.message);
      res.status(500).json({ error: 'Failed to delete file', details: error.message });
    } else {
      res.status(500).json({ error: 'Failed to delete file', details: 'Unknown error' });
    }
  }
});

// Start server with error handling
const server = app.listen(PORT, () => {
  console.log(`Preview server running on port ${PORT}`);
  console.log(`Files directory: ${FILES_DIR}`);
}).on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please try these solutions:`);
    console.error('1. Stop any other servers running on this port');
    console.error('2. Set a different port using PREVIEW_PORT environment variable');
    console.error('3. Kill any zombie processes using this port');
    process.exit(1);
  } else {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
});