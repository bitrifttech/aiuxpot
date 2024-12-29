import { Router } from 'express';
import { join, dirname } from 'path';
import { promises as fs } from 'fs';
import { transform } from '@swc/core';
import { createHash } from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const previewRouter = Router();
const PREVIEW_DIR = join(__dirname, '..', '..', 'preview');

// In-memory cache for compiled files
const compiledFilesCache = new Map<string, { code: string, hash: string }>();

// Middleware to ensure preview directory exists
(async () => {
  try {
    await fs.mkdir(PREVIEW_DIR, { recursive: true });
    console.log('Preview directory ensured at:', PREVIEW_DIR);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error creating preview directory:', error.message);
    }
  }
})();

// Serve the preview HTML template
previewRouter.get('/', (_req, res) => {
  const template = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Preview</title>
        <script type="module" src="/preview/runtime.js"></script>
      </head>
      <body>
        <div id="root"></div>
      </body>
    </html>
  `;
  res.send(template);
});

// Serve the preview runtime
previewRouter.get('/runtime.js', (_req, res) => {
  const runtime = `
    import React from 'react';
    import ReactDOM from 'react-dom/client';
    import { Preview } from './Preview';

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(React.createElement(Preview));

    // Enable hot reload
    if (import.meta.hot) {
      import.meta.hot.accept();
    }
  `;
  res.type('application/javascript').send(runtime);
});

// Compile and serve a file
previewRouter.get('/file/:filename', async (req, res) => {
  try {
    const filePath = join(PREVIEW_DIR, req.params.filename);
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Calculate content hash
    const contentHash = createHash('md5').update(content).digest('hex');
    
    // Check cache
    const cached = compiledFilesCache.get(filePath);
    if (cached && cached.hash === contentHash) {
      return res.type('application/javascript').send(cached.code);
    }

    // Compile the file
    const { code } = await transform(content, {
      jsc: {
        parser: {
          syntax: "typescript",
          tsx: true,
        },
        target: "es2022",
      },
      module: {
        type: "es6",
      },
    });

    // Update cache
    compiledFilesCache.set(filePath, { code, hash: contentHash });

    res.type('application/javascript').send(code);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error serving preview file:', error.message);
      res.status(500).json({ error: 'Failed to serve preview file', details: error.message });
    } else {
      res.status(500).json({ error: 'Failed to serve preview file', details: 'Unknown error' });
    }
  }
});

// Handle preview file updates
previewRouter.put('/file/:filename', async (req, res) => {
  try {
    const filePath = join(PREVIEW_DIR, req.params.filename);
    await fs.writeFile(filePath, req.body.content);
    
    // Invalidate cache
    compiledFilesCache.delete(filePath);
    
    console.log('Preview file updated:', req.params.filename);
    res.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error updating preview file:', error.message);
      res.status(500).json({ error: 'Failed to update preview file', details: error.message });
    } else {
      res.status(500).json({ error: 'Failed to update preview file', details: 'Unknown error' });
    }
  }
});

export { previewRouter }; 