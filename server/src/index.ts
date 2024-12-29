import express from 'express';
import cors from 'cors';
import { join } from 'path';
import { promises as fs } from 'fs';
import { Router } from 'express';

const app = express();
const router = Router();
const PORT = process.env.PORT || 3000;

// Ensure the files directory exists
const FILES_DIR = join(__dirname, '..', 'files');
fs.mkdir(FILES_DIR, { recursive: true }).catch(console.error);

app.use(cors());
app.use(express.json());

// List all files
router.get('/files', async (req, res) => {
  try {
    const files = await fs.readdir(FILES_DIR);
    console.log('Files listed:', files);
    res.json(files);
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

// Read file content
router.get('/files/:filename', async (req, res) => {
  try {
    const content = await fs.readFile(join(FILES_DIR, req.params.filename), 'utf-8');
    console.log('File read:', req.params.filename);
    res.json({ content });
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).json({ error: 'Failed to read file' });
  }
});

// Create/Update file
router.put('/files/:filename', async (req, res) => {
  try {
    await fs.writeFile(join(FILES_DIR, req.params.filename), req.body.content);
    console.log('File written:', req.params.filename);
    res.json({ success: true });
  } catch (error) {
    console.error('Error writing file:', error);
    res.status(500).json({ error: 'Failed to write file' });
  }
});

// Delete file
router.delete('/files/:filename', async (req, res) => {
  try {
    await fs.unlink(join(FILES_DIR, req.params.filename));
    console.log('File deleted:', req.params.filename);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

app.use('/api', router);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});