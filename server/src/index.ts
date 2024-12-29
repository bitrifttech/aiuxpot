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

// Create files directory if it doesn't exist
(async () => {
  try {
    await fs.mkdir(FILES_DIR, { recursive: true });
    console.log('Files directory ensured at:', FILES_DIR);
  } catch (error) {
    console.error('Error creating files directory:', error);
  }
})();

app.use(cors());
app.use(express.json());

// List all files
router.get('/files', async (req, res) => {
  try {
    const files = await fs.readdir(FILES_DIR);
    console.log('Files listed successfully:', files);
    res.json(files);
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ error: 'Failed to list files', details: error.message });
  }
});

// Read file content
router.get('/files/:filename', async (req, res) => {
  try {
    const content = await fs.readFile(join(FILES_DIR, req.params.filename), 'utf-8');
    console.log('File read successfully:', req.params.filename);
    res.json({ content });
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).json({ error: 'Failed to read file', details: error.message });
  }
});

// Create/Update file
router.put('/files/:filename', async (req, res) => {
  try {
    await fs.writeFile(join(FILES_DIR, req.params.filename), req.body.content);
    console.log('File written successfully:', req.params.filename);
    res.json({ success: true });
  } catch (error) {
    console.error('Error writing file:', error);
    res.status(500).json({ error: 'Failed to write file', details: error.message });
  }
});

// Delete file
router.delete('/files/:filename', async (req, res) => {
  try {
    await fs.unlink(join(FILES_DIR, req.params.filename));
    console.log('File deleted successfully:', req.params.filename);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file', details: error.message });
  }
});

app.use('/api', router);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Files directory: ${FILES_DIR}`);
});